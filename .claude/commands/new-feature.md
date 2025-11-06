# New Feature Command

This command guides you through implementing a new feature from planning to deployment.

## Usage
```
/new-feature [feature-name]
```

Example: `/new-feature real-time-resource-updates`

## Workflow

### 1. Invoke Product Manager Agent
Get feature requirements and user stories.

**Questions to answer**:
- What problem does this solve?
- Who is the target user?
- What are the acceptance criteria?
- What are the success metrics?
- Are there any dependencies?

### 2. Invoke Game Designer Agent (if game feature)
For game mechanics features, get balance and design input.

**Questions to answer**:
- How does this fit into game balance?
- What are the formulas/mechanics?
- Are there PvE/PvP implications?
- What's the expected player progression impact?

### 3. Invoke UI/UX Designer Agent
Get design mockups and user flows.

**Questions to answer**:
- What screens/components are needed?
- What's the user flow?
- What's the visual design?
- Mobile considerations?

### 4. Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/[feature-name]
```

### 5. Invoke Lead Developer Agent
Plan technical architecture.

**Questions to answer**:
- What's the technical approach?
- Database schema changes needed?
- API endpoints required?
- Performance considerations?
- Security considerations?

### 6. Write User Stories
Create detailed user stories with acceptance criteria.

Template:
```markdown
## User Story: [Title]

**As a** [user type]
**I want** [goal]
**So that** [benefit]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Tasks
- [ ] Database migration
- [ ] API endpoint
- [ ] Frontend component
- [ ] Tests
- [ ] Documentation

### Definition of Done
- [ ] Code complete
- [ ] Tests passing (80%+ coverage)
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Deployed to staging
```

### 7. Implement Backend (if needed)
Invoke Backend Engineer Agent to:
- Create database schema changes
- Implement API routes
- Add Server Actions
- Write integration tests

### 8. Implement Frontend
Invoke Frontend Engineer Agent to:
- Create React components
- Implement UI/UX design
- Add client-side logic
- Write component tests

### 9. Write Tests
Invoke QA Engineer Agent to:
- Write unit tests
- Write integration tests
- Write E2E tests for critical flows
- Ensure >80% coverage

### 10. Code Review
Invoke code-review skill:
```
Use the code-review skill to review all changes
```

### 11. Create Pull Request
```bash
# Commit changes
git add .
git commit -m "feat: [feature-name]

[Detailed description]

- Added [component/feature]
- Updated [system]
- Tests: [coverage]

Closes #[issue-number]"

# Push branch
git push origin feature/[feature-name]

# Create PR
gh pr create \
  --title "feat: [Feature Name]" \
  --body "$(cat <<EOF
## Summary
[Brief description of feature]

## Changes
- [Change 1]
- [Change 2]

## User Stories
- #[story-id]: [description]

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added (if applicable)
- [ ] Manually tested in dev environment

## Screenshots
[If UI changes, add screenshots]

## Checklist
- [ ] Tests passing
- [ ] Coverage >80%
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## Related Issues
Closes #[issue-number]
EOF
)"
```

### 12. Deploy to Staging
After PR approval:
```bash
# Merge to develop
gh pr merge --squash

# Verify deploy to staging
# GitHub Actions will automatically deploy
```

### 13. QA Testing
Invoke QA Engineer Agent to:
- Test in staging environment
- Verify all acceptance criteria
- Test edge cases
- Verify performance

### 14. Generate Documentation
Invoke Documentation Writer Agent to:
- Update API documentation
- Update user guides
- Update changelog
- Create release notes

### 15. Deploy to Production
When ready for production:
```bash
# Create release PR
gh pr create \
  --base main \
  --head develop \
  --title "Release: v[version] - [feature-name]"

# After approval, merge and deploy
gh pr merge --squash
```

Invoke deploy skill:
```
Use the deploy skill to handle production deployment
```

### 16. Monitor and Iterate
Invoke Marketing Strategist Agent to:
- Announce feature to users
- Monitor adoption metrics
- Gather user feedback
- Plan iterations

## Example: Implementing "Real-time Resource Updates"

```
User: /new-feature real-time-resource-updates