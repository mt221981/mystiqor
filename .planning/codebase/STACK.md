# Technology Stack

**Analysis Date:** 2026-03-20

## Languages

**Primary:**
- TypeScript 5.x - Entire codebase with strict mode enabled (`"strict": true`, `"noUncheckedIndexedAccess": true`)
- TSX/JSX - React components with strict type checking

**Secondary:**
- JavaScript - Configuration files only (PostCSS, ESLint)
- CSS3 - Via Tailwind CSS utilities

## Runtime

**Environment:**
- Node.js (version not pinned - package-lock.json v3 supports LTS versions)

**Package Manager:**
- npm - package-lock.json v3 present for dependency locking

## Frameworks

**Core:**
- Next.js 16.2.0 - App Router with Server Components, API routes, image optimization
- React 19.2.4 - UI component library with React Server Components
- React DOM 19.2.4 - DOM rendering layer

**State Management:**
- TanStack React Query (@tanstack/react-query) 5.91.2 - Server state, data fetching, caching
- Zustand 5.0.12 - Lightweight client-side state management

**Forms & Validation:**
- React Hook Form 7.71.2 - Performant form state and submission handling
- @hookform/resolvers 5.2.2 - Integration with validation libraries
- Zod 4.3.6 - TypeScript-first runtime schema validation

**UI & Styling:**
- Tailwind CSS 3.4.1 - Utility-first CSS with dark mode and RTL support
- tailwindcss-animate 1.0.7 - Pre-built animation utilities
- @base-ui/react 1.3.0 - Unstyled accessible component primitives
- class-variance-authority 0.7.1 - Type-safe CSS variant composition
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Intelligent Tailwind class merging
- Framer Motion 12.38.0 - Animation library for advanced interactions
- lucide-react 0.577.0 - Lightweight SVG icon library
- Recharts 3.8.0 - Composable React charting library
- Sonner 2.0.7 - Toast notification system

**Content & Rendering:**
- React Markdown 10.1.0 - Markdown to React component rendering
- remark-gfm 4.0.1 - GitHub Flavored Markdown support
- DOMPurify 3.3.3 - HTML sanitization for XSS prevention
- @types/dompurify 3.0.5 - TypeScript types for DOMPurify

**Database & Backend:**
- @supabase/supabase-js 2.99.3 - PostgreSQL client, Auth, Storage, Realtime
- @supabase/ssr 0.9.0 - Server-side rendering support for Supabase authentication

**Payments:**
- stripe 20.4.1 - Server-side Stripe payment processing (Node.js SDK)
- @stripe/stripe-js 8.11.0 - Client-side Stripe.js library
- @stripe/react-stripe-js 5.6.1 - React integration for Stripe Elements/Checkout

**Utilities:**
- date-fns 4.1.0 - Date manipulation and formatting (Israeli format support)
- tw-animate-css 1.4.0 - CSS animation utilities for Tailwind

## Configuration

**TypeScript:**
- `tsconfig.json` - Strict mode enabled, path aliases `@/*` → `./src/*`, target ES2022
- JSX mode: `react-jsx` (automatic transform)
- Module resolution: `bundler` (Next.js optimization)

**Build & Development:**
- `next.config.ts` - Next.js configuration with Supabase image optimization
  - Supabase Storage URLs whitelisted for next/image (`*.supabase.co`)
- `tailwind.config.ts` - Tailwind theme configuration
  - Dark mode via CSS class
  - Extended color palette (sidebar, chart colors)
  - CSS variables for theming
  - RTL support enabled
- `postcss.config.mjs` - PostCSS with Tailwind plugin

**Code Quality:**
- `.eslintrc.json` - Extends `next/core-web-vitals` and `next/typescript`
- `eslint-config-next` 14.2.23 - Next.js official linting rules

**Environment:**
- `.env.local.example` - Template for required environment variables
- Critical env vars:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key
  - `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
  - `STRIPE_SECRET_KEY` - Stripe secret key (server-only)
  - Other integrations: OpenAI, Resend, webhook secrets

## Build & Development

**Commands:**
```bash
npm run dev       # Next.js dev server (http://localhost:3000)
npm run build     # Production build → .next/
npm run start     # Production server
npm run lint      # ESLint static analysis
```

**Build Output:**
- Server Components compiled to Node.js runtime
- Client Components with React hydration
- Static generation where possible
- Image optimization for Supabase Storage

## Platform Requirements

**Development:**
- Node.js LTS (no specific version pinned)
- npm 8.0+ (package-lock.json v3)
- Modern browser with ES2022 support

**Production:**
- Vercel (native Next.js platform)
- Supabase (PostgreSQL + Auth + Storage)
- Stripe (payment processing)
- Node.js compatible hosting for self-deployment

## Performance & Optimization

**Client-Side:**
- Zero JavaScript for Server Components (content delivery only)
- Dynamic imports via `next/dynamic` for heavy components
- Image optimization via `next/image` for Supabase Storage
- Tailwind CSS purging (zero runtime overhead)

**Server-Side:**
- React Query caching with configurable `staleTime` and `gcTime`
- Supabase connection pooling via PgBouncer
- API route deduplication with React Query

**Bundle Target:**
- Initial JavaScript bundle < 200KB per CLAUDE.md specification

## RTL & Internationalization

**Hebrew Support:**
- `dir="rtl"` attribute on root layout
- Google Fonts: Assistant (hebrew subset) + Geist
- Tailwind RTL utilities: `start`/`end` instead of `left`/`right`
- Date formatting: Israeli format via date-fns

---

*Stack analysis: 2026-03-20*
