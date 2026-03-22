# Phase 3: UX Shell + Profile + Dashboard + Tracking - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the complete logged-in user experience: responsive Hebrew RTL app shell with sidebar navigation, theme toggle, and error recovery; profile viewing/editing with guest profiles; a data-driven dashboard with daily insight and charts; mood tracker, personal journal, and goal tracking with CRUD operations and API routes.

20 requirements: PROF-01, PROF-02, PROF-03, DASH-01 through DASH-06, TRCK-01 through TRCK-04, UX-01 through UX-03, UX-05 through UX-08.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- **D-01:** Hero element is a **daily insight card** — mystical/astrological insight for the day based on user's zodiac sign + numerology day number. Content sourced from astrology + numerology calculations tied to user's birth profile.
- **D-02:** **3-4 focused charts** below the hero: biorhythm (3 cyclic lines), mood trend (7-day line), goals progress (bar + category breakdown), tool usage distribution (bar chart by analysis type).
- **D-03:** **Period selector** with all three options: daily / weekly / monthly. Affects mood trend and tool usage charts.
- **D-04:** 4 stat cards row between hero and charts: active goals count, current mood score, completed goals, pending reminders.

### Mood Tracker UX
- **D-05:** Mood selection via **5 emoji buttons** (very bad to very good): maps to mood_score 1-10 internally (2, 4, 6, 8, 10).
- **D-06:** Additional fields alongside mood: **energy level** (slider 1-10), **stress level** (slider 1-10), **sleep quality** (slider 1-10), **free-text notes** (optional textarea).
- **D-07:** Mood and journal are **integrated** — when writing a journal entry, user can attach mood score; when logging mood, user can expand to write a journal note.

### Journal
- **D-08:** Journal entry includes: title, content (rich textarea), mood selector, energy level, gratitude items (3 text inputs), goal links (multi-select from active goals).
- **D-09:** Journal list shows entries with tags/categories derived from content, date, and mood emoji.

### Guest Profiles (PROF-02)
- **D-10:** Guest profiles store **birth data only** (name, birth date, birth time, birth place, gender) — no login, no separate analyses stored.
- **D-11:** Purpose: run analysis tools (synastry, compatibility, family charts) using guest birth data.
- **D-12:** Limit: **tied to subscription plan** — Free=1 guest, Basic=3 guests, Premium=8 guests.
- **D-13:** UI: simple list in profile section with add/edit/delete. Uses BirthDataForm component already built.

### Claude's Discretion
- Chart color schemes and styling within dark/light theme
- Exact skeleton loading patterns per page
- Empty state illustrations and copy
- Mobile responsive breakpoints
- Animation timing and easing
- Settings page layout (PROF-03)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing code (DO NOT TOUCH)
- `mystiqor-build/src/components/layouts/Sidebar.tsx` — Full navigation, all routes linked, production-ready
- `mystiqor-build/src/components/layouts/Header.tsx` — Theme toggle, user dropdown, RTL
- `mystiqor-build/src/components/layouts/MobileNav.tsx` — Mobile overlay navigation
- `mystiqor-build/src/components/common/ErrorBoundary.tsx` — GEM 10, auto-recovery
- `mystiqor-build/src/components/common/EmptyState.tsx` — Empty state pattern
- `mystiqor-build/src/components/common/LoadingSpinner.tsx` — Loading pattern
- `mystiqor-build/src/components/common/Breadcrumbs.tsx` — RTL breadcrumbs
- `mystiqor-build/src/stores/theme.ts` — Zustand theme store with persistence

### Validation schemas (ready to use)
- `mystiqor-build/src/lib/validations/profile.ts` — Profile + onboarding schemas
- `mystiqor-build/src/lib/validations/mood.ts` — MoodCreateSchema (1-10 scale, energy, stress, sleep, notes)
- `mystiqor-build/src/lib/validations/journal.ts` — JournalCreate + JournalUpdate schemas
- `mystiqor-build/src/lib/validations/goals.ts` — GoalCreate + GoalUpdate schemas (8 categories)

### Database types
- `mystiqor-build/src/types/database.generated.ts` — profiles, mood_entries, journal_entries, goals, guest_profiles tables

### Form components (reuse)
- `mystiqor-build/src/components/forms/BirthDataForm.tsx` — Birth data input (for guest profiles)
- `mystiqor-build/src/components/forms/LocationSearch.tsx` — Location picker with geocoding
- `mystiqor-build/src/components/forms/FormInput.tsx` — Generic text input

### Original BASE44 pages (reference only)
- `github-source/src/pages/Dashboard.jsx` — Original dashboard with Recharts charts
- `github-source/src/pages/MoodTracker.jsx` — 10-emoji mood picker, sliders, AI analysis
- `github-source/src/pages/Journal.jsx` — CRUD journal with mood + gratitude
- `github-source/src/pages/MyGoals.jsx` — Goals with 8 categories, progress tracking
- `github-source/src/pages/UserProfile.jsx` — Profile view with completion score
- `github-source/src/pages/EditProfile.jsx` — Profile edit form
- `github-source/src/pages/ManageProfiles.jsx` — Guest profile management

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **All Zod schemas** for mood, journal, goals, profile are complete and ready
- **BirthDataForm + LocationSearch** can be reused directly for guest profile creation
- **Sidebar** already has all Phase 3 route links (`/mood`, `/journal`, `/goals`, `/profile`)
- **Theme store** (Zustand + localStorage) is complete — just needs wiring to settings page
- **ErrorBoundary** (GEM 10) with auto-recovery is production-ready
- **shadcn/ui** has all needed primitives (card, tabs, dialog, form, slider, progress, etc.)

### Established Patterns
- **API route pattern**: auth check → Zod validate → service call → DB write → return (from Phase 1)
- **React Query pattern**: useQuery for reads with browser Supabase client, useMutation → API route for writes
- **Page decomposition**: page.tsx orchestrates, feature components handle form/result/history
- **SubscriptionGuard** for feature gating (will be needed for guest profile limits)

### Integration Points
- Dashboard reads from mood_entries, goals, analyses tables — needs React Query hooks
- Mood tracker writes to mood_entries — needs API route + form component
- Journal writes to journal_entries — needs API route + CRUD page
- Goals writes to goals table — needs API route + CRUD page
- Guest profiles writes to guest_profiles — needs API route + list/form components
- Profile edit updates profiles table — needs API route (reuse onboarding schema partially)

</code_context>

<specifics>
## Specific Ideas

- Daily insight hero card should feel mystical — gradient background, zodiac icon, brief personalized message
- Biorhythm chart: 3 sine waves (physical=red, emotional=blue, intellectual=yellow) based on birth date
- Mood emoji row should be large, tappable, with subtle animation on select
- Journal should support a "quick entry" mode (just mood + one line) in addition to full entry
- Guest profiles should be accessible from a tab in the profile page, not a separate navigation item

</specifics>

<deferred>
## Deferred Ideas

- AI-powered mood analysis (TRCK-01 mentions "trend charts" but AI insights are Phase 7)
- Daily insights combining tarot + numerology + astrology (TRCK-05 is Phase 4)
- Notifications and reminders system (TRCK-06 is Phase 8)
- Goal-to-analysis linker AI recommendations (TRCK-04 API route only, AI in Phase 7)
- PWA support (UX-04 is Phase 10)
- Analytics dashboard / self-analytics (UX-09 is Phase 9)

</deferred>

---

*Phase: 03-ux-shell-profile-dashboard-tracking*
*Context gathered: 2026-03-22*
