import { useEffect, useRef } from 'react';

interface UseShipProductionCompletionOptions {
  planetId: string;
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Hook to check for completed ship production periodically
 * This triggers the API which emits WebSocket events
 */
export function useShipProductionCompletion({
  planetId,
  enabled = true,
  intervalMs = 5000, // Check every 5 seconds
}: UseShipProductionCompletionOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const checkCompletion = async () => {
      try {
        const response = await fetch('/api/shipyard/check-completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planetId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.completed) {
            console.log('Ship production completed:', data.production);
          }
        }
      } catch (error) {
        console.error('Error checking ship production completion:', error);
      }
    };

    // Check immediately
    checkCompletion();

    // Then check periodically
    intervalRef.current = setInterval(checkCompletion, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [planetId, enabled, intervalMs]);
}
