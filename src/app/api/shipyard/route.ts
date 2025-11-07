import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { getShipBuildInfo } from '@/lib/game-engine/ship-calculator';
import { SHIP_NAMES, SHIP_DESCRIPTIONS, SHIP_TYPES } from '@/lib/game-engine/constants';
import type { BuildingInfo, ResearchInfo } from '@/lib/game-engine/ship-calculator';

/**
 * GET /api/shipyard
 * Fetches all ships and production status for a planet
 *
 * Query parameters:
 * - planetId (required): Planet ID to fetch shipyard for
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get planetId from query params
    const { searchParams } = new URL(request.url);
    const planetId = searchParams.get('planetId');

    if (!planetId) {
      return NextResponse.json(
        { error: 'planetId is required' },
        { status: 400 }
      );
    }

    // Verify the planet belongs to the user
    const planet = await prisma.planet.findFirst({
      where: {
        id: planetId,
        userId: session.user.id,
      },
      include: {
        buildings: true,
        resources: true,
        user: {
          include: {
            research: true,
          },
        },
      },
    });

    if (!planet) {
      return NextResponse.json(
        { error: 'Planet not found or access denied' },
        { status: 404 }
      );
    }

    // Get shipyard and nanite levels
    const shipyardBuilding = planet.buildings.find((b) => b.type === 'shipyard');
    const naniteBuilding = planet.buildings.find((b) => b.type === 'naniteFactory');
    const shipyardLevel = shipyardBuilding?.level || 0;
    const naniteLevel = naniteBuilding?.level || 0;

    if (shipyardLevel === 0) {
      return NextResponse.json(
        { error: 'Shipyard required' },
        { status: 400 }
      );
    }

    // Convert buildings to BuildingInfo format
    const buildingInfos: BuildingInfo[] = planet.buildings.map((b) => ({
      type: b.type,
      level: b.level,
    }));

    // Convert research to ResearchInfo format
    const researchInfos: ResearchInfo[] = planet.user.research ? Object.entries(planet.user.research)
      .filter(([key]) =>
        key !== 'id' &&
        key !== 'userId' &&
        key !== 'createdAt' &&
        key !== 'updatedAt' &&
        key !== 'researching' &&
        key !== 'currentResearch' &&
        key !== 'researchEndTime'
      )
      .map(([key, value]) => ({
        type: key,
        level: value as number,
      })) : [];

    // Prepare ship data with build info
    const shipsWithInfo = Object.values(SHIP_TYPES).map((shipType) => {
      let buildInfo = null;

      // Only calculate build info if not currently building and shipyard is not upgrading
      if (!planet.shipQueue && !shipyardBuilding?.upgrading && planet.resources) {
        try {
          buildInfo = getShipBuildInfo(
            shipType,
            1, // Default to 1 ship for display
            buildingInfos,
            researchInfos,
            {
              metal: planet.resources.metal,
              crystal: planet.resources.crystal,
              deuterium: planet.resources.deuterium,
            },
            shipyardLevel,
            naniteLevel
          );
        } catch (error) {
          // If there's an error (e.g., invalid ship type), skip build info
          console.error(`Error calculating build info for ${shipType}:`, error);
        }
      }

      return {
        type: shipType,
        name: SHIP_NAMES[shipType] || shipType,
        description: SHIP_DESCRIPTIONS[shipType] || '',
        buildInfo,
      };
    });

    // Get current ships on planet
    const currentShips = (planet.ships as Record<string, number>) || {};

    return NextResponse.json({
      ships: shipsWithInfo,
      currentShips,
      queue: planet.shipQueue,
      shipyardLevel,
      shipyardUpgrading: shipyardBuilding?.upgrading || false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Shipyard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
