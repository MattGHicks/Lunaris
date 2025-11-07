'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { formatResourceAmount } from '@/lib/game-engine/resource-calculator';
import { formatBuildingTime, getRemainingUpgradeTime } from '@/lib/game-engine/building-calculator';
import { getBuildingStats, formatStat, getResourceColor } from '@/lib/game-engine/building-stats';

interface BuildingCardProps {
  id: string;
  type: string;
  name: string;
  description: string;
  level: number;
  upgrading: boolean;
  upgradeEndTime: Date | null;
  upgradeInfo: {
    metal: number;
    crystal: number;
    deuterium: number;
    time: number;
    canAfford: boolean;
    meetsPrerequisites: boolean;
    missingPrerequisites: string[];
  } | null;
  planetId: string;
  temperature?: number;
  energyTechLevel?: number;
}

export function BuildingCard({
  type,
  name,
  description,
  level,
  upgrading,
  upgradeEndTime,
  upgradeInfo,
  planetId,
  temperature = 20,
  energyTechLevel = 0,
}: BuildingCardProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Calculate building stats
  const buildingStats = getBuildingStats(type, level, temperature, energyTechLevel);

  // Update remaining time for countdown
  useEffect(() => {
    if (!upgrading || !upgradeEndTime) {
      setRemainingTime(0);
      return;
    }

    const updateTime = () => {
      const remaining = getRemainingUpgradeTime(upgradeEndTime);
      setRemainingTime(remaining);

      if (remaining > 0) {
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    updateTime();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [upgrading, upgradeEndTime]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch('/api/buildings/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planetId,
          buildingType: type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        console.log('Upgrade successful - Socket.io will handle UI updates');
        // WebSocket events will trigger automatic refresh - no callbacks needed
      } else {
        toast.error(data.error || 'Failed to start upgrade');
      }
    } catch (error) {
      toast.error('An error occurred while starting the upgrade');
      console.error('Upgrade error:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch(
        `/api/buildings/upgrade?planetId=${planetId}&buildingType=${type}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        console.log('Cancel successful - Socket.io will handle UI updates');
        // WebSocket events will trigger automatic refresh - no callbacks needed
      } else {
        toast.error(data.error || 'Failed to cancel upgrade');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the upgrade');
      console.error('Cancel error:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const canUpgrade = upgradeInfo && upgradeInfo.canAfford && upgradeInfo.meetsPrerequisites;

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-lg transition-all hover:bg-gray-750">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{name}</h3>
            <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold">
              Level {level}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">{description}</p>

          {/* Building Stats */}
          {(buildingStats.currentProduction !== undefined ||
            buildingStats.currentConsumption !== undefined ||
            buildingStats.currentCapacity !== undefined) && (
            <div className="mt-3 space-y-1.5 rounded-md bg-gray-900/50 p-3 text-sm">
              {/* Production Stats */}
              {buildingStats.currentProduction !== undefined && buildingStats.productionType && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    {buildingStats.productionType === 'energy' ? 'Energy Production:' : 'Production:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={getResourceColor(buildingStats.productionType)}>
                      {formatStat(buildingStats.currentProduction)}/h
                    </span>
                    {buildingStats.nextProduction !== undefined && (
                      <>
                        <span className="text-gray-600">→</span>
                        <span className={`font-semibold ${getResourceColor(buildingStats.productionType)}`}>
                          {formatStat(buildingStats.nextProduction)}/h
                        </span>
                        <span className="text-green-400 text-xs">
                          (+{formatStat(buildingStats.nextProduction - buildingStats.currentProduction)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Consumption Stats */}
              {buildingStats.currentConsumption !== undefined && buildingStats.currentConsumption > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Energy Usage:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">
                      {formatStat(buildingStats.currentConsumption)}
                    </span>
                    {buildingStats.nextConsumption !== undefined && (
                      <>
                        <span className="text-gray-600">→</span>
                        <span className="font-semibold text-red-400">
                          {formatStat(buildingStats.nextConsumption)}
                        </span>
                        <span className="text-red-300 text-xs">
                          (+{formatStat(buildingStats.nextConsumption - buildingStats.currentConsumption)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Capacity Stats */}
              {buildingStats.currentCapacity !== undefined && buildingStats.capacityType && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Storage Capacity:</span>
                  <div className="flex items-center gap-2">
                    <span className={getResourceColor(buildingStats.capacityType)}>
                      {formatStat(buildingStats.currentCapacity)}
                    </span>
                    {buildingStats.nextCapacity !== undefined && (
                      <>
                        <span className="text-gray-600">→</span>
                        <span className={`font-semibold ${getResourceColor(buildingStats.capacityType)}`}>
                          {formatStat(buildingStats.nextCapacity)}
                        </span>
                        <span className="text-green-400 text-xs">
                          (+{formatStat(buildingStats.nextCapacity - buildingStats.currentCapacity)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upgrading status */}
          {upgrading && upgradeEndTime && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-400">Upgrading to Level {level + 1}</span>
                <span className="font-mono text-yellow-400">{formatBuildingTime(remainingTime)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full bg-yellow-500 transition-all duration-1000"
                  style={{
                    width: upgradeInfo
                      ? `${Math.max(0, Math.min(100, ((upgradeInfo.time - remainingTime) / upgradeInfo.time) * 100))}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Upgrade cost */}
          {!upgrading && upgradeInfo && (
            <div className="mt-3 space-y-2">
              <div className="text-sm">
                <span className="font-semibold">Upgrade to Level {level + 1}:</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="text-metal">
                  Metal: {formatResourceAmount(upgradeInfo.metal)}
                </span>
                <span className="text-crystal">
                  Crystal: {formatResourceAmount(upgradeInfo.crystal)}
                </span>
                <span className="text-deuterium">
                  Deuterium: {formatResourceAmount(upgradeInfo.deuterium)}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Time: {formatBuildingTime(upgradeInfo.time)}
              </div>

              {/* Missing prerequisites */}
              {!upgradeInfo.meetsPrerequisites && (
                <div className="mt-2 text-sm text-red-400">
                  Requirements: {upgradeInfo.missingPrerequisites.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4">
        {upgrading ? (
          <button
            onClick={handleCancel}
            disabled={isUpgrading}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isUpgrading ? 'Cancelling...' : 'Cancel Upgrade'}
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
            disabled={!canUpgrade || isUpgrading}
            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            title={
              !upgradeInfo?.meetsPrerequisites
                ? 'Prerequisites not met'
                : !upgradeInfo?.canAfford
                ? 'Insufficient resources'
                : ''
            }
          >
            {isUpgrading ? 'Starting...' : `Upgrade to Level ${level + 1}`}
          </button>
        )}
      </div>
    </div>
  );
}
