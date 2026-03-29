# Requirements — v1.3 Mystical UX & Coach Prominence

**Defined:** 2026-03-29
**Core Value:** ניתוח אישי מיסטי מקיף שמחבר בין כל הכלים — אסטרולוגיה, נומרולוגיה, ציורים, גרפולוגיה — עם AI שמסנתז את הכל לתובנות אישיות אחודות.

## v1.3 Requirements

### ניגודיות וקריאות (Contrast)
- [ ] **CONTRAST-01**: כל טקסט משני (variant, muted) קריא על רקע כהה עם יחס ניגודיות WCAG AA (4.5:1 לפחות)
- [ ] **CONTRAST-02**: כותרות ותוצאות חשובות מציגות זוהר טקסט (text-shadow) סגול/זהב שנותן תחושה שהטקסט "מאיר"
- [ ] **CONTRAST-03**: משתמשים שמבקשים prefers-reduced-motion מקבלים חוויה ללא אנימציות
- [ ] **CONTRAST-04**: סקאלת z-index גלובלית מוגדרת (header, nav, floating chat, modals) למניעת התנגשויות

### אווירה מיסטית (Atmosphere)
- [ ] **ATMOS-01**: כל עמוד כלי מציג כותרת מיסטית אחידה (StandardSectionHeader) עם סמל, זוהר, וכתובית בעברית
- [ ] **ATMOS-02**: כניסה לכל עמוד מציגה אנימציית fade+drift (600ms) שנותנת תחושת "הזמנה"
- [ ] **ATMOS-03**: כל עמוד כלי משתמש באייקונים מיסטיים (react-icons/gi) במקום אייקוני Lucide גנריים בכותרות
- [ ] **ATMOS-04**: מצבי טעינה מציגים ביטויים מיסטיים בעברית לפי הקשר ("קורא את הכוכבים...", "מפענח את הדפוסים...") במקום "טוען..."

### מאמן AI בולט (Coach)
- [ ] **COACH-01**: בועה צפה זוהרת מופיעה בכל עמוד מאומת (מוסתרת בעמוד /coach) ופותחת פאנל צ'אט מיני
- [ ] **COACH-02**: הבועה מציגה אנימציית נשימה (הגדלה/הקטנה עדינה במחזור 4 שניות) שנותנת תחושת חיים
- [ ] **COACH-03**: פתיחת הפאנל בעמוד כלי מציגה הודעת פתיחה חכמה ("ראיתי שקיבלת מפת לידה, רוצה לחקור יחד?")
- [ ] **COACH-04**: המאמן מקבל הקשר דינמי עדכני בכל הודעה (ניתוחים אחרונים, מצב רוח, יעדים) — לא רק בתחילת שיחה

### ניווט פשוט (Navigation)
- [ ] **NAV-01**: במובייל מוצגים 5 טאבים תחתונים (לוח בקרה, מאמן AI, תובנות יומיות, כלים, פרופיל) כניווט ראשי
- [ ] **NAV-02**: קטגוריות "אסטרולוגיה מתקדמת" ו"מתקדם" מאוחדות לתוך "כלים מיסטיים" + כפתור "עוד כלים" בסרגל הצד
- [ ] **NAV-03**: מצב פתיחת/סגירת קטגוריות בסרגל הצד נשמר ב-localStorage ולא מתאפס בכל טעינה

## Future Requirements (v1.4+)

### Coach Enhancements
- **COACH-F01**: סטרימינג צ'אט בזמן אמת (token by token) בפאנל הצף
- **COACH-F02**: תגי התראה על הודעות שלא נקראו על הבועה הצפה
- **COACH-F03**: עיצוב מחדש של עמוד /coach המלא

### Visual Enhancements
- **VIS-F01**: דף נחיתה אנימטיבי עם אפקט cosmic parallax
- **VIS-F02**: אנימציות particles מבוססות canvas (כוכבים, ניצוצות)

## Out of Scope

| Feature | Reason |
|---------|--------|
| שינוי פלטת צבעים | הפלטה הקיימת (סגול/לבנדר/זהב/cosmic-indigo) מבוססת ומותאמת |
| עיצוב מחדש של דף /coach | העמוד עובד — v1.3 מוסיפה גישה צפה, לא מחליפה |
| הסרת MobileNav | נשאר כניווט משני, הטאבים התחתונים מחליפים את ההמבורגר כראשי |
| הסרת פריטים מהסרגל | כל 47 הפריטים נשארים — רק ארגון מחדש של קטגוריות |
| סטרימינג צ'אט | דורש שינויי תשתית — נדחה ל-v1.4 |
| ספריות אנימציה חדשות | framer-motion כבר מותקנת, אין צורך בספריות נוספות |
| אנימציות רקע כבדות בעמודי כלים | בעיית ביצועים — אנימציות רקע רק בדשבורד ומאמן |

## Traceability

| REQ | Phase | Status |
|-----|-------|--------|
| CONTRAST-01 | Phase 22 | Pending |
| CONTRAST-02 | Phase 24 | Pending |
| CONTRAST-03 | Phase 22 | Pending |
| CONTRAST-04 | Phase 22 | Pending |
| ATMOS-01 | Phase 24 | Pending |
| ATMOS-02 | Phase 24 | Pending |
| ATMOS-03 | Phase 24 | Pending |
| ATMOS-04 | Phase 24 | Pending |
| COACH-01 | Phase 23 | Pending |
| COACH-02 | Phase 23 | Pending |
| COACH-03 | Phase 23 | Pending |
| COACH-04 | Phase 25 | Pending |
| NAV-01 | Phase 23 | Pending |
| NAV-02 | Phase 25 | Pending |
| NAV-03 | Phase 25 | Pending |

**Coverage:**
- v1.3 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 — traceability mapped to Phases 22-25*
