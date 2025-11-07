/**
 * Shipyard Manager for Lunaris
 * Handles ship production, cancellation, and completion
 */

import prisma from '@/lib/db';
import { syncPlanetResources } from './resource-sync';
import {
  calculateShipCost,
  calculateShipBuildTime,
  calculateShipProductionEndTime,
  canStartShipBuild,
  isProductionComplete,
  type BuildingInfo,
  type ResearchInfo,
} from './ship-calculator';

export interface ShipProductionResult {
  success: boolean;
  message: string;
  production?: {
    shipType: string;
    quantity: number;
    endTime: Date;
  };
}

interface ShipQueue {
  shipType: string;
  quantity: number;
  startTime: string;
  endTime: string;
}

// ============================================================================
// START PRODUCTION
// ============================================================================

/**
 * Start producing ships
 * - Checks if production can be started
 * - Deducts resources
 * - Sets production end time
 * - Adds to ship queue
 */
export async function startShipProduction(
  planetId: string,
  shipType: string,
  quantity: number
): Promise<ShipProductionResult> {
  try {
    // Fetch planet with buildings and resources
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
      include: {
        buildings: true,
        resources: true,
        user: {
          include: {
            research: true,
          },
        },
      },
    });

    if (!planet || !planet.resources || !planet.user.research) {
      return {
        success: false,
        message: 'Planet or resources not found',
      };
    }

    // Sync resources first to get current amounts
    await syncPlanetResources(planetId);

    // Fetch updated resources
    const updatedResources = await prisma.resources.findUnique({
      where: { planetId },
    });

    if (!updatedResources) {
      return {
        success: false,
        message: 'Resources not found',
      };
    }

    // Check if there's already a ship queue
    if (planet.shipQueue) {
      return {
        success: false,
        message: 'Ship production already in progress',
      };
    }

    // Get shipyard and nanite levels
    const shipyardBuilding = planet.buildings.find((b) => b.type === 'shipyard');
    const naniteBuilding = planet.buildings.find((b) => b.type === 'naniteFactory');
    const shipyardLevel = shipyardBuilding?.level || 0;
    const naniteLevel = naniteBuilding?.level || 0;

    if (shipyardLevel === 0) {
      return {
        success: false,
        message: 'Shipyard required',
      };
    }

    // Convert buildings to BuildingInfo format
    const buildingInfos: BuildingInfo[] = planet.buildings.map((b) => ({
      type: b.type,
      level: b.level,
    }));

    // Convert research to ResearchInfo format
    const researchInfos: ResearchInfo[] = Object.entries(planet.user.research)
      .filter(([key]) =>
        key !== 'id' &&
        key !== 'userId' &&
        key !== 'createdAt' &&
        key !== 'updatedAt' &&
        key !== 'researching' &&
        key !== 'currentResearch' &&
        key !== 'researchEndTime'
      )
      .map(([key, value]) => ({
        type: key,
        level: value as number,
      }));

    // Check if production can be started
    const canStart = canStartShipBuild(
      shipType,
      quantity,
      buildingInfos,
      researchInfos,
      {
        metal: updatedResources.metal,
        crystal: updatedResources.crystal,
        deuterium: updatedResources.deuterium,
      },
      shipyardLevel,
      naniteLevel,
      shipyardBuilding?.upgrading || false
    );

    if (!canStart.canStart) {
      return {
        success: false,
        message: canStart.reason || 'Cannot start production',
      };
    }

    // Calculate cost and time
    const cost = calculateShipCost(shipType, quantity);
    const timeInSeconds = calculateShipBuildTime(
      shipType,
      quantity,
      shipyardLevel,
      naniteLevel
    );
    const endTime = calculateShipProductionEndTime(timeInSeconds);

    // Start production in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct resources
      await tx.resources.update({
        where: { planetId },
        data: {
          metal: { decrement: cost.metal },
          crystal: { decrement: cost.crystal },
          deuterium: { decrement: cost.deuterium },
        },
      });

      // Set ship queue
      const queue: ShipQueue = {
        shipType,
        quantity,
        startTime: new Date().toISOString(),
        endTime: endTime.toISOString(),
      };

      await tx.planet.update({
        where: { id: planetId },
        data: {
          shipQueue: queue as any,
        },
      });

      return { endTime };
    });

    return {
      success: true,
      message: `Ship production started. Completion in ${Math.floor(timeInSeconds / 60)} minutes.`,
      production: {
        shipType,
        quantity,
        endTime: result.endTime,
      },
    };
  } catch (error) {
    console.error('Error starting ship production:', error);
    return {
      success: false,
      message: 'An error occurred while starting production',
    };
  }
}

// ============================================================================
// CANCEL PRODUCTION
// ============================================================================

/**
 * Cancel ship production
 * - Refunds 100% of resources
 * - Clears ship queue
 */
export async function cancelShipProduction(
  planetId: string
): Promise<ShipProductionResult> {
  try {
    // Fetch planet with queue
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
    });

    if (!planet) {
      return {
        success: false,
        message: 'Planet not found',
      };
    }

    // Check if there's a ship queue
    if (!planet.shipQueue) {
      return {
        success: false,
        message: 'No ship production in progress',
      };
    }

    const queue = planet.shipQueue as unknown as ShipQueue;

    // Calculate refund amount
    const cost = calculateShipCost(queue.shipType, queue.quantity);

    // Cancel production in a transaction
    await prisma.$transaction(async (tx) => {
      // Refund resources
      await tx.resources.update({
        where: { planetId },
        data: {
          metal: { increment: cost.metal },
          crystal: { increment: cost.crystal },
          deuterium: { increment: cost.deuterium },
        },
      });

      // Clear ship queue
      await tx.planet.update({
        where: { id: planetId },
        data: {
          shipQueue: null as any,
        },
      });
    });

    return {
      success: true,
      message: 'Ship production cancelled. Resources refunded.',
    };
  } catch (error) {
    console.error('Error cancelling ship production:', error);
    return {
      success: false,
      message: 'An error occurred while cancelling production',
    };
  }
}

// ============================================================================
// COMPLETE PRODUCTION
// ============================================================================

/**
 * Complete ship production
 * - Checks if production is actually complete
 * - Adds ships to planet
 * - Clears ship queue
 */
export async function completeShipProduction(
  planetId: string
): Promise<ShipProductionResult> {
  try {
    // Fetch planet with queue
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
    });

    if (!planet) {
      return {
        success: false,
        message: 'Planet not found',
      };
    }

    // Check if there's a ship queue
    if (!planet.shipQueue) {
      return {
        success: false,
        message: 'No ship production in progress',
      };
    }

    const queue = planet.shipQueue as unknown as ShipQueue;
    const endTime = new Date(queue.endTime);

    // Check if production is actually complete
    if (!isProductionComplete(endTime)) {
      return {
        success: false,
        message: 'Production is not yet complete',
      };
    }

    // Complete production
    const currentShips = (planet.ships as Record<string, number>) || {};
    const newShips = {
      ...currentShips,
      [queue.shipType]: (currentShips[queue.shipType] || 0) + queue.quantity,
    };

    await prisma.planet.update({
      where: { id: planetId },
      data: {
        ships: newShips as any,
        shipQueue: null as any,
      },
    });

    return {
      success: true,
      message: `${queue.quantity} ${queue.shipType} completed`,
      production: {
        shipType: queue.shipType,
        quantity: queue.quantity,
        endTime,
      },
    };
  } catch (error) {
    console.error('Error completing ship production:', error);
    return {
      success: false,
      message: 'An error occurred while completing production',
    };
  }
}

// ============================================================================
// CHECK AND COMPLETE ALL PRODUCTION
// ============================================================================

/**
 * Check all planets for completed ship production
 * Returns list of completed production
 */
export async function checkAndCompleteAllProduction(): Promise<
  Array<{ planetId: string; shipType: string; quantity: number }>
> {
  try {
    // Find all planets with ship queue
    const planets = await prisma.planet.findMany({
      where: {
        shipQueue: {
          not: null as any,
        },
      },
      select: {
        id: true,
        shipQueue: true,
        userId: true,
      },
    });

    const completed: Array<{ planetId: string; shipType: string; quantity: number }> = [];

    // Check each planet
    for (const planet of planets) {
      if (!planet.shipQueue) continue;

      const queue = planet.shipQueue as unknown as ShipQueue;
      const endTime = new Date(queue.endTime);

      // Check if production is complete
      if (isProductionComplete(endTime)) {
        const result = await completeShipProduction(planet.id);
        if (result.success && result.production) {
          completed.push({
            planetId: planet.id,
            shipType: result.production.shipType,
            quantity: result.production.quantity,
          });
        }
      }
    }

    return completed;
  } catch (error) {
    console.error('Error checking and completing production:', error);
    return [];
  }
}
