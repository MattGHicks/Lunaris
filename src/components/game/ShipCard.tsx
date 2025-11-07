'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { formatResourceAmount } from '@/lib/game-engine/resource-calculator';
import { formatProductionTime, calculateMaxAffordable } from '@/lib/game-engine/ship-calculator';
import { getResourceColor } from '@/lib/game-engine/building-stats';

interface ShipCardProps {
  type: string;
  name: string;
  description: string;
  buildInfo: {
    metal: number;
    crystal: number;
    deuterium: number;
    timePerUnit: number;
    totalTime: number;
    canAfford: boolean;
    meetsPrerequisites: boolean;
    missingPrerequisites: string[];
  } | null;
  planetId: string;
  currentCount: number;
  resources: { metal: number; crystal: number; deuterium: number };
}

export function ShipCard({
  type,
  name,
  description,
  buildInfo,
  planetId,
  currentCount,
  resources,
}: ShipCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const maxAffordable = buildInfo ? calculateMaxAffordable(type, resources) : 0;

  const handleBuild = async () => {
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/shipyard/produce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planetId,
          shipType: type,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to start production');
      }
    } catch (error) {
      toast.error('An error occurred while starting production');
      console.error('Production error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
    setQuantity(maxAffordable);
  };

  // Calculate total cost for current quantity
  const totalCost = buildInfo ? {
    metal: buildInfo.metal * quantity,
    crystal: buildInfo.crystal * quantity,
    deuterium: buildInfo.deuterium * quantity,
  } : null;

  const totalTime = buildInfo ? buildInfo.timePerUnit * quantity : 0;

  const canAfford = totalCost ?
    resources.metal >= totalCost.metal &&
    resources.crystal >= totalCost.crystal &&
    resources.deuterium >= totalCost.deuterium
    : false;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="text-sm text-gray-400">Available: {currentCount}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-4">{description}</p>

      {/* Build Info */}
      {buildInfo ? (
        <div className="space-y-3">
          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Quantity</label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleMaxClick}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-sm text-gray-300 transition-colors"
              >
                Max ({maxAffordable})
              </button>
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Metal:</span>
              <span className={canAfford ? getResourceColor('metal') : 'text-red-400'}>
                {formatResourceAmount(totalCost?.metal || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Crystal:</span>
              <span className={canAfford ? getResourceColor('crystal') : 'text-red-400'}>
                {formatResourceAmount(totalCost?.crystal || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Deuterium:</span>
              <span className={canAfford ? getResourceColor('deuterium') : 'text-red-400'}>
                {formatResourceAmount(totalCost?.deuterium || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-1 mt-2">
              <span className="text-gray-400">Time:</span>
              <span className="text-gray-300">{formatProductionTime(totalTime)}</span>
            </div>
          </div>

          {/* Prerequisites Warning */}
          {!buildInfo.meetsPrerequisites && (
            <div className="p-2 bg-yellow-900/30 border border-yellow-700 rounded">
              <p className="text-xs text-yellow-300 font-medium mb-1">
                Prerequisites not met:
              </p>
              <ul className="text-xs text-yellow-200 space-y-0.5">
                {buildInfo.missingPrerequisites.map((prereq, index) => (
                  <li key={index}>• {prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Build Button */}
          <button
            onClick={handleBuild}
            disabled={
              isLoading ||
              !canAfford ||
              !buildInfo.meetsPrerequisites ||
              quantity <= 0
            }
            className={`w-full py-2 px-4 rounded font-medium transition-colors ${
              canAfford && buildInfo.meetsPrerequisites && quantity > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {!buildInfo.meetsPrerequisites
              ? 'Prerequisites Not Met'
              : !canAfford
              ? 'Insufficient Resources'
              : `Build ${quantity} ${name}${quantity > 1 ? 's' : ''}`}
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-400 text-center py-4">
          Production unavailable
        </div>
      )}
    </div>
  );
}
