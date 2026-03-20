# Technology Stack

**Analysis Date:** 2026-03-20

## Languages

**Primary:**
- TypeScript 5.x - Entire codebase with strict mode enabled (no `any`, no `@ts-ignore`)
- TSX/JSX - React components with strict type checking

**Secondary:**
- JavaScript - PostCSS configuration (postcss.config.mjs), Next.js config (next.config.ts)

## Runtime

**Environment:**
- Node.js (version not specified in config - infer from package-lock or .nvmrc if present)

**Package Manager:**
- npm - Lockfile present (package-lock.json expected)

## Frameworks

**Core:**
- Next.js 16.2.0 - App Router for full-stack application with server/client components
- React 19.2.4 - Component library for UI

**State Management:**
- React Query (@tanstack/react-query) 5.91.2 - Server state management with caching
- Zustand 5.0.12 - Client state management (theme store at `src/stores/theme.ts`)

**Forms & Validation:**
- React Hook Form 7.71.2 - Form state and submission handling
- Zod 4.3.6 - Schema validation for forms (auth and profile validations)

**UI & Styling:**
- Tailwind CSS 3.4.1 - Utility-first CSS with RTL support via config
- tailwindcss-animate 1.0.7 - Animation utilities
- shadcn/ui (@base-ui/react) 1.3.0 - Accessible component library
- Framer Motion 12.38.0 - Advanced animations and transitions
- Lucide React 0.577.0 - Icon library

**Database & Real-time:**
- Supabase (@supabase/supabase-js) 2.99.3 - PostgreSQL client with auth
- @supabase/ssr 0.9.0 - Server-side rendering support for Supabase auth

**Payments:**
- Stripe (@stripe/react-stripe-js) 5.6.1 - Stripe React integration for checkout
- Stripe (@stripe/stripe-js) 8.11.0 - Core Stripe JavaScript library
- Stripe (Node.js SDK) 20.4.1 - Server-side Stripe operations

**Email:**
- Resend (implied by RESEND_API_KEY env var) - Email delivery service

**Other Libraries:**
- Recharts 3.8.0 - React charting library for data visualization
- React Markdown 10.1.0 - Markdown rendering with remark-gfm support
- DOMPurify 3.3.3 - XSS prevention via HTML sanitization
- date-fns 4.1.0 - Date manipulation and formatting (Israeli format support)
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Tailwind class conflict resolution
- Sonner 2.0.7 - Toast notification library
- @hookform/resolvers 5.2.2 - Schema resolver for React Hook Form + Zod integration

## Configuration

**Environment:**
- `.env.local.example` present at root - defines required environment variables
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
  - `SUPABASE_SERVICE_ROLE_KEY` - Admin-only key for server operations
  - `OPENAI_API_KEY` - LLM integration (OpenAI)
  - `STRIPE_SECRET_KEY` - Stripe secret key (server-only)
  - `STRIPE_WEBHOOK_SECRET` - Webhook verification
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
  - `RESEND_API_KEY` - Email service API
  - `NEXT_PUBLIC_APP_URL` - Application URL for redirects
  - `CRON_SECRET` - Scheduled job authentication

**TypeScript Configuration:**
- Strict mode enabled (`"strict": true`)
- No unchecked indexed access (`"noUncheckedIndexedAccess": true`)
- Path aliases: `@/*` → `./src/*`
- Target: ES2022
- Module resolution: bundler (Next.js)

**Build Configuration:**
- Next.js config at `next.config.ts` with TypeScript
- Image optimization enabled for Supabase Storage URLs (`.supabase.co`)
- PostCSS with Tailwind integration

**Styling Configuration:**
- `tailwind.config.ts` with TypeScript
- Dark mode support via `darkMode: 'class'`
- Extended theme with CSS variables (colors, borderRadius, etc.)
- RTL plugin configured for Hebrew support
- Sidebar-specific color scheme

## Linting & Code Quality

**Linting:**
- ESLint 8.x - Next.js config (eslint-config-next 14.2.23)
- Run: `npm run lint`

**Formatting:**
- Prettier (inferred - typical Next.js setup, config not shown)

## Build & Development Commands

```bash
npm run dev       # Start Next.js dev server (hot reload)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Platform Requirements

**Development:**
- Node.js (version not locked - check .nvmrc or package-lock.json)
- npm or yarn package manager
- Git for version control

**Production:**
- Vercel (implied by Next.js choice and ENV setup)
- PostgreSQL (via Supabase)
- Stripe account for payments
- Resend account for email
- OpenAI account for LLM features
- Supabase project with Storage enabled

## Performance & Bundle

**Optimizations:**
- Next.js image optimization for Supabase images
- React Query caching with configurable staleTime/gcTime (see `src/lib/query/cache-config.ts`)
- Dynamic imports supported via `next/dynamic`
- CSS-in-JS via Tailwind (zero runtime overhead)

**Target Bundle Size:**
- Initial JS bundle target: < 200KB (per CLAUDE.md spec)

---

*Stack analysis: 2026-03-20*
