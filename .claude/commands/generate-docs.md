# Generate Documentation Command

This command automatically generates or updates documentation for the project.

## Usage
```
/generate-docs [type]
```

Types:
- `api` - Generate API documentation
- `readme` - Update README.md
- `wiki` - Generate game wiki/guides
- `all` - Generate all documentation

Example: `/generate-docs api`

## Workflow

### 1. Invoke Documentation Writer Agent
The Documentation Writer agent will handle all documentation generation.

### 2. Generate API Documentation

#### Scan API Routes
```bash
# Find all API routes
find src/app/api -name "route.ts" -o -name "*.ts"
```

#### Extract JSDoc Comments
For each API route, extract:
- Route path
- HTTP methods
- Request parameters
- Request body schema
- Response schema
- Error responses
- Authentication requirements
- Examples

#### Generate API Docs
```markdown
# API Documentation

## Authentication

All API routes except `/api/auth/*` require authentication.

**Authentication Header**:
```
Authorization: Bearer <token>
```

---

## Endpoints

### GET /api/planets
Get all planets for the authenticated user.

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "planets": [
    {
      "id": "clx...",
      "name": "Homeworld",
      "coordinates": "1:234:5",
      "resources": {
        "metal": 10000,
        "crystal": 5000,
        "deuterium": 2000
      }
    }
  ]
}
```

**Errors**:
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

**Example**:
```bash
curl -H "Authorization: Bearer <token>" \
  https://space-game.com/api/planets
```

---

### POST /api/buildings/upgrade
Upgrade a building on a planet.

**Authentication**: Required

**Request Body**:
```json
{
  "buildingId": "metalMine",
  "planetId": "clx..."
}
```

**Request Schema**:
```typescript
{
  buildingId: string;  // Building type ID
  planetId: string;    // Planet UUID
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "level": 6,
    "upgradeEndTime": "2025-01-15T14:30:00Z"
  }
}
```

**Errors**:
- `400 Bad Request` - Invalid input or insufficient resources
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not your planet
- `404 Not Found` - Building or planet not found
- `500 Internal Server Error` - Server error

**Example**:
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"buildingId":"metalMine","planetId":"clx..."}' \
  https://space-game.com/api/buildings/upgrade
```

---

[Continue for all endpoints...]
```

### 3. Update README.md

#### Check Current README
```bash
# Read current README
cat README.md
```

#### Generate/Update Sections

**Essential Sections**:
1. Project Title & Description
2. Features
3. Tech Stack
4. Getting Started
5. Project Structure
6. Development
7. Testing
8. Deployment
9. Contributing
10. License

```markdown
# Space Game

> A modern recreation of OGame with enhanced features, PvE content, and fair monetization.

[![CI/CD](https://github.com/user/space-game/workflows/CI/badge.svg)](https://github.com/user/space-game/actions)
[![Coverage](https://codecov.io/gh/user/space-game/branch/main/graph/badge.svg)](https://codecov.io/gh/user/space-game)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- ⚡ **Real-time Updates**: WebSocket-powered resource production and fleet tracking
- 🚀 **14+ Ship Types**: Classic ships plus new classes (support, stealth, titans)
- ⚔️ **Advanced Combat**: Detailed combat system with rapid fire and tech bonuses
- 🤖 **Rich PvE Content**: Campaigns, missions, dynamic events, boss raids
- 🌌 **Galaxy Exploration**: Explore vast universe with alliance coordination
- 👥 **Alliance System**: ACS attacks, shared defenses, alliance wars
- 📱 **Mobile Optimized**: Fully responsive design for phone and tablet
- 🎨 **Modern UI**: Beautiful space-themed design with smooth animations
- 🔒 **Secure**: Industry-standard security practices and authentication
- ⚖️ **Fair F2P**: No pay-to-win, cosmetics and convenience only

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) + TypeScript
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Real-time**: [Socket.io](https://socket.io/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or higher
- [PostgreSQL](https://www.postgresql.org/) 16 or higher
- [Redis](https://redis.io/) (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/space-game.git
   cd space-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/space_game"
   NEXTAUTH_SECRET="generate-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   REDIS_URL="redis://localhost:6379"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database** (optional)
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
space-game/
├── .claude/                   # AI agents, skills, commands
│   ├── agents/                # Specialized AI agents
│   ├── skills/                # Reusable workflows
│   └── commands/              # Slash commands
├── src/
│   ├── app/                   # Next.js app directory (routes)
│   │   ├── api/               # API routes
│   │   ├── (auth)/            # Auth pages
│   │   └── (game)/            # Game pages
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components (shadcn/ui)
│   │   ├── game/              # Game-specific components
│   │   └── layouts/           # Layout components
│   ├── lib/                   # Utilities and core logic
│   │   ├── db/                # Database client
│   │   ├── game-engine/       # Game logic (isolated)
│   │   ├── utils/             # Helper functions
│   │   └── validators/        # Zod schemas
│   ├── hooks/                 # React hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types
│   └── constants/             # Game constants
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma          # Prisma schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding
├── public/                    # Static assets
├── tests/                     # All tests
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # E2E tests (Playwright)
├── docs/                      # Documentation
│   ├── api/                   # API documentation
│   ├── game-design/           # Game design docs
│   └── architecture/          # Technical docs
└── scripts/                   # Build & utility scripts
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests
npm run test:all         # Run all tests

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # Run TypeScript compiler
npm run format           # Format with Prettier

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Create & apply migration
npx prisma generate      # Generate Prisma Client
npx prisma db seed       # Seed database
```

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run tests: `npm run test`
4. Commit: `git commit -m "feat: your feature"`
5. Push: `git push origin feature/your-feature`
6. Create pull request

## 🧪 Testing

We maintain high test coverage (>80%) across the codebase.

### Running Tests

```bash
# Unit tests (Vitest)
npm run test

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# All tests
npm run test:all

# Coverage report
npm run test:coverage
```

### Writing Tests

- Unit tests: `src/**/*.test.ts`
- Integration tests: `tests/integration/**/*.test.ts`
- E2E tests: `tests/e2e/**/*.spec.ts`

## 🚢 Deployment

### Staging
Automatically deployed on push to `develop` branch.

### Production
Automatically deployed on push to `main` branch.

### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use Prettier for formatting
- Follow component naming conventions
- Write meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the original [OGame](https://ogame.org/)
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## 📞 Contact

- Website: [https://space-game.com](https://space-game.com)
- Discord: [Join our community](https://discord.gg/space-game)
- Twitter: [@SpaceGameDev](https://twitter.com/SpaceGameDev)
- Email: support@space-game.com

---

Made with ❤️ by the Space Game team
```

### 4. Generate Game Wiki

#### Create User Guides
```markdown
# Space Game Wiki

Welcome to the Space Game wiki! Learn everything you need to dominate the galaxy.

## Table of Contents
- [Getting Started](#getting-started)
- [Resources](#resources)
- [Buildings](#buildings)
- [Research](#research)
- [Fleet](#fleet)
- [Combat](#combat)
- [Alliance](#alliance)
- [PvE Content](#pve-content)
- [Advanced Strategies](#advanced-strategies)

## Getting Started

### Your First Hour
[Beginner guide content...]

### Understanding Resources
[Resource mechanics...]

[Continue with comprehensive guides...]
```

### 5. Update Changelog
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Real-time resource updates via WebSocket
- New ship class: Support ships
- PvE mission: Convoy Escort

### Changed
- Improved combat report UI
- Optimized database queries for fleet operations

### Fixed
- Fixed negative resources from concurrent upgrades (#123)
- Fixed fleet speed calculation with multiple drive types

## [1.0.0] - 2025-01-15

### Added
- Initial release
- Core game mechanics
- 18 building types
- 16 research technologies
- 14 ship types
- Combat system
- Alliance system
- Galaxy exploration

[Full changelog...]
```

### 6. Generate JSDoc for Code
```bash
# Find files missing documentation
grep -r "export function" src/ | grep -v "/**"
```

Add JSDoc comments:
```typescript
/**
 * Calculates the production rate for a resource building
 *
 * Uses the formula: base × level × factor^level × bonus
 * where bonus includes officer and technology multipliers.
 *
 * @param building - The building to calculate production for
 * @param level - Current building level
 * @param bonuses - Active bonuses (officers, technologies)
 * @returns Production rate per hour
 *
 * @example
 * const production = calculateProduction(
 *   BUILDINGS.metalMine,
 *   10,
 *   { geologist: true, energyTech: 5 }
 * );
 * // Returns: 466 (metal per hour)
 */
export function calculateProduction(
  building: Building,
  level: number,
  bonuses: ProductionBonuses
): number {
  // Implementation
}
```

### 7. Generate CONTRIBUTING.md
```markdown
# Contributing to Space Game

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct
[Code of conduct...]

## How to Contribute
[Contribution guidelines...]

## Development Setup
[Setup instructions...]

## Pull Request Process
[PR guidelines...]

## Coding Standards
[Coding standards...]
```

## Success Criteria
- ✅ API documentation complete and accurate
- ✅ README.md up-to-date
- ✅ Game wiki comprehensive
- ✅ Changelog updated
- ✅ Code JSDoc comments added
- ✅ Contributing guidelines clear
