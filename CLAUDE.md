# CLAUDE.md — Reverse Engineering & Production Rebuild

## Mission
מערכת קיימת שנבנתה ב-BASE44 נמצאת בריפו הזה.
המשימה: הנדסה לאחור מלאה → בנייה מחדש כמערכת production-grade.
שמור כל לוגיקה עסקית שעובדת. שפר את כל השאר. בנה מחדש מה שחסר.

## Target Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode, zero `any`, zero `@ts-ignore`)
- **Database:** Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query (server state) + Zustand (client state)
- **Forms:** React Hook Form + Zod validation
- **Deployment:** Vercel

## Directory Structure
```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Protected routes (require login)
│   ├── (public)/            # Public routes
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout (RTL, theme, providers)
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── forms/               # Form components with Zod
│   ├── layouts/             # Layout shells (sidebar, header, etc.)
│   └── features/            # Feature-specific components
├── lib/
│   ├── supabase/            # client.ts + server.ts + middleware.ts
│   ├── utils/               # Helpers + formatters
│   ├── validations/         # Zod schemas (shared client+server)
│   └── constants/           # App-wide constants
├── hooks/                   # Custom React hooks
├── types/                   # Global TypeScript types + DB generated types
├── stores/                  # Zustand stores
└── services/                # Business logic layer (typed, tested)
```

## Code Standards
- TypeScript strict — no `any`, no `@ts-ignore`, no `as unknown as`
- Every function — JSDoc comment in Hebrew explaining what + why
- Every component — typed Props interface, never inline types
- Every API route — Zod input validation + typed response
- Every DB query — through typed service layer, never raw SQL in components
- Every form — React Hook Form + Zod schema + proper error display
- Error handling — try/catch with typed errors + user-facing toast/message
- File max — 300 lines. Over 300 = split into smaller modules
- Naming — camelCase functions, PascalCase components, UPPER_SNAKE constants
- Imports — absolute paths with @/ prefix, organized: external → internal → types
- No console.log in production code — use proper logger or remove

## Security
- RLS policies on EVERY Supabase table — no exceptions
- Server-side validation on ALL mutations — never trust client
- No secrets in client code — all sensitive values in env + server only
- Auth check on every protected API route
- Input sanitization — XSS prevention on all user-generated content
- File uploads — type + size validation, virus scan if applicable
- Rate limiting on sensitive endpoints (login, register, reset password)

## RTL & Hebrew
- `dir="rtl"` on root layout
- Tailwind RTL plugin enabled
- All alignment: `start`/`end` — never `left`/`right`
- Hebrew labels, error messages, placeholders, toasts
- Hebrew comments and documentation in code
- Date formatting: Israeli format (DD/MM/YYYY)
- Currency: ₪ (NIS) where applicable

## Performance
- Dynamic imports for heavy components: `next/dynamic`
- Image optimization: `next/image` for all images
- React Query caching — staleTime + gcTime configured per entity
- No N+1 queries — use joins or batch fetches
- Pagination on all list views — never load unbounded data
- Bundle analysis — keep initial JS < 200KB

## Migration Decision Rules
- 🟢 **KEEP** (score 40-50): Copy logic → convert to TS → add types → verify
- 🟡 **IMPROVE** (score 25-39): Take logic → refactor → add types + validation + error handling
- 🔴 **REBUILD** (score 0-24): Learn from logic → build from scratch per PRD
- ⚠️ NEVER delete business logic without explicit user approval
- ⚠️ ALWAYS document what was kept/changed in migration notes

---

## 📊 Scoring System — MANDATORY

Score every action. Below threshold = stop and fix. No exceptions.

### Scan Score (per source file) — out of 50
| Criterion | /10 | What to evaluate |
|---|---|---|
| Readability | _ | Names, structure, comments |
| Logic Quality | _ | Correctness, efficiency, bugs |
| Reusability | _ | Can it transfer to new stack? |
| Security | _ | Validation, sanitization, auth |
| Error Handling | _ | try/catch, edge cases, null checks |
| **TOTAL** | **/50** | **40+ = 🟢 KEEP · 25-39 = 🟡 IMPROVE · <25 = 🔴 REBUILD** |

### Architecture Score — out of 100 (threshold: 80)
| Criterion | /10 | Threshold |
|---|---|---|
| Separation of Concerns | _ | 8 |
| Type Safety | _ | 9 |
| Security Design | _ | 8 |
| Scalability | _ | 7 |
| Developer Experience | _ | 7 |
| Data Model | _ | 8 |
| Error Strategy | _ | 8 |
| Performance Design | _ | 7 |
| RTL/Hebrew | _ | 9 |
| Migration Path | _ | 7 |
| **TOTAL** | **/100** | **≥80 to proceed** |

### File Score (per new file) — out of 100 (threshold: 78%)
| Criterion | /10 | Threshold |
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
| **TOTAL** | **/100** | **≥78% (skip N/A criteria, recalculate)** |

### Phase Score — out of 60 (threshold: 52)
| Criterion | /10 | Threshold |
|---|---|---|
| Completeness | _ | 9 |
| Build Passes (0 errors) | _ | 10 |
| No Regressions | _ | 9 |
| Code Quality Average | _ | 8 |
| Gems Preserved | _ | 10 |
| Standards Compliance | _ | 8 |
| **TOTAL** | **/60** | **≥52 to proceed** |

### Final Score — out of 100 (threshold: 85)
| Criterion | /pts | Threshold |
|---|---|---|
| Feature Parity | /15 | 13 |
| Code Quality | /15 | 12 |
| Type Safety | /10 | 9 |
| Security | /10 | 9 |
| Performance | /10 | 8 |
| UX/UI | /10 | 8 |
| Error Handling | /10 | 8 |
| Documentation | /10 | 7 |
| Build Health | /5 | 5 |
| Gems Migration | /5 | 5 |
| **TOTAL** | **/100** | **≥85 = production ready** |

### Scoring Rules
1. Score is MANDATORY — every file, every phase, every decision
2. Below threshold = STOP → FIX → RE-SCORE
3. Never round up — 7.4 is 7
4. Be brutally honest — a real low score beats a fake high score
5. Show scorecard to user with explanation for each criterion

---

## 📁 Project Documents
| File | Created In | Purpose |
|---|---|---|
| `01_CODEBASE_MAP.md` | Step 1 | Full inventory of existing code |
| `02_REVERSE_ENGINEERING.md` | Step 2 | Feature analysis + user flows |
| `02b_GEMS.md` | Step 2 | Excellent code to preserve |
| `03_ARCHITECTURE.md` | Step 3 | New system design |
| `04_PRD.md` | Step 4 | Full product requirements |
| `05_GSD_BUILD_BRIEF.md` | Step 5 | Build plan with file order |
| `PROGRESS.md` | Step 6+ | Running build status |
| `07_MIGRATION_LOG.md` | Step 7 | Data migration results |
| `08_QA_REPORT.md` | Step 8 | Final quality report |

---

## Recovery
If context is lost mid-project, read these files in order:
1. This CLAUDE.md
2. PROGRESS.md
3. 05_GSD_BUILD_BRIEF.md
4. 02b_GEMS.md
Then continue from the last documented point.
