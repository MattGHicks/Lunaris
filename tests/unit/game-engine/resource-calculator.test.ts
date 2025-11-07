import { describe, it, expect } from 'vitest';
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
} from '@/lib/game-engine/constants';
import {
  calculateEnergyBalance,
  calculateProductionRates,
  calculateStorageCapacity,
  calculateAccumulatedResources,
  calculateCurrentResources,
  type BuildingData,
  type PlanetData,
} from '@/lib/game-engine/resource-calculator';

describe('Resource Production Formulas', () => {
  describe('Metal Mine', () => {
    it('should return base production at level 0', () => {
      expect(calculateMetalProduction(0)).toBe(30);
    });

    it('should calculate production for level 1', () => {
      const production = calculateMetalProduction(1);
      expect(production).toBeGreaterThan(30);
    });

    it('should scale exponentially with level', () => {
      const level1 = calculateMetalProduction(1);
      const level5 = calculateMetalProduction(5);
      const level10 = calculateMetalProduction(10);

      expect(level5).toBeGreaterThan(level1 * 4);
      expect(level10).toBeGreaterThan(level5 * 3);
    });
  });

  describe('Crystal Mine', () => {
    it('should return base production at level 0', () => {
      expect(calculateCrystalProduction(0)).toBe(15);
    });

    it('should calculate production for level 1', () => {
      const production = calculateCrystalProduction(1);
      expect(production).toBeGreaterThan(15);
    });

    it('should scale exponentially with level', () => {
      const level1 = calculateCrystalProduction(1);
      const level5 = calculateCrystalProduction(5);
      const level10 = calculateCrystalProduction(10);

      expect(level5).toBeGreaterThan(level1 * 4);
      expect(level10).toBeGreaterThan(level5 * 3);
    });
  });

  describe('Deuterium Synthesizer', () => {
    it('should return 0 at level 0', () => {
      expect(calculateDeuteriumProduction(0, 20)).toBe(0);
    });

    it('should be affected by temperature (cold = better)', () => {
      const level = 5;
      const coldPlanet = calculateDeuteriumProduction(level, -50);
      const hotPlanet = calculateDeuteriumProduction(level, 100);

      expect(coldPlanet).toBeGreaterThan(hotPlanet);
    });

    it('should scale exponentially with level', () => {
      const temp = 20;
      const level1 = calculateDeuteriumProduction(1, temp);
      const level5 = calculateDeuteriumProduction(5, temp);
      const level10 = calculateDeuteriumProduction(10, temp);

      expect(level5).toBeGreaterThan(level1 * 4);
      expect(level10).toBeGreaterThan(level5 * 3);
    });
  });
});

describe('Energy Formulas', () => {
  describe('Energy Consumption', () => {
    it('should be 0 at level 0 for all mines', () => {
      expect(calculateMetalEnergyConsumption(0)).toBe(0);
      expect(calculateCrystalEnergyConsumption(0)).toBe(0);
      expect(calculateDeuteriumEnergyConsumption(0)).toBe(0);
    });

    it('should increase with mine level', () => {
      const metalLevel1 = calculateMetalEnergyConsumption(1);
      const metalLevel5 = calculateMetalEnergyConsumption(5);
      expect(metalLevel5).toBeGreaterThan(metalLevel1);
    });

    it('should consume more energy for deuterium synthesizer', () => {
      const level = 5;
      const metalEnergy = calculateMetalEnergyConsumption(level);
      const deutEnergy = calculateDeuteriumEnergyConsumption(level);
      expect(deutEnergy).toBeGreaterThan(metalEnergy);
    });
  });

  describe('Solar Plant Production', () => {
    it('should produce energy based on level', () => {
      const level1 = calculateSolarPlantProduction(1);
      const level5 = calculateSolarPlantProduction(5);
      const level10 = calculateSolarPlantProduction(10);

      expect(level1).toBeGreaterThan(0);
      expect(level5).toBeGreaterThan(level1);
      expect(level10).toBeGreaterThan(level5);
    });
  });

  describe('Fusion Reactor Production', () => {
    it('should return 0 at level 0', () => {
      expect(calculateFusionReactorProduction(0, 0)).toBe(0);
    });

    it('should increase with energy technology', () => {
      const level = 5;
      const noTech = calculateFusionReactorProduction(level, 0);
      const withTech = calculateFusionReactorProduction(level, 10);
      expect(withTech).toBeGreaterThan(noTech);
    });
  });
});

describe('Storage Capacity', () => {
  it('should have base capacity of 10,000 at level 0', () => {
    expect(calculateMetalStorageCapacity(0)).toBe(10000);
    expect(calculateCrystalStorageCapacity(0)).toBe(10000);
    expect(calculateDeuteriumStorageCapacity(0)).toBe(10000);
  });

  it('should increase capacity with storage building level', () => {
    const level0 = calculateMetalStorageCapacity(0);
    const level1 = calculateMetalStorageCapacity(1);
    const level5 = calculateMetalStorageCapacity(5);

    expect(level1).toBeGreaterThan(level0);
    expect(level5).toBeGreaterThan(level1);
  });

  it('should grow exponentially', () => {
    const level1 = calculateMetalStorageCapacity(1);
    const level10 = calculateMetalStorageCapacity(10);
    expect(level10).toBeGreaterThan(level1 * 10);
  });
});

describe('Energy Balance Calculator', () => {
  it('should calculate positive energy balance when production > consumption', () => {
    const buildings: BuildingData[] = [
      { type: 'solarPlant', level: 5 },
      { type: 'metalMine', level: 1 },
      { type: 'crystalMine', level: 1 },
    ];

    const balance = calculateEnergyBalance(buildings, 0);
    expect(balance.production).toBeGreaterThan(balance.consumption);
    expect(balance.available).toBeGreaterThan(0);
    expect(balance.efficiency).toBe(1);
  });

  it('should calculate negative energy balance when consumption > production', () => {
    const buildings: BuildingData[] = [
      { type: 'solarPlant', level: 1 },
      { type: 'metalMine', level: 10 },
      { type: 'crystalMine', level: 10 },
    ];

    const balance = calculateEnergyBalance(buildings, 0);
    expect(balance.consumption).toBeGreaterThan(balance.production);
    expect(balance.available).toBeLessThan(0);
    expect(balance.efficiency).toBeLessThan(1);
    expect(balance.efficiency).toBeGreaterThan(0);
  });

  it('should set efficiency to 1 when energy is positive', () => {
    const buildings: BuildingData[] = [
      { type: 'solarPlant', level: 10 },
      { type: 'metalMine', level: 1 },
    ];

    const balance = calculateEnergyBalance(buildings, 0);
    expect(balance.efficiency).toBe(1);
  });
});

describe('Production Rates Calculator', () => {
  it('should calculate production rates for all resources', () => {
    const planet: PlanetData = {
      temperature: 20,
      buildings: [
        { type: 'metalMine', level: 5 },
        { type: 'crystalMine', level: 5 },
        { type: 'deuteriumSynthesizer', level: 5 },
        { type: 'solarPlant', level: 10 },
      ],
      resources: {
        metal: 1000,
        crystal: 1000,
        deuterium: 1000,
        energy: 0,
        lastUpdate: new Date(),
      },
    };

    const rates = calculateProductionRates(planet, 0);
    expect(rates.metal).toBeGreaterThan(0);
    expect(rates.crystal).toBeGreaterThan(0);
    expect(rates.deuterium).toBeGreaterThan(0);
    expect(rates.energy).toBeGreaterThan(0);
  });

  it('should reduce production when energy is negative', () => {
    const planetWithEnergy: PlanetData = {
      temperature: 20,
      buildings: [
        { type: 'metalMine', level: 5 },
        { type: 'solarPlant', level: 10 },
      ],
      resources: {
        metal: 1000,
        crystal: 1000,
        deuterium: 1000,
        energy: 0,
        lastUpdate: new Date(),
      },
    };

    const planetWithoutEnergy: PlanetData = {
      temperature: 20,
      buildings: [
        { type: 'metalMine', level: 5 },
        { type: 'solarPlant', level: 1 },
      ],
      resources: {
        metal: 1000,
        crystal: 1000,
        deuterium: 1000,
        energy: 0,
        lastUpdate: new Date(),
      },
    };

    const ratesWithEnergy = calculateProductionRates(planetWithEnergy, 0);
    const ratesWithoutEnergy = calculateProductionRates(planetWithoutEnergy, 0);

    expect(ratesWithoutEnergy.metal).toBeLessThan(ratesWithEnergy.metal);
  });

  it('should return base production when mines are level 0', () => {
    const planet: PlanetData = {
      temperature: 20,
      buildings: [],
      resources: {
        metal: 1000,
        crystal: 1000,
        deuterium: 1000,
        energy: 0,
        lastUpdate: new Date(),
      },
    };

    const rates = calculateProductionRates(planet, 0);
    expect(rates.metal).toBe(30); // Base metal production
    expect(rates.crystal).toBe(15); // Base crystal production
    expect(rates.deuterium).toBe(0); // No base deuterium
  });
});

describe('Storage Capacity Calculator', () => {
  it('should return base storage capacity when no storage buildings', () => {
    const buildings: BuildingData[] = [];
    const capacity = calculateStorageCapacity(buildings);

    expect(capacity.metal).toBe(10000);
    expect(capacity.crystal).toBe(10000);
    expect(capacity.deuterium).toBe(10000);
  });

  it('should increase capacity with storage buildings', () => {
    const buildings: BuildingData[] = [
      { type: 'metalStorage', level: 5 },
      { type: 'crystalStorage', level: 5 },
      { type: 'deuteriumTank', level: 5 },
    ];

    const capacity = calculateStorageCapacity(buildings);
    expect(capacity.metal).toBeGreaterThan(10000);
    expect(capacity.crystal).toBeGreaterThan(10000);
    expect(capacity.deuterium).toBeGreaterThan(10000);
  });
});

describe('Resource Accumulation', () => {
  it('should accumulate resources over time', () => {
    const currentResources = {
      metal: 1000,
      crystal: 500,
      deuterium: 200,
      energy: 0,
      lastUpdate: new Date(),
    };

    const productionRates = {
      metal: 360, // 360 per hour = 0.1 per second
      crystal: 180, // 180 per hour = 0.05 per second
      deuterium: 90, // 90 per hour = 0.025 per second
      energy: 100,
    };

    const storageCapacity = {
      metal: 50000,
      crystal: 50000,
      deuterium: 50000,
    };

    const timeSinceLastUpdate = 3600; // 1 hour in seconds

    const accumulated = calculateAccumulatedResources(
      currentResources,
      productionRates,
      storageCapacity,
      timeSinceLastUpdate
    );

    expect(accumulated.metal).toBeCloseTo(1360, 0);
    expect(accumulated.crystal).toBeCloseTo(680, 0);
    expect(accumulated.deuterium).toBeCloseTo(290, 0);
  });

  it('should cap resources at storage capacity', () => {
    const currentResources = {
      metal: 9900,
      crystal: 9900,
      deuterium: 9900,
      energy: 0,
      lastUpdate: new Date(),
    };

    const productionRates = {
      metal: 3600,
      crystal: 3600,
      deuterium: 3600,
      energy: 100,
    };

    const storageCapacity = {
      metal: 10000,
      crystal: 10000,
      deuterium: 10000,
    };

    const timeSinceLastUpdate = 3600; // 1 hour

    const accumulated = calculateAccumulatedResources(
      currentResources,
      productionRates,
      storageCapacity,
      timeSinceLastUpdate
    );

    expect(accumulated.metal).toBe(10000);
    expect(accumulated.crystal).toBe(10000);
    expect(accumulated.deuterium).toBe(10000);
  });

  it('should not allow negative resources', () => {
    const currentResources = {
      metal: 100,
      crystal: 100,
      deuterium: 100,
      energy: 0,
      lastUpdate: new Date(),
    };

    const productionRates = {
      metal: -3600, // Negative production
      crystal: -3600,
      deuterium: -3600,
      energy: 100,
    };

    const storageCapacity = {
      metal: 10000,
      crystal: 10000,
      deuterium: 10000,
    };

    const timeSinceLastUpdate = 3600;

    const accumulated = calculateAccumulatedResources(
      currentResources,
      productionRates,
      storageCapacity,
      timeSinceLastUpdate
    );

    expect(accumulated.metal).toBeGreaterThanOrEqual(0);
    expect(accumulated.crystal).toBeGreaterThanOrEqual(0);
    expect(accumulated.deuterium).toBeGreaterThanOrEqual(0);
  });

  it('should handle zero time delta', () => {
    const currentResources = {
      metal: 1000,
      crystal: 500,
      deuterium: 200,
      energy: 0,
      lastUpdate: new Date(),
    };

    const productionRates = {
      metal: 360,
      crystal: 180,
      deuterium: 90,
      energy: 100,
    };

    const storageCapacity = {
      metal: 50000,
      crystal: 50000,
      deuterium: 50000,
    };

    const accumulated = calculateAccumulatedResources(
      currentResources,
      productionRates,
      storageCapacity,
      0
    );

    expect(accumulated.metal).toBe(1000);
    expect(accumulated.crystal).toBe(500);
    expect(accumulated.deuterium).toBe(200);
  });
});

describe('Full Resource Calculation', () => {
  it('should calculate all resource data for a planet', () => {
    const planet: PlanetData = {
      temperature: 20,
      buildings: [
        { type: 'metalMine', level: 5 },
        { type: 'crystalMine', level: 5 },
        { type: 'deuteriumSynthesizer', level: 3 },
        { type: 'solarPlant', level: 10 },
      ],
      resources: {
        metal: 1000,
        crystal: 500,
        deuterium: 200,
        energy: 0,
        lastUpdate: new Date(Date.now() - 3600000), // 1 hour ago
      },
    };

    const result = calculateCurrentResources(planet, 0, new Date());

    expect(result.metal).toBeGreaterThan(1000);
    expect(result.crystal).toBeGreaterThan(500);
    expect(result.deuterium).toBeGreaterThan(200);
    expect(result.productionRates).toBeDefined();
    expect(result.storageCapacity).toBeDefined();
    expect(result.energyBalance).toBeDefined();
  });

  it('should handle planet with no buildings', () => {
    const planet: PlanetData = {
      temperature: 20,
      buildings: [],
      resources: {
        metal: 500,
        crystal: 300,
        deuterium: 100,
        energy: 0,
        lastUpdate: new Date(),
      },
    };

    const result = calculateCurrentResources(planet, 0, new Date());

    expect(result.metal).toBe(500);
    expect(result.crystal).toBe(300);
    expect(result.deuterium).toBe(100);
    expect(result.productionRates.metal).toBe(30); // Base production
    expect(result.productionRates.crystal).toBe(15); // Base production
  });
});
