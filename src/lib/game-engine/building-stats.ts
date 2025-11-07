/**
 * Building Stats Calculator
 * Calculates current and next level production/consumption for buildings
 */

import {
  calculateMetalProduction,
  calculateCrystalProduction,
  calculateDeuteriumProduction,
  calculateMetalEnergyConsumption,
  calculateCrystalEnergyConsumption,
  calculateDeuteriumEnergyConsumption,
  calculateSolarPlantProduction,
  calculateFusionReactorProduction,
  calculateMetalStorageCapacity,
  calculateCrystalStorageCapacity,
  calculateDeuteriumStorageCapacity,
  BUILDING_TYPES,
} from './constants';

export interface BuildingStats {
  currentProduction?: number;
  nextProduction?: number;
  currentConsumption?: number;
  nextConsumption?: number;
  currentCapacity?: number;
  nextCapacity?: number;
  productionType?: 'metal' | 'crystal' | 'deuterium' | 'energy';
  capacityType?: 'metal' | 'crystal' | 'deuterium';
}

/**
 * Get building statistics for current and next level
 */
export function getBuildingStats(
  buildingType: string,
  currentLevel: number,
  temperature: number = 20,
  energyTechLevel: number = 0
): BuildingStats {
  const stats: BuildingStats = {};

  switch (buildingType) {
    // Resource Production Buildings
    case BUILDING_TYPES.METAL_MINE:
      stats.currentProduction = calculateMetalProduction(currentLevel);
      stats.nextProduction = calculateMetalProduction(currentLevel + 1);
      stats.currentConsumption = calculateMetalEnergyConsumption(currentLevel);
      stats.nextConsumption = calculateMetalEnergyConsumption(currentLevel + 1);
      stats.productionType = 'metal';
      break;

    case BUILDING_TYPES.CRYSTAL_MINE:
      stats.currentProduction = calculateCrystalProduction(currentLevel);
      stats.nextProduction = calculateCrystalProduction(currentLevel + 1);
      stats.currentConsumption = calculateCrystalEnergyConsumption(currentLevel);
      stats.nextConsumption = calculateCrystalEnergyConsumption(currentLevel + 1);
      stats.productionType = 'crystal';
      break;

    case BUILDING_TYPES.DEUTERIUM_SYNTHESIZER:
      stats.currentProduction = calculateDeuteriumProduction(currentLevel, temperature);
      stats.nextProduction = calculateDeuteriumProduction(currentLevel + 1, temperature);
      stats.currentConsumption = calculateDeuteriumEnergyConsumption(currentLevel);
      stats.nextConsumption = calculateDeuteriumEnergyConsumption(currentLevel + 1);
      stats.productionType = 'deuterium';
      break;

    // Energy Production Buildings
    case BUILDING_TYPES.SOLAR_PLANT:
      stats.currentProduction = calculateSolarPlantProduction(currentLevel);
      stats.nextProduction = calculateSolarPlantProduction(currentLevel + 1);
      stats.productionType = 'energy';
      break;

    case BUILDING_TYPES.FUSION_REACTOR:
      stats.currentProduction = calculateFusionReactorProduction(currentLevel, energyTechLevel);
      stats.nextProduction = calculateFusionReactorProduction(currentLevel + 1, energyTechLevel);
      stats.productionType = 'energy';
      break;

    // Storage Buildings
    case BUILDING_TYPES.METAL_STORAGE:
      stats.currentCapacity = calculateMetalStorageCapacity(currentLevel);
      stats.nextCapacity = calculateMetalStorageCapacity(currentLevel + 1);
      stats.capacityType = 'metal';
      break;

    case BUILDING_TYPES.CRYSTAL_STORAGE:
      stats.currentCapacity = calculateCrystalStorageCapacity(currentLevel);
      stats.nextCapacity = calculateCrystalStorageCapacity(currentLevel + 1);
      stats.capacityType = 'crystal';
      break;

    case BUILDING_TYPES.DEUTERIUM_TANK:
      stats.currentCapacity = calculateDeuteriumStorageCapacity(currentLevel);
      stats.nextCapacity = calculateDeuteriumStorageCapacity(currentLevel + 1);
      stats.capacityType = 'deuterium';
      break;
  }

  return stats;
}

/**
 * Format production/consumption for display
 */
export function formatStat(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return Math.floor(value).toLocaleString();
  }
}

/**
 * Get color class for resource type
 */
export function getResourceColor(type: string): string {
  switch (type) {
    case 'metal':
      return 'text-metal';
    case 'crystal':
      return 'text-crystal';
    case 'deuterium':
      return 'text-deuterium';
    case 'energy':
      return 'text-energy';
    default:
      return 'text-gray-400';
  }
}
