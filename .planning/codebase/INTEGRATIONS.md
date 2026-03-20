# External Integrations

**Analysis Date:** 2026-03-20

## APIs & External Services

**LLM/AI:**
- OpenAI - AI analysis and insights generation
  - SDK/Client: Direct API via `OPENAI_API_KEY`
  - Auth: Environment variable `OPENAI_API_KEY`
  - Purpose: Powering astrological/numerological analysis tools and personal coach features

## Data Storage

**Databases:**
- PostgreSQL (via Supabase)
  - Connection: Environment variables `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: @supabase/supabase-js 2.99.3 + @supabase/ssr 0.9.0
  - Type: Database types generated in `src/types/database.ts`
  - Tables: 20+ tables covering:
    - User profiles (with birth data, timezone, location)
    - Subscriptions (with Stripe integration)
    - Analyses (numerology, astrology, palmistry, tarot, etc.)
    - Goals, moods, journal entries, dreams, insights
    - Learning courses and journeys
    - Reminders, referrals, messages
    - Payments and transactions

**File Storage:**
- Supabase Storage - Image and document uploads
  - Remote pattern configured for images: `https://*.supabase.co/storage/v1/object/public/**`
  - Used via Next.js image optimization in `next.config.ts`

**Caching:**
- React Query - In-memory client-side caching
  - Configuration: `src/lib/query/cache-config.ts`
  - Cache times: SHORT (2 min), MEDIUM (5 min), LONG (15 min), VERY_LONG (60 min)
  - Query keys defined for all data entities (subscription, profile, analyses, goals, moods, journal, insights, dreams, journeys, reminders, learning)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in PostgreSQL authentication)
  - Implementation: Email/password + Magic Links + OAuth (configured)
  - Client implementation: `src/lib/supabase/client.ts` (browser-safe)
  - Server implementation: `src/lib/supabase/server.ts` (with cookie management)
  - Middleware: `src/lib/supabase/middleware.ts` (session refresh on every request)
  - Admin client: `src/lib/supabase/admin.ts` (service role for backend operations)
  - Callback handler: `src/app/api/auth/callback/route.ts` (OAuth flow completion)

**Session Management:**
- Cookies-based via Next.js middleware
- Auto-refresh tokens before expiry
- Protected routes redirected to `/login` if unauthenticated

## Payments & Billing

**Stripe:**
- Stripe JavaScript library (@stripe/react-stripe-js) 5.6.1
- Stripe React components for checkout UI
- Stripe Node.js SDK 20.4.1 for server-side operations
- Auth: Environment variables
  - `STRIPE_SECRET_KEY` - Server-side secret
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side public key
  - `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

**Subscription Tracking:**
- Database columns for Stripe integration:
  - `stripeCustomerId` - Link user to Stripe customer
  - `stripeSubscriptionId` - Track active subscription
  - `cancelAtPeriodEnd` - Soft cancel flag
  - Plan types: free, basic, premium, enterprise (defined in `src/types/subscription.ts`)

## Email & Notifications

**Email Provider:**
- Resend - Email delivery service
  - Auth: Environment variable `RESEND_API_KEY`
  - Purpose: Transaction emails (welcome, password reset, etc.)

**Notifications:**
- Sonner 2.0.7 - Toast notifications (client-side, no external service)

## Monitoring & Observability

**Error Tracking:**
- Not detected - Consider adding Sentry or similar

**Logs:**
- Console logging (remove for production per CLAUDE.md)
- No centralized logging service detected

## CI/CD & Deployment

**Hosting:**
- Vercel - Implied by Next.js setup and ENV configuration pattern

**CI Pipeline:**
- Not detected - Consider adding GitHub Actions or Vercel deployment hooks

## Environment Configuration

**Required Environment Variables:**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# LLM
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000 (dev) or https://mystiqor.com (prod)
CRON_SECRET=[random-secret-for-scheduled-jobs]
```

**Secrets Location:**
- `.env.local` file (git-ignored) for development
- Vercel Secrets/Environment tab for production
- Service role key should NEVER be exposed in client code

## Webhooks & Callbacks

**Incoming:**
- Supabase Auth callback: `GET /api/auth/callback?code=...` - OAuth/Magic Link completion
- Stripe webhooks: Expected endpoint (not yet visible in code scan) for:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

**Outgoing:**
- Supabase: Real-time subscriptions via WebSocket (configured via `@supabase/supabase-js`)
- Stripe: Webhook notifications to backend for billing events

## API Routes

**Implemented:**
- `src/app/api/auth/callback/route.ts` - OAuth/Magic Link callback handler

**Inferred (not yet visible):**
- Stripe webhook endpoint (expects webhook handling)
- LLM analysis endpoints (for astrological calculations)
- Subscription management endpoints

## Data Flow

**Authentication:**
1. User submits email/password on login form
2. Supabase Auth processes credentials or sends magic link
3. OAuth redirect → `GET /api/auth/callback?code=...`
4. Session created and stored in cookie
5. Middleware `src/lib/supabase/middleware.ts` refreshes token on each request

**Subscription:**
1. User initiates checkout on UI (Stripe React component)
2. Stripe.js collects payment information
3. Create Stripe subscription via server (POST to backend)
4. Stripe webhook notifies backend of subscription event
5. Backend updates `subscriptions` table in Supabase
6. Frontend refetches via React Query with invalidation

**LLM Analysis:**
1. User requests analysis (numerology, astrology, etc.)
2. Frontend sends data to backend API
3. Backend calls OpenAI API with analysis prompt
4. Response stored in `analyses` table
5. Frontend displays results with caching

## Security Considerations

**Authentication:**
- RLS (Row Level Security) expected on all Supabase tables (per CLAUDE.md spec)
- Service role key restricted to backend operations only
- Anon key has limited permissions (user profiles only)

**Payments:**
- Stripe webhook signature verification via `STRIPE_WEBHOOK_SECRET`
- Never expose secret keys in client code

**Secrets:**
- All API keys in environment variables
- `.env.local` excluded from git
- Supabase Storage images served over HTTPS

---

*Integration audit: 2026-03-20*
