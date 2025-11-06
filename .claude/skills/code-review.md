# Code Review Skill

This skill performs a comprehensive code review on changed files.

## Usage
Invoke this skill when you need to review code before committing or creating a PR.

## Process

### 1. Identify Changed Files
```bash
# Get list of changed files
git diff --name-only

# Or for staged files
git diff --cached --name-only
```

### 2. Review Each File
For each changed file, check:

#### Code Quality
- [ ] Follows TypeScript strict mode (no `any` types)
- [ ] Proper error handling (try/catch, error returns)
- [ ] No console.log statements (use proper logging)
- [ ] Clear variable and function names
- [ ] Functions are small and focused (<50 lines)
- [ ] No code duplication (DRY principle)
- [ ] Comments explain "why", not "what"

#### TypeScript
- [ ] Proper type annotations
- [ ] No type assertions without justification
- [ ] Interfaces for objects, types for unions
- [ ] Exported types for public APIs

#### React Components
- [ ] Proper component props typing
- [ ] No unnecessary re-renders
- [ ] Hooks used correctly
- [ ] Accessibility attributes (aria-*, alt, etc.)
- [ ] Key props on lists
- [ ] No inline function definitions in JSX

#### API Routes
- [ ] Input validation with Zod
- [ ] Proper HTTP status codes
- [ ] Error handling
- [ ] Authentication checks
- [ ] Authorization checks (user owns resource)
- [ ] Rate limiting considered

#### Database Queries
- [ ] Uses Prisma (no raw SQL without reason)
- [ ] Proper indexes considered
- [ ] N+1 queries prevented (use include/select)
- [ ] Transactions for multiple related writes
- [ ] Cascading deletes configured

#### Security
- [ ] No hardcoded secrets
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] CSRF tokens on mutations
- [ ] No sensitive data in logs

#### Performance
- [ ] No blocking operations in loops
- [ ] Proper caching considered
- [ ] Images optimized
- [ ] Code splitting for large components
- [ ] Memoization where appropriate

#### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] Test coverage >80%
- [ ] Tests are readable and maintainable

### 3. Run Automated Checks
```bash
# Lint
npm run lint

# Type check
npm run type-check

# Run tests
npm run test

# Build
npm run build
```

### 4. Generate Review Report

**File**: `<filename>`

**Issues Found**: X

**Critical Issues** (must fix):
1. Issue description and location
2. ...

**Suggestions** (should fix):
1. Suggestion and reasoning
2. ...

**Praise** (good practices):
1. What was done well
2. ...

**Overall Assessment**: ✅ Approve | ⚠️ Approve with comments | ❌ Request changes

### 5. Provide Actionable Feedback

For each issue, provide:
- **Location**: File and line number
- **Issue**: What's wrong
- **Why**: Why it's a problem
- **Fix**: Suggested solution with code example

Example:
```
❌ src/api/buildings/route.ts:15

Issue: Using 'any' type for request body
Why: Loses type safety, could cause runtime errors
Fix:
```typescript
// Before
const body: any = await request.json();

// After
import { z } from 'zod';

const upgradeSchema = z.object({
  buildingId: z.string(),
  planetId: z.string(),
});

const body = upgradeSchema.parse(await request.json());
```
```

## Output Format

```markdown
# Code Review Report

## Summary
- Files reviewed: X
- Critical issues: X
- Suggestions: X
- Tests: ✅ Passing / ❌ Failing
- Build: ✅ Success / ❌ Failed

## Detailed Review

### File: src/path/to/file.ts

**Assessment**: ✅ Looks good | ⚠️ Minor issues | ❌ Major issues

**Issues**:
1. [CRITICAL] Description with code example
2. [SUGGESTION] Description with code example

**Praise**:
1. Good practice observed

---

### File: src/path/to/another.ts
...

## Overall Recommendation
✅ **APPROVE** - Code is ready to merge
⚠️ **APPROVE WITH COMMENTS** - Minor issues, can be fixed later
❌ **REQUEST CHANGES** - Critical issues must be addressed
```

## Invoke Lead Developer Agent
After completing the review, if critical issues are found, invoke the Lead Developer agent to provide architectural guidance.
