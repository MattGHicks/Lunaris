import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { FleetOverview } from '@/components/game/FleetOverview';

export default async function FleetPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Get user's first planet
  const planet = await prisma.planet.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!planet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Fleet</h1>
          <p className="text-gray-400">No planet found. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <FleetOverview planetId={planet.id} />
      </div>
    </div>
  );
}
