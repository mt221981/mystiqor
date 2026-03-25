---
phase: 10-polish-pwa-export
plan: 02
subsystem: ui
tags: [pwa, service-worker, manifest, install-prompt, ios, android]

# Dependency graph
requires:
  - phase: 10-01
    provides: next.config.ts Cache-Control headers for sw.js (no-cache, no-store)
provides:
  - PWA manifest with Hebrew RTL, standalone display, and MystiQor branding
  - Minimal service worker enabling browser install prompt
  - 192x192 and 512x512 PNG icons in mystiqor-build/public/
  - InstallPrompt component handling Android (beforeinstallprompt) and iOS (manual instructions)
  - Service worker registration in root layout via next/script
affects: [10-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "manifest.ts via Next.js App Router MetadataRoute.Manifest type"
    - "minimal SW pattern: skip-waiting + claim + network-only fetch (no caching)"
    - "beforeinstallprompt + iOS fallback pattern for cross-platform PWA install"
    - "next/script afterInteractive for non-blocking SW registration"

key-files:
  created:
    - mystiqor-build/src/app/manifest.ts
    - mystiqor-build/public/sw.js
    - mystiqor-build/public/icon-192.png
    - mystiqor-build/public/icon-512.png
    - mystiqor-build/src/components/features/pwa/InstallPrompt.tsx
  modified:
    - mystiqor-build/src/app/layout.tsx
    - mystiqor-build/src/app/(auth)/layout.tsx

key-decisions:
  - "Minimal SW pattern (no caching) chosen to avoid breaking Supabase auth — offline support deferred to ADV-03 (v2)"
  - "InstallPrompt placed in auth layout — only logged-in users see install prompt"
  - "iOS detection via /iPad|iPhone|iPod/ regex to show manual install instructions since beforeinstallprompt is not supported on Safari"
  - "sharp (already installed for EXIF stripping) used to generate PNG icons from SVG — no new dependency needed"
  - "public/ directory created in mystiqor-build — did not exist prior to this plan"

patterns-established:
  - "PWA icons: dark background #1a1025 with purple accent #7c3aed matching app theme"
  - "InstallPrompt uses start/end Tailwind classes for RTL compliance"

requirements-completed: [UX-04]

# Metrics
duration: 4min
completed: 2026-03-24
---

# Phase 10 Plan 02: PWA Manifest, Icons, Service Worker, Install Prompt Summary

**PWA installability layer with Hebrew RTL manifest, MystiQor-branded icons, network-only service worker, and cross-platform (Android + iOS) install prompt component**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-24T16:12:10Z
- **Completed:** 2026-03-24T16:16:35Z
- **Tasks:** 1
- **Files modified:** 7

## Accomplishments

- Created manifest.ts with Hebrew name, RTL dir, standalone display mode, and dual icon references — Next.js App Router auto-serves at /manifest.webmanifest
- Generated icon-192.png and icon-512.png using sharp (pre-existing dependency) from SVG — dark #1a1025 background with purple #7c3aed circle accent matching app theme
- Created minimal sw.js with skipWaiting + clients.claim + network-only fetch — enables browser install prompt without caching or breaking Supabase auth (Pitfall 3 compliance)
- Created InstallPrompt component with Android (beforeinstallprompt native prompt) and iOS (manual Safari share sheet instructions) flows — RTL-compliant with start/end Tailwind classes
- Registered service worker in root layout via next/script afterInteractive — non-blocking and covers all app pages
- Added InstallPrompt to auth layout so only authenticated users see the install banner

## Task Commits

1. **Task 1: PWA manifest + icons + service worker + install prompt** - `53b8459` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `mystiqor-build/src/app/manifest.ts` - PWA manifest with Hebrew RTL, standalone display, MystiQor branding, 192+512 icons
- `mystiqor-build/public/sw.js` - Minimal service worker: install (skipWaiting), activate (clients.claim), fetch (network-only)
- `mystiqor-build/public/icon-192.png` - 192x192 PNG icon with dark/purple MystiQor branding
- `mystiqor-build/public/icon-512.png` - 512x512 PNG icon with dark/purple MystiQor branding
- `mystiqor-build/src/components/features/pwa/InstallPrompt.tsx` - Client component handling Android (beforeinstallprompt) and iOS (manual instructions) install flows
- `mystiqor-build/src/app/layout.tsx` - Added Script import and SW registration tag via next/script afterInteractive
- `mystiqor-build/src/app/(auth)/layout.tsx` - Added InstallPrompt import and render in auth layout JSX

## Decisions Made

- Minimal SW pattern (no offline caching) to preserve Supabase auth cookie flow — offline deferred to v2 ADV-03
- InstallPrompt placed in auth layout — only logged-in users need the install prompt (onboarding already passed)
- iOS detection via /iPad|iPhone|iPod/ navigator.userAgent test — fallback to manual instructions since Safari does not fire beforeinstallprompt
- sharp (installed in Phase 1 for EXIF stripping) reused for icon generation — zero new dependencies added
- public/ directory created; it was absent from mystiqor-build prior to this plan

## Deviations from Plan

None — plan executed exactly as written. public/ directory creation was anticipated in Step 2 ("Create public/ directory if it does not exist").

## Issues Encountered

- First sharp icon generation attempt failed with "unable to open for write" because public/ directory did not exist yet. Created it with mkdir -p then re-ran — icons generated successfully.

## User Setup Required

None — no external service configuration required. PWA manifest and SW are served statically from mystiqor-build/public/ and the Next.js manifest.ts route.

## Known Stubs

None — all PWA components are complete and wired.

## Next Phase Readiness

- PWA manifest complete and served automatically by Next.js at /manifest.webmanifest
- Service worker registered on all pages via root layout
- Install prompt active for all authenticated users on Android and iOS
- Ready for Plan 10-03 (final polish / QA)

## Self-Check: PASSED

All expected files verified present:
- FOUND: mystiqor-build/src/app/manifest.ts
- FOUND: mystiqor-build/public/sw.js
- FOUND: mystiqor-build/public/icon-192.png
- FOUND: mystiqor-build/public/icon-512.png
- FOUND: mystiqor-build/src/components/features/pwa/InstallPrompt.tsx
- FOUND: .planning/phases/10-polish-pwa-export/10-02-SUMMARY.md
- FOUND commit: 53b8459 (feat task commit in mystiqor-build repo)

---
*Phase: 10-polish-pwa-export*
*Completed: 2026-03-24*
