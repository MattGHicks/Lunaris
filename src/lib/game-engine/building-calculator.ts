/**
 * Building Calculator for Lunaris
 * Handles building upgrade costs, times, and prerequisite checking
 */

import {
  BASE_BUILDING_COSTS,
  BUILDING_PREREQUISITES,
  calculateBuildingCost,
  calculateBuildingTime,
  GAME_SETTINGS,
  type BuildingCost,
} from './constants';

export interface BuildingInfo {
  type: string;
  level: number;
  upgrading: boolean;
  upgradeEndTime: Date | null;
}

export interface UpgradeCostInfo {
  metal: number;
  crystal: number;
  deuterium: number;
  time: number; // in seconds
  canAfford: boolean;
  meetsPrerequisites: boolean;
  missingPrerequisites: string[];
}

// ============================================================================
// COST & TIME CALCULATIONS
// ============================================================================

/**
 * Calculate the cost to upgrade a building to the next level
 */
export function calculateUpgradeCost(
  buildingType: string,
  currentLevel: number
): BuildingCost {
  const baseCost = BASE_BUILDING_COSTS[buildingType];
  if (!baseCost) {
    throw new Error(`Unknown building type: ${buildingType}`);
  }

  // Cost for upgrading to next level (currentLevel + 1)
  const targetLevel = currentLevel + 1;
  return calculateBuildingCost(baseCost, targetLevel);
}

/**
 * Calculate the construction time for upgrading a building
 */
export function calculateUpgradeTime(
  buildingType: string,
  currentLevel: number,
  roboticsLevel: number,
  naniteLevel: number = 0
): number {
  const cost = calculateUpgradeCost(buildingType, currentLevel);
  return calculateBuildingTime(
    cost,
    roboticsLevel,
    naniteLevel,
    GAME_SETTINGS.UNIVERSE_SPEED
  );
}

// ============================================================================
// PREREQUISITE CHECKING
// ============================================================================

/**
 * Check if prerequisites are met for upgrading a building
 */
export function checkPrerequisites(
  buildingType: string,
  buildings: BuildingInfo[]
): { met: boolean; missing: string[] } {
  const prerequisites = BUILDING_PREREQUISITES[buildingType] || [];

  if (prerequisites.length === 0) {
    return { met: true, missing: [] };
  }

  const buildingMap = new Map(buildings.map((b) => [b.type, b.level]));
  const missing: string[] = [];

  for (const prereq of prerequisites) {
    const currentLevel = buildingMap.get(prereq.building) || 0;
    if (currentLevel < prereq.level) {
      missing.push(`${prereq.building} (Level ${prereq.level} required, currently ${currentLevel})`);
    }
  }

  return {
    met: missing.length === 0,
    missing,
  };
}

/**
 * Check if player can afford to upgrade a building
 */
export function canAffordUpgrade(
  cost: BuildingCost,
  resources: { metal: number; crystal: number; deuterium: number }
): boolean {
  return (
    resources.metal >= cost.metal &&
    resources.crystal >= cost.crystal &&
    resources.deuterium >= cost.deuterium
  );
}

/**
 * Get complete upgrade information for a building
 */
export function getUpgradeInfo(
  buildingType: string,
  currentLevel: number,
  buildings: BuildingInfo[],
  resources: { metal: number; crystal: number; deuterium: number },
  roboticsLevel: number,
  naniteLevel: number = 0
): UpgradeCostInfo {
  const cost = calculateUpgradeCost(buildingType, currentLevel);
  const time = calculateUpgradeTime(buildingType, currentLevel, roboticsLevel, naniteLevel);
  const affordability = canAffordUpgrade(cost, resources);
  const prereqCheck = checkPrerequisites(buildingType, buildings);

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
 * Check if a building is currently being upgraded on this planet
 */
export function hasBuildingInProgress(buildings: BuildingInfo[]): boolean {
  return buildings.some((b) => b.upgrading);
}

/**
 * Get the building currently being upgraded
 */
export function getBuildingInProgress(buildings: BuildingInfo[]): BuildingInfo | null {
  return buildings.find((b) => b.upgrading) || null;
}

/**
 * Check if an upgrade can be started
 * Returns true if no other building is upgrading and prerequisites are met
 */
export function canStartUpgrade(
  buildingType: string,
  currentLevel: number,
  buildings: BuildingInfo[],
  resources: { metal: number; crystal: number; deuterium: number },
  roboticsLevel: number,
  naniteLevel: number = 0
): { canStart: boolean; reason?: string } {
  // Check if another building is already upgrading
  if (hasBuildingInProgress(buildings)) {
    const inProgress = getBuildingInProgress(buildings);
    return {
      canStart: false,
      reason: `Another building is currently upgrading: ${inProgress?.type}`,
    };
  }

  // Get upgrade info
  const upgradeInfo = getUpgradeInfo(
    buildingType,
    currentLevel,
    buildings,
    resources,
    roboticsLevel,
    naniteLevel
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
 * Calculate the end time for an upgrade
 */
export function calculateUpgradeEndTime(constructionTimeSeconds: number): Date {
  return new Date(Date.now() + constructionTimeSeconds * 1000);
}

/**
 * Calculate remaining time for an upgrade in seconds
 */
export function getRemainingUpgradeTime(upgradeEndTime: Date): number {
  const now = Date.now();
  const endTime = new Date(upgradeEndTime).getTime();
  const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
  return remaining;
}

/**
 * Check if an upgrade is complete
 */
export function isUpgradeComplete(upgradeEndTime: Date | null): boolean {
  if (!upgradeEndTime) return false;
  return Date.now() >= new Date(upgradeEndTime).getTime();
}

/**
 * Format time duration for display (e.g., "2h 34m 12s")
 */
export function formatBuildingTime(seconds: number): string {
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
