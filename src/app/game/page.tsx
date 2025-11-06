import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { Header } from '@/components/layouts/header';
import { Toaster } from 'sonner';

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
              Your empire awaits. Choose your planet to view details.
            </p>
          </div>

          {/* Planet overview */}
          {mainPlanet && (
            <div className="rounded-lg bg-gray-800 p-6">
              <h2 className="text-xl font-bold">{mainPlanet.name}</h2>
              <p className="mt-1 text-sm text-gray-400">
                Coordinates: [{mainPlanet.galaxy}:{mainPlanet.system}:
                {mainPlanet.position}]
              </p>

              {/* Resources */}
              {mainPlanet.resources && (
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-md bg-gray-700 p-4">
                    <p className="text-sm text-gray-400">Metal</p>
                    <p className="text-2xl font-bold text-metal">
                      {Math.floor(mainPlanet.resources.metal).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-md bg-gray-700 p-4">
                    <p className="text-sm text-gray-400">Crystal</p>
                    <p className="text-2xl font-bold text-crystal">
                      {Math.floor(mainPlanet.resources.crystal).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-md bg-gray-700 p-4">
                    <p className="text-sm text-gray-400">Deuterium</p>
                    <p className="text-2xl font-bold text-deuterium">
                      {Math.floor(mainPlanet.resources.deuterium).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-md bg-gray-700 p-4">
                    <p className="text-sm text-gray-400">Energy</p>
                    <p className="text-2xl font-bold text-energy">
                      {Math.floor(mainPlanet.resources.energy).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

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
              More features coming soon! The game is under active development.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
