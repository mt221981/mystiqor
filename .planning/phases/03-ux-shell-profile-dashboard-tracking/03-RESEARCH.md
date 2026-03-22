# Phase 3: UX Shell + Profile + Dashboard + Tracking - Research

**Researched:** 2026-03-22
**Domain:** Next.js 14 App Router / RTL Hebrew UX / Recharts / React Hook Form / Supabase CRUD
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dashboard Layout**
- D-01: Hero element is a daily insight card — mystical/astrological insight for the day based on user's zodiac sign + numerology day number. Content sourced from astrology + numerology calculations tied to user's birth profile.
- D-02: 3-4 focused charts below the hero: biorhythm (3 cyclic lines), mood trend (7-day line), goals progress (bar + category breakdown), tool usage distribution (bar chart by analysis type).
- D-03: Period selector with all three options: daily / weekly / monthly. Affects mood trend and tool usage charts.
- D-04: 4 stat cards row between hero and charts: active goals count, current mood score, completed goals, pending reminders.

**Mood Tracker UX**
- D-05: Mood selection via 5 emoji buttons (very bad to very good): maps to mood_score 1-10 internally (2, 4, 6, 8, 10).
- D-06: Additional fields alongside mood: energy level (slider 1-10), stress level (slider 1-10), sleep quality (slider 1-10), free-text notes (optional textarea).
- D-07: Mood and journal are integrated — when writing a journal entry, user can attach mood score; when logging mood, user can expand to write a journal note.

**Journal**
- D-08: Journal entry includes: title, content (rich textarea), mood selector, energy level, gratitude items (3 text inputs), goal links (multi-select from active goals).
- D-09: Journal list shows entries with tags/categories derived from content, date, and mood emoji.

**Guest Profiles (PROF-02)**
- D-10: Guest profiles store birth data only (name, birth date, birth time, birth place, gender) — no login, no separate analyses stored.
- D-11: Purpose: run analysis tools (synastry, compatibility, family charts) using guest birth data.
- D-12: Limit: tied to subscription plan — Free=1 guest, Basic=3 guests, Premium=8 guests.
- D-13: UI: simple list in profile section with add/edit/delete. Uses BirthDataForm component already built.

### Claude's Discretion
- Chart color schemes and styling within dark/light theme
- Exact skeleton loading patterns per page
- Empty state illustrations and copy
- Mobile responsive breakpoints
- Animation timing and easing
- Settings page layout (PROF-03)

### Deferred Ideas (OUT OF SCOPE)
- AI-powered mood analysis (TRCK-01 mentions "trend charts" but AI insights are Phase 7)
- Daily insights combining tarot + numerology + astrology (TRCK-05 is Phase 4)
- Notifications and reminders system (TRCK-06 is Phase 8)
- Goal-to-analysis linker AI recommendations (TRCK-04 API route only, AI in Phase 7)
- PWA support (UX-04 is Phase 10)
- Analytics dashboard / self-analytics (UX-09 is Phase 9)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROF-01 | User can view and edit profile (name, birth data, preferences) | profileSchema ready; profiles table has all fields; pattern: RHF + Zod + API route PATCH |
| PROF-02 | User can manage multiple guest profiles (family/partner analysis) | guest_profiles table confirmed; BirthDataForm reusable; subscription gate needed (Free=1, Basic=3, Premium=8) |
| PROF-03 | User can configure settings (theme, notifications) | useThemeStore complete with persistence; settings page is Claude's discretion |
| DASH-01 | Dashboard shows biorhythm chart (physical/emotional/intellectual) | BiorhythmChart.jsx from BASE44 is complete pure-calculation component; port to TypeScript with Recharts LineChart |
| DASH-02 | Key stats cards (active goals, mood score, completed goals, reminders) | Existing dashboard already fetches goalsCount + moodCount; must replace analysesCount with: active goals, avg mood score 7-day, completed goals, pending reminders |
| DASH-03 | Mood trend line chart (7-day history) | mood_entries table confirmed; date-fns v4 for date arithmetic; Recharts LineChart with period selector |
| DASH-04 | Goal progress + breakdown charts | goals table confirmed with progress (0-100) + category fields; Recharts BarChart |
| DASH-05 | Analysis types distribution bar chart | analyses table confirmed with tool_type; AnalysesChart.tsx already built |
| DASH-06 | Period selector (daily/weekly/monthly) | Affects mood trend + analysis distribution queries; implement as filter state in page component |
| TRCK-01 | Mood tracker with 5-point scale + energy level + trend charts | MoodCreateSchema ready; 5 emoji → score mapping (2,4,6,8,10); API route POST /api/mood; trend via React Query |
| TRCK-02 | Personal journal with mood_score, energy_level, gratitude, goals fields | JournalCreateSchema ready; journal_entries table confirmed; full CRUD API routes needed |
| TRCK-03 | Goals with progress tracking and AI recommendations | GoalCreateSchema ready; goals table confirmed with progress field; CRUD + progress update; AI recommendations deferred to Phase 7 (store field exists: recommendations Json) |
| TRCK-04 | Goal linker connecting goals to specific analyses | API route to link goal_id to analyses; no AI — just association; analyses table already has input_data Json where goal_id can be stored |
| UX-01 | RTL Hebrew UI on all pages | dir="rtl" on all new page wrappers; use start/end not left/right; Hebrew labels throughout |
| UX-02 | Dark/light theme toggle | useThemeStore complete; wire settings page; Header already has toggle button |
| UX-03 | Responsive mobile layout | Sidebar + MobileNav already RTL-ready; new pages need sm: breakpoints |
| UX-05 | Page transitions and micro-animations | framer-motion v12 installed; use motion.div with standard fade+slide presets |
| UX-06 | Loading skeletons and empty states | Skeleton component from shadcn/ui available; EmptyState.tsx already exists |
| UX-07 | Error boundaries with auto-recovery | ErrorBoundary.tsx (GEM 10) is production-ready — wrap each page |
| UX-08 | Breadcrumb navigation | Breadcrumbs.tsx ready — inject items prop per page |
</phase_requirements>

---

## Summary

Phase 3 is a completion phase, not a greenfield build. The app shell (Sidebar, Header, MobileNav, ErrorBoundary, Breadcrumbs) is already built and production-ready. The Zustand theme store is complete. All Zod validation schemas for the four data entities (mood, journal, goals, profile) exist and match the live DB schema. The existing dashboard page already fetches and renders stat cards and a basic analyses bar chart using Recharts.

The primary work is: (1) wire the real Sidebar/MobileNav into the auth layout replacing the placeholder; (2) rebuild the dashboard page to match the locked D-01 through D-06 decisions (daily insight card, biorhythm chart, 4 focused charts, 4 stat cards, period selector); (3) build CRUD pages and API routes for mood, journal, goals; (4) build profile edit + guest profile management pages; (5) apply ErrorBoundary, Breadcrumbs, and skeleton loading uniformly; (6) build the settings page (theme toggle wired to useThemeStore, placeholder for future notification preferences).

**Primary recommendation:** Wire shell first (layout-client.tsx replaces placeholder sidebar with real Sidebar + Header + MobileNav), then build dashboard, then implement the three tracking pages (mood, journal, goals) using the established API route pattern, then profile/settings/guest.

---

## Standard Stack

### Core (already installed in mystiqor-build)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^3.8.0 | All dashboard charts | Already used (AnalysesChart.tsx); BASE44 used same library |
| react-hook-form | ^7.71.2 | All forms | Established pattern from onboarding; integrated with Zod |
| @hookform/resolvers | ^5.2.2 | RHF + Zod bridge | Already installed; zodResolver() is the standard bridge |
| zod | ^4.3.6 | Form + API validation | All schemas already written for this phase |
| @tanstack/react-query | ^5.91.2 | Server state | queryKeys factory already defined in cache-config.ts |
| framer-motion | ^12.38.0 | Micro-animations | Already installed; use for page entry + mood emoji selection |
| date-fns | ^4.1.0 | Date arithmetic | Already installed; use for mood trend date ranges |
| sonner | ^2.0.7 | Toast notifications | Toaster already wired in AuthLayoutClient |
| zustand | (installed) | Theme store | useThemeStore complete with localStorage persistence |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Slider | (installed) | Energy/stress/sleep sliders | Mood tracker + journal forms |
| shadcn/ui Progress | (installed) | Goal progress bars | Goals list and dashboard |
| shadcn/ui Tabs | (installed) | Profile page tabs (own / guest) | Profile page tabbed layout |
| shadcn/ui Dialog | (installed) | Goal edit modal / guest profile form | Inline CRUD dialogs |
| shadcn/ui Select | (installed) | Goal category picker | Goals create/edit form |
| shadcn/ui Skeleton | (installed) | Loading states | Per-page skeleton layouts |

**Note on Zod v4:** The installed version is Zod v4.3.6. The schemas in this codebase already use v4 API correctly (`z.enum(values, 'message')` one-arg form). STATE.md warns: `nonempty()` is removed in v4 (use `.min(1)`), error shape changed. The existing schemas do not use `nonempty()` — they already use `.min(1)`. No migration needed for existing schemas.

**Note on date-fns v4:** Installed version is v4.1.0. Import style: named imports from `date-fns` (e.g., `import { subDays, format } from 'date-fns'`). The locale import is `import { he } from 'date-fns/locale/he'` (not `/locale` root in v4). Verify this during implementation — STATE.md flags date-fns v4 import differences as a known concern.

### Verification (confirmed from package.json)
```bash
# All these are already in mystiqor-build/package.json — no new installs needed for Phase 3
recharts@3.8.0, react-hook-form@7.71.2, zod@4.3.6, framer-motion@12.38.0, date-fns@4.1.0
```

---

## Architecture Patterns

### Recommended Project Structure for Phase 3

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # EXISTING — auth guard (no changes)
│   │   ├── layout-client.tsx       # MODIFY — wire real Sidebar + Header + MobileNav
│   │   ├── dashboard/
│   │   │   └── page.tsx            # MODIFY — full dashboard with D-01..D-06
│   │   ├── profile/
│   │   │   └── page.tsx            # NEW — profile view/edit + guest profiles tabs
│   │   ├── settings/
│   │   │   └── page.tsx            # NEW — theme toggle + notification prefs placeholder
│   │   ├── mood/
│   │   │   └── page.tsx            # NEW — mood tracker CRUD
│   │   ├── journal/
│   │   │   └── page.tsx            # NEW — journal CRUD
│   │   └── goals/
│   │       └── page.tsx            # NEW — goals CRUD + progress
│   └── api/
│       ├── mood/
│       │   └── route.ts            # NEW — POST (create), GET (list with period)
│       ├── mood/[id]/
│       │   └── route.ts            # NEW — DELETE
│       ├── journal/
│       │   └── route.ts            # NEW — POST (create), GET (list)
│       ├── journal/[id]/
│       │   └── route.ts            # NEW — PATCH (update), DELETE
│       ├── goals/
│       │   └── route.ts            # NEW — POST (create), GET (list)
│       ├── goals/[id]/
│       │   └── route.ts            # NEW — PATCH (update/progress), DELETE
│       ├── profile/
│       │   └── route.ts            # NEW — PATCH (update profile)
│       └── guest-profiles/
│           └── route.ts            # NEW — POST (create), GET (list)
│           └── [id]/route.ts       # NEW — PATCH, DELETE
├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── DailyInsightCard.tsx   # Hero card — zodiac + numerology day calculation
│   │   │   ├── BiorhythmChart.tsx     # Port from BASE44, typed TypeScript
│   │   │   ├── MoodTrendChart.tsx     # Recharts LineChart, period-aware
│   │   │   ├── GoalsProgressChart.tsx # Recharts BarChart for goal progress
│   │   │   └── PeriodSelector.tsx     # daily/weekly/monthly tabs
│   │   ├── mood/
│   │   │   ├── MoodEmojiPicker.tsx    # 5 emoji buttons with score mapping
│   │   │   └── MoodEntryCard.tsx      # List item display
│   │   ├── journal/
│   │   │   ├── JournalEntryForm.tsx   # Full entry form (RHF + Zod)
│   │   │   └── JournalEntryCard.tsx   # List item display
│   │   ├── goals/
│   │   │   ├── GoalForm.tsx           # Create/edit form (RHF + Zod)
│   │   │   └── GoalCard.tsx           # Card with progress bar
│   │   └── profile/
│   │       ├── ProfileEditForm.tsx    # Edit form (RHF + Zod, reuses profileSchema)
│   │       └── GuestProfileList.tsx   # List + add/edit/delete with subscription gate
```

### Pattern 1: API Route (established from Phase 1/2)

Every new API route follows: auth check → Zod validate → DB write via admin client → return typed response.

```typescript
// Source: established pattern from mystiqor-build/src/app/api/onboarding/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MoodCreateSchema } from '@/lib/validations/mood';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const body = await request.json();
  const parsed = MoodCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('mood_entries')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

### Pattern 2: React Query for Reads (established)

Reads use browser client directly (no API route), mutations go through API routes.

```typescript
// Source: established pattern from mystiqor-build/src/app/(auth)/dashboard/page.tsx
const { data: moodEntries, isLoading } = useQuery({
  queryKey: queryKeys.moods.recent(7),
  queryFn: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const sevenDaysAgo = subDays(new Date(), 7).toISOString();
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user!.id)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  staleTime: CACHE_TIMES.SHORT,
});
```

### Pattern 3: React Hook Form + Zod (established from onboarding)

```typescript
// Source: established pattern from mystiqor-build/src/app/(auth)/onboarding/page.tsx (Phase 2)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MoodCreateSchema, type MoodCreate } from '@/lib/validations/mood';

const form = useForm<MoodCreate>({
  resolver: zodResolver(MoodCreateSchema),
  defaultValues: { mood: '', mood_score: 5, energy_level: 5, stress_level: 5, sleep_quality: 5 },
});

const mutation = useMutation({
  mutationFn: async (data: MoodCreate) => {
    const res = await fetch('/api/mood', { method: 'POST', body: JSON.stringify(data) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.moods.all });
    toast.success('מצב הרוח נרשם בהצלחה');
  },
});
```

### Pattern 4: Biorhythm Calculation (pure math, no library)

```typescript
// Source: github-source/src/components/dashboard/BiorhythmChart.jsx — port to TypeScript
interface BiorhythmDataPoint {
  date: string;
  physical: number;   // cycle: 23 days
  emotional: number;  // cycle: 28 days
  intellectual: number; // cycle: 33 days
}

function generateBiorhythmData(birthDate: string, days = 14): BiorhythmDataPoint[] {
  const today = new Date();
  const birth = new Date(birthDate);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const diffDays = Math.ceil(Math.abs(date.getTime() - birth.getTime()) / 86400000);
    return {
      date: date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
      physical: Math.sin((2 * Math.PI * diffDays) / 23) * 100,
      emotional: Math.sin((2 * Math.PI * diffDays) / 28) * 100,
      intellectual: Math.sin((2 * Math.PI * diffDays) / 33) * 100,
    };
  });
}
```

### Pattern 5: Daily Insight Card (D-01, deterministic calculation)

The daily insight hero is based on user's birth_date from profile. No LLM call in Phase 3 — use a deterministic computation:
- Zodiac sign: derived from birth_date month/day
- Numerology day number: (day + month + year) digits summed and reduced to 1-9 or 11/22
- Static insight text pool: select from a pre-written pool using `(dayOfYear + numerologyNumber) % poolLength`

This avoids any LLM call while still providing a "personalized" daily card. LLM integration for this card comes in Phase 4 (TRCK-05).

### Pattern 6: Guest Profile Subscription Gate

The guest profile limit (D-12: Free=1, Basic=3, Premium=8) must be enforced at the API route level, not just the UI. The API route for POST /api/guest-profiles must:
1. Count current guest profiles for the user
2. Look up user's subscription plan
3. Compare against plan limit before inserting

The subscriptions table has plan column with values 'free', 'basic', 'premium'. Guest limits are constants defined in the API route.

### Anti-Patterns to Avoid

- **Inline chart data computation in JSX:** Extract to `useMemo` hooks or separate util functions. The existing dashboard page does this correctly (see `buildChartData`).
- **Fetching all data in one giant queryFn:** Dashboard uses `Promise.allSettled` — follow this pattern. Individual settled rejections don't crash the whole dashboard.
- **Using left/right CSS properties:** Use `start`/`end` for all RTL-aware positioning (already demonstrated in Header.tsx: `absolute start-0`).
- **Server Component for pages that read client state:** Profile, mood, journal, goals pages all need `'use client'` because they use React Query hooks.
- **Skipping ErrorBoundary on new pages:** Every new page must be wrapped with `<ErrorBoundary>`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Zod schemas already written | MoodCreateSchema, JournalCreateSchema, GoalCreateSchema, profileSchema all exist |
| Biorhythm chart | Custom SVG/Canvas | Recharts LineChart | Already installed; BASE44 version is a 74-line port |
| Toast notifications | Custom toast system | sonner (already wired) | Toaster in AuthLayoutClient, import `toast` from `sonner` |
| Theme persistence | Custom localStorage handling | useThemeStore (Zustand) | Already complete with DOM sync |
| Loading states | Custom spinner | shadcn/ui Skeleton | Skeleton component gives skeleton-style loading; LoadingSpinner.tsx also exists |
| Empty states | Custom empty UI | EmptyState.tsx | Already built common component |
| Mobile navigation | Custom drawer | MobileNav.tsx | Already built with Escape key, body scroll lock, RTL slide-from-right |
| Breadcrumbs | Custom breadcrumb | Breadcrumbs.tsx | Already built with RTL ChevronLeft separator |
| Error recovery | try/catch wrapper | ErrorBoundary class component | GEM 10, already production-ready |
| Query key factories | Inline string arrays | queryKeys from cache-config.ts | All keys already defined: moods, journal, goals, profile, insights |

**Key insight:** This phase has extraordinarily high reuse. The main work is connecting existing pieces — schemas, components, stores, query keys — rather than building new abstractions.

---

## Common Pitfalls

### Pitfall 1: Auth Layout Placeholder Not Replaced
**What goes wrong:** The auth layout-client.tsx uses a hardcoded placeholder sidebar (lines 37-62) instead of the real `<Sidebar>` component. If the plan creates new pages without replacing this, the sidebar never appears.
**Why it happens:** The Sidebar.tsx component was built but the layout was not updated to use it yet.
**How to avoid:** Plan 03-01 MUST replace the placeholder aside block in layout-client.tsx with `<Sidebar>` + `<Header>` + `<MobileNav>`.
**Warning signs:** Pages render without the sidebar; the placeholder says "תפריט ניווט — ייבנה בשלב הבא".

### Pitfall 2: Recharts RTL Axis Direction
**What goes wrong:** By default, Recharts XAxis renders left-to-right. In an RTL layout, the chart may appear mirrored or the date labels flow incorrectly.
**Why it happens:** Recharts does not auto-detect RTL from dir="rtl" on the container.
**How to avoid:** On `<XAxis>`, set `reversed={true}` for RTL date charts. For BarChart with Hebrew category labels, test that labels render correctly at the axis tick positions.
**Warning signs:** Dates appear in reverse chronological order on the left side of the chart.

### Pitfall 3: Zod v4 enum() Signature
**What goes wrong:** Using Zod v3 syntax `z.enum(values, { message: '...' })` will fail in v4.
**Why it happens:** Zod v4 changed the enum error message parameter to be a second positional string argument.
**How to avoid:** Use `z.enum(GOAL_CATEGORIES, 'קטגוריית מטרה לא תקינה')` — the existing GoalCreateSchema already demonstrates the correct v4 syntax. Do not copy BASE44 patterns which may use v3 syntax.
**Warning signs:** TypeScript type errors on the second argument to `z.enum()`.

### Pitfall 4: date-fns v4 Locale Import
**What goes wrong:** `import { he } from 'date-fns/locale'` fails in v4 (locale moved to sub-path).
**Why it happens:** date-fns v4 restructured locale exports.
**How to avoid:** Use `import { he } from 'date-fns/locale/he'` for Hebrew locale. STATE.md explicitly flags this risk.
**Warning signs:** TypeScript module not found error for `'date-fns/locale'`.

### Pitfall 5: Dashboard Stat Cards — analysesCount vs Required Stats
**What goes wrong:** The existing dashboard page fetches `analysesCount`, `goalsCount`, `moodCount`, `remindersCount` but D-04 requires: active goals, current mood score (average 7-day), completed goals, pending reminders.
**Why it happens:** The existing dashboard was a scaffold, not the final design.
**How to avoid:** Replace the four queries with: active goals count (status IN active/in_progress), average mood_score from last 7 days, completed goals count, pending reminders count. The `buildChartData` function and `AnalysesChart` component can stay as-is for DASH-05.
**Warning signs:** Dashboard shows "ניתוחים" count instead of "יעדים פעילים".

### Pitfall 6: Guest Profile Limit Enforcement
**What goes wrong:** Limit is enforced only in UI (button disabled) but not in the API route. A user can bypass via direct POST request.
**Why it happens:** UI-only gating is a common shortcut.
**How to avoid:** API route POST /api/guest-profiles must count existing guest_profiles rows for the user, look up subscriptions.plan, and return 403 if at limit. UI gate is a UX layer on top, not a substitute.
**Warning signs:** Test: POST directly to /api/guest-profiles after Free plan user already has 1 guest profile.

### Pitfall 7: Period Selector and React Query Cache Invalidation
**What goes wrong:** When user changes from "weekly" to "monthly" period, the chart shows stale weekly data if the queryKey does not include the period.
**Why it happens:** React Query caches by queryKey — same key = same cache.
**How to avoid:** Include period in the queryKey: `queryKeys.moods.list({ period })` so each period has its own cache entry.
**Warning signs:** Switching period does not update chart; data remains the same.

---

## Code Examples

### Shell Layout Wire-Up (Plan 03-01 target)

```typescript
// Source: mystiqor-build/src/app/(auth)/layout-client.tsx — REPLACE placeholder aside
// Replace lines 37-62 with:
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';
import { MobileNav } from '@/components/layouts/MobileNav';

// Inside component:
const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

return (
  <QueryClientProvider client={queryClient}>
    <div className="flex min-h-screen bg-background" dir="rtl">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <Header onMobileMenuOpen={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile nav overlay */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </div>
    <Toaster position="bottom-left" dir="rtl" ... />
  </QueryClientProvider>
);
```

### Mood Emoji Picker (5-point, D-05)

```typescript
// 5 emoji buttons mapping to mood_score values 2, 4, 6, 8, 10
const MOOD_EMOJIS = [
  { emoji: '😢', label: 'גרוע מאוד', score: 2 },
  { emoji: '😔', label: 'לא טוב', score: 4 },
  { emoji: '😐', label: 'בסדר', score: 6 },
  { emoji: '😊', label: 'טוב', score: 8 },
  { emoji: '😄', label: 'מעולה', score: 10 },
] as const;

// Selected emoji also updates form field mood_score via setValue
```

### Zodiac Sign Derivation (for Daily Insight Card)

```typescript
// Deterministic — no LLM needed
function getZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Standard 12-sign boundaries...
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'טלה';
  // ... etc for all 12 signs
}

function getNumerologyDayNumber(today: Date): number {
  const digits = today.toISOString().slice(0, 10).replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts v2 (BASE44) | Recharts v3.8.0 | 2024 | API mostly stable; ResponsiveContainer still works; `Cell` fill still works |
| Zod v3 (BASE44) | Zod v4.3.6 | 2025 | nonempty() removed; error.issues shape changed; enum() second arg is string not object |
| date-fns v2/v3 (BASE44) | date-fns v4.1.0 | 2024 | Locale imports moved to sub-paths; tree-shaking improved |
| framer-motion v10 (BASE44) | framer-motion v12.38.0 | 2025 | API largely stable for basic motion.div; no impact on phase 3 usage |
| React Hook Form v6 | RHF v7.71.2 | Long-standing | useController API, watch vs subscribe — v7 has been stable for years |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No test framework detected in mystiqor-build |
| Config file | None found |
| Quick run command | `npx tsc --noEmit` (TypeScript compilation = proxy for correctness) |
| Full suite command | `cd mystiqor-build && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROF-01 | Profile edit form saves to DB | Manual smoke | `npm run build` | ❌ Wave 0 |
| PROF-02 | Guest profile limit enforced at API | Manual smoke (curl POST after limit) | `npm run build` | ❌ Wave 0 |
| PROF-03 | Theme toggle persists across refresh | Manual smoke | `npm run build` | ❌ Wave 0 |
| DASH-01 | Biorhythm chart renders 14-day data | Manual visual | `npm run build` | ❌ Wave 0 |
| DASH-02 | 4 stat cards show correct counts | Manual smoke | `npm run build` | ❌ Wave 0 |
| DASH-03 | Mood trend updates after new entry | Manual smoke | `npm run build` | ❌ Wave 0 |
| DASH-04 | Goals chart shows progress | Manual smoke | `npm run build` | ❌ Wave 0 |
| DASH-05 | Analysis distribution chart renders | Manual smoke | `npm run build` | ✅ AnalysesChart.tsx |
| DASH-06 | Period selector changes chart data | Manual smoke | `npm run build` | ❌ Wave 0 |
| TRCK-01 | Mood entry creates DB row + appears in trend | Manual smoke | `npm run build` | ❌ Wave 0 |
| TRCK-02 | Journal CRUD all operations | Manual smoke | `npm run build` | ❌ Wave 0 |
| TRCK-03 | Goal create/edit/delete/progress update | Manual smoke | `npm run build` | ❌ Wave 0 |
| TRCK-04 | Goal-analysis link stores association | Manual smoke | `npm run build` | ❌ Wave 0 |
| UX-01 | All new pages have dir="rtl" and Hebrew labels | TypeScript build + visual | `npm run build` | ❌ Wave 0 |
| UX-02 | Theme toggle persists (localStorage) | Manual smoke | `npm run build` | ✅ theme.ts |
| UX-03 | Mobile: sidebar collapsed, MobileNav opens | Manual visual (devtools) | `npm run build` | ✅ MobileNav.tsx |
| UX-05 | Animations render on page entry | Manual visual | `npm run build` | ❌ Wave 0 |
| UX-06 | Skeleton shows during loading | Manual smoke (throttle network) | `npm run build` | ❌ Wave 0 |
| UX-07 | ErrorBoundary shows recovery UI on thrown error | Manual smoke (throw test error) | `npm run build` | ✅ ErrorBoundary.tsx |
| UX-08 | Breadcrumbs show correct path on all new pages | Manual visual | `npm run build` | ✅ Breadcrumbs.tsx |

### Sampling Rate
- **Per task commit:** `cd mystiqor-build && npx tsc --noEmit`
- **Per wave merge:** `cd mystiqor-build && npm run build`
- **Phase gate:** Full build green (zero errors) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No unit test framework installed — all validation is TypeScript compilation + manual smoke tests
- [ ] Manual smoke test protocol should be documented in PLAN.md verification steps per task
- [ ] `npm run build` serves as the automated gate; each plan must end with build passing

---

## Open Questions

1. **Daily Insight Card content source (D-01)**
   - What we know: D-01 specifies "zodiac sign + numerology day number" — both are deterministic pure calculations with no LLM.
   - What's unclear: Should the insight card show a fixed static text pool, or is there a `daily_insights` table in the DB that should be pre-populated? The DB has a `daily_insights` table (confirmed in database.generated.ts) with `insight_date`, `content`, `title`, `focus_area` columns.
   - Recommendation: For Phase 3, compute zodiac + numerology day deterministically and display a static card with those values. Do NOT pre-populate the `daily_insights` table yet — that table is for Phase 4 (TRCK-05) when LLM integration creates personalized daily insights. The Phase 3 card is a "calculated preview" without AI content.

2. **Goal-Analysis Linker (TRCK-04) implementation approach**
   - What we know: TRCK-04 says "API route only, AI in Phase 7". The `analyses` table has `input_data Json` and `goals` table has `preferred_tools string[]`.
   - What's unclear: Is the link stored in analyses.input_data, or is there a separate junction table? The DB schema shows no explicit goal_analyses junction table.
   - Recommendation: Store goal link in analyses.input_data as `{ goal_id: string }` on the analysis side, OR use the goals table's `recommendations Json` field to store linked analysis IDs. The simplest Phase 3 approach: on the goal detail, allow user to select from their recent analyses — store selected analysis IDs in `goals.recommendations` as `{ linked_analyses: string[] }` JSON. No new table needed.

3. **UsageBar in Sidebar uses PLACEHOLDER_USAGE_PERCENT (42)**
   - What we know: Sidebar.tsx line 128 uses `const PLACEHOLDER_USAGE_PERCENT = 42`. The subscriptions table exists with `analyses_used` and `analyses_limit` columns.
   - What's unclear: Should Phase 3 wire the real usage data into the UsageBar?
   - Recommendation: Yes — the sidebar's UsageBar should show real usage. Add a React Query fetch for the current user's subscription data (subscriptions table: analyses_used / analyses_limit). This is a small addition to Plan 03-01 (shell wiring).

---

## Sources

### Primary (HIGH confidence)
- Direct code reading: `mystiqor-build/src/components/layouts/Sidebar.tsx` — full production sidebar
- Direct code reading: `mystiqor-build/src/components/layouts/Header.tsx` — theme toggle + user menu
- Direct code reading: `mystiqor-build/src/app/(auth)/layout-client.tsx` — placeholder sidebar confirmed
- Direct code reading: `mystiqor-build/src/app/(auth)/dashboard/page.tsx` — existing dashboard patterns
- Direct code reading: `mystiqor-build/src/lib/validations/mood.ts` — MoodCreateSchema with all fields
- Direct code reading: `mystiqor-build/src/lib/validations/journal.ts` — JournalCreateSchema
- Direct code reading: `mystiqor-build/src/lib/validations/goals.ts` — GoalCreateSchema + 8 categories
- Direct code reading: `mystiqor-build/src/lib/validations/profile.ts` — profileSchema
- Direct code reading: `mystiqor-build/src/types/database.generated.ts` — confirmed mood_entries, journal_entries, goals, guest_profiles, profiles, daily_insights tables
- Direct code reading: `mystiqor-build/src/lib/query/cache-config.ts` — queryKeys factory for all entities
- Direct code reading: `mystiqor-build/src/stores/theme.ts` — Zustand theme store with persistence
- Direct code reading: `mystiqor-build/src/components/common/ErrorBoundary.tsx` — GEM 10 production-ready
- Direct code reading: `mystiqor-build/src/components/common/Breadcrumbs.tsx` — RTL breadcrumbs
- Direct code reading: `mystiqor-build/src/components/features/shared/AnalysesChart.tsx` — Recharts bar chart
- Direct code reading: `mystiqor-build/package.json` — confirmed recharts@3.8, zod@4.3.6, date-fns@4.1.0, framer-motion@12.38
- Direct code reading: `github-source/src/components/dashboard/BiorhythmChart.jsx` — biorhythm algorithm
- Direct code reading: `github-source/src/pages/Dashboard.jsx` — chart structure reference
- Direct code reading: `github-source/src/pages/MoodTracker.jsx` — mood form reference
- Direct code reading: `github-source/src/pages/Journal.jsx` — journal form reference
- Direct code reading: `github-source/src/pages/ManageProfiles.jsx` — guest profile UX reference

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — Zod v4 and date-fns v4 import warnings verified as documented decisions
- `.planning/phases/03-ux-shell-profile-dashboard-tracking/03-CONTEXT.md` — locked decisions D-01 through D-13

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed from package.json
- Architecture: HIGH — all schemas, components, DB types verified by direct code reading
- Pitfalls: HIGH — pitfalls identified from direct code inspection (placeholder sidebar, wrong stat cards, etc.)
- Chart patterns: HIGH — Recharts already used in AnalysesChart.tsx, BiorhythmChart.jsx ported
- Zod v4/date-fns v4 warnings: MEDIUM — confirmed from package.json versions + STATE.md decisions

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable stack, 30-day validity)
