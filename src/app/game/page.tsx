import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Link from 'next/link';
import { Header } from '@/components/layouts/header';
import { Toaster } from 'sonner';
import { ResourceDisplay } from '@/components/game/ResourceDisplay';
import { BuildingList } from '@/components/game/BuildingList';
import { calculateCurrentResources } from '@/lib/game-engine/resource-calculator';
import type { PlanetData } from '@/lib/game-engine/resource-calculator';

export default async function GamePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's planets
  const planets = await prisma.planet.findMany({
    where: { userId: session.user.id },
    include: {
      resources: true,
      buildings: true,
    },
  });

  const mainPlanet = planets[0]; // Get the first planet (home planet)

  // Calculate current resources with production rates
  let calculatedResources = null;
  if (mainPlanet && mainPlanet.resources) {
    const planetData: PlanetData = {
      temperature: mainPlanet.temperature,
      buildings: mainPlanet.buildings.map((b) => ({
        type: b.type,
        level: b.level,
      })),
      resources: {
        metal: mainPlanet.resources.metal,
        crystal: mainPlanet.resources.crystal,
        deuterium: mainPlanet.resources.deuterium,
        energy: mainPlanet.resources.energy,
        lastUpdate: mainPlanet.resources.lastUpdate,
      },
    };

    // TODO: Fetch energy tech level from research once research system is implemented
    const energyTechLevel = 0;
    calculatedResources = calculateCurrentResources(planetData, energyTechLevel);
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <Toaster position="top-center" richColors />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome message */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h1 className="text-2xl font-bold">
              Welcome back, {session.user.name}!
            </h1>
            <p className="mt-2 text-gray-400">
              Your empire awaits. Build your empire and conquer the galaxy!
            </p>
          </div>

          {/* Navigation Menu */}
          <div className="flex space-x-4 border-b border-gray-700 pb-2">
            <Link
              href="/game"
              className="px-4 py-2 text-blue-400 border-b-2 border-blue-400 font-medium"
            >
              Overview
            </Link>
            <Link
              href="/game/research"
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Research
            </Link>
            <Link
              href="/game/shipyard"
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Shipyard
            </Link>
            <Link
              href="/game/fleet"
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Fleet
            </Link>
            <Link
              href="/game/missions"
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Missions
            </Link>
          </div>

          {/* Planet overview */}
          {mainPlanet && calculatedResources && (
            <div className="rounded-lg bg-gray-800 p-6">
              <h2 className="text-xl font-bold">{mainPlanet.name}</h2>
              <p className="mt-1 text-sm text-gray-400">
                Coordinates: [{mainPlanet.galaxy}:{mainPlanet.system}:
                {mainPlanet.position}]
              </p>

              {/* Resources with real-time updates */}
              <div className="mt-6">
                <ResourceDisplay
                  planetId={mainPlanet.id}
                  initialResources={{
                    metal: calculatedResources.metal,
                    crystal: calculatedResources.crystal,
                    deuterium: calculatedResources.deuterium,
                    energy: calculatedResources.energy,
                  }}
                  initialProductionRates={calculatedResources.productionRates}
                  initialStorageCapacity={calculatedResources.storageCapacity}
                  initialEnergyBalance={calculatedResources.energyBalance}
                />
              </div>

            </div>
          )}

          {/* Buildings Section */}
          {mainPlanet && (
            <div className="rounded-lg bg-gray-800 p-6">
              <h2 className="text-xl font-bold">Buildings</h2>
              <p className="mt-1 text-sm text-gray-400">
                Upgrade buildings to improve production and unlock new features
              </p>
              <div className="mt-6">
                <BuildingList planetId={mainPlanet.id} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
