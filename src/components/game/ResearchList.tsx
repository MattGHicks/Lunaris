'use client';

import { useState, useEffect, useCallback } from 'react';
import { ResearchCard } from './ResearchCard';
import { useSocketEvent } from '@/hooks/useSocket';
import { useResearchCompletion } from '@/hooks/useResearchCompletion';
import { SOCKET_EVENTS } from '@/lib/socket/events';

interface Research {
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
}

interface ResearchListProps {
  planetId: string;
  initialResearch?: Research[];
}

export function ResearchList({ planetId, initialResearch = [] }: ResearchListProps) {
  const [research, setResearch] = useState<Research[]>(initialResearch);
  const [queue, setQueue] = useState({
    researching: false,
    currentResearch: null as string | null,
    researchEndTime: null as Date | null,
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'basic' | 'advanced' | 'drives'>('all');

  // Fetch research from API
  const fetchResearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/research?planetId=${planetId}`);
      if (response.ok) {
        const data = await response.json();
        setResearch(data.research);
        setQueue({
          researching: data.queue.researching,
          currentResearch: data.queue.currentResearch,
          researchEndTime: data.queue.researchEndTime ? new Date(data.queue.researchEndTime) : null,
        });
      }
    } catch (error) {
      console.error('Error fetching research:', error);
    } finally {
      setLoading(false);
    }
  }, [planetId]);

  // Listen for Socket.io events and refresh research
  useSocketEvent(SOCKET_EVENTS.RESEARCH_STARTED, useCallback(() => {
    console.log('Socket: Research started, refreshing research');
    fetchResearch();
  }, [fetchResearch]));

  useSocketEvent(SOCKET_EVENTS.RESEARCH_COMPLETED, useCallback(() => {
    console.log('Socket: Research completed, refreshing research');
    fetchResearch();
  }, [fetchResearch]));

  useSocketEvent(SOCKET_EVENTS.RESEARCH_CANCELLED, useCallback(() => {
    console.log('Socket: Research cancelled, refreshing research');
    fetchResearch();
  }, [fetchResearch]));

  // Background completion checker
  useResearchCompletion({
    enabled: queue.researching,
  });

  // Initial fetch
  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  // Filter research by category
  const filteredResearch = research.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'basic') {
      return [
        'espionageTech',
        'computerTech',
        'weaponsTech',
        'shieldingTech',
        'armorTech',
        'energyTech',
      ].includes(r.type);
    }
    if (filter === 'advanced') {
      return [
        'hyperspaceTech',
        'laserTech',
        'ionTech',
        'plasmaTech',
        'astrophysics',
        'researchNetwork',
        'expeditionTech',
        'gravitonTech',
      ].includes(r.type);
    }
    if (filter === 'drives') {
      return [
        'combustionDrive',
        'impulseDrive',
        'hyperspaceDrive',
      ].includes(r.type);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Research</h2>
        {loading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

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
          All
        </button>
        <button
          onClick={() => setFilter('basic')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'basic'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Basic
        </button>
        <button
          onClick={() => setFilter('advanced')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'advanced'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Advanced
        </button>
        <button
          onClick={() => setFilter('drives')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'drives'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Drives
        </button>
      </div>

      {/* Research Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResearch.map((r) => (
          <ResearchCard
            key={r.type}
            type={r.type}
            name={r.name}
            description={r.description}
            level={r.level}
            upgradeInfo={r.upgradeInfo}
            planetId={planetId}
            isResearching={queue.researching}
            currentResearch={queue.currentResearch}
            researchEndTime={queue.researchEndTime}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredResearch.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p>No research available in this category</p>
        </div>
      )}
    </div>
  );
}
