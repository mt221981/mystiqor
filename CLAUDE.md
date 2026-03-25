# CLAUDE.md — השלמה ודיוק מערכת קיימת עם GSD

## Mission
בריפו הזה יש מערכת **בנויה ועובדת** שנבנתה ב-BASE44.
היא **לא מתחילה מאפס**. יש קוד, יש מסכים, יש לוגיקה, יש DB.

המשימה שלך:
1. **להבין** — מה יש, מה עובד, מה חסר, מה שבור
2. **להשלים** — לסיים מה שלא גמור
3. **לדייק** — לתקן, לחזק types, validation, error handling
4. **לסיים** — להביא לרמת production עם GSD

**אתה לא בונה מחדש. אתה משלים ומדייק מערכת קיימת.**
- קוד שעובד — **לא נוגעים בו** אלא אם חייבים
- קוד שכמעט עובד — **מתקנים ומשלימים**
- קוד שחסר — **בונים לפי הקיים**, לא ממציאים מחדש
- קוד מעולה — **משתמשים בו כמו שהוא**, מוסיפים types אם חסר

---

## Target Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode, zero `any`, zero `@ts-ignore`)
- **Database:** Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query (server) + Zustand (client)
- **Forms:** React Hook Form + Zod validation
- **Deployment:** Vercel

## Directory Structure
```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Protected routes
│   ├── (public)/            # Public routes
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout (RTL, theme, providers)
├── components/
│   ├── ui/                  # shadcn/ui base
│   ├── forms/               # Form components + Zod
│   ├── layouts/             # Layout shells
│   └── features/            # Feature-specific
├── lib/
│   ├── supabase/            # client.ts + server.ts + middleware.ts
│   ├── utils/               # Helpers
│   ├── validations/         # Zod schemas
│   └── constants/           # Constants
├── hooks/                   # Custom hooks
├── types/                   # TypeScript types
├── stores/                  # Zustand stores
└── services/                # Business logic layer
```

## Code Standards
- TypeScript strict — no `any`, no `@ts-ignore`
- Every function — JSDoc in Hebrew
- Every component — typed Props interface
- Every API route — Zod input validation
- Every DB query — through typed service layer
- Every form — React Hook Form + Zod + error display
- Error handling — try/catch + typed errors + user feedback
- Max 300 lines per file
- Naming — camelCase functions, PascalCase components, UPPER_SNAKE constants
- Imports — absolute @/ paths

## Security
- RLS policies on EVERY Supabase table
- Server-side validation on ALL mutations
- No secrets in client code
- Auth check on every protected route
- Input sanitization for XSS
- Rate limiting on sensitive endpoints

## RTL & Hebrew
- `dir="rtl"` on root layout
- `start`/`end` — never `left`/`right`
- Hebrew labels, errors, placeholders, toasts
- Hebrew code comments
- Date: DD/MM/YYYY · Currency: ₪

## Performance
- `next/dynamic` for heavy components
- `next/image` for all images
- React Query caching per entity
- No N+1 queries
- Pagination on all lists

---

## 📊 Scoring System — MANDATORY

### Audit Score — לכל קובץ/פיצ'ר קיים (מה מצבו?)

| קריטריון | /10 | הסבר |
|---|---|---|
| **Completeness** | _ | כמה מוכן? חסרים חלקים? |
| **Correctness** | _ | עובד נכון? באגים? |
| **Type Safety** | _ | TS types, interfaces, no any |
| **Error Handling** | _ | try/catch, edge cases, feedback |
| **Security** | _ | validation, auth, RLS |
| **TOTAL** | **/50** | |

**החלטה אוטומטית:**
- **45-50** → ✅ **DONE** — מוכן. לא נוגעים.
- **35-44** → 🔧 **REFINE** — עובד, צריך דיוק (types, validation, errors)
- **20-34** → 🔨 **COMPLETE** — חצי מוכן, צריך השלמה
- **0-19** → 🆕 **BUILD** — חסר או שבור לגמרי

**פורמט חובה:**
```
📄 [path/to/file]
├── Completeness:    8/10 — UI מוכן, חסר pagination
├── Correctness:     7/10 — באג בסינון תאריכים
├── Type Safety:     4/10 — הכל any
├── Error Handling:  3/10 — אין try/catch
├── Security:        5/10 — חסר RLS
├── TOTAL:           27/50
├── STATUS:          🔨 COMPLETE
└── TASK:            הוסף types, תקן סינון, הוסף error handling + RLS
```

### File Score — לכל קובץ שנערך/נוצר (threshold: 78%)

| קריטריון | /10 | סף |
|---|---|---|
| TypeScript | _ | 9 |
| Error Handling | _ | 8 |
| Validation | _ | 8 |
| Documentation | _ | 7 |
| Clean Code | _ | 8 |
| Security | _ | 8 |
| Performance | _ | 7 |
| Accessibility | _ | 7 |
| RTL | _ | 9 |
| Edge Cases | _ | 7 |
| **TOTAL** | **/100** | **≥78% (skip N/A, recalculate)** |

### Phase Score — בסוף כל phase (threshold: 52/60)

| קריטריון | /10 | סף |
|---|---|---|
| Phase Goals Met | _ | 9 |
| Build Passes (0 errors) | _ | 10 |
| No Regressions | _ | 9 |
| Code Quality Average | _ | 8 |
| Existing Code Preserved | _ | 10 |
| Standards Compliance | _ | 8 |
| **TOTAL** | **/60** | **≥52** |

### Final Score (threshold: 85/100)

| קריטריון | /pts | סף |
|---|---|---|
| Feature Completeness | /15 | 13 |
| Code Quality | /15 | 12 |
| Type Safety | /10 | 9 |
| Security | /10 | 9 |
| Performance | /10 | 8 |
| UX/UI | /10 | 8 |
| Error Handling | /10 | 8 |
| Documentation | /10 | 7 |
| Build Health | /5 | 5 |
| Working Code Preserved | /5 | 5 |
| **TOTAL** | **/100** | **≥85 = production ready** |

### Scoring Rules
1. Score MANDATORY — every file, every phase
2. Below threshold = STOP → FIX → RE-SCORE
3. Never round up
4. Honest scores only
5. **NEVER break working code to chase a higher score**
6. **NEVER rewrite something that already works**

---

## Project Documents
| File | Step | Purpose |
|---|---|---|
| `01_SYSTEM_AUDIT.md` | 1 | מה קיים, מה עובד, מה חסר, מה שבור |
| `02_COMPLETION_PLAN.md` | 2 | בדיוק מה צריך לעשות |
| `03_GSD_PHASES.md` | 3 | תוכנית GSD מפוזרת עם סדר קבצים |
| `PROGRESS.md` | 4+ | סטטוס שוטף |
| `QA_REPORT.md` | סיום | דוח איכות סופי |

## Recovery
If context lost, read in order:
1. This CLAUDE.md → 2. PROGRESS.md → 3. 03_GSD_PHASES.md
Continue from last documented point.
