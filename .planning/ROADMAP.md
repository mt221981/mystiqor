# Roadmap: MystiQor

## Milestones

- ✅ **v1.0 MVP** - Phases 1-12 (shipped 2026-03-25)
- 🚧 **v1.1 UI Polish** - Phases 13-17 (in progress)
- ✅ **v1.2 Rich Content & Soul** - Phases 18-21 (shipped 2026-03-29)
- 📋 **v1.3 Mystical UX & Coach Prominence** - Phases 22-25 (planned)

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

<details>
<summary>v1.2 Rich Content & Soul (Phases 18-21) - SHIPPED 2026-03-29</summary>

4 phases, 13 plans. Tarot library, astrology dictionary, dream emotions, blog content, prompt enrichment.

- [x] **Phase 18: Tarot Card Library** - 78 קלפי טארוט מלאים עם קבלה, ארכיטיפים, ו-4 פריסות
- [x] **Phase 19: Astrology Knowledge Base** - מילוני מזלות, כוכבים, בתים ואספקטים עם תצוגה ב-UI
- [x] **Phase 20: Dream & Blog Content** - מילון רגשות חלומות + 3 מאמרי בלוג מלאים ב-DB
- [x] **Phase 21: Prompt Enrichment & Soul** - פרסונליזציה עמוקה בכל prompts ותובנות יומיות

</details>

### v1.3 Mystical UX & Coach Prominence (Planned)

**Milestone Goal:** להפוך את MystiQor לחוויה מיסטית אותנטית עם צ'אט AI בולט ונגיש, ניווט פשוט ואינטואיטיבי, וויזואלים שגורמים למשתמש להרגיש שהוא נכנס לעולם מיסטי אמיתי.

**Phase Numbering:**
- Integer phases (22, 23, ...): Planned milestone work
- Decimal phases (22.1, 22.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 22: Accessibility Foundation** - ניגודיות WCAG AA, z-index גלובלי, reduced-motion — בסיס לכל השאר
- [ ] **Phase 23: Floating Coach & Bottom Tabs** - בועה צפה בכל עמוד + טאבים תחתונים ב-mobile
- [ ] **Phase 24: Atmospheric Depth Sweep** - כותרות מיסטיות, אנימציות כניסה, אייקונים, טעינה מיסטית, טקסט זוהר
- [ ] **Phase 25: Coach Intelligence & Sidebar Polish** - הקשר דינמי עדכני במאמן + ארגון מחדש של סרגל הצד

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

<details>
<summary>v1.2 Rich Content & Soul Phase Details (Phases 18-21) - SHIPPED 2026-03-29</summary>

### Phase 18: Tarot Card Library
**Goal**: כל 78 קלפי הטארוט זמינים במערכת עם דאטה עשירה — קבלה, ארכיטיפים, התאמות אסטרולוגיות — ו-4 פריסות מוגדרות לשימוש
**Depends on**: Nothing (data extraction, independent of v1.1)
**Requirements**: TAROT-01, TAROT-02, TAROT-03
**Success Criteria** (what must be TRUE):
  1. כל 78 קלפי הטארוט (22 Major + 56 Minor Arcana כולל Ace-10 לכל סוט) קיימים ב-DB עם שם ומשמעות בעברית
  2. כל קלף מכיל שדות מטא: התאמה אסטרולוגית, ערך נומרולוגי, נתיב קבלה, ארכיטיפ, מילות מפתח upright ו-reversed
  3. 4 פריסות טארוט (קלף בודד, 3 קלפים, יחסים, צלב קלטי 10 עמדות) מוגדרות ופועלות בעמוד הטארוט
  4. משתמש שמבקש פריסת טארוט מקבל קלפים עם כל הדאטה העשירה (לא רק שם ומשמעות בסיסית)
**Plans**: 4 plans
Plans:
- [x] 18-01-PLAN.md — DB migration (7 columns) + TypeScript types update + test scaffolds
- [x] 18-02-PLAN.md — Sync script (78 cards from TAROT_CARD_META to DB) + API route upgrade (spreadCount=10)
- [x] 18-03-PLAN.md — 5 UI components (SpreadSelector, TarotCardTile, TarotCardMeta, SpreadLayout, TarotCardDetailModal)
- [x] 18-04-PLAN.md — Page wiring (integrate all components into tarot page) + visual verification

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
**Plans**: 2 plans
Plans:
- [x] 19-01-PLAN.md — Data completeness tests + 4 dictionary display components (ZodiacGrid, PlanetGrid, HouseList, AspectDictionary)
- [x] 19-02-PLAN.md — Dictionary page assembly with tabs + Sidebar nav entry + visual verification

### Phase 20: Dream & Blog Content
**Goal**: מילון רגשות חלומות זמין בטופס הניתוח ו-3+ מאמרי בלוג עשירים חיים ב-DB
**Depends on**: Nothing (content creation, independent)
**Requirements**: DREAM-01, BLOG-01, BLOG-02
**Success Criteria** (what must be TRUE):
  1. טופס ניתוח חלומות מציג 10+ רגשות לבחירה עם אימוג'ים ותיאורים בעברית
  2. עמוד הבלוג מציג 3+ מאמרים מלאים (נומרולוגיה למתחילים, מזלות, סימנים בכף היד) עם תוכן עשיר
  3. כל מאמרי הבלוג נטענים מטבלת blog_posts ב-Supabase (לא hardcoded בקוד)
  4. מאמר בלוג בודד מציג תוכן מעוצב עם כותרות, פסקאות, ותמונות
**Plans**: 3 plans
Plans:
- [x] 20-01-PLAN.md — Dream emotion grid + BlogPostCard link refactor + test scaffolds
- [x] 20-02-PLAN.md — Blog seed data (3 articles) + seed script + /api/blog/[slug] route
- [x] 20-03-PLAN.md — Blog detail page (/learn/blog/[slug]) + visual verification

### Phase 21: Prompt Enrichment & Soul
**Goal**: כל ה-LLM prompts מדברים למשתמש באופן אישי ורוחני, ותובנות יומיות מתבססות על הדאטה האישית
**Depends on**: Phase 18, Phase 19 (prompts reference tarot and astrology data)
**Requirements**: PROMPT-01, PROMPT-02
**Success Criteria** (what must be TRUE):
  1. כל prompt של LLM פונה למשתמש בשמו הפרטי (לא "המשתמש" או פניה גנרית)
  2. כל prompt משתמש בשפה רוחנית עמוקה בעברית ומתייחס לדאטה האישית (מזל, מספר חיים)
  3. תובנות יומיות כוללות התייחסות ספציפית למזל המשתמש, מספר החיים שלו, וקלף יום אישי
  4. תובנות יומיות אינן גנריות — שני משתמשים שונים מקבלים תוכן שונה בהתאם לפרופיל שלהם
**Plans**: 4 plans
Plans:
- [x] 21-01-PLAN.md — Shared getPersonalContext helper + daily-insights deep enrichment (gold standard)
- [x] 21-02-PLAN.md — DEEP-tier routes (tarot, coach/journeys, dream, solar-return, transits)
- [x] 21-03-PLAN.md — MEDIUM-tier routes (coach/messages, tutors, forecast, career, numerology)
- [x] 21-04-PLAN.md — BASIC-tier routes (birth-chart, calendar, synastry, compatibility, document, drawing, graphology, human-design)

</details>

### Phase 22: Accessibility Foundation
**Goal**: כל הטקסט קריא, ה-z-index מוגדר גלובלית, ו-reduced-motion תקין — בסיס שמאפשר לבנות כל שכבה ויזואלית מבלי לגרום לרגרסיות
**Depends on**: Nothing (blocking prerequisite for all v1.3 visual work)
**Requirements**: CONTRAST-01, CONTRAST-03, CONTRAST-04
**Success Criteria** (what must be TRUE):
  1. כל טקסט משני (muted, variant) ניתן לקריאה על רקע כהה ב-Chrome DevTools Accessibility panel (יחס ניגודיות 4.5:1 לפחות)
  2. משתמש שמפעיל prefers-reduced-motion לא רואה אנימציות קוסמיות או CSS keyframes (כל 6 ה-keyframes הקיימות שקטות)
  3. Header, bottom tab bar, floating coach bubble, ו-modals לא חוסמים זה את זה — כל אחד נמצא בשכבת z-index ייעודית שלו
  4. טוקן `--z-floating: 60` מוגדר ב-globals.css ויכול להיות מיובא על-ידי כל קומפוננט חדש בלי לנחש מספרים
**Plans**: 2 plans
Plans:
- [x] 22-01-PLAN.md — Z-index CSS custom properties + prefers-reduced-motion + component migration
- [ ] 22-02-PLAN.md — Text opacity contrast audit and fix across 38 component files
**UI hint**: yes

### Phase 23: Floating Coach & Bottom Tabs
**Goal**: מאמן AI נגיש מכל עמוד מאומת דרך בועה צפה, ומשתמשי mobile מנווטים בין 5 יעדים עיקריים ב-tap אחד
**Depends on**: Phase 22 (z-index constants and safe-area strategy required)
**Requirements**: COACH-01, COACH-02, COACH-03, NAV-01
**Success Criteria** (what must be TRUE):
  1. בועה צפה (FAB) מופיעה בפינה הימנית התחתונה בכל עמוד מאומת פרט ל-/coach, ולחיצה עליה פותחת פאנל צ'אט מיני
  2. הבועה מציגה אנימציית נשימה (scale 1.0→1.05) שניתן לראות כשחוזרים לעמוד — הבועה נראית "חיה"
  3. פתיחת הפאנל בעמוד כלי (כגון /astrology) מציגה הודעת פתיחה ספציפית לכלי ולא ברכה גנרית
  4. 5 טאבים תחתונים מוצגים ב-mobile (מוסתרים ב-md: ומעלה) ולוחצים מגיעים ל-dashboard, coach, daily-insights, tools, profile
  5. הטאב הפעיל מסומן ויזואלית; ה-hamburger אינו הניווט הראשי ב-mobile כשהטאבים גלויים
**Plans**: 3 plans
Plans:
- [x] 23-01-PLAN.md — Extract shared coach API service + Zustand store + refactor coach/page.tsx imports
- [x] 23-02-PLAN.md — BottomTabBar (5-tab mobile nav) + tools grid page
- [ ] 23-03-PLAN.md — FloatingCoachBubble + FloatingCoachPanel + layout-client.tsx wiring
**UI hint**: yes

### Phase 24: Atmospheric Depth Sweep
**Goal**: כל עמודי הכלים מרגישים כניסה לעולם מיסטי — כותרות עם זוהר, אנימציות הזמנה, אייקונים קוסמיים, טעינה בעברית מיסטית, וטקסט שזוהר
**Depends on**: Phase 22 (token fixes and reduced-motion baseline required)
**Requirements**: ATMOS-01, ATMOS-02, ATMOS-03, ATMOS-04, CONTRAST-02
**Success Criteria** (what must be TRUE):
  1. כל עמוד כלי (טארוט, אסטרולוגיה, גרפולוגיה וכו') מציג כותרת StandardSectionHeader עם סמל react-icons/gi וזוהר סגול/זהב
  2. כניסה לכל עמוד כלי מציגה אנימציית fade+drift (600ms) — העמוד לא "קופץ" לאוויר אלא "מתגלה"
  3. מצבי טעינה בעמודי כלים מציגים ביטויים מיסטיים בעברית ("קורא את הכוכבים...", "מפענח את הדפוסים...") ולא "טוען..."
  4. כותרות תוצאות ראשיות (h1/h2 בפלט ניתוח) מציגות filter:drop-shadow זוהר סגול/זהב שניתן לראות על רקע כהה
  5. משתמש שמסייר בין 3 עמודי כלים שונים מרגיש אחידות ויזואלית — אותו סגנון כותרת, אותה אנימציית כניסה, אותם אייקונים
**Plans**: 3 plans
Plans:
- [x] 24-01-PLAN.md — Foundation: StandardSectionHeader + MysticLoadingText + loading phrases + pageEntry preset + result-heading-glow CSS
- [ ] 24-02-PLAN.md — Migrate batch 1 (11 tool pages: astrology, tarot, numerology, dream, graphology, drawing, synthesis, document, career, compatibility, tools grid)
- [x] 24-03-PLAN.md — Migrate batch 2 (11 tool pages: solar-return, transits, synastry, calendar, forecast, relationships, human-design, palmistry, personality, timing, daily-insights) + AIInterpretation glow
**UI hint**: yes

### Phase 25: Coach Intelligence & Sidebar Polish
**Goal**: המאמן AI מגיב על-בסיס ניתוחים שהמשתמש ביצע מתחילת השיחה, ומשתמשי desktop מוצאים כלים בסרגל צד נקי שזוכר מה הם פתחו
**Depends on**: Phase 23 (floating coach must exist before context enhancement)
**Requirements**: COACH-04, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. הודעה שנשלחת למאמן AI לאחר ביצוע ניתוח חדש (כגון מפת לידה) כוללת בהקשר את הניתוח — המאמן יודע מה נעשה בשיחה
  2. שאלה למאמן על "מה עשיתי היום" מחזירה תשובה ספציפית המבוססת על ניתוחים אחרונים, לא תשובה גנרית
  3. קטגוריות "אסטרולוגיה מתקדמת" ו-"מתקדם" אינן מופיעות בסרגל הצד — כל הכלים מאורגנים תחת "כלים מיסטיים" ו-"עוד כלים"
  4. מצב פתיחת/סגירת קטגוריות בסרגל הצד שמור גם לאחר רענון דף (localStorage)
**Plans**: 2 plans
Plans:
- [x] 25-01-PLAN.md — Per-message analysis context injection into coach system prompt
- [x] 25-02-PLAN.md — Sidebar category reorganization (8 to 6 sections) + localStorage persistence

## Progress

**Execution Order:**
Phases execute in numeric order: 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23 → 24 → 25

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 13. Onboarding Fix | v1.1 | 0/0 | Not started | - |
| 14. Typography & Hebrew Localization | v1.1 | 1/1 | Complete | 2026-03-27 |
| 15. Icons Migration | v1.1 | 0/3 | Not started | - |
| 16. CSS & Interaction Polish | v1.1 | 0/0 | Not started | - |
| 17. Loading & Reveal Animations | v1.1 | 0/0 | Not started | - |
| 18. Tarot Card Library | v1.2 | 4/4 | Complete | 2026-03-28 |
| 19. Astrology Knowledge Base | v1.2 | 2/2 | Complete | 2026-03-29 |
| 20. Dream & Blog Content | v1.2 | 3/3 | Complete | 2026-03-29 |
| 21. Prompt Enrichment & Soul | v1.2 | 4/4 | Complete | 2026-03-29 |
| 22. Accessibility Foundation | v1.3 | 1/2 | In Progress|  |
| 23. Floating Coach & Bottom Tabs | v1.3 | 2/3 | In Progress|  |
| 24. Atmospheric Depth Sweep | v1.3 | 2/3 | In Progress|  |
| 25. Coach Intelligence & Sidebar Polish | v1.3 | 2/2 | Complete   | 2026-03-30 |
