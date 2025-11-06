# Review Pull Request Command

This command performs a comprehensive PR review.

## Usage
```
/review-pr [pr-number]
```

Example: `/review-pr 42`

## Workflow

### 1. Fetch PR Information
```bash
# Get PR details
gh pr view [pr-number]

# Checkout PR branch
gh pr checkout [pr-number]

# Get changed files
git diff main...HEAD --name-only
```

### 2. Understand the Changes

#### Read PR Description
- What is the goal of this PR?
- What problem does it solve?
- Are there related issues?
- Are there breaking changes?

#### Review Commit History
```bash
# View commits in PR
git log main..HEAD --oneline

# View detailed changes
git log main..HEAD -p
```

#### Identify Scope
- Files changed
- Lines added/removed
- Areas affected (frontend, backend, database, etc.)
- Dependencies updated

### 3. Code Review Checklist

#### General Code Quality
- [ ] Code is readable and well-organized
- [ ] Functions are small and focused (<50 lines)
- [ ] Variable and function names are clear
- [ ] No code duplication
- [ ] Comments explain "why", not "what"
- [ ] No commented-out code (remove it)
- [ ] No console.log statements
- [ ] No debug code left in

#### TypeScript
- [ ] Strict mode compliance (no `any` types)
- [ ] Proper type annotations
- [ ] Interfaces for complex objects
- [ ] Exported types for public APIs
- [ ] No type assertions without justification
- [ ] Enums or const objects for constants

#### React/Frontend
- [ ] Components have proper TypeScript props
- [ ] Hooks used correctly (dependency arrays)
- [ ] No unnecessary re-renders
- [ ] Accessibility attributes (aria-*, alt, role)
- [ ] Key props on lists
- [ ] Error boundaries where appropriate
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Responsive design considered
- [ ] Performance optimized (memoization, lazy loading)

#### API/Backend
- [ ] Input validation with Zod
- [ ] Proper HTTP status codes
- [ ] Error handling with try/catch
- [ ] Authentication checks
- [ ] Authorization checks (user owns resource)
- [ ] Rate limiting considered
- [ ] Logging for important operations
- [ ] No sensitive data in logs

#### Database
- [ ] Uses Prisma (no raw SQL without reason)
- [ ] Migrations included
- [ ] Proper indexes added
- [ ] N+1 queries prevented
- [ ] Transactions for related writes
- [ ] Cascading deletes configured correctly
- [ ] No breaking schema changes (or migration plan)

#### Security
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables for sensitive config
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention (React handles)
- [ ] CSRF tokens on mutations
- [ ] No sensitive data exposed in API responses

#### Performance
- [ ] No blocking operations in loops
- [ ] Efficient algorithms
- [ ] Database queries optimized
- [ ] Caching used where appropriate
- [ ] Images optimized
- [ ] Code splitting for large components
- [ ] Lazy loading for non-critical code

#### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] Test coverage >80%
- [ ] Tests are readable
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] No flaky tests

#### Documentation
- [ ] JSDoc for public functions
- [ ] README updated (if needed)
- [ ] API docs updated (if API changes)
- [ ] Inline comments for complex logic
- [ ] Migration guide (if breaking changes)
- [ ] Changelog updated

#### Git/Process
- [ ] Branch name follows convention
- [ ] Commit messages are descriptive
- [ ] No merge conflicts
- [ ] PR description is clear
- [ ] Related issues linked
- [ ] Small, focused changes (not too large)

### 4. Run Automated Checks
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm run test

# Build
npm run build

# Check bundle size
npm run analyze  # if available
```

### 5. Manual Testing
```bash
# Start dev server
npm run dev

# Test the changes manually
# - Follow PR description test plan
# - Test happy path
# - Test error cases
# - Test edge cases
# - Test on mobile (if UI changes)
```

### 6. Invoke Specialized Agents

#### For Frontend Changes
Invoke Frontend Engineer agent to review:
- Component structure
- Responsive design
- Accessibility
- Performance
- Best practices

#### For Backend Changes
Invoke Backend Engineer agent to review:
- API design
- Database queries
- Performance
- Security
- Best practices

#### For Game Mechanics
Invoke Game Designer agent to review:
- Balance implications
- Formula correctness
- Player experience impact

### 7. Generate Review Comments

#### For Each Issue Found
```markdown
## 📝 Review Comments

### Critical Issues (must fix before merge)
#### `src/api/fleet/route.ts:45`
**Issue**: SQL injection vulnerability
**Severity**: 🔴 Critical
**Description**: User input directly concatenated into query
**Code**:
```typescript
const query = `SELECT * FROM fleet WHERE id = '${id}'`;
```
**Fix**:
```typescript
const fleet = await db.fleet.findUnique({ where: { id } });
```
**Reason**: Prevents SQL injection attacks

---

### Important Issues (should fix)
#### `src/components/FleetCard.tsx:23`
**Issue**: Missing accessibility attribute
**Severity**: 🟡 Medium
**Description**: Button lacks aria-label
**Code**:
```tsx
<button onClick={handleAttack}>⚔️</button>
```
**Fix**:
```tsx
<button onClick={handleAttack} aria-label="Attack target planet">⚔️</button>
```
**Reason**: Screen readers need text alternative for emoji

---

### Suggestions (nice to have)
#### `src/lib/combat.ts:100`
**Issue**: Could be more readable
**Severity**: 🟢 Low
**Description**: Complex nested ternary
**Code**:
```typescript
const damage = a > b ? (c > d ? x : y) : (c > d ? z : w);
```
**Fix**:
```typescript
const useHighDamage = a > b;
const hasShields = c > d;

const damage = useHighDamage
  ? (hasShields ? x : y)
  : (hasShields ? z : w);
```
**Reason**: More readable, easier to debug

---

### Praise (good work!) 👏
#### `src/hooks/useRealTimeResources.ts`
**Good**: Excellent use of WebSocket with error handling
**Why**: Handles connection failures gracefully, auto-reconnects

#### `tests/integration/fleet.test.ts`
**Good**: Comprehensive edge case coverage
**Why**: Tests concurrent operations, validates race conditions

---

### Questions ❓
1. Why was approach X chosen over approach Y?
2. Should we add caching for this endpoint?
3. Is the new dependency necessary?
```

### 8. Provide Overall Assessment

```markdown
## Overall Assessment

### Summary
This PR [adds/fixes/improves] [feature/bug/performance] by [description].

### Changes Overview
- Added [X] files
- Modified [Y] files
- Deleted [Z] files
- [+X, -Y] lines of code

### Strengths
- ✅ Well-tested (92% coverage)
- ✅ Clean, readable code
- ✅ Good error handling
- ✅ Comprehensive documentation

### Areas for Improvement
- ⚠️ 2 critical security issues
- ⚠️ Missing accessibility attributes
- ⚠️ Could improve performance of [specific area]

### Test Results
- Unit tests: 45/45 passing ✅
- Integration tests: 12/12 passing ✅
- E2E tests: 5/5 passing ✅
- Coverage: 92% (target: 80%) ✅
- Build: Success ✅
- Type check: No errors ✅
- Lint: No errors ✅

### Performance Impact
- Bundle size: +12KB (acceptable)
- API response time: ~180ms (target: <200ms) ✅
- Page load: ~1.5s (target: <2s) ✅

### Security Review
- ⚠️ 1 critical issue found (SQL injection)
- ⚠️ 1 medium issue found (missing rate limiting)

### Recommendation

❌ **REQUEST CHANGES**
- Critical security issue must be fixed
- Missing rate limiting should be added
- Address accessibility concerns

Once these are resolved:
✅ **APPROVE AND MERGE**

---

**Reviewed by**: [Agent Name]
**Review date**: [Date]
**Time spent**: [Duration]
```

### 9. Post Review to GitHub
```bash
# Add review comments
gh pr review [pr-number] \
  --comment \
  --body "$(cat review-comments.md)"

# Or request changes
gh pr review [pr-number] \
  --request-changes \
  --body "$(cat review-comments.md)"

# Or approve
gh pr review [pr-number] \
  --approve \
  --body "$(cat review-comments.md)"
```

### 10. Follow Up

#### If Changes Requested
- Monitor for author responses
- Re-review after changes pushed
- Verify all concerns addressed

#### If Approved
- Ensure CI/CD passing
- Verify staging deployment
- Monitor after merge

## Review Guidelines

### Be Constructive
- Point out what's good, not just problems
- Explain *why* something should change
- Provide specific code examples
- Offer alternative solutions
- Be respectful and encouraging

### Be Thorough
- Review every changed file
- Don't just skim the code
- Test the changes manually
- Think about edge cases
- Consider security implications

### Be Timely
- Review within 24 hours (or faster for urgent)
- Don't block unnecessarily
- If busy, let author know

### Prioritize Issues
- **Critical**: Security, data corruption, system down
- **High**: Broken functionality, bad UX
- **Medium**: Code quality, performance, maintainability
- **Low**: Style preferences, minor improvements

## Anti-Patterns to Avoid

### ❌ Don't Do These
1. **Rubber Stamp Reviews**: Approving without actually reviewing
2. **Nitpicking**: Obsessing over style preferences
3. **Vague Feedback**: "This doesn't look right" (explain why!)
4. **Scope Creep**: Requesting features not related to PR
5. **Blocking Without Reason**: Must explain concerns clearly

## Success Criteria
- ✅ All changed files reviewed
- ✅ Tests run locally
- ✅ Manual testing completed
- ✅ Specific, actionable feedback given
- ✅ Security reviewed
- ✅ Performance considered
- ✅ Clear approval/rejection decision
