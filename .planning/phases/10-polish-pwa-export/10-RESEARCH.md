# Phase 10: Polish + PWA + Export — Research

**Researched:** 2026-03-24
**Domain:** PWA (service worker + manifest), PDF generation (Hebrew RTL), social sharing, accessibility
**Confidence:** MEDIUM — core findings verified with official docs and primary sources; Hebrew PDF workaround is community-derived

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXPO-01 | Export analysis to PDF | @react-pdf/renderer v4.3.2 with Hebrew font + RTL Unicode workaround; dynamic import SSR:false pattern; existing `window.print()` in graphology as contrast baseline |
| EXPO-02 | Share analysis results via link/social media | DB migration adds `share_token` + `is_public` to `analyses`; new public API route + page; Web Share API + react-share fallback |
| UX-04 | PWA support (install prompt, service worker) | Official Next.js PWA guide (App Router native); serwist 9.5.7 for offline; manifest.ts in app/; NetworkOnly exclusion for Supabase/Stripe |
</phase_requirements>

---

## Summary

Phase 10 delivers three distinct capabilities: PDF export (EXPO-01), social sharing via links (EXPO-02), and PWA installability (UX-04), plus an accessibility audit. Each has independent technical complexity.

The biggest technical risk is **Hebrew RTL in PDF**. No mainstream JavaScript PDF library has first-class Hebrew support. `@react-pdf/renderer` v4.3.2 supports React 19 but has an open bug with Hebrew character rendering (issue #3010, December 2024). The recommended approach is: register a static Hebrew font file (Heebo TTF from Google Fonts), apply `textAlign: 'right'` + `direction: 'rtl'` styles, and prepend Unicode RLE character `\u202B` before Hebrew strings. This requires testing to confirm Hebrew glyphs render correctly — if they do not, fall back to `window.print()` with polished `@media print` CSS (which already exists in `globals.css`).

For PWA, Next.js 16.2.1 (in use) has an official first-party PWA guide using `app/manifest.ts` + a manual `public/sw.js`. Serwist 9.5.7 is the recommended choice if offline caching is needed, but the requirements (UX-04) only ask for installability — making the minimal manifest + service worker approach sufficient. The service worker must use `NetworkOnly` routing for `*.supabase.co` and `stripe.com` endpoints to prevent websocket/webhook interference.

Social sharing (EXPO-02) requires a DB migration: add `share_token UUID` and `is_public BOOLEAN` columns to the `analyses` table (currently neither exists). A public-access route `/share/[token]` serves the analysis to non-authenticated users. The Web Share API provides native sharing on mobile; react-share v5.3.0 covers desktop social buttons as a fallback.

**Primary recommendation:** Use `@react-pdf/renderer` with Heebo font + Unicode RTL workaround for PDF. If Hebrew glyph rendering fails in testing, fall back to `window.print()`. Use serwist for PWA. Add `share_token` column via migration 005_schema_fixes.sql.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | 4.3.2 | Generate PDF files from React components | Only JS PDF library with React component API; supports React 19 since v4.1.0 |
| serwist | 9.5.7 | Service worker + offline caching + precache | Official Next.js docs recommend it as the Workbox-based offline solution; next-pwa unmaintained |
| @serwist/next | 9.5.7 | Next.js integration wrapper for serwist | Same package family, required for withSerwistInit config wrapper |
| react-share | 5.3.0 | Social media share buttons (WhatsApp, Facebook, Twitter, Telegram) | Most widely used sharing component library for React; no external API needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| web-push | 3.6.7 | VAPID push notification server | Only needed if extending to push notifications (v2 req ADV-02); out of scope for v1 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | window.print() | print() is simpler, already works for graphology, BUT cannot programmatically control font embedding or add custom page breaks — use as fallback if Hebrew glyph rendering fails |
| @react-pdf/renderer | pdf-lib | pdf-lib requires character-by-character drawing for RTL — impractical for multi-page dynamic content |
| @react-pdf/renderer | jspdf + jspdf-fontkit | jsPDF RTL is partial: breaks on mixed Hebrew+English strings; same underlying limitation |
| react-share | next-share 0.27.0 | next-share is older (0.27.0), react-share is more actively maintained at 5.3.0 |
| serwist | @ducanh2912/next-pwa 10.2.9 | Both work; serwist is newer/more active, official Next.js docs mention it; either is fine |
| Manual navigator.share | react-share | Web Share API is better on mobile (native OS sheet); react-share covers desktop — use both |

**Installation:**
```bash
npm install @react-pdf/renderer react-share
npm install @serwist/next serwist --legacy-peer-deps
```

Note: serwist may need `--legacy-peer-deps` due to peer dependency conflicts (same pattern as astronomy-engine in Phase 6).

**Version verification (confirmed 2026-03-24):**
- `@react-pdf/renderer`: 4.3.2 (npm registry confirmed)
- `react-share`: 5.3.0 (npm registry confirmed)
- `serwist`: 9.5.7 (npm registry confirmed)
- `@serwist/next`: 9.5.7 (npm registry confirmed)

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── manifest.ts              # PWA manifest (Next.js built-in)
│   ├── sw.ts                    # Service worker source (compiled to public/sw.js)
│   ├── (public)/
│   │   └── share/
│   │       └── [token]/
│   │           └── page.tsx     # Public share view — no auth required
│   └── api/
│       └── analysis/
│           └── share/
│               └── route.ts     # POST: generate share token; GET: fetch by token
├── components/
│   └── features/
│       ├── export/
│       │   ├── AnalysisPDF.tsx  # PDF document component
│       │   ├── ExportButton.tsx # Download PDF button (dynamic import)
│       │   └── pdf-styles.ts    # StyleSheet.create() for Hebrew RTL
│       └── sharing/
│           └── SharePanel.tsx   # Web Share API + social buttons
public/
├── sw.js                        # Generated by serwist build
├── icon-192.png                 # PWA icon (required)
├── icon-512.png                 # PWA icon (required)
└── fonts/
    └── Heebo-Regular.ttf        # Hebrew font for PDF (not subset — full glyph set)
supabase/
└── migrations/
    └── 005_schema_fixes.sql     # Adds share_token + is_public to analyses
```

### Pattern 1: PWA Manifest (Next.js App Router built-in)

**What:** `app/manifest.ts` exports a `MetadataRoute.Manifest` object — Next.js handles the `/manifest.webmanifest` route automatically.
**When to use:** Always. No third-party library needed for the manifest itself.

```typescript
// src/app/manifest.ts
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MystiQor — גלה את עצמך',
    short_name: 'MystiQor',
    description: 'פלטפורמה מתקדמת לגילוי עצמי',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1a1025',
    theme_color: '#1a1025',
    lang: 'he',
    dir: 'rtl',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

### Pattern 2: Service Worker with Serwist

**What:** `app/sw.ts` source file compiled to `public/sw.js` by serwist. NetworkOnly routes exempt Supabase + Stripe.
**When to use:** When offline precaching is desired (UX-04 only requires installability; the minimal approach is a manual `public/sw.js`).

```typescript
// app/sw.ts — serwist service worker source
// Source: https://serwist.pages.dev/docs/next/getting-started
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { NetworkOnly, RegExpRoute, Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}
declare const self: ServiceWorkerGlobalScope

// Exclude Supabase realtime + Stripe from caching
const supabaseRoute = new RegExpRoute(
  /.*supabase\.co.*/,
  new NetworkOnly()
)
const stripeRoute = new RegExpRoute(
  /.*stripe\.com.*/,
  new NetworkOnly()
)

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [supabaseRoute, stripeRoute, ...defaultCache],
})

serwist.addEventListeners()
```

### Pattern 3: Hebrew RTL PDF with @react-pdf/renderer

**What:** React component tree under `<Document>` and `<Page>`. Hebrew text needs static font file + Unicode RLE character workaround.
**When to use:** For generating downloadable PDFs of analysis results.

```typescript
// src/components/features/export/pdf-styles.ts
// Source: react-pdf docs + community workaround for RTL (github.com/diegomura/react-pdf/discussions/2306)
import { Font, StyleSheet } from '@react-pdf/renderer'

// Register Heebo from public/fonts (static, full glyph set — NOT variable font)
Font.register({
  family: 'Heebo',
  src: '/fonts/Heebo-Regular.ttf',
})

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Heebo',
    backgroundColor: '#ffffff',
    padding: 40,
    direction: 'rtl',
  },
  title: {
    fontSize: 20,
    textAlign: 'right',
    marginBottom: 16,
    color: '#1a1025',
  },
  body: {
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 1.6,
    color: '#333333',
  },
})

/** עוטף טקסט עברי עם Unicode RLE כדי לכוון את הרנדור הנכון */
export function hebrewText(text: string): string {
  return `\u202B${text}`
}
```

```typescript
// src/components/features/export/ExportButton.tsx
// Dynamic import with SSR:false — required because react-pdf uses browser APIs
'use client'
import dynamic from 'next/dynamic'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false, loading: () => null }
)
```

### Pattern 4: Share Token DB Migration

**What:** Add `share_token` (UUID, unique) and `is_public` (boolean, default false) to `analyses` table. RLS allows reading rows where `is_public = true` without auth.
**When to use:** Before implementing the share API route.

```sql
-- supabase/migrations/005_schema_fixes.sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analyses' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE analyses ADD COLUMN share_token UUID DEFAULT gen_random_uuid();
    ALTER TABLE analyses ADD COLUMN is_public BOOLEAN DEFAULT FALSE NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS analyses_share_token_idx ON analyses(share_token);
  END IF;
END $$;

-- RLS: allow public read of shared analyses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'analyses' AND policyname = 'analyses_public_read'
  ) THEN
    CREATE POLICY analyses_public_read ON analyses
      FOR SELECT USING (is_public = true);
  END IF;
END $$;
```

### Pattern 5: Install Prompt Component

**What:** `beforeinstallprompt` event captured for Android/Chrome; manual instructions shown for iOS Safari (which does not fire the event).

```typescript
// src/components/features/pwa/InstallPrompt.tsx
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
'use client'
import { useState, useEffect } from 'react'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) return null
  // Render install instructions…
}
```

### Anti-Patterns to Avoid

- **Variable fonts in react-pdf:** OpenType variable fonts (weight ranges like `Heebo[wght]`) are NOT supported by the PDF spec. Register fixed-weight TTF files only.
- **SSR import of @react-pdf/renderer:** Causes `Module not found: ESM packages` error in Next.js 16. Always use `dynamic(() => import('...'), { ssr: false })`.
- **Caching Supabase realtime WebSocket in service worker:** Service workers intercept `fetch` events but NOT WebSocket connections (protocol: `wss://`). However, HTTP requests to Supabase (auth, RPC, storage) CAN be intercepted. Use `NetworkOnly` for `*.supabase.co` to prevent stale auth tokens or stale analysis data.
- **Caching Stripe webhook responses:** Stripe webhooks POST to `/api/webhooks/stripe`. Service workers should not cache or modify this. Add it to the NetworkOnly list alongside Supabase.
- **Using `next-pwa` (original by shadowwalker):** Package is unmaintained. Use `@serwist/next` or `@ducanh2912/next-pwa` instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation | Custom canvas/SVG to PDF convertor | @react-pdf/renderer | Font subsetting, page breaks, proper encoding are extremely complex |
| Social share buttons | Custom open-graph URL builders for each platform | react-share | Each platform has different URL schema, UTM params, encoding requirements |
| Service worker caching | Manual fetch event listener with custom cache logic | serwist + defaultCache | Cache versioning, stale-while-revalidate, precache manifest injection are error-prone |
| PWA manifest route | Manual API route returning JSON | app/manifest.ts (Next.js built-in) | Next.js handles content-type, caching headers, and link rel injection automatically |
| Share token generation | Custom random string generator | `gen_random_uuid()` in Postgres | UUID is URL-safe, collision-resistant, database-native; no server secret needed |

---

## Runtime State Inventory

> Not a rename/refactor phase. Omit full inventory.

None required — this phase adds new features only. No rename, rebrand, or migration of existing stored identifiers.

---

## Common Pitfalls

### Pitfall 1: Hebrew Characters Not Rendering in PDF

**What goes wrong:** PDF shows blank spaces or boxes where Hebrew text should appear.
**Why it happens:** The default Helvetica font embedded in @react-pdf/renderer does not contain Hebrew glyphs. The library falls back to tofu (blank boxes) silently.
**How to avoid:** Always call `Font.register({ family: 'Heebo', src: '/fonts/Heebo-Regular.ttf' })` at module scope BEFORE any Document renders. Download the TTF from Google Fonts — not the variable font, not WOFF2.
**Warning signs:** PDF exports but all Hebrew text is invisible or replaced by rectangles.

### Pitfall 2: react-pdf SSR Error in Next.js Build

**What goes wrong:** Build fails with `Module not found: ESM packages (@react-pdf/renderer) need to be imported`.
**Why it happens:** Next.js 16 enforces stricter ESM requirements; @react-pdf/renderer ships CommonJS with browser-only dependencies.
**How to avoid:** Never import `@react-pdf/renderer` at the top level of a server component. Use `dynamic(() => import('@react-pdf/renderer').then(m => m.PDFDownloadLink), { ssr: false })` in client components. If the error persists, add `transpilePackages: ['@react-pdf/renderer']` to `next.config.ts`.
**Warning signs:** `next build` fails; error mentions ESM or canvas.

### Pitfall 3: Service Worker Breaks Supabase Auth on App Reload

**What goes wrong:** After PWA installation, the app shows a logged-out state even when the user was logged in.
**Why it happens:** The service worker caches the HTML shell that includes stale auth state, OR caches the Supabase auth token endpoint response, returning an expired token.
**How to avoid:** Set `Cache-Control: no-cache, no-store, must-revalidate` on `/sw.js` itself (see next.config.ts headers). Use `NetworkOnly` for all `*.supabase.co` API routes. Do NOT cache `/api/**` routes.
**Warning signs:** Users report being logged out on first open of PWA from home screen.

### Pitfall 4: Share Token RLS Bypasses User Isolation

**What goes wrong:** A user can read ANY analysis by guessing a share token, even analyses that were never made public.
**Why it happens:** If RLS policy is `is_public = true` without checking the token, an attacker can enumerate IDs.
**How to avoid:** The RLS policy must check both `is_public = true` AND match by the UUID token (which is non-enumerable). The public API route must validate the token matches the analysis row.
**Warning signs:** `curl /api/analysis/share?token=any-value` returns 200 for non-public analyses.

### Pitfall 5: PWA Icons Not Found — Install Prompt Never Shows

**What goes wrong:** Chrome/Safari does not offer "Add to Home Screen" because the manifest is incomplete.
**Why it happens:** PWA installability requires: valid manifest, HTTPS, a service worker, AND icons of at least 192x192 and 512x512 in PNG format. Missing any one blocks the prompt.
**How to avoid:** Create the `public/` folder (currently does NOT exist in the repo), add `icon-192.png` and `icon-512.png` before testing. Validate with Chrome DevTools > Application > Manifest.
**Warning signs:** Chrome DevTools shows "Page does not meet installability criteria" with icon errors.

### Pitfall 6: Serwist Conflicts with Next.js Turbopack

**What goes wrong:** Build with `next dev --turbopack` or `next build` with Turbopack fails.
**Why it happens:** Serwist currently requires webpack; the `@serwist/next` plugin does not support Turbopack.
**How to avoid:** Ensure `next.config.ts` does NOT enable `experimental.turbo`. The project currently uses webpack (no turbo config found), so this is a "don't introduce" warning.
**Warning signs:** Build error mentioning Turbopack plugin incompatibility.

### Pitfall 7: Web Share API iOS Limitation

**What goes wrong:** The `beforeinstallprompt` event never fires on iOS Safari.
**Why it happens:** Apple does not allow third-party install prompts on Safari; iOS users must manually use "Share > Add to Home Screen."
**How to avoid:** Show a custom instructional banner for iOS users (check `navigator.userAgent` for iPad/iPhone). Never rely on `beforeinstallprompt` for iOS.
**Warning signs:** Android users see install button but iOS users see nothing.

---

## Code Examples

### Next.js Config for serwist + react-pdf

```typescript
// next.config.ts — Source: serwist docs + react-pdf ESM fix
import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
})

const nextConfig: NextConfig = {
  transpilePackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ]
  },
}

export default withSerwist(nextConfig)
```

### Share Panel Component

```typescript
// src/components/features/sharing/SharePanel.tsx
'use client'
import { WhatsappShareButton, TelegramShareButton, FacebookShareButton } from 'react-share'
import { Button } from '@/components/ui/button'

interface SharePanelProps {
  shareUrl: string
  title: string
}

export function SharePanel({ shareUrl, title }: SharePanelProps) {
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  const handleNativeShare = async () => {
    await navigator.share({ title, url: shareUrl })
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {canNativeShare && (
        <Button onClick={handleNativeShare}>שיתוף</Button>
      )}
      <WhatsappShareButton url={shareUrl} title={title}>וואטסאפ</WhatsappShareButton>
      <TelegramShareButton url={shareUrl} title={title}>טלגרם</TelegramShareButton>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa (shadowwalker) | serwist / @ducanh2912/next-pwa | 2023-2024 | next-pwa is unmaintained; must migrate |
| `experimental.serverComponentsExternalPackages` | `serverExternalPackages` (stable) | Next.js 14.1.1 | Key changed from experimental to stable |
| `app/manifest.json` static file | `app/manifest.ts` dynamic export | Next.js 13.3+ | Dynamic manifest supports per-request data; static still works |
| `beforeinstallprompt` for all browsers | iOS manual instructions + Android event | Always | iOS Safari has never fired this event |

**Deprecated/outdated:**
- `next-pwa` (shadowwalker, npm: next-pwa): No maintenance since 2022. Do not use.
- `experimental.esmExternals: 'loose'`: Was a workaround for react-pdf in older Next.js. Use `transpilePackages` instead in Next.js 14.1.1+.

---

## Open Questions

1. **Hebrew PDF rendering — confirmed working?**
   - What we know: `@react-pdf/renderer` has an open bug (issue #3010, Dec 2024) with Hebrew custom fonts. The Unicode RLE workaround (`\u202B`) helps with text direction but may not fix glyph rendering if the font loader caching bug is hit.
   - What's unclear: Whether the bug is reproducible with Heebo specifically, or only with Noto Sans. One issue commenter said "gave up and used native PDF print."
   - Recommendation: Plan 10-01 should implement react-pdf AND include a `window.print()` fallback. Test Hebrew rendering in Wave 0. If react-pdf glyphs fail, the fallback is already polished (globals.css has `@media print` rules). The plan should NOT block on react-pdf working.

2. **PWA scope: installability-only or offline support?**
   - What we know: UX-04 says "install prompt, service worker." The success criteria only requires home screen installation. Offline support is listed as v2 (ADV-03).
   - What's unclear: Whether a minimal manifest + bare `public/sw.js` (no caching) is sufficient for the install prompt, vs. serwist with full precaching.
   - Recommendation: Use minimal approach first (just manifest + bare SW that handles push events). Add serwist only if offline support is explicitly confirmed in scope. This avoids the Turbopack pitfall and keeps complexity low.

3. **Accessibility audit depth**
   - What we know: Plan 10-04 is described as "ARIA, keyboard navigation, screen reader verification." This can range from a quick eslint-plugin-jsx-a11y pass to a full manual audit.
   - What's unclear: Which specific components are most at risk (RTL keyboard nav, chart accessibility, modals).
   - Recommendation: Scope to: (1) automated axe-core scan of all main pages, (2) manual keyboard check of forms and modals, (3) ARIA roles on icon-only buttons. Full screen reader testing is v2.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + jsdom |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXPO-01 | `hebrewText()` function wraps text with U+202B | unit | `npx vitest run tests/services/export.test.ts` | No — Wave 0 |
| EXPO-01 | PDF styles `direction: 'rtl'` present in pdfStyles | unit | same file | No — Wave 0 |
| EXPO-02 | `POST /api/analysis/share` returns 200 with `share_url` | smoke | manual / integration | No — Wave 0 |
| EXPO-02 | `GET /share/[token]` accessible without auth | smoke | manual | No — Wave 0 |
| UX-04 | manifest.ts exports valid PWA manifest shape | unit | `npx vitest run tests/services/manifest.test.ts` | No — Wave 0 |
| UX-04 | InstallPrompt hides when `display-mode: standalone` | unit | `npx vitest run tests/components/install-prompt.test.tsx` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `cd mystiqor-build && npx vitest run tests/`
- **Per wave merge:** `cd mystiqor-build && npx vitest run`
- **Phase gate:** Full suite green + `tsc --noEmit` 0 errors before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/services/export.test.ts` — covers EXPO-01 utility functions
- [ ] `tests/services/manifest.test.ts` — covers UX-04 manifest shape
- [ ] `tests/components/install-prompt.test.tsx` — covers UX-04 install prompt state

*(Share API route and public share page are integration-level — manual verification is sufficient for v1 scope.)*

---

## Sources

### Primary (HIGH confidence)
- [Next.js Official PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — manifest.ts pattern, service worker, install prompt, push notifications, security headers — retrieved 2026-03-24
- [Serwist Next.js Getting Started](https://serwist.pages.dev/docs/next/getting-started) — withSerwistInit config, swSrc/swDest, tsconfig additions — retrieved 2026-03-24
- [Serwist Core API](https://serwist.pages.dev/docs/serwist/core) — RegExpRoute + NetworkOnly pattern — retrieved 2026-03-24
- npm registry: @react-pdf/renderer@4.3.2, serwist@9.5.7, @serwist/next@9.5.7, react-share@5.3.0, web-push@3.6.7 — verified 2026-03-24

### Secondary (MEDIUM confidence)
- [react-pdf/renderer Discussion #2306](https://github.com/diegomura/react-pdf/discussions/2306) — Unicode RLE workaround for RTL Hebrew text — community-verified pattern
- [react-pdf/renderer Issue #2992](https://github.com/diegomura/react-pdf/issues/2992) — ESM error fix via `transpilePackages` — multiple confirmations
- [Next.js serverExternalPackages docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages) — @react-pdf/renderer in auto-externals list

### Tertiary (LOW confidence — flag for validation)
- [react-pdf/renderer Issue #3010](https://github.com/diegomura/react-pdf/issues/3010) — Hebrew glyph rendering bug open as of December 2024; no official fix released — needs validation in Wave 0 testing
- Community reports that `window.print()` is the practical fallback when react-pdf Hebrew fails — single source, needs confirmation in project context

---

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — libraries verified in npm registry; Hebrew PDF workaround needs Wave 0 validation
- Architecture: HIGH — manifest.ts and service worker patterns from official Next.js docs
- Pitfalls: HIGH for PWA/sharing patterns; MEDIUM for Hebrew PDF (open bug)

**Research date:** 2026-03-24
**Valid until:** 2026-06-24 (90 days — stable libraries; react-pdf bug may be resolved sooner)
