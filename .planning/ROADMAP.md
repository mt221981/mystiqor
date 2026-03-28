# Roadmap: MystiQor

## Milestones

- ✅ **v1.0 MVP** - Phases 1-12 (shipped 2026-03-25)
- 🚧 **v1.1 UI Polish** - Phases 13-17 (in progress)
- 📋 **v1.2 Rich Content & Soul** - Phases 18-21 (planned)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-12) - SHIPPED 2026-03-25</summary>

12 phases, 66 plans, 308 source files, ~27,300 LOC TypeScript.
See .planning/milestones/v1.0-ROADMAP.md for full details.

</details>

<details>
<summary>v1.1 UI Polish (Phases 13-17) - IN PROGRESS</summary>

5 phases, 16 requirements. Onboarding fix, typography, icons, CSS polish, animations.
See v1.1 section below for details.

- [ ] **Phase 13: Onboarding Fix** - תיקון OnboardingWizard השבור והשלמת זרימת משתמש חדש
- [x] **Phase 14: Typography & Hebrew Localization** - פונט עברי Heebo ותרגום מונחים אנגליים שנותרו
- [ ] **Phase 15: Icons Migration** - מיגרציית כל האייקונים ל-react-icons/gi תמטיים
- [ ] **Phase 16: CSS & Interaction Polish** - אימוץ CSS utilities חדשים ו-mystic-hover בכל האפליקציה
- [ ] **Phase 17: Loading & Reveal Animations** - Shimmer loading מיסטי ואנימציית progressive reveal

</details>

### v1.2 Rich Content & Soul (Planned)

**Milestone Goal:** העברת כל הדאטה העשירה מהמערכת המקורית + הוספת תוכן פנימי שגורם למערכת להרגיש חיה, אישית, וחודרת לנשמה

**Phase Numbering:**
- Integer phases (18, 19, ...): Planned milestone work
- Decimal phases (18.1, 18.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 18: Tarot Card Library** - 78 קלפי טארוט מלאים עם קבלה, ארכיטיפים, ו-4 פריסות
- [ ] **Phase 19: Astrology Knowledge Base** - מילוני מזלות, כוכבים, בתים ואספקטים עם תצוגה ב-UI
- [ ] **Phase 20: Dream & Blog Content** - מילון רגשות חלומות + 3 מאמרי בלוג מלאים ב-DB
- [ ] **Phase 21: Prompt Enrichment & Soul** - פרסונליזציה עמוקה בכל prompts ותובנות יומיות

## Phase Details

<details>
<summary>v1.1 UI Polish Phase Details (Phases 13-17)</summary>

### Phase 13: Onboarding Fix
**Goal**: משתמש חדש יכול להשלים onboarding מלא ולהגיע לדשבורד ללא תקלות
**Depends on**: Nothing (critical bug fix, independent)
**Requirements**: ONB-01, ONB-02
**Success Criteria** (what must be TRUE):
  1. משתמש שנרשם רואה את שלב 1 של OnboardingWizard (מידע אישי) מיד לאחר התחברות
  2. משתמש חדש יכול לעבור את כל 4 השלבים ברצף ולהגיע ל-dashboard
  3. OnboardingWizard מרנדר תוכן ולא עמוד ריק
**Plans**: TBD
**UI hint**: yes

### Phase 14: Typography & Hebrew Localization
**Goal**: כל הטקסט באפליקציה מוצג בפונט עברי Heebo וכל המונחים בעברית
**Depends on**: Nothing (independent foundation work)
**Requirements**: TYPO-01, TYPO-02
**Success Criteria** (what must be TRUE):
  1. פונט Heebo טעון ומוצג בכל טקסט עברי באפליקציה (body + headings)
  2. "Human Design" מופיע כ-"עיצוב אנושי" בכל מקום ב-UI (sidebar, כותרות, כרטיסים)
  3. "Solar Return" מופיע כ-"חזרת שמש" בכל מקום ב-UI
  4. "HTP + Koppitz" מופיע כ-"בית-עץ-אדם" בכל מקום ב-UI
**Plans**: 1 plan
Plans:
- [x] 14-01-PLAN.md — Verify Heebo font propagation + replace English display terms with Hebrew
**UI hint**: yes

### Phase 15: Icons Migration
**Goal**: כל האייקונים באפליקציה הם react-icons/gi תמטיים-מיסטיים ועקביים
**Depends on**: Nothing (independent, can run parallel to 13-14)
**Requirements**: ICON-01, ICON-02, ICON-03, ICON-04, ICON-05
**Success Criteria** (what must be TRUE):
  1. כל 16 עמודי הכלים מציגים אייקוני react-icons/gi תמטיים במקום lucide-react
  2. StatCards, DailyInsightCard, PeriodSelector בדשבורד מציגים אייקונים מיסטיים
  3. MobileNav ו-Header תואמים ויזואלית ל-Sidebar עם אותם אייקוני react-icons/gi
  4. EmptyState, ErrorBoundary, LoadingSpinner משתמשים באייקונים מיסטיים
  5. PageHeader בכל העמודים מציג אייקון react-icons/gi תואם לנושא העמוד
**Plans**: 3 plans
Plans:
- [ ] 15-01-PLAN.md — Migrate 5 remaining tool page PageHeaders (timing, document, synthesis, daily-insights, relationships)
- [ ] 15-02-PLAN.md — Migrate StatCards dashboard icons + Header mobile logo
- [ ] 15-03-PLAN.md — Migrate InsightHeroCard section icons + learn page PageHeaders
**UI hint**: yes

### Phase 16: CSS & Interaction Polish
**Goal**: כל הקומפוננטות משתמשות ב-CSS utilities החדשים ובאפקטי hover מיסטיים
**Depends on**: Phase 15 (icons should be in place before polish pass)
**Requirements**: CSS-01, CSS-02, CSS-03, CSS-04, ANIM-03
**Success Criteria** (what must be TRUE):
  1. GlassCard מציע variants mystic ו-gold שמשתמשים ב-mystic-card ו-mystic-card-gold
  2. NebulaButton מציע variant gold עם gold-glow shadow
  3. כל כרטיסי הכלים בעמודי הכלים מגיבים ל-hover עם אפקט mystic-hover
  4. כותרות ראשיות (דשבורד, כלים, פרופיל) מציגות text-gradient-gold
  5. כל אלמנט אינטראקטיבי (כרטיסים, כפתורים) מגיב ל-hover עם mystic-hover
**Plans**: TBD
**UI hint**: yes

### Phase 17: Loading & Reveal Animations
**Goal**: כל מצבי הטעינה והתוצאות מוצגים עם אנימציות מיסטיות
**Depends on**: Phase 16 (CSS utilities must be adopted first)
**Requirements**: ANIM-01, ANIM-02
**Success Criteria** (what must be TRUE):
  1. Skeleton loading מוחלף ב-shimmer מיסטי (purple gradient sweep) בכל האפליקציה
  2. תוצאות ניתוח מופיעות עם אנימציית progressive reveal (staggered fade-in)
  3. האנימציות נראות עקביות בכל הכלים ובכל הדפים
**Plans**: TBD
**UI hint**: yes

</details>

### Phase 18: Tarot Card Library
**Goal**: כל 78 קלפי הטארוט זמינים במערכת עם דאטה עשירה — קבלה, ארכיטיפים, התאמות אסטרולוגיות — ו-4 פריסות מוגדרות לשימוש
**Depends on**: Nothing (data extraction, independent of v1.1)
**Requirements**: TAROT-01, TAROT-02, TAROT-03
**Success Criteria** (what must be TRUE):
  1. כל 78 קלפי הטארוט (22 Major + 56 Minor Arcana כולל Ace-10 לכל סוט) קיימים ב-DB עם שם ומשמעות בעברית
  2. כל קלף מכיל שדות מטא: התאמה אסטרולוגית, ערך נומרולוגי, נתיב קבלה, ארכיטיפ, מילות מפתח upright ו-reversed
  3. 4 פריסות טארוט (קלף בודד, 3 קלפים, יחסים, צלב קלטי 10 עמדות) מוגדרות ופועלות בעמוד הטארוט
  4. משתמש שמבקש פריסת טארוט מקבל קלפים עם כל הדאטה העשירה (לא רק שם ומשמעות בסיסית)
**Plans**: TBD
**UI hint**: yes

### Phase 19: Astrology Knowledge Base
**Goal**: מילונים אסטרולוגיים מלאים (מזלות, כוכבים, בתים, אספקטים) זמינים ומוצגים ב-UI כחומר עיון
**Depends on**: Nothing (data extraction, independent)
**Requirements**: ASTRO-01, ASTRO-02, ASTRO-03, ASTRO-04
**Success Criteria** (what must be TRUE):
  1. 12 מזלות מוצגים ב-UI עם סמל, אלמנט, צבע, כוכב שולט, ותיאור מפורט בעברית
  2. 10 כוכבי לכת מוצגים ב-UI עם סמל, צבע, ומשמעות מפורטת בעברית
  3. 12 בתים אסטרולוגיים מוצגים ב-UI עם פרשנות מפורטת בעברית
  4. 7 אספקטים מוצגים ב-UI עם חוזק, צבע, ומשמעות מפורטת בעברית
  5. משתמש שגולש לעמוד מילון אסטרולוגי רואה מידע מלא ונגיש (לא צריך לחפש מחוץ למערכת)
**Plans**: TBD
**UI hint**: yes

### Phase 20: Dream & Blog Content
**Goal**: מילון רגשות חלומות זמין בטופס הניתוח ו-3+ מאמרי בלוג עשירים חיים ב-DB
**Depends on**: Nothing (content creation, independent)
**Requirements**: DREAM-01, BLOG-01, BLOG-02
**Success Criteria** (what must be TRUE):
  1. טופס ניתוח חלומות מציג 10+ רגשות לבחירה עם אימוג'ים ותיאורים בעברית
  2. עמוד הבלוג מציג 3+ מאמרים מלאים (נומרולוגיה למתחילים, מזלות, סימנים בכף היד) עם תוכן עשיר
  3. כל מאמרי הבלוג נטענים מטבלת blog_posts ב-Supabase (לא hardcoded בקוד)
  4. מאמר בלוג בודד מציג תוכן מעוצב עם כותרות, פסקאות, ותמונות
**Plans**: TBD

### Phase 21: Prompt Enrichment & Soul
**Goal**: כל ה-LLM prompts מדברים למשתמש באופן אישי ורוחני, ותובנות יומיות מתבססות על הדאטה האישית
**Depends on**: Phase 18, Phase 19 (prompts reference tarot and astrology data)
**Requirements**: PROMPT-01, PROMPT-02
**Success Criteria** (what must be TRUE):
  1. כל prompt של LLM פונה למשתמש בשמו הפרטי (לא "המשתמש" או פניה גנרית)
  2. כל prompt משתמש בשפה רוחנית עמוקה בעברית ומתייחס לדאטה האישית (מזל, מספר חיים)
  3. תובנות יומיות כוללות התייחסות ספציפית למזל המשתמש, מספר החיים שלו, וקלף יום אישי
  4. תובנות יומיות אינן גנריות — שני משתמשים שונים מקבלים תוכן שונה בהתאם לפרופיל שלהם
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 13 -> 14 -> 15 -> 16 -> 17 -> 18 -> 19 -> 20 -> 21

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 13. Onboarding Fix | v1.1 | 0/0 | Not started | - |
| 14. Typography & Hebrew Localization | v1.1 | 1/1 | Complete   | 2026-03-27 |
| 15. Icons Migration | v1.1 | 0/3 | Not started | - |
| 16. CSS & Interaction Polish | v1.1 | 0/0 | Not started | - |
| 17. Loading & Reveal Animations | v1.1 | 0/0 | Not started | - |
| 18. Tarot Card Library | v1.2 | 0/0 | Not started | - |
| 19. Astrology Knowledge Base | v1.2 | 0/0 | Not started | - |
| 20. Dream & Blog Content | v1.2 | 0/0 | Not started | - |
| 21. Prompt Enrichment & Soul | v1.2 | 0/0 | Not started | - |
