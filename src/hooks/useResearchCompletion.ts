import { useEffect, useRef } from 'react';

interface UseResearchCompletionOptions {
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Hook to check for completed research periodically
 * This triggers the API which emits WebSocket events
 */
export function useResearchCompletion({
  enabled = true,
  intervalMs = 5000, // Check every 5 seconds
}: UseResearchCompletionOptions = {}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const checkCompletion = async () => {
      try {
        const response = await fetch('/api/research/check-completion', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.completed) {
            console.log('Research completed:', data.research);
          }
        }
      } catch (error) {
        console.error('Error checking research completion:', error);
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
  }, [enabled, intervalMs]);
}
