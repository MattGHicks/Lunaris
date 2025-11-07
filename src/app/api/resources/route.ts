import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { syncPlanetResources } from '@/lib/game-engine/resource-sync';
import prisma from '@/lib/db';

/**
 * GET /api/resources
 * Fetches current resources for the user's planets
 * Automatically calculates accumulated resources since last update
 *
 * Query parameters:
 * - planetId (optional): Specific planet ID to fetch resources for
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get planetId from query params if provided
    const { searchParams } = new URL(request.url);
    const planetId = searchParams.get('planetId');

    // If planetId is provided, sync and return that specific planet
    if (planetId) {
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

      // TODO: Fetch energy tech level from research once research system is implemented
      const energyTechLevel = 0;

      // Sync resources
      const calculatedResources = await syncPlanetResources(planetId, energyTechLevel);

      if (!calculatedResources) {
        return NextResponse.json(
          { error: 'Failed to calculate resources' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        planetId,
        resources: {
          metal: calculatedResources.metal,
          crystal: calculatedResources.crystal,
          deuterium: calculatedResources.deuterium,
          energy: calculatedResources.energy,
        },
        productionRates: calculatedResources.productionRates,
        storageCapacity: calculatedResources.storageCapacity,
        energyBalance: calculatedResources.energyBalance,
        timestamp: new Date().toISOString(),
      });
    }

    // Otherwise, sync and return all planets for the user
    const planets = await prisma.planet.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, coordinates: true },
    });

    // TODO: Fetch energy tech level from research
    const energyTechLevel = 0;

    // Sync all planets and collect results
    const results = await Promise.all(
      planets.map(async (planet) => {
        const calculatedResources = await syncPlanetResources(planet.id, energyTechLevel);

        if (!calculatedResources) {
          return null;
        }

        return {
          planetId: planet.id,
          planetName: planet.name,
          coordinates: planet.coordinates,
          resources: {
            metal: calculatedResources.metal,
            crystal: calculatedResources.crystal,
            deuterium: calculatedResources.deuterium,
            energy: calculatedResources.energy,
          },
          productionRates: calculatedResources.productionRates,
          storageCapacity: calculatedResources.storageCapacity,
          energyBalance: calculatedResources.energyBalance,
        };
      })
    );

    // Filter out any null results
    const validResults = results.filter((r) => r !== null);

    return NextResponse.json({
      planets: validResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Resources API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
