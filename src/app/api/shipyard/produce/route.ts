import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  startShipProduction,
  cancelShipProduction,
} from '@/lib/game-engine/shipyard-manager';
import {
  emitShipProductionStarted,
  emitShipProductionCancelled,
} from '@/lib/socket/server';
import { SHIP_NAMES } from '@/lib/game-engine/constants';

/**
 * POST /api/shipyard/produce
 * Start producing ships
 *
 * Body:
 * - planetId: Planet ID
 * - shipType: Type of ship to produce
 * - quantity: Number of ships to produce
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
    const { planetId, shipType, quantity } = body;

    if (!planetId || !shipType || !quantity) {
      return NextResponse.json(
        { error: 'planetId, shipType, and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
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

    // Start production
    const result = await startShipProduction(planetId, shipType, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Emit Socket.io event to notify the client
    if (result.production) {
      emitShipProductionStarted(session.user.id, {
        planetId,
        shipType,
        shipName: SHIP_NAMES[shipType] || shipType,
        quantity,
        productionEndTime: result.production.endTime,
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      production: result.production,
    });
  } catch (error) {
    console.error('Ship production API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shipyard/produce
 * Cancel ship production
 *
 * Query parameters:
 * - planetId: Planet ID
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

    // Get current queue before cancelling
    const queue = planet.shipQueue as { shipType: string } | null;
    const shipType = queue?.shipType;

    // Cancel production
    const result = await cancelShipProduction(planetId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Emit Socket.io event to notify the client
    if (shipType) {
      emitShipProductionCancelled(session.user.id, {
        planetId,
        shipType,
        shipName: SHIP_NAMES[shipType] || shipType,
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Ship production cancel API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
