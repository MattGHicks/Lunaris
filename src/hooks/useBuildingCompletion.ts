'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface CompletedBuilding {
  buildingType: string;
  buildingName: string;
  newLevel: number;
}

interface UseBuildingCompletionOptions {
  planetId: string;
  onBuildingCompleted?: (completed: CompletedBuilding[]) => void;
  checkInterval?: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Hook to check for completed building upgrades
 * Polls the server periodically and shows toast notifications
 */
export function useBuildingCompletion({
  planetId,
  onBuildingCompleted,
  checkInterval = 3000, // Check every 3 seconds
  enabled = true,
}: UseBuildingCompletionOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkCompletion = useCallback(async () => {
    try {
      const response = await fetch('/api/buildings/check-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planetId }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.completed && data.completed.length > 0) {
          // Show toast notifications
          data.completed.forEach((building: CompletedBuilding) => {
            toast.success(
              `${building.buildingName} upgraded to Level ${building.newLevel}!`,
              {
                duration: 5000,
              }
            );
          });

          // WebSocket events will handle UI refresh - no need to trigger manually

          // Call callback if provided
          if (onBuildingCompleted) {
            onBuildingCompleted(data.completed);
          }
        }
      }
    } catch (error) {
      console.error('Error checking building completion:', error);
    }
  }, [planetId, onBuildingCompleted]);

  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check immediately on mount
    checkCompletion();

    // Set up interval
    intervalRef.current = setInterval(() => {
      checkCompletion();
    }, checkInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, checkInterval, checkCompletion]);

  return {
    checkNow: checkCompletion,
  };
}
