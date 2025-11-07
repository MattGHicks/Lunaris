'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import { formatDuration } from '@/lib/game-engine/fleet-calculator';

interface Mission {
  id: string;
  mission: string;
  missionName: string;
  status: string;
  ships: Array<{ type: string; name: string; count: number }>;
  cargo: { metal: number; crystal: number; deuterium: number };
  origin: { name: string; coordinates: string };
  target: { name: string; coordinates: string };
  departureTime: Date;
  arrivalTime: Date;
  returnTime: Date | null;
  fuelConsumption: number;
}

interface FleetMissionsProps {
  planetId: string;
}

export function FleetMissions({ planetId: _planetId }: FleetMissionsProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch missions from API
  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fleet/missions');
      if (response.ok) {
        const data = await response.json();
        setMissions(data.missions);
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for fleet events
  useSocketEvent(SOCKET_EVENTS.FLEET_DISPATCHED, useCallback(() => {
    console.log('Socket: Fleet dispatched, refreshing missions');
    fetchMissions();
  }, [fetchMissions]));

  useSocketEvent(SOCKET_EVENTS.FLEET_ARRIVED, useCallback(() => {
    console.log('Socket: Fleet arrived, refreshing missions');
    fetchMissions();
  }, [fetchMissions]));

  useSocketEvent(SOCKET_EVENTS.FLEET_RETURNED, useCallback(() => {
    console.log('Socket: Fleet returned, refreshing missions');
    fetchMissions();
  }, [fetchMissions]));

  useSocketEvent(SOCKET_EVENTS.FLEET_RECALLED, useCallback(() => {
    console.log('Socket: Fleet recalled, refreshing missions');
    fetchMissions();
  }, [fetchMissions]));

  // Initial fetch
  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const getRemainingTime = (arrivalTime: Date) => {
    const now = Date.now();
    const arrival = new Date(arrivalTime).getTime();
    return Math.max(0, Math.floor((arrival - now) / 1000));
  };

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case 'traveling':
        return 'text-blue-400';
      case 'arrived':
        return 'text-green-400';
      case 'returning':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Active Missions</h2>
        {loading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* Missions List */}
      {missions.length > 0 ? (
        <div className="space-y-4">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4"
            >
              {/* Mission Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {mission.missionName}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {mission.origin.name} → {mission.target.name}
                  </p>
                </div>
                <div className={`text-sm font-medium ${getMissionStatusColor(mission.status)}`}>
                  {mission.status.toUpperCase()}
                </div>
              </div>

              {/* Ships */}
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-1">Ships:</p>
                <div className="flex flex-wrap gap-2">
                  {mission.ships.map((ship) => (
                    <span
                      key={ship.type}
                      className="px-2 py-1 bg-gray-700 rounded text-sm text-white"
                    >
                      {ship.name} x{ship.count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cargo */}
              {(mission.cargo.metal > 0 ||
                mission.cargo.crystal > 0 ||
                mission.cargo.deuterium > 0) && (
                <div className="mb-3">
                  <p className="text-sm text-gray-400 mb-1">Cargo:</p>
                  <div className="flex space-x-4 text-sm">
                    {mission.cargo.metal > 0 && (
                      <span className="text-metal">
                        Metal: {mission.cargo.metal.toLocaleString()}
                      </span>
                    )}
                    {mission.cargo.crystal > 0 && (
                      <span className="text-crystal">
                        Crystal: {mission.cargo.crystal.toLocaleString()}
                      </span>
                    )}
                    {mission.cargo.deuterium > 0 && (
                      <span className="text-deuterium">
                        Deuterium: {mission.cargo.deuterium.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Timing */}
              <div className="flex items-center justify-between text-sm">
                <div className="space-x-4">
                  <span className="text-gray-400">
                    Arrival: {formatDuration(getRemainingTime(mission.arrivalTime))}
                  </span>
                  {mission.status === 'traveling' && (
                    <span className="text-gray-400">
                      Fuel: {mission.fuelConsumption.toLocaleString()} Deuterium
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">No active missions</p>
          <p className="text-sm text-gray-500 mt-2">
            Dispatch fleets from the Fleet page
          </p>
        </div>
      )}
    </div>
  );
}
