/**
 * Resource Calculator for Lunaris
 * Handles all resource production, energy balance, and accumulation calculations
 */

import {
  BUILDING_TYPES,
  calculateMetalProduction,
  calculateCrystalProduction,
  calculateDeuteriumProduction,
  calculateMetalEnergyConsumption,
  calculateCrystalEnergyConsumption,
  calculateDeuteriumEnergyConsumption,
  calculateSolarPlantProduction,
  calculateFusionReactorProduction,
  calculateFusionReactorConsumption,
  calculateMetalStorageCapacity,
  calculateCrystalStorageCapacity,
  calculateDeuteriumStorageCapacity,
  type ProductionRates,
  type EnergyBalance,
} from './constants';

// Types for calculator inputs
export interface BuildingData {
  type: string;
  level: number;
}

export interface ResourceData {
  metal: number;
  crystal: number;
  deuterium: number;
  energy: number;
  lastUpdate: Date;
}

export interface PlanetData {
  temperature: number;
  buildings: BuildingData[];
  resources: ResourceData;
}

export interface CalculatedResources {
  metal: number;
  crystal: number;
  deuterium: number;
  energy: number;
  productionRates: ProductionRates;
  storageCapacity: {
    metal: number;
    crystal: number;
    deuterium: number;
  };
  energyBalance: EnergyBalance;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get building level by type from buildings array
 */
function getBuildingLevel(buildings: BuildingData[], type: string): number {
  const building = buildings.find((b) => b.type === type);
  return building?.level ?? 0;
}

/**
 * Calculate energy balance (production vs consumption)
 */
export function calculateEnergyBalance(
  buildings: BuildingData[],
  energyTechLevel: number = 0
): EnergyBalance {
  const solarPlantLevel = getBuildingLevel(buildings, BUILDING_TYPES.SOLAR_PLANT);
  const fusionReactorLevel = getBuildingLevel(buildings, BUILDING_TYPES.FUSION_REACTOR);
  const metalMineLevel = getBuildingLevel(buildings, BUILDING_TYPES.METAL_MINE);
  const crystalMineLevel = getBuildingLevel(buildings, BUILDING_TYPES.CRYSTAL_MINE);
  const deuteriumSynthLevel = getBuildingLevel(buildings, BUILDING_TYPES.DEUTERIUM_SYNTHESIZER);

  // Energy production
  const solarProduction = calculateSolarPlantProduction(solarPlantLevel);
  const fusionProduction = calculateFusionReactorProduction(fusionReactorLevel, energyTechLevel);
  const totalProduction = solarProduction + fusionProduction;

  // Energy consumption
  const metalConsumption = calculateMetalEnergyConsumption(metalMineLevel);
  const crystalConsumption = calculateCrystalEnergyConsumption(crystalMineLevel);
  const deuteriumConsumption = calculateDeuteriumEnergyConsumption(deuteriumSynthLevel);
  const totalConsumption = metalConsumption + crystalConsumption + deuteriumConsumption;

  // Calculate efficiency (mines run at reduced capacity if energy is negative)
  const available = totalProduction - totalConsumption;
  let efficiency = 1.0;

  if (available < 0 && totalConsumption > 0) {
    // Proportional shutdown: efficiency = production / consumption
    efficiency = totalProduction / totalConsumption;
  }

  return {
    production: totalProduction,
    consumption: totalConsumption,
    available,
    efficiency: Math.max(0, Math.min(1, efficiency)),
  };
}

/**
 * Calculate production rates per hour
 */
export function calculateProductionRates(
  planet: PlanetData,
  energyTechLevel: number = 0
): ProductionRates {
  const { buildings, temperature } = planet;

  const metalMineLevel = getBuildingLevel(buildings, BUILDING_TYPES.METAL_MINE);
  const crystalMineLevel = getBuildingLevel(buildings, BUILDING_TYPES.CRYSTAL_MINE);
  const deuteriumSynthLevel = getBuildingLevel(buildings, BUILDING_TYPES.DEUTERIUM_SYNTHESIZER);
  const fusionReactorLevel = getBuildingLevel(buildings, BUILDING_TYPES.FUSION_REACTOR);

  // Calculate base production
  let metalProduction = calculateMetalProduction(metalMineLevel);
  let crystalProduction = calculateCrystalProduction(crystalMineLevel);
  let deuteriumProduction = calculateDeuteriumProduction(deuteriumSynthLevel, temperature);

  // Calculate energy balance
  const energyBalance = calculateEnergyBalance(buildings, energyTechLevel);

  // Apply energy efficiency (reduce production if not enough energy)
  if (energyBalance.efficiency < 1) {
    metalProduction = Math.floor(metalProduction * energyBalance.efficiency);
    crystalProduction = Math.floor(crystalProduction * energyBalance.efficiency);
    deuteriumProduction = Math.floor(deuteriumProduction * energyBalance.efficiency);
  }

  // Fusion reactor consumes deuterium
  const fusionConsumption = calculateFusionReactorConsumption(fusionReactorLevel);
  deuteriumProduction -= fusionConsumption;

  return {
    metal: metalProduction,
    crystal: crystalProduction,
    deuterium: deuteriumProduction,
    energy: energyBalance.available,
  };
}

/**
 * Calculate storage capacity
 */
export function calculateStorageCapacity(buildings: BuildingData[]): {
  metal: number;
  crystal: number;
  deuterium: number;
} {
  const metalStorageLevel = getBuildingLevel(buildings, BUILDING_TYPES.METAL_STORAGE);
  const crystalStorageLevel = getBuildingLevel(buildings, BUILDING_TYPES.CRYSTAL_STORAGE);
  const deuteriumTankLevel = getBuildingLevel(buildings, BUILDING_TYPES.DEUTERIUM_TANK);

  return {
    metal: calculateMetalStorageCapacity(metalStorageLevel),
    crystal: calculateCrystalStorageCapacity(crystalStorageLevel),
    deuterium: calculateDeuteriumStorageCapacity(deuteriumTankLevel),
  };
}

/**
 * Calculate accumulated resources since last update
 */
export function calculateAccumulatedResources(
  currentResources: ResourceData,
  productionRates: ProductionRates,
  storageCapacity: { metal: number; crystal: number; deuterium: number },
  timeSinceLastUpdate: number // in seconds
): { metal: number; crystal: number; deuterium: number } {
  // Convert production rates from per hour to per second
  const metalPerSecond = productionRates.metal / 3600;
  const crystalPerSecond = productionRates.crystal / 3600;
  const deuteriumPerSecond = productionRates.deuterium / 3600;

  // Calculate accumulated amounts
  const metalAccumulated = metalPerSecond * timeSinceLastUpdate;
  const crystalAccumulated = crystalPerSecond * timeSinceLastUpdate;
  const deuteriumAccumulated = deuteriumPerSecond * timeSinceLastUpdate;

  // Add to current resources
  let newMetal = currentResources.metal + metalAccumulated;
  let newCrystal = currentResources.crystal + crystalAccumulated;
  let newDeuterium = currentResources.deuterium + deuteriumAccumulated;

  // Apply storage caps
  newMetal = Math.min(newMetal, storageCapacity.metal);
  newCrystal = Math.min(newCrystal, storageCapacity.crystal);
  newDeuterium = Math.min(newDeuterium, storageCapacity.deuterium);

  // Ensure non-negative
  newMetal = Math.max(0, newMetal);
  newCrystal = Math.max(0, newCrystal);
  newDeuterium = Math.max(0, newDeuterium);

  return {
    metal: newMetal,
    crystal: newCrystal,
    deuterium: newDeuterium,
  };
}

/**
 * Main function: Calculate current resources for a planet
 * This performs a full calculation including time-based accumulation
 */
export function calculateCurrentResources(
  planet: PlanetData,
  energyTechLevel: number = 0,
  currentTime: Date = new Date()
): CalculatedResources {
  // Calculate production rates
  const productionRates = calculateProductionRates(planet, energyTechLevel);

  // Calculate storage capacity
  const storageCapacity = calculateStorageCapacity(planet.buildings);

  // Calculate energy balance
  const energyBalance = calculateEnergyBalance(planet.buildings, energyTechLevel);

  // Calculate time since last update (in seconds)
  const lastUpdate = new Date(planet.resources.lastUpdate);
  const timeSinceLastUpdate = Math.max(0, (currentTime.getTime() - lastUpdate.getTime()) / 1000);

  // Calculate accumulated resources
  const updatedResources = calculateAccumulatedResources(
    planet.resources,
    productionRates,
    storageCapacity,
    timeSinceLastUpdate
  );

  return {
    metal: updatedResources.metal,
    crystal: updatedResources.crystal,
    deuterium: updatedResources.deuterium,
    energy: energyBalance.available,
    productionRates,
    storageCapacity,
    energyBalance,
  };
}

/**
 * Utility function to format production rate for display
 */
export function formatProductionRate(rate: number): string {
  if (rate >= 1000000) {
    return `${(rate / 1000000).toFixed(2)}M/h`;
  } else if (rate >= 1000) {
    return `${(rate / 1000).toFixed(1)}K/h`;
  } else {
    return `${Math.floor(rate)}/h`;
  }
}

/**
 * Utility function to format resource amount for display
 */
export function formatResourceAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  } else {
    return Math.floor(amount).toLocaleString();
  }
}
