import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { completeShipProduction } from '@/lib/game-engine/shipyard-manager';
import { emitShipProductionCompleted } from '@/lib/socket/server';
import { SHIP_NAMES } from '@/lib/game-engine/constants';
import prisma from '@/lib/db';

/**
 * POST /api/shipyard/check-completion
 * Check if ship production is complete and complete it if so
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
    const body = await request.json();
    const { planetId } = body;

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

    // Try to complete the production
    const result = await completeShipProduction(planetId);

    if (!result.success) {
      return NextResponse.json({
        completed: false,
        message: result.message,
      });
    }

    // Emit Socket.io event to notify the client
    if (result.production) {
      emitShipProductionCompleted(session.user.id, {
        planetId,
        shipType: result.production.shipType,
        shipName: SHIP_NAMES[result.production.shipType] || result.production.shipType,
        quantity: result.production.quantity,
      });
    }

    return NextResponse.json({
      completed: true,
      message: result.message,
      production: result.production,
    });
  } catch (error) {
    console.error('Ship production check completion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
