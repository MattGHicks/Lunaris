# Deployment Skill

This skill handles the complete deployment process with safety checks.

## Usage
Invoke this skill when you're ready to deploy to staging or production.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Test coverage >80%
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code reviewed and approved
- [ ] No console.log statements
- [ ] No TODO comments in critical code

### Database
- [ ] Migrations tested in dev environment
- [ ] Backup taken (production only)
- [ ] Rollback plan documented
- [ ] Indexes created for new queries
- [ ] No breaking schema changes (or coordinated deployment)

### Environment
- [ ] Environment variables updated
- [ ] Secrets rotated if needed
- [ ] Third-party services configured
- [ ] CDN cache invalidated if needed

### Documentation
- [ ] Changelog updated
- [ ] API documentation updated
- [ ] User-facing changes documented
- [ ] Deployment notes prepared

## Deployment Process

### 1. Determine Target Environment

```bash
# Check current git branch
git branch --show-current

# develop → staging
# main → production
```

### 2. Run Pre-Deployment Tests

```bash
# Run full test suite
npm run test:all

# Build check
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

**Stop if any check fails!**

### 3. Database Migrations

#### Staging
```bash
# Ensure migrations are ready
npx prisma migrate status

# Apply migrations
npx prisma migrate deploy

# Verify migration success
npx prisma migrate status
```

#### Production
```bash
# Take database backup first!
pg_dump $PROD_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Test migrations on production dump locally
psql local_db < backup.sql
npx prisma migrate deploy

# If successful, apply to production
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### 4. Deploy Application

#### Staging (Vercel)
```bash
# Deploy to staging
vercel --env staging

# Or via GitHub (merge to develop)
git checkout develop
git merge feature/branch-name
git push origin develop

# GitHub Action will auto-deploy
```

#### Production (Vercel)
```bash
# Merge to main via PR
gh pr create --base main --head develop --title "Release vX.Y.Z"

# After PR approval and merge, GitHub Action deploys to production

# Or manual deploy
vercel --prod
```

### 5. Post-Deployment Verification

#### Smoke Tests
```bash
# Check health endpoint
curl https://space-game.com/api/health

# Expected: { "status": "ok", "timestamp": "..." }

# Test critical endpoints
curl https://space-game.com/api/planets?test=true

# Test authentication
curl https://space-game.com/api/auth/session
```

#### Manual Checks
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard shows data
- [ ] Building upgrade works
- [ ] Fleet send works
- [ ] Real-time updates working
- [ ] No console errors
- [ ] No broken images

#### Monitoring
```bash
# Check error tracking (Sentry)
# Visit: https://sentry.io/organizations/space-game/issues/

# Check performance monitoring
# Visit: https://vercel.com/dashboard/analytics

# Check database performance
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

### 6. Rollback Plan (If Issues Found)

#### Application Rollback
```bash
# Vercel: Rollback to previous deployment
vercel rollback

# Or via dashboard: Vercel → Deployments → Previous → Promote to Production
```

#### Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Or revert migrations
npx prisma migrate resolve --rolled-back migration_name
```

### 7. Post-Deployment Communication

#### Internal Notification
```markdown
# Deployment Complete: [Staging/Production]

**Version**: vX.Y.Z
**Deployed**: [Date] [Time] [Timezone]
**Deployed By**: [Name]

## Changes
- Feature: [Description]
- Feature: [Description]
- Fix: [Description]
- Performance: [Description]

## Database Migrations
- [Migration 1]: [Description]
- [Migration 2]: [Description]

## Verification Status
- ✅ Smoke tests passed
- ✅ Critical flows tested
- ✅ No errors in monitoring
- ✅ Performance within SLA

## Rollback Plan
If issues arise:
1. Run: `vercel rollback`
2. Notify team in #engineering
3. Investigate in staging environment

## Monitoring
- Sentry: [Link]
- Analytics: [Link]
- Logs: [Link]
```

#### User-Facing Announcement (Production Only)
```markdown
# 🚀 New Update: vX.Y.Z

We've just released a new update with exciting improvements!

## New Features
- ✨ [Feature 1]: [User-friendly description]
- ✨ [Feature 2]: [User-friendly description]

## Improvements
- ⚡ [Performance improvement]
- 🎨 [UI improvement]

## Bug Fixes
- 🐛 [Fixed issue]
- 🐛 [Fixed issue]

## Known Issues
- [Issue]: [Workaround]

Questions? Join our Discord: [Link]
```

## Deployment Report Template

```markdown
# Deployment Report

## Summary
- **Environment**: Staging / Production
- **Version**: vX.Y.Z
- **Date**: YYYY-MM-DD HH:MM:SS [Timezone]
- **Duration**: X minutes
- **Status**: ✅ Success / ⚠️ Success with Issues / ❌ Failed

## Changes Deployed
### Features (X)
1. [Feature name] - [Brief description]
2. ...

### Bug Fixes (X)
1. [Bug name] - [Brief description]
2. ...

### Performance (X)
1. [Optimization] - [Impact]
2. ...

### Database Migrations (X)
1. [Migration name] - [Description]
2. ...

## Pre-Deployment Checks
- ✅ Tests: 306/308 passed (99.4%)
- ✅ Coverage: 87% (target: 80%)
- ✅ Build: Success
- ✅ Type check: No errors
- ✅ Lint: No errors
- ✅ Code review: Approved by Lead Developer

## Deployment Steps
1. ✅ Database backup created
2. ✅ Migrations applied (3 migrations, 2.3s)
3. ✅ Application deployed (vercel)
4. ✅ Health check passed
5. ✅ Smoke tests passed

## Post-Deployment Verification
- ✅ Homepage loads (1.2s)
- ✅ Login works
- ✅ Dashboard loads (1.8s)
- ✅ Building upgrade works
- ✅ Fleet operations work
- ✅ Real-time updates functional
- ✅ No errors in Sentry (last 15 min)
- ✅ Performance within SLA

## Metrics (First Hour)
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Error rate | 0.02% | <0.1% | ✅ |
| P95 response time | 185ms | <200ms | ✅ |
| Uptime | 100% | >99.9% | ✅ |
| Active users | 234 | N/A | ℹ️ |

## Issues Encountered
None / [List any issues and how they were resolved]

## Rollback Status
Not required / [If rollback was needed, describe]

## Next Steps
1. Monitor for 24 hours
2. Prepare next release
3. Address user feedback

---

**Deployed by**: [Name]
**Approved by**: [Name]
**Report generated**: [Timestamp]
```

## Invoke DevOps Agent
After deployment, invoke the DevOps Engineer agent to:
- Monitor application performance
- Check error rates
- Verify infrastructure health
- Set up alerts if needed

## Emergency Rollback Procedure

If critical issues are detected:

1. **Immediate Action**
   ```bash
   # Rollback application
   vercel rollback
   ```

2. **Notify Team**
   ```
   @here EMERGENCY ROLLBACK
   Environment: [Staging/Production]
   Reason: [Critical issue description]
   Status: Rolled back to previous version
   ```

3. **Investigate**
   - Check error logs
   - Review metrics
   - Identify root cause

4. **Fix and Redeploy**
   - Fix issue in develop branch
   - Test thoroughly
   - Redeploy when ready

## Success Criteria
- ✅ All smoke tests pass
- ✅ No increase in error rate
- ✅ Performance within SLA
- ✅ No user-reported critical bugs (first hour)
- ✅ Database migrations successful
- ✅ Monitoring shows healthy metrics
