# Phase 18: Tarot Card Library - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

כל 78 קלפי הטארוט זמינים במערכת עם דאטה עשירה — קבלה, ארכיטיפים, התאמות אסטרולוגיות, ערכים נומרולוגיים — ו-4 פריסות מוגדרות לשימוש (קלף בודד, 3 קלפים, יחסים 5, צלב קלטי 10).

</domain>

<decisions>
## Implementation Decisions

### העשרת הדאטה
- **D-01:** סנכרון מטא-דאטה מ-`tarot-data.ts` ל-DB — סקריפט שמעדכן את טבלת `tarot_cards` מהקובץ הקיים (לא seed SQL ידני)
- **D-02:** הוספת עמודות חדשות לטבלה: `element`, `astrology`, `kabbalah`, `archetype`, `upright_keywords`, `reversed_keywords`, `numerology_value`
- **D-03:** כל 78 הקלפים כבר קיימים ב-`TAROT_CARD_META` — סנכרון אוטומטי, לא הזנה ידנית

### פריסות ואינטראקציה
- **D-04:** צלב קלטי — פריסה קלאסית עם צלב (6 קלפים בצלב + 4 בעמודה ימנית), לא grid פשוט
- **D-05:** אנימציית היפוך קלף (card flip) — 3D flip animation בעת שליפת קלפים
- **D-06:** בחירת פריסה דרך כפתורים (buttons) עם שם, תיאור ומספר קלפים — 4 כפתורי פריסה (מחליפים את 3 הכפתורים הנוכחיים 1/3/5)
- **D-07:** 4 פריסות: קלף בודד (1), שלושה קלפים (3), יחסים (5), צלב קלטי (10) — כבר מוגדרות ב-`TAROT_SPREADS`

### תצוגת פרטי קלף
- **D-08:** סקציות מתקפלות (collapsible) — שם + ארקנה + מילות מפתח גלויים תמיד, לחיצה על הקלף פותחת את המטא-דאטה העשירה
- **D-09:** באדג'ים צבעוניים לקשרים — אלמנט בצבע שלו, כוכב עם סמל, נתיב קבלה באות עברית

### קלפים הפוכים
- **D-10:** אין קלפים הפוכים בשליפה — כל הקלפים תמיד upright
- **D-11:** הדאטה של `reversed_keywords` עדיין נשמר ב-DB (דרישת TAROT-02) אבל לא בשימוש בפריסה

### Claude's Discretion
- רזולוציית הצלב הקלטי ב-responsive (mobile vs desktop) — קלוד מחליט
- סדר הצגת שדות המטא-דאטה בסקציה המתקפלת — קלוד מחליט
- הגדרת ערכי numerology_value לכל קלף — קלוד מחליט לפי מספר הקלף המסורתי

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tarot Data
- `mystiqor-build/src/lib/constants/tarot-data.ts` — מקור כל 78 הקלפים עם מטא-דאטה (element, astrology, kabbalah, archetype, keywords) + 4 הגדרות פריסה
- `mystiqor-build/src/app/(auth)/tools/tarot/page.tsx` — דף טארוט קיים — UI נוכחי שצריך שדרוג (מ-3 כפתורים ל-4 פריסות + card flip + collapsible meta)
- `mystiqor-build/src/app/api/tools/tarot/route.ts` — API route קיים — צריך שדרוג לתמוך ב-spreadCount של 10 ולהחזיר מטא-דאטה עשירה

### Design Contract
- `.planning/phases/18-tarot-card-library/18-UI-SPEC.md` — UI design contract — spacing, typography, color, copywriting decisions

### Types
- `mystiqor-build/src/types/database.ts` — Database types (TarotCardRow) — צריך עדכון אחרי הוספת עמודות

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card`, `CardContent`, `CardHeader`, `CardTitle` — shadcn/ui cards כבר בשימוש בדף
- `Badge` — כבר בשימוש לתצוגת ארקנה וחפיסה
- `ProgressiveReveal`, `RevealItem` — אנימציית reveal כבר קיימת
- `PageHeader` — header עם breadcrumbs
- `SubscriptionGuard` — מגביל גישה לפי מנוי
- `animations.fadeInUp` — preset אנימציה קיים
- `useMutation` + `toast` — pattern קיים של API calls

### Established Patterns
- RTL + Hebrew throughout — כל הטקסטים בעברית, dir="rtl"
- CSS classes: `nebula-glow`, `mystic-hover`, `bg-surface-container`, `text-primary` — design system קיים
- `ARCANA_HE`, `SUIT_HE` — מילונים לתרגום לעברית כבר קיימים
- Zod validation בכל API route
- React Query mutations עם toast feedback

### Integration Points
- `SPREAD_OPTIONS` (line 43) — צריך להחליף ב-`TAROT_SPREADS` מ-tarot-data.ts
- `TarotInputSchema.spreadCount` (route.ts line 20) — צריך לתמוך גם ב-10 (צלב קלטי)
- `fetchTarot` function — צריך להחזיר מטא-דאטה עשירה ולא רק שדות בסיסיים
- DB migration — הוספת עמודות חדשות + סנכרון דאטה

</code_context>

<specifics>
## Specific Ideas

- פריסת צלב קלטי קלאסית — 6 קלפים בצורת צלב (2 באמצע חוצים, 4 סביבם) + 4 בעמודה ימנית
- Card flip animation — CSS 3D transform, גב קלף → פנים
- באדג'ים צבעוניים — אלמנט אש=אדום, מים=כחול, אוויר=צהוב, אדמה=ירוק

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-tarot-card-library*
*Context gathered: 2026-03-28*
