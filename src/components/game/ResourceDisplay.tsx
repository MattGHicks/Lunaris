'use client';

import { useEffect, useState, useRef } from 'react';
import { formatResourceAmount, formatProductionRate } from '@/lib/game-engine/resource-calculator';

interface ResourceData {
  metal: number;
  crystal: number;
  deuterium: number;
  energy: number;
}

interface ProductionRates {
  metal: number;
  crystal: number;
  deuterium: number;
  energy: number;
}

interface StorageCapacity {
  metal: number;
  crystal: number;
  deuterium: number;
}

interface EnergyBalance {
  production: number;
  consumption: number;
  available: number;
  efficiency: number;
}

interface ResourceDisplayProps {
  planetId: string;
  initialResources: ResourceData;
  initialProductionRates: ProductionRates;
  initialStorageCapacity: StorageCapacity;
  initialEnergyBalance: EnergyBalance;
}

export function ResourceDisplay({
  planetId,
  initialResources,
  initialProductionRates,
  initialStorageCapacity,
  initialEnergyBalance,
}: ResourceDisplayProps) {
  // Server resources (updated from API)
  const [serverResources, setServerResources] = useState<ResourceData>(initialResources);
  const [productionRates, setProductionRates] = useState<ProductionRates>(initialProductionRates);
  const [storageCapacity, setStorageCapacity] = useState<StorageCapacity>(initialStorageCapacity);
  const [energyBalance, setEnergyBalance] = useState<EnergyBalance>(initialEnergyBalance);

  // Client-side interpolated resources (updated every frame)
  const [displayResources, setDisplayResources] = useState<ResourceData>(initialResources);

  // Last update timestamp
  const lastUpdateRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Fetch resources from API
  const fetchResources = async () => {
    try {
      const response = await fetch(`/api/resources?planetId=${planetId}`);
      if (response.ok) {
        const data = await response.json();
        setServerResources(data.resources);
        setProductionRates(data.productionRates);
        setStorageCapacity(data.storageCapacity);
        setEnergyBalance(data.energyBalance);
        lastUpdateRef.current = Date.now();
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  // Interpolate resources based on production rates
  const interpolateResources = () => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 1000; // in seconds

    // Calculate accumulated resources since last server update
    const metalPerSecond = productionRates.metal / 3600;
    const crystalPerSecond = productionRates.crystal / 3600;
    const deuteriumPerSecond = productionRates.deuterium / 3600;

    const newMetal = Math.min(
      serverResources.metal + metalPerSecond * deltaTime,
      storageCapacity.metal
    );
    const newCrystal = Math.min(
      serverResources.crystal + crystalPerSecond * deltaTime,
      storageCapacity.crystal
    );
    const newDeuterium = Math.min(
      serverResources.deuterium + deuteriumPerSecond * deltaTime,
      storageCapacity.deuterium
    );

    setDisplayResources({
      metal: Math.max(0, newMetal),
      crystal: Math.max(0, newCrystal),
      deuterium: Math.max(0, newDeuterium),
      energy: energyBalance.available,
    });

    animationFrameRef.current = requestAnimationFrame(interpolateResources);
  };

  // Setup polling and interpolation
  useEffect(() => {
    // Start interpolation loop
    animationFrameRef.current = requestAnimationFrame(interpolateResources);

    // Poll API every 10 seconds
    const pollInterval = setInterval(fetchResources, 10000);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planetId]);

  // Calculate storage percentage
  const getStoragePercentage = (current: number, max: number) => {
    return Math.min(100, (current / max) * 100);
  };

  // Get color based on storage percentage
  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Resources Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Metal */}
        <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Metal</p>
            <span className="text-xs text-green-400">
              {productionRates.metal >= 0 ? '+' : ''}
              {formatProductionRate(productionRates.metal)}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-metal">
            {formatResourceAmount(displayResources.metal)}
          </p>
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className={`h-full transition-all duration-300 ${getStorageColor(
                  getStoragePercentage(displayResources.metal, storageCapacity.metal)
                )}`}
                style={{
                  width: `${getStoragePercentage(displayResources.metal, storageCapacity.metal)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formatResourceAmount(storageCapacity.metal)} max
            </p>
          </div>
        </div>

        {/* Crystal */}
        <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Crystal</p>
            <span className="text-xs text-green-400">
              {productionRates.crystal >= 0 ? '+' : ''}
              {formatProductionRate(productionRates.crystal)}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-crystal">
            {formatResourceAmount(displayResources.crystal)}
          </p>
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className={`h-full transition-all duration-300 ${getStorageColor(
                  getStoragePercentage(displayResources.crystal, storageCapacity.crystal)
                )}`}
                style={{
                  width: `${getStoragePercentage(displayResources.crystal, storageCapacity.crystal)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formatResourceAmount(storageCapacity.crystal)} max
            </p>
          </div>
        </div>

        {/* Deuterium */}
        <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Deuterium</p>
            <span className="text-xs text-green-400">
              {productionRates.deuterium >= 0 ? '+' : ''}
              {formatProductionRate(productionRates.deuterium)}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-deuterium">
            {formatResourceAmount(displayResources.deuterium)}
          </p>
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className={`h-full transition-all duration-300 ${getStorageColor(
                  getStoragePercentage(displayResources.deuterium, storageCapacity.deuterium)
                )}`}
                style={{
                  width: `${getStoragePercentage(
                    displayResources.deuterium,
                    storageCapacity.deuterium
                  )}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formatResourceAmount(storageCapacity.deuterium)} max
            </p>
          </div>
        </div>

        {/* Energy */}
        <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Energy</p>
            {energyBalance.efficiency < 1 && (
              <span className="text-xs text-red-400">
                {Math.floor(energyBalance.efficiency * 100)}% Efficiency
              </span>
            )}
          </div>
          <p
            className={`mt-1 text-2xl font-bold ${
              displayResources.energy >= 0 ? 'text-energy' : 'text-red-500'
            }`}
          >
            {displayResources.energy >= 0 ? '+' : ''}
            {Math.floor(displayResources.energy).toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Production: {energyBalance.production.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Usage: {energyBalance.consumption.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Warning */}
      {energyBalance.efficiency < 1 && (
        <div className="rounded-lg border border-red-500 bg-red-950/20 p-4">
          <p className="text-sm text-red-400">
            <strong>Warning:</strong> Insufficient energy! Mines are operating at{' '}
            {Math.floor(energyBalance.efficiency * 100)}% capacity. Build more Solar Plants or a
            Fusion Reactor to increase production.
          </p>
        </div>
      )}

      {/* Storage Warning */}
      {(getStoragePercentage(displayResources.metal, storageCapacity.metal) >= 90 ||
        getStoragePercentage(displayResources.crystal, storageCapacity.crystal) >= 90 ||
        getStoragePercentage(displayResources.deuterium, storageCapacity.deuterium) >= 90) && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-950/20 p-4">
          <p className="text-sm text-yellow-400">
            <strong>Notice:</strong> Storage is nearly full! Upgrade your storage buildings to
            prevent resource waste.
          </p>
        </div>
      )}
    </div>
  );
}
