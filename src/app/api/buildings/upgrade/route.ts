import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  startBuildingUpgrade,
  cancelBuildingUpgrade,
} from '@/lib/game-engine/building-manager';
import { emitBuildingStarted, emitBuildingCancelled } from '@/lib/socket/server';
import { BUILDING_NAMES } from '@/lib/game-engine/constants';

/**
 * POST /api/buildings/upgrade
 * Start upgrading a building
 *
 * Body:
 * - planetId: Planet ID
 * - buildingType: Type of building to upgrade
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
    const { planetId, buildingType } = body;

    if (!planetId || !buildingType) {
      return NextResponse.json(
        { error: 'planetId and buildingType are required' },
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

    // Start the upgrade
    const result = await startBuildingUpgrade(planetId, buildingType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Emit Socket.io event to notify the client
    if (result.building && result.building.upgradeEndTime) {
      emitBuildingStarted(session.user.id, {
        planetId,
        buildingType,
        buildingName: BUILDING_NAMES[buildingType] || buildingType,
        level: result.building.level,
        upgradeEndTime: result.building.upgradeEndTime,
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      building: result.building,
    });
  } catch (error) {
    console.error('Building upgrade API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/buildings/upgrade
 * Cancel a building upgrade
 *
 * Query parameters:
 * - planetId: Planet ID
 * - buildingType: Type of building to cancel
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
    const buildingType = searchParams.get('buildingType');

    if (!planetId || !buildingType) {
      return NextResponse.json(
        { error: 'planetId and buildingType are required' },
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

    // Cancel the upgrade
    const result = await cancelBuildingUpgrade(planetId, buildingType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Emit Socket.io event to notify the client
    emitBuildingCancelled(session.user.id, {
      planetId,
      buildingType,
      buildingName: BUILDING_NAMES[buildingType] || buildingType,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      building: result.building,
    });
  } catch (error) {
    console.error('Building cancel API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
