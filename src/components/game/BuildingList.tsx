'use client';

import { useState, useEffect, useCallback } from 'react';
import { BuildingCard } from './BuildingCard';
import { useSocketEvent } from '@/hooks/useSocket';
import { useBuildingCompletion } from '@/hooks/useBuildingCompletion';
import { SOCKET_EVENTS } from '@/lib/socket/events';

interface Building {
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
}

interface BuildingListProps {
  planetId: string;
  initialBuildings?: Building[];
}

export function BuildingList({ planetId, initialBuildings = [] }: BuildingListProps) {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [planetTemperature, setPlanetTemperature] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'resources' | 'facilities' | 'storage'>('all');

  // Fetch buildings from API
  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/buildings?planetId=${planetId}`);
      if (response.ok) {
        const data = await response.json();
        setBuildings(data.buildings);
        if (data.planetTemperature !== undefined) {
          setPlanetTemperature(data.planetTemperature);
        }
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setLoading(false);
    }
  }, [planetId]);

  // Listen for Socket.io events and refresh buildings
  useSocketEvent(SOCKET_EVENTS.BUILDING_STARTED, useCallback(() => {
    console.log('Socket: Building started, refreshing buildings');
    fetchBuildings();
  }, [fetchBuildings]));

  useSocketEvent(SOCKET_EVENTS.BUILDING_COMPLETED, useCallback(() => {
    console.log('Socket: Building completed, refreshing buildings');
    fetchBuildings();
  }, [fetchBuildings]));

  useSocketEvent(SOCKET_EVENTS.BUILDING_CANCELLED, useCallback(() => {
    console.log('Socket: Building cancelled, refreshing buildings');
    fetchBuildings();
  }, [fetchBuildings]));

  // Background completion checker (triggers API which emits WebSocket events)
  // This is needed to detect when buildings finish upgrading
  useBuildingCompletion({
    planetId,
    enabled: true,
  });

  // Refresh on mount
  useEffect(() => {
    if (initialBuildings.length === 0) {
      fetchBuildings();
    }
  }, [initialBuildings.length, fetchBuildings]);

  // Filter buildings
  const filteredBuildings = buildings.filter((building) => {
    if (filter === 'all') return true;
    if (filter === 'resources') {
      return ['metalMine', 'crystalMine', 'deuteriumSynthesizer', 'solarPlant', 'fusionReactor'].includes(
        building.type
      );
    }
    if (filter === 'facilities') {
      return ['roboticsFactory', 'shipyard', 'researchLab', 'allianceDepot', 'missileSilo', 'naniteFactory', 'terraformer', 'spaceDock'].includes(
        building.type
      );
    }
    if (filter === 'storage') {
      return ['metalStorage', 'crystalStorage', 'deuteriumTank'].includes(building.type);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'all'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All Buildings
        </button>
        <button
          onClick={() => setFilter('resources')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'resources'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => setFilter('facilities')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'facilities'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Facilities
        </button>
        <button
          onClick={() => setFilter('storage')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'storage'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Storage
        </button>
      </div>

      {/* Buildings grid */}
      {loading ? (
        <div className="py-8 text-center text-gray-400">Loading buildings...</div>
      ) : filteredBuildings.length === 0 ? (
        <div className="py-8 text-center text-gray-400">No buildings found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBuildings.map((building) => (
            <BuildingCard
              key={building.id}
              {...building}
              planetId={planetId}
              temperature={planetTemperature}
              energyTechLevel={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
