# Codebase Structure - MystiQor

**Analysis Date:** 2026-03-20

## Directory Layout

```
src/
├── app/                      # Next.js 16 App Router
│   ├── (auth)/              # Protected routes (require authentication)
│   │   ├── dashboard/        # Main user dashboard
│   │   ├── coach/            # AI coaching journey
│   │   ├── daily-insights/   # Daily personalized insights
│   │   ├── goals/            # Goal tracking
│   │   ├── journal/          # Personal journal
│   │   ├── learn/            # Learning modules
│   │   ├── tools/            # 16 analysis tools (astrology, tarot, etc)
│   │   ├── profile/          # User profile
│   │   ├── settings/         # User settings
│   │   ├── subscription/     # Subscription management
│   │   ├── layout.tsx        # Server component - auth check
│   │   └── layout-client.tsx # Client component - React Query, Toaster
│   ├── (public)/             # Public routes
│   │   ├── login/            # Login/register page
│   │   ├── page.tsx          # Landing page
│   │   ├── blog/             # Blog posts
│   │   └── pricing/          # Pricing page
│   ├── api/                  # API routes (mostly empty)
│   │   ├── auth/callback/route.ts  # Only implemented route
│   │   ├── tools/            # Tool endpoints (empty)
│   │   ├── subscription/     # Subscription endpoints (empty)
│   │   ├── coach/            # Coaching endpoints (empty)
│   │   └── webhooks/stripe/  # Stripe webhooks (empty)
│   ├── layout.tsx            # Root layout (RTL, fonts)
│   ├── error.tsx             # Global error boundary
│   └── fonts/                # Custom fonts
├── components/
│   ├── ui/                   # shadcn/ui components (20+)
│   ├── layouts/              # Layout shells
│   │   ├── Header.tsx        # Top bar (complete, has TODO for logout)
│   │   ├── Sidebar.tsx       # Main navigation (complete)
│   │   ├── MobileNav.tsx     # Mobile nav
│   │   └── PageHeader.tsx
│   ├── common/               # Shared components
│   │   ├── Breadcrumbs.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── PageTransition.tsx
│   └── features/             # Feature components
│       ├── astrology/
│       ├── coach/
│       ├── drawing/
│       ├── goals/
│       ├── insights/
│       ├── numerology/
│       ├── onboarding/
│       └── subscription/
├── lib/
│   ├── supabase/
│   │   ├── server.ts         # Server client (cookies-based)
│   │   ├── client.ts         # Browser client
│   │   ├── admin.ts          # Admin client (unused)
│   │   └── middleware.ts     # Session refresh
│   ├── query/
│   │   └── cache-config.ts   # React Query config (GEM 8)
│   ├── validations/
│   │   ├── auth.ts           # Login/register/reset schemas
│   │   └── profile.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── dates.ts
│   │   ├── sanitize.ts
│   │   └── llm-response.ts
│   ├── constants/
│   │   ├── astrology.ts
│   │   ├── categories.ts
│   │   └── plans.ts
│   ├── animations/
│   │   └── presets.ts
│   └── utils.ts
├── hooks/
│   ├── useDebounce.ts
│   └── useMobile.ts
├── services/                 # EMPTY - CRITICAL
│   ├── analysis/
│   ├── astrology/
│   ├── drawing/
│   ├── email/
│   └── numerology/
├── stores/
│   └── theme.ts              # Theme state (dark/light)
└── types/
    ├── database.ts           # DB schema (989 lines, 20 tables)
    ├── analysis.ts
    ├── astrology.ts
    ├── numerology.ts
    └── subscription.ts
```

## Key Locations

**Auth Flow:**
- `src/app/(public)/login/page.tsx` - Login UI
- `src/app/(public)/login/login-forms.tsx` - Forms (LoginForm, RegisterForm)
- `src/app/api/auth/callback/route.ts` - OAuth callback (ONLY implemented API route)
- `src/lib/supabase/middleware.ts` - Session refresh on every request
- `src/lib/validations/auth.ts` - Zod schemas with Hebrew messages

**Protected Routes:**
- `src/app/(auth)/layout.tsx` - Server Component checks auth, redirects to /login if missing
- `src/app/(auth)/layout-client.tsx` - Provides React Query, Toaster
- Dashboard: `src/app/(auth)/dashboard/page.tsx` (placeholder with stats cards)

**State & Config:**
- `src/stores/theme.ts` - Zustand theme store (dark/light)
- `src/lib/query/cache-config.ts` - React Query defaults, cache times (GEM 8)
- `src/types/database.ts` - Supabase table types (manual, should be auto-generated)

**Components:**
- `src/components/layouts/Header.tsx` - Has TODO: "חיבור לפונקציית התנתקות מ-Supabase Auth"
- `src/components/layouts/Sidebar.tsx` - Complete navigation with all tool links
- `src/components/ui/` - shadcn/ui components (button, input, dialog, etc)

**Database Access:**
- `src/lib/supabase/server.ts` - Use in Server Components, Route Handlers
- `src/lib/supabase/client.ts` - Use in Client Components

---

*Structure analysis: 2026-03-20*
