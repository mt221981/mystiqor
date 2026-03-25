# Requirements — v1.1 UI Polish

## Icons Migration
- [ ] **ICON-01**: כל 16 עמודי הכלים משתמשים באייקוני react-icons/gi תמטיים במקום lucide-react
- [ ] **ICON-02**: StatCards, DailyInsightCard, PeriodSelector משתמשים באייקונים מיסטיים
- [ ] **ICON-03**: MobileNav ו-Header מעודכנים עם אייקוני react-icons/gi תואמים ל-Sidebar
- [ ] **ICON-04**: EmptyState, ErrorBoundary, LoadingSpinner משתמשים באייקונים מיסטיים
- [ ] **ICON-05**: PageHeader icon slots בכל העמודים מקבלים אייקוני react-icons/gi

## CSS Adoption
- [ ] **CSS-01**: GlassCard מציע variant `mystic` עם class mystic-card ו-variant `gold` עם mystic-card-gold
- [ ] **CSS-02**: NebulaButton מציע variant `gold` עם gold-glow shadow
- [ ] **CSS-03**: כל כרטיסי הכלים בעמודי הכלים משתמשים ב-mystic-hover לאפקט hover
- [ ] **CSS-04**: text-gradient-gold מיושם בכותרות ראשיות (דשבורד, כלים, פרופיל)

## Onboarding Fix
- [ ] **ONB-01**: OnboardingWizard מרנדר ומציג את שלב 1 (מידע אישי) לאחר התחברות
- [ ] **ONB-02**: משתמש חדש יכול להשלים את כל 4 השלבים ולהגיע ל-dashboard

## Animations
- [ ] **ANIM-01**: Skeleton loading מוחלף ב-shimmer מיסטי (purple gradient sweep) בכל מקום
- [ ] **ANIM-02**: תוצאות ניתוח מופיעות עם אנימציית progressive reveal (staggered fade-in)
- [ ] **ANIM-03**: mystic-hover מיושם על כל אלמנט אינטראקטיבי (כרטיסים, כפתורים)

## Typography & Localization
- [ ] **TYPO-01**: פונט Heebo (עברי) טעון כ-webfont וקשור ל-font-body fallback
- [ ] **TYPO-02**: "Human Design" → "עיצוב אנושי", "Solar Return" → "חזרת שמש", "HTP + Koppitz" → "בית-עץ-אדם" בכל ה-UI

## Traceability

| REQ | Phase | Status |
|-----|-------|--------|
| ONB-01 | Phase 13 | Pending |
| ONB-02 | Phase 13 | Pending |
| TYPO-01 | Phase 14 | Pending |
| TYPO-02 | Phase 14 | Pending |
| ICON-01 | Phase 15 | Pending |
| ICON-02 | Phase 15 | Pending |
| ICON-03 | Phase 15 | Pending |
| ICON-04 | Phase 15 | Pending |
| ICON-05 | Phase 15 | Pending |
| CSS-01 | Phase 16 | Pending |
| CSS-02 | Phase 16 | Pending |
| CSS-03 | Phase 16 | Pending |
| CSS-04 | Phase 16 | Pending |
| ANIM-03 | Phase 16 | Pending |
| ANIM-01 | Phase 17 | Pending |
| ANIM-02 | Phase 17 | Pending |
