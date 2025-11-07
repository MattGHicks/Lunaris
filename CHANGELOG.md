# Changelog

All notable changes to the Lunaris project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Phase 2: Building Upgrade System & WebSocket Integration (2025-11-06)

#### Building Upgrade System
- **Building Calculator** (`src/lib/game-engine/building-calculator.ts`)
  - Cost calculation for building upgrades (exponential: base × 2^level)
  - Construction time formulas based on robotics/nanite factory levels
  - Prerequisite checking (e.g., Shipyard requires Robotics Factory L2)
  - Affordability validation
  - Queue management (one upgrade per planet)
  - Upgrade completion detection

- **Building Manager** (`src/lib/game-engine/building-manager.ts`)
  - Start building upgrade with resource deduction
  - Cancel building upgrade with 100% refund
  - Complete building upgrade (increment level)
  - Database transaction safety

- **Building Stats** (`src/lib/game-engine/building-stats.ts`)
  - Production/consumption calculations for current and next level
  - Stats for all building types (mines, energy, storage)
  - Visual comparison helpers (current → next with delta)

#### API Endpoints
- **GET `/api/buildings`** - Fetch all buildings with upgrade info
  - Returns building states, costs, times, prerequisites
  - Includes planet temperature for calculations
- **POST `/api/buildings/upgrade`** - Start building upgrade
  - Validates prerequisites and resources
  - Emits WebSocket event on success
- **DELETE `/api/buildings/upgrade`** - Cancel building upgrade
  - Refunds 100% of resources
  - Emits WebSocket event
- **POST `/api/buildings/check-completion`** - Check for completed upgrades
  - Auto-completes finished buildings
  - Emits WebSocket event for each completion
- **POST `/api/dev/reset-planet`** - Reset planet to initial state (dev only)

#### Real-time WebSocket System
- **Custom Next.js Server** (`server.js`)
  - Socket.io integration with Next.js
  - User authentication on connection
  - Room-based messaging (user-specific events)
  - Global io instance accessible by API routes

- **Server-side Emitters** (`src/lib/socket/server.ts`)
  - `emitBuildingStarted()` - Building upgrade initiated
  - `emitBuildingCompleted()` - Building upgrade finished
  - `emitBuildingCancelled()` - Building upgrade cancelled
  - `emitResourcesUpdated()` - Resources changed

- **Client-side Hooks** (`src/hooks/useSocket.ts`, `src/hooks/useBuildingCompletion.ts`)
  - `useSocket()` - Manages WebSocket connection lifecycle
  - `useSocketEvent()` - Subscribe to specific events
  - Auto-connect on login, auto-disconnect on logout
  - Completion checker that triggers WebSocket events

- **Event System** (`src/lib/socket/events.ts`)
  - Typed event definitions
  - Payload interfaces for all events
  - Consistent event naming

#### User Interface Components
- **BuildingCard** (`src/components/game/BuildingCard.tsx`)
  - Individual building display with all stats
  - Current production/consumption display
  - Next level preview with delta indicators
  - Upgrade button with affordability check
  - Live countdown timer (60fps)
  - Progress bar for active upgrades
  - Cancel upgrade button
  - Color-coded resource costs
  - Prerequisite warnings

- **BuildingList** (`src/components/game/BuildingList.tsx`)
  - Grid layout with responsive design
  - Filter tabs (All/Resources/Facilities/Storage)
  - WebSocket-driven real-time updates
  - Loading states

- **Updated Header** (`src/components/layouts/header.tsx`)
  - Added Reset button for testing (yellow)
  - Spinning icon animation during reset

- **Updated Game Dashboard** (`src/app/game/page.tsx`)
  - Integrated BuildingList component
  - Removed old static building display

#### Game Mechanics
- **Building Prerequisites**: Enforced dependency chain
- **Energy Management**: Stats show energy impact of upgrades
- **Resource Costs**: Exponential scaling with level
- **Construction Time**: Reduced by Robotics Factory and Nanite Factory
- **Queue System**: One upgrade at a time per planet (OGame-style)
- **100% Refund**: Cancel anytime for full resource return

#### Real-time Features
- **Zero Polling**: No periodic API calls for resources
- **Instant Updates**: WebSocket events trigger UI updates < 100ms
- **No Page Reloads**: All updates via state management
- **Smooth Animations**: 60fps resource counters and countdown timers
- **Event-Driven**: Building actions emit events, components listen
- **Seamless UX**: No flashing, no scroll jumps, no jarring transitions

#### Developer Experience
- **100x Universe Speed**: Buildings complete in seconds for testing
- **Planet Reset**: One-click reset to initial state
- **Console Logging**: Detailed event tracking and debugging
- **TypeScript**: Full type safety across all modules
- **Error Handling**: Graceful degradation and user feedback

#### Performance Optimizations
- **useCallback**: Memoized functions prevent unnecessary re-renders
- **React.memo**: Strategic component memoization
- **requestAnimationFrame**: Efficient 60fps animations
- **WebSocket**: Eliminates polling overhead
- **Conditional Rendering**: Only render what's needed

### Technical Improvements
- Custom Next.js server with Socket.io support
- Pure WebSocket-driven architecture
- Event-driven component communication
- Zero polling design
- Comprehensive error handling
- Transaction-safe database operations

---

### Added - Phase 2: Resource Production System (2025-11-06)

#### Core Game Engine
- **Production Formulas** (`src/lib/game-engine/constants.ts`)
  - Metal Mine production calculation (exponential scaling)
  - Crystal Mine production calculation (exponential scaling)
  - Deuterium Synthesizer production with temperature effects
  - Solar Plant energy production
  - Fusion Reactor energy production with tech bonuses
  - Energy consumption formulas for all mines
  - Storage capacity formulas (exponential growth)
  - Building cost and construction time calculations

- **Resource Calculator** (`src/lib/game-engine/resource-calculator.ts`)
  - Energy balance system with proportional mine shutdowns
  - Production rate calculations for all resources
  - Time-based resource accumulation
  - Storage capacity enforcement (caps at maximum)
  - Support for negative production (fusion reactor deuterium consumption)
  - Utility functions for formatting resources and production rates

- **Resource Sync Utility** (`src/lib/game-engine/resource-sync.ts`)
  - Database synchronization for planet resources
  - Preview resources without database updates
  - Resource deduction for buildings/research costs
  - Batch sync for all user planets

#### API Endpoints
- **GET `/api/resources`** - Fetch current resources with production data
  - Optional `planetId` query parameter for specific planet
  - Returns current resources, production rates, storage capacity, and energy balance
  - Automatically calculates accumulated resources since last update

#### User Interface
- **ResourceDisplay Component** (`src/components/game/ResourceDisplay.tsx`)
  - Real-time resource ticking with smooth animations
  - Client-side interpolation between API calls
  - Production rate display (per hour) with K/M notation
  - Storage capacity progress bars with color coding (green/yellow/red)
  - Energy balance display with production/consumption breakdown
  - Warning alerts for low energy and nearly full storage
  - Auto-refresh every 10 seconds via API polling
  - Uses `requestAnimationFrame` for smooth 60fps updates

- **Updated Game Dashboard** (`src/app/game/page.tsx`)
  - Integrated ResourceDisplay component
  - Server-side resource calculation on initial page load
  - Displays real-time production for all resources

#### Testing
- **32 Comprehensive Unit Tests** (`tests/unit/game-engine/resource-calculator.test.ts`)
  - Production formula tests (all resource types)
  - Energy consumption and production tests
  - Storage capacity tests
  - Energy balance tests (positive, negative, efficiency)
  - Production rate tests with energy constraints
  - Resource accumulation tests (time-based, storage caps, edge cases)
  - Full integration tests for resource calculation
  - All tests passing ✅

#### Game Mechanics
- **Energy System**: Mines require energy; insufficient energy reduces production proportionally
- **Temperature Effects**: Planet temperature affects deuterium production (colder = better)
- **Storage Limits**: Resources capped at storage capacity (base: 10K metal/crystal, 10K deuterium)
- **Base Production**: Metal (30/h) and Crystal (15/h) production without mines
- **Exponential Scaling**: All buildings scale exponentially with level (1.1^level factor)

### Technical Improvements
- Strict TypeScript compliance across all new modules
- Zero TypeScript errors in production build
- Consistent code formatting and documentation
- Comprehensive JSDoc comments for all public functions
- Type-safe API responses and component props

### Performance
- Client-side resource interpolation reduces API calls
- Efficient requestAnimationFrame usage for animations
- Minimal re-renders with proper React hooks dependencies
- Optimized database queries with Prisma

---

## [0.1.0] - 2025-11-04

### Added - Phase 1: Authentication & User System

#### Core Authentication
- User registration with Zod validation
- Secure login/logout with NextAuth v4
- Password hashing with bcrypt (12 rounds)
- JWT-based sessions (30-day expiry)
- Protected routes middleware

#### Planet Generation
- Automatic planet creation on user registration
- Random coordinate assignment (Galaxy:System:Position format)
- Starting resources and buildings
- Temperature calculation based on position

#### User Interface
- Registration and login pages
- Game dashboard
- Profile page
- Header component with user info
- Toast notifications with Sonner
- Responsive dark-themed space UI

#### Database
- PostgreSQL database with Prisma ORM
- Complete schema for all game features
- User, Planet, Building, Resources, Research, Fleet models
- Database migrations

#### Testing & Quality
- 23 unit tests for authentication and validation
- TypeScript strict mode
- ESLint and Prettier configuration
- Husky pre-commit hooks

---

## Legend
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

🤖 Generated with [Claude Code](https://claude.com/claude-code)
