import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { dispatchFleet, recallFleet } from '@/lib/game-engine/fleet-manager';
import { emitFleetDispatched, emitFleetRecalled } from '@/lib/socket/server';
import { formatCoordinates } from '@/lib/game-engine/fleet-calculator';
import type { FleetComposition, Coordinates } from '@/lib/game-engine/fleet-calculator';

/**
 * POST /api/fleet/dispatch
 * Dispatch a fleet on a mission
 *
 * Body:
 * - planetId: Origin planet ID
 * - target: Target coordinates { galaxy, system, position }
 * - mission: Mission type
 * - fleet: Ship composition { shipType: count }
 * - cargo: Resources to transport { metal, crystal, deuterium }
 * - speed: Fleet speed percentage (10-100)
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { planetId, target, mission, fleet, cargo, speed } = body;

    if (!planetId || !target || !mission || !fleet) {
      return NextResponse.json(
        { error: 'planetId, target, mission, and fleet are required' },
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

    // Dispatch the fleet
    const result = await dispatchFleet(
      session.user.id,
      planetId,
      target as Coordinates,
      mission,
      fleet as FleetComposition,
      cargo || { metal: 0, crystal: 0, deuterium: 0 },
      speed || 100
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Emit Socket.io event to notify the client
    if (result.fleet) {
      emitFleetDispatched(session.user.id, {
        fleetId: result.fleet.id,
        originPlanetId: planetId,
        targetCoordinates: formatCoordinates(target),
        mission,
        arrivalTime: result.fleet.arrivalTime,
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      fleet: result.fleet,
    });
  } catch (error) {
    console.error('Fleet dispatch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/fleet/dispatch
 * Recall a traveling fleet
 *
 * Query parameters:
 * - fleetId: Fleet ID to recall
 */
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const fleetId = searchParams.get('fleetId');

    if (!fleetId) {
      return NextResponse.json(
        { error: 'fleetId is required' },
        { status: 400 }
      );
    }

    // Get fleet origin before recalling
    const fleet = await prisma.fleet.findUnique({
      where: { id: fleetId, userId: session.user.id },
    });

    if (!fleet) {
      return NextResponse.json(
        { error: 'Fleet not found' },
        { status: 404 }
      );
    }

    // Recall the fleet
    const result = await recallFleet(session.user.id, fleetId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Emit Socket.io event to notify the client
    emitFleetRecalled(session.user.id, {
      fleetId,
      originPlanetId: fleet.originId,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Fleet recall API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
