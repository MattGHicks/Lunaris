import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { getUpgradeInfo } from '@/lib/game-engine/building-calculator';
import { BUILDING_NAMES, BUILDING_DESCRIPTIONS } from '@/lib/game-engine/constants';

/**
 * GET /api/buildings
 * Fetches all buildings for a planet with upgrade information
 *
 * Query parameters:
 * - planetId (required): Planet ID to fetch buildings for
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
        buildings: {
          orderBy: {
            type: 'asc',
          },
        },
        resources: true,
      },
    });

    if (!planet) {
      return NextResponse.json(
        { error: 'Planet not found or access denied' },
        { status: 404 }
      );
    }

    // Get robotics and nanite levels
    const roboticsBuilding = planet.buildings.find((b) => b.type === 'roboticsFactory');
    const naniteBuilding = planet.buildings.find((b) => b.type === 'naniteFactory');
    const roboticsLevel = roboticsBuilding?.level || 0;
    const naniteLevel = naniteBuilding?.level || 0;

    // Convert buildings to BuildingInfo format for upgrade calculations
    const buildingInfos = planet.buildings.map((b) => ({
      type: b.type,
      level: b.level,
      upgrading: b.upgrading,
      upgradeEndTime: b.upgradeEndTime,
    }));

    // Prepare building data with upgrade info
    const buildingsWithInfo = planet.buildings.map((building) => {
      let upgradeInfo = null;

      // Only calculate upgrade info if building is not currently upgrading
      if (!building.upgrading && planet.resources) {
        upgradeInfo = getUpgradeInfo(
          building.type,
          building.level,
          buildingInfos,
          {
            metal: planet.resources.metal,
            crystal: planet.resources.crystal,
            deuterium: planet.resources.deuterium,
          },
          roboticsLevel,
          naniteLevel
        );
      }

      return {
        id: building.id,
        type: building.type,
        name: BUILDING_NAMES[building.type] || building.type,
        description: BUILDING_DESCRIPTIONS[building.type] || '',
        level: building.level,
        upgrading: building.upgrading,
        upgradeEndTime: building.upgradeEndTime,
        upgradeInfo,
      };
    });

    return NextResponse.json({
      buildings: buildingsWithInfo,
      planetTemperature: planet.temperature,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Buildings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
