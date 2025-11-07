import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { completeBuildingUpgrade } from '@/lib/game-engine/building-manager';
import { BUILDING_NAMES } from '@/lib/game-engine/constants';
import { emitBuildingCompleted } from '@/lib/socket/server';

/**
 * POST /api/buildings/check-completion
 * Checks for completed building upgrades and completes them
 * Returns list of completed buildings
 *
 * Body:
 * - planetId: Planet ID to check
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let planetId;
    try {
      const body = await request.json();
      planetId = body.planetId;
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

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
          where: {
            upgrading: true,
            upgradeEndTime: {
              lte: new Date(), // Upgrade end time is in the past
            },
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

    // Complete all finished upgrades
    const completed = [];
    for (const building of planet.buildings) {
      const result = await completeBuildingUpgrade(planetId, building.type);
      if (result.success && result.building) {
        const buildingData = {
          buildingType: building.type,
          buildingName: BUILDING_NAMES[building.type] || building.type,
          newLevel: result.building.level,
        };
        completed.push(buildingData);

        // Emit Socket.io event for building completion
        emitBuildingCompleted(session.user.id, {
          planetId,
          buildingType: buildingData.buildingType,
          buildingName: buildingData.buildingName,
          newLevel: buildingData.newLevel,
        });
      }
    }

    return NextResponse.json({
      completed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Building completion check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
