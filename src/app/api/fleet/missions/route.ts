import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { SHIP_NAMES, MISSION_NAMES } from '@/lib/game-engine/constants';

/**
 * GET /api/fleet/missions
 * Fetches active fleet missions for the user
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all fleets for the user
    const fleets = await prisma.fleet.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        originPlanet: {
          select: {
            name: true,
            coordinates: true,
          },
        },
        targetPlanet: {
          select: {
            name: true,
            coordinates: true,
          },
        },
      },
      orderBy: {
        arrivalTime: 'asc',
      },
    });

    // Format fleet data
    const missionsData = fleets.map((fleet) => {
      const ships = fleet.ships as Record<string, number>;
      const cargo = (fleet.cargo as { metal: number; crystal: number; deuterium: number }) ||
        { metal: 0, crystal: 0, deuterium: 0 };

      // Format ship list
      const shipList = Object.entries(ships)
        .filter(([, count]) => count > 0)
        .map(([shipType, count]) => ({
          type: shipType,
          name: SHIP_NAMES[shipType] || shipType,
          count,
        }));

      return {
        id: fleet.id,
        mission: fleet.mission,
        missionName: MISSION_NAMES[fleet.mission] || fleet.mission,
        status: fleet.status,
        ships: shipList,
        cargo,
        origin: {
          name: fleet.originPlanet.name,
          coordinates: fleet.originPlanet.coordinates,
        },
        target: {
          name: fleet.targetPlanet.name,
          coordinates: fleet.targetPlanet.coordinates,
        },
        departureTime: fleet.departureTime,
        arrivalTime: fleet.arrivalTime,
        returnTime: fleet.returnTime,
        fuelConsumption: fleet.fuelConsumption,
      };
    });

    return NextResponse.json({
      missions: missionsData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fleet missions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
