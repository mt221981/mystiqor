# Requirements: MystiQor

**Defined:** 2026-04-07
**Core Value:** ניתוח אישי מיסטי מקיף שמחבר בין כל הכלים עם AI שמסנתז תובנות אחודות

## v1.6 Requirements

### Profile

- [ ] **PROF-01**: טפסי כלים ממולאים אוטומטית מפרופיל המשתמש — שם, תאריך לידה, שעת לידה, מיקום. המשתמש יכול לערוך לפני שליחה

### Numerology

- [ ] **NUM-01**: תוצאות נומרולוגיה מציגות לכל מספר: אות עברית דקורטיבית, שם ספירה, כותרת מיסטית, 5 מילות מפתח, קשר כוכבי — מתוך numerology-meanings.ts
- [ ] **NUM-02**: סינתזת AI עמוקה יותר (3000 tokens) מוצגת כמגילה מסכמת אחרי הכרטיסים הויזואליים

### Journey

- [ ] **JOUR-01**: קטגוריית "מסע אישי" מורמת בסיידבר — מקום 2 (מעל "כלים נוספים")
- [ ] **JOUR-02**: ויג'ט "המסע שלי" בדשבורד — שם מסע פעיל, סרגל התקדמות, צעד הבא, כפתור "המשך מסע". אם אין מסע: כפתור "התחל מסע אישי"
- [ ] **JOUR-03**: עמוד מסע עצמאי ב-/journey — נגיש ישירות מסיידבר ומדשבורד, לא רק דרך טאב בקואצ'

## Out of Scope

| Feature | Reason |
|---------|--------|
| גרפיקת קלפי טארוט אמיתיים | דורש 78 תמונות + אנימציות — milestone נפרד |
| Coach streaming (SSE) | שינוי ארכיטקטוני — milestone עתידי |
| Daily insights cron implementation | דורש prompt engineering — milestone עתידי |
| עיצוב מחדש של עץ החיים ויזואלי | מורכבות גבוהה — SVG אינטראקטיבי, milestone עתידי |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROF-01 | Phase 33 | Pending |
| NUM-01 | Phase 34 | Pending |
| NUM-02 | Phase 34 | Pending |
| JOUR-01 | Phase 35 | Pending |
| JOUR-02 | Phase 35 | Pending |
| JOUR-03 | Phase 35 | Pending |

**Coverage:**
- v1.6 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0

---
*Requirements defined: 2026-04-07*
