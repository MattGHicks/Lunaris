import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { ShipList } from '@/components/game/ShipList';
import { calculateCurrentResources } from '@/lib/game-engine/resource-calculator';
import type { PlanetData } from '@/lib/game-engine/resource-calculator';

export default async function ShipyardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Get user's first planet
  const planet = await prisma.planet.findFirst({
    where: { userId: session.user.id },
    include: {
      buildings: true,
      resources: true,
      user: {
        include: {
          research: true,
        },
      },
    },
  });

  if (!planet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Shipyard</h1>
          <p className="text-gray-400">No planet found. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Calculate current resources
  let currentResources = { metal: 0, crystal: 0, deuterium: 0 };
  if (planet.resources) {
    const planetData: PlanetData = {
      temperature: planet.temperature,
      buildings: planet.buildings.map((b) => ({
        type: b.type,
        level: b.level,
      })),
      resources: {
        metal: planet.resources.metal,
        crystal: planet.resources.crystal,
        deuterium: planet.resources.deuterium,
        energy: planet.resources.energy,
        lastUpdate: planet.resources.lastUpdate,
      },
    };

    const energyTechLevel = planet.user.research?.energyTech || 0;
    const calculatedResources = calculateCurrentResources(planetData, energyTechLevel);
    currentResources = {
      metal: calculatedResources.metal,
      crystal: calculatedResources.crystal,
      deuterium: calculatedResources.deuterium,
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <ShipList planetId={planet.id} initialResources={currentResources} />
      </div>
    </div>
  );
}
