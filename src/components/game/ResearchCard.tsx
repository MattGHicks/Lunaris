'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { formatResourceAmount } from '@/lib/game-engine/resource-calculator';
import { formatResearchTime, getRemainingResearchTime } from '@/lib/game-engine/research-calculator';
import { getResourceColor } from '@/lib/game-engine/building-stats';

interface ResearchCardProps {
  type: string;
  name: string;
  description: string;
  level: number;
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
  isResearching: boolean;
  currentResearch: string | null;
  researchEndTime: Date | null;
}

export function ResearchCard({
  type,
  name,
  description,
  level,
  upgradeInfo,
  planetId,
  isResearching,
  currentResearch,
  researchEndTime,
}: ResearchCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const isThisResearching = isResearching && currentResearch === type;

  // Update remaining time for countdown
  useEffect(() => {
    if (!isThisResearching || !researchEndTime) {
      setRemainingTime(0);
      return;
    }

    const updateTime = () => {
      const remaining = getRemainingResearchTime(researchEndTime);
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
  }, [isThisResearching, researchEndTime]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/research/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planetId,
          researchType: type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to start research');
      }
    } catch (error) {
      toast.error('An error occurred while starting research');
      console.error('Research error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/research/upgrade?planetId=${planetId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to cancel research');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling research');
      console.error('Cancel error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = isThisResearching && researchEndTime ?
    Math.max(0, Math.min(100, 100 - (remainingTime / upgradeInfo!.time) * 100)) : 0;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="text-sm text-gray-400">Level {level}</p>
        </div>
        <div className="text-2xl font-bold text-blue-400">
          {level}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-4">{description}</p>

      {/* Research in Progress */}
      {isThisResearching && researchEndTime && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-300 font-medium">
              Researching Level {level + 1}
            </span>
            <span className="text-sm text-blue-300 font-mono">
              {formatResearchTime(remainingTime)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="mt-2 w-full py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            Cancel Research
          </button>
        </div>
      )}

      {/* Upgrade Info */}
      {!isThisResearching && upgradeInfo && (
        <div className="space-y-3">
          {/* Cost */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Metal:</span>
              <span className={upgradeInfo.canAfford ? getResourceColor('metal') : 'text-red-400'}>
                {formatResourceAmount(upgradeInfo.metal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Crystal:</span>
              <span className={upgradeInfo.canAfford ? getResourceColor('crystal') : 'text-red-400'}>
                {formatResourceAmount(upgradeInfo.crystal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Deuterium:</span>
              <span className={upgradeInfo.canAfford ? getResourceColor('deuterium') : 'text-red-400'}>
                {formatResourceAmount(upgradeInfo.deuterium)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-1 mt-2">
              <span className="text-gray-400">Time:</span>
              <span className="text-gray-300">{formatResearchTime(upgradeInfo.time)}</span>
            </div>
          </div>

          {/* Prerequisites Warning */}
          {!upgradeInfo.meetsPrerequisites && (
            <div className="p-2 bg-yellow-900/30 border border-yellow-700 rounded">
              <p className="text-xs text-yellow-300 font-medium mb-1">
                Prerequisites not met:
              </p>
              <ul className="text-xs text-yellow-200 space-y-0.5">
                {upgradeInfo.missingPrerequisites.map((prereq, index) => (
                  <li key={index}>• {prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Upgrade Button */}
          <button
            onClick={handleUpgrade}
            disabled={
              isLoading ||
              isResearching ||
              !upgradeInfo.canAfford ||
              !upgradeInfo.meetsPrerequisites
            }
            className={`w-full py-2 px-4 rounded font-medium transition-colors ${
              upgradeInfo.canAfford && upgradeInfo.meetsPrerequisites && !isResearching
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isResearching && currentResearch !== type
              ? 'Research in Progress'
              : !upgradeInfo.meetsPrerequisites
              ? 'Prerequisites Not Met'
              : !upgradeInfo.canAfford
              ? 'Insufficient Resources'
              : `Research Level ${level + 1}`}
          </button>
        </div>
      )}
    </div>
  );
}
