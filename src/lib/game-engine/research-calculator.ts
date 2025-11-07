/**
 * Research Calculator for Lunaris
 * Handles research costs, times, and prerequisite checking
 */

import {
  BASE_RESEARCH_COSTS,
  RESEARCH_PREREQUISITES,
  calculateResearchCost,
  calculateResearchTime,
  GAME_SETTINGS,
  type ResearchCost,
} from './constants';

export interface ResearchInfo {
  type: string;
  level: number;
}

export interface ResearchUpgradeCostInfo {
  metal: number;
  crystal: number;
  deuterium: number;
  time: number; // in seconds
  canAfford: boolean;
  meetsPrerequisites: boolean;
  missingPrerequisites: string[];
}

export interface BuildingInfo {
  type: string;
  level: number;
}

// ============================================================================
// COST & TIME CALCULATIONS
// ============================================================================

/**
 * Calculate the cost to research the next level
 */
export function calculateNextLevelCost(
  researchType: string,
  currentLevel: number
): ResearchCost {
  const baseCost = BASE_RESEARCH_COSTS[researchType];
  if (!baseCost) {
    throw new Error(`Unknown research type: ${researchType}`);
  }

  // Cost for upgrading to next level (currentLevel + 1)
  const targetLevel = currentLevel + 1;
  return calculateResearchCost(baseCost, targetLevel);
}

/**
 * Calculate the research time for next level
 */
export function calculateNextLevelTime(
  researchType: string,
  currentLevel: number,
  researchLabLevel: number
): number {
  const cost = calculateNextLevelCost(researchType, currentLevel);
  return calculateResearchTime(
    cost,
    researchLabLevel,
    GAME_SETTINGS.UNIVERSE_SPEED
  );
}

// ============================================================================
// PREREQUISITE CHECKING
// ============================================================================

/**
 * Check if prerequisites are met for researching a technology
 */
export function checkPrerequisites(
  researchType: string,
  research: ResearchInfo[],
  buildings: BuildingInfo[]
): { met: boolean; missing: string[] } {
  const prerequisites = RESEARCH_PREREQUISITES[researchType] || [];

  if (prerequisites.length === 0) {
    return { met: true, missing: [] };
  }

  const researchMap = new Map(research.map((r) => [r.type, r.level]));
  const buildingMap = new Map(buildings.map((b) => [b.type, b.level]));
  const missing: string[] = [];

  for (const prereq of prerequisites) {
    // Check research prerequisite
    if (prereq.research && prereq.researchLevel !== undefined) {
      const currentLevel = researchMap.get(prereq.research) || 0;
      if (currentLevel < prereq.researchLevel) {
        missing.push(`${prereq.research} Level ${prereq.researchLevel} (currently ${currentLevel})`);
      }
    }

    // Check building prerequisite
    if (prereq.building && prereq.buildingLevel !== undefined) {
      const currentLevel = buildingMap.get(prereq.building) || 0;
      if (currentLevel < prereq.buildingLevel) {
        missing.push(`${prereq.building} Level ${prereq.buildingLevel} (currently ${currentLevel})`);
      }
    }
  }

  return {
    met: missing.length === 0,
    missing,
  };
}

/**
 * Check if player can afford to research
 */
export function canAffordResearch(
  cost: ResearchCost,
  resources: { metal: number; crystal: number; deuterium: number }
): boolean {
  return (
    resources.metal >= cost.metal &&
    resources.crystal >= cost.crystal &&
    resources.deuterium >= cost.deuterium
  );
}

/**
 * Get complete upgrade information for a research
 */
export function getResearchUpgradeInfo(
  researchType: string,
  currentLevel: number,
  research: ResearchInfo[],
  buildings: BuildingInfo[],
  resources: { metal: number; crystal: number; deuterium: number },
  researchLabLevel: number
): ResearchUpgradeCostInfo {
  const cost = calculateNextLevelCost(researchType, currentLevel);
  const time = calculateNextLevelTime(researchType, currentLevel, researchLabLevel);
  const affordability = canAffordResearch(cost, resources);
  const prereqCheck = checkPrerequisites(researchType, research, buildings);

  return {
    metal: cost.metal,
    crystal: cost.crystal,
    deuterium: cost.deuterium,
    time,
    canAfford: affordability,
    meetsPrerequisites: prereqCheck.met,
    missingPrerequisites: prereqCheck.missing,
  };
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

/**
 * Check if research is currently in progress
 */
export function hasResearchInProgress(researching: boolean): boolean {
  return researching;
}

/**
 * Check if research can be started
 * Returns true if no other research is in progress and prerequisites are met
 */
export function canStartResearch(
  researchType: string,
  currentLevel: number,
  research: ResearchInfo[],
  buildings: BuildingInfo[],
  resources: { metal: number; crystal: number; deuterium: number },
  researchLabLevel: number,
  researching: boolean,
  currentResearch: string | null
): { canStart: boolean; reason?: string } {
  // Check if research is already in progress
  if (researching) {
    return {
      canStart: false,
      reason: `Another research is in progress: ${currentResearch}`,
    };
  }

  // Get upgrade info
  const upgradeInfo = getResearchUpgradeInfo(
    researchType,
    currentLevel,
    research,
    buildings,
    resources,
    researchLabLevel
  );

  // Check prerequisites
  if (!upgradeInfo.meetsPrerequisites) {
    return {
      canStart: false,
      reason: `Prerequisites not met: ${upgradeInfo.missingPrerequisites.join(', ')}`,
    };
  }

  // Check affordability
  if (!upgradeInfo.canAfford) {
    return {
      canStart: false,
      reason: 'Insufficient resources',
    };
  }

  return { canStart: true };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate the end time for research
 */
export function calculateResearchEndTime(researchTimeSeconds: number): Date {
  return new Date(Date.now() + researchTimeSeconds * 1000);
}

/**
 * Calculate remaining time for research in seconds
 */
export function getRemainingResearchTime(researchEndTime: Date): number {
  const now = Date.now();
  const endTime = new Date(researchEndTime).getTime();
  const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
  return remaining;
}

/**
 * Check if research is complete
 */
export function isResearchComplete(researchEndTime: Date | null): boolean {
  if (!researchEndTime) return false;
  return Date.now() >= new Date(researchEndTime).getTime();
}

/**
 * Format time duration for display (e.g., "2h 34m 12s")
 */
export function formatResearchTime(seconds: number): string {
  if (seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
