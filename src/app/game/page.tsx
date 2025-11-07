import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { Header } from '@/components/layouts/header';
import { Toaster } from 'sonner';
import { ResourceDisplay } from '@/components/game/ResourceDisplay';
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

              {/* Buildings */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Buildings</h3>
                <div className="mt-2 grid gap-2">
                  {mainPlanet.buildings.map((building) => (
                    <div
                      key={building.id}
                      className="flex items-center justify-between rounded-md bg-gray-700 p-3"
                    >
                      <span className="capitalize">
                        {building.type.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold">Level {building.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Coming soon message */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-center">
            <p className="text-gray-400">
              More features coming soon! Building upgrade system is next.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
