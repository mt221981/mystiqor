# Phase 20: Dream & Blog Content - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

מילון רגשות חלומות זמין בטופס הניתוח כבחירת כפתורי אימוג'י (לא טקסט חופשי), ו-3+ מאמרי בלוג עשירים (800-1200 מילים כל אחד) חיים ב-DB עם דף מאמר נפרד מעוצב.

</domain>

<decisions>
## Implementation Decisions

### רגשות בטופס חלומות
- **D-01:** כפתורי אימוג'י לבחירה — גריד של 12 כפתורי רגש עם אימוג'י + שם, מחליפים את TagInput הנוכחי
- **D-02:** בחירה מרובה — המשתמש יכול לבחור כמה רגשות (toggle on/off)
- **D-03:** הרגשות מגיעים מ-`DREAM_EMOTIONS` ב-`dream-data.ts` (12 רגשות כבר קיימים עם אימוג'י + תיאור)

### תוכן מאמרי בלוג
- **D-04:** 3 מאמרים לפי הדרישות: נומרולוגיה למתחילים, מדריך למזלות, קריאה בכף היד
- **D-05:** כל מאמר עשיר — 800-1200 מילים בעברית, עם כותרות משנה, רשימות, דוגמאות מעשיות
- **D-06:** מאמרים נכנסים לטבלת `blog_posts` ב-Supabase דרך seed script (לא hardcoded בקוד)
- **D-07:** תוכן בפורמט Markdown — מאוחסן בשדה `content` בטבלה

### תצוגת מאמר בודד
- **D-08:** דף מאמר נפרד בנתיב `/learn/blog/[slug]` — לא expand בתוך הרשימה
- **D-09:** תוכן מעוצב עם Markdown rendering — כותרות, פסקאות, רשימות, תמונות
- **D-10:** BlogPostCard ברשימה מפנה לדף המאמר (link, לא expand)

### Claude's Discretion
- עיצוב דף המאמר (layout, typography) — קלוד מחליט לפי design system קיים
- מבנה הטבלה `blog_posts` — קלוד מחליט אם צריך migration או שהטבלה כבר קיימת
- האם לשמור את expand/collapse ב-BlogPostCard כתצוגה מקדימה — קלוד מחליט

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dream Form
- `mystiqor-build/src/lib/constants/dream-data.ts` — מקור 12 רגשות עם DreamEmotion interface (value, label, emoji, description)
- `mystiqor-build/src/app/(auth)/tools/dream/page.tsx` — טופס חלומות קיים — צריך להחליף TagInput ברגשות בגריד כפתורי אימוג'י

### Blog
- `mystiqor-build/src/app/(auth)/learn/blog/page.tsx` — דף בלוג קיים — עובד עם סינון + חיפוש, שולף מ-API
- `mystiqor-build/src/components/features/blog/BlogPostCard.tsx` — כרטיס מאמר — צריך עדכון מ-expand ל-link
- `mystiqor-build/src/app/api/blog/route.ts` — API route לשליפת מאמרים מ-DB

### Types
- `mystiqor-build/src/types/database.ts` — Database types — לבדוק אם blog_posts קיים

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DREAM_EMOTIONS` constant — 12 רגשות מוכנים לשימוש
- `BlogPostCard` — כרטיס קיים (צריך שינוי מ-expand ל-link)
- `ReactMarkdown` — כבר מותקן ובשימוש בפרויקט (dream page, tarot page)
- `PageHeader` + breadcrumbs — pattern מוכר
- API route `/api/blog` — כבר שולף מטבלת `blog_posts`

### Established Patterns
- Markdown rendering עם `prose prose-invert` classes
- React Query עם staleTime
- Zod validation ב-API routes
- `MysticSkeleton` לטעינה

### Integration Points
- `dream/page.tsx` line 257-263 — TagInput שצריך להחלף בגריד כפתורי רגשות
- `BlogPostCard` — שינוי מ-expand behavior ל-link to `/learn/blog/[slug]`
- צריך ליצור `/learn/blog/[slug]/page.tsx` — דף מאמר חדש
- צריך seed script למאמרי בלוג

</code_context>

<specifics>
## Specific Ideas

- כפתורי רגשות כגריד 3x4 או 4x3 עם toggle — נבחר=צבעוני, לא נבחר=שקוף
- 3 מאמרים: נומרולוגיה למתחילים, מדריך למזלות, קריאה בכף היד — בעברית, 800-1200 מילים כל אחד
- דף מאמר עם reading experience נוח — prose styling, breadcrumbs, כפתור חזרה

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-dream-blog-content*
*Context gathered: 2026-03-29*
