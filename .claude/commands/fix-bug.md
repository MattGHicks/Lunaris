# Fix Bug Command

This command guides you through fixing a bug systematically.

## Usage
```
/fix-bug [bug-description or issue-number]
```

Example: `/fix-bug #123` or `/fix-bug resources-going-negative`

## Workflow

### 1. Understand the Bug

#### Gather Information
- Read bug report carefully
- Check issue number on GitHub
- Review error logs in Sentry
- Check user reports
- Identify affected users/frequency

#### Create Bug Report (if doesn't exist)
```markdown
# Bug Report

## Severity
Critical / High / Medium / Low

## Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Enter '...'
4. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: [browser + version]
- OS: [operating system]
- User ID: [if known]
- Timestamp: [when occurred]

## Error Messages
```
[Error from console/logs]
```

## Impact
- Users affected: [number or %]
- Business impact: [revenue, reputation, etc.]
- Workaround available: Yes/No
```

### 2. Reproduce the Bug

#### Set Up Environment
```bash
# Ensure you're on latest develop
git checkout develop
git pull origin develop

# Start local environment
npm run dev
```

#### Follow Reproduction Steps
- Follow exact steps from bug report
- Try to reproduce consistently
- Note any variations
- Check browser console for errors
- Check server logs

#### Document Reproduction
```markdown
## Reproduction Results

✅ Successfully reproduced: Yes/No

### Conditions for Reproduction
- Specific user state: [e.g., has 0 resources]
- Timing: [e.g., concurrent requests]
- Browser: [if browser-specific]
- Data state: [specific database state]

### Additional Observations
- [Any additional findings]
- [Potential related issues]
```

### 3. Investigate Root Cause

#### Analyze the Code
- Find relevant code files
- Trace execution path
- Identify where bug occurs
- Check recent changes (git blame)

```bash
# Find when bug was introduced
git log --oneline --all --grep="[related-feature]"

# Check specific file history
git log -p -- src/path/to/file.ts

# Find who changed specific lines
git blame src/path/to/file.ts
```

#### Invoke Lead Developer Agent
Get input on root cause and potential fixes.

#### Use Debugger
```typescript
// Add breakpoints
debugger;

// Add detailed logging
console.log('DEBUG: variable value:', variable);
```

#### Identify Root Cause
```markdown
## Root Cause Analysis

### Location
File: `src/path/to/file.ts`
Line: 145
Function: `calculateResources()`

### Cause
[Detailed explanation of why bug occurs]

Example:
"Race condition when multiple upgrade requests are made simultaneously. The resource check and deduction are not in a transaction, allowing both requests to pass the check before either deducts resources."

### Why It Wasn't Caught
- [ ] Missing test coverage
- [ ] Edge case not considered
- [ ] Recent code change introduced regression
- [ ] Incorrect assumption about behavior

### Impact Scope
- Affects: [which users/features]
- Since: [when introduced]
- Frequency: [how often it occurs]
```

### 4. Create Fix Branch
```bash
git checkout -b bugfix/[bug-description]
# or
git checkout -b hotfix/[bug-description]  # if critical production bug
```

### 5. Write Failing Test First

**IMPORTANT**: Write a test that reproduces the bug before fixing!

```typescript
// tests/unit/resources.test.ts
describe('Bug #123: Resources going negative', () => {
  it('prevents negative resources from concurrent upgrades', async () => {
    const planet = await createTestPlanet({
      metal: 1000,
      crystal: 500
    });

    // Simulate two concurrent upgrade requests
    const upgrade1 = upgradeBuilding(planet.id, 'metalMine');
    const upgrade2 = upgradeBuilding(planet.id, 'crystalMine');

    await Promise.all([upgrade1, upgrade2]);

    // Check resources didn't go negative
    const updated = await getPlanet(planet.id);
    expect(updated.metal).toBeGreaterThanOrEqual(0);
    expect(updated.crystal).toBeGreaterThanOrEqual(0);
  });
});
```

**Run test - it should FAIL**:
```bash
npm run test -- resources.test.ts
# Expected: Test fails, reproducing the bug
```

### 6. Implement Fix

#### Apply Minimal Fix
Fix the bug with minimal changes. Don't refactor or add features!

```typescript
// src/api/buildings/upgrade.ts

// ❌ BEFORE (buggy code)
export async function upgradeBuilding(planetId: string, buildingId: string) {
  const planet = await db.planet.findUnique({ where: { id: planetId } });
  const cost = calculateCost(buildingId, currentLevel);

  // Race condition here! ⚠️
  if (planet.metal >= cost.metal) {
    await db.planet.update({
      where: { id: planetId },
      data: { metal: { decrement: cost.metal } }
    });
  }
}

// ✅ AFTER (fixed with transaction)
export async function upgradeBuilding(planetId: string, buildingId: string) {
  return await db.$transaction(async (tx) => {
    // Lock the row
    const planet = await tx.planet.findUnique({
      where: { id: planetId }
    });

    const cost = calculateCost(buildingId, currentLevel);

    // Check resources
    if (planet.metal < cost.metal) {
      throw new Error('Insufficient resources');
    }

    // Deduct resources atomically
    return await tx.planet.update({
      where: { id: planetId },
      data: {
        metal: { decrement: cost.metal },
        crystal: { decrement: cost.crystal }
      }
    });
  });
}
```

### 7. Verify Fix

#### Run the Failing Test
```bash
npm run test -- resources.test.ts
# Expected: Test now PASSES
```

#### Run Full Test Suite
```bash
npm run test:all
# Ensure no regressions
```

#### Manual Testing
- Follow original reproduction steps
- Verify bug is fixed
- Test edge cases
- Test related functionality

### 8. Add Regression Prevention

#### Add More Test Cases
```typescript
describe('Resources system', () => {
  it('handles rapid multiple requests', async () => {
    // Test rapid-fire requests
  });

  it('handles insufficient resources correctly', async () => {
    // Test error case
  });

  it('maintains data integrity under load', async () => {
    // Load test
  });
});
```

#### Document the Bug
```typescript
/**
 * Upgrades a building on the specified planet.
 *
 * IMPORTANT: Uses database transaction to prevent race condition
 * where concurrent requests could cause negative resources.
 * See bug #123 for details.
 */
export async function upgradeBuilding(...) { }
```

### 9. Code Review
Invoke code-review skill:
```
Use the code-review skill to review the fix
```

### 10. Create Pull Request
```bash
# Commit with descriptive message
git add .
git commit -m "fix: prevent negative resources from concurrent upgrades (#123)

Root cause: Race condition in resource deduction allowed multiple
simultaneous upgrades to pass resource check.

Fix: Wrap resource check and deduction in database transaction
to ensure atomicity.

- Added transaction lock
- Added regression test
- Verified fix with manual testing

Closes #123"

# Push and create PR
git push origin bugfix/[bug-description]

gh pr create \
  --title "fix: [Bug Description] (#123)" \
  --body "$(cat <<EOF
## Bug Description
[Brief description]

## Root Cause
[Explanation of why bug occurred]

## Fix
[Explanation of fix]

## Testing
- [x] Added regression test
- [x] Test reproduces bug (before fix)
- [x] Test passes (after fix)
- [x] Manual testing completed
- [x] No test regressions

## Verification
- [x] Followed reproduction steps - bug fixed
- [x] Tested edge cases
- [x] Tested related functionality

## Impact
- Severity: [Critical/High/Medium/Low]
- Users affected: [number]
- Deployed to staging: [yes/no]

Closes #123
EOF
)"
```

### 11. Deploy to Staging
After PR approval:
```bash
gh pr merge --squash

# Verify fix in staging
```

### 12. Verify in Staging
- Test with original reproduction steps
- Monitor error logs
- Check metrics

### 13. Deploy to Production (if critical)
For critical/high severity bugs:

```bash
# Create hotfix PR to main
gh pr create \
  --base main \
  --head bugfix/[bug-description] \
  --title "hotfix: [Bug Description]"

# After approval
gh pr merge --squash
```

Invoke deploy skill for production deployment.

### 14. Monitor After Deployment
- Watch error rates in Sentry
- Monitor user reports
- Check metrics
- Verify fix worked

### 15. Post-Mortem (for critical bugs)
```markdown
# Post-Mortem: Bug #123

## What Happened
[Brief description]

## Timeline
- [Time]: Bug introduced (commit: abc123)
- [Time]: First user report
- [Time]: Investigation started
- [Time]: Root cause identified
- [Time]: Fix developed
- [Time]: Fix deployed
- [Time]: Verified resolved

## Root Cause
[Detailed explanation]

## Resolution
[How we fixed it]

## Lessons Learned
1. [Lesson 1]
2. [Lesson 2]

## Action Items
- [ ] Add test coverage for [scenario]
- [ ] Update documentation about [topic]
- [ ] Review similar code for same issue
- [ ] Add monitoring for [metric]

## Prevention
How we'll prevent similar issues:
1. [Prevention measure 1]
2. [Prevention measure 2]
```

## Bug Severity Guidelines

### Critical (fix immediately)
- System down / major functionality broken
- Data loss or corruption
- Security vulnerability
- Affects all/most users

### High (fix within 24 hours)
- Major feature broken
- Affects significant portion of users
- Workaround available but difficult
- Revenue impact

### Medium (fix within week)
- Minor feature broken
- Affects small portion of users
- Easy workaround available
- No revenue impact

### Low (fix when convenient)
- Cosmetic issues
- Rare edge cases
- Minor inconvenience
- No workaround needed

## Success Criteria
- ✅ Bug reproduced and understood
- ✅ Root cause identified
- ✅ Regression test added
- ✅ Fix implemented and tested
- ✅ No test regressions
- ✅ Code reviewed and approved
- ✅ Deployed and verified
- ✅ Monitoring confirms fix
