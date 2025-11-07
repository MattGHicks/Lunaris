import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { completeResearch } from '@/lib/game-engine/research-manager';
import { emitResearchCompleted } from '@/lib/socket/server';
import { RESEARCH_NAMES } from '@/lib/game-engine/constants';
import prisma from '@/lib/db';

/**
 * POST /api/research/check-completion
 * Check if research is complete and complete it if so
 */
export async function POST() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get research before completion
    const researchBefore = await prisma.research.findUnique({
      where: { userId: session.user.id },
    });

    if (!researchBefore?.currentResearch) {
      return NextResponse.json({
        completed: false,
        message: 'No research in progress',
      });
    }

    const researchType = researchBefore.currentResearch;
    const oldLevel = researchBefore[researchType as keyof typeof researchBefore] as number;

    // Try to complete the research
    const result = await completeResearch(session.user.id);

    if (!result.success) {
      return NextResponse.json({
        completed: false,
        message: result.message,
      });
    }

    // Emit Socket.io event to notify the client
    emitResearchCompleted(session.user.id, {
      researchType,
      researchName: RESEARCH_NAMES[researchType] || researchType,
      newLevel: oldLevel + 1,
    });

    return NextResponse.json({
      completed: true,
      message: result.message,
      research: {
        researchType,
        newLevel: oldLevel + 1,
      },
    });
  } catch (error) {
    console.error('Research check completion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
