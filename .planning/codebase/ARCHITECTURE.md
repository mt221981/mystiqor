# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Server-Client Hybrid Architecture with Authentication-Driven Layout Hierarchy

**Key Characteristics:**
- Server Components for authentication and data loading
- Client Components for interactive UI and state management
- Supabase (PostgreSQL) as single source of truth
- React Query for server state, Zustand for client state
- Protected routes via middleware and layout-level redirects
- Type-safe end-to-end with TypeScript strict mode
- RTL-first design with Hebrew-first content

## Layers

**Presentation Layer:**
- Purpose: Render UI with Tailwind CSS + shadcn/ui components, handle user input with React Hook Form
- Location: `src/components/` and `src/app/(auth)/`, `src/app/(public)/`
- Contains: Feature components, UI primitives, forms, layouts
- Depends on: Services, stores, validations, types
- Used by: End users via Next.js routing

**API Layer:**
- Purpose: Handle HTTP requests, perform business logic, interact with Supabase
- Location: `src/app/api/`
- Contains: Route handlers with Zod validation and typed responses
- Depends on: Services, Supabase clients, database types
- Used by: Client components via React Query, webhooks from external services

**Business Logic Layer (Services):**
- Purpose: Encapsulate domain logic for analysis tools, email, and coaching features
- Location: `src/services/`
- Contains: Astrology, numerology, drawing, analysis services with pure TypeScript functions
- Depends on: Supabase clients, types, constants
- Used by: API routes, client components
- Notable: All AI/LLM prompts centralized in `src/services/*/prompts/`

**Data Layer:**
- Purpose: Manage database queries and mutations
- Location: Supabase clients in `src/lib/supabase/` + raw queries in API routes
- Contains: Typed Supabase client instances, connection management
- Depends on: Supabase SDK, environment variables
- Used by: Services and API routes

**State Management Layer:**
- Purpose: Cache server state (React Query) and manage UI state (Zustand)
- Location: `src/lib/query/cache-config.ts` (React Query), `src/stores/` (Zustand)
- Contains: Query key factories, cache strategies, Zustand stores
- Depends on: React Query, Zustand libraries
- Used by: Client components and React Query hooks

**Validation Layer:**
- Purpose: Validate user input on client (form submission) and server (API route entry)
- Location: `src/lib/validations/`
- Contains: Zod schemas with Hebrew error messages
- Depends on: Zod library
- Used by: Forms (client), API routes (server)

**Authentication Layer:**
- Purpose: Manage user sessions, protect routes, handle OAuth callbacks
- Location: Middleware (`src/middleware.ts`), layout redirects (`src/app/(auth)/layout.tsx`), API routes (`src/app/api/auth/`)
- Contains: Session checking, route protection, token refresh logic
- Depends on: Supabase Auth, Next.js middleware, cookies
- Used by: All protected routes

## Data Flow

**Authentication Flow:**

1. User visits any route
2. Middleware (`src/middleware.ts`) intercepts request and refreshes session via `updateSession`
3. If accessing `/(auth)/*` without session → redirect to `/login`
4. If authenticated → proceed to layout/route handler

**Protected Page Flow:**

1. User navigates to `/(auth)/dashboard` (or any protected route)
2. Server-side layout (`src/app/(auth)/layout.tsx`) checks auth via `supabase.auth.getUser()`
3. If no user → `redirect('/login')`
4. If authenticated → render `AuthLayoutClient` component
5. Client component wraps children with QueryClientProvider, Toaster, sidebar layout
6. Client-side features fetch data via React Query hooks calling API routes

**API Request Flow:**

1. Client component calls API route via React Query `useQuery()` or `useMutation()`
2. API route (`src/app/api/**/route.ts`) receives request with typed body from Zod schema
3. Route handler validates input with `schema.parse()`
4. Performs business logic via services (e.g., `astrology.generateBirthChart()`)
5. Returns typed JSON response
6. React Query caches response using keys from `src/lib/query/cache-config.ts`
7. Component re-renders with new data

**State Management:**

- **Server State (React Query):** Data from APIs, database, subscriptions → cached with staleTime/gcTime
  - Query keys defined in `src/lib/query/cache-config.ts`
  - Retry logic smart: no retry on 401/403 auth errors
  - Default staleTime: 15 minutes, gcTime: 30 minutes
- **Client State (Zustand):** Theme selection, UI toggles → persisted to localStorage
  - `useThemeStore` persists theme choice
  - Applies `dark`/`light` class to document root

## Key Abstractions

**Supabase Client Factory:**
- Purpose: Create typed database clients for server or browser context
- Examples: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- Pattern: Separate functions for SSR (cookies via Next.js cookies API) vs browser (automatic cookie handling)

**React Query Cache Configuration:**
- Purpose: Define consistent caching and retry strategies across all queries
- Examples: `src/lib/query/cache-config.ts`
- Pattern: `queryKeys` object with factory functions for namespaced, hierarchical cache keys
  - `queryKeys.analyses.list()`, `queryKeys.analyses.detail(id)` for proper invalidation

**Zod Validation Schemas:**
- Purpose: Single source of truth for input validation shared between client and server
- Examples: `src/lib/validations/auth.ts`, `src/lib/validations/profile.ts`
- Pattern: Schema objects exported as `const`, typed data inferred with `z.infer<typeof schema>`

**Service Layer (Encapsulated Business Logic):**
- Purpose: Keep API routes thin by delegating to typed service functions
- Examples: `src/services/astrology/`, `src/services/numerology/`
- Pattern: Pure TypeScript functions that accept typed parameters and return typed results
  - Astrology services include prompt templates in `src/services/astrology/prompts/`

**Error Boundary Component:**
- Purpose: Catch React runtime errors and display fallback UI with auto-reset
- Location: `src/components/common/ErrorBoundary.tsx`
- Pattern: Class component that catches errors, displays error details, auto-resets after 3 errors in 5 seconds

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Set HTML dir="rtl", apply Assistant font, inject global CSS, define metadata

**Protected Layout:**
- Location: `src/app/(auth)/layout.tsx`
- Triggers: User navigates to `/(auth)/*` route
- Responsibilities: Check auth via Supabase, redirect to login if not authenticated, render client layout

**Protected Client Layout:**
- Location: `src/app/(auth)/layout-client.tsx`
- Triggers: Protected layout renders
- Responsibilities: Wrap with QueryClientProvider, render sidebar/main grid, position Toaster

**Public Routes:**
- Location: `src/app/(public)/page.tsx` (landing), `src/app/(public)/login/page.tsx` (auth form)
- Triggers: Unauthenticated users or explicit login navigation
- Responsibilities: Display landing page features or login/signup form

**API Routes:**
- Location: `src/app/api/**/*.ts` (e.g., `/api/tools/astrology/birth-chart`)
- Triggers: Client component calls `fetch()` or React Query `useQuery()`
- Responsibilities: Validate input, call services, return typed JSON

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every HTTP request before routing
- Responsibilities: Refresh session, protect auth routes, update cookies

## Error Handling

**Strategy:** Layered error handling with typed errors and user-facing toasts

**Patterns:**

1. **Form Validation Errors** (Client)
   - Caught by React Hook Form + Zod
   - Displayed inline on form fields
   - Example: `src/app/(public)/login/login-forms.tsx` shows field error messages

2. **API Request Errors** (Client)
   - React Query catches fetch errors
   - Smart retry: no retry on 401/403
   - Manual retry available on mutation/query
   - User shows error toast via `sonner.toast.error()`

3. **Server-Side Errors** (API Route)
   - try/catch in route handler
   - Return typed error response: `{ error: string, code: string }`
   - Example: `src/app/api/auth/callback/route.ts` catches auth exchange errors

4. **React Runtime Errors** (Component)
   - ErrorBoundary (`src/components/common/ErrorBoundary.tsx`) catches render errors
   - Displays error UI with retry button
   - Auto-resets if 3+ errors in 5 seconds → navigates to home

5. **Database Errors** (Service)
   - Supabase SDK throws TypedSupabaseError
   - Caught in API route and transformed to typed response
   - Not exposed to client; returns safe error message

## Cross-Cutting Concerns

**Logging:** No console.log in production code; use proper logger or remove

**Validation:**
- Client-side: React Hook Form + Zod schemas validate before submit
- Server-side: All API routes begin with `const body = schema.parse(await request.json())`
- Example: `src/lib/validations/auth.ts` defines login/register/reset schemas with Hebrew messages

**Authentication:**
- Session checked in: middleware, protected layout, before sensitive API calls
- Tokens managed by Supabase SDK + Next.js cookies
- Magic link and OAuth providers supported via Supabase Auth

**Rate Limiting:**
- Not yet implemented; should be added to sensitive endpoints (login, password reset)
- Recommendation: Implement in API route with in-memory counter or Redis

**Input Sanitization:**
- DOMPurify integrated for user-generated content
- Utility: `src/lib/utils/sanitize.ts`
- Should be applied to markdown/HTML rendering

**RTL & Hebrew:**
- `dir="rtl"` on `<html>` in root layout
- Tailwind `start`/`end` classes instead of `left`/`right` (e.g., `ms-4` instead of `ml-4`)
- All labels, messages, errors, toasts in Hebrew
- Date formatting uses DD/MM/YYYY Israeli format (utility: `src/lib/utils/dates.ts`)

---

*Architecture analysis: 2026-03-20*
