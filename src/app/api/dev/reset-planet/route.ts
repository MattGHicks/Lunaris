import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * POST /api/dev/reset-planet
 * Resets the user's planet to initial state for testing
 * WARNING: This is a dev-only endpoint!
 */
export async function POST() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's planet
    const planet = await prisma.planet.findFirst({
      where: { userId: session.user.id },
      include: {
        buildings: true,
        resources: true,
      },
    });

    if (!planet) {
      return NextResponse.json({ error: 'Planet not found' }, { status: 404 });
    }

    // Reset in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all buildings
      await tx.building.deleteMany({
        where: { planetId: planet.id },
      });

      // Create initial buildings
      const starterBuildings = [
        { type: 'metalMine', level: 1 },
        { type: 'crystalMine', level: 1 },
        { type: 'solarPlant', level: 1 },
      ];

      await tx.building.createMany({
        data: starterBuildings.map((building) => ({
          planetId: planet.id,
          type: building.type,
          level: building.level,
        })),
      });

      // Reset resources
      await tx.resources.update({
        where: { planetId: planet.id },
        data: {
          metal: 500,
          crystal: 300,
          deuterium: 100,
          energy: 0,
          lastUpdate: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Planet reset to initial state',
    });
  } catch (error) {
    console.error('Reset planet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
