# Codebase Structure

**Analysis Date:** 2026-03-20

## Directory Layout

```
mystiqor-build/
├── src/
│   ├── app/                          # Next.js App Router (routing + API routes)
│   │   ├── (auth)/                   # Protected routes (require login)
│   │   │   ├── layout.tsx            # Server: checks auth, redirects to /login if not authenticated
│   │   │   ├── layout-client.tsx     # Client: wraps with QueryClientProvider, sidebar, Toaster
│   │   │   ├── dashboard/            # Main dashboard hub
│   │   │   ├── profile/              # User profile pages
│   │   │   ├── coach/                # AI coaching feature
│   │   │   ├── tools/                # Analysis tools (astrology, tarot, numerology, etc.)
│   │   │   ├── analytics/            # User insights & analytics
│   │   │   ├── journal/              # Journaling features
│   │   │   ├── goals/                # Goal tracking
│   │   │   ├── mood/                 # Mood tracking
│   │   │   ├── learn/                # Educational content
│   │   │   ├── subscription/         # Subscription management
│   │   │   └── [other features]/     # Additional authenticated features
│   │   │
│   │   ├── (public)/                 # Public routes (no auth required)
│   │   │   ├── page.tsx              # Landing page with feature overview
│   │   │   ├── login/                # Login/signup page
│   │   │   ├── pricing/              # Pricing page
│   │   │   └── blog/                 # Blog posts
│   │   │
│   │   ├── api/                      # API routes (backend handlers)
│   │   │   ├── auth/                 # Authentication routes
│   │   │   │   ├── callback/route.ts # OAuth/magic link callback handler
│   │   │   │   └── confirm/          # Email confirmation
│   │   │   ├── tools/                # Tool calculation endpoints
│   │   │   │   ├── astrology/
│   │   │   │   ├── tarot/
│   │   │   │   ├── numerology/
│   │   │   │   └── [other tools]/
│   │   │   ├── coach/                # AI coaching endpoints
│   │   │   ├── insights/             # Daily/weekly insights generation
│   │   │   ├── goals/                # Goal CRUD endpoints
│   │   │   ├── subscription/         # Stripe subscription management
│   │   │   ├── webhooks/             # External service webhooks (Stripe, etc.)
│   │   │   ├── upload/               # File upload handling
│   │   │   ├── geocode/              # Geocoding for birth locations
│   │   │   ├── cron/                 # Scheduled jobs
│   │   │   └── analysis/             # Analysis generation endpoints
│   │   │
│   │   ├── layout.tsx                # Root layout: RTL, fonts, metadata, HTML setup
│   │   ├── error.tsx                 # Global error page
│   │   ├── loading.tsx               # Global loading skeleton
│   │   ├── not-found.tsx             # 404 page
│   │   ├── globals.css               # Tailwind imports, global styles
│   │   └── fonts/                    # Custom font files
│   │
│   ├── components/                   # React components (UI + features)
│   │   ├── ui/                       # shadcn/ui primitive components
│   │   │   ├── button.tsx            # Button primitive
│   │   │   ├── card.tsx              # Card container
│   │   │   ├── input.tsx             # Input field
│   │   │   ├── dialog.tsx            # Modal dialog
│   │   │   ├── select.tsx            # Dropdown select
│   │   │   ├── [20+ other primitives]/
│   │   │   └── accordion.tsx
│   │   │
│   │   ├── common/                   # Reusable generic components
│   │   │   ├── ErrorBoundary.tsx     # Error catch + display + auto-reset (GEM 10)
│   │   │   ├── LoadingSpinner.tsx    # Centered spinner with pulse animation
│   │   │   ├── EmptyState.tsx        # Empty data state UI
│   │   │   ├── Breadcrumbs.tsx       # Navigation breadcrumbs
│   │   │   └── PageTransition.tsx    # Page entrance animation
│   │   │
│   │   ├── layouts/                  # Layout shells (header, sidebar, etc.)
│   │   │   ├── Header.tsx            # Top navigation bar
│   │   │   ├── Sidebar.tsx           # Left sidebar navigation
│   │   │   ├── MobileNav.tsx         # Mobile bottom nav
│   │   │   └── PageHeader.tsx        # Page title + breadcrumbs container
│   │   │
│   │   ├── forms/                    # Form components with validation
│   │   │   └── [form components with RHF + Zod]/
│   │   │
│   │   └── features/                 # Feature-specific components
│   │       ├── astrology/
│   │       │   ├── BirthChart/       # Birth chart visualization
│   │       │   └── [other astrology UI]/
│   │       ├── coach/                # Coaching conversation UI
│   │       ├── goals/                # Goal creation/tracking UI
│   │       ├── numerology/           # Numerology chart UI
│   │       ├── graphology/           # Handwriting analysis UI
│   │       ├── insights/             # Insight display cards
│   │       ├── subscription/         # Subscription UI (checkout, plans)
│   │       ├── onboarding/           # Onboarding flow components
│   │       └── shared/               # Shared feature utilities
│   │
│   ├── lib/                          # Utilities and configuration
│   │   ├── supabase/                 # Database client factory and middleware
│   │   │   ├── client.ts             # Browser-side Supabase client
│   │   │   ├── server.ts             # Server-side Supabase client with cookies
│   │   │   ├── admin.ts              # Admin Supabase client (service role)
│   │   │   └── middleware.ts         # Session refresh + route protection
│   │   │
│   │   ├── query/                    # React Query configuration
│   │   │   └── cache-config.ts       # Query keys factory, default options, cache times (GEM 8)
│   │   │
│   │   ├── validations/              # Zod schemas (shared client+server)
│   │   │   ├── auth.ts               # Login, register, password reset schemas
│   │   │   ├── profile.ts            # Profile update schemas
│   │   │   └── [other schemas]/
│   │   │
│   │   ├── constants/                # App-wide constants
│   │   │   ├── categories.ts         # Tool categories, feature groups
│   │   │   ├── plans.ts              # Subscription plan definitions
│   │   │   ├── astrology.ts          # Zodiac signs, houses, planets (GEM)
│   │   │   └── [other constants]/
│   │   │
│   │   ├── utils/                    # Helper functions
│   │   │   ├── cn.ts                 # classname merge (Tailwind + clsx)
│   │   │   ├── dates.ts              # Date formatting (Israeli DD/MM/YYYY)
│   │   │   ├── sanitize.ts           # XSS prevention with DOMPurify
│   │   │   ├── llm-response.ts       # LLM output parsing utilities
│   │   │   └── [other utilities]/
│   │   │
│   │   ├── animations/               # Framer Motion presets
│   │   │   └── presets.ts            # Reusable animation variants
│   │   │
│   │   └── utils.ts                  # Deprecated barrel export (use subdirectories)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useDebounce.ts            # Debounce hook for input
│   │   ├── useMobile.ts              # Media query for mobile detection
│   │   └── [other custom hooks]/
│   │
│   ├── services/                     # Business logic layer (typed, testable)
│   │   ├── astrology/                # Astrology calculations & interpretations
│   │   │   ├── prompts/              # LLM prompt templates
│   │   │   ├── [calculation functions]/
│   │   │   └── index.ts
│   │   ├── numerology/               # Numerology calculations
│   │   ├── drawing/                  # Drawing analysis service
│   │   ├── analysis/                 # Multi-tool synthesis
│   │   ├── email/                    # Email sending service
│   │   └── [other services]/
│   │
│   ├── stores/                       # Zustand client state stores
│   │   └── theme.ts                  # Theme toggle (dark/light) with localStorage persistence
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── database.ts               # Supabase table types (20+ tables)
│   │   ├── astrology.ts              # Astrology domain types
│   │   ├── numerology.ts             # Numerology domain types
│   │   ├── subscription.ts           # Subscription & payment types
│   │   ├── analysis.ts               # Analysis result types
│   │   └── [other domain types]/
│   │
│   └── middleware.ts                 # Next.js middleware entry point
│
├── public/                           # Static assets (favicon, etc.)
├── .next/                            # Next.js build output (generated)
├── node_modules/                     # Dependencies (generated)
├── .planning/                        # GSD planning documents
├── temp_source/                      # Original legacy code (reference only)
│
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript strict config
├── package.json                      # Dependencies: Next.js 16, React 19, Supabase, TailwindCSS
├── tailwind.config.ts                # Tailwind config (dark mode, RTL, colors)
├── postcss.config.mjs                # PostCSS for Tailwind
├── components.json                   # shadcn/ui config
├── .eslintrc.json                    # ESLint rules
│
└── CLAUDE.md                         # Project mission + standards
```

## Directory Purposes

**src/app/(auth)/**
- Purpose: Protected pages requiring user authentication
- Contains: Dashboard, profile, tools, coach, journal, goals, analytics pages
- Served by: Next.js App Router with middleware protection
- Key: Layout checks auth before rendering, redirects to /login if not authenticated

**src/app/(public)/**
- Purpose: Public pages accessible without login
- Contains: Landing page, login/signup forms, pricing, blog
- Served by: Next.js App Router
- Key: No auth checks; good entry points for marketing

**src/app/api/**
- Purpose: RESTful API endpoints for client queries and external webhooks
- Contains: Tool calculation endpoints, auth callbacks, subscription webhooks, cron jobs
- Served by: Next.js Route Handlers (src/app/api/[path]/route.ts)
- Key: Each route validates input with Zod, calls services, returns typed JSON

**src/components/ui/**
- Purpose: Reusable shadcn/ui primitives (buttons, inputs, dialogs, etc.)
- Contains: ~25 base components from shadcn/ui
- Used by: Feature components, forms, layouts
- Key: Do not modify; regenerate from shadcn CLI if needed

**src/components/features/**
- Purpose: Feature-specific, domain-aware components (BirthChart, GoalCard, etc.)
- Contains: Astrology, coaching, goals, numerology, insights, subscription UIs
- Used by: Route pages (src/app/(auth)/[feature]/page.tsx)
- Key: Can import from services, perform API calls, manage local state

**src/lib/supabase/**
- Purpose: Database connectivity abstraction
- Contains: Client factories for browser (client.ts), server (server.ts), admin (admin.ts), middleware
- Used by: Services, API routes, middleware
- Key: Separate clients for SSR (with Next.js cookies) vs browser (auto-cookies)

**src/lib/query/**
- Purpose: React Query configuration and cache strategy
- Contains: Query key factory, default cache times, retry logic
- Used by: Client components via useQuery/useMutation hooks
- Key: All query keys centralized for easy invalidation; no retry on 401/403

**src/lib/validations/**
- Purpose: Single source of truth for input validation schemas
- Contains: Zod schemas with Hebrew error messages
- Used by: Client forms (via zodResolver), server API routes
- Key: Share schema between client validation and server validation

**src/services/**
- Purpose: Reusable business logic encapsulated as typed functions
- Contains: Astrology, numerology, drawing analysis, email, synthesis services
- Used by: API routes, sometimes client components
- Key: Pure TypeScript, no React dependencies; testable

**src/stores/**
- Purpose: Global UI state (non-data state like theme)
- Contains: Zustand stores with localStorage persistence
- Used by: Any component needing persistent UI preference
- Key: Not for server state (use React Query); only for client UI toggles

**src/types/**
- Purpose: TypeScript type definitions for domain models and API contracts
- Contains: Database table types, astrology/numerology enums, subscription statuses
- Used by: Everywhere in the codebase
- Key: database.ts is source of truth for Supabase schema

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout—sets HTML lang="he" dir="rtl", applies fonts, defines global metadata
- `src/app/(auth)/layout.tsx`: Protected layout—checks auth, redirects to login if unauthenticated
- `src/app/(auth)/dashboard/page.tsx`: Main authenticated hub
- `src/app/(public)/page.tsx`: Public landing page
- `src/app/(public)/login/page.tsx`: Login/signup form page
- `src/middleware.ts`: Middleware entry point—refreshes session, protects /(auth)/* routes

**Configuration:**
- `src/lib/supabase/server.ts`: Server-side database client creation
- `src/lib/supabase/client.ts`: Browser-side database client creation
- `src/lib/query/cache-config.ts`: React Query defaults, query keys, cache times
- `src/lib/constants/`: App constants (zodiac, plans, categories)
- `tailwind.config.ts`: Tailwind customization (dark mode, RTL, colors)
- `tsconfig.json`: TypeScript strict mode, @ path alias to src/

**Core Logic:**
- `src/services/astrology/`: Birth chart calculations, interpretations, prompts
- `src/services/numerology/`: Numerology calculations
- `src/services/analysis/`: Multi-tool synthesis service
- `src/services/email/`: Email sending (confirmation, insights, etc.)
- `src/lib/utils/dates.ts`: Israeli date formatting (DD/MM/YYYY)
- `src/lib/utils/sanitize.ts`: XSS prevention with DOMPurify

**Testing:**
- No test files currently present; should follow pattern: `src/[feature]/__tests__/[feature].test.ts`

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `ErrorBoundary.tsx`, `BirthChart.tsx`)
- Pages: `page.tsx` or `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Utilities: camelCase (e.g., `cn.ts`, `sanitize.ts`)
- Types: `[domain].ts` (e.g., `astrology.ts`, `subscription.ts`)
- Stores: `[feature].ts` (e.g., `theme.ts`)
- Services: `[domain]/` directory with `index.ts` or named exports

**Directories:**
- Features: kebab-case (e.g., `astrology`, `birth-chart`)
- Route segments: kebab-case or (group) syntax (e.g., `(auth)`, `tools/astrology`)
- Utilities: camelCase (e.g., `supabase`, `validations`)

**Exports:**
- Named exports for functions/types (e.g., `export const loginSchema`)
- Default export for components (e.g., `export default function ErrorBoundary`)
- Re-export all from `index.ts` in feature directories (barrel pattern)

**Constants:**
- UPPER_SNAKE_CASE (e.g., `AUTO_RESET_THRESHOLD`, `ERROR_WINDOW_MS`)
- Grouped by feature in `src/lib/constants/`

## Where to Add New Code

**New Feature (e.g., "Tarot Readings"):**
- UI: `src/components/features/tarot/` (create directory, add components)
- Business logic: `src/services/tarot/` (create service with typed functions)
- API: `src/app/api/tools/tarot/` (create route handlers for read/interpret)
- Page: `src/app/(auth)/tools/tarot/` (create page.tsx)
- Types: Add to `src/types/` if adding domain-specific types
- Validation: Add to `src/lib/validations/` if adding form schemas
- Constants: Add to `src/lib/constants/` if adding lookup tables

**New Component (e.g., "FeatureCard"):**
- If generic/reusable across features: `src/components/common/FeatureCard.tsx`
- If feature-specific: `src/components/features/[feature]/FeatureCard.tsx`
- Typed Props interface at top of file (never inline types)
- JSDoc comment explaining purpose and usage

**New Utility Function (e.g., "parseAstroChart"):**
- If shared across features: `src/lib/utils/parse-astro-chart.ts`
- If service-specific: `src/services/astrology/parse-astro-chart.ts`
- Named export function with JSDoc in Hebrew explaining inputs/outputs
- Use absolute imports with @/ prefix

**New API Endpoint (e.g., "/api/tools/crystal/reading"):**
- Create directory: `src/app/api/tools/crystal/`
- Create file: `src/app/api/tools/crystal/route.ts`
- Implement GET/POST handler with:
  1. Zod validation: `const body = schema.parse(await request.json())`
  2. Auth check: `const user = await supabase.auth.getUser()`
  3. Service call: `const result = await crystalService.generate(body)`
  4. Typed response: `return Response.json({ data: result })`

**New React Query Hook (e.g., "useAstroReadings"):**
- Create file: `src/hooks/useAstroReadings.ts`
- Use query key from `src/lib/query/cache-config.ts`: `queryKeys.analyses.list(filters)`
- Call API route via `fetch()` or `useQuery()`
- Return typed data from schema

**New Zustand Store (e.g., "useCoachStore"):**
- Create file: `src/stores/coach.ts`
- Define interface with state + actions
- Use `create()` with `persist` middleware if persisting to localStorage
- Export hook function: `export const useCoachStore = create(...)`

**New Validation Schema:**
- Create/edit `src/lib/validations/[domain].ts`
- Define Zod schema: `export const mySchema = z.object({...})`
- Export inferred type: `export type MyFormData = z.infer<typeof mySchema>`
- All error messages in Hebrew

## Special Directories

**src/.next/**
- Purpose: Next.js build output (compiled pages, server chunks, etc.)
- Generated: Yes, automatically by `npm run build`
- Committed: No, added to .gitignore

**node_modules/**
- Purpose: Installed npm packages
- Generated: Yes, by `npm install` from package-lock.json
- Committed: No, added to .gitignore

**temp_source/**
- Purpose: Original legacy codebase (reference for reverse engineering)
- Generated: No
- Committed: Yes, but only for reference
- Action: Can be deleted after migration complete

**.planning/**
- Purpose: GSD planning and analysis documents
- Generated: Yes, by Claude during planning phases
- Committed: Yes
- Contents: Codebase maps, architecture docs, migration logs, QA reports

---

*Structure analysis: 2026-03-20*
