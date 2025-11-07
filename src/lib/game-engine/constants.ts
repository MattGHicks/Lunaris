/**
 * Game Constants and Formulas for Lunaris
 * Based on OGame mechanics with some modifications
 */

// ============================================================================
// BUILDING TYPES
// ============================================================================

export const BUILDING_TYPES = {
  // Resource Buildings
  METAL_MINE: 'metalMine',
  CRYSTAL_MINE: 'crystalMine',
  DEUTERIUM_SYNTHESIZER: 'deuteriumSynthesizer',
  SOLAR_PLANT: 'solarPlant',
  FUSION_REACTOR: 'fusionReactor',

  // Storage Buildings
  METAL_STORAGE: 'metalStorage',
  CRYSTAL_STORAGE: 'crystalStorage',
  DEUTERIUM_TANK: 'deuteriumTank',

  // Facilities
  ROBOTICS_FACTORY: 'roboticsFactory',
  SHIPYARD: 'shipyard',
  RESEARCH_LAB: 'researchLab',
  ALLIANCE_DEPOT: 'allianceDepot',
  MISSILE_SILO: 'missileSilo',
  NANITE_FACTORY: 'naniteFactory',
  TERRAFORMER: 'terraformer',
  SPACE_DOCK: 'spaceDock',
} as const;

// ============================================================================
// RESOURCE PRODUCTION FORMULAS
// ============================================================================

/**
 * Calculate Metal Mine production per hour
 * Formula: 30 * level * 1.1^level
 */
export function calculateMetalProduction(level: number): number {
  if (level === 0) return 30; // Base production without mine
  return Math.floor(30 * level * Math.pow(1.1, level));
}

/**
 * Calculate Crystal Mine production per hour
 * Formula: 20 * level * 1.1^level
 */
export function calculateCrystalProduction(level: number): number {
  if (level === 0) return 15; // Base production without mine
  return Math.floor(20 * level * Math.pow(1.1, level));
}

/**
 * Calculate Deuterium Synthesizer production per hour
 * Formula: 10 * level * 1.1^level * (1.44 - 0.004 * maxTemp)
 * Temperature affects deuterium production (colder is better)
 */
export function calculateDeuteriumProduction(level: number, maxTemp: number): number {
  if (level === 0) return 0; // No base production
  const tempFactor = 1.44 - 0.004 * maxTemp;
  return Math.floor(10 * level * Math.pow(1.1, level) * tempFactor);
}

// ============================================================================
// ENERGY FORMULAS
// ============================================================================

/**
 * Calculate Metal Mine energy consumption
 * Formula: 10 * level * 1.1^level
 */
export function calculateMetalEnergyConsumption(level: number): number {
  if (level === 0) return 0;
  return Math.ceil(10 * level * Math.pow(1.1, level));
}

/**
 * Calculate Crystal Mine energy consumption
 * Formula: 10 * level * 1.1^level
 */
export function calculateCrystalEnergyConsumption(level: number): number {
  if (level === 0) return 0;
  return Math.ceil(10 * level * Math.pow(1.1, level));
}

/**
 * Calculate Deuterium Synthesizer energy consumption
 * Formula: 20 * level * 1.1^level
 */
export function calculateDeuteriumEnergyConsumption(level: number): number {
  if (level === 0) return 0;
  return Math.ceil(20 * level * Math.pow(1.1, level));
}

/**
 * Calculate Solar Plant energy production
 * Formula: 20 * level * 1.1^level
 */
export function calculateSolarPlantProduction(level: number): number {
  return Math.floor(20 * level * Math.pow(1.1, level));
}

/**
 * Calculate Fusion Reactor energy production
 * Formula: 30 * level * 1.05^level * (1 + energyTechLevel * 0.01)
 */
export function calculateFusionReactorProduction(level: number, energyTechLevel: number): number {
  if (level === 0) return 0;
  return Math.floor(30 * level * Math.pow(1.05 + energyTechLevel * 0.01, level));
}

/**
 * Calculate Fusion Reactor deuterium consumption per hour
 * Formula: 10 * level * 1.1^level
 */
export function calculateFusionReactorConsumption(level: number): number {
  if (level === 0) return 0;
  return Math.ceil(10 * level * Math.pow(1.1, level));
}

// ============================================================================
// STORAGE CAPACITY FORMULAS
// ============================================================================

/**
 * Calculate Metal Storage capacity
 * Formula: 5000 * floor(2.5 * e^(20 * level / 33))
 * Base capacity: 10,000 (with no storage buildings)
 */
export function calculateMetalStorageCapacity(level: number): number {
  const baseCapacity = 10000;
  if (level === 0) return baseCapacity;
  return baseCapacity + Math.floor(5000 * Math.floor(2.5 * Math.exp((20 * level) / 33)));
}

/**
 * Calculate Crystal Storage capacity
 * Formula: 5000 * floor(2.5 * e^(20 * level / 33))
 * Base capacity: 10,000 (with no storage buildings)
 */
export function calculateCrystalStorageCapacity(level: number): number {
  const baseCapacity = 10000;
  if (level === 0) return baseCapacity;
  return baseCapacity + Math.floor(5000 * Math.floor(2.5 * Math.exp((20 * level) / 33)));
}

/**
 * Calculate Deuterium Tank capacity
 * Formula: 5000 * floor(2.5 * e^(20 * level / 33))
 * Base capacity: 10,000 (with no storage buildings)
 */
export function calculateDeuteriumStorageCapacity(level: number): number {
  const baseCapacity = 10000;
  if (level === 0) return baseCapacity;
  return baseCapacity + Math.floor(5000 * Math.floor(2.5 * Math.exp((20 * level) / 33)));
}

// ============================================================================
// BUILDING COST FORMULAS
// ============================================================================

export interface BuildingCost {
  metal: number;
  crystal: number;
  deuterium: number;
}

/**
 * Calculate building upgrade cost
 * Formula: baseCost * 2^(level - 1)
 */
export function calculateBuildingCost(
  baseCost: BuildingCost,
  level: number
): BuildingCost {
  const multiplier = Math.pow(2, level - 1);
  return {
    metal: Math.floor(baseCost.metal * multiplier),
    crystal: Math.floor(baseCost.crystal * multiplier),
    deuterium: Math.floor(baseCost.deuterium * multiplier),
  };
}

/**
 * Base costs for buildings (cost for level 1)
 */
export const BASE_BUILDING_COSTS: Record<string, BuildingCost> = {
  [BUILDING_TYPES.METAL_MINE]: { metal: 60, crystal: 15, deuterium: 0 },
  [BUILDING_TYPES.CRYSTAL_MINE]: { metal: 48, crystal: 24, deuterium: 0 },
  [BUILDING_TYPES.DEUTERIUM_SYNTHESIZER]: { metal: 225, crystal: 75, deuterium: 0 },
  [BUILDING_TYPES.SOLAR_PLANT]: { metal: 75, crystal: 30, deuterium: 0 },
  [BUILDING_TYPES.FUSION_REACTOR]: { metal: 900, crystal: 360, deuterium: 180 },
  [BUILDING_TYPES.METAL_STORAGE]: { metal: 1000, crystal: 0, deuterium: 0 },
  [BUILDING_TYPES.CRYSTAL_STORAGE]: { metal: 1000, crystal: 500, deuterium: 0 },
  [BUILDING_TYPES.DEUTERIUM_TANK]: { metal: 1000, crystal: 1000, deuterium: 0 },
  [BUILDING_TYPES.ROBOTICS_FACTORY]: { metal: 400, crystal: 120, deuterium: 200 },
  [BUILDING_TYPES.SHIPYARD]: { metal: 400, crystal: 200, deuterium: 100 },
  [BUILDING_TYPES.RESEARCH_LAB]: { metal: 200, crystal: 400, deuterium: 200 },
  [BUILDING_TYPES.ALLIANCE_DEPOT]: { metal: 20000, crystal: 40000, deuterium: 0 },
  [BUILDING_TYPES.MISSILE_SILO]: { metal: 20000, crystal: 20000, deuterium: 1000 },
  [BUILDING_TYPES.NANITE_FACTORY]: { metal: 1000000, crystal: 500000, deuterium: 100000 },
  [BUILDING_TYPES.TERRAFORMER]: { metal: 0, crystal: 50000, deuterium: 100000 },
  [BUILDING_TYPES.SPACE_DOCK]: { metal: 200, crystal: 0, deuterium: 50 },
};

// ============================================================================
// BUILDING TIME FORMULAS
// ============================================================================

/**
 * Calculate building construction time in seconds
 * Formula: (metal + crystal) / (2500 * (1 + roboticsLevel) * 2^naniteLevel) * universeSpeed
 *
 * @param cost - Building cost
 * @param roboticsLevel - Robotics Factory level
 * @param naniteLevel - Nanite Factory level
 * @param universeSpeed - Universe speed multiplier (default: 1)
 */
export function calculateBuildingTime(
  cost: BuildingCost,
  roboticsLevel: number,
  naniteLevel: number,
  universeSpeed: number = 1
): number {
  const totalCost = cost.metal + cost.crystal;
  const denominator = 2500 * (1 + roboticsLevel) * Math.pow(2, naniteLevel);
  const timeInHours = totalCost / denominator;
  const timeInSeconds = timeInHours * 3600;
  return Math.max(1, Math.floor(timeInSeconds / universeSpeed));
}

// ============================================================================
// GAME SETTINGS
// ============================================================================

export const GAME_SETTINGS = {
  // Universe settings
  UNIVERSE_SPEED: 1, // Production and build speed multiplier
  FLEET_SPEED: 1, // Fleet speed multiplier

  // Resource settings
  RESOURCE_UPDATE_INTERVAL: 10, // Seconds between resource calculations

  // Coordinates
  MAX_GALAXIES: 5,
  MAX_SYSTEMS: 499,
  MAX_POSITIONS: 15,

  // Starting resources (handled by planet generator)
  STARTING_METAL: 500,
  STARTING_CRYSTAL: 300,
  STARTING_DEUTERIUM: 100,
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ProductionRates {
  metal: number;
  crystal: number;
  deuterium: number;
  energy: number;
}

export interface EnergyBalance {
  production: number;
  consumption: number;
  available: number;
  efficiency: number; // 0 to 1 (percentage of mines running)
}
