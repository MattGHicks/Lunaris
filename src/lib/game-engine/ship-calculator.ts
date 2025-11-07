/**
 * Ship Calculator for Lunaris
 * Handles ship production costs, times, and prerequisite checking
 */

import {
  BASE_SHIP_COSTS,
  SHIP_PREREQUISITES,
  calculateShipTime,
  GAME_SETTINGS,
  type ShipCost,
} from './constants';

export interface BuildingInfo {
  type: string;
  level: number;
}

export interface ResearchInfo {
  type: string;
  level: number;
}

export interface ShipBuildInfo {
  metal: number;
  crystal: number;
  deuterium: number;
  timePerUnit: number; // in seconds
  totalTime: number; // in seconds for all units
  canAfford: boolean;
  meetsPrerequisites: boolean;
  missingPrerequisites: string[];
}

// ============================================================================
// COST & TIME CALCULATIONS
// ============================================================================

/**
 * Calculate the cost to build ships
 */
export function calculateShipCost(
  shipType: string,
  quantity: number
): ShipCost {
  const baseCost = BASE_SHIP_COSTS[shipType];
  if (!baseCost) {
    throw new Error(`Unknown ship type: ${shipType}`);
  }

  return {
    metal: baseCost.metal * quantity,
    crystal: baseCost.crystal * quantity,
    deuterium: baseCost.deuterium * quantity,
  };
}

/**
 * Calculate the construction time for building ships
 */
export function calculateShipBuildTime(
  shipType: string,
  quantity: number,
  shipyardLevel: number,
  naniteLevel: number = 0
): number {
  const baseCost = BASE_SHIP_COSTS[shipType];
  if (!baseCost) {
    throw new Error(`Unknown ship type: ${shipType}`);
  }

  const timePerUnit = calculateShipTime(
    baseCost,
    shipyardLevel,
    naniteLevel,
    GAME_SETTINGS.UNIVERSE_SPEED
  );

  return timePerUnit * quantity;
}

// ============================================================================
// PREREQUISITE CHECKING
// ============================================================================

/**
 * Check if prerequisites are met for building a ship
 */
export function checkShipPrerequisites(
  shipType: string,
  buildings: BuildingInfo[],
  research: ResearchInfo[]
): { met: boolean; missing: string[] } {
  const prerequisites = SHIP_PREREQUISITES[shipType] || [];

  if (prerequisites.length === 0) {
    return { met: true, missing: [] };
  }

  const buildingMap = new Map(buildings.map((b) => [b.type, b.level]));
  const researchMap = new Map(research.map((r) => [r.type, r.level]));
  const missing: string[] = [];

  for (const prereq of prerequisites) {
    // Check building prerequisite
    if (prereq.building && prereq.buildingLevel !== undefined) {
      const currentLevel = buildingMap.get(prereq.building) || 0;
      if (currentLevel < prereq.buildingLevel) {
        missing.push(`${prereq.building} Level ${prereq.buildingLevel} (currently ${currentLevel})`);
      }
    }

    // Check research prerequisite
    if (prereq.research && prereq.researchLevel !== undefined) {
      const currentLevel = researchMap.get(prereq.research) || 0;
      if (currentLevel < prereq.researchLevel) {
        missing.push(`${prereq.research} Level ${prereq.researchLevel} (currently ${currentLevel})`);
      }
    }
  }

  return {
    met: missing.length === 0,
    missing,
  };
}

/**
 * Check if player can afford to build ships
 */
export function canAffordShips(
  cost: ShipCost,
  resources: { metal: number; crystal: number; deuterium: number }
): boolean {
  return (
    resources.metal >= cost.metal &&
    resources.crystal >= cost.crystal &&
    resources.deuterium >= cost.deuterium
  );
}

/**
 * Get complete build information for ships
 */
export function getShipBuildInfo(
  shipType: string,
  quantity: number,
  buildings: BuildingInfo[],
  research: ResearchInfo[],
  resources: { metal: number; crystal: number; deuterium: number },
  shipyardLevel: number,
  naniteLevel: number = 0
): ShipBuildInfo {
  const cost = calculateShipCost(shipType, quantity);
  const totalTime = calculateShipBuildTime(shipType, quantity, shipyardLevel, naniteLevel);
  const timePerUnit = calculateShipBuildTime(shipType, 1, shipyardLevel, naniteLevel);
  const affordability = canAffordShips(cost, resources);
  const prereqCheck = checkShipPrerequisites(shipType, buildings, research);

  return {
    metal: cost.metal,
    crystal: cost.crystal,
    deuterium: cost.deuterium,
    timePerUnit,
    totalTime,
    canAfford: affordability,
    meetsPrerequisites: prereqCheck.met,
    missingPrerequisites: prereqCheck.missing,
  };
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

/**
 * Check if ships are currently being built on this planet
 */
export function hasShipInProduction(
  buildings: Array<{ type: string; upgrading: boolean }>
): boolean {
  // In OGame, you can't build ships while shipyard is upgrading
  const shipyard = buildings.find((b) => b.type === 'shipyard');
  return shipyard?.upgrading || false;
}

/**
 * Check if ship building can be started
 * Returns true if shipyard is not upgrading and prerequisites are met
 */
export function canStartShipBuild(
  shipType: string,
  quantity: number,
  buildings: BuildingInfo[],
  research: ResearchInfo[],
  resources: { metal: number; crystal: number; deuterium: number },
  shipyardLevel: number,
  naniteLevel: number = 0,
  shipyardUpgrading: boolean = false
): { canStart: boolean; reason?: string } {
  // Check if shipyard is upgrading
  if (shipyardUpgrading) {
    return {
      canStart: false,
      reason: 'Shipyard is currently upgrading',
    };
  }

  // Get build info
  const buildInfo = getShipBuildInfo(
    shipType,
    quantity,
    buildings,
    research,
    resources,
    shipyardLevel,
    naniteLevel
  );

  // Check prerequisites
  if (!buildInfo.meetsPrerequisites) {
    return {
      canStart: false,
      reason: `Prerequisites not met: ${buildInfo.missingPrerequisites.join(', ')}`,
    };
  }

  // Check affordability
  if (!buildInfo.canAfford) {
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
 * Calculate the end time for ship production
 */
export function calculateShipProductionEndTime(buildTimeSeconds: number): Date {
  return new Date(Date.now() + buildTimeSeconds * 1000);
}

/**
 * Calculate remaining time for ship production in seconds
 */
export function getRemainingProductionTime(productionEndTime: Date): number {
  const now = Date.now();
  const endTime = new Date(productionEndTime).getTime();
  const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
  return remaining;
}

/**
 * Check if ship production is complete
 */
export function isProductionComplete(productionEndTime: Date | null): boolean {
  if (!productionEndTime) return false;
  return Date.now() >= new Date(productionEndTime).getTime();
}

/**
 * Format time duration for display (e.g., "2h 34m 12s")
 */
export function formatProductionTime(seconds: number): string {
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

/**
 * Calculate maximum quantity affordable with current resources
 */
export function calculateMaxAffordable(
  shipType: string,
  resources: { metal: number; crystal: number; deuterium: number }
): number {
  const baseCost = BASE_SHIP_COSTS[shipType];
  if (!baseCost) {
    return 0;
  }

  // Calculate max based on each resource
  const maxFromMetal = baseCost.metal > 0 ? Math.floor(resources.metal / baseCost.metal) : Infinity;
  const maxFromCrystal = baseCost.crystal > 0 ? Math.floor(resources.crystal / baseCost.crystal) : Infinity;
  const maxFromDeuterium = baseCost.deuterium > 0 ? Math.floor(resources.deuterium / baseCost.deuterium) : Infinity;

  return Math.max(0, Math.floor(Math.min(maxFromMetal, maxFromCrystal, maxFromDeuterium)));
}
