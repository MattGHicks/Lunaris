/**
 * Building Manager for Lunaris
 * Handles building upgrades, cancellations, and completions
 */

import prisma from '@/lib/db';
import { syncPlanetResources } from './resource-sync';
import {
  calculateUpgradeCost,
  calculateUpgradeTime,
  calculateUpgradeEndTime,
  canStartUpgrade,
  isUpgradeComplete,
  type BuildingInfo,
} from './building-calculator';

export interface UpgradeResult {
  success: boolean;
  message: string;
  building?: {
    id: string;
    type: string;
    level: number;
    upgrading: boolean;
    upgradeEndTime: Date | null;
  };
}

// ============================================================================
// START UPGRADE
// ============================================================================

/**
 * Start upgrading a building
 * - Checks if upgrade can be started
 * - Deducts resources
 * - Sets upgrade end time
 * - Marks building as upgrading
 */
export async function startBuildingUpgrade(
  planetId: string,
  buildingType: string
): Promise<UpgradeResult> {
  try {
    // Fetch planet with buildings and resources
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
      include: {
        buildings: true,
        resources: true,
      },
    });

    if (!planet || !planet.resources) {
      return {
        success: false,
        message: 'Planet not found',
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

    // Find the building
    const building = planet.buildings.find((b) => b.type === buildingType);
    if (!building) {
      return {
        success: false,
        message: 'Building not found on this planet',
      };
    }

    // Get robotics and nanite levels
    const roboticsBuilding = planet.buildings.find((b) => b.type === 'roboticsFactory');
    const naniteBuilding = planet.buildings.find((b) => b.type === 'naniteFactory');
    const roboticsLevel = roboticsBuilding?.level || 0;
    const naniteLevel = naniteBuilding?.level || 0;

    // Convert buildings to BuildingInfo format
    const buildingInfos: BuildingInfo[] = planet.buildings.map((b) => ({
      type: b.type,
      level: b.level,
      upgrading: b.upgrading,
      upgradeEndTime: b.upgradeEndTime,
    }));

    // Check if upgrade can be started
    const canStart = canStartUpgrade(
      buildingType,
      building.level,
      buildingInfos,
      {
        metal: updatedResources.metal,
        crystal: updatedResources.crystal,
        deuterium: updatedResources.deuterium,
      },
      roboticsLevel,
      naniteLevel
    );

    if (!canStart.canStart) {
      return {
        success: false,
        message: canStart.reason || 'Cannot start upgrade',
      };
    }

    // Calculate cost and time
    const cost = calculateUpgradeCost(buildingType, building.level);
    const timeInSeconds = calculateUpgradeTime(
      buildingType,
      building.level,
      roboticsLevel,
      naniteLevel
    );
    const endTime = calculateUpgradeEndTime(timeInSeconds);

    // Start upgrade in a transaction
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

      // Mark building as upgrading
      const updatedBuilding = await tx.building.update({
        where: { id: building.id },
        data: {
          upgrading: true,
          upgradeEndTime: endTime,
        },
      });

      return updatedBuilding;
    });

    return {
      success: true,
      message: `Building upgrade started. Completion in ${Math.floor(timeInSeconds / 60)} minutes.`,
      building: result,
    };
  } catch (error) {
    console.error('Error starting building upgrade:', error);
    return {
      success: false,
      message: 'An error occurred while starting the upgrade',
    };
  }
}

// ============================================================================
// CANCEL UPGRADE
// ============================================================================

/**
 * Cancel a building upgrade
 * - Refunds 100% of resources
 * - Clears upgrade status
 */
export async function cancelBuildingUpgrade(
  planetId: string,
  buildingType: string
): Promise<UpgradeResult> {
  try {
    // Fetch planet with buildings
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
      include: {
        buildings: true,
      },
    });

    if (!planet) {
      return {
        success: false,
        message: 'Planet not found',
      };
    }

    // Find the building
    const building = planet.buildings.find((b) => b.type === buildingType);
    if (!building) {
      return {
        success: false,
        message: 'Building not found',
      };
    }

    // Check if building is actually upgrading
    if (!building.upgrading) {
      return {
        success: false,
        message: 'Building is not currently upgrading',
      };
    }

    // Calculate refund amount
    const cost = calculateUpgradeCost(buildingType, building.level);

    // Cancel upgrade in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Refund resources
      await tx.resources.update({
        where: { planetId },
        data: {
          metal: { increment: cost.metal },
          crystal: { increment: cost.crystal },
          deuterium: { increment: cost.deuterium },
        },
      });

      // Clear upgrade status
      const updatedBuilding = await tx.building.update({
        where: { id: building.id },
        data: {
          upgrading: false,
          upgradeEndTime: null,
        },
      });

      return updatedBuilding;
    });

    return {
      success: true,
      message: 'Building upgrade cancelled. Resources refunded.',
      building: result,
    };
  } catch (error) {
    console.error('Error cancelling building upgrade:', error);
    return {
      success: false,
      message: 'An error occurred while cancelling the upgrade',
    };
  }
}

// ============================================================================
// COMPLETE UPGRADE
// ============================================================================

/**
 * Complete a building upgrade
 * - Checks if upgrade is actually complete
 * - Increments building level
 * - Clears upgrade status
 */
export async function completeBuildingUpgrade(
  planetId: string,
  buildingType: string
): Promise<UpgradeResult> {
  try {
    // Fetch planet with buildings
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
      include: {
        buildings: true,
      },
    });

    if (!planet) {
      return {
        success: false,
        message: 'Planet not found',
      };
    }

    // Find the building
    const building = planet.buildings.find((b) => b.type === buildingType);
    if (!building) {
      return {
        success: false,
        message: 'Building not found',
      };
    }

    // Check if building is upgrading
    if (!building.upgrading || !building.upgradeEndTime) {
      return {
        success: false,
        message: 'Building is not currently upgrading',
      };
    }

    // Check if upgrade is actually complete
    if (!isUpgradeComplete(building.upgradeEndTime)) {
      return {
        success: false,
        message: 'Upgrade is not yet complete',
      };
    }

    // Complete upgrade
    const updatedBuilding = await prisma.building.update({
      where: { id: building.id },
      data: {
        level: { increment: 1 },
        upgrading: false,
        upgradeEndTime: null,
      },
    });

    return {
      success: true,
      message: `${buildingType} upgraded to level ${updatedBuilding.level}`,
      building: updatedBuilding,
    };
  } catch (error) {
    console.error('Error completing building upgrade:', error);
    return {
      success: false,
      message: 'An error occurred while completing the upgrade',
    };
  }
}

// ============================================================================
// CHECK AND COMPLETE ALL UPGRADES
// ============================================================================

/**
 * Check all planets for completed building upgrades
 * Returns list of completed buildings
 */
export async function checkAndCompleteAllUpgrades(): Promise<
  Array<{ planetId: string; buildingType: string; newLevel: number }>
> {
  try {
    // Find all buildings currently upgrading
    const upgradingBuildings = await prisma.building.findMany({
      where: {
        upgrading: true,
        upgradeEndTime: {
          lte: new Date(), // End time is in the past
        },
      },
      include: {
        planet: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    const completed: Array<{ planetId: string; buildingType: string; newLevel: number }> = [];

    // Complete each building
    for (const building of upgradingBuildings) {
      const result = await completeBuildingUpgrade(building.planet.id, building.type);
      if (result.success && result.building) {
        completed.push({
          planetId: building.planet.id,
          buildingType: building.type,
          newLevel: result.building.level,
        });
      }
    }

    return completed;
  } catch (error) {
    console.error('Error checking and completing upgrades:', error);
    return [];
  }
}
