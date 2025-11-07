import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  startResearch,
  cancelResearch,
} from '@/lib/game-engine/research-manager';
import { emitResearchStarted, emitResearchCancelled } from '@/lib/socket/server';
import { RESEARCH_NAMES } from '@/lib/game-engine/constants';

/**
 * POST /api/research/upgrade
 * Start researching a technology
 *
 * Body:
 * - planetId: Planet ID (for resource deduction)
 * - researchType: Type of research to start
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { planetId, researchType } = body;

    if (!planetId || !researchType) {
      return NextResponse.json(
        { error: 'planetId and researchType are required' },
        { status: 400 }
      );
    }

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

    // Start the research
    const result = await startResearch(session.user.id, planetId, researchType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Get current research level
    const research = await prisma.research.findUnique({
      where: { userId: session.user.id },
    });

    const currentLevel = research ? (research[researchType as keyof typeof research] as number) : 0;

    // Emit Socket.io event to notify the client
    if (result.research && result.research.researchEndTime) {
      emitResearchStarted(session.user.id, {
        researchType,
        researchName: RESEARCH_NAMES[researchType] || researchType,
        level: currentLevel,
        researchEndTime: result.research.researchEndTime,
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      research: result.research,
    });
  } catch (error) {
    console.error('Research upgrade API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/research/upgrade
 * Cancel research in progress
 *
 * Query parameters:
 * - planetId: Planet ID (for resource refund)
 */
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
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
    });

    if (!planet) {
      return NextResponse.json(
        { error: 'Planet not found or access denied' },
        { status: 404 }
      );
    }

    // Get current research before cancelling
    const research = await prisma.research.findUnique({
      where: { userId: session.user.id },
    });

    const currentResearchType = research?.currentResearch;

    // Cancel the research
    const result = await cancelResearch(session.user.id, planetId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Emit Socket.io event to notify the client
    if (currentResearchType) {
      emitResearchCancelled(session.user.id, {
        researchType: currentResearchType,
        researchName: RESEARCH_NAMES[currentResearchType] || currentResearchType,
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      research: result.research,
    });
  } catch (error) {
    console.error('Research cancel API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
