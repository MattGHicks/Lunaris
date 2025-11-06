# Test Suite Skill

This skill runs the complete test suite and generates a comprehensive report.

## Usage
Invoke this skill when you need to run all tests before deployment or PR creation.

## Process

### 1. Pre-flight Checks
```bash
# Ensure dependencies are installed
npm ci

# Type check first
npm run type-check

# Lint check
npm run lint
```

### 2. Run Unit Tests
```bash
# Run unit tests with coverage
npm run test:unit -- --coverage

# Generate coverage report
```

**Expected Output**:
- All tests passing
- Coverage >80%
- No flaky tests

### 3. Run Integration Tests
```bash
# Start test database
docker-compose up -d postgres

# Run migrations
npx prisma migrate deploy --preview-feature

# Run integration tests
npm run test:integration

# Cleanup
docker-compose down
```

**Tests Should Cover**:
- API routes
- Database operations
- Authentication/authorization
- Business logic
- Error handling

### 4. Run E2E Tests
```bash
# Build the application
npm run build

# Start the application
npm run start &

# Wait for server to be ready
npx wait-on http://localhost:3000

# Run Playwright tests
npm run test:e2e

# Kill the server
pkill -f "node server.js"
```

**Critical Flows to Test**:
- User registration and login
- Building upgrade
- Fleet creation and sending
- Combat simulation
- Resource production

### 5. Performance Tests
```bash
# Run performance benchmarks
npm run test:perf
```

**Benchmarks**:
- API routes <200ms
- Database queries <100ms
- Page load <2s
- Bundle size <500KB per route

### 6. Generate Test Report

## Test Report Template

```markdown
# Test Report - [Date/Time]

## Summary
| Test Type | Total | Passed | Failed | Skipped | Duration | Coverage |
|-----------|-------|--------|--------|---------|----------|----------|
| Unit      | 245   | 245    | 0      | 0       | 12.3s    | 87%      |
| Integration | 45  | 43     | 2      | 0       | 34.5s    | 75%      |
| E2E       | 18    | 18     | 0      | 0       | 89.2s    | N/A      |
| **Total** | **308** | **306** | **2** | **0** | **136s** | **82%** |

## Status: ⚠️ 2 FAILURES

---

## Unit Tests ✅
**Status**: All Passing
**Coverage**: 87% (Target: 80%)
**Duration**: 12.3s

### Coverage by Module
| Module | Coverage |
|--------|----------|
| Game Engine | 92% |
| API Routes | 85% |
| Components | 81% |
| Utils | 95% |

**Top Files with Low Coverage**:
1. `src/lib/fleet-movement.ts` - 68%
2. `src/components/CombatReport.tsx` - 72%

---

## Integration Tests ⚠️
**Status**: 2 Failures
**Duration**: 34.5s

### Failed Tests
❌ **POST /api/fleet/send - with multiple destinations**
```
Error: Expected status 200, received 500
Location: tests/integration/api/fleet.test.ts:145
Error Message: "Internal server error: Cannot read property 'id' of undefined"

Root Cause: Missing null check for target planet
Fix Required: Add validation for target planet existence
```

❌ **POST /api/buildings/upgrade - concurrent upgrades**
```
Error: Expected error message, got success response
Location: tests/integration/api/buildings.test.ts:89
Error Message: "Race condition allowed double upgrade"

Root Cause: Missing transaction lock
Fix Required: Add database transaction with proper locking
```

### Passing Tests
✅ User authentication (5 tests)
✅ Building upgrades (8 tests, excluding concurrent)
✅ Resource production (6 tests)
✅ Research system (4 tests)
✅ Fleet creation (9 tests, excluding multi-destination)

---

## E2E Tests ✅
**Status**: All Passing
**Duration**: 89.2s

### Test Suites
✅ **Authentication Flow** (3 tests)
- Login with valid credentials
- Login with invalid credentials
- Logout

✅ **Building Management** (5 tests)
- View buildings page
- Upgrade building with sufficient resources
- Fail upgrade with insufficient resources
- Cancel upgrade
- Building completion notification

✅ **Fleet Operations** (4 tests)
- Create fleet
- Send fleet to coordinates
- Recall fleet
- View fleet movement

✅ **Combat System** (3 tests)
- Attack inactive player
- Defend against attack
- View combat report

✅ **Resource Management** (3 tests)
- View real-time resource updates
- Collect resources
- Transfer resources between planets

---

## Performance Tests ⚠️

### API Response Times
| Endpoint | Target | Actual | Status |
|----------|--------|--------|--------|
| GET /api/planets | <200ms | 145ms | ✅ |
| POST /api/buildings/upgrade | <200ms | 189ms | ✅ |
| POST /api/fleet/send | <200ms | 267ms | ⚠️ |
| GET /api/galaxy | <500ms | 423ms | ✅ |

### Page Load Times
| Page | Target | Actual | Status |
|------|--------|--------|--------|
| Homepage | <2s | 1.2s | ✅ |
| Dashboard | <2s | 1.8s | ✅ |
| Buildings | <2s | 1.5s | ✅ |
| Galaxy View | <3s | 2.1s | ✅ |

### Bundle Sizes
| Route | Target | Actual | Status |
|-------|--------|--------|--------|
| / | <300KB | 245KB | ✅ |
| /dashboard | <400KB | 378KB | ✅ |
| /buildings | <350KB | 312KB | ✅ |
| /galaxy | <500KB | 467KB | ✅ |

---

## Issues Requiring Attention

### Critical (Must Fix Before Deploy)
1. **Fleet API race condition** - `POST /api/fleet/send` fails with concurrent requests
2. **Building upgrade race condition** - Multiple simultaneous upgrades not properly locked

### Medium (Should Fix Soon)
1. **Fleet send performance** - 267ms response time (target: 200ms)
2. **Low test coverage** - `fleet-movement.ts` at 68% (target: 80%)

### Low (Can Fix Later)
1. **E2E test duration** - 89s (consider parallelization)

---

## Recommendations

1. **Fix Critical Issues**:
   - Add database transaction locks for concurrent operations
   - Add integration tests for race conditions

2. **Performance Improvements**:
   - Optimize fleet send query (add database index?)
   - Consider caching for galaxy view

3. **Coverage Improvements**:
   - Add tests for edge cases in `fleet-movement.ts`
   - Add tests for `CombatReport.tsx` error states

4. **Test Suite Optimization**:
   - Parallelize E2E tests (reduce 89s → ~30s)
   - Add test retries for flaky tests

---

## Overall Assessment

**Status**: ⚠️ **NOT READY FOR DEPLOYMENT**

**Blockers**:
- 2 critical integration test failures (race conditions)

**Action Items**:
1. Fix race condition in fleet API
2. Fix race condition in building upgrade API
3. Add integration tests to prevent regressions
4. Re-run test suite

**Once Fixed**: ✅ Ready for deployment
```

### 7. Invoke QA Agent if Issues Found
If critical test failures are found, invoke the QA Engineer agent to:
- Analyze root causes
- Create additional test cases
- Suggest fixes
- Update test strategy

## Exit Codes
- `0`: All tests pass, ready for deployment
- `1`: Test failures, not ready for deployment
- `2`: Coverage below threshold
- `3`: Performance benchmarks not met
