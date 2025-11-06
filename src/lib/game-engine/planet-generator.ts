import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Initial starter resources for new players
 */
const STARTER_RESOURCES = {
  metal: 500,
  crystal: 300,
  deuterium: 100,
  energy: 0,
} as const;

/**
 * Initial starter buildings for new players
 */
const STARTER_BUILDINGS = [
  { type: 'metalMine', level: 1 },
  { type: 'crystalMine', level: 1 },
  { type: 'solarPlant', level: 1 },
] as const;

/**
 * Generate random planet coordinates
 * @returns Object with galaxy, system, and position
 */
async function generateRandomCoordinates(): Promise<{
  galaxy: number;
  system: number;
  position: number;
}> {
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const galaxy = Math.floor(Math.random() * 5) + 1; // 1-5
    const system = Math.floor(Math.random() * 499) + 1; // 1-499
    const position = Math.floor(Math.random() * 15) + 1; // 1-15

    const coordinates = `${galaxy}:${system}:${position}`;

    // Check if coordinates are already taken
    const existing = await prisma.planet.findUnique({
      where: { coordinates },
    });

    if (!existing) {
      return { galaxy, system, position };
    }

    attempts++;
  }

  throw new Error('Unable to find available coordinates after 100 attempts');
}

/**
 * Generate a random planet name
 * @returns Random planet name
 */
function generatePlanetName(): string {
  const prefixes = [
    'Nova',
    'Terra',
    'Alpha',
    'Beta',
    'Gamma',
    'Delta',
    'Omega',
    'Proxima',
    'Zenith',
    'Aurora',
    'Stellar',
    'Cosmic',
    'Nebula',
    'Celestial',
    'Astral',
  ];

  const suffixes = [
    'Prime',
    'Major',
    'Minor',
    'Centauri',
    'Station',
    'Outpost',
    'Colony',
    'Base',
    'Haven',
    'Refuge',
    'Settlement',
    'Keep',
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${prefix} ${suffix}`;
}

/**
 * Create initial planet for a new user
 * @param userId - The user ID to create the planet for
 * @returns The created planet with resources and buildings
 */
export async function createInitialPlanet(userId: string) {
  const coordinates = await generateRandomCoordinates();
  const planetName = generatePlanetName();

  // Calculate temperature based on position (closer to sun = hotter)
  const temperature = 120 - coordinates.position * 10;

  // Create planet with resources and buildings in a transaction
  const planet = await prisma.$transaction(async (tx) => {
    // Create the planet
    const newPlanet = await tx.planet.create({
      data: {
        name: planetName,
        galaxy: coordinates.galaxy,
        system: coordinates.system,
        position: coordinates.position,
        coordinates: `${coordinates.galaxy}:${coordinates.system}:${coordinates.position}`,
        temperature,
        userId,
      },
    });

    // Create initial resources
    await tx.resources.create({
      data: {
        planetId: newPlanet.id,
        ...STARTER_RESOURCES,
      },
    });

    // Create initial buildings
    await tx.building.createMany({
      data: STARTER_BUILDINGS.map((building) => ({
        planetId: newPlanet.id,
        type: building.type,
        level: building.level,
      })),
    });

    // Create research record for the user (if not exists)
    await tx.research.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return newPlanet;
  });

  return planet;
}

/**
 * Get available coordinates count (for debugging/monitoring)
 */
export async function getAvailableCoordinatesCount(): Promise<number> {
  const totalPossible = 5 * 499 * 15; // 5 galaxies * 499 systems * 15 positions
  const used = await prisma.planet.count();
  return totalPossible - used;
}
