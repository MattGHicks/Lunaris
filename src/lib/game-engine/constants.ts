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
  UNIVERSE_SPEED: 100, // Production and build speed multiplier (100x for testing)
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
// BUILDING PREREQUISITES
// ============================================================================

export interface BuildingPrerequisite {
  building: string;
  level: number;
}

/**
 * Building prerequisites
 * Format: { buildingType: [{ building: prerequisiteType, level: minimumLevel }] }
 */
export const BUILDING_PREREQUISITES: Record<string, BuildingPrerequisite[]> = {
  [BUILDING_TYPES.METAL_MINE]: [],
  [BUILDING_TYPES.CRYSTAL_MINE]: [],
  [BUILDING_TYPES.DEUTERIUM_SYNTHESIZER]: [],
  [BUILDING_TYPES.SOLAR_PLANT]: [],
  [BUILDING_TYPES.FUSION_REACTOR]: [
    { building: BUILDING_TYPES.DEUTERIUM_SYNTHESIZER, level: 5 },
  ],
  [BUILDING_TYPES.METAL_STORAGE]: [],
  [BUILDING_TYPES.CRYSTAL_STORAGE]: [],
  [BUILDING_TYPES.DEUTERIUM_TANK]: [],
  [BUILDING_TYPES.ROBOTICS_FACTORY]: [],
  [BUILDING_TYPES.SHIPYARD]: [
    { building: BUILDING_TYPES.ROBOTICS_FACTORY, level: 2 },
  ],
  [BUILDING_TYPES.RESEARCH_LAB]: [],
  [BUILDING_TYPES.ALLIANCE_DEPOT]: [],
  [BUILDING_TYPES.MISSILE_SILO]: [
    { building: BUILDING_TYPES.SHIPYARD, level: 1 },
  ],
  [BUILDING_TYPES.NANITE_FACTORY]: [
    { building: BUILDING_TYPES.ROBOTICS_FACTORY, level: 10 },
  ],
  [BUILDING_TYPES.TERRAFORMER]: [],
  [BUILDING_TYPES.SPACE_DOCK]: [
    { building: BUILDING_TYPES.SHIPYARD, level: 2 },
  ],
};

/**
 * Building names for display
 */
export const BUILDING_NAMES: Record<string, string> = {
  [BUILDING_TYPES.METAL_MINE]: 'Metal Mine',
  [BUILDING_TYPES.CRYSTAL_MINE]: 'Crystal Mine',
  [BUILDING_TYPES.DEUTERIUM_SYNTHESIZER]: 'Deuterium Synthesizer',
  [BUILDING_TYPES.SOLAR_PLANT]: 'Solar Plant',
  [BUILDING_TYPES.FUSION_REACTOR]: 'Fusion Reactor',
  [BUILDING_TYPES.METAL_STORAGE]: 'Metal Storage',
  [BUILDING_TYPES.CRYSTAL_STORAGE]: 'Crystal Storage',
  [BUILDING_TYPES.DEUTERIUM_TANK]: 'Deuterium Tank',
  [BUILDING_TYPES.ROBOTICS_FACTORY]: 'Robotics Factory',
  [BUILDING_TYPES.SHIPYARD]: 'Shipyard',
  [BUILDING_TYPES.RESEARCH_LAB]: 'Research Lab',
  [BUILDING_TYPES.ALLIANCE_DEPOT]: 'Alliance Depot',
  [BUILDING_TYPES.MISSILE_SILO]: 'Missile Silo',
  [BUILDING_TYPES.NANITE_FACTORY]: 'Nanite Factory',
  [BUILDING_TYPES.TERRAFORMER]: 'Terraformer',
  [BUILDING_TYPES.SPACE_DOCK]: 'Space Dock',
};

/**
 * Building descriptions
 */
export const BUILDING_DESCRIPTIONS: Record<string, string> = {
  [BUILDING_TYPES.METAL_MINE]: 'Mines metal ore from the planet. Higher levels increase production.',
  [BUILDING_TYPES.CRYSTAL_MINE]: 'Extracts crystal from underground deposits. Higher levels increase production.',
  [BUILDING_TYPES.DEUTERIUM_SYNTHESIZER]: 'Synthesizes deuterium from the planet\'s atmosphere. Production affected by temperature.',
  [BUILDING_TYPES.SOLAR_PLANT]: 'Generates energy from solar radiation. Required to power mines.',
  [BUILDING_TYPES.FUSION_REACTOR]: 'Advanced energy source. Consumes deuterium but produces massive energy.',
  [BUILDING_TYPES.METAL_STORAGE]: 'Stores metal. Increases storage capacity for metal.',
  [BUILDING_TYPES.CRYSTAL_STORAGE]: 'Stores crystal. Increases storage capacity for crystal.',
  [BUILDING_TYPES.DEUTERIUM_TANK]: 'Stores deuterium. Increases storage capacity for deuterium.',
  [BUILDING_TYPES.ROBOTICS_FACTORY]: 'Produces construction robots. Reduces building construction time.',
  [BUILDING_TYPES.SHIPYARD]: 'Constructs ships and defense systems. Required for fleet production.',
  [BUILDING_TYPES.RESEARCH_LAB]: 'Conducts research. Higher levels unlock new technologies.',
  [BUILDING_TYPES.ALLIANCE_DEPOT]: 'Stores resources for alliance members. Enables resource sharing.',
  [BUILDING_TYPES.MISSILE_SILO]: 'Launches interplanetary and interceptor missiles.',
  [BUILDING_TYPES.NANITE_FACTORY]: 'Produces nanites. Dramatically reduces construction time.',
  [BUILDING_TYPES.TERRAFORMER]: 'Increases available building fields on the planet.',
  [BUILDING_TYPES.SPACE_DOCK]: 'Repairs damaged ships at reduced cost.',
};

// ============================================================================
// RESEARCH TYPES
// ============================================================================

export const RESEARCH_TYPES = {
  ESPIONAGE_TECH: 'espionageTech',
  COMPUTER_TECH: 'computerTech',
  WEAPONS_TECH: 'weaponsTech',
  SHIELDING_TECH: 'shieldingTech',
  ARMOR_TECH: 'armorTech',
  ENERGY_TECH: 'energyTech',
  HYPERSPACE_TECH: 'hyperspaceTech',
  COMBUSTION_DRIVE: 'combustionDrive',
  IMPULSE_DRIVE: 'impulseDrive',
  HYPERSPACE_DRIVE: 'hyperspaceDrive',
  LASER_TECH: 'laserTech',
  ION_TECH: 'ionTech',
  PLASMA_TECH: 'plasmaTech',
  ASTROPHYSICS: 'astrophysics',
  RESEARCH_NETWORK: 'researchNetwork',
  EXPEDITION_TECH: 'expeditionTech',
  GRAVITON_TECH: 'gravitonTech',
} as const;

// ============================================================================
// RESEARCH COST FORMULAS
// ============================================================================

export interface ResearchCost {
  metal: number;
  crystal: number;
  deuterium: number;
}

/**
 * Calculate research cost
 * Formula: baseCost * 2^level
 */
export function calculateResearchCost(
  baseCost: ResearchCost,
  level: number
): ResearchCost {
  const multiplier = Math.pow(2, level);
  return {
    metal: Math.floor(baseCost.metal * multiplier),
    crystal: Math.floor(baseCost.crystal * multiplier),
    deuterium: Math.floor(baseCost.deuterium * multiplier),
  };
}

/**
 * Base costs for research (cost for level 1)
 */
export const BASE_RESEARCH_COSTS: Record<string, ResearchCost> = {
  [RESEARCH_TYPES.ESPIONAGE_TECH]: { metal: 200, crystal: 1000, deuterium: 200 },
  [RESEARCH_TYPES.COMPUTER_TECH]: { metal: 0, crystal: 400, deuterium: 600 },
  [RESEARCH_TYPES.WEAPONS_TECH]: { metal: 800, crystal: 200, deuterium: 0 },
  [RESEARCH_TYPES.SHIELDING_TECH]: { metal: 200, crystal: 600, deuterium: 0 },
  [RESEARCH_TYPES.ARMOR_TECH]: { metal: 1000, crystal: 0, deuterium: 0 },
  [RESEARCH_TYPES.ENERGY_TECH]: { metal: 0, crystal: 800, deuterium: 400 },
  [RESEARCH_TYPES.HYPERSPACE_TECH]: { metal: 0, crystal: 4000, deuterium: 2000 },
  [RESEARCH_TYPES.COMBUSTION_DRIVE]: { metal: 400, crystal: 0, deuterium: 600 },
  [RESEARCH_TYPES.IMPULSE_DRIVE]: { metal: 2000, crystal: 4000, deuterium: 600 },
  [RESEARCH_TYPES.HYPERSPACE_DRIVE]: { metal: 10000, crystal: 20000, deuterium: 6000 },
  [RESEARCH_TYPES.LASER_TECH]: { metal: 200, crystal: 100, deuterium: 0 },
  [RESEARCH_TYPES.ION_TECH]: { metal: 1000, crystal: 300, deuterium: 100 },
  [RESEARCH_TYPES.PLASMA_TECH]: { metal: 2000, crystal: 4000, deuterium: 1000 },
  [RESEARCH_TYPES.ASTROPHYSICS]: { metal: 4000, crystal: 8000, deuterium: 4000 },
  [RESEARCH_TYPES.RESEARCH_NETWORK]: { metal: 240000, crystal: 400000, deuterium: 160000 },
  [RESEARCH_TYPES.EXPEDITION_TECH]: { metal: 4000, crystal: 8000, deuterium: 4000 },
  [RESEARCH_TYPES.GRAVITON_TECH]: { metal: 0, crystal: 0, deuterium: 0 }, // Special (cannot be researched normally)
};

// ============================================================================
// RESEARCH TIME FORMULAS
// ============================================================================

/**
 * Calculate research time in seconds
 * Formula: (metal + crystal) / (1000 * (1 + labLevel)) * universeSpeed
 *
 * @param cost - Research cost
 * @param labLevel - Research Lab level
 * @param universeSpeed - Universe speed multiplier (default: 1)
 */
export function calculateResearchTime(
  cost: ResearchCost,
  labLevel: number,
  universeSpeed: number = 1
): number {
  const totalCost = cost.metal + cost.crystal;
  const denominator = 1000 * (1 + labLevel);
  const timeInHours = totalCost / denominator;
  const timeInSeconds = timeInHours * 3600;
  return Math.max(1, Math.floor(timeInSeconds / universeSpeed));
}

// ============================================================================
// RESEARCH PREREQUISITES
// ============================================================================

export interface ResearchPrerequisite {
  research?: string;
  researchLevel?: number;
  building?: string;
  buildingLevel?: number;
}

/**
 * Research prerequisites
 * Format: { researchType: [{ research/building: type, level: minimumLevel }] }
 */
export const RESEARCH_PREREQUISITES: Record<string, ResearchPrerequisite[]> = {
  [RESEARCH_TYPES.ESPIONAGE_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 3 },
  ],
  [RESEARCH_TYPES.COMPUTER_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 1 },
  ],
  [RESEARCH_TYPES.WEAPONS_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 4 },
  ],
  [RESEARCH_TYPES.SHIELDING_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 6 },
    { research: RESEARCH_TYPES.ENERGY_TECH, researchLevel: 3 },
  ],
  [RESEARCH_TYPES.ARMOR_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 2 },
  ],
  [RESEARCH_TYPES.ENERGY_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 1 },
  ],
  [RESEARCH_TYPES.HYPERSPACE_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 7 },
    { research: RESEARCH_TYPES.ENERGY_TECH, researchLevel: 5 },
    { research: RESEARCH_TYPES.SHIELDING_TECH, researchLevel: 5 },
  ],
  [RESEARCH_TYPES.COMBUSTION_DRIVE]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 1 },
    { research: RESEARCH_TYPES.ENERGY_TECH, researchLevel: 1 },
  ],
  [RESEARCH_TYPES.IMPULSE_DRIVE]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 2 },
    { research: RESEARCH_TYPES.ENERGY_TECH, researchLevel: 1 },
  ],
  [RESEARCH_TYPES.HYPERSPACE_DRIVE]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 7 },
    { research: RESEARCH_TYPES.HYPERSPACE_TECH, researchLevel: 3 },
  ],
  [RESEARCH_TYPES.LASER_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 1 },
    { research: RESEARCH_TYPES.ENERGY_TECH, researchLevel: 2 },
  ],
  [RESEARCH_TYPES.ION_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 4 },
    { research: RESEARCH_TYPES.LASER_TECH, researchLevel: 5 },
    { research: RESEARCH_TYPES.ENERGY_TECH, researchLevel: 4 },
  ],
  [RESEARCH_TYPES.PLASMA_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 4 },
    { research: RESEARCH_TYPES.ENERGY_TECH, researchLevel: 8 },
    { research: RESEARCH_TYPES.LASER_TECH, researchLevel: 10 },
    { research: RESEARCH_TYPES.ION_TECH, researchLevel: 5 },
  ],
  [RESEARCH_TYPES.ASTROPHYSICS]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 3 },
    { research: RESEARCH_TYPES.ESPIONAGE_TECH, researchLevel: 4 },
    { research: RESEARCH_TYPES.IMPULSE_DRIVE, researchLevel: 3 },
  ],
  [RESEARCH_TYPES.RESEARCH_NETWORK]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 10 },
    { research: RESEARCH_TYPES.COMPUTER_TECH, researchLevel: 8 },
    { research: RESEARCH_TYPES.HYPERSPACE_TECH, researchLevel: 8 },
  ],
  [RESEARCH_TYPES.EXPEDITION_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 3 },
    { research: RESEARCH_TYPES.COMPUTER_TECH, researchLevel: 4 },
    { research: RESEARCH_TYPES.IMPULSE_DRIVE, researchLevel: 3 },
  ],
  [RESEARCH_TYPES.GRAVITON_TECH]: [
    { building: BUILDING_TYPES.RESEARCH_LAB, buildingLevel: 12 },
  ],
};

/**
 * Research names for display
 */
export const RESEARCH_NAMES: Record<string, string> = {
  [RESEARCH_TYPES.ESPIONAGE_TECH]: 'Espionage Technology',
  [RESEARCH_TYPES.COMPUTER_TECH]: 'Computer Technology',
  [RESEARCH_TYPES.WEAPONS_TECH]: 'Weapons Technology',
  [RESEARCH_TYPES.SHIELDING_TECH]: 'Shielding Technology',
  [RESEARCH_TYPES.ARMOR_TECH]: 'Armor Technology',
  [RESEARCH_TYPES.ENERGY_TECH]: 'Energy Technology',
  [RESEARCH_TYPES.HYPERSPACE_TECH]: 'Hyperspace Technology',
  [RESEARCH_TYPES.COMBUSTION_DRIVE]: 'Combustion Drive',
  [RESEARCH_TYPES.IMPULSE_DRIVE]: 'Impulse Drive',
  [RESEARCH_TYPES.HYPERSPACE_DRIVE]: 'Hyperspace Drive',
  [RESEARCH_TYPES.LASER_TECH]: 'Laser Technology',
  [RESEARCH_TYPES.ION_TECH]: 'Ion Technology',
  [RESEARCH_TYPES.PLASMA_TECH]: 'Plasma Technology',
  [RESEARCH_TYPES.ASTROPHYSICS]: 'Astrophysics',
  [RESEARCH_TYPES.RESEARCH_NETWORK]: 'Intergalactic Research Network',
  [RESEARCH_TYPES.EXPEDITION_TECH]: 'Expedition Technology',
  [RESEARCH_TYPES.GRAVITON_TECH]: 'Graviton Technology',
};

/**
 * Research descriptions
 */
export const RESEARCH_DESCRIPTIONS: Record<string, string> = {
  [RESEARCH_TYPES.ESPIONAGE_TECH]: 'Enables espionage missions and improves probe effectiveness. Each level allows viewing more enemy data.',
  [RESEARCH_TYPES.COMPUTER_TECH]: 'Increases maximum fleet slots. Each level adds one fleet slot.',
  [RESEARCH_TYPES.WEAPONS_TECH]: 'Increases ship and defense weapon strength by 10% per level.',
  [RESEARCH_TYPES.SHIELDING_TECH]: 'Increases ship and defense shield strength by 10% per level.',
  [RESEARCH_TYPES.ARMOR_TECH]: 'Increases ship and defense armor (hull) strength by 10% per level.',
  [RESEARCH_TYPES.ENERGY_TECH]: 'Required for advanced technologies and improves Fusion Reactor efficiency.',
  [RESEARCH_TYPES.HYPERSPACE_TECH]: 'Unlocks advanced ships and technologies. Required for hyperspace travel.',
  [RESEARCH_TYPES.COMBUSTION_DRIVE]: 'Propulsion system for small ships. Higher levels increase speed by 10% per level.',
  [RESEARCH_TYPES.IMPULSE_DRIVE]: 'Propulsion system for medium ships. Higher levels increase speed by 20% per level.',
  [RESEARCH_TYPES.HYPERSPACE_DRIVE]: 'Advanced propulsion for large ships. Higher levels increase speed by 30% per level.',
  [RESEARCH_TYPES.LASER_TECH]: 'Basic weapon technology. Required for laser weapons and defenses.',
  [RESEARCH_TYPES.ION_TECH]: 'Advanced weapon technology. Required for ion-based weapons.',
  [RESEARCH_TYPES.PLASMA_TECH]: 'Cutting-edge weapon technology. Provides massive damage bonuses.',
  [RESEARCH_TYPES.ASTROPHYSICS]: 'Unlocks additional planet colonization. Each 2 levels allows one additional planet.',
  [RESEARCH_TYPES.RESEARCH_NETWORK]: 'Links Research Labs across planets. Each level adds one lab to the network.',
  [RESEARCH_TYPES.EXPEDITION_TECH]: 'Enables expeditions to explore the unknown. Higher levels improve expedition rewards.',
  [RESEARCH_TYPES.GRAVITON_TECH]: 'Enables construction of the Death Star. Cannot be researched normally.',
};

// ============================================================================
// SHIP TYPES
// ============================================================================

export const SHIP_TYPES = {
  // Civil Ships
  SMALL_CARGO: 'smallCargo',
  LARGE_CARGO: 'largeCargo',
  COLONY_SHIP: 'colonyShip',
  RECYCLER: 'recycler',
  ESPIONAGE_PROBE: 'espionageProbe',

  // Combat Ships
  LIGHT_FIGHTER: 'lightFighter',
  HEAVY_FIGHTER: 'heavyFighter',
  CRUISER: 'cruiser',
  BATTLESHIP: 'battleship',
  BATTLECRUISER: 'battlecruiser',
  BOMBER: 'bomber',
  DESTROYER: 'destroyer',
  DEATHSTAR: 'deathstar',
} as const;

// ============================================================================
// SHIP COST FORMULAS
// ============================================================================

export interface ShipCost {
  metal: number;
  crystal: number;
  deuterium: number;
}

/**
 * Base costs for ships (cost per unit)
 */
export const BASE_SHIP_COSTS: Record<string, ShipCost> = {
  [SHIP_TYPES.SMALL_CARGO]: { metal: 2000, crystal: 2000, deuterium: 0 },
  [SHIP_TYPES.LARGE_CARGO]: { metal: 6000, crystal: 6000, deuterium: 0 },
  [SHIP_TYPES.LIGHT_FIGHTER]: { metal: 3000, crystal: 1000, deuterium: 0 },
  [SHIP_TYPES.HEAVY_FIGHTER]: { metal: 6000, crystal: 4000, deuterium: 0 },
  [SHIP_TYPES.CRUISER]: { metal: 20000, crystal: 7000, deuterium: 2000 },
  [SHIP_TYPES.BATTLESHIP]: { metal: 45000, crystal: 15000, deuterium: 0 },
  [SHIP_TYPES.COLONY_SHIP]: { metal: 10000, crystal: 20000, deuterium: 10000 },
  [SHIP_TYPES.RECYCLER]: { metal: 10000, crystal: 6000, deuterium: 2000 },
  [SHIP_TYPES.ESPIONAGE_PROBE]: { metal: 0, crystal: 1000, deuterium: 0 },
  [SHIP_TYPES.BOMBER]: { metal: 50000, crystal: 25000, deuterium: 15000 },
  [SHIP_TYPES.DESTROYER]: { metal: 60000, crystal: 50000, deuterium: 15000 },
  [SHIP_TYPES.DEATHSTAR]: { metal: 5000000, crystal: 4000000, deuterium: 1000000 },
  [SHIP_TYPES.BATTLECRUISER]: { metal: 30000, crystal: 40000, deuterium: 15000 },
};

// ============================================================================
// SHIP TIME FORMULAS
// ============================================================================

/**
 * Calculate ship construction time in seconds
 * Formula: (metal + crystal) / (2500 * (1 + shipyardLevel) * 2^naniteLevel) * universeSpeed
 *
 * @param cost - Ship cost
 * @param shipyardLevel - Shipyard level
 * @param naniteLevel - Nanite Factory level
 * @param universeSpeed - Universe speed multiplier (default: 1)
 */
export function calculateShipTime(
  cost: ShipCost,
  shipyardLevel: number,
  naniteLevel: number,
  universeSpeed: number = 1
): number {
  const totalCost = cost.metal + cost.crystal;
  const denominator = 2500 * (1 + shipyardLevel) * Math.pow(2, naniteLevel);
  const timeInHours = totalCost / denominator;
  const timeInSeconds = timeInHours * 3600;
  return Math.max(1, Math.floor(timeInSeconds / universeSpeed));
}

// ============================================================================
// SHIP PREREQUISITES
// ============================================================================

export interface ShipPrerequisite {
  building?: string;
  buildingLevel?: number;
  research?: string;
  researchLevel?: number;
}

/**
 * Ship prerequisites
 * Format: { shipType: [{ building/research: type, level: minimumLevel }] }
 */
export const SHIP_PREREQUISITES: Record<string, ShipPrerequisite[]> = {
  [SHIP_TYPES.SMALL_CARGO]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 2 },
    { research: RESEARCH_TYPES.COMBUSTION_DRIVE, researchLevel: 2 },
  ],
  [SHIP_TYPES.LARGE_CARGO]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 4 },
    { research: RESEARCH_TYPES.COMBUSTION_DRIVE, researchLevel: 6 },
  ],
  [SHIP_TYPES.LIGHT_FIGHTER]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 1 },
    { research: RESEARCH_TYPES.COMBUSTION_DRIVE, researchLevel: 1 },
  ],
  [SHIP_TYPES.HEAVY_FIGHTER]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 3 },
    { research: RESEARCH_TYPES.ARMOR_TECH, researchLevel: 2 },
    { research: RESEARCH_TYPES.IMPULSE_DRIVE, researchLevel: 2 },
  ],
  [SHIP_TYPES.CRUISER]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 5 },
    { research: RESEARCH_TYPES.IMPULSE_DRIVE, researchLevel: 4 },
    { research: RESEARCH_TYPES.ION_TECH, researchLevel: 2 },
  ],
  [SHIP_TYPES.BATTLESHIP]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 7 },
    { research: RESEARCH_TYPES.HYPERSPACE_DRIVE, researchLevel: 4 },
  ],
  [SHIP_TYPES.COLONY_SHIP]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 4 },
    { research: RESEARCH_TYPES.IMPULSE_DRIVE, researchLevel: 3 },
  ],
  [SHIP_TYPES.RECYCLER]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 4 },
    { research: RESEARCH_TYPES.COMBUSTION_DRIVE, researchLevel: 6 },
    { research: RESEARCH_TYPES.SHIELDING_TECH, researchLevel: 2 },
  ],
  [SHIP_TYPES.ESPIONAGE_PROBE]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 3 },
    { research: RESEARCH_TYPES.COMBUSTION_DRIVE, researchLevel: 3 },
    { research: RESEARCH_TYPES.ESPIONAGE_TECH, researchLevel: 2 },
  ],
  [SHIP_TYPES.BOMBER]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 8 },
    { research: RESEARCH_TYPES.IMPULSE_DRIVE, researchLevel: 6 },
    { research: RESEARCH_TYPES.PLASMA_TECH, researchLevel: 5 },
  ],
  [SHIP_TYPES.DESTROYER]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 9 },
    { research: RESEARCH_TYPES.HYPERSPACE_DRIVE, researchLevel: 6 },
    { research: RESEARCH_TYPES.HYPERSPACE_TECH, researchLevel: 5 },
  ],
  [SHIP_TYPES.DEATHSTAR]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 12 },
    { research: RESEARCH_TYPES.HYPERSPACE_DRIVE, researchLevel: 7 },
    { research: RESEARCH_TYPES.HYPERSPACE_TECH, researchLevel: 6 },
    { research: RESEARCH_TYPES.GRAVITON_TECH, researchLevel: 1 },
  ],
  [SHIP_TYPES.BATTLECRUISER]: [
    { building: BUILDING_TYPES.SHIPYARD, buildingLevel: 8 },
    { research: RESEARCH_TYPES.HYPERSPACE_DRIVE, researchLevel: 5 },
    { research: RESEARCH_TYPES.LASER_TECH, researchLevel: 12 },
  ],
};

/**
 * Ship names for display
 */
export const SHIP_NAMES: Record<string, string> = {
  [SHIP_TYPES.SMALL_CARGO]: 'Small Cargo Ship',
  [SHIP_TYPES.LARGE_CARGO]: 'Large Cargo Ship',
  [SHIP_TYPES.LIGHT_FIGHTER]: 'Light Fighter',
  [SHIP_TYPES.HEAVY_FIGHTER]: 'Heavy Fighter',
  [SHIP_TYPES.CRUISER]: 'Cruiser',
  [SHIP_TYPES.BATTLESHIP]: 'Battleship',
  [SHIP_TYPES.COLONY_SHIP]: 'Colony Ship',
  [SHIP_TYPES.RECYCLER]: 'Recycler',
  [SHIP_TYPES.ESPIONAGE_PROBE]: 'Espionage Probe',
  [SHIP_TYPES.BOMBER]: 'Bomber',
  [SHIP_TYPES.DESTROYER]: 'Destroyer',
  [SHIP_TYPES.DEATHSTAR]: 'Death Star',
  [SHIP_TYPES.BATTLECRUISER]: 'Battlecruiser',
};

/**
 * Ship descriptions
 */
export const SHIP_DESCRIPTIONS: Record<string, string> = {
  [SHIP_TYPES.SMALL_CARGO]: 'Basic transport ship with moderate cargo capacity. Essential for resource transport.',
  [SHIP_TYPES.LARGE_CARGO]: 'Heavy transport ship with large cargo capacity. More efficient for bulk transport.',
  [SHIP_TYPES.LIGHT_FIGHTER]: 'Fast and cheap combat ship. Effective in large numbers against lightly defended targets.',
  [SHIP_TYPES.HEAVY_FIGHTER]: 'Stronger combat ship with better armor and weapons. Versatile fighter.',
  [SHIP_TYPES.CRUISER]: 'Advanced combat ship with ion cannons. Excellent against light fighters.',
  [SHIP_TYPES.BATTLESHIP]: 'Heavy combat ship with powerful weapons. The backbone of any fleet.',
  [SHIP_TYPES.COLONY_SHIP]: 'Allows colonization of new planets. Required to expand your empire.',
  [SHIP_TYPES.RECYCLER]: 'Harvests debris fields after battles. Essential for resource recovery.',
  [SHIP_TYPES.ESPIONAGE_PROBE]: 'Unmanned probe for gathering intelligence. Cannot engage in combat.',
  [SHIP_TYPES.BOMBER]: 'Specialized ship designed to destroy planetary defenses and buildings.',
  [SHIP_TYPES.DESTROYER]: 'Advanced warship with powerful weapons. Effective against battleships.',
  [SHIP_TYPES.DEATHSTAR]: 'Ultimate weapon capable of destroying entire planets. Extremely expensive.',
  [SHIP_TYPES.BATTLECRUISER]: 'Fast heavy combat ship. Combines firepower with mobility.',
};

/**
 * Ship cargo capacity
 */
export const SHIP_CARGO_CAPACITY: Record<string, number> = {
  [SHIP_TYPES.SMALL_CARGO]: 5000,
  [SHIP_TYPES.LARGE_CARGO]: 25000,
  [SHIP_TYPES.LIGHT_FIGHTER]: 50,
  [SHIP_TYPES.HEAVY_FIGHTER]: 100,
  [SHIP_TYPES.CRUISER]: 800,
  [SHIP_TYPES.BATTLESHIP]: 1500,
  [SHIP_TYPES.COLONY_SHIP]: 7500,
  [SHIP_TYPES.RECYCLER]: 20000,
  [SHIP_TYPES.ESPIONAGE_PROBE]: 0,
  [SHIP_TYPES.BOMBER]: 500,
  [SHIP_TYPES.DESTROYER]: 2000,
  [SHIP_TYPES.DEATHSTAR]: 1000000,
  [SHIP_TYPES.BATTLECRUISER]: 750,
};

/**
 * Ship speeds (base speed)
 */
export const SHIP_SPEEDS: Record<string, number> = {
  [SHIP_TYPES.SMALL_CARGO]: 5000,
  [SHIP_TYPES.LARGE_CARGO]: 7500,
  [SHIP_TYPES.LIGHT_FIGHTER]: 12500,
  [SHIP_TYPES.HEAVY_FIGHTER]: 10000,
  [SHIP_TYPES.CRUISER]: 15000,
  [SHIP_TYPES.BATTLESHIP]: 10000,
  [SHIP_TYPES.COLONY_SHIP]: 2500,
  [SHIP_TYPES.RECYCLER]: 2000,
  [SHIP_TYPES.ESPIONAGE_PROBE]: 100000000,
  [SHIP_TYPES.BOMBER]: 4000,
  [SHIP_TYPES.DESTROYER]: 5000,
  [SHIP_TYPES.DEATHSTAR]: 100,
  [SHIP_TYPES.BATTLECRUISER]: 10000,
};

/**
 * Ship fuel consumption (deuterium per unit distance)
 */
export const SHIP_FUEL_CONSUMPTION: Record<string, number> = {
  [SHIP_TYPES.SMALL_CARGO]: 10,
  [SHIP_TYPES.LARGE_CARGO]: 50,
  [SHIP_TYPES.LIGHT_FIGHTER]: 20,
  [SHIP_TYPES.HEAVY_FIGHTER]: 75,
  [SHIP_TYPES.CRUISER]: 300,
  [SHIP_TYPES.BATTLESHIP]: 500,
  [SHIP_TYPES.COLONY_SHIP]: 1000,
  [SHIP_TYPES.RECYCLER]: 300,
  [SHIP_TYPES.ESPIONAGE_PROBE]: 1,
  [SHIP_TYPES.BOMBER]: 700,
  [SHIP_TYPES.DESTROYER]: 1000,
  [SHIP_TYPES.DEATHSTAR]: 1,
  [SHIP_TYPES.BATTLECRUISER]: 250,
};

// ============================================================================
// MISSION TYPES
// ============================================================================

export const MISSION_TYPES = {
  TRANSPORT: 'transport',
  DEPLOY: 'deploy',
  ATTACK: 'attack',
  ESPIONAGE: 'espionage',
  COLONIZE: 'colonize',
  RECYCLE: 'recycle',
  DESTROY: 'destroy',
} as const;

export const MISSION_NAMES: Record<string, string> = {
  [MISSION_TYPES.TRANSPORT]: 'Transport',
  [MISSION_TYPES.DEPLOY]: 'Deploy',
  [MISSION_TYPES.ATTACK]: 'Attack',
  [MISSION_TYPES.ESPIONAGE]: 'Espionage',
  [MISSION_TYPES.COLONIZE]: 'Colonize',
  [MISSION_TYPES.RECYCLE]: 'Recycle Debris',
  [MISSION_TYPES.DESTROY]: 'Destroy',
};

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
