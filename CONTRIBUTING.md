# Contributing to Space Game

Thank you for your interest in contributing to Space Game! This document provides guidelines and instructions for contributing.

## Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors, regardless of experience level, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Being respectful and welcoming to newcomers
- Showing empathy towards other community members
- Accepting constructive criticism gracefully
- Focusing on what is best for the community
- Using welcoming and inclusive language

**Examples of unacceptable behavior:**
- Trolling, insulting/derogatory comments, personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check if the issue has already been reported. If it has and is still open, add a comment to the existing issue instead of opening a new one.

**When filing a bug report, please include:**

- **Clear title and description**
- **Steps to reproduce** the bug
- **Expected behavior** vs **actual behavior**
- **Screenshots** (if applicable)
- **Browser and OS version**
- **Error messages** from console
- **Additional context** that might be helpful

**Bug Report Template:**
```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Enter '...'
4. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Node: v20.10.0
- Version: 0.1.0

## Console Errors
```
[Error messages here]
```

## Screenshots
[If applicable]

## Additional Context
[Any other relevant information]
```

### Suggesting Features

We love feature suggestions! Before submitting, please check if the feature has already been suggested.

**Feature Request Template:**
```markdown
## Feature Description
Clear description of the feature.

## Problem it Solves
What problem does this feature solve?

## Proposed Solution
How would you implement this?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Mockups, examples, or references.
```

### Pull Request Process

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/space-game.git
   cd space-game
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-description
   ```

3. **Set Up Development Environment**
   ```bash
   npm install
   cp .env.example .env.local
   # Configure .env.local
   npx prisma migrate dev
   npm run dev
   ```

4. **Make Your Changes**
   - Write clean, readable code
   - Follow our [coding standards](#coding-standards)
   - Add tests for new features
   - Update documentation if needed

5. **Test Your Changes**
   ```bash
   npm run lint          # Check for linting errors
   npm run type-check    # Check TypeScript types
   npm run test          # Run unit tests
   npm run test:e2e      # Run E2E tests (optional)
   ```

6. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Formatting changes
   - `refactor:` Code restructuring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

7. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create Pull Request**
   - Go to the [Space Game repository](https://github.com/yourusername/space-game)
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit!

### Pull Request Guidelines

**Your PR should:**
- [ ] Have a clear title and description
- [ ] Reference any related issues (`Closes #123`)
- [ ] Include tests for new features
- [ ] Maintain or improve test coverage (>80%)
- [ ] Pass all CI checks
- [ ] Follow coding standards
- [ ] Update documentation if needed
- [ ] Be focused on a single feature/fix

**PR Template:**
```markdown
## Description
Brief description of changes.

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed

## Screenshots
[If UI changes, add screenshots]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Additional Notes
[Any additional information]
```

## Coding Standards

### TypeScript

```typescript
// ✅ GOOD: Explicit types, no any
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function getUserProfile(id: string): Promise<UserProfile> {
  return db.user.findUnique({ where: { id } });
}

// ❌ BAD: Using any
function getUserProfile(id: any): any {
  return db.user.findUnique({ where: { id } });
}
```

### React Components

```typescript
// ✅ GOOD: Typed props, clear structure
interface ButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### API Routes

```typescript
// ✅ GOOD: Validation, error handling, proper status codes
import { z } from 'zod';

const schema = z.object({
  planetId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planetId } = schema.parse(body);

    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Business logic...
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Testing

```typescript
// ✅ GOOD: Descriptive tests, edge cases covered
describe('calculateProduction', () => {
  it('calculates metal production correctly for level 10', () => {
    const result = calculateProduction({ type: 'metalMine', level: 10 });
    expect(result.metal).toBe(466);
  });

  it('applies geologist bonus', () => {
    const result = calculateProduction(
      { type: 'metalMine', level: 10 },
      { geologist: true }
    );
    expect(result.metal).toBe(513);
  });

  it('handles level 0', () => {
    const result = calculateProduction({ type: 'metalMine', level: 0 });
    expect(result.metal).toBe(0);
  });
});
```

## Development Workflow

### Branch Strategy

```
main (production)
  └── develop (integration)
       ├── feature/your-feature
       ├── bugfix/issue-description
       └── hotfix/critical-bug
```

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
feat(fleet): add real-time fleet tracking
fix(resources): prevent negative resources (#123)
docs(api): update endpoint documentation
test(combat): add edge case tests
```

## Project Setup

### Required Tools

- Node.js 20+
- PostgreSQL 16+
- npm 10+
- Git

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/space_game"
NEXTAUTH_SECRET="generate-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Optional
REDIS_URL="redis://localhost:6379"
SENTRY_DSN=""
NEXT_PUBLIC_GA_ID=""
```

## Getting Help

### Resources

- **Documentation**: Check `/docs` folder
- **API Docs**: See `/docs/api`
- **Game Design**: See `/docs/game-design`
- **Architecture**: See `/docs/architecture`

### Contact

- **Discord**: [Join our Discord](https://discord.gg/space-game)
- **GitHub Discussions**: [Ask questions](https://github.com/yourusername/space-game/discussions)
- **Email**: dev@space-game.com

## Recognition

Contributors will be:
- Listed in our Contributors section
- Credited in release notes
- Invited to our Discord contributors channel
- Given a special badge in-game (when launched)

## License

By contributing to Space Game, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Space Game! 🚀

🤖 Generated with [Claude Code](https://claude.com/claude-code)
