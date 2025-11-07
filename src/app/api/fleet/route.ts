import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { SHIP_NAMES, SHIP_CARGO_CAPACITY, SHIP_SPEEDS } from '@/lib/game-engine/constants';

/**
 * GET /api/fleet
 * Fetches fleet information for a planet
 *
 * Query parameters:
 * - planetId (required): Planet ID to fetch fleet for
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
    });

    if (!planet) {
      return NextResponse.json(
        { error: 'Planet not found or access denied' },
        { status: 404 }
      );
    }

    // Get ships on planet
    const ships = (planet.ships as Record<string, number>) || {};

    // Format ship data with stats
    const fleetData = Object.entries(ships)
      .filter(([, count]) => count > 0)
      .map(([shipType, count]) => ({
        type: shipType,
        name: SHIP_NAMES[shipType] || shipType,
        count,
        cargoCapacity: SHIP_CARGO_CAPACITY[shipType] || 0,
        speed: SHIP_SPEEDS[shipType] || 0,
        totalCargo: (SHIP_CARGO_CAPACITY[shipType] || 0) * count,
      }));

    // Calculate total fleet stats
    const totalShips = fleetData.reduce((sum, ship) => sum + ship.count, 0);
    const totalCargo = fleetData.reduce((sum, ship) => sum + ship.totalCargo, 0);

    return NextResponse.json({
      fleet: fleetData,
      summary: {
        totalShips,
        totalCargo,
        shipTypes: fleetData.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fleet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
