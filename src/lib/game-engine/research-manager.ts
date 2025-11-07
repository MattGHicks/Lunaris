/**
 * Research Manager for Lunaris
 * Handles research start, cancellation, and completion
 */

import prisma from '@/lib/db';
import { syncPlanetResources } from './resource-sync';
import {
  calculateNextLevelCost,
  calculateNextLevelTime,
  calculateResearchEndTime,
  canStartResearch,
  isResearchComplete,
  type ResearchInfo,
  type BuildingInfo,
} from './research-calculator';

export interface ResearchResult {
  success: boolean;
  message: string;
  research?: {
    researching: boolean;
    currentResearch: string | null;
    researchEndTime: Date | null;
  };
}

// ============================================================================
// START RESEARCH
// ============================================================================

/**
 * Start researching a technology
 * - Checks if research can be started
 * - Deducts resources from selected planet
 * - Sets research end time
 * - Marks research as in progress
 */
export async function startResearch(
  userId: string,
  planetId: string,
  researchType: string
): Promise<ResearchResult> {
  try {
    // Fetch user with research
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        research: true,
      },
    });

    if (!user || !user.research) {
      return {
        success: false,
        message: 'User or research not found',
      };
    }

    // Fetch planet with buildings and resources
    const planet = await prisma.planet.findUnique({
      where: { id: planetId, userId },
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

    // Get current research level
    const currentLevel = user.research[researchType as keyof typeof user.research] as number;
    if (currentLevel === undefined || typeof currentLevel !== 'number') {
      return {
        success: false,
        message: 'Invalid research type',
      };
    }

    // Get research lab level
    const researchLabBuilding = planet.buildings.find((b) => b.type === 'researchLab');
    const researchLabLevel = researchLabBuilding?.level || 0;

    if (researchLabLevel === 0) {
      return {
        success: false,
        message: 'Research Lab required',
      };
    }

    // Convert research to ResearchInfo format
    const researchInfos: ResearchInfo[] = Object.entries(user.research)
      .filter(([key]) => key !== 'id' && key !== 'userId' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'researching' && key !== 'currentResearch' && key !== 'researchEndTime')
      .map(([key, value]) => ({
        type: key,
        level: value as number,
      }));

    // Convert buildings to BuildingInfo format
    const buildingInfos: BuildingInfo[] = planet.buildings.map((b) => ({
      type: b.type,
      level: b.level,
    }));

    // Check if research can be started
    const canStart = canStartResearch(
      researchType,
      currentLevel,
      researchInfos,
      buildingInfos,
      {
        metal: updatedResources.metal,
        crystal: updatedResources.crystal,
        deuterium: updatedResources.deuterium,
      },
      researchLabLevel,
      user.research.researching,
      user.research.currentResearch
    );

    if (!canStart.canStart) {
      return {
        success: false,
        message: canStart.reason || 'Cannot start research',
      };
    }

    // Calculate cost and time
    const cost = calculateNextLevelCost(researchType, currentLevel);
    const timeInSeconds = calculateNextLevelTime(researchType, currentLevel, researchLabLevel);
    const endTime = calculateResearchEndTime(timeInSeconds);

    // Start research in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct resources from the planet
      await tx.resources.update({
        where: { planetId },
        data: {
          metal: { decrement: cost.metal },
          crystal: { decrement: cost.crystal },
          deuterium: { decrement: cost.deuterium },
        },
      });

      // Mark research as in progress
      const updatedResearch = await tx.research.update({
        where: { userId },
        data: {
          researching: true,
          currentResearch: researchType,
          researchEndTime: endTime,
        },
      });

      return updatedResearch;
    });

    return {
      success: true,
      message: `Research started. Completion in ${Math.floor(timeInSeconds / 60)} minutes.`,
      research: {
        researching: result.researching,
        currentResearch: result.currentResearch,
        researchEndTime: result.researchEndTime,
      },
    };
  } catch (error) {
    console.error('Error starting research:', error);
    return {
      success: false,
      message: 'An error occurred while starting research',
    };
  }
}

// ============================================================================
// CANCEL RESEARCH
// ============================================================================

/**
 * Cancel research in progress
 * - Refunds 100% of resources to specified planet
 * - Clears research status
 */
export async function cancelResearch(
  userId: string,
  planetId: string
): Promise<ResearchResult> {
  try {
    // Fetch user with research
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        research: true,
      },
    });

    if (!user || !user.research) {
      return {
        success: false,
        message: 'User or research not found',
      };
    }

    // Check if research is actually in progress
    if (!user.research.researching || !user.research.currentResearch) {
      return {
        success: false,
        message: 'No research in progress',
      };
    }

    // Verify planet belongs to user
    const planet = await prisma.planet.findUnique({
      where: { id: planetId, userId },
    });

    if (!planet) {
      return {
        success: false,
        message: 'Planet not found',
      };
    }

    // Get current research level
    const researchType = user.research.currentResearch;
    const currentLevel = user.research[researchType as keyof typeof user.research] as number;

    // Calculate refund amount
    const cost = calculateNextLevelCost(researchType, currentLevel);

    // Cancel research in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Refund resources to the planet
      await tx.resources.update({
        where: { planetId },
        data: {
          metal: { increment: cost.metal },
          crystal: { increment: cost.crystal },
          deuterium: { increment: cost.deuterium },
        },
      });

      // Clear research status
      const updatedResearch = await tx.research.update({
        where: { userId },
        data: {
          researching: false,
          currentResearch: null,
          researchEndTime: null,
        },
      });

      return updatedResearch;
    });

    return {
      success: true,
      message: 'Research cancelled. Resources refunded.',
      research: {
        researching: result.researching,
        currentResearch: result.currentResearch,
        researchEndTime: result.researchEndTime,
      },
    };
  } catch (error) {
    console.error('Error cancelling research:', error);
    return {
      success: false,
      message: 'An error occurred while cancelling research',
    };
  }
}

// ============================================================================
// COMPLETE RESEARCH
// ============================================================================

/**
 * Complete research
 * - Checks if research is actually complete
 * - Increments research level
 * - Clears research status
 */
export async function completeResearch(userId: string): Promise<ResearchResult> {
  try {
    // Fetch user with research
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        research: true,
      },
    });

    if (!user || !user.research) {
      return {
        success: false,
        message: 'User or research not found',
      };
    }

    // Check if research is in progress
    if (!user.research.researching || !user.research.currentResearch || !user.research.researchEndTime) {
      return {
        success: false,
        message: 'No research in progress',
      };
    }

    // Check if research is actually complete
    if (!isResearchComplete(user.research.researchEndTime)) {
      return {
        success: false,
        message: 'Research is not yet complete',
      };
    }

    const researchType = user.research.currentResearch;
    const currentLevel = user.research[researchType as keyof typeof user.research] as number;

    // Complete research
    const updatedResearch = await prisma.research.update({
      where: { userId },
      data: {
        [researchType]: { increment: 1 },
        researching: false,
        currentResearch: null,
        researchEndTime: null,
      },
    });

    return {
      success: true,
      message: `${researchType} upgraded to level ${currentLevel + 1}`,
      research: {
        researching: updatedResearch.researching,
        currentResearch: updatedResearch.currentResearch,
        researchEndTime: updatedResearch.researchEndTime,
      },
    };
  } catch (error) {
    console.error('Error completing research:', error);
    return {
      success: false,
      message: 'An error occurred while completing research',
    };
  }
}

// ============================================================================
// CHECK AND COMPLETE ALL RESEARCH
// ============================================================================

/**
 * Check all users for completed research
 * Returns list of completed research
 */
export async function checkAndCompleteAllResearch(): Promise<
  Array<{ userId: string; researchType: string; newLevel: number }>
> {
  try {
    // Find all research currently in progress
    const activeResearch = await prisma.research.findMany({
      where: {
        researching: true,
        researchEndTime: {
          lte: new Date(), // End time is in the past
        },
      },
      select: {
        userId: true,
        currentResearch: true,
      },
    });

    const completed: Array<{ userId: string; researchType: string; newLevel: number }> = [];

    // Complete each research
    for (const research of activeResearch) {
      if (!research.currentResearch) continue;

      const result = await completeResearch(research.userId);
      if (result.success) {
        // Fetch updated research to get new level
        const updatedResearch = await prisma.research.findUnique({
          where: { userId: research.userId },
        });

        if (updatedResearch && research.currentResearch) {
          const newLevel = updatedResearch[research.currentResearch as keyof typeof updatedResearch] as number;
          completed.push({
            userId: research.userId,
            researchType: research.currentResearch,
            newLevel,
          });
        }
      }
    }

    return completed;
  } catch (error) {
    console.error('Error checking and completing research:', error);
    return [];
  }
}
