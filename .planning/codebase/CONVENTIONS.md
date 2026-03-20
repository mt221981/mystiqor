# Coding Conventions

**Analysis Date:** 2026-03-20

## Naming Patterns

**Files:**
- PascalCase for components: `LoadingSpinner.tsx`, `ErrorBoundary.tsx`, `Breadcrumbs.tsx`
- camelCase for utilities and hooks: `useDebounce.ts`, `dates.ts`, `sanitize.ts`, `cn.ts`
- UPPER_SNAKE for constants in array form: `NAV_SECTIONS`, `FEATURES`, `SIZE_CLASSES`, `TEXT_SIZE_CLASSES`
- index files for barrel exports: `src/components/ui/`, `src/lib/validations/`

**Functions:**
- camelCase for all functions: `formatDate()`, `formatDateTime()`, `getHebrewDayPeriod()`
- camelCase for custom hooks: `useDebounce<T>()`, `useThrottle<T>()`, `useMobile()`
- Async handlers prefixed with `handle`: `handleRetry()`, `handleGoHome()`, `handleCopyError()`
- Private methods on classes use `private` keyword: `private handleAutoReset()`, `private handleRetry()`

**Variables:**
- camelCase for all variables and state: `debouncedValue`, `errorCount`, `showPassword`
- const for all declarations (no let/var): `const errorText = ...`, `const NAV_SECTIONS = [...]`
- Readonly for immutable objects: `readonly children: ReactNode`, `readonly items: readonly BreadcrumbItem[]`
- Generic type parameters with single letters: `<T>`, `<K>`, `<V>`

**Types:**
- PascalCase for all TypeScript types and interfaces: `LoadingSpinnerProps`, `ErrorBoundaryProps`, `BreadcrumbItem`, `NavSection`
- Suffixed with `Props` for component props interfaces: `LoginFormProps`, `RegisterFormProps`, `MagicLinkFormProps`
- Suffixed with `State` for component state interfaces: `ErrorBoundaryState`
- Type aliases use PascalCase: `type SpinnerSize = 'sm' | 'md' | 'lg'`
- Enum-like types use union literals: `type SpinnerSize = 'sm' | 'md' | 'lg'` (not TypeScript enums)

**Constants:**
- UPPER_SNAKE_CASE for module-level constants: `AUTO_RESET_THRESHOLD`, `ERROR_WINDOW_MS`, `MAX_ERRORS_BEFORE_AUTO_RESET`
- Grouped by feature in sections marked with comments: `// ===== קבועים =====`, `// ===== קבועי גודל =====`
- Type-annotated for clarity: `const SIZE_CLASSES: Readonly<Record<SpinnerSize, string>> = {...}`

## Code Style

**Formatting:**
- No Prettier config file — uses Next.js default configuration
- eslint-config-next is the primary linter (`.eslintrc.json` extends `next/core-web-vitals` and `next/typescript`)
- Line length: No enforced limit observed, but files kept under 300 lines
- Indentation: 2 spaces (inferred from codebase)
- Semicolons: Always present at statement ends
- Quotes: Single quotes for strings (inferred from `'use client'` directives)

**Linting:**
- ESLint configuration: `next/core-web-vitals` and `next/typescript`
- TypeScript strict mode enabled in `tsconfig.json`: `"strict": true`
- No `any` types allowed in entire codebase
- `noUncheckedIndexedAccess: true` enforces safe array/object access
- No `@ts-ignore` or `@ts-expect-error` comments observed
- JSX pragma: `jsx: "react-jsx"` (React 19 compatible)

**Recommended Rules (from .eslintrc.json):**
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

## Import Organization

**Order:**
1. External libraries (React, Next.js, third-party): `import { Component } from 'react'`
2. Internal absolute paths (@/ prefix): `import { cn } from "@/lib/utils/cn"`
3. Type imports isolated with `import type`: `import type { ReactNode } from 'react'`, `import type { LoginFormData } from '@/lib/validations/auth'`

**Pattern observed across codebase:**
```typescript
// External + React imports first
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// UI library imports
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Internal absolute path imports
import { cn } from '@/lib/utils/cn';
import { loginSchema } from '@/lib/validations/auth';

// Types isolated at end
import type { ReactNode } from 'react';
import type { LoginFormData } from '@/lib/validations/auth';
```

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` prefix for internal imports: `@/lib/utils`, `@/components`, `@/hooks`, `@/lib/validations`
- Never use relative paths like `../../../` — always use `@/` absolute paths

## Error Handling

**Patterns:**
- Try/catch with typed error handling: Observed in `handleCopyError()` (`try/catch`)
- Fallback UI for errors: Error boundaries (`ErrorBoundary.tsx`) and error pages (`error.tsx`)
- Redirect on auth errors: API callback route (`route.ts`) redirects with error query params
- No error logging in production code — development console logging only when `process.env.NODE_ENV === 'development'`
- User-facing error messages in Hebrew via toast/UI display, never raw console output

**Error Handling Examples:**
- `src/components/common/ErrorBoundary.tsx`: Catches React errors, stores state, auto-resets after 3 errors in 5 seconds
- `src/app/error.tsx`: Global error handler with recovery button and auto-reset mechanism
- `src/app/api/auth/callback/route.ts`: Silently redirects to login on auth failure with error query parameter
- Form validation errors displayed inline: `{error && <p className="text-xs text-destructive">{error}</p>}`

## Logging

**Framework:** Console (no external logging library detected)

**Patterns:**
- Console.error only in development: `if (process.env.NODE_ENV === 'development') { console.error(...) }`
- Disabled via ESLint rule `no-console` in production context
- Used in `ErrorBoundary.tsx` line 104: `console.error('[ErrorBoundary] שגיאה נתפסה:', error, errorInfo)`
- No logging in API routes or business logic — only in error boundaries
- Hebrew prefixes for clarity: `'[ErrorBoundary] שגיאה נתפסה:'`

## Comments

**When to Comment:**
- JSDoc-style comments for every exported function explaining "what" and "why" in Hebrew
- Single-line comments for complex logic or non-obvious decisions
- Section dividers with emoji-like markers: `// ===== ממשקים =====`, `// ===== קבועים =====`
- Comments in Hebrew throughout codebase for readability in Israeli dev context

**JSDoc/TSDoc Pattern:**
```typescript
/**
 * מחזיר ערך שמתעדכן רק אחרי שהקלט הפסיק להשתנות למשך delay
 * שימושי לחיפוש, שמירה אוטומטית, וקריאות API
 *
 * @param value - הערך לעקיבה
 * @param delay - זמן המתנה במילישניות (ברירת מחדל: 500)
 * @returns הערך המעוכב
 */
export function useDebounce<T>(value: T, delay = 500): T { ... }
```

**Section Comments:**
```typescript
// ===== ממשקים =====          // Interfaces
// ===== קבועים =====           // Constants
// ===== קומפוננטה ראשית =====  // Main Component
// ===== שדה input משותף =====   // Shared Input Field
```

## Function Design

**Size:** Maximum 300 lines per file — observed in files like `Sidebar.tsx` (split into sections)

**Parameters:**
- Props interfaces for component params: `LoginFormProps` with `readonly` fields
- Destructured props in function signature: `function LoginForm({ onSubmit, isSubmitting, showPassword, onTogglePassword }: LoginFormProps)`
- Type-safe callbacks: `readonly onSubmit: (data: LoginFormData) => Promise<void>`
- Readonly collections: `readonly items: readonly BreadcrumbItem[]`

**Return Values:**
- Typed explicitly with return type annotations: `function useDebounce<T>(value: T, delay = 500): T`
- React components return `JSX.Element` implicitly
- Async functions return `Promise<T>` where T is the resolved type
- Helper functions return primitive or typed object: `function formatDate(...): string`

**Generic Functions:**
- Use `<T>` for generic parameters: `function useDebounce<T>(value: T, ...): T`
- Type constraints when needed: `(icon: typeof Mail)` in `InputFieldProps`
- Factory patterns with generics: `Readonly<Record<SpinnerSize, string>>`

## Module Design

**Exports:**
- Named exports for components: `export function LoadingSpinner({ ... }) { ... }`
- Named exports for utilities: `export function cn(...inputs: ClassValue[]) { ... }`
- Default export only for page components: `export default function LandingPage() { ... }`
- Type exports with `export type`: `export type LoginFormData = z.infer<typeof loginSchema>`
- Re-exports from `src/lib/validations/`: Each schema exported as named export

**Barrel Files:**
- Not extensively used; each component file exports its own components
- Observed in `src/components/ui/` with component files
- No index.ts aggregators found — direct imports preferred with `@/` paths

**File Structure per Component:**
```typescript
/** JSDoc describing the component */
'use client';  // Client directive if needed

// Section 1: External imports
import { Component } from 'react';

// Section 2: Internal imports
import { cn } from '@/lib/utils/cn';

// Section 3: Types
interface ComponentProps { ... }
interface ComponentState { ... }

// Section 4: Constants
const CONSTANT = ...

// Section 5: Component/Function
export function ComponentName({ ... }: ComponentProps) { ... }

// Section 6: Helper functions (if any)
function helperFunction() { ... }
```

## Component Patterns

**Client vs Server:**
- `'use client'` directive at top of client components: `src/app/(public)/login/login-forms.tsx`, `src/components/common/ErrorBoundary.tsx`
- Server components (RSC) are default in `app/` directory: `src/app/(auth)/dashboard/page.tsx`, `src/app/(public)/page.tsx`
- API routes are server-only: `src/app/api/auth/callback/route.ts`

**Props Type Definition:**
```typescript
interface ComponentNameProps {
  readonly prop1: Type;
  readonly prop2?: OptionalType;
  readonly callback: (data: Type) => Promise<void>;
}
```

**Readonly Props:**
- All interface properties marked `readonly`
- Prevents accidental mutation of props
- Enforces immutable design patterns

## Class-Based Components

**Error Boundary (Class Component):**
- Extends `Component<Props, State>`
- Uses `static getDerivedStateFromError(error)` for error capture
- Implements `componentDidCatch(error, errorInfo)` for side effects
- Private methods with `private` keyword: `private handleAutoReset()`
- Arrow function methods for `this` binding: `private handleRetry = (): void => { ... }`

---

*Convention analysis: 2026-03-20*
