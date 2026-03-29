# Phase 22: Accessibility Foundation - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

תיקון ניגודיות טקסט, הגדרת סקאלת z-index גלובלית, ו-prefers-reduced-motion — בסיס טכני שמאפשר לבנות פאזות 23-25 (floating coach, bottom tabs, atmospheric animations) בלי רגרסיות.

</domain>

<decisions>
## Implementation Decisions

### Contrast Strategy
- **D-01:** אודיט שקיפויות — למצוא כל שימוש בשקיפויות מתחת ל-/85 על טקסט (כמו text-gold-dim/60, text-on-surface-variant/70) ולהעלות ל-/85 מינימום. לא לשנות טוקנים בסיסיים (כמו --muted-foreground) כי זה משפיע על 50+ מקומות.
- **D-02:** מטרת הניגודיות: WCAG AA (4.5:1 minimum ratio) לכל טקסט על רקע כהה.

### Z-Index Scale
- **D-03:** CSS custom properties ב-globals.css — הגדרת --z-header, --z-tabs, --z-floating, --z-panel, --z-overlay, --z-modal. כל קומפוננט משתמש ב-var() במקום מספר קשיח.
- **D-04:** עדכון Header.tsx ו-MobileNav.tsx להשתמש ב-CSS variables החדשים במקום z-50 hardcoded.

### Reduced Motion
- **D-05:** כיבוי מלא — @media (prefers-reduced-motion: reduce) מכבה את כל ה-keyframes, transitions, ו-animations. האפליקציה נראית סטטית לגמרי למי שמבקש זאת (אבל עדיין פונקציונלית).

### Claude's Discretion
- ערכי z-index ספציפיים (למשל header=50, tabs=40, floating=45, modal=60) — Claude יבחר סדר הגיוני
- שיטת האודיט (grep regex לשקיפויות, או סריקה ידנית) — Claude יבחר
- האם להוסיף eslint rule או רק תיעוד נגד שימוש בשקיפויות נמוכות — Claude יחליט

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### CSS & Design System
- `mystiqor-build/src/app/globals.css` — כל CSS variables, keyframes, mystical utilities
- `mystiqor-build/tailwind.config.ts` — MD3 color tokens, theme definition

### Layout Components (z-index consumers)
- `mystiqor-build/src/components/layouts/Header.tsx` — Currently z-50
- `mystiqor-build/src/components/layouts/MobileNav.tsx` — Currently z-50
- `mystiqor-build/src/components/layouts/Sidebar.tsx` — Navigation structure

### Research
- `.planning/research/STACK.md` — Text contrast root cause analysis, specific hex values
- `.planning/research/PITFALLS.md` — z-index collision warnings, animation GPU budget
- `.planning/research/ARCHITECTURE.md` — z-index scale proposal

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- globals.css has 6+ @keyframes definitions (sparkle-float, shimmer, aurora, etc.) — all need reduced-motion coverage
- Glass utilities (.glass-nav, .glass-panel) use backdrop-filter — NOT animations, so they're fine with reduced-motion
- .text-gradient-gold and .text-gradient-mystic classes exist but are rarely used

### Established Patterns
- Color tokens follow MD3 naming: --surface, --on-surface, --primary, etc.
- Dark theme is in .dark {} block in globals.css
- z-index is currently hardcoded (z-50) in individual components

### Integration Points
- globals.css :root / .dark — where z-index scale and muted-foreground changes go
- All files using opacity modifiers on text colors — need audit
- Phase 23 will add floating coach and bottom tabs that depend on z-index scale from this phase

</code_context>

<specifics>
## Specific Ideas

- המשתמש דיווח שטקסט בהיר "נבלע" ברקע — זו התלונה שהובילה לכל המיילסטון v1.3
- שקיפויות נמוכות (/60, /70) הן הבעיה העיקרית, לא הצבעים עצמם
- z-index צריך להיות מוכן לפני Phase 23 שמוסיפה floating coach ו-bottom tabs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-accessibility-foundation*
*Context gathered: 2026-03-29*
