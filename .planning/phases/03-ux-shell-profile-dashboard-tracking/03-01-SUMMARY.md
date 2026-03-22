---
phase: 03-ux-shell-profile-dashboard-tracking
plan: "01"
subsystem: ui
tags: [layout, sidebar, header, mobile-nav, rtl, react-query, sonner]

# Dependency graph
requires:
  - phase: 02-auth-onboarding
    provides: Auth layout shell (auth)/layout.tsx + layout-client.tsx placeholder
provides:
  - App shell wiring: Sidebar + Header + MobileNav rendered in auth layout
  - RTL dir="rtl" on shell wrapper enforced
  - isMobileNavOpen state controls MobileNav overlay open/close
  - Header receives onMobileMenuOpen callback
  - Toaster positioned bottom-left for RTL
affects:
  - 03-02-profile
  - 03-03-dashboard
  - 03-04-mood-tracking
  - 03-05-goals
  - 03-06-journal
  - 03-07-daily-insights

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shell layout: Sidebar hidden on mobile (hidden md:flex), MobileNav overlay for mobile"
    - "QueryClientProvider wraps entire shell — all child pages get React Query"
    - "Toaster position bottom-left for RTL correctness"

key-files:
  created: []
  modified:
    - mystiqor-build/src/app/(auth)/layout-client.tsx

key-decisions:
  - "Sidebar wrapper uses hidden md:flex md:w-64 md:shrink-0 — Sidebar itself renders inside as h-full"
  - "LogOut import and inline signOut form removed — sign-out is already in Header.tsx user dropdown"
  - "dir=rtl on shell wrapper div, not on individual components — single source of truth for RTL"

patterns-established:
  - "Mobile nav pattern: isMobileNavOpen state in layout, passed to Header (onMobileMenuOpen) and MobileNav (isOpen/onClose)"
  - "App shell structure: QueryClientProvider > dir=rtl wrapper > [Sidebar | flex-col(Header + main)] + MobileNav"

requirements-completed: [UX-01, UX-02, UX-03, UX-05, UX-06, UX-07, UX-08]

# Metrics
duration: 3min
completed: 2026-03-22
---

# Phase 3 Plan 01: App Shell Summary

**RTL app shell wired with real Sidebar, Header, and MobileNav replacing placeholder aside — all Phase 3 pages now have full navigation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-22T14:54:45Z
- **Completed:** 2026-03-22T14:57:33Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced the placeholder `<aside>` (with Hebrew "תפריט ניווט — ייבנה בשלב הבא") with the real Sidebar component
- Added Header at top of content area with `onMobileMenuOpen` callback connected to `isMobileNavOpen` state
- Added MobileNav overlay controlled by `isMobileNavOpen` — opens on mobile hamburger tap, closes on overlay click or Escape key
- Set `dir="rtl"` on the outer shell div per UX-01
- Removed unused `LogOut` import and inline `signOut` form (sign-out already handled by Header's user dropdown)
- TypeScript compilation passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire real Sidebar + Header + MobileNav into auth layout** - `edb8007` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `mystiqor-build/src/app/(auth)/layout-client.tsx` — Auth layout client: replaced placeholder aside with Sidebar, Header, MobileNav; added isMobileNavOpen state; set dir=rtl; removed LogOut/signOut

## Decisions Made

- Sidebar wrapper uses `hidden md:flex md:w-64 md:shrink-0` so the Sidebar renders at full height inside — matches Sidebar.tsx's `h-full w-64` structure
- `LogOut` import and inline `signOut` form removed — sign-out is already in Header.tsx's user dropdown and Sidebar's bottom area
- `dir="rtl"` placed on the shell wrapper div only (not on individual components) — single source of truth for RTL direction

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — mystiqor-build is a git submodule; committed layout-client.tsx inside the submodule first, then staged the updated submodule pointer in the parent repo.

## User Setup Required

None — no external service configuration required.

## Known Stubs

- `PLACEHOLDER_USAGE_PERCENT = 42` in `mystiqor-build/src/components/layouts/Sidebar.tsx` line 128 — UsageBar shows hardcoded 42% usage. This stub is in Sidebar.tsx which was explicitly NOT modified in this plan. It will be wired to real subscription data in a future plan.

## Next Phase Readiness

- App shell is complete and functional — every auth route (dashboard, profile, mood, goals, journal, daily-insights) now has full Sidebar + Header + MobileNav
- TypeScript compiles clean
- Ready for 03-02 (profile page) and all subsequent Phase 3 pages

---
*Phase: 03-ux-shell-profile-dashboard-tracking*
*Completed: 2026-03-22*
