# 01_CODEBASE_MAP.md — MystiQor Full Codebase Inventory

> **תאריך סריקה:** 2026-03-20
> **מקור:** https://github.com/mt221981/mystiqor (BASE44 platform export)
> **סה"כ קבצים:** 293 | **סה"כ שורות:** 59,844

---

## 1. סקירה כללית

MystiQor היא פלטפורמה מיסטית-אישית המשלבת:
- **נומרולוגיה** (כולל גימטריה עברית)
- **אסטרולוגיה** (מפת לידה, Solar Return, טרנזיטים, סינסטרי)
- **גרפולוגיה** (ניתוח כתב יד)
- **ניתוח ציורים** (HTP — House-Tree-Person, Koppitz)
- **כירומנטיה** (ניתוח כף יד)
- **טארוט** (משיכת קלפים + פרשנות AI)
- **Human Design** (חישוב סוג, אסטרטגיה, סמכות)
- **ניתוח חלומות, תאימות, הנחיית קריירה**
- **AI Coach** (צ'אט מותאם אישית + מסלולי אימון)
- **מנוי + תשלומים** (Stripe integration)

**Stack נוכחי:** Vite + React 18 + React Router 6 + Base44 SDK + Tailwind + shadcn/ui
**Stack יעד:** Next.js 14+ App Router + TypeScript strict + Supabase + Tailwind + shadcn/ui

---

## 2. מבנה תיקיות

```
temp_source/
├── base44/functions/          # 34 serverless functions (TS)
│   ├── analyzeDocument/
│   ├── analyzeGoalProgress/
│   ├── askMysticTutor/
│   ├── calculateCompatibility/
│   ├── calculateHumanDesign/
│   ├── calculateNumerologyCompatibility/
│   ├── calculateSolarReturn/
│   ├── calculateTransits/
│   ├── cancelSubscription/
│   ├── cleanupDailyInsights/
│   ├── createCheckoutSession/
│   ├── findBestDays/
│   ├── generateAstrologyReading/
│   ├── generateCoachingJourney/
│   ├── generateDailyInsight/
│   ├── generateGoalRecommendations/
│   ├── generatePDF/
│   ├── generatePersonalizedJourney/
│   ├── generateWeeklyReport/
│   ├── geocodeLocation/
│   ├── getSubscriptionStatus/
│   ├── incrementUsage/
│   ├── interpretAstrology/
│   ├── interpretSolarReturn/
│   ├── interpretTransits/
│   ├── processDrawingFeatures/
│   ├── ruleEngine/
│   ├── saveFeatures/
│   ├── sendDailyInsights/
│   ├── sendPaymentFailedEmail/
│   ├── sendUsageLimitEmail/
│   ├── sendWelcomeEmail/
│   ├── stripeWebhook/
│   └── synthesizeMysticInsights/
├── src/
│   ├── api/                   # 1 file — Base44 client init
│   ├── components/            # 135 JSX components
│   │   ├── ui/               # 47 shadcn/ui base components
│   │   ├── AICoach/          # 3 chat sub-components
│   │   ├── dashboard/        # 1 BiorhythmChart
│   │   └── learning/         # 2 tutorial components
│   ├── hooks/                 # 1 hook (use-mobile)
│   ├── lib/                   # 6 core utilities
│   ├── pages/                 # 51 page components
│   └── utils/                 # 1 utility file
├── package.json               # 79 dependencies
├── vite.config.js
├── tailwind.config.js
├── components.json            # shadcn/ui config
├── eslint.config.js
├── jsconfig.json
├── postcss.config.js
└── index.html
```

---

## 3. Dependencies (package.json)

### Production Dependencies (68)
| Category | Package | Purpose |
|----------|---------|--------|
| **Core** | react 18.2, react-dom 18.2, react-router-dom 6.26 | UI framework + routing |
| **Base44** | @base44/sdk 0.8 | Backend platform SDK |
| **UI/Radix** | @radix-ui/* (20+ packages) | Headless UI primitives (shadcn/ui) |
| **State** | @tanstack/react-query 5.84 | Server state management |
| **Forms** | react-hook-form 7.54, zod 3.24, @hookform/resolvers | Form handling + validation |
| **Styling** | tailwindcss 3.4, tailwind-merge, class-variance-authority | CSS utilities |
| **Animation** | framer-motion 11.16 | Page/component animations |
| **Charts** | recharts 2.15 | Data visualization |
| **Payments** | @stripe/react-stripe-js, @stripe/stripe-js | Stripe checkout |
| **PDF** | jspdf, html2canvas | PDF generation |
| **Dates** | date-fns, moment | Date manipulation |
| **Utils** | lodash, clsx, lucide-react, sonner | Misc utilities |
| **Rich Text** | @tiptap/* | Rich text editor |
| **DnD** | @dnd-kit/* | Drag and drop |
| **Markdown** | react-markdown, remark-gfm | Markdown rendering |

### Dev Dependencies (11)
| Package | Purpose |
|---------|--------|
| typescript, @types/react, @types/react-dom | TypeScript support |
| vite 6, @vitejs/plugin-react | Build tool |
| eslint, eslint-plugin-react-* | Linting |
| autoprefixer, postcss | CSS processing |

### Missing (needed for production)
- **Testing:** No vitest, no @testing-library
- **Auth:** No Supabase client (currently Base44)
- **SSR:** No Next.js (currently Vite SPA)

---

## 4. Database Entities (via Base44 SDK)

| Entity | Purpose | Key Fields (observed) |
|--------|---------|----------------------|
| **UserProfile** | פרופיל משתמש | name, birth_date, birth_time, birth_place, disciplines, goals |
| **Analysis** | כל ניתוח שנשמר | tool_type, results, created_date, user_id |
| **UserGoal** | יעדים אישיים | title, category, status, progress, target_date |
| **MoodEntry** | מעקב מצב רוח | mood_score, notes, date |
| **DailyInsight** | תובנה יומית | title, content, focus_area, tarot, confidence |
| **CoachingJourney** | מסלולי אימון AI | title, steps[], focus_area, status |
| **Subscription** | מנוי + תשלום | plan, status, analyses_used, analyses_limit, stripe_id |
| **PaymentHistory** | היסטוריית תשלומים | amount, status, stripe_event |
| **UserReminder** | תזכורות | type, scheduled_date, message |
| **AstrologyReading** | קריאות אסטרולוגיות | reading_type, content, calculation_data |
| **AstrologyCalculation** | חישובים אסטרולוגיים | planets, houses, aspects |
| **LearningProgress** | התקדמות בלמידה | topic, completed, quiz_score |
| **MysticSynthesis** | סינתזה כוללנית | personality_profile, predictive_insights |
| **AnalyticsEvent** | אירועי אנליטיקס | event_type, page, timestamp |
| **Feature** | תכונות ניתוח | analysis_id, tool_type, features[] |
| **Rulebook** | כללי מנוע חוקים | conditions, insights, tool_type |

---

## 5. External APIs & Integrations

| Service | Usage | Files |
|---------|-------|-------|
| **Stripe** | Subscriptions, checkout, webhooks | createCheckoutSession, cancelSubscription, stripeWebhook, getSubscriptionStatus |
| **OpenStreetMap Nominatim** | Geocoding (location → lat/lon) | geocodeLocation, Astrology.jsx |
| **Base44 Core.InvokeLLM** | AI text generation (all analysis) | 20+ functions |
| **Base44 SendEmail** | Email notifications | sendDailyInsights, sendWelcomeEmail, sendPaymentFailedEmail, sendUsageLimitEmail |
| **Base44 ExtractDataFromUploadedFile** | Document text extraction | analyzeDocument |
| **Base44 Agents** | Chat conversations | AICoach, AstrologyTutor, DrawingTutor |

---

## 6. טבלת קבצים — Serverless Functions (34 files)

| # | Function | שורות | Readability | Logic | Reusability | Security | Errors | **SCAN** | החלטה | הערות |
|---|----------|-------|-------------|-------|-------------|----------|--------|----------|--------|-------|
| 1 | generateAstrologyReading | 1731 | 6 | 8 | 6 | 6 | 7 | **33/50** | 🟡 | קובץ ענק — לפרק. חישובים טובים |
| 2 | processDrawingFeatures | 1012 | 7 | 9 | 7 | 7 | 7 | **37/50** | 🟡 | מצוין מקצועית (Machover, Koppitz). לפרק לקטנים |
| 3 | calculateSolarReturn | 344 | 8 | 10 | 8 | 7 | 8 | **41/50** | 🟢 | **GEM** — VSOP87 + Placidus. חישובים מדויקים |
| 4 | generateCoachingJourney | 339 | 8 | 8 | 7 | 7 | 7 | **37/50** | 🟡 | לוגיקה מצוינת. שיפור validation |
| 5 | interpretAstrology | 366 | 8 | 9 | 7 | 7 | 7 | **38/50** | 🟡 | **GEM** — prompt engineering מעולה. v6.0 |
| 6 | interpretSolarReturn | 326 | 8 | 9 | 7 | 7 | 7 | **38/50** | 🟡 | Perry, Volguine, Hand references |
| 7 | generatePDF | 394 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Hebrew RTL support. jsPDF |
| 8 | analyzeGoalProgress | 282 | 8 | 8 | 7 | 7 | 7 | **37/50** | 🟡 | יוצר reminders אוטומטית |
| 9 | analyzeDocument | 264 | 8 | 8 | 7 | 7 | 8 | **38/50** | 🟡 | Validation טוב. structured prompts |
| 10 | interpretTransits | 253 | 8 | 8 | 7 | 7 | 7 | **37/50** | 🟡 | Robert Hand methodology |
| 11 | calculateNumerologyCompatibility | 229 | 8 | 9 | 8 | 7 | 7 | **39/50** | 🟡 | **GEM** — גימטריה עברית. life path |
| 12 | generateDailyInsight | 182 | 7 | 7 | 6 | 6 | 5 | **31/50** | 🟡 | Silent fail on transits. Tarot hardcoded |
| 13 | findBestDays | 186 | 7 | 7 | 7 | 6 | 6 | **33/50** | 🟡 | Electional astrology. Heuristic formulas |
| 14 | calculateCompatibility | 177 | 7 | 6 | 6 | 6 | 6 | **31/50** | 🟡 | Hardcoded matrix. LLM-dependent |
| 15 | sendUsageLimitEmail | 171 | 8 | 7 | 7 | 7 | 7 | **36/50** | 🟡 | HTML email template. progress bar |
| 16 | generatePersonalizedJourney | 169 | 8 | 7 | 7 | 7 | 7 | **36/50** | 🟡 | Journey types flexible |
| 17 | sendWelcomeEmail | 167 | 8 | 7 | 7 | 7 | 7 | **36/50** | 🟡 | Professional email. plan-specific |
| 18 | ruleEngine | 157 | 8 | 8 | 8 | 7 | 7 | **38/50** | 🟡 | Condition evaluation well-structured |
| 19 | sendDailyInsights | 146 | 7 | 7 | 6 | 4 | 6 | **30/50** | 🟡 | Secret key optional = security gap |
| 20 | sendPaymentFailedEmail | 143 | 8 | 7 | 7 | 7 | 7 | **36/50** | 🟡 | Professional email template |
| 21 | stripeWebhook | 140 | 8 | 8 | 7 | 8 | 7 | **38/50** | 🟡 | **GEM** — Proper signature verify |
| 22 | synthesizeMysticInsights | 134 | 8 | 8 | 7 | 7 | 7 | **37/50** | 🟡 | Multi-source synthesis |
| 23 | generateGoalRecommendations | 129 | 7 | 7 | 7 | 7 | 7 | **35/50** | 🟡 | Action plan structure |
| 24 | generateWeeklyReport | 128 | 7 | 6 | 6 | 6 | 6 | **31/50** | 🟡 | Missing date range filter |
| 25 | calculateHumanDesign | 117 | 6 | 4 | 5 | 5 | 5 | **25/50** | 🟡 | LLM-simulated, no real ephemeris |
| 26 | createCheckoutSession | 113 | 8 | 8 | 7 | 7 | 7 | **37/50** | 🟡 | Stripe flow proper. Hardcoded plans |
| 27 | calculateTransits | 102 | 6 | 3 | 4 | 5 | 5 | **23/50** | 🔴 | **MOCKED DATA** — not real calculations |
| 28 | getSubscriptionStatus | 90 | 8 | 8 | 7 | 7 | 7 | **37/50** | 🟡 | Auto-creates free plan. Monthly reset |
| 29 | geocodeLocation | 77 | 8 | 7 | 7 | 6 | 7 | **35/50** | 🟡 | Nominatim API. Israel timezone hardcoded |
| 30 | incrementUsage | 67 | 8 | 7 | 7 | 6 | 7 | **35/50** | 🟡 | Simple, effective |
| 31 | saveFeatures | 66 | 7 | 7 | 7 | 6 | 6 | **33/50** | 🟡 | Continues on error |
| 32 | cleanupDailyInsights | 62 | 6 | 5 | 5 | 3 | 5 | **24/50** | 🔴 | **DESTRUCTIVE** — deletes ALL records |
| 33 | cancelSubscription | 50 | 8 | 8 | 7 | 7 | 7 | **37/50** | 🟡 | Proper Stripe cancel at period end |
| 34 | askMysticTutor | 40 | 6 | 5 | 5 | 5 | 4 | **25/50** | 🟡 | Minimal. console.log. No validation |

---

## 7. טבלת קבצים — Pages (51 files)

| # | Page | שורות | Readability | Logic | Reusability | Security | Errors | **SCAN** | החלטה | הערות |
|---|------|-------|-------------|-------|-------------|----------|--------|----------|--------|-------|
| 1 | Numerology | 1332 | 6 | 8 | 5 | 6 | 6 | **31/50** | 🟡 | ענק — לפרק. לוגיקה טובה |
| 2 | Graphology | 936 | 6 | 8 | 5 | 6 | 6 | **31/50** | 🟡 | ענק — לפרק |
| 3 | Tarot | 916 | 6 | 7 | 5 | 6 | 6 | **30/50** | 🟡 | קלפים hardcoded |
| 4 | DrawingAnalysis | 905 | 7 | 8 | 5 | 6 | 7 | **33/50** | 🟡 | HTP analysis. לפרק |
| 5 | Synastry | 739 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | השוואת מפות |
| 6 | Palmistry | 739 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | ניתוח כף יד |
| 7 | AstrologyTutor | 728 | 6 | 7 | 5 | 6 | 5 | **29/50** | 🟡 | Duplicate code. Deep linking |
| 8 | Compatibility | 688 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | תאימות נומרולוגית+אסטרולוגית |
| 9 | DrawingTutor | 653 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | AI tutor for drawing |
| 10 | Astrology | 641 | 7 | 8 | 6 | 6 | 6 | **33/50** | 🟡 | Birth chart + geocoding |
| 11 | MyGoals | 586 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Goal management |
| 12 | UserSettings | 561 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | Settings page |
| 13 | AstrologyReadings | 558 | 7 | 7 | 6 | 6 | 7 | **33/50** | 🟡 | 8 reading types. READING_TYPES array |
| 14 | DocumentAnalyzer | 555 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | PDF/image analysis |
| 15 | EditProfile | 543 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | Profile edit form |
| 16 | AskQuestion | 511 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | **GEM** — forceToString utility |
| 17 | SolarReturn | 505 | 7 | 8 | 6 | 6 | 7 | **34/50** | 🟡 | Solar Return UI |
| 18 | ManageProfiles | 495 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | Guest profiles |
| 19 | Journal | 495 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Rich text journal |
| 20 | Transits | 484 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Transit analysis UI |
| 21 | DreamAnalysis | 467 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Dream interpretation |
| 22 | Onboarding | 467 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Multi-step onboarding |
| 23 | myanalyses | 467 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | History of analyses |
| 24 | MoodTracker | 449 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Mood logging + charts |
| 25 | RelationshipAnalysis | 422 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Relationship analysis |
| 26 | Dashboard | 421 | 8 | 7 | 6 | 6 | 7 | **34/50** | 🟡 | **GEM** — AnimatedCounter, skeleton |
| 27 | AICoach | 400 | 8 | 8 | 6 | 7 | 7 | **36/50** | 🟡 | Real-time chat + journeys |
| 28 | AnalyticsDashboard | 381 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | User analytics |
| 29 | Relationships | 382 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Relationship management |
| 30 | CompareAnalyses | 380 | 6 | 5 | 5 | 5 | 5 | **26/50** | 🟡 | Trend logic mismatch |
| 31 | Blog | 372 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | Hardcoded articles |
| 32 | TimingTools | 362 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Best timing analysis |
| 33 | CareerGuidance | 355 | 7 | 7 | 6 | 6 | 7 | **33/50** | 🟡 | Career recommendations |
| 34 | Notifications | 352 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Notification management |
| 35 | MysticSynthesis | 344 | 7 | 8 | 6 | 6 | 6 | **33/50** | 🟡 | Multi-tool synthesis |
| 36 | PersonalityAnalysis | 333 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Big Five + personality |
| 37 | AstroCalendar | 328 | 6 | 5 | 5 | 5 | 5 | **26/50** | 🟡 | **Mock data** — needs real source |
| 38 | Referrals | 324 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | Referral system |
| 39 | HumanDesign | 292 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | HD chart display |
| 40 | DailyInsights | 287 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Daily insight view |
| 41 | Home | 275 | 8 | 7 | 6 | 6 | 7 | **34/50** | 🟡 | **GEM** — Tool grid, FAB AI |
| 42 | UserProfile | 273 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Profile view |
| 43 | JourneyDashboard | 253 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | Coaching journey dashboard |
| 44 | ManageSubscription | 235 | 8 | 7 | 6 | 7 | 7 | **35/50** | 🟡 | **GEM** — statusConfig pattern |
| 45 | Pricing | 213 | 7 | 6 | 6 | 6 | 6 | **31/50** | 🟡 | Pricing page |
| 46 | Tutorials | 200 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | Tutorial list |
| 47 | TestStripe | 175 | 6 | 5 | 3 | 4 | 5 | **23/50** | 🔴 | Test page — delete |
| 48 | SubscriptionSuccess | 122 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | Success redirect |
| 49 | DailyForecast | 39 | 5 | 4 | 4 | 4 | 4 | **21/50** | 🔴 | Stub — nearly empty |
| 50 | SavedGraphologyInsights | 23 | 5 | 4 | 4 | 4 | 4 | **21/50** | 🔴 | Stub — redirect only |
| 51 | CompareDrawingAnalyses | 20 | 5 | 4 | 4 | 4 | 4 | **21/50** | 🔴 | Stub — redirect only |

---

## 8. טבלת קבצים — Components (88 custom + 47 shadcn/ui)

### Custom Components (top 40 by size)

| # | Component | שורות | Readability | Logic | Reusability | Security | Errors | **SCAN** | החלטה | הערות |
|---|-----------|-------|-------------|-------|-------------|----------|--------|----------|--------|-------|
| 1 | AstrologyReadingCard | 1206 | 6 | 8 | 5 | 6 | 6 | **31/50** | 🟡 | ענק — לפרק ל-5+ components |
| 2 | BirthChart | 922 | 7 | 9 | 6 | 6 | 7 | **35/50** | 🟡 | **GEM** — SVG zodiac circle. לפרק |
| 3 | QuantitativeDrawingMetrics | 813 | 7 | 8 | 6 | 6 | 7 | **34/50** | 🟡 | Koppitz + Jung. לפרק |
| 4 | AnnotatedDrawingViewer | 806 | 7 | 8 | 6 | 6 | 7 | **34/50** | 🟡 | Annotation overlay. Zoom controls |
| 5 | DrawingConceptCard | 626 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Concept library |
| 6 | OnboardingFlow | 535 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | 4-step wizard |
| 7 | DigitalCanvas | 475 | 7 | 8 | 7 | 6 | 6 | **34/50** | 🟡 | **GEM** — Canvas with pressure tracking |
| 8 | AdvancedDailyInsights | 431 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Premium insights generator |
| 9 | DrawingComparison | 409 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Radar chart comparison |
| 10 | ExplainableInsight | 407 | 8 | 8 | 7 | 6 | 7 | **36/50** | 🟡 | **GEM** — Provenance + confidence |
| 11 | AIAssistant | 389 | 7 | 7 | 6 | 5 | 6 | **31/50** | 🟡 | LLM prompt injection risk |
| 12 | AstrologyConceptCard | 375 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Concept library |
| 13 | GraphologyComparison | 360 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Radar chart comparison |
| 14 | ImageUploadGuide | 324 | 7 | 6 | 6 | 6 | 6 | **31/50** | 🟡 | Upload instructions |
| 15 | EnhancedAccessibility | 316 | 8 | 7 | 7 | 6 | 6 | **34/50** | 🟡 | **GEM** — ARIA, contrast checking |
| 16 | AnalysisJourney | 295 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Journey timeline |
| 17 | AISuggestionsWidget | 275 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | 7-day throttle |
| 18 | JourneyCard | 260 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Journey step display |
| 19 | GoalProgressWidget | 254 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Goals dashboard |
| 20 | AdvancedAICoach | 245 | 7 | 7 | 6 | 5 | 6 | **31/50** | 🟡 | Coach widget |
| 21 | GoalProgressModal | 236 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Goal update modal |
| 22 | AdvancedErrorBoundary | 221 | 8 | 8 | 7 | 6 | 8 | **37/50** | 🟡 | **GEM** — Auto-recovery |
| 23 | EnhancedPWA | 221 | 7 | 6 | 5 | 5 | 5 | **28/50** | 🟡 | PWA install prompt |
| 24 | IconGenerator | 219 | 6 | 6 | 5 | 5 | 5 | **27/50** | 🟡 | AI icon generation |
| 25 | NumerologySummaryCard | 217 | 7 | 7 | 7 | 6 | 6 | **33/50** | 🟡 | Number display |
| 26 | useSubscription | 215 | 8 | 8 | 8 | 7 | 7 | **38/50** | 🟡 | **GEM** — Subscription hook |
| 27 | GraphicFeaturesBreakdown | 214 | 7 | 7 | 6 | 6 | 6 | **32/50** | 🟡 | Drawing features |
| 28 | SavedInsights | 210 | 7 | 6 | 6 | 6 | 6 | **31/50** | 🟡 | Insights history |
| 29 | AdvancedAnimations | 208 | 8 | 7 | 8 | 7 | 7 | **37/50** | 🟡 | **GEM** — 20+ animation variants |
| 30 | CachedQuery | 194 | 8 | 8 | 8 | 7 | 7 | **38/50** | 🟡 | **GEM** — Query caching patterns |

### shadcn/ui Components (47 files) → 🟢 KEEP ALL
Standard shadcn/ui components — will be regenerated via CLI in Next.js project.
No scoring needed — these are library code.

### Small Utility Components (< 100 lines) → Summary

| Category | Count | Decision |
|----------|-------|----------|
| Loading states (Spinner, Skeleton, LazyLoad) | 6 | 🟡 IMPROVE → Use shadcn/ui Skeleton |
| Error boundaries (Error, Global, Query) | 4 | 🟡 IMPROVE → TypeScript + Next.js error.tsx |
| Empty states (3 variants) | 3 | 🔴 REBUILD → Consolidate to 1 |
| Toast (2 variants: Enhanced, Improved) | 2 | 🔴 REBUILD → Use sonner directly |
| Theme (Context, Provider, Toggle) | 3 | 🟡 IMPROVE → next-themes |
| Animation (Advanced, Enhanced, Micro) | 3 | 🟡 IMPROVE → Consolidate to 1 |
| Safe wrappers (Component, Image) | 2 | 🔴 REBUILD → Next.js handles |
| Share (ShareResults, SocialShare) | 2 | 🔴 REBUILD → Consolidate to 1 |

---

## 9. טבלת קבצים — Core / Lib / Config

| # | File | שורות | Readability | Logic | Reusability | Security | Errors | **SCAN** | החלטה | הערות |
|---|------|-------|-------------|-------|-------------|----------|--------|----------|--------|-------|
| 1 | Layout.jsx | 613 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | ענק — לפרק. RTL מצוין |
| 2 | pages.config.js | 163 | 7 | 6 | 4 | 5 | 5 | **27/50** | 🔴 | Base44 auto-generated → Next.js routing |
| 3 | AuthContext.jsx | 154 | 8 | 8 | 6 | 7 | 7 | **36/50** | 🟡 | **GEM** — Two-phase auth pattern |
| 4 | index.css | 87 | 8 | 7 | 7 | 7 | 7 | **36/50** | 🟡 | CSS variables. Clean |
| 5 | App.jsx | 82 | 7 | 7 | 5 | 6 | 6 | **31/50** | 🟡 | → Next.js layout.tsx |
| 6 | PageNotFound.jsx | 74 | 7 | 6 | 5 | 5 | 5 | **28/50** | 🟡 | Duplicate auth check |
| 7 | app-params.js | 54 | 8 | 7 | 5 | 7 | 6 | **33/50** | 🟡 | Base44-specific → delete |
| 8 | NavigationTracker.jsx | 41 | 7 | 6 | 5 | 6 | 6 | **30/50** | 🟡 | → Proper analytics |
| 9 | useDebounce.jsx | 38 | 8 | 8 | 8 | 7 | 7 | **38/50** | 🟡 | **GEM** — Debounce + throttle |
| 10 | use-mobile.jsx | 19 | 8 | 8 | 8 | 7 | 7 | **38/50** | 🟡 | Clean hook |
| 11 | base44Client.js | 14 | 7 | 6 | 3 | 5 | 5 | **26/50** | 🔴 | Base44 SDK → Supabase client |
| 12 | query-client.js | 10 | 7 | 6 | 6 | 6 | 5 | **30/50** | 🟡 | Missing staleTime, gcTime |
| 13 | utils.js | 9 | 8 | 7 | 8 | 7 | 7 | **37/50** | 🟡 | cn() + isIframe |
| 14 | main.jsx | 8 | 8 | 7 | 5 | 6 | 6 | **32/50** | 🟡 | → Next.js entry |
| 15 | utils/index.ts | 2 | 6 | 5 | 5 | 5 | 5 | **26/50** | 🔴 | createPageUrl → Next.js Link |

---

## 10. סטטיסטיקה כוללת

### File Count by Category
| Category | Files | Lines | % of Total |
|----------|-------|-------|------------|
| **Serverless Functions** | 34 | ~7,500 | 12.5% |
| **Pages** | 51 | ~22,000 | 36.8% |
| **Custom Components** | 88 | ~16,500 | 27.6% |
| **shadcn/ui Components** | 47 | ~3,400 | 5.7% |
| **Core/Lib/Config** | 15 | ~1,400 | 2.3% |
| **Config Files** | 8 | ~700 | 1.2% |
| **CSS** | 1 | 87 | 0.1% |
| **package-lock.json** | 1 | ~8,300 | 13.8% |
| **TOTAL** | **293** | **~59,844** | **100%** |

### Decision Distribution
| Decision | Files | % |
|----------|-------|---|
| 🟢 **KEEP** (40-50) | 1 | 0.5% |
| 🟡 **IMPROVE** (25-39) | 174 | 88.3% |
| 🔴 **REBUILD** (0-24) | 8 | 4.1% |
| **shadcn/ui** (regenerate) | 47 | 23.9% |
| **Config** (rewrite for Next.js) | 8 | 4.1% |

### Identified GEMs (preserve logic)
| # | File | What to Preserve |
|---|------|-----------------|
| 1 | calculateSolarReturn | VSOP87 + Placidus house calculations |
| 2 | interpretAstrology | v6.0 prompt engineering, 40-50 insights |
| 3 | calculateNumerologyCompatibility | Hebrew gematria implementation |
| 4 | processDrawingFeatures | Machover/Koppitz professional analysis |
| 5 | stripeWebhook | Proper signature verification flow |
| 6 | BirthChart | SVG zodiac circle positioning math |
| 7 | DigitalCanvas | Canvas with pressure tracking |
| 8 | ExplainableInsight | Provenance + confidence display |
| 9 | useSubscription | Subscription management hook |
| 10 | CachedQuery | Query caching strategy |
| 11 | AdvancedAnimations | 20+ animation variant presets |
| 12 | AdvancedErrorBoundary | Auto-recovery with repeated error detection |
| 13 | AuthContext | Two-phase authentication pattern |
| 14 | useDebounce | Debounce + throttle hooks |
| 15 | EnhancedAccessibility | ARIA injection + contrast checking |
| 16 | ruleEngine | Condition evaluation + confidence weighting |
| 17 | AskQuestion forceToString | Robust LLM response data cleaning |

### Security Issues Found
| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | No RLS policies (Base44 managed) | 🔴 HIGH | All DB access |
| 2 | LLM prompt injection (raw user text in prompts) | 🔴 HIGH | AIAssistant, AdvancedAICoach, AskQuestion |
| 3 | cleanupDailyInsights deletes ALL records | 🟡 MEDIUM | cleanupDailyInsights |
| 4 | sendDailyInsights optional secret key | 🟡 MEDIUM | sendDailyInsights |
| 5 | No rate limiting on any endpoint | 🟡 MEDIUM | All functions |
| 6 | No input sanitization (XSS) | 🟡 MEDIUM | All user input fields |
| 7 | console.log in production code | 🟢 LOW | askMysticTutor, AskQuestion |
| 8 | Token in URL (removed but briefly exposed) | 🟢 LOW | app-params.js |

### Technical Debt
| # | Issue | Impact | Files Affected |
|---|-------|--------|---------------|
| 1 | No TypeScript (all JSX) | 🔴 HIGH | All 230+ files |
| 2 | Files > 300 lines | 🔴 HIGH | 45+ files |
| 3 | No tests | 🔴 HIGH | Entire codebase |
| 4 | Duplicate components (3x EmptyState, 2x Toast, 2x Share) | 🟡 MED | 7 files |
| 5 | Hardcoded data (tarot, blog, calendar) | 🟡 MED | 5+ files |
| 6 | Mock data (calculateTransits) | 🟡 MED | 1 file |
| 7 | Unused variables (Astrology.jsx moon_index) | 🟢 LOW | 3+ files |
| 8 | Inconsistent toast usage (EnhancedToast vs sonner) | 🟢 LOW | 10+ files |

---

## 11. Feature Inventory Summary

| # | Feature Area | Pages | Functions | Key Components | Status |
|---|-------------|-------|-----------|---------------|--------|
| 1 | **Numerology** | Numerology, Compatibility | calculateNumerologyCompatibility, calculateCompatibility | NumerologySummaryCard | Working |
| 2 | **Astrology** | Astrology, AstrologyReadings, SolarReturn, Transits, Synastry, AstroCalendar, Compatibility | generateAstrologyReading, calculateSolarReturn, calculateTransits, interpretAstrology, interpretSolarReturn, interpretTransits, findBestDays | BirthChart, AstrologyReadingCard, AstrologyConceptCard, AstrologyWidget | Working (transits mocked) |
| 3 | **Graphology** | Graphology, SavedGraphologyInsights | — (uses LLM directly) | GraphologyComparison, GraphologyPrintView, GraphologyProgressTracker, +8 more | Working |
| 4 | **Drawing Analysis** | DrawingAnalysis, CompareDrawingAnalyses, DrawingTutor | processDrawingFeatures, ruleEngine, saveFeatures | AnnotatedDrawingViewer, QuantitativeDrawingMetrics, DigitalCanvas, DrawingConceptCard | Working |
| 5 | **Palmistry** | Palmistry | — (uses LLM directly) | — | Working |
| 6 | **Tarot** | Tarot | — (hardcoded cards + LLM) | — | Working |
| 7 | **Human Design** | HumanDesign | calculateHumanDesign | — | Working (LLM-simulated) |
| 8 | **Dream Analysis** | DreamAnalysis | — (uses LLM directly) | — | Working |
| 9 | **AI Coach** | AICoach, JourneyDashboard | generateCoachingJourney, generatePersonalizedJourney, generateGoalRecommendations, analyzeGoalProgress | AIAssistant, AdvancedAICoach, ChatMessage, ChatInput, JourneyCard | Working |
| 10 | **Goals** | MyGoals | analyzeGoalProgress, generateGoalRecommendations | GoalProgressWidget, GoalProgressModal, GoalLinker | Working |
| 11 | **Mood Tracking** | MoodTracker | — | — | Working |
| 12 | **Daily Insights** | DailyInsights | generateDailyInsight, cleanupDailyInsights, sendDailyInsights | AdvancedDailyInsights, DailyInsightCard, DailyInsightWidget | Working |
| 13 | **Subscriptions** | Pricing, ManageSubscription, SubscriptionSuccess, TestStripe | createCheckoutSession, cancelSubscription, getSubscriptionStatus, incrementUsage, stripeWebhook | useSubscription, SubscriptionGuard | Working |
| 14 | **Email** | — | sendWelcomeEmail, sendPaymentFailedEmail, sendUsageLimitEmail, sendDailyInsights | — | Working |
| 15 | **Documents** | DocumentAnalyzer | analyzeDocument | DocumentInsightsWidget | Working |
| 16 | **Learning** | AstrologyTutor, DrawingTutor, Blog, Tutorials | askMysticTutor | InteractiveTutorial, TutorChat, AstrologyConceptCard, DrawingConceptCard | Working |
| 17 | **Synthesis** | MysticSynthesis, PersonalityAnalysis | synthesizeMysticInsights, generateWeeklyReport | PsychologicalProfileChart, BigFiveRadarChart | Working |
| 18 | **Career** | CareerGuidance | — (uses LLM directly) | — | Working |
| 19 | **Relationships** | Relationships, RelationshipAnalysis | — | — | Working |
| 20 | **Analytics** | AnalyticsDashboard | — | Analytics | Working |
| 21 | **Dashboard** | Dashboard, Home | — | OptimizedDashboard, BiorhythmChart, ProfileOverviewCard | Working |
| 22 | **User Management** | UserProfile, EditProfile, UserSettings, Onboarding, ManageProfiles | — | OnboardingFlow, ProfileCompletionWidget | Working |
| 23 | **Notifications** | Notifications | — | NotificationManager, SmartRemindersWidget | Working |
| 24 | **Referrals** | Referrals | — | — | Working |
| 25 | **Journal** | Journal | — | — | Working |
| 26 | **PDF Export** | — | generatePDF | ExportPDF, GraphologyExportPDF | Working |

**Total Features: 26 | Total Pages: 51 | Total Functions: 34**

---

## 12. Migration Summary

### What Changes
| From (Current) | To (Target) |
|----------------|-------------|
| Vite 6 SPA | Next.js 14+ App Router |
| JavaScript JSX | TypeScript strict |
| React Router 6 | Next.js file-based routing |
| Base44 SDK | Supabase (PG + Auth + Storage + Realtime) |
| Base44 InvokeLLM | Supabase Edge Functions + OpenAI/Anthropic API |
| Base44 SendEmail | Resend / SendGrid via Edge Functions |
| No tests | Vitest + Testing Library |
| No RLS | Supabase RLS on every table |
| 614-line Layout | Modular layouts < 300 lines each |
| 47 shadcn/ui JSX | Regenerate via shadcn/ui CLI (TSX) |

### What Stays (Logic to Preserve)
- All 17 GEMs listed above
- Business logic from 26 feature areas
- Hebrew localization patterns
- RTL layout architecture
- Stripe payment flow
- LLM prompt engineering (astrology, drawing, coaching)
- Scoring algorithms (numerology, compatibility)
- Psychological frameworks (Koppitz, Jung, Freud, Big Five)

---

> **שלב 1 הושלם.** מחכה לאישורך לפני שממשיך לשלב 2: הנדסה לאחור + GEMS.
