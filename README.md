# Lunaris

> A modern recreation of OGame with enhanced features, PvE content, and fair monetization

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

## 🎯 Implementation Status

### ✅ Phase 1: Authentication & User System (Completed)

**Core Authentication**
- ✅ User registration with validation (username, email, password)
- ✅ Secure login/logout with NextAuth v4
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT-based sessions (30-day expiry)
- ✅ Protected routes middleware
- ✅ Session management

**Planet Generation**
- ✅ Automatic planet creation on registration
- ✅ Random coordinate assignment (Galaxy:System:Position)
- ✅ Starting resources: 500 Metal, 300 Crystal, 100 Deuterium
- ✅ Starting buildings: Metal Mine, Crystal Mine, Solar Plant (Level 1)
- ✅ Research record initialization

**User Interface**
- ✅ Registration page with real-time validation
- ✅ Login page with error handling
- ✅ Game dashboard showing resources and buildings
- ✅ Profile page with empire statistics
- ✅ Header with user info and logout
- ✅ Toast notifications for user feedback
- ✅ Responsive dark-themed UI

**Testing & Quality**
- ✅ 55 unit tests passing (auth, validators, game engine)
- ✅ Input validation with Zod schemas
- ✅ TypeScript strict mode
- ✅ Database migrations

### ✅ Phase 2: Core Gameplay (COMPLETE!)

**Resource Production System** ✅
- ✅ Production formulas (Metal, Crystal, Deuterium)
- ✅ Energy balance system with proportional mine shutdowns
- ✅ Storage capacity calculations
- ✅ Time-based resource accumulation
- ✅ Real-time resource display with smooth 60fps animations
- ✅ Production rate indicators (per hour)
- ✅ Storage capacity progress bars
- ✅ Energy warnings and efficiency indicators
- ✅ REST API endpoint for resource fetching
- ✅ 32 comprehensive unit tests (all passing)

**Building Upgrade System** ✅
- ✅ Building cost calculations (exponential scaling)
- ✅ Construction time formulas (based on robotics/nanite levels)
- ✅ Prerequisite checking system
- ✅ One building upgrade queue per planet
- ✅ Upgrade start/cancel/complete logic
- ✅ Real-time countdown timers with progress bars
- ✅ Production/consumption stats display (current → next level)
- ✅ Visual affordability indicators
- ✅ Building filtering (Resources/Facilities/Storage)
- ✅ Automatic resource deduction/refund

**Real-time WebSocket System** ✅
- ✅ Socket.io server integration with Next.js
- ✅ User-specific room-based messaging
- ✅ Instant updates for building start/complete/cancel
- ✅ Real-time resource updates (no polling)
- ✅ Zero page reloads - pure WebSocket-driven UI
- ✅ Toast notifications for all events
- ✅ Seamless UX with smooth animations

**Developer Tools** ✅
- ✅ 100x speed mode for rapid testing
- ✅ Planet reset button (dev only)
- ✅ Comprehensive console logging
- ✅ Real-time event tracking

### ✅ Phase 3: Research & Fleet Systems (75% COMPLETE!)

**Research System** ✅
- ✅ 17 technologies with complete tech tree
- ✅ Research calculator (cost/time formulas)
- ✅ Research manager (start/cancel/complete)
- ✅ API endpoints and WebSocket integration
- ✅ UI with filters (Basic/Advanced/Drives)
- ✅ Real-time countdown timers and progress bars
- ✅ Background completion detection

**Fleet Production** ✅
- ✅ 13 ship types (Civil: 5, Combat: 8)
- ✅ Ship calculator with prerequisites
- ✅ Shipyard manager with production queue
- ✅ API endpoints and WebSocket integration
- ✅ UI with quantity selection and max affordable
- ✅ Real-time production tracking

**Fleet Management** ✅
- ✅ Fleet overview with statistics
- ✅ Ship counts, cargo capacity, and speeds
- ✅ Real-time updates when ships complete
- ✅ Fleet API endpoint

**Fleet Missions** ✅
- ✅ Mission calculator (travel time, fuel, distance)
- ✅ Fleet dispatcher (send/recall)
- ✅ 7 mission types defined
- ✅ API endpoints for dispatch and viewing
- ✅ Active missions tracking UI
- ✅ WebSocket events for fleet movements

**Remaining (Optional)**
- ⏳ Combat system with battle engine
- ⏳ Battle reports and debris fields
- ⏳ Espionage missions with probes
- ⏳ Unit tests for Phase 3 features

**Coming Next - Phase 4**
- ⏳ Alliance system
- ⏳ Messaging system
- ⏳ Galaxy view

### 🌐 Phase 4: Social & Advanced (Planned)
- ⏳ Alliance system
- ⏳ Messaging system
- ⏳ Galaxy view
- ⏳ Rankings

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
- [npm](https://www.npmjs.com/) 10 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lunaris.git
   cd lunaris
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
   DATABASE_URL="postgresql://user:password@localhost:5432/lunaris"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
lunaris/
├── .claude/                   # AI Development Studio
│   ├── agents/                # 10 specialized AI agents
│   ├── skills/                # 4 reusable workflows
│   ├── commands/              # 4 slash commands
│   └── prompts.md             # Project context & standards
├── src/
│   ├── app/                   # Next.js app directory (routes)
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── game/              # Game-specific components
│   │   └── layouts/           # Layout components
│   ├── lib/                   # Core logic and utilities
│   │   ├── db/                # Database client
│   │   ├── game-engine/       # Game logic (isolated)
│   │   ├── utils/             # Helper functions
│   │   └── validators/        # Zod schemas
│   ├── hooks/                 # React hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types
│   └── constants/             # Game constants
├── prisma/                    # Database schema & migrations
├── tests/                     # All tests
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # E2E tests (Playwright)
├── docs/                      # Documentation
└── public/                    # Static assets
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
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema changes
npm run db:migrate       # Create and apply migration
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
```

## 🤖 AI Development Studio

This project includes a comprehensive AI development studio with 10 specialized agents:

1. **Lead Developer** - Architecture & code review
2. **Frontend Engineer** - React/Next.js & UI
3. **Backend Engineer** - API & database
4. **Game Designer** - Mechanics & balance
5. **UI/UX Designer** - Design systems & flows
6. **QA Engineer** - Testing & quality
7. **DevOps Engineer** - CI/CD & deployment
8. **Documentation Writer** - Docs & guides
9. **Marketing Strategist** - GTM & community
10. **Product Manager** - Roadmap & requirements

### Using AI Agents

The agents are configured to work together automatically. See `.claude/prompts.md` for detailed usage.

### Slash Commands

- `/new-feature` - Complete feature development workflow
- `/fix-bug` - Systematic bug fix process
- `/review-pr` - Comprehensive PR review
- `/generate-docs` - Auto-generate documentation

## 🧪 Testing

We maintain high test coverage (>80%) across the codebase.

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all

# Coverage report
npm run test:coverage
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write tests
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the original [OGame](https://ogame.org/)
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## 📞 Contact

- Discord: [Join our community](https://discord.gg/lunaris)
- Twitter: [@LunarisGame](https://twitter.com/LunarisGame)
- Email: support@lunaris.game

---

Made with ❤️ by the Lunaris team

🤖 Generated with [Claude Code](https://claude.com/claude-code)
