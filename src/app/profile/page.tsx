import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { Header } from '@/components/layouts/header';
import { Toaster } from 'sonner';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      planets: {
        include: {
          resources: true,
        },
      },
      research: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Calculate total resources across all planets
  const totalResources = user.planets.reduce(
    (acc, planet) => {
      if (planet.resources) {
        acc.metal += planet.resources.metal;
        acc.crystal += planet.resources.crystal;
        acc.deuterium += planet.resources.deuterium;
      }
      return acc;
    },
    { metal: 0, crystal: 0, deuterium: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <Toaster position="top-center" richColors />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile header */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <p className="mt-1 text-gray-400">{user.email}</p>
            <p className="mt-2 text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Empire statistics */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="text-xl font-bold">Empire Statistics</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-md bg-gray-700 p-4">
                <p className="text-sm text-gray-400">Planets</p>
                <p className="text-2xl font-bold">{user.planets.length}</p>
              </div>
              <div className="rounded-md bg-gray-700 p-4">
                <p className="text-sm text-gray-400">Total Metal</p>
                <p className="text-2xl font-bold text-metal">
                  {Math.floor(totalResources.metal).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md bg-gray-700 p-4">
                <p className="text-sm text-gray-400">Total Crystal</p>
                <p className="text-2xl font-bold text-crystal">
                  {Math.floor(totalResources.crystal).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Planets list */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="text-xl font-bold">Your Planets</h2>
            <div className="mt-4 space-y-3">
              {user.planets.map((planet) => (
                <div
                  key={planet.id}
                  className="rounded-md bg-gray-700 p-4 hover:bg-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{planet.name}</h3>
                      <p className="text-sm text-gray-400">
                        [{planet.galaxy}:{planet.system}:{planet.position}]
                      </p>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-metal">
                        M: {Math.floor(planet.resources?.metal || 0).toLocaleString()}
                      </span>
                      <span className="text-crystal">
                        C:{' '}
                        {Math.floor(planet.resources?.crystal || 0).toLocaleString()}
                      </span>
                      <span className="text-deuterium">
                        D:{' '}
                        {Math.floor(
                          planet.resources?.deuterium || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research levels */}
          {user.research && (
            <div className="rounded-lg bg-gray-800 p-6">
              <h2 className="text-xl font-bold">Research</h2>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <div className="rounded-md bg-gray-700 p-3">
                  <span className="text-sm">Espionage Technology</span>
                  <span className="ml-2 font-semibold">
                    Level {user.research.espionageTech}
                  </span>
                </div>
                <div className="rounded-md bg-gray-700 p-3">
                  <span className="text-sm">Computer Technology</span>
                  <span className="ml-2 font-semibold">
                    Level {user.research.computerTech}
                  </span>
                </div>
                <div className="rounded-md bg-gray-700 p-3">
                  <span className="text-sm">Weapons Technology</span>
                  <span className="ml-2 font-semibold">
                    Level {user.research.weaponsTech}
                  </span>
                </div>
                <div className="rounded-md bg-gray-700 p-3">
                  <span className="text-sm">Shielding Technology</span>
                  <span className="ml-2 font-semibold">
                    Level {user.research.shieldingTech}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
