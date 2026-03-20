# 04_PRD.md — Product Requirements Document

> **מוצר:** MystiQor — פלטפורמה מיסטית-אישית מבוססת AI
> **גרסה:** 2.0 (Production Rebuild)
> **תאריך:** 2026-03-20
> **מבוסס על:** 01-03 (Codebase Map, Reverse Engineering, Architecture)

---

## 1. Executive Summary

### מה זה MystiQor?
MystiQor היא פלטפורמת self-discovery שמשלבת כלים מיסטיים מסורתיים (נומרולוגיה, אסטרולוגיה, גרפולוגיה, טארוט, כירומנטיה, ניתוח ציורים) עם AI מתקדם ליצירת תובנות אישיות מעמיקות, מדויקות ומבוססות ראיות.

### למה לבנות מחדש?
המערכת הקיימת נבנתה על BASE44 (no-code platform) ומגיעה לגבולות הסקלביליות, האבטחה, והתחזוקה. הבנייה מחדש מעבירה את כל הלוגיקה העסקית המוכחת (26 features, 14 GEMs) ל-production stack מודרני.

### מטרות עיקריות
1. **Feature parity** — כל 26 הפיצ'רים הקיימים עובדים כמו היום או טוב יותר
2. **Type safety** — TypeScript strict, אפס any, Zod validation בכל מקום
3. **Security** — RLS על כל טבלה, input sanitization, rate limiting
4. **Performance** — Lighthouse > 90, LCP < 1.5s, initial JS < 200KB
5. **Scalability** — Supabase + Vercel + Edge = מוכן לצמיחה

### KPIs מדידים
| KPI | Target | Measurement |
|-----|--------|-------------|
| Feature parity | 100% | כל 26 features עובדים |
| TypeScript coverage | 100% | `tsc --noEmit` = 0 errors |
| Test coverage | > 70% | Vitest + Testing Library |
| Lighthouse score | > 90 | Mobile + Desktop |
| Build size (initial JS) | < 200KB | `next build` output |
| LCP | < 1.5s | Lighthouse / Web Vitals |
| RLS coverage | 100% | כל טבלה עם policy |
| Zero critical vulnerabilities | 0 | OWASP Top 10 check |
| Build time | < 2 min | `next build` |
| Error rate | < 0.1% | Production monitoring |

---

## 2. User Personas

### P1: מיכל — המשתמשת הראשית
- **גיל:** 28-45
- **רקע:** מתעניינת במיסטיקה, פיתוח אישי, ורוחניות
- **צרכים:** מחפשת תובנות אישיות מעמיקות שמבוססות על נתונים ספציפיים שלה
- **התנהגות:** משתמשת 2-3 פעמים בשבוע, מתחילה עם כלי אחד ומרחיבה לעוד
- **שפה:** עברית (RTL)
- **מכשיר:** בעיקר נייד (70%), מחשב (30%)
- **מנוי:** מתחילה ב-Free, משדרגת ל-Basic/Premium תוך חודש אם מרוצה

### P2: דנה — הקואצ'רית
- **גיל:** 30-55
- **רקע:** קואצ'רית / מטפלת / מנחת סדנאות שמשתמשת בכלים מיסטיים עם לקוחות
- **צרכים:** פרופילי אורחים (לקוחות), השוואת ניתוחים, יצוא PDF
- **התנהגות:** משתמשת יומית, יוצרת ניתוחים ללקוחות, משווה תוצאות לאורך זמן
- **מנוי:** Premium/Enterprise

### P3: אריאל — הלומד
- **גיל:** 20-35
- **רקע:** סקרן לגבי אסטרולוגיה/נומרולוגיה, רוצה ללמוד
- **צרכים:** הסברים מובנים, מסלולי למידה, AI tutor
- **התנהגות:** שואל הרבה שאלות, משתמש ב-tutors ובמידע חינוכי
- **מנוי:** Free → Basic

---

## 3. מודולים ופיצ'רים

### Module 1: Foundation
#### F0.1: Authentication
| Field | Value |
|-------|-------|
| **תיאור** | הרשמה והתחברות עם Supabase Auth |
| **Methods** | Email/Password, Google OAuth, Magic Link |
| **Acceptance Criteria** | - הרשמה עם email + password (validation: 8+ chars, uppercase, number) |
| | - התחברות עם session cookie (httpOnly) |
| | - שכחתי סיסמה עם reset email |
| | - Redirect ל-onboarding אם profile ריק |
| | - Redirect ל-dashboard אם profile קיים |
| | - Logout מנקה session |

#### F0.2: Onboarding (4 שלבים)
| Field | Value |
|-------|-------|
| **תיאור** | תהליך onboarding שאוסף נתונים בסיסיים ומחנך את המשתמש |
| **Step 1** | שם מלא (עברית), תאריך לידה, שעת לידה (אופציונלי), מגדר (אופציונלי) |
| **Step 2** | מקום לידה עם autocomplete (Nominatim), שמירת lat/lon/timezone |
| **Step 3** | חינוך: "Barnum Effect" + "פוטנציאלים, לא גורל" + 2 checkboxes חובה |
| **Step 4** | דיסציפלינות מועדפות, תחומי מיקוד, יעדים אישיים, AI toggle |
| **AC** | - כל 4 השלבים חייבים להסתיים לפני גישה למערכת |
| | - Profile completion score מחושב אוטומטית |
| | - Subscription (free, 7-day trial) נוצר אוטומטית |
| | - ניתן לדלג על שלבים אופציונליים (שעת לידה, מגדר) |

#### F0.3: Layout & Navigation
| Field | Value |
|-------|-------|
| **תיאור** | Layout RTL עם sidebar, header, ו-mobile nav |
| **AC** | - `dir="rtl"` על root layout |
| | - Sidebar ימני (RTL) עם categories מתקפלות |
| | - Usage bar במנוי (ניתוחים שנוצלו / מגבלה) |
| | - Dark/Light theme toggle |
| | - Mobile hamburger menu (< 768px) |
| | - Hebrew fonts (Assistant + Heebo) |
| | - Breadcrumbs בכל דף |

---

### Module 2: Core Mystical Tools

#### F1: Numerology
| Field | Value |
|-------|-------|
| **תיאור** | ניתוח נומרולוגי מלא עם גימטריה עברית |
| **Input** | שם מלא (עברית), תאריך לידה |
| **Output** | Life Path, Destiny, Soul, Personality, Personal Year/Month/Day |
| **AC** | - Hebrew gematria calculation (GEM 2) |
| | - Master numbers (11, 22, 33) preserved |
| | - AI interpretation for each number |
| | - Save to analyses table |
| | - SubscriptionGuard check before analysis |
| | - incrementUsage() on success |
| | - Confidence score displayed |

#### F2: Astrology — Birth Chart
| Field | Value |
|-------|-------|
| **תיאור** | חישוב מפת לידה מלאה עם SVG אינטראקטיבי |
| **Input** | שם, תאריך/שעת לידה, מקום (geocoding) |
| **Output** | 10 כוכבים + מיקומים, 12 בתים, אספקטים, יסודות/מודאליות |
| **AC** | - Interactive SVG zodiac circle (GEM 6) |
| | - Click on planet → AI explanation |
| | - Link to AstrologyTutor for learning |
| | - Progress bar during calculation (0-100%) |
| | - Save AstrologyCalculation for dependent features |
| | - Geocoding via Nominatim with Israel timezone default |

#### F3: Astrology — Solar Return
| Field | Value |
|-------|-------|
| **תיאור** | חישוב Solar Return עם VSOP87 |
| **Prerequisites** | Profile + AstrologyCalculation must exist |
| **Input** | Target year |
| **Output** | Exact return moment, full chart, houses, aspects, annual themes |
| **AC** | - Binary search algorithm (GEM 1) preserving ±0.01° accuracy |
| | - Placidus house calculation |
| | - AI interpretation (Perry, Volguine, Hand references) |
| | - Element/modality distribution chart |

#### F4: Astrology — Transits
| Field | Value |
|-------|-------|
| **תיאור** | חישוב טרנזיטים נוכחיים מול מפת לידה |
| **Prerequisites** | AstrologyCalculation must exist |
| **AC** | - **REBUILD** calculateTransits with real ephemeris (not mocked) |
| | - Mercury retrograde detection |
| | - Void of Course Moon detection |
| | - AI interpretation per transit (Robert Hand methodology) |
| | - Timing phases: applying/exact/separating |

#### F5: Astrology — Synastry
| Field | Value |
|-------|-------|
| **תיאור** | השוואת מפות לידה של 2 אנשים |
| **Input** | Person 1 + Person 2 birth data (load from profile/guest) |
| **Output** | Compatibility score (0-100%), element harmony, aspects, recommendations |
| **AC** | - Dual chart calculation |
| | - Score bands: 80+% Excellent, 60-79 Good, 40-59 Moderate, <40 Challenging |
| | - Sun-Sun, Moon-Moon, Venus-Mars dynamics analyzed |

#### F6: Astrology — Readings
| Field | Value |
|-------|-------|
| **תיאור** | 8 סוגי קריאות אסטרולוגיות |
| **Types** | Natal, Monthly forecast, Yearly forecast, Transit report, Compatibility, Relationship dynamics, Career potential, Specific question |
| **AC** | - Type-specific input forms |
| | - Tabs view: All, Natal, Forecasts, Themes |
| | - READING_TYPES config preserved |

#### F7: Graphology
| Field | Value |
|-------|-------|
| **תיאור** | ניתוח כתב יד מתמונה |
| **Input** | Image upload (JPEG/PNG, max 10MB) |
| **Output** | Slant, pressure, size, spacing metrics + psychological profile |
| **AC** | - AI image analysis for handwriting features |
| | - Radar chart comparison with previous analyses |
| | - Print view, PDF export, share |
| | - Progress tracker over time |

#### F8: Drawing Analysis
| Field | Value |
|-------|-------|
| **תיאור** | ניתוח ציורים פסיכולוגי (HTP) |
| **Input** | Drawing type (person/tree/house/family/free), image upload OR DigitalCanvas |
| **Output** | Graphic features, content analysis, emotional indicators, Koppitz scores, authenticity check |
| **AC** | - GEM: processDrawingFeatures (Machover, Koppitz references) |
| | - DigitalCanvas with pressure tracking (GEM) |
| | - AnnotatedViewer with clickable annotations |
| | - 30+ Koppitz emotional indicators visualized |
| | - Rule engine (GEM 3) for evidence-based insights |

#### F9: Palmistry
| Field | Value |
|-------|-------|
| **Input** | Palm image upload |
| **Output** | Lines, mounts, finger shapes + AI interpretation |
| **AC** | - Image upload guide showing correct hand position |
| | - AI analysis of major/minor lines |
| | - Health indicators if applicable |

#### F10: Tarot
| Field | Value |
|-------|-------|
| **תיאור** | משיכת קלפי טארוט עם פרשנות AI |
| **Input** | Question (optional), spread type |
| **Output** | Cards drawn (upright/reversed) + AI interpretation |
| **AC** | - Tarot cards moved from hardcoded to DB (tarot_cards table) |
| | - Random draw with upright/reversed |
| | - AI interpretation combines: card meaning + position + question context |
| | - Hebrew card names and descriptions |

#### F11: Human Design
| Field | Value |
|-------|-------|
| **Input** | Birth date, time (required), place |
| **Output** | Type, Strategy, Authority, Profile, Centers (defined/open) |
| **AC** | - **IMPROVE** calculation (use proper HD algorithm, not LLM simulation) |
| | - 9 centers visualization (colored=defined, gray=open) |
| | - Authority-specific guidance |

#### F12: Dream Analysis
| Field | Value |
|-------|-------|
| **Input** | Title, description, emotions (10 presets), symbols, people, location, mood_after, is_recurring, is_lucid |
| **Output** | AI interpretation, psychological themes, symbol meanings, dreamscape image |
| **AC** | - Async pattern: Create → [Parallel: GenerateImage + InvokeLLM] → Update |
| | - Dream journal with chronological display |
| | - CRUD operations |

#### F13: Compatibility
| Field | Value |
|-------|-------|
| **Types** | Romantic, Business, Friendship, Family |
| **Input** | 2 people (name + birth date, optional time) |
| **Output** | Numerology + Astrology scores, strengths/challenges, Anti-Barnum analysis |
| **AC** | - GEM 2: Numerology compatibility matrix (weighted 40/30/30) |
| | - Anti-Barnum prompt demanding specific evidence |
| | - Load from profile/guest profiles |

#### F14: Career Guidance
| Field | Value |
|-------|-------|
| **Input** | Current field, skills, interests, birth date (optional) |
| **Output** | Recommended fields (with match score), skills to develop, action steps |
| **AC** | - 3-5 recommended fields with match percentage |
| | - Actionable growth opportunities |
| | - Challenge/solution pairs |

#### F15: Document Analyzer
| Field | Value |
|-------|-------|
| **Input** | File upload (PDF/JPEG/PNG/TXT, max 10MB), analysis type, optional question |
| **Output** | Summary, key insights, recurring themes, connections, recommendations |
| **AC** | - File type + size validation |
| | - Previous analysis context support |
| | - Importance scoring (1-10) for insights |
| | - Priority levels for recommendations |

#### F16: Ask Question
| Field | Value |
|-------|-------|
| **Input** | Open-ended question, category (7 types) |
| **Output** | Direct answer, mystical insights, practical recommendations, timing guidance |
| **AC** | - GEM 5: forceToString for robust LLM response handling |
| | - ExplainableInsight display with provenance |
| | - 7 categories: general, career, love, timing, spiritual, decision, purpose |

---

### Module 3: Personal Journey

#### F17: AI Coach
| Field | Value |
|-------|-------|
| **תיאור** | צ'אט AI אישי + מסלולי אימון |
| **Chat** | Real-time messaging via Supabase Realtime |
| **Journeys** | 7-12 step personalized coaching plans |
| **AC** | - Chat history preserved across sessions |
| | - Context-aware (knows user's analyses, goals, mood) |
| | - Journey step types: reflection, action, exercise, quiz |
| | - Link journeys to goals |

#### F18: Goals
| Field | Value |
|-------|-------|
| **8 Categories** | Career, Relationships, Personal Growth, Health, Spirituality, Creativity, Finance, Other |
| **AC** | - CRUD goals with progress tracking (0-100%) |
| | - AI-generated recommendations + action plan |
| | - AI obstacle analysis (analyzeGoalProgress) |
| | - Link to preferred mystical tools |
| | - Action items with individual status tracking |

#### F19: Mood Tracker
| Field | Value |
|-------|-------|
| **Input** | Mood (10 presets), mood_score, energy, stress, sleep (all 1-10), notes, activities, gratitude |
| **AC** | - Auto AI analysis after 6+ entries (7-day window) |
| | - Pattern detection + recommendations |
| | - Stats cards: average mood, entry count, tracking days |
| | - Mood history with charts (Recharts) |

#### F20: Journal
| Field | Value |
|-------|-------|
| **Input** | Title (optional), content, mood, energy, gratitude[], goals[] |
| **AC** | - On-demand AI insights per entry |
| | - CRUD operations |
| | - Chronological display |

#### F21: Daily Insights
| Field | Value |
|-------|-------|
| **תיאור** | תובנה יומית אוטומטית: נומרולוגיה + טארוט + טרנזיטים + יעדים |
| **AC** | - Auto-generated daily (cron job) |
| | - Combines: personal numbers + random tarot + transit data + active goals |
| | - User feedback (1-5 stars + comment) |
| | - Mood emoji display |
| | - Data source badges |

#### F22: Mystic Synthesis
| Field | Value |
|-------|-------|
| **תיאור** | שילוב כל הכלים לפרופיל אישיות אחיד |
| **AC** | - On-demand synthesis combining all analyses |
| | - Personality profile: strengths, challenges, hidden talents |
| | - Predictive insights: timeframe, area, probability |
| | - Recommendations: action + reason + related tool |
| | - Weekly report option |

#### F23: Personality Analysis
| Field | Value |
|-------|-------|
| **Input** | Birth date, optional birth time/place |
| **Output** | Core traits, strengths, challenges, communication style, decision-making, core motivation, growth advice |
| **AC** | - Big Five radar chart display |
| | - Color-coded sections |

---

### Module 4: Account & Subscription

#### F24: Subscriptions & Payments
| Field | Value |
|-------|-------|
| **Plans** | Free (₪0, 3 analyses), Basic (₪49/mo, 20 analyses), Premium (₪99/mo, unlimited), Enterprise (custom) |
| **AC** | - Stripe checkout integration (GEM 4) |
| | - 7-day free trial on all paid plans |
| | - Webhook handling: checkout.completed, subscription.updated, subscription.deleted, invoice.payment_failed |
| | - Monthly usage reset (cron) |
| | - Cancel at period end (not immediate) |
| | - SubscriptionGuard component blocks premium features |
| | - useSubscription hook with optimistic updates (GEM 7) |

#### F25: User Profile & Settings
| Field | Value |
|-------|-------|
| **Profile** | View/edit all birth data, disciplines, goals, completion score |
| **Settings** | Notifications (7 toggles), Display (theme, compact, confidence, provenance), Privacy (visibility, sharing, research) |
| **AC** | - Profile completion progress bar |
| | - Edit form with Zod validation |
| | - Settings persisted in profile or localStorage |

#### F26: Referrals
| Field | Value |
|-------|-------|
| **AC** | - Unique referral code: `MYSTIQOR-{USERNAME}-{RANDOM6}` |
| | - Share via link/WhatsApp/Facebook/Email |
| | - Reward: 3 free analyses for both parties |
| | - Stats: invitations sent, completed, earned |

---

### Module 5: Learning & Content

#### F27: Astrology Tutor
| Field | Value |
|-------|-------|
| **Learning Paths** | Beginner (4 topics), Intermediate (4), Advanced (5) |
| **AC** | - Chat with AI tutor per topic |
| | - Quiz support with scoring |
| | - Progress tracking (completed topics, study time) |
| | - URL deep linking for questions |

#### F28: Drawing Tutor
| Field | Value |
|-------|-------|
| **AC** | - Quick questions (6 presets) |
| | - Learning topics (4 structured lessons) |
| | - Personalized suggestions from actual drawing analysis |
| | - Chat interface with AI tutor |

#### F29: Blog
| Field | Value |
|-------|-------|
| **AC** | - Articles stored in DB (blog_posts table, not hardcoded) |
| | - Category filtering + search |
| | - Author, date, read time, tags |
| | - SSG for SEO |

#### F30: Tutorials
| Field | Value |
|-------|-------|
| **AC** | - Module-based learning (steps per module) |
| | - Lock/unlock progression |
| | - Interactive steps with prompts |

---

### Module 6: Dashboard & Analytics

#### F31: Dashboard
| Field | Value |
|-------|-------|
| **AC** | - Stats cards: active goals, mood score, completed goals, pending reminders |
| | - Mood trends chart (14 days) |
| | - Goal progress + distribution charts |
| | - Analysis distribution by tool type |
| | - Quick action links |
| | - Skeleton loading states |

#### F32: Home
| Field | Value |
|-------|-------|
| **AC** | - Personalized greeting (time-aware) |
| | - Tool grid (6 main tools with images) |
| | - Daily insight widget |
| | - Recent analyses |
| | - AI Assistant floating button |
| | - Onboarding check (redirect if not completed) |

#### F33: Analytics Dashboard
| Field | Value |
|-------|-------|
| **AC** | - Page views, unique sessions, tool usage, conversion rate |
| | - Date range filter (7/14/30/90 days) |
| | - Daily activity trends chart |
| | - Tool usage distribution (pie chart) |
| | - Popular pages |

#### F34: Notifications
| Field | Value |
|-------|-------|
| **AC** | - Tabs: Pending, Sent, Dismissed |
| | - Mark complete, dismiss, delete |
| | - "Today!" and "Missed" badges |
| | - Color-coded by type |

---

## 4. Non-Functional Requirements

### 4.1 Performance
| Requirement | Target |
|-------------|--------|
| Initial JS bundle | < 200KB |
| Largest Contentful Paint (LCP) | < 1.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Lighthouse score | > 90 (mobile + desktop) |
| API response time (p95) | < 500ms (excluding LLM calls) |
| LLM call timeout | 30s max |
| Image load time | < 1s (CDN + next/image) |

### 4.2 Security
| Requirement | Implementation |
|-------------|----------------|
| Authentication | Supabase Auth + httpOnly cookies |
| Authorization | RLS on every table (20/20) |
| Input validation | Zod schemas on all API routes |
| XSS prevention | DOMPurify on user-generated content |
| CSRF protection | Next.js built-in (server actions) |
| Rate limiting | Per-endpoint limits (see Architecture §3.2) |
| Secrets management | .env.local, server-only env vars |
| File upload security | Type whitelist + 10MB max + storage bucket policies |
| Prompt injection | Sanitize user text before LLM prompts |
| HTTPS | Enforced via Vercel |

### 4.3 Accessibility
| Requirement | Implementation |
|-------------|----------------|
| ARIA labels | On all interactive elements |
| Keyboard navigation | Tab order, Enter/Space for actions, Escape for modals |
| Screen reader | Live regions for dynamic content, sr-only labels |
| Color contrast | WCAG AA (4.5:1 text, 3:1 large text) |
| Focus management | Visible focus indicators, focus trap in modals |
| Skip links | Skip to main content |

### 4.4 RTL & Hebrew
| Requirement | Implementation |
|-------------|----------------|
| Document direction | `dir="rtl"` on `<html>` |
| Alignment | `start`/`end` exclusively (never `left`/`right`) |
| Labels & errors | All in Hebrew |
| Date format | DD/MM/YYYY (Israeli) |
| Currency | ₪ (NIS) |
| Fonts | Assistant (primary), Heebo (secondary) |
| Comments & docs | Hebrew in code comments |
| Tailwind | RTL plugin enabled |

### 4.5 Browser Support
| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Safari | iOS 14+ |
| Mobile Chrome | Android 10+ |

---

## 5. Data Migration Plan

### 5.1 Entities to Migrate
| Entity (Base44) | Table (Supabase) | Records (est.) | Complexity |
|-----------------|-------------------|----------------|------------|
| UserProfile | profiles | ~500 | Low |
| Subscription | subscriptions | ~500 | Medium (Stripe IDs) |
| Analysis | analyses | ~5,000 | High (JSONB restructuring) |
| UserGoal | goals | ~1,000 | Low |
| MoodEntry | mood_entries | ~3,000 | Low |
| JournalEntry | journal_entries | ~2,000 | Low |
| DailyInsight | daily_insights | ~5,000 | Medium |
| Dream | dreams | ~500 | Low |
| CoachingJourney | coaching_journeys | ~300 | Medium |
| UserReminder | reminders | ~1,000 | Low |
| PaymentHistory | payment_history | ~200 | Low |
| LearningProgress | learning_progress | ~500 | Low |

### 5.2 Migration Strategy
1. Export Base44 entities via API to JSON files
2. Transform schemas (Base44 format → Supabase format)
3. Map `created_by` (email) → `user_id` (UUID) via auth migration
4. Validate data integrity post-migration
5. Rollback script for each table

### 5.3 Data Not Migrated
- AnalyticsEvent → Start fresh (new tracking)
- Base44-specific fields (app_id, etc.)
- Conversations → Not directly portable (different AI agent system)

---

## 6. Integrations

| Integration | Purpose | API | Server/Client |
|-------------|---------|-----|---------------|
| **Supabase** | DB, Auth, Storage, Realtime | REST + Realtime | Both |
| **OpenAI / Anthropic** | LLM for all AI analysis | REST API | Server only |
| **Stripe** | Payments & subscriptions | REST + Webhooks | Server only |
| **Nominatim (OSM)** | Geocoding (location → coords) | REST (free) | Server (proxied) |
| **Resend** | Transactional emails | REST API | Server only |
| **Vercel** | Hosting, CDN, Edge, Cron | Platform | Both |

---

## 7. Risks & Mitigations

| # | Risk | Impact | Probability | Mitigation |
|---|------|--------|-------------|------------|
| 1 | LLM API costs increase | High | Medium | Implement caching for repeated analyses, set per-user daily limits |
| 2 | Stripe webhook missed | High | Low | Idempotency keys, webhook retry handling, manual reconciliation endpoint |
| 3 | LLM hallucination in analyses | Medium | High | Structured JSON schemas, confidence scores, Barnum Effect education, provenance display |
| 4 | Data loss during migration | Critical | Low | Full backup before migration, validation scripts, rollback capability |
| 5 | Supabase free tier limits | Medium | Medium | Monitor usage, upgrade plan proactively, implement query optimization |
| 6 | Hebrew font rendering issues | Low | Low | Web font fallbacks, font-display: swap, testing on multiple devices |
| 7 | Solar Return accuracy | Medium | Low | VSOP87 already ±0.01° accurate; consider Swiss Ephemeris for future |
| 8 | Drawing analysis quality | Medium | Medium | Depends on LLM vision; validate against known drawings, provide confidence scores |

---

## 8. Wireframe Descriptions (Key Screens)

### Home (Logged In)
```
┌─────────────────────────────────────────┐
│ [Header: Logo | Search | Theme | User]  │
├────────┬────────────────────────────────┤
│        │  שלום מיכל, בוקר טוב! ✨       │
│ Sidebar│                                │
│        │  ┌────┐ ┌────┐ ┌────┐          │
│ 🔮 כלים│  │נומר│ │אסטר│ │גרפו│ Tool    │
│ 📊 דשבו│  │ולוג│ │ולוג│ │לוגי│ Grid    │
│ 🎯 יעדי│  │יה  │ │יה  │ │ה   │ (6)     │
│ 📝 יומן│  ├────┤ ├────┤ ├────┤          │
│ 💡 תובנ│  │ציור│ │כיר │ │טארו│          │
│ 🎓 למיד│  │ים  │ │ומנ │ │ט   │          │
│        │  └────┘ └────┘ └────┘          │
│ Usage: │                                │
│ ██░░ 2/3│ [Daily Insight Card]          │
│        │ [Recent Analyses Widget]       │
│        │                      [AI 🤖]  │
└────────┴────────────────────────────────┘
```

### Tool Page (e.g., Numerology)
```
┌─────────────────────────────────────────┐
│ Breadcrumbs: בית > כלים > נומרולוגיה    │
├─────────────────────────────────────────┤
│  📊 ניתוח נומרולוגי                     │
│                                         │
│  שם מלא:  [___________________]         │
│  תאריך לידה: [__/__/____]              │
│                                         │
│  [🔮 חשב ניתוח]                         │
│                                         │
│  ┌─ Results ─────────────────────────┐  │
│  │ Life Path: 7 — ☆☆☆☆              │  │
│  │ Destiny: 22 (Master) — ☆☆☆☆☆    │  │
│  │ Soul: 5 — ☆☆☆                    │  │
│  │                                   │  │
│  │ [ExplainableInsight cards...]     │  │
│  │  - דיוק: 92%                     │  │
│  │  - provenance: גימטריה + AI      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────────┐
│  📊 Dashboard                           │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🎯 5 │ │ 😊 8 │ │ ✅ 3 │ │ 🔔 2 │   │
│  │יעדים │ │מצב רו│ │הושלמו│ │תזכורו│   │
│  │פעילים│ │ח ממוצ│ │      │ │ת     │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│                                         │
│  ┌── Mood Trends (14 days) ──────────┐  │
│  │  📈 [Line Chart]                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌── Goal Progress ──┐ ┌── Analysis ─┐  │
│  │  [Bar Chart]      │ │ [Pie Chart] │  │
│  └───────────────────┘ └─────────────┘  │
└─────────────────────────────────────────┘
```

---

## 9. Out of Scope (v2.0)

| Feature | Why Out of Scope |
|---------|------------------|
| Mobile app (React Native) | Web-first, PWA sufficient |
| Multi-language (English) | Hebrew-only for now |
| Admin panel | Use Supabase Studio |
| Video content | Text + images sufficient |
| Social features (friends, groups) | Low priority, future v3.0 |
| Marketplace (sell readings) | Future business model expansion |
| White-label for practitioners | Enterprise feature, future |

---

## 10. Success Criteria (Go/No-Go)

| Criterion | Threshold | Weight |
|-----------|-----------|--------|
| All 26 features working | 100% | Must-have |
| TypeScript `tsc --noEmit` | 0 errors | Must-have |
| `npm run build` | 0 errors | Must-have |
| Lighthouse mobile | > 90 | Must-have |
| RLS on all tables | 20/20 | Must-have |
| Stripe flow complete | End-to-end | Must-have |
| All 14 GEMs migrated | 14/14 | Must-have |
| Hebrew UI complete | 100% | Must-have |
| RTL layout correct | 100% | Must-have |
| Initial JS < 200KB | Measured | Should-have |

---

> **שלב 4 הושלם.** מחכה לאישורך לפני שממשיך לשלב 5: Build Brief (`05_GSD_BUILD_BRIEF.md`).
