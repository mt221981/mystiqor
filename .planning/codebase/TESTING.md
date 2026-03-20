# Testing Patterns

**Analysis Date:** 2026-03-20

## Test Framework

**Status:** No testing framework configured

**Current State:**
- `package.json` has no test dependencies: No Jest, Vitest, React Testing Library, or similar
- No test configuration files found: No `jest.config.js`, `vitest.config.ts`, etc.
- No test files in source tree: Zero `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx` files in `src/`
- Build and lint scripts present, but no test script: `"lint": "next lint"` exists, but no `"test"` command

**Dev Dependencies (Current):**
```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "eslint": "^8",
  "eslint-config-next": "14.2.23",
  "postcss": "^8",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

## Recommended Testing Setup

Based on CLAUDE.md requirements and modern Next.js practices, the following should be added:

**For Unit/Integration Tests:**
- Framework: Vitest or Jest
- Recommended: Vitest (faster, ESM-first, better TypeScript support)
- Config file location: `vitest.config.ts`

**For React Component Tests:**
- Library: React Testing Library with Vitest
- Setup files: `src/__tests__/setup.ts` or `vitest.setup.ts`
- Test utilities: `src/__tests__/test-utils.tsx` for custom render function

**For API Route Tests:**
- Framework: Vitest with msw (Mock Service Worker)
- Or: Node.js native test runner (Node 20+)

**For E2E Tests:**
- Framework: Playwright or Cypress
- Config location: `playwright.config.ts` or `cypress.config.ts`

## Test File Organization

**Recommended Location:**
- Co-located with source: `src/components/common/LoadingSpinner.test.tsx` next to `src/components/common/LoadingSpinner.tsx`
- Or centralized: `src/__tests__/components/common/LoadingSpinner.test.tsx`
- API tests: `src/__tests__/api/auth/callback.test.ts`

**Naming Convention:**
- `[filename].test.ts[x]` for unit/integration tests
- `[filename].spec.ts[x]` for behavior-driven tests (optional)
- E2E tests: `e2e/[feature].spec.ts` or `e2e/[page].e2e.ts`

**Example Structure (recommended):**
```
src/
├── components/
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── LoadingSpinner.test.tsx
├── hooks/
│   ├── useDebounce.ts
│   └── useDebounce.test.ts
├── lib/
│   └── utils/
│       ├── dates.ts
│       └── dates.test.ts
└── __tests__/
    ├── setup.ts
    ├── test-utils.tsx
    └── api/
        └── auth.test.ts
```

## Test Structure

**Recommended Pattern using Vitest + React Testing Library:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('rendering', () => {
    it('renders spinner with default size', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with custom size', () => {
      render(<LoadingSpinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('displays message when provided', () => {
      const message = 'טוען תוכן...';
      render(<LoadingSpinner message={message} />);
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label', () => {
      const message = 'טוען...';
      render(<LoadingSpinner message={message} />);
      const spinner = screen.getByRole('status', { name: message });
      expect(spinner).toBeInTheDocument();
    });

    it('hides icon from screen readers', () => {
      render(<LoadingSpinner size="md" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
```

**Test Suite Structure:**
- One `describe` block per component/function
- Nested `describe` blocks for logical grouping (rendering, accessibility, edge cases)
- One `it` per behavior/assertion
- Clear test names describing what is being tested

**Setup and Teardown:**
```typescript
import { beforeEach, afterEach, vi } from 'vitest';

describe('Component', () => {
  beforeEach(() => {
    // Reset mocks, clear localStorage, etc.
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  it('test', () => {
    // Test code
  });
});
```

## Mocking

**Framework:** Vitest with `vi` namespace

**Patterns for Common Cases:**

**Mocking Modules:**
```typescript
import { vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: vi.fn(),
    },
  })),
}));
```

**Mocking Functions:**
```typescript
const mockOnSubmit = vi.fn();
render(<LoginForm onSubmit={mockOnSubmit} isSubmitting={false} />);

const button = screen.getByRole('button', { name: /התחבר/i });
await userEvent.click(button);

expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
  email: 'test@example.com',
}));
```

**Mocking Browser APIs:**
```typescript
// Clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

**What to Mock:**
- External API calls (Supabase, Stripe, etc.)
- Browser APIs (localStorage, clipboard, window.location)
- Timers (setTimeout, setInterval) — use `vi.useFakeTimers()` for tests that depend on time
- Heavy dependencies (animations, large libraries)

**What NOT to Mock:**
- Internal utilities: `cn()`, `formatDate()`, date/time functions
- React hooks (use real hooks where possible to test real behavior)
- React components in components that use them (unless integration test doesn't require them)
- User interactions (use `userEvent` from @testing-library/user-event, not `fireEvent`)

## Fixtures and Factories

**Test Data (Recommended Pattern):**

```typescript
// src/__tests__/fixtures/auth.ts
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
};

export const mockLoginFormData = {
  email: 'test@example.com',
  password: 'ValidPassword123',
};

// Usage in tests
import { mockUser, mockLoginFormData } from '@/__tests__/fixtures/auth';

it('logs in user', async () => {
  // Use fixtures
});
```

**Factories for Complex Objects:**

```typescript
// src/__tests__/factories/user.ts
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// Usage
const user = createMockUser({ email: 'custom@example.com' });
```

**Location:**
- Fixtures: `src/__tests__/fixtures/[domain].ts`
- Factories: `src/__tests__/factories/[domain].ts`
- Shared test utilities: `src/__tests__/test-utils.tsx`

## Coverage

**Requirements:** Not enforced in current setup

**Recommended Targets (for production-grade):**
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

**View Coverage (when configured):**
```bash
npm run test -- --coverage
# or
vitest --coverage
```

**Critical Paths to Test (by priority):**
1. Authentication flows (login, register, logout)
2. Form validation (with Zod schemas)
3. Error boundaries and error handling
4. API routes (especially those that modify data)
5. RTL utilities and date formatting functions
6. Custom hooks (useDebounce, useMobile, etc.)

## Test Types

**Unit Tests:**
- Scope: Individual functions, utilities, hooks
- Files: `src/lib/utils/dates.test.ts`, `src/hooks/useDebounce.test.ts`
- Approach:
  - Test pure functions with various inputs
  - Test edge cases (null, undefined, empty, invalid inputs)
  - Test error conditions
  - Test return values and side effects

**Example Unit Test (dates utility):**
```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeDate } from '@/lib/utils/dates';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('formats date in DD/MM/YYYY', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toBe('15/03/2024');
    });

    it('throws on invalid date', () => {
      expect(() => formatDate('invalid')).toThrow();
    });
  });

  describe('formatRelativeDate', () => {
    it('returns "היום" for today', () => {
      expect(formatRelativeDate(new Date())).toBe('היום');
    });

    it('returns "אתמול" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatRelativeDate(yesterday)).toBe('אתמול');
    });
  });
});
```

**Integration Tests:**
- Scope: Multiple components/modules working together
- Files: `src/app/(public)/login/login-forms.test.tsx`
- Approach:
  - Render component with real hooks and context
  - Test form submission workflow
  - Test error state display
  - Test user interactions (type, submit, navigate)

**Example Integration Test (login form):**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/app/(public)/login/login-forms';

describe('LoginForm Integration', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn(() => Promise.resolve());

    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        showPassword={false}
        onTogglePassword={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText('אימייל'), 'test@example.com');
    await user.type(screen.getByLabelText('סיסמה'), 'ValidPassword123');
    await user.click(screen.getByRole('button', { name: /התחבר/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'ValidPassword123',
      })
    );
  });

  it('displays validation errors', async () => {
    const user = userEvent.setup();

    render(
      <LoginForm
        onSubmit={vi.fn()}
        isSubmitting={false}
        showPassword={false}
        onTogglePassword={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /התחבר/i }));

    expect(screen.getByText(/נא להזין כתובת אימייל/i)).toBeInTheDocument();
  });
});
```

**E2E Tests (when configured):**
- Framework: Playwright or Cypress
- Scope: Full user workflows across multiple pages
- Files: `e2e/auth.spec.ts`, `e2e/dashboard.spec.ts`
- Approach:
  - Test complete user journeys (sign up → login → use feature)
  - Test navigation and routing
  - Test real browser interactions
  - Test responsive design on multiple viewports

## Common Patterns

**Async Testing (with Vitest + userEvent):**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('handles async submission', async () => {
  const user = userEvent.setup();
  const mockOnSubmit = vi.fn(async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  render(<FormComponent onSubmit={mockOnSubmit} />);

  await user.type(screen.getByRole('textbox'), 'input');
  await user.click(screen.getByRole('button'));

  expect(screen.getByRole('status')).toHaveTextContent('טוען...');

  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
```

**Error Testing:**
```typescript
import { describe, it, expect } from 'vitest';

describe('Error Handling', () => {
  it('catches and displays error message', async () => {
    const error = new Error('API failed');
    const mockFetch = vi.fn().mockRejectedValue(error);

    // Test that error is handled gracefully
    const result = await safeFunction(mockFetch);
    expect(result).toEqual({ error: 'API failed' });
  });

  it('error boundary recovers after 3 errors', async () => {
    // Simulate 3 errors in 5 seconds
    // Verify auto-reset occurs
  });
});
```

## Test Utilities

**Recommended Setup File (src/__tests__/test-utils.tsx):**
```typescript
import { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';

// Add global test providers (theme, auth, query client, etc.)
function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: ReactElement }) {
    return <>{children}</>;
    // Add real providers here:
    // return <ThemeProvider>{children}</ThemeProvider>
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render };
```

## Run Commands (Recommended Setup)

```bash
# Install test dependencies
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom

# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Single test file
npm run test src/lib/utils/dates.test.ts
```

**Recommended package.json additions:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

*Testing analysis: 2026-03-20*

**Note:** Currently NO testing framework is configured. This document provides recommended patterns based on Next.js 14+ best practices and the project's technology stack (React 19, TypeScript, Zod validation). Implementation should prioritize authentication flows and form validation tests first.
