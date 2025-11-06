import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import { registerSchema } from '@/lib/validators/auth';
import { hashPassword } from '@/lib/auth/password';
import { createInitialPlanet } from '@/lib/game-engine/planet-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, email, password } = validationResult.data;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and initial planet in a transaction
    try {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      });

      // Create initial planet for the user
      await createInitialPlanet(user.id);

      return NextResponse.json(
        {
          message: 'Registration successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      // Handle unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes('username')) {
            return NextResponse.json(
              { error: 'Username already taken' },
              { status: 409 }
            );
          }
          if (target.includes('email')) {
            return NextResponse.json(
              { error: 'Email already registered' },
              { status: 409 }
            );
          }
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
