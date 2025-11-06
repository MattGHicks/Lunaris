# Refactoring Skill

This skill provides a safe, systematic approach to refactoring code.

## Usage
Invoke this skill when you need to refactor code while maintaining functionality and safety.

## Refactoring Principles

### When to Refactor
- Code duplication (DRY violation)
- Long functions (>50 lines)
- Complex functions (high cyclomatic complexity)
- Unclear naming
- Tight coupling
- Poor testability
- Performance issues

### When NOT to Refactor
- Code is working and rarely changes
- Under tight deadline (refactor later)
- No test coverage (write tests first!)
- Unclear requirements

## Safe Refactoring Process

### Step 1: Establish Safety Net

#### A. Ensure Test Coverage
```bash
# Check current test coverage
npm run test:coverage

# Goal: >80% coverage for code being refactored
```

**If coverage is low:**
1. Write tests for current behavior first
2. Ensure tests pass
3. Then refactor

#### B. Understand Current Behavior
- Read the code thoroughly
- Identify all inputs and outputs
- Note edge cases
- Document dependencies

#### C. Create Baseline
```bash
# Commit current working state
git add .
git commit -m "chore: baseline before refactoring [component/module]"

# Create refactor branch
git checkout -b refactor/descriptive-name
```

### Step 2: Plan the Refactoring

#### Identify Code Smells
- [ ] **Duplicated Code**: Same code in multiple places
- [ ] **Long Method**: Function >50 lines
- [ ] **Large Class**: Component doing too much
- [ ] **Long Parameter List**: >3 parameters
- [ ] **Primitive Obsession**: Using primitives instead of objects
- [ ] **Switch Statements**: Could be polymorphism
- [ ] **Lazy Class**: Class doing too little
- [ ] **Dead Code**: Unused code

#### Choose Refactoring Technique

**Common Refactorings**:

1. **Extract Function**
   - Before: Long function with multiple concerns
   - After: Multiple focused functions

2. **Extract Variable**
   - Before: Complex expression
   - After: Named variable

3. **Inline Function**
   - Before: Unnecessary abstraction
   - After: Code moved to caller

4. **Rename**
   - Before: Unclear name
   - After: Clear, descriptive name

5. **Move Function**
   - Before: Function in wrong module
   - After: Function in appropriate module

6. **Replace Conditional with Polymorphism**
   - Before: Switch statement
   - After: Class hierarchy

7. **Introduce Parameter Object**
   - Before: Long parameter list
   - After: Single object parameter

8. **Split Phase**
   - Before: Function doing two things
   - After: Two functions, one after another

### Step 3: Refactor in Small Steps

**IMPORTANT**: Make small, incremental changes. Test after each change!

#### Example: Extract Function Refactoring

**Before**:
```typescript
// src/lib/fleet.ts (100 lines)
export function sendFleet(ships: Ships, targetCoords: string) {
  // Validate coordinates (15 lines)
  const coordPattern = /^(\d+):(\d+):(\d+)$/;
  if (!coordPattern.test(targetCoords)) {
    throw new Error('Invalid coordinates');
  }
  const [galaxy, system, position] = targetCoords.split(':').map(Number);
  if (galaxy < 1 || galaxy > 9) throw new Error('Invalid galaxy');
  if (system < 1 || system > 499) throw new Error('Invalid system');
  if (position < 1 || position > 15) throw new Error('Invalid position');

  // Calculate distance (20 lines)
  const originGalaxy = currentPlanet.galaxy;
  const originSystem = currentPlanet.system;
  const originPosition = currentPlanet.position;

  let distance = 0;
  if (originGalaxy !== galaxy) {
    distance = Math.abs(originGalaxy - galaxy) * 20000;
  } else if (originSystem !== system) {
    distance = Math.abs(originSystem - system) * 95 + 2700;
  } else {
    distance = Math.abs(originPosition - position) * 5 + 1000;
  }

  // Calculate fuel consumption (25 lines)
  const baseConsumption = Object.entries(ships).reduce((total, [shipType, count]) => {
    const ship = SHIP_DATA[shipType];
    return total + (ship.fuelConsumption * count * distance);
  }, 0);

  const driveLevel = research.combustionDrive;
  const fuelMultiplier = 1 - (driveLevel * 0.1);
  const finalFuel = baseConsumption * fuelMultiplier;

  // etc...
}
```

**Refactoring Steps**:

**Step 1**: Extract coordinate validation
```typescript
function validateCoordinates(coords: string): Coordinates {
  const coordPattern = /^(\d+):(\d+):(\d+)$/;
  if (!coordPattern.test(coords)) {
    throw new Error('Invalid coordinates format');
  }

  const [galaxy, system, position] = coords.split(':').map(Number);

  if (galaxy < 1 || galaxy > 9) {
    throw new Error(`Invalid galaxy: ${galaxy}`);
  }
  if (system < 1 || system > 499) {
    throw new Error(`Invalid system: ${system}`);
  }
  if (position < 1 || position > 15) {
    throw new Error(`Invalid position: ${position}`);
  }

  return { galaxy, system, position };
}
```

**Test**: Run tests, ensure they still pass.

**Step 2**: Extract distance calculation
```typescript
function calculateDistance(
  origin: Coordinates,
  target: Coordinates
): number {
  if (origin.galaxy !== target.galaxy) {
    return Math.abs(origin.galaxy - target.galaxy) * 20000;
  }

  if (origin.system !== target.system) {
    return Math.abs(origin.system - target.system) * 95 + 2700;
  }

  return Math.abs(origin.position - target.position) * 5 + 1000;
}
```

**Test**: Run tests, ensure they still pass.

**Step 3**: Extract fuel calculation
```typescript
function calculateFuelConsumption(
  ships: Ships,
  distance: number,
  driveLevel: number
): number {
  const baseConsumption = Object.entries(ships).reduce(
    (total, [shipType, count]) => {
      const ship = SHIP_DATA[shipType];
      return total + ship.fuelConsumption * count * distance;
    },
    0
  );

  const fuelMultiplier = 1 - driveLevel * 0.1;
  return baseConsumption * fuelMultiplier;
}
```

**Test**: Run tests, ensure they still pass.

**Step 4**: Refactor main function
```typescript
export function sendFleet(
  ships: Ships,
  targetCoords: string,
  origin: Planet,
  research: Research
): FleetMission {
  // Now much cleaner!
  const target = validateCoordinates(targetCoords);
  const originCoords = {
    galaxy: origin.galaxy,
    system: origin.system,
    position: origin.position,
  };

  const distance = calculateDistance(originCoords, target);
  const fuelNeeded = calculateFuelConsumption(
    ships,
    distance,
    research.combustionDrive
  );

  // ... rest of function is now much clearer
}
```

**Test**: Run full test suite.

### Step 4: Update Tests

After refactoring, update or add tests for:
- New functions created
- Changed interfaces
- Edge cases discovered during refactoring

```typescript
// tests/unit/fleet/validation.test.ts
describe('validateCoordinates', () => {
  it('accepts valid coordinates', () => {
    expect(validateCoordinates('1:234:5')).toEqual({
      galaxy: 1,
      system: 234,
      position: 5,
    });
  });

  it('rejects invalid format', () => {
    expect(() => validateCoordinates('invalid')).toThrow('Invalid coordinates format');
  });

  it('rejects out-of-range galaxy', () => {
    expect(() => validateCoordinates('10:234:5')).toThrow('Invalid galaxy');
  });
});

// tests/unit/fleet/distance.test.ts
describe('calculateDistance', () => {
  it('calculates inter-galaxy distance', () => {
    const origin = { galaxy: 1, system: 100, position: 5 };
    const target = { galaxy: 3, system: 100, position: 5 };
    expect(calculateDistance(origin, target)).toBe(40000);
  });

  it('calculates intra-galaxy distance', () => {
    const origin = { galaxy: 1, system: 100, position: 5 };
    const target = { galaxy: 1, system: 150, position: 5 };
    expect(calculateDistance(origin, target)).toBe(7450);
  });
});
```

### Step 5: Run Full Test Suite

```bash
# Run all tests
npm run test:all

# Check coverage
npm run test:coverage

# Ensure coverage didn't decrease
```

### Step 6: Code Review

Before committing, review your refactoring:

#### Self-Review Checklist
- [ ] Code is more readable
- [ ] Functions are smaller and focused
- [ ] Names are clear and descriptive
- [ ] Duplication eliminated
- [ ] Complexity reduced
- [ ] Tests still pass
- [ ] Coverage maintained or improved
- [ ] No behavioral changes
- [ ] Performance not degraded

#### Get AI Review
Invoke the Lead Developer agent to review refactored code.

### Step 7: Commit and Document

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "refactor(fleet): extract coordinate validation and distance calculation

- Extracted validateCoordinates function for reusability
- Extracted calculateDistance for clarity
- Extracted calculateFuelConsumption to reduce complexity
- sendFleet function now 30 lines (was 100)
- Added unit tests for extracted functions
- Coverage increased from 75% to 88%

No behavioral changes. All tests passing."

# Push and create PR
git push origin refactor/descriptive-name
gh pr create --title "Refactor: Fleet module" --body "..."
```

## Common Refactoring Patterns

### 1. Extract Function
**When**: Function >50 lines or multiple responsibilities

```typescript
// Before
function processOrder(order: Order) {
  // Validate (10 lines)
  // Calculate total (15 lines)
  // Apply discounts (20 lines)
  // Process payment (15 lines)
  // Send confirmation (10 lines)
}

// After
function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateOrderTotal(order);
  const finalAmount = applyDiscounts(total, order.user);
  processPayment(finalAmount, order.paymentMethod);
  sendOrderConfirmation(order);
}
```

### 2. Extract Variable
**When**: Complex expression that's hard to understand

```typescript
// Before
if (user.age > 18 && user.country === 'US' && !user.banned) {
  // allow
}

// After
const isAdult = user.age > 18;
const isUSBased = user.country === 'US';
const isAllowed = isAdult && isUSBased && !user.banned;

if (isAllowed) {
  // allow
}
```

### 3. Rename
**When**: Names are unclear or misleading

```typescript
// Before
const d = new Date();
function calc(a, b) { return a * b * 0.1; }

// After
const currentDate = new Date();
function calculateTax(amount, rate) { return amount * rate * 0.1; }
```

### 4. Introduce Parameter Object
**When**: Functions have >3 parameters

```typescript
// Before
function createFleet(
  ships: Ships,
  origin: string,
  target: string,
  mission: string,
  speed: number,
  cargo: Resources
) { }

// After
interface FleetParams {
  ships: Ships;
  origin: string;
  target: string;
  mission: MissionType;
  speed: number;
  cargo: Resources;
}

function createFleet(params: FleetParams) { }
```

### 5. Replace Magic Numbers
**When**: Unexplained numeric constants

```typescript
// Before
const distance = Math.abs(g1 - g2) * 20000;

// After
const GALAXY_DISTANCE_MULTIPLIER = 20000;
const distance = Math.abs(g1 - g2) * GALAXY_DISTANCE_MULTIPLIER;
```

## Refactoring Anti-Patterns

### ❌ Don't Do These

1. **Big Bang Refactoring**
   - Refactoring everything at once
   - High risk of breaking things
   - **Instead**: Incremental, tested changes

2. **Refactoring Without Tests**
   - No safety net
   - Can't verify behavior preserved
   - **Instead**: Write tests first

3. **Premature Optimization**
   - Optimizing before measuring
   - Complex code for marginal gains
   - **Instead**: Measure first, optimize bottlenecks

4. **Over-Abstraction**
   - Creating unnecessary abstractions
   - Code becomes hard to follow
   - **Instead**: Start simple, abstract when needed

5. **Changing Behavior During Refactoring**
   - Mixing refactoring with feature work
   - Hard to debug if issues arise
   - **Instead**: Refactor separately from features

## Invoke Lead Developer Agent

For complex refactorings, invoke the Lead Developer agent to:
- Review refactoring plan
- Suggest alternative approaches
- Identify risks
- Approve final changes

## Success Criteria

✅ Refactoring is successful when:
- All tests still pass
- Code coverage maintained or improved
- Code is more readable
- Functions are smaller and focused
- Complexity reduced
- Performance not degraded
- No behavioral changes
- Team approves changes
