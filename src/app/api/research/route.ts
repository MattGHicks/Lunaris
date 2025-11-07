import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { getResearchUpgradeInfo } from '@/lib/game-engine/research-calculator';
import { RESEARCH_NAMES, RESEARCH_DESCRIPTIONS, RESEARCH_TYPES } from '@/lib/game-engine/constants';
import type { ResearchInfo, BuildingInfo } from '@/lib/game-engine/research-calculator';

/**
 * GET /api/research
 * Fetches all research for a user with upgrade information
 *
 * Query parameters:
 * - planetId (required): Planet ID to use for resource checking
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get planetId from query params
    const { searchParams } = new URL(request.url);
    const planetId = searchParams.get('planetId');

    if (!planetId) {
      return NextResponse.json(
        { error: 'planetId is required' },
        { status: 400 }
      );
    }

    // Verify the planet belongs to the user
    const planet = await prisma.planet.findFirst({
      where: {
        id: planetId,
        userId: session.user.id,
      },
      include: {
        buildings: true,
        resources: true,
      },
    });

    if (!planet) {
      return NextResponse.json(
        { error: 'Planet not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch user's research
    const research = await prisma.research.findUnique({
      where: { userId: session.user.id },
    });

    if (!research) {
      return NextResponse.json(
        { error: 'Research not found' },
        { status: 404 }
      );
    }

    // Get research lab level
    const researchLabBuilding = planet.buildings.find((b) => b.type === 'researchLab');
    const researchLabLevel = researchLabBuilding?.level || 0;

    // Convert research to ResearchInfo format
    const researchInfos: ResearchInfo[] = Object.entries(research)
      .filter(([key]) =>
        key !== 'id' &&
        key !== 'userId' &&
        key !== 'createdAt' &&
        key !== 'updatedAt' &&
        key !== 'researching' &&
        key !== 'currentResearch' &&
        key !== 'researchEndTime'
      )
      .map(([key, value]) => ({
        type: key,
        level: value as number,
      }));

    // Convert buildings to BuildingInfo format
    const buildingInfos: BuildingInfo[] = planet.buildings.map((b) => ({
      type: b.type,
      level: b.level,
    }));

    // Prepare research data with upgrade info
    const researchWithInfo = Object.values(RESEARCH_TYPES).map((researchType) => {
      const currentLevel = research[researchType as keyof typeof research] as number;
      let upgradeInfo = null;

      // Only calculate upgrade info if not currently researching
      if (!research.researching && planet.resources) {
        try {
          upgradeInfo = getResearchUpgradeInfo(
            researchType,
            currentLevel,
            researchInfos,
            buildingInfos,
            {
              metal: planet.resources.metal,
              crystal: planet.resources.crystal,
              deuterium: planet.resources.deuterium,
            },
            researchLabLevel
          );
        } catch (error) {
          // If there's an error (e.g., invalid research type), skip upgrade info
          console.error(`Error calculating upgrade info for ${researchType}:`, error);
        }
      }

      return {
        type: researchType,
        name: RESEARCH_NAMES[researchType] || researchType,
        description: RESEARCH_DESCRIPTIONS[researchType] || '',
        level: currentLevel,
        upgradeInfo,
      };
    });

    return NextResponse.json({
      research: researchWithInfo,
      queue: {
        researching: research.researching,
        currentResearch: research.currentResearch,
        researchEndTime: research.researchEndTime,
      },
      researchLabLevel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
