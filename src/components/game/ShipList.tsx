'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ShipCard } from './ShipCard';
import { useSocketEvent } from '@/hooks/useSocket';
import { useShipProductionCompletion } from '@/hooks/useShipProductionCompletion';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import { toast } from 'sonner';
import { formatProductionTime, getRemainingProductionTime } from '@/lib/game-engine/ship-calculator';

interface Ship {
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
}

interface ShipQueue {
  shipType: string;
  quantity: number;
  startTime: string;
  endTime: string;
}

interface ShipListProps {
  planetId: string;
  initialShips?: Ship[];
  initialResources?: { metal: number; crystal: number; deuterium: number };
}

export function ShipList({ planetId, initialShips = [], initialResources }: ShipListProps) {
  const [ships, setShips] = useState<Ship[]>(initialShips);
  const [currentShips, setCurrentShips] = useState<Record<string, number>>({});
  const [queue, setQueue] = useState<ShipQueue | null>(null);
  const [resources] = useState(initialResources || { metal: 0, crystal: 0, deuterium: 0 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'civil' | 'combat'>('all');
  const [remainingTime, setRemainingTime] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Fetch shipyard data from API
  const fetchShipyard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/shipyard?planetId=${planetId}`);
      if (response.ok) {
        const data = await response.json();
        setShips(data.ships);
        setCurrentShips(data.currentShips || {});
        setQueue(data.queue || null);
      }
    } catch (error) {
      console.error('Error fetching shipyard:', error);
    } finally {
      setLoading(false);
    }
  }, [planetId]);

  // Update remaining time for countdown
  useEffect(() => {
    if (!queue) {
      setRemainingTime(0);
      return;
    }

    const updateTime = () => {
      const remaining = getRemainingProductionTime(new Date(queue.endTime));
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
  }, [queue]);

  // Listen for Socket.io events and refresh shipyard
  useSocketEvent(SOCKET_EVENTS.SHIP_PRODUCTION_STARTED, useCallback(() => {
    console.log('Socket: Ship production started, refreshing shipyard');
    fetchShipyard();
  }, [fetchShipyard]));

  useSocketEvent(SOCKET_EVENTS.SHIP_PRODUCTION_COMPLETED, useCallback(() => {
    console.log('Socket: Ship production completed, refreshing shipyard');
    fetchShipyard();
  }, [fetchShipyard]));

  useSocketEvent(SOCKET_EVENTS.SHIP_PRODUCTION_CANCELLED, useCallback(() => {
    console.log('Socket: Ship production cancelled, refreshing shipyard');
    fetchShipyard();
  }, [fetchShipyard]));

  // Background completion checker
  useShipProductionCompletion({
    planetId,
    enabled: !!queue,
  });

  // Initial fetch
  useEffect(() => {
    fetchShipyard();
  }, [fetchShipyard]);

  const handleCancelProduction = async () => {
    try {
      const response = await fetch(`/api/shipyard/produce?planetId=${planetId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to cancel production');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling production');
      console.error('Cancel error:', error);
    }
  };

  // Filter ships by category
  const filteredShips = ships.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'civil') {
      return ['smallCargo', 'largeCargo', 'colonyShip', 'recycler', 'espionageProbe'].includes(s.type);
    }
    if (filter === 'combat') {
      return ['lightFighter', 'heavyFighter', 'cruiser', 'battleship', 'battlecruiser', 'bomber', 'destroyer', 'deathstar'].includes(s.type);
    }
    return true;
  });

  const progress = queue ? Math.max(0, Math.min(100, 100 - (remainingTime / getRemainingProductionTime(new Date(queue.startTime))) * 100)) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Shipyard</h2>
        {loading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* Production Queue */}
      {queue && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-blue-300">
                Producing {queue.quantity}x {ships.find(s => s.type === queue.shipType)?.name || queue.shipType}
              </h3>
              <p className="text-sm text-blue-200">
                {formatProductionTime(remainingTime)} remaining
              </p>
            </div>
            <button
              onClick={handleCancelProduction}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All Ships
        </button>
        <button
          onClick={() => setFilter('civil')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'civil'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Civil
        </button>
        <button
          onClick={() => setFilter('combat')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'combat'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Combat
        </button>
      </div>

      {/* Ship Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShips.map((ship) => (
          <ShipCard
            key={ship.type}
            type={ship.type}
            name={ship.name}
            description={ship.description}
            buildInfo={ship.buildInfo}
            planetId={planetId}
            currentCount={currentShips[ship.type] || 0}
            resources={resources}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredShips.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p>No ships available in this category</p>
        </div>
      )}
    </div>
  );
}
