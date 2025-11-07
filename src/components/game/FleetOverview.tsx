'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocketEvent } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/lib/socket/events';

interface FleetShip {
  type: string;
  name: string;
  count: number;
  cargoCapacity: number;
  speed: number;
  totalCargo: number;
}

interface FleetOverviewProps {
  planetId: string;
  initialFleet?: FleetShip[];
}

export function FleetOverview({ planetId, initialFleet = [] }: FleetOverviewProps) {
  const [fleet, setFleet] = useState<FleetShip[]>(initialFleet);
  const [summary, setSummary] = useState({
    totalShips: 0,
    totalCargo: 0,
    shipTypes: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch fleet data from API
  const fetchFleet = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fleet?planetId=${planetId}`);
      if (response.ok) {
        const data = await response.json();
        setFleet(data.fleet);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching fleet:', error);
    } finally {
      setLoading(false);
    }
  }, [planetId]);

  // Listen for ship production completion and refresh fleet
  useSocketEvent(SOCKET_EVENTS.SHIP_PRODUCTION_COMPLETED, useCallback(() => {
    console.log('Socket: Ship production completed, refreshing fleet');
    fetchFleet();
  }, [fetchFleet]));

  // Initial fetch
  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Fleet Overview</h2>
        {loading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Ships</p>
          <p className="text-2xl font-bold text-white">{formatNumber(summary.totalShips)}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Cargo Capacity</p>
          <p className="text-2xl font-bold text-blue-400">{formatNumber(summary.totalCargo)}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Ship Types</p>
          <p className="text-2xl font-bold text-green-400">{summary.shipTypes}</p>
        </div>
      </div>

      {/* Fleet Table */}
      {fleet.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Ship</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Count</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Cargo/Ship</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Total Cargo</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {fleet.map((ship) => (
                <tr key={ship.type} className="hover:bg-gray-750 transition-colors">
                  <td className="px-4 py-3 text-white">{ship.name}</td>
                  <td className="px-4 py-3 text-right text-white font-mono">
                    {formatNumber(ship.count)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 font-mono">
                    {formatNumber(ship.cargoCapacity)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-400 font-mono">
                    {formatNumber(ship.totalCargo)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 font-mono">
                    {formatNumber(ship.speed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">No ships on this planet</p>
          <p className="text-sm text-gray-500 mt-2">
            Build ships at the Shipyard to expand your fleet
          </p>
        </div>
      )}
    </div>
  );
}
