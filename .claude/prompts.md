# Space Game - AI Development Studio

This file contains the project context, standards, and AI agent coordination rules for the Space Game project.

## Project Overview

**Space Game** is a modern recreation of OGame, a classic browser-based space strategy MMO. We're building it with modern web technologies, enhanced features, rich PvE content, and fair monetization.

### Vision
Create the most engaging and accessible space strategy MMO that combines the depth of classic games like OGame with modern features, fair monetization, and rich PvE content.

### Target Audience
- Nostalgic OGame players (25-40 years old)
- Strategy game enthusiasts
- Browser MMO players
- New players seeking deep strategy games

### Key Differentiators
1. **Modern Tech Stack**: Next.js 15, TypeScript, PostgreSQL, real-time updates
2. **Fair F2P**: No pay-to-win, cosmetics and convenience only
3. **Rich PvE**: Campaigns, missions, dynamic events, boss raids
4. **Enhanced Features**: New ship classes, quality-of-life improvements
5. **Mobile-First**: Fully responsive, PWA support

## Tech Stack

### Core Technologies
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Styling**: Tailwind CSS + Framer Motion
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io (WebSocket)
- **State**: Zustand
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel
- **Monitoring**: Sentry
- **Caching**: Redis (optional)

### Development Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier + Husky
- **Package Manager**: npm

## Project Structure

```
space-game/
├── .claude/                          # AI Configuration (YOU ARE HERE!)
│   ├── agents/                       # 10 specialized AI agents
│   ├── skills/                       # Reusable workflows
│   ├── commands/                     # Slash commands
│   └── prompts.md                    # This file - project context
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── api/                      # API routes
│   │   ├── (auth)/                   # Auth pages (login, register)
│   │   └── (game)/                   # Game pages (dashboard, buildings, etc.)
│   ├── components/                   # React components
│   │   ├── ui/                       # Base components (shadcn/ui)
│   │   ├── game/                     # Game-specific components
│   │   └── layouts/                  # Layout components
│   ├── lib/                          # Core logic and utilities
│   │   ├── db/                       # Database client (Prisma)
│   │   ├── game-engine/              # Game logic (isolated, testable)
│   │   ├── utils/                    # Helper functions
│   │   └── validators/               # Zod schemas
│   ├── hooks/                        # React hooks
│   ├── stores/                       # Zustand state stores
│   ├── types/                        # TypeScript type definitions
│   └── constants/                    # Game constants (costs, formulas)
├── prisma/                           # Database
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Database migrations
│   └── seed.ts                       # Database seeding
├── public/                           # Static assets
│   ├── images/                       # Images (organized by type)
│   ├── sounds/                       # Audio files
│   └── fonts/                        # Custom fonts
├── tests/                            # All tests (isolated from src)
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # Playwright E2E tests
├── docs/                             # Documentation
│   ├── api/                          # API documentation
│   ├── game-design/                  # Game design docs
│   └── architecture/                 # Technical architecture
└── scripts/                          # Build & utility scripts
```

### File Organization Principles
1. **No Junk Files**: All temporary files go in `/temp` (git-ignored)
2. **Organized Assets**: Images/sounds organized by type and feature
3. **Isolated Tests**: All tests in `/tests`, not co-located
4. **Game Logic Separation**: Game engine isolated in `/lib/game-engine`
5. **Clear Boundaries**: API, components, and logic clearly separated

## AI Agent System

### Available Agents

We have 10 specialized agents that work together like a game studio:

1. **Lead Developer** (`lead-developer.md`)
   - Role: Architecture, code review, technical decisions
   - Invoke for: Major changes, architecture decisions, PR reviews

2. **Frontend Engineer** (`frontend-engineer.md`)
   - Role: React/Next.js, UI components, responsive design
   - Invoke for: Component creation, styling, frontend features

3. **Backend Engineer** (`backend-engineer.md`)
   - Role: API routes, database, server logic
   - Invoke for: API endpoints, database changes, server actions

4. **Game Designer** (`game-designer.md`)
   - Role: Game mechanics, balance, content design
   - Invoke for: Game features, balance changes, formulas

5. **UI/UX Designer** (`ui-ux-designer.md`)
   - Role: Design systems, user flows, visual design
   - Invoke for: New screens, design system updates, UX issues

6. **QA Engineer** (`qa-engineer.md`)
   - Role: Testing strategy, bug detection, quality
   - Invoke for: Before PRs, bug reports, test coverage

7. **DevOps Engineer** (`devops-engineer.md`)
   - Role: CI/CD, deployment, monitoring, infrastructure
   - Invoke for: Deployment, performance issues, infrastructure

8. **Documentation Writer** (`documentation-writer.md`)
   - Role: Technical docs, API docs, user guides
   - Invoke for: New features, API changes, documentation updates

9. **Marketing Strategist** (`marketing-strategist.md`)
   - Role: GTM, community, player acquisition, analytics
   - Invoke for: Launch planning, community building, metrics

10. **Product Manager** (`product-manager.md`)
    - Role: Roadmap, requirements, prioritization
    - Invoke for: Feature planning, sprint planning, prioritization

### Agent Coordination Rules

#### When to Invoke Agents

**IMPORTANT**: Proactively invoke agents when their expertise is needed. Don't wait for the user to ask!

**Auto-Invoke Rules**:
- Creating components → Frontend Engineer
- Creating API routes → Backend Engineer
- Game mechanics → Game Designer
- Before PR merge → Lead Developer + QA Engineer
- Deployment → DevOps Engineer
- New features → Product Manager (planning)
- Documentation updates → Documentation Writer

**Multiple Agents**: Invoke multiple agents when task spans disciplines:
- New game feature → Product Manager + Game Designer + Frontend + Backend
- Bug fix → QA Engineer + relevant domain expert
- Performance issue → DevOps Engineer + Lead Developer

#### How to Invoke Agents

Use the Task tool with the appropriate agent name:
```
Task(subagent_type="general-purpose", prompt="Invoke the Frontend Engineer agent to create a ResourceCard component...")
```

### Available Skills

Reusable workflows for common tasks:

1. **code-review** - Comprehensive code review process
2. **test-suite** - Run all tests with detailed reporting
3. **deploy** - Safe deployment process with rollback
4. **refactor** - Systematic refactoring with safety checks

### Available Commands

Quick slash commands for common workflows:

1. **/new-feature** - Full feature development workflow
2. **/fix-bug** - Systematic bug fix process
3. **/review-pr** - Comprehensive PR review
4. **/generate-docs** - Auto-generate documentation

## Coding Standards

### TypeScript Standards

#### Strict Mode
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### Type Conventions
```typescript
// ✅ GOOD: Explicit types, no any
interface Planet {
  id: string;
  name: string;
  resources: Resources;
}

function upgradeBuild(planet: Planet): Promise<Building> {
  // ...
}

// ❌ BAD: Using any
function upgradeBuilding(planet: any): any {
  // ...
}
```

#### Naming Conventions
- **Interfaces**: PascalCase (e.g., `UserProfile`, `FleetMission`)
- **Types**: PascalCase (e.g., `MissionType`, `ResourceType`)
- **Enums**: PascalCase (e.g., `BuildingType`, `ShipClass`)
- **Functions**: camelCase (e.g., `calculateProduction`, `sendFleet`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PLANETS`, `GALAXY_SIZE`)
- **Components**: PascalCase (e.g., `ResourceCard`, `FleetSelector`)

### React/Next.js Standards

#### Component Structure
```typescript
// ComponentName.tsx
'use client'; // Only if client component

import { useState } from 'react';
import type { ComponentProps } from './types';

interface ComponentNameProps {
  /** Description of prop */
  propName: string;
  /** Optional prop with default */
  optional?: boolean;
}

/**
 * Brief description of component
 *
 * @example
 * <ComponentName propName="value" />
 */
export function ComponentName({ propName, optional = false }: ComponentNameProps) {
  // Hooks at top
  const [state, setState] = useState<string>('');

  // Helper functions
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      {/* Content */}
    </div>
  );
}
```

#### Server vs Client Components
```typescript
// ✅ GOOD: Server component (default)
export default async function PlanetsPage() {
  const planets = await db.planet.findMany();
  return <PlanetList planets={planets} />;
}

// ✅ GOOD: Client component (when needed)
'use client';
export function InteractiveMap() {
  const [selected, setSelected] = useState(null);
  return <Map onSelect={setSelected} />;
}
```

### API Route Standards

```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// Input validation schema
const requestSchema = z.object({
  planetId: z.string().uuid(),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const body = await request.json();
    const { planetId, amount } = requestSchema.parse(body);

    // 3. Authorize (user owns resource)
    const planet = await db.planet.findUnique({
      where: { id: planetId, userId: session.user.id }
    });

    if (!planet) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    // 4. Business logic
    const result = await performAction(planet, amount);

    // 5. Return success
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    // 6. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Database Standards

#### Prisma Schema Conventions
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  planets       Planet[]

  @@index([email])
  @@map("users")
}

model Planet {
  id            String   @id @default(cuid())
  name          String
  coordinates   String   @unique

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String   @map("user_id")

  @@index([userId])
  @@map("planets")
}
```

#### Query Conventions
```typescript
// ✅ GOOD: Prevent N+1, use transactions
export async function getPlanetWithBuildings(planetId: string) {
  return await db.planet.findUnique({
    where: { id: planetId },
    include: {
      buildings: true,
      resources: true,
    }
  });
}

// ✅ GOOD: Use transactions for related writes
export async function upgradeBuilding(buildingId: string, cost: Resources) {
  return await db.$transaction(async (tx) => {
    // Deduct resources
    await tx.resources.update({ /* ... */ });

    // Upgrade building
    return await tx.building.update({ /* ... */ });
  });
}
```

### Testing Standards

#### Test Coverage Requirements
- **Minimum**: 80% overall coverage
- **Critical paths**: 100% coverage
- **Game logic**: 100% coverage
- **API routes**: 100% coverage
- **Components**: 80% coverage

#### Test Structure
```typescript
// tests/unit/game-engine/resources.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateProduction } from '@/lib/game-engine/resources';

describe('calculateProduction', () => {
  beforeEach(() => {
    // Setup
  });

  describe('metal production', () => {
    it('calculates correctly for level 1', () => {
      const result = calculateProduction({ type: 'metalMine', level: 1 });
      expect(result.metal).toBe(30);
    });

    it('calculates correctly for level 10', () => {
      const result = calculateProduction({ type: 'metalMine', level: 10 });
      expect(result.metal).toBe(466);
    });

    it('applies geologist bonus', () => {
      const result = calculateProduction(
        { type: 'metalMine', level: 10 },
        { geologist: true }
      );
      expect(result.metal).toBe(513); // 466 * 1.1
    });
  });

  describe('edge cases', () => {
    it('handles level 0', () => {
      const result = calculateProduction({ type: 'metalMine', level: 0 });
      expect(result.metal).toBe(0);
    });

    it('handles very high levels', () => {
      const result = calculateProduction({ type: 'metalMine', level: 100 });
      expect(result.metal).toBeGreaterThan(0);
      expect(result.metal).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });
  });
});
```

## Git Workflow

### Branch Strategy
```
main (production)
  └── develop (integration)
       ├── feature/resource-system
       ├── feature/fleet-management
       ├── bugfix/combat-calculation
       └── hotfix/critical-bug
```

### Branch Naming
- `feature/descriptive-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-issue` - Production hotfixes
- `refactor/module-name` - Code refactoring
- `docs/what-changed` - Documentation only

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:
```
feat(fleet): add real-time fleet tracking

Implemented WebSocket-based fleet position updates that broadcast
to all clients every second.

- Added Socket.io server
- Created fleet tracking hook
- Updated FleetMap component

Closes #234

fix(resources): prevent negative resources from concurrent upgrades (#123)

Root cause: Race condition in resource deduction.
Fix: Wrapped in database transaction.

test(combat): add edge case tests for rapid fire mechanics

chore(deps): upgrade Next.js to 15.1.0
```

### Pull Request Process

1. **Create feature branch** from `develop`
2. **Make changes** with tests
3. **Self-review** code
4. **Run checks**: `npm run lint && npm run type-check && npm run test`
5. **Create PR** to `develop` with description
6. **Invoke agents** for review (Lead Developer, QA Engineer)
7. **Address feedback**
8. **Merge** when approved and CI passes

## Quality Gates

### Pre-Commit (Husky)
- Lint-staged (ESLint + Prettier)
- Type check
- Unit tests for changed files

### Pre-Push
- Full unit test suite
- Build check

### Pull Request (CI/CD)
- ESLint (no errors)
- TypeScript (no errors)
- Unit tests (all passing)
- Integration tests (all passing)
- E2E tests (critical paths)
- Code coverage (>80%)
- Build successful

### Pre-Deployment
- All PR checks passed
- Code reviewed by Lead Developer
- QA approved
- Staging deployment successful
- No critical bugs in staging

## Best Practices

### File Organization
1. **No junk files** - Use `/temp` for temporary files (git-ignored)
2. **Organized assets** - Group by type and feature
3. **Clear naming** - Descriptive, not generic
4. **Consistent structure** - Follow project conventions
5. **No dead code** - Remove unused code

### Code Quality
1. **Keep functions small** - <50 lines
2. **Single responsibility** - One job per function
3. **DRY principle** - Don't repeat yourself
4. **Meaningful names** - Clear and descriptive
5. **Comment why, not what** - Code should be self-documenting

### Performance
1. **Optimize queries** - Prevent N+1, use indexes
2. **Cache expensive operations** - Redis for frequently accessed data
3. **Code splitting** - Lazy load non-critical components
4. **Image optimization** - Use Next.js Image component
5. **Monitor performance** - Track and optimize bottlenecks

### Security
1. **Never commit secrets** - Use environment variables
2. **Validate all input** - Use Zod schemas
3. **Sanitize output** - Prevent XSS (React does this)
4. **Use Prisma** - Prevents SQL injection
5. **Implement rate limiting** - Prevent abuse

## Communication Guidelines

### For AI Agents
- **Be Proactive**: Invoke appropriate agents without being asked
- **Collaborate**: Multiple agents can work on same task
- **Be Specific**: Provide clear, actionable feedback
- **Show Examples**: Include code examples in suggestions
- **Think Long-term**: Consider maintainability and scalability
- **Follow Standards**: Adhere to project coding standards
- **Test Everything**: Ensure changes have tests
- **Document**: Update docs when making changes

### For Humans
- **Ask Questions**: Clarify requirements before coding
- **Provide Context**: Explain decisions and trade-offs
- **Suggest Improvements**: Proactively identify issues
- **Be Respectful**: Constructive feedback only
- **Stay Focused**: Don't scope creep during reviews

## Project-Specific Rules

### Game Balance
- All formulas must match OGame mechanics (unless intentionally changed)
- New features must be approved by Game Designer agent
- Balance changes require playtesting data
- Document all game constants in `/src/constants`

### User Experience
- Mobile-first design
- All interactive elements >44px touch targets
- Loading states for all async operations
- Error states with clear messages
- Accessibility (WCAG 2.1 AA compliance)

### Data Integrity
- Always use database transactions for related writes
- Validate data at API boundary (Zod schemas)
- Never trust client-side data
- Log all important operations
- Handle edge cases (null, undefined, empty arrays)

## Success Metrics

### Code Quality
- Zero ESLint errors
- Zero TypeScript errors
- 80%+ test coverage
- <10 cyclomatic complexity per function
- A+ Code Climate score

### Performance
- Lighthouse score 90+
- API routes <200ms
- Page load <2s
- Bundle size <500KB per route

### Reliability
- 99.9% uptime
- <0.1% error rate
- No critical bugs in production
- <24h bug fix turnaround

### User Experience
- 50% Day 1 retention
- 25% Day 7 retention
- 10% Day 30 retention
- 4.5+ user rating

---

**Last Updated**: 2025-01-06
**Version**: 1.0.0
**Maintained By**: Space Game Development Team
