# Requirements: MystiQor

**Defined:** 2026-04-07
**Core Value:** ניתוח אישי מיסטי מקיף שמחבר בין כל הכלים עם AI שמסנתז תובנות אחודות

## v1.5 Requirements

### Stability

- [ ] **STAB-01**: בדיקת מכסת שימוש וסטטוס מנוי לפני כל קריאת LLM — משתמש שעבר מכסה או עם מנוי לא פעיל מקבל הודעה ברורה ולא צורך OpenAI
- [ ] **STAB-02**: timeout של 9 שניות + retry עם backoff (2 ניסיונות) על קריאות OpenAI — שגיאות זמניות לא מפילות ניתוח
- [ ] **STAB-03**: שגיאות OpenAI מתורגמות להודעות עבריות ברורות למשתמש — לא "rate_limit_exceeded" גולמי
- [ ] **STAB-04**: ולידציית תגובת LLM עם Zod Schema בכלי tarot, palmistry, dream — תגובה מעוותת לא מגיעה למשתמש
- [ ] **STAB-05**: כל insert לDB נבדק לשגיאה — ניתוח שלא נשמר מדווח למשתמש במקום להיעלם בשקט

### Accessibility

- [ ] **A11Y-01**: כל margins/paddings ב-RTL משתמשים ב-ms/me/ps/pe — לא ml/mr/pl/pr
- [ ] **A11Y-02**: כל טקסט משני עומד ב-WCAG AA contrast (4.5:1) — לא opacity-40/60 על רקע כהה
- [ ] **A11Y-03**: כל כפתור, טאב ואלמנט אינטראקטיבי כולל aria-label בעברית

### UX

- [ ] **UX-01**: empty state ברור עם CTA בדפי קואצ', מטרות והיסטוריה — לא מסך ריק
- [ ] **UX-02**: טפסים מתגלגלים לעמודה אחת במובייל + context של קואצ' מוגבל ל-10 הודעות אחרונות

## Out of Scope

| Feature | Reason |
|---------|--------|
| Daily insights cron implementation | דורש prompt engineering נפרד — phase עתידי |
| Drawing AI vision analysis | דורש אינטגרציית Vision API — phase עתידי |
| Coach streaming (SSE) | שינוי ארכיטקטוני — phase עתידי |
| Test suite | אין תשתית בדיקות — יוזמה נפרדת |
| Icon library consolidation (Phosphor↔Lucide) | לא שבור, רק לא אחיד — לא חוסם |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAB-01 | Phase 31 | Pending |
| STAB-02 | Phase 31 | Pending |
| STAB-03 | Phase 31 | Pending |
| STAB-04 | Phase 31 | Pending |
| STAB-05 | Phase 31 | Pending |
| A11Y-01 | Phase 32 | Pending |
| A11Y-02 | Phase 32 | Pending |
| A11Y-03 | Phase 32 | Pending |
| UX-01 | Phase 32 | Pending |
| UX-02 | Phase 32 | Pending |

**Coverage:**
- v1.5 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0

---
*Requirements defined: 2026-04-07 | Traceability updated: 2026-04-07*
