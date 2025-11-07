/**
 * Fleet Manager for Lunaris
 * Handles fleet dispatch, recall, and mission processing
 */

import prisma from '@/lib/db';
import {
  calculateMission,
  validateFleetMission,
  type FleetComposition,
  type Coordinates,
} from './fleet-calculator';

export interface FleetDispatchResult {
  success: boolean;
  message: string;
  fleet?: {
    id: string;
    mission: string;
    arrivalTime: Date;
    returnTime: Date;
  };
}

// ============================================================================
// DISPATCH FLEET
// ============================================================================

/**
 * Dispatch a fleet on a mission
 * - Validates fleet composition and resources
 * - Removes ships from origin planet
 * - Deducts cargo resources and fuel
 * - Creates fleet record in database
 */
export async function dispatchFleet(
  userId: string,
  originPlanetId: string,
  targetCoordinates: Coordinates,
  mission: string,
  fleet: FleetComposition,
  cargo: { metal: number; crystal: number; deuterium: number },
  fleetSpeedPercentage: number = 100
): Promise<FleetDispatchResult> {
  try {
    // Fetch origin planet with ships and resources
    const originPlanet = await prisma.planet.findUnique({
      where: { id: originPlanetId, userId },
      include: {
        resources: true,
        user: {
          include: {
            research: true,
          },
        },
      },
    });

    if (!originPlanet || !originPlanet.resources) {
      return {
        success: false,
        message: 'Origin planet not found',
      };
    }

    // Find target planet
    const targetCoordString = `${targetCoordinates.galaxy}:${targetCoordinates.system}:${targetCoordinates.position}`;
    const targetPlanet = await prisma.planet.findUnique({
      where: { coordinates: targetCoordString },
    });

    if (!targetPlanet) {
      return {
        success: false,
        message: 'Target planet not found',
      };
    }

    // Get drive levels from research
    const research = originPlanet.user.research;
    const combustionDriveLevel = research?.combustionDrive || 0;
    const impulseDriveLevel = research?.impulseDrive || 0;
    const hyperspaceDriveLevel = research?.hyperspaceDrive || 0;

    // Calculate mission details
    const fromCoords: Coordinates = {
      galaxy: originPlanet.galaxy,
      system: originPlanet.system,
      position: originPlanet.position,
    };

    const missionCalc = calculateMission(
      fleet,
      fromCoords,
      targetCoordinates,
      cargo,
      fleetSpeedPercentage,
      combustionDriveLevel,
      impulseDriveLevel,
      hyperspaceDriveLevel
    );

    // Get available ships
    const availableShips = (originPlanet.ships as Record<string, number>) || {};

    // Validate fleet can be sent
    const validation = validateFleetMission(
      fleet,
      availableShips,
      cargo,
      {
        metal: originPlanet.resources.metal,
        crystal: originPlanet.resources.crystal,
        deuterium: originPlanet.resources.deuterium,
      },
      missionCalc
    );

    if (!validation.valid) {
      return {
        success: false,
        message: validation.errors.join(', '),
      };
    }

    // Dispatch fleet in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Remove ships from origin planet
      const updatedShips = { ...availableShips };
      for (const [shipType, count] of Object.entries(fleet)) {
        if (count > 0) {
          updatedShips[shipType] = (updatedShips[shipType] || 0) - count;
          if (updatedShips[shipType] <= 0) {
            delete updatedShips[shipType];
          }
        }
      }

      await tx.planet.update({
        where: { id: originPlanetId },
        data: {
          ships: updatedShips as any,
        },
      });

      // Deduct resources (cargo + fuel)
      await tx.resources.update({
        where: { planetId: originPlanetId },
        data: {
          metal: { decrement: cargo.metal },
          crystal: { decrement: cargo.crystal },
          deuterium: { decrement: cargo.deuterium + missionCalc.fuelCost },
        },
      });

      // Create fleet record
      const newFleet = await tx.fleet.create({
        data: {
          userId,
          originId: originPlanetId,
          targetId: targetPlanet.id,
          mission,
          ships: fleet as any,
          cargo: cargo as any,
          departureTime: new Date(),
          arrivalTime: missionCalc.arrivalTime,
          returnTime: missionCalc.returnTime,
          fuelConsumption: missionCalc.fuelCost,
          status: 'traveling',
          processed: false,
        },
      });

      return newFleet;
    });

    return {
      success: true,
      message: `Fleet dispatched. Arrival in ${Math.floor(missionCalc.duration / 60)} minutes.`,
      fleet: {
        id: result.id,
        mission: result.mission,
        arrivalTime: result.arrivalTime,
        returnTime: result.returnTime || new Date(),
      },
    };
  } catch (error) {
    console.error('Error dispatching fleet:', error);
    return {
      success: false,
      message: 'An error occurred while dispatching fleet',
    };
  }
}

// ============================================================================
// RECALL FLEET
// ============================================================================

/**
 * Recall a fleet that is traveling
 * - Only works if fleet hasn't arrived yet
 * - Returns ships and cargo immediately
 */
export async function recallFleet(
  userId: string,
  fleetId: string
): Promise<FleetDispatchResult> {
  try {
    // Fetch fleet
    const fleet = await prisma.fleet.findUnique({
      where: { id: fleetId, userId },
    });

    if (!fleet) {
      return {
        success: false,
        message: 'Fleet not found',
      };
    }

    // Check if fleet can be recalled
    if (fleet.status !== 'traveling') {
      return {
        success: false,
        message: 'Fleet cannot be recalled (already arrived)',
      };
    }

    // Check if fleet has already arrived
    if (new Date() >= fleet.arrivalTime) {
      return {
        success: false,
        message: 'Fleet has already arrived',
      };
    }

    // Recall fleet in a transaction
    await prisma.$transaction(async (tx) => {
      // Return ships to origin planet
      const originPlanet = await tx.planet.findUnique({
        where: { id: fleet.originId },
      });

      if (originPlanet) {
        const currentShips = (originPlanet.ships as Record<string, number>) || {};
        const fleetShips = fleet.ships as Record<string, number>;
        const updatedShips = { ...currentShips };

        for (const [shipType, count] of Object.entries(fleetShips)) {
          updatedShips[shipType] = (updatedShips[shipType] || 0) + count;
        }

        await tx.planet.update({
          where: { id: fleet.originId },
          data: {
            ships: updatedShips as any,
          },
        });

        // Return cargo resources
        const fleetCargo = (fleet.cargo as { metal: number; crystal: number; deuterium: number }) ||
          { metal: 0, crystal: 0, deuterium: 0 };

        await tx.resources.update({
          where: { planetId: fleet.originId },
          data: {
            metal: { increment: fleetCargo.metal },
            crystal: { increment: fleetCargo.crystal },
            deuterium: { increment: fleetCargo.deuterium + fleet.fuelConsumption },
          },
        });
      }

      // Delete fleet record
      await tx.fleet.delete({
        where: { id: fleetId },
      });
    });

    return {
      success: true,
      message: 'Fleet recalled successfully',
    };
  } catch (error) {
    console.error('Error recalling fleet:', error);
    return {
      success: false,
      message: 'An error occurred while recalling fleet',
    };
  }
}

// ============================================================================
// PROCESS FLEET ARRIVALS
// ============================================================================

/**
 * Process all arriving fleets
 * Returns list of processed fleets
 */
export async function processArrivingFleets(): Promise<
  Array<{ fleetId: string; userId: string; mission: string }>
> {
  try {
    // Find fleets that have arrived but not been processed
    const arrivedFleets = await prisma.fleet.findMany({
      where: {
        status: 'traveling',
        arrivalTime: {
          lte: new Date(),
        },
        processed: false,
      },
    });

    const processed: Array<{ fleetId: string; userId: string; mission: string }> = [];

    for (const fleet of arrivedFleets) {
      // For now, just mark as arrived
      // TODO: Implement mission-specific logic (combat, transport, etc.)
      await prisma.fleet.update({
        where: { id: fleet.id },
        data: {
          status: 'arrived',
          processed: true,
        },
      });

      processed.push({
        fleetId: fleet.id,
        userId: fleet.userId,
        mission: fleet.mission,
      });
    }

    return processed;
  } catch (error) {
    console.error('Error processing arrivals:', error);
    return [];
  }
}

// ============================================================================
// PROCESS FLEET RETURNS
// ============================================================================

/**
 * Process all returning fleets
 * Returns list of returned fleets
 */
export async function processReturningFleets(): Promise<
  Array<{ fleetId: string; userId: string }>
> {
  try {
    // Find fleets that should return
    const returningFleets = await prisma.fleet.findMany({
      where: {
        status: 'arrived',
        returnTime: {
          lte: new Date(),
        },
      },
    });

    const returned: Array<{ fleetId: string; userId: string }> = [];

    for (const fleet of returningFleets) {
      // Return ships and cargo to origin
      await prisma.$transaction(async (tx) => {
        const originPlanet = await tx.planet.findUnique({
          where: { id: fleet.originId },
        });

        if (originPlanet) {
          // Return ships
          const currentShips = (originPlanet.ships as Record<string, number>) || {};
          const fleetShips = fleet.ships as Record<string, number>;
          const updatedShips = { ...currentShips };

          for (const [shipType, count] of Object.entries(fleetShips)) {
            updatedShips[shipType] = (updatedShips[shipType] || 0) + count;
          }

          await tx.planet.update({
            where: { id: fleet.originId },
            data: {
              ships: updatedShips as any,
            },
          });

          // Return cargo (if mission brought back resources)
          const fleetCargo = (fleet.cargo as { metal: number; crystal: number; deuterium: number }) ||
            { metal: 0, crystal: 0, deuterium: 0 };

          await tx.resources.update({
            where: { planetId: fleet.originId },
            data: {
              metal: { increment: fleetCargo.metal },
              crystal: { increment: fleetCargo.crystal },
              deuterium: { increment: fleetCargo.deuterium },
            },
          });
        }

        // Delete fleet record
        await tx.fleet.delete({
          where: { id: fleet.id },
        });
      });

      returned.push({
        fleetId: fleet.id,
        userId: fleet.userId,
      });
    }

    return returned;
  } catch (error) {
    console.error('Error processing returns:', error);
    return [];
  }
}
