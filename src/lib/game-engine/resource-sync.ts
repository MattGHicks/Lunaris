/**
 * Resource Sync Utility
 * Handles synchronizing calculated resources with the database
 */

import prisma from '@/lib/db';
import {
  calculateCurrentResources,
  type CalculatedResources,
  type PlanetData,
} from './resource-calculator';

/**
 * Sync resources for a specific planet
 * Calculates accumulated resources and updates the database
 *
 * @param planetId - The ID of the planet to sync
 * @param energyTechLevel - Optional energy technology level (defaults to 0, will be fetched from research later)
 * @returns The calculated resources after sync
 */
export async function syncPlanetResources(
  planetId: string,
  energyTechLevel: number = 0
): Promise<CalculatedResources | null> {
  try {
    // Fetch planet data with buildings and resources
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
      include: {
        buildings: {
          select: {
            type: true,
            level: true,
          },
        },
        resources: {
          select: {
            metal: true,
            crystal: true,
            deuterium: true,
            energy: true,
            lastUpdate: true,
          },
        },
      },
    });

    if (!planet || !planet.resources) {
      console.error(`Planet ${planetId} not found or has no resources`);
      return null;
    }

    // Prepare planet data for calculator
    const planetData: PlanetData = {
      temperature: planet.temperature,
      buildings: planet.buildings.map((b) => ({
        type: b.type,
        level: b.level,
      })),
      resources: {
        metal: planet.resources.metal,
        crystal: planet.resources.crystal,
        deuterium: planet.resources.deuterium,
        energy: planet.resources.energy,
        lastUpdate: planet.resources.lastUpdate,
      },
    };

    // Calculate current resources
    const currentTime = new Date();
    const calculatedResources = calculateCurrentResources(planetData, energyTechLevel, currentTime);

    // Update resources in database
    await prisma.resources.update({
      where: { planetId: planetId },
      data: {
        metal: calculatedResources.metal,
        crystal: calculatedResources.crystal,
        deuterium: calculatedResources.deuterium,
        energy: calculatedResources.energy,
        lastUpdate: currentTime,
      },
    });

    return calculatedResources;
  } catch (error) {
    console.error('Error syncing planet resources:', error);
    throw error;
  }
}

/**
 * Sync resources for all planets belonging to a user
 *
 * @param userId - The ID of the user
 * @param energyTechLevel - Optional energy technology level
 * @returns Array of calculated resources for each planet
 */
export async function syncUserPlanetsResources(
  userId: string,
  energyTechLevel: number = 0
): Promise<Map<string, CalculatedResources>> {
  try {
    // Fetch all planets for the user
    const planets = await prisma.planet.findMany({
      where: { userId },
      select: { id: true },
    });

    const results = new Map<string, CalculatedResources>();

    // Sync each planet
    for (const planet of planets) {
      const calculated = await syncPlanetResources(planet.id, energyTechLevel);
      if (calculated) {
        results.set(planet.id, calculated);
      }
    }

    return results;
  } catch (error) {
    console.error('Error syncing user planets resources:', error);
    throw error;
  }
}

/**
 * Calculate resources without updating the database
 * Useful for previewing production or checking if player can afford something
 *
 * @param planetId - The ID of the planet
 * @param energyTechLevel - Optional energy technology level
 * @returns The calculated resources (without database update)
 */
export async function previewPlanetResources(
  planetId: string,
  energyTechLevel: number = 0
): Promise<CalculatedResources | null> {
  try {
    // Fetch planet data
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
      include: {
        buildings: {
          select: {
            type: true,
            level: true,
          },
        },
        resources: {
          select: {
            metal: true,
            crystal: true,
            deuterium: true,
            energy: true,
            lastUpdate: true,
          },
        },
      },
    });

    if (!planet || !planet.resources) {
      return null;
    }

    // Prepare planet data
    const planetData: PlanetData = {
      temperature: planet.temperature,
      buildings: planet.buildings.map((b) => ({
        type: b.type,
        level: b.level,
      })),
      resources: {
        metal: planet.resources.metal,
        crystal: planet.resources.crystal,
        deuterium: planet.resources.deuterium,
        energy: planet.resources.energy,
        lastUpdate: planet.resources.lastUpdate,
      },
    };

    // Calculate and return (without updating database)
    return calculateCurrentResources(planetData, energyTechLevel, new Date());
  } catch (error) {
    console.error('Error previewing planet resources:', error);
    throw error;
  }
}

/**
 * Deduct resources from a planet
 * This should be called when building, researching, or building ships
 *
 * @param planetId - The ID of the planet
 * @param cost - The cost to deduct { metal, crystal, deuterium }
 * @returns True if successful, false if insufficient resources
 */
export async function deductResources(
  planetId: string,
  cost: { metal: number; crystal: number; deuterium: number }
): Promise<boolean> {
  try {
    // First sync resources to get current amounts
    const current = await syncPlanetResources(planetId);
    if (!current) {
      return false;
    }

    // Check if player can afford it
    if (
      current.metal < cost.metal ||
      current.crystal < cost.crystal ||
      current.deuterium < cost.deuterium
    ) {
      return false;
    }

    // Deduct resources
    await prisma.resources.update({
      where: { planetId },
      data: {
        metal: { decrement: cost.metal },
        crystal: { decrement: cost.crystal },
        deuterium: { decrement: cost.deuterium },
      },
    });

    return true;
  } catch (error) {
    console.error('Error deducting resources:', error);
    return false;
  }
}
