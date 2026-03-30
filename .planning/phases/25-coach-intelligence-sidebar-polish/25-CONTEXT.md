# Phase 25: Coach Intelligence & Sidebar Polish - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

The AI coach responds with awareness of the user's recent analyses (birth chart, tarot, numerology, etc.) during any conversation. Desktop users find tools in a clean 2-category sidebar that remembers open/closed state across page refreshes.

</domain>

<decisions>
## Implementation Decisions

### Coach Dynamic Context
- **D-01:** Every POST to `/api/coach/messages` fetches the 5 most recent analyses (tool_type, summary, created_at) and appends them to the system prompt — the coach always knows what the user has done recently
- **D-02:** Context format: markdown list with tool type (Hebrew), summary (first 80 chars), and relative time — injected between COACH_PERSONA and conversation history
- **D-03:** The existing `context-builder.ts` already fetches 20 analyses at conversation creation — Phase 25 adds a lighter per-message fetch (5 analyses, fewer fields) directly in the messages route

### Sidebar Reorganization
- **D-04:** Merge 3 current categories ("כלים מיסטיים", "אסטרולוגיה מתקדמת", "מתקדם") into 2 new categories:
  - **"כלים מיסטיים"** — 8 primary tools: נומרולוגיה, אסטרולוגיה, גרפולוגיה, ציור, קריאה בכף יד, טארוט, עיצוב אנושי, חלומות
  - **"עוד כלים"** — remaining tools: תחזות יומית, לוח אסטרולוגי, מעברים, חזרת שמש, סינסטרי, התאמה, קריירה, מסמך, מערכות יחסים, סינתזה, אישיות
- **D-05:** All other sections unchanged (ראשי, מסע אישי, למידה, היסטוריה ואנליטיקה, חשבון)

### Sidebar localStorage Persistence
- **D-06:** Persist open/closed state of sidebar categories to localStorage under key `mystiqor-sidebar-sections`
- **D-07:** Only persist category collapse state — nothing else (no recently used tools, no favorite tools)
- **D-08:** On first visit (no localStorage key), default all categories to open (existing behavior)

### Claude's Discretion
- Exact Hebrew label for the analysis context block in system prompt
- Whether to use `created_at` relative time (e.g., "לפני 3 שעות") or absolute date
- localStorage JSON structure for sidebar state

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Coach System
- `mystiqor-build/src/app/api/coach/messages/route.ts` — Message handling, system prompt construction, where per-message context injection goes
- `mystiqor-build/src/services/coach/context-builder.ts` — Existing context builder (fetches 20 analyses at conversation creation) — reference pattern for the lighter per-message version
- `mystiqor-build/src/services/analysis/personal-context.ts` — PersonalContext interface and getPersonalContext function

### Sidebar
- `mystiqor-build/src/components/layouts/Sidebar.tsx` — Current 8-section NAV_SECTIONS array, CollapsibleSection component, useState for openSections
- `mystiqor-build/src/stores/floating-coach.ts` — Reference for Zustand store pattern (if needed for sidebar store)

### Database
- `mystiqor-build/src/app/api/analysis/route.ts` — Analysis API route, queries analyses table

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `context-builder.ts`: Already does `analyses.select('tool_type, results, summary, created_at').order('created_at', {ascending: false}).limit(20)` — Phase 25 can reuse the same query pattern with `.limit(5)` and fewer fields
- `Sidebar.tsx`: Already has `CollapsibleSection` component with `onToggle` handler — just need to add localStorage read/write
- `floating-coach.ts`: Zustand store pattern — could create a sidebar store if needed, but localStorage directly in component is simpler for this case

### Established Patterns
- All API routes use `getSupabaseServer()` + auth check + typed responses
- Coach system prompt built via string concatenation in messages/route.ts
- Sidebar uses `usePathname()` for active state detection

### Integration Points
- `messages/route.ts` POST handler: inject analysis context after personal context, before message history
- `Sidebar.tsx`: NAV_SECTIONS array restructuring + localStorage effect hook

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 25-coach-intelligence-sidebar-polish*
*Context gathered: 2026-03-30*
