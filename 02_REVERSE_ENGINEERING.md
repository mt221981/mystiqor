# 02_REVERSE_ENGINEERING.md — הנדסה לאחור מלאה

> **תאריך:** 2026-03-20
> **מקור:** 01_CODEBASE_MAP.md + קריאה מעמיקה של כל קובץ

---

## 1. מפת פיצ'רים מלאה

### F1: נומרולוגיה (Numerology)
| פרט | ערך |
|------|------|
| **תיאור** | ניתוח נומרולוגי מלא: Life Path, Destiny, Soul, Personality, Personal Year + גימטריה עברית |
| **User Story** | כמשתמש, אני רוצה להכניס תאריך לידה ושם מלא ולקבל ניתוח נומרולוגי מקיף עם תובנות AI |
| **מסכים** | טופס קלט → מצב טעינה → תוצאות (מספרים + פרשנויות + תובנות) |
| **לוגיקה עסקית** | reduceToSingleDigit (11/22/33 master numbers), calculateGematria (עברית), calculateLifePath |
| **טבלאות** | Analysis, UserProfile |
| **Endpoints** | calculateNumerologyCompatibility |
| **קבצי מקור** | Numerology.jsx (1332), calculateNumerologyCompatibility/entry.ts (229) |
| **ציון** | 31/50 (Page), 39/50 (Function) |
| **החלטה** | 🟡 IMPROVE — לוגיקה מצוינת, לפרק את הpage, להוסיף TS types |

### F2: אסטרולוגיה — מפת לידה (Astrology)
| פרט | ערך |
|------|------|
| **תיאור** | חישוב מפת לידה מלאה: שמש, ירח, עולה, 10 כוכבים, 12 בתים, אספקטים, יסודות |
| **User Story** | כמשתמש, אני מכניס שם + תאריך/שעת לידה + מקום ומקבל מפת לידה אינטראקטיבית עם פרשנות AI |
| **מסכים** | טופס (עם autocomplete מיקום) → progress bar → BirthChart SVG + תובנות |
| **לוגיקה עסקית** | Zodiac sign calculation, VSOP87 sun position, geocoding via Nominatim, AI interpretation |
| **טבלאות** | Analysis, UserProfile, AstrologyCalculation |
| **Endpoints** | geocodeLocation, interpretAstrology |
| **קבצי מקור** | Astrology.jsx (641), BirthChart.jsx (922), interpretAstrology/entry.ts (366) |
| **ציון** | 33/50 (Page), 35/50 (Component), 38/50 (Function) |
| **החלטה** | 🟡 IMPROVE — GEM prompt engineering. לפרק BirthChart, להוסיף timezone handling |

### F3: אסטרולוגיה — Solar Return
| פרט | ערך |
|------|------|
| **תיאור** | חישוב רגע ה-Solar Return (שמש חוזרת למיקום הלידה) + מפה שנתית |
| **User Story** | כמשתמש, אני בוחר שנה ומקבל חישוב מדויק של ה-Solar Return עם פרשנות שנתית |
| **Flow** | בחר שנה → בדיקת prerequisites (פרופיל + מפת לידה) → חישוב → פרשנות AI → הצגה |
| **לוגיקה עסקית** | Binary search for exact moment, VSOP87, Placidus houses, element/modality distribution |
| **טבלאות** | Analysis, UserProfile, AstrologyCalculation |
| **Endpoints** | calculateSolarReturn, interpretSolarReturn |
| **קבצי מקור** | SolarReturn.jsx (505), calculateSolarReturn/entry.ts (344), interpretSolarReturn/entry.ts (326) |
| **ציון** | 34/50 (Page), 41/50 (🟢 Function!) |
| **החלטה** | 🟢 KEEP function logic — **GEM** חישובים אסטרונומיים מדויקים |

### F4: אסטרולוגיה — טרנזיטים (Transits)
| פרט | ערך |
|------|------|
| **תיאור** | חישוב מיקום כוכבים נוכחי והשוואה למפת לידה |
| **User Story** | כמשתמש, אני רואה אילו כוכבים משפיעים עלי עכשיו ומה המשמעות |
| **Flow** | בדיקת מפת לידה → חישוב → פרשנות AI → הצגת טרנזיטים עם אייקונים |
| **לוגיקה עסקית** | **MOCKED** — calculateTransits משתמש בנתונים מדומים, לא חישוב אמיתי |
| **טבלאות** | Analysis |
| **Endpoints** | calculateTransits, interpretTransits |
| **ציון** | 32/50 (Page), 23/50 (🔴 Function) |
| **החלטה** | 🔴 REBUILD calculateTransits — צריך ephemeris אמיתי. פרשנות (Robert Hand) = 🟡 IMPROVE |

### F5: אסטרולוגיה — סינסטרי (Synastry)
| פרט | ערך |
|------|------|
| **תיאור** | השוואת מפות לידה של שני אנשים — תאימות אסטרולוגית |
| **User Story** | כמשתמש, אני מכניס נתוני 2 אנשים ומקבל ניתוח תאימות עם ציון |
| **Flow** | קלט 2 אנשים (עם autocomplete + טעינה מפרופיל) → חישוב 2 מפות → סינסטרי AI → ציון + ניתוח |
| **לוגיקה עסקית** | Dual chart calculation, compatibility scoring (80+=Excellent, 60-79=Good, 40-59=Moderate) |
| **טבלאות** | Analysis, UserProfile, GuestProfile |
| **Endpoints** | calculateAstrology (x2), interpretAstrology (synastry mode) |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE — Flow טוב, צריך TS + validation |

### F6: אסטרולוגיה — קריאות מתקדמות (AstrologyReadings)
| פרט | ערך |
|------|------|
| **תיאור** | 8 סוגי קריאות: מפת לידה, תחזית חודשית/שנתית, טרנזיטים, תאימות, דינמיקת יחסים, קריירה, שאלה ספציפית |
| **User Story** | כמשתמש, אני בוחר סוג קריאה ומקבל ניתוח אסטרולוגי מותאם |
| **Flow** | בחירת סוג → קלט נוסף (שאלה/תאריך/אדם 2) → generation → tabs view |
| **טבלאות** | AstrologyReading, AstrologyCalculation |
| **Endpoints** | generateAstrologyReading (1731 שורות!) |
| **ציון** | 33/50 |
| **החלטה** | 🟡 IMPROVE — READING_TYPES array = GEM. Function ענק, לפרק |

### F7: גרפולוגיה (Graphology)
| פרט | ערך |
|------|------|
| **תיאור** | ניתוח כתב יד: העלאת תמונה → AI analysis → metrics (slant, pressure, size, spacing) + פרופיל פסיכולוגי |
| **User Story** | כמשתמש, אני מעלה תמונה של כתב יד ומקבל ניתוח גרפולוגי מקיף |
| **Flow** | Upload image → AI analysis → Radar chart + metrics + psychological profile |
| **טבלאות** | Analysis, Feature |
| **Components** | GraphologyComparison, GraphologyPrintView, GraphologyProgressTracker, +8 more |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE — 11 sub-components = ecosystem שלם. Page ענק, לפרק |

### F8: ניתוח ציורים (DrawingAnalysis)
| פרט | ערך |
|------|------|
| **תיאור** | ניתוח ציורים פסיכולוגי (HTP — House-Tree-Person): upload/draw → AI analysis → Koppitz indicators |
| **User Story** | כמשתמש, אני מעלה ציור או מצייר בcanvas ומקבל ניתוח פסיכולוגי מקצועי |
| **Flow** | בחר סוג ציור (person/tree/house/family/free) → upload/draw → AI analysis → features + annotations + Koppitz + psychological profile |
| **לוגיקה עסקית** | Machover (1949), Koppitz (1968), 30+ emotional indicators, authenticity check, FDM visualization |
| **טבלאות** | Analysis, Feature |
| **Endpoints** | processDrawingFeatures, ruleEngine, saveFeatures |
| **Components** | AnnotatedDrawingViewer (806), QuantitativeDrawingMetrics (813), DigitalCanvas (475), DrawingConceptCard (626) |
| **ציון** | 33/50 (Page), 37/50 (Function) |
| **החלטה** | 🟡 IMPROVE — **GEM** professional psychological framework. Components ענקיים, לפרק |

### F9: כירומנטיה (Palmistry)
| פרט | ערך |
|------|------|
| **תיאור** | ניתוח כף יד: העלאת תמונה → AI analysis → קווים, הרים, צורת אצבעות |
| **User Story** | כמשתמש, אני מעלה תמונה של כף יד ומקבל ניתוח כירומנטי |
| **Flow** | Upload image → LLM analysis → Display palm features + insights |
| **טבלאות** | Analysis |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE — Flow ישיר, צריך TS + validation |

### F10: טארוט (Tarot)
| פרט | ערך |
|------|------|
| **תיאור** | משיכת קלפי טארוט + פרשנות AI מותאמת אישית |
| **User Story** | כמשתמש, אני שואל שאלה, מושך קלפים ומקבל פרשנות מעמיקה |
| **Flow** | שאלה → בחירת spread → random card draw → AI interpretation |
| **לוגיקה עסקית** | 38+ hardcoded cards with Hebrew names, random draw, upright/reversed |
| **טבלאות** | Analysis |
| **ציון** | 30/50 |
| **החלטה** | 🟡 IMPROVE — קלפים hardcoded = להעביר ל-DB. AI interpretation טוב |

### F11: Human Design
| פרט | ערך |
|------|------|
| **תיאור** | חישוב Human Design: סוג, אסטרטגיה, סמכות, פרופיל, מרכזים |
| **User Story** | כמשתמש, אני מכניס נתוני לידה ומקבל chart של Human Design |
| **לוגיקה עסקית** | **LLM-simulated** — אין ephemeris אמיתי, LLM "מנחש" |
| **ציון** | 30/50 (Page), 25/50 (Function) |
| **החלטה** | 🟡 IMPROVE — UI טוב, חישוב צריך rebuild עם HD algorithm אמיתי |

### F12: ניתוח חלומות (DreamAnalysis)
| פרט | ערך |
|------|------|
| **תיאור** | רישום חלומות + פרשנות AI + יצירת תמונת dreamscape + נושאים פסיכולוגיים |
| **User Story** | כמשתמש, אני מתעד חלום ומקבל פרשנות פסיכולוגית + visualization |
| **Flow** | טופס (כותרת, תיאור, רגשות, סמלים, אנשים, מיקום, מצב רוח) → שמירה → [async] AI analysis + image generation → עדכון |
| **Async Pattern** | Create → Toast → [Parallel: GenerateImage + InvokeLLM] → Update record |
| **טבלאות** | Dream |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE — Async pattern = GEM. צריך TS + error handling |

### F13: AI Coach
| פרט | ערך |
|------|------|
| **תיאור** | צ'אט AI אישי + מסלולי אימון (7-12 שלבים) |
| **User Story** | כמשתמש, אני משוחח עם coach AI שמכיר את הניתוחים שלי ומנחה אותי |
| **Flow** | Chat tab: יצירת שיחה → הודעות real-time → Journey tab: מסלולי אימון עם progress |
| **לוגיקה עסקית** | Real-time subscription, coaching journey with step types, goal linking |
| **טבלאות** | CoachingJourney, agents (conversations) |
| **Endpoints** | generateCoachingJourney, generatePersonalizedJourney, generateGoalRecommendations |
| **ציון** | 36/50 |
| **החלטה** | 🟡 IMPROVE — Real-time pattern טוב. צריך Supabase Realtime |

### F14: יעדים (MyGoals)
| פרט | ערך |
|------|------|
| **תיאור** | הגדרת יעדים אישיים, מעקב התקדמות, המלצות AI, קישור לכלים מיסטיים |
| **User Story** | כמשתמש, אני מגדיר יעד (קריירה/יחסים/צמיחה/בריאות/רוחניות/יצירתיות/כספים) ומקבל action plan מ-AI |
| **Flow** | Create goal → Track progress → Generate AI recommendations → Analyze obstacles → Complete |
| **8 קטגוריות** | career, relationships, personal_growth, health, spirituality, creativity, finance, other |
| **טבלאות** | UserGoal, UserReminder |
| **Endpoints** | generateGoalRecommendations, analyzeGoalProgress |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE |

### F15: מעקב מצב רוח (MoodTracker)
| פרט | ערך |
|------|------|
| **תיאור** | רישום mood/energy/stress/sleep + AI pattern analysis |
| **User Story** | כמשתמש, אני מתעד מצב רוח יומי ומקבל ניתוח דפוסים אחרי 6+ entries |
| **Flow** | Log mood (1-10 scales) → View history → Auto AI analysis (>=6 entries) → Patterns + recommendations |
| **Trigger** | AI analysis fires when entries >= 6, analyzes last 7 days |
| **טבלאות** | MoodEntry |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE |

### F16: יומן (Journal)
| פרט | ערך |
|------|------|
| **תיאור** | יומן אישי עם mood/energy + תובנות AI on-demand |
| **User Story** | כמשתמש, אני כותב ביומן ומבקש תובנות AI שמנתחות את מה שכתבתי |
| **Flow** | Write entry (title, content, mood, energy, gratitude, goals) → On-demand AI insights → CRUD |
| **טבלאות** | JournalEntry |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE |

### F17: תובנות יומיות (DailyInsights)
| פרט | ערך |
|------|------|
| **תיאור** | תובנה יומית אוטומטית: נומרולוגיה (personal day/month/year) + טארוט + טרנזיטים + יעדים |
| **User Story** | כמשתמש, אני מקבל תובנה יומית מותאמת אישית שמשלבת כלים שונים |
| **Flow** | Auto-generated → Display with mood emoji → Feedback (1-5 stars) → Cleanup option |
| **טבלאות** | DailyInsight |
| **Endpoints** | generateDailyInsight, cleanupDailyInsights, sendDailyInsights |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE — cleanupDailyInsights = 🔴 REBUILD (destructive) |

### F18: סינתזה מיסטית (MysticSynthesis)
| פרט | ערך |
|------|------|
| **תיאור** | שילוב כל הכלים לפרופיל אישיות כוללני + תובנות חיזוי + המלצות |
| **User Story** | כמשתמש, אני רוצה לראות תמונה כוללנית שמשלבת את כל הניתוחים שלי |
| **Flow** | Generate synthesis → Personality profile (strengths/challenges/talents) → Predictive insights → Recommendations |
| **טבלאות** | MysticSynthesis, Analysis, UserGoal, MoodEntry |
| **Endpoints** | synthesizeMysticInsights, generateWeeklyReport |
| **ציון** | 33/50 |
| **החלטה** | 🟡 IMPROVE |

### F19: תאימות (Compatibility)
| פרט | ערך |
|------|------|
| **תיאור** | ניתוח תאימות: רומנטית, עסקית, חברית, משפחתית |
| **User Story** | כמשתמש, אני מכניס 2 אנשים ומקבל ניתוח תאימות נומרולוגי + אסטרולוגי |
| **Flow** | בחר סוג תאימות → קלט 2 אנשים → AI analysis (combats Barnum Effect) → Score + strengths/challenges |
| **Anti-Barnum** | Prompt explicitly demands person-specific evidence, not generic descriptions |
| **טבלאות** | CompatibilityAnalysis, UserProfile, GuestProfile |
| **ציון** | 31/50 |
| **החלטה** | 🟡 IMPROVE — Anti-Barnum approach = GEM |

### F20: מנויים ותשלומים (Subscriptions)
| פרט | ערך |
|------|------|
| **תיאור** | 4 תוכניות (Free/Basic/Premium/Enterprise) + Stripe checkout + webhook handling |
| **Plans** | Free: 3 analyses, ₪0 / Basic: 20 analyses, ₪49 / Premium: Unlimited, ₪99 / Enterprise: Custom |
| **Flow** | Pricing → Stripe checkout → Webhook → Subscription created → 7-day trial |
| **טבלאות** | Subscription, PaymentHistory |
| **Endpoints** | createCheckoutSession, cancelSubscription, getSubscriptionStatus, incrementUsage, stripeWebhook |
| **ציון** | 35/50 (hook), 38/50 (webhook) |
| **החלטה** | 🟡 IMPROVE — Stripe flow = GEM, useSubscription hook = GEM |

### F21-F26: Additional Features (Summary)

| # | Feature | Description | Score | Decision |
|---|---------|-------------|-------|----------|
| F21 | **Dashboard** | Stats overview, charts, quick links | 34/50 | 🟡 IMPROVE |
| F22 | **Career Guidance** | AI career recommendations based on skills | 33/50 | 🟡 IMPROVE |
| F23 | **Document Analyzer** | PDF/image upload + AI analysis | 31/50 | 🟡 IMPROVE |
| F24 | **Personality Analysis** | Big Five + personality profile | 31/50 | 🟡 IMPROVE |
| F25 | **Learning (Tutors)** | Astrology + Drawing tutors with paths | 29-31/50 | 🟡 IMPROVE |
| F26 | **Referral System** | Referral code + 3 free analyses reward | 30/50 | 🟡 IMPROVE |

---

## 2. User Flows מרכזיים

### Flow 1: Onboarding (משתמש חדש)
```
1. נחיתה בדף הבית
2. שלב 1: שם מלא + תאריך לידה + שעת לידה (אופציונלי) + מגדר
3. שלב 2: מקום לידה (geocoding via Nominatim)
4. שלב 3: חינוך — "Barnum Effect" + "פוטנציאלים, לא גורל" + 2 checkboxes חובה
5. שלב 4: דיסציפלינות מועדפות + תחומי מיקוד + יעדים אישיים + AI toggle
6. יצירת UserProfile + Subscription (free, 7-day trial)
7. הפניה לדף הבית → Tool grid
```

### Flow 2: ניתוח טיפוסי (כלי מיסטי)
```
1. בחירת כלי (מ-tool grid או sidebar)
2. SubscriptionGuard check → canUseAnalysis()?
   ├── NO → Upgrade modal (usage bar + premium benefits + pricing link)
   └── YES → Continue
3. הזנת קלט (שונה לכל כלי)
4. incrementUsage() — עדכון מונה שימוש
5. LLM invocation (with structured JSON schema)
6. Save to Analysis table
7. Display results (insights + confidence + provenance)
8. Analytics tracking (pageView, toolUsage, analysisComplete)
```

### Flow 3: Stripe Checkout
```
1. Pricing page → Select plan (Basic/Premium)
2. createCheckoutSession({ planId, successUrl, cancelUrl })
3. Redirect to Stripe hosted checkout
4. Payment → stripeWebhook receives 'checkout.session.completed'
5. Create/update Subscription entity (plan_type, 7-day trial, limits)
6. Create PaymentHistory record
7. Redirect to SubscriptionSuccess page (confetti + benefits list)
```

### Flow 4: AI Coach Session
```
1. AICoach page → Chat tab
2. Create new conversation (or resume existing)
3. Subscribe to real-time updates
4. Send message → AI response (streamed)
5. Chat history preserved across sessions
6. Journey tab → Generate coaching journey (7-12 steps)
7. Complete steps → Track progress → Goal linking
```

### Flow 5: Solar Return (Advanced Astrology)
```
1. Prerequisites check: UserProfile + AstrologyCalculation exist?
   ├── NO → Redirect to Astrology page first
   └── YES → Continue
2. Select target year (quick buttons: This Year / Next Year)
3. Retrieve natal_sun_longitude from stored calculation
4. calculateSolarReturn:
   a. Binary search (100 iterations, ±2 days window)
   b. calculateSunPosition(testDate) — VSOP87
   c. Compare to natal longitude
   d. Stop when diff < 0.01°
   e. calculateChartForMoment — all 10 planets
   f. calculateHouses — Placidus system
5. interpretSolarReturn:
   a. Build prompt with natal + SR data
   b. LLM generates: annual_theme, insights[], recommendations[]
6. Save Analysis + Display
```

---

## 3. גרף תלויות (Feature Dependencies)

```
Level 0 (Foundation — no dependencies):
├── Auth (Base44 → Supabase)
├── UserProfile
├── Subscription
└── Theme/Layout/RTL

Level 1 (Core tools — depend on Level 0):
├── Numerology ← UserProfile
├── Palmistry ← UserProfile
├── Tarot ← UserProfile
├── Graphology ← UserProfile
├── DrawingAnalysis ← UserProfile
├── DreamAnalysis ← UserProfile
├── CareerGuidance ← UserProfile
├── Journal ← UserProfile
└── MoodTracker ← UserProfile

Level 2 (Astrology chain — depends on Level 0 + geocoding):
├── Astrology (Birth Chart) ← UserProfile + geocodeLocation
├── AstrologyReadings ← Astrology (requires natal chart)
├── SolarReturn ← Astrology (requires natal chart + natal_sun_longitude)
├── Transits ← Astrology (requires natal chart)
└── HumanDesign ← UserProfile + geocoding

Level 3 (Comparison tools — depends on Level 1-2):
├── Compatibility ← Numerology + Astrology
├── Synastry ← Astrology (x2 charts)
├── CompareAnalyses ← Analysis history
└── CompareDrawingAnalyses ← DrawingAnalysis history

Level 4 (Synthesis — depends on multiple Level 1-2):
├── MysticSynthesis ← All tools (Analysis records)
├── PersonalityAnalysis ← UserProfile + birth data
├── DailyInsights ← Numerology + Tarot + Transits + Goals
└── WeeklyReport ← All analyses + AnalyticsEvent

Level 5 (Meta — depends on Level 1-4):
├── AI Coach ← UserProfile + Analysis + Goals + MoodEntry
├── Goals ← UserProfile + Analysis (linked recommendations)
├── Dashboard ← All entities (stats aggregation)
└── Home ← UserProfile + Analysis + DailyInsight

Level 6 (Supporting):
├── Notifications ← UserReminder
├── Referrals ← Subscription
├── Blog ← None (static content)
├── Tutorials ← LearningProgress
├── AstrologyTutor ← LearningProgress + Astrology
└── DrawingTutor ← DrawingAnalysis results
```

**סדר בנייה מומלץ:** Level 0 → 1 → 2 → 3 → 4 → 5 → 6

---

## 4. חובות טכניים (Technical Debt)

### 4.1 קוד כפול
| Issue | Files | Impact |
|-------|-------|--------|
| 3x EmptyState variants | EmptyState, ImprovedEmptyState, EnhancedEmptyState | Confusion, inconsistency |
| 2x Toast variants | EnhancedToast, ImprovedToast | Different APIs used across codebase |
| 2x Share variants | ShareResults, SocialShare | Overlap in functionality |
| 3x LazyLoad variants | LazyLoad, LazyComponent, LazyLoadWrapper | Unnecessary abstractions |
| getSign() duplicated | calculateSolarReturn (3 copies within file) | DRY violation |
| JD calculation duplicated | calculateSolarReturn (3 copies) | Extract to utility |

### 4.2 חוסר Validation
| Issue | Location | Risk |
|-------|----------|------|
| Raw user text in LLM prompts | AIAssistant, AdvancedAICoach, AskQuestion | Prompt injection |
| No XSS sanitization | All user input fields | XSS attacks |
| No file type validation on server | DrawingAnalysis, Graphology, DocumentAnalyzer | Malicious uploads |
| Optional secret key | sendDailyInsights | Unauthorized batch access |

### 4.3 בעיות אבטחה
| Issue | Severity | Location |
|-------|----------|----------|
| No RLS policies | 🔴 Critical | All DB tables (Base44 managed) |
| No rate limiting | 🔴 High | All endpoints |
| Prompt injection risk | 🔴 High | All LLM-facing user inputs |
| Destructive delete without safeguards | 🟡 Medium | cleanupDailyInsights |
| Token briefly in URL | 🟢 Low | app-params.js (removed after read) |
| console.log in production | 🟢 Low | askMysticTutor, ruleEngine |

### 4.4 Hardcoded Data
| Data | Location | Should Be |
|------|----------|-----------|
| Tarot cards (38+) | generateDailyInsight, Tarot.jsx | DB table or JSON config |
| Blog articles (4) | Blog.jsx | CMS or DB |
| AstroCalendar events | AstroCalendar.jsx | Real data source or API |
| Compatibility matrix | calculateNumerologyCompatibility | Config file (valid data, keep logic) |
| Plan definitions | useSubscription, createCheckoutSession | DB or env config |
| READING_TYPES | AstrologyReadings.jsx | Config file |

### 4.5 Files Over 300 Lines
45+ files exceed the 300-line limit. Top offenders:
- generateAstrologyReading: **1731 lines** (split into 5+ modules)
- Numerology.jsx: **1332 lines** (split into form + results + charts)
- AstrologyReadingCard: **1206 lines** (split into section components)
- processDrawingFeatures: **1012 lines** (split by analysis stage)
- BirthChart: **922 lines** (split SVG + data + interactions)

---

## 5. Subscription Model Detail

### Plans & Limits
| Feature | Free | Basic (₪49/mo) | Premium (₪99/mo) | Enterprise |
|---------|------|-----------------|-------------------|------------|
| Analyses/month | 3 | 20 | Unlimited | Unlimited |
| Guest profiles | 1 | 3 | 10 | Unlimited |
| Daily insights | Usage-gated | Yes | Yes | Yes |
| Provenance display | No | No | Yes | Yes |
| Advanced insights | No | No | Yes | Yes |
| AI Coach (advanced) | No | Basic | Full | Full |
| PDF export | No | Yes | Yes | Yes |
| Priority support | No | No | Yes | Dedicated |
| API access | No | No | No | Yes |

### Gating Implementation
- `useSubscription()` hook provides: `canUseAnalysis()`, `canCreateGuestProfile()`, `canUseFeature(name)`
- `SubscriptionGuard` component wraps premium features
- `incrementUsage()` mutation with optimistic updates
- Monthly reset logic in `getSubscriptionStatus`

---

## 6. Data Model (Observed Entities)

```
UserProfile (1:1 per user)
├── name, birth_date, birth_time, birth_place
├── lat, lon, timezone_offset
├── disciplines[], focus_areas[], goals[]
├── ai_suggestions_enabled, onboarding_completed
└── profile_completion_score

Analysis (1:many per user)
├── tool_type (numerology|astrology|palmistry|graphology|tarot|drawing|dream|career|...)
├── input_data (JSON), results (JSON)
├── summary, confidence_score
└── created_date

Subscription (1:1 per user)
├── plan_type (free|basic|premium|enterprise)
├── status (trial|active|cancelled|expired)
├── stripe_customer_id, stripe_subscription_id
├── analyses_used, analyses_limit
├── guest_profiles_used, guest_profiles_limit
├── trial_end_date, start_date, end_date
└── auto_renew, cancel_at_period_end

UserGoal (1:many per user)
├── title, description, category
├── status (active|in_progress|completed)
├── progress (0-100), target_date
├── preferred_tools[], action_plan[]
└── ai_summary, recommendations

MoodEntry (1:many per user)
├── mood, mood_score, energy_level, stress_level, sleep_quality
├── notes, activities[], gratitude[]
└── ai_analysis (JSON)

DailyInsight (1:many per user)
├── title, content, actionable_tip
├── mood_type, focus_area, confidence
├── tarot (card + meaning), data_sources
├── recurring_themes[]
└── user_feedback { rating, comment }

CoachingJourney (1:many per user)
├── title, description, focus_area
├── steps[] { step_number, title, description, type, status, suggestions }
└── tags[], ai_insights, linked_goal_id

PaymentHistory (1:many per user)
├── stripe_payment_id, amount, currency
├── status (succeeded|failed)
└── error_message

UserReminder (1:many per user)
├── type, message, scheduled_date
├── status (pending|sent|dismissed)
└── recurring

AstrologyCalculation (1:many per user)
├── planets[], houses[], aspects[]
├── element_distribution, modality_distribution
└── calculation_method

Dream (1:many per user)
├── title, description, date
├── emotions[], symbols[], people[], location
├── mood_after, is_recurring, is_lucid
├── dreamscape_url, ai_interpretation
└── psychological_themes[], symbol_meanings[]

JournalEntry (1:many per user)
├── title, content, mood, mood_score, energy_level
├── gratitude[], goals[]
└── ai_insights

LearningProgress (1:many per user)
├── topic, level, completed, quiz_score
└── last_studied

MysticSynthesis (1:many per user)
├── personality_profile, predictive_insights[], recommendations[]
├── input_sources[]
└── synthesis_date

Feature (1:many per analysis)
├── analysis_id, tool_type
├── feature_key, feature_value, confidence
└── metadata

Rulebook (system-wide)
├── tool_type, rule_id, condition, insight_template
├── weight, base_confidence, sources[], tags[]
└── is_active

AnalyticsEvent (1:many per user)
├── event_type, page, timestamp
└── metadata
```

---

> **שלב 2a הושלם.** ממשיך ל-02b_GEMS.md
