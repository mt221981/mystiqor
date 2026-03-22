# MystiQor — Complete Screen Map

> All screens in the system: what exists, what's planned, what each screen contains.
> Updated: 2026-03-22

---

## Summary

| Category | Built | Stub | Missing | Total |
|----------|-------|------|---------|-------|
| Public | 2 | 0 | 3 | 5 |
| Dashboard & Core | 2 | 0 | 3 | 5 |
| Tracking & Personal | 4 | 0 | 2 | 6 |
| Tools | 5 | 12 | 0 | 17 |
| AI & Coach | 0 | 0 | 3 | 3 |
| Growth & Monetization | 0 | 0 | 4 | 4 |
| Learning & History | 0 | 0 | 6 | 6 |
| **Total** | **13** | **12** | **21** | **46** |

---

## 1. PUBLIC PAGES (No Auth Required)

### 1.1 `/login` — דף התחברות
**Status:** BUILT
| Element | Details |
|---------|---------|
| Layout | Full-page centered card, RTL, dark theme |
| Modes | 3 tabs: התחברות (login), הרשם עכשיו (register), קישור קסם (magic link) |
| Form fields | Email + password (login/register), email only (magic link) |
| Validation | Zod — email format, password 6+ chars |
| After auth | Redirects to `?next=` param or `/onboarding` (new) / `/dashboard` (returning) |
| Error display | Hebrew error messages, toast notifications |
| Components | Card, Input, Button, Tabs, toast (Sonner) |

### 1.2 `/` — דף הבית
**Status:** BUILT (placeholder)
| Element | Details |
|---------|---------|
| Layout | ToolGrid with clickable cards for each analysis tool |
| Hero | Daily insight widget (placeholder "בקרוב") |
| Behavior | Redirects to `/login` if not authenticated |

### 1.3 `/pricing` — תוכניות מנוי
**Status:** MISSING
| Element | Details |
|---------|---------|
| Layout | 3 plan cards side-by-side (Free / Basic ₪49 / Premium ₪99) |
| Each card | Plan name, price, feature list, CTA button |
| Highlight | Premium plan highlighted/recommended |
| CTA | "התחל בחינם" / "הירשם" → Stripe checkout |
| Source ref | `github-source/src/pages/Pricing.jsx` |

### 1.4 `/blog` — בלוג
**Status:** MISSING
| Element | Details |
|---------|---------|
| Layout | Blog post list with cards, search, categories |
| Each card | Title, excerpt, date, category badge, read more link |
| Source ref | `github-source/src/pages/Blog.jsx` |

### 1.5 `/subscription/success` — הצלחת מנוי
**Status:** MISSING
| Element | Details |
|---------|---------|
| Layout | Success confirmation card |
| Content | Checkmark icon, "המנוי שלך הופעל!", plan name, feature summary |
| CTA | "התחל להשתמש" → `/dashboard` |

---

## 2. DASHBOARD & CORE

### 2.1 `/dashboard` — לוח בקרה
**Status:** BUILT
| Element | Details |
|---------|---------|
| Hero | DailyInsightCard — zodiac sign + numerology day number, gradient purple background |
| Stat cards (4) | יעדים פעילים (emerald), ציון מצב רוח (amber), יעדים שהושלמו (purple), תזכורות ממתינות (blue) |
| Period selector | 3 tabs: יומי / שבועי / חודשי — affects charts below |
| Chart grid (2x2) | BiorhythmChart (3 sine waves), MoodTrendChart (area chart), GoalsProgressChart (bar by category), AnalysesChart (bar by tool) |
| Data sources | `profiles`, `mood_entries`, `goals`, `analyses`, `reminders` |
| Components | ErrorBoundary, Breadcrumbs, Recharts, React Query with period-aware caching |

### 2.2 `/onboarding` — אשף כניסה
**Status:** BUILT
| Element | Details |
|---------|---------|
| Layout | Multi-step wizard (4 steps) |
| Step 1 | Full name + gender |
| Step 2 | Birth date + birth time |
| Step 3 | Birth place (LocationSearch with geocoding) |
| Step 4 | Disciplines, focus areas, personal goals, Barnum consent checkbox |
| Submit | POST `/api/onboarding/complete` → creates profile + free subscription |
| After | Redirect to `/tools` |

### 2.3 `/daily-insights` — תובנות יומיות
**Status:** MISSING (Phase 4)
| Element | Details |
|---------|---------|
| Layout | Daily card feed — today's insight at top, history below |
| Each card | Zodiac icon, numerology number, tarot card, combined message |
| Content | AI-generated from user's birth data + current transits |
| Source ref | `github-source/src/pages/DailyInsights.jsx`, `DailyForecast.jsx` |

### 2.4 `/notifications` — התראות
**Status:** MISSING (Phase 8)
| Element | Details |
|---------|---------|
| Layout | Notification list with unread indicator |
| Types | Reminders, analysis ready, subscription, daily insight |
| Actions | Mark read, dismiss, navigate to source |
| Source ref | `github-source/src/pages/Notifications.jsx` |

### 2.5 `/analytics` — אנליטיקס אישי
**Status:** MISSING (Phase 9)
| Element | Details |
|---------|---------|
| Layout | Advanced analytics dashboard |
| Charts | Usage patterns, tool breakdown pie chart, mood heatmap, time-of-day analysis |
| Source ref | `github-source/src/pages/AnalyticsDashboard.jsx` |

---

## 3. TRACKING & PERSONAL

### 3.1 `/mood` — מעקב מצב רוח
**Status:** BUILT
| Element | Details |
|---------|---------|
| Input form | MoodEmojiPicker (5 emojis: 😞😕😐🙂😄 → scores 2,4,6,8,10) |
| Sliders (3) | רמת אנרגיה (1-10), רמת לחץ (1-10), איכות שינה (1-10) |
| Notes | Optional textarea for free-text thoughts |
| Entry list | Recent entries with emoji, date (Hebrew), energy/stress/sleep badges |
| Actions | Submit new entry, delete existing entry |
| Integration | Link to journal ("הרחב ליומן") with mood pre-fill via URL params |
| Data | `/api/mood` POST/GET, `/api/mood/[id]` DELETE |
| Components | MoodEmojiPicker, MoodEntryCard, Slider, ErrorBoundary, Breadcrumbs, EmptyState |

### 3.2 `/journal` — יומן אישי
**Status:** BUILT
| Element | Details |
|---------|---------|
| Entry form | Title, content (textarea), MoodEmojiPicker, energy slider |
| Gratitude | 3 text inputs for daily gratitude items |
| Goal links | Multi-select from active goals |
| Modes | Full entry (all fields) / Quick entry (mood + one line) |
| Entry list | Cards with mood emoji, date, content preview, edit/delete |
| Pre-fill | Reads `?mood_score=` and `?mood=` from URL (D-07 integration) |
| Data | `/api/journal` GET/POST, `/api/journal/[id]` PATCH/DELETE |
| Components | JournalEntryForm, JournalEntryCard, Dialog, ErrorBoundary, Breadcrumbs |

### 3.3 `/goals` — המטרות שלי
**Status:** BUILT
| Element | Details |
|---------|---------|
| Goal form | Title, description, category (8 options), target date, preferred tools |
| Categories | קריירה, יחסים, צמיחה_אישית, בריאות, רוחניות, יצירתיות, כלכלה, אחר |
| Category colors | Each has unique color + Hebrew label |
| Progress | Slider 0-100% + quick "+10%" button on card |
| Status tabs | הכל / פעיל / בתהליך / הושלם |
| Goal card | Category badge, status badge, progress bar, edit/delete actions |
| Linker (TRCK-04) | Link goals to specific analyses via checkbox list |
| Data | `/api/goals` GET/POST, `/api/goals/[id]` PATCH/DELETE |

### 3.4 `/profile` — הפרופיל שלי
**Status:** BUILT
| Element | Details |
|---------|---------|
| Tab 1: Profile | ProfileEditForm — name, birth date/time/place, gender, disciplines, focus areas |
| Tab 2: Guests | GuestProfileList — add/edit/delete guest profiles (birth data only) |
| Guest limits | Free=1, Basic=3, Premium=8 (enforced at API level) |
| Components | Tabs, ProfileEditForm, GuestProfileList, BirthDataForm, LocationSearch |
| Data | `/api/profile` GET/PATCH, `/api/guest-profiles` GET/POST/PATCH/DELETE |

### 3.5 `/settings` — הגדרות
**Status:** BUILT
| Element | Details |
|---------|---------|
| Theme | Dark/light toggle (Zustand + localStorage) |
| Notifications | Placeholder toggles with "בקרוב" badge |
| AI preferences | Toggle for AI suggestions opt-in/out |

### 3.6 `/referrals` — הפניות
**Status:** MISSING (Phase 8)
| Element | Details |
|---------|---------|
| Layout | Referral link + copy button, referral stats, reward progress |
| Source ref | `github-source/src/pages/Referrals.jsx` |

---

## 4. ANALYSIS TOOLS

### 4.1 `/tools/numerology` — נומרולוגיה
**Status:** BUILT
| Element | Details |
|---------|---------|
| Form | Name (Hebrew) + birth date |
| Output | 5 NumberCards: מספר מסלול חיים, מספר גורל, מספר נשמה, מספר אישיות, שנה אישית |
| Each card | Number in circle, Hebrew label, color-coded |
| Interpretation | AI-generated markdown text below cards |
| Components | PageHeader, NumberCard, SubscriptionGuard, ReactMarkdown |

### 4.2 `/tools/tarot` — טארוט
**Status:** BUILT
| Element | Details |
|---------|---------|
| Form | Spread selector (1/3/5 cards), optional question |
| Output | Card grid with name, image, keywords, arcana badge |
| Interpretation | AI-generated reading combining all cards |
| Components | PageHeader, SubscriptionGuard, Card grid, Badge, ReactMarkdown |

### 4.3 `/tools/dream` — ניתוח חלומות
**Status:** BUILT
| Element | Details |
|---------|---------|
| Form | Dream title, description (textarea), date, emotion tags, symbol tags |
| Processing | Async — submits then polls every 5 seconds until complete |
| Output | AI interpretation with symbols analysis |
| Components | PageHeader, TagInput, SubscriptionGuard, ReactMarkdown |

### 4.4 `/tools/palmistry` — כירומנטיה
**Status:** BUILT
| Element | Details |
|---------|---------|
| Form | Image upload (file) OR image URL |
| Output | AI analysis of heart/head/life/fate lines |
| Upload | Uses `/api/upload` → Supabase Storage → LLM vision |
| Components | PageHeader, SubscriptionGuard, file input, ReactMarkdown |

### 4.5 `/tools/human-design` — עיצוב אנושי
**Status:** BUILT
| Element | Details |
|---------|---------|
| Form | Birth date + time + place (LocationSearch) |
| Output | 9 energy centers map (HumanDesignCenters), type/profile/authority, strengths/challenges |
| Disclosure | Notice that this is AI-simulated, not ephemeris-based |
| Components | PageHeader, HumanDesignCenters, LocationSearch, SubscriptionGuard |

### 4.6 `/tools/astrology` — אסטרולוגיה (מפת לידה)
**Status:** STUB (Phase 4)
| Element | Details |
|---------|---------|
| Form | Birth date + time + place |
| Output | SVG birth chart wheel (ZodiacRing, PlanetPositions, AspectLines, HouseOverlay) |
| Info panels | Sun/Moon/Rising signs, house placements, aspect table |
| Sub-pages | `/readings`, `/calendar` |
| Source ref | `github-source/src/pages/Astrology.jsx` (922 lines) |
| Key challenge | BirthChart SVG decomposition — split 922-line monolith into 4 sub-components |

### 4.7 `/tools/astrology/solar-return` — מהפכה שמשית
**Status:** STUB (Phase 6)
| Element | Details |
|---------|---------|
| Form | Birth data (auto-filled from profile) |
| Output | Annual chart + comparison with natal chart |
| Source ref | `github-source/src/pages/SolarReturn.jsx` |

### 4.8 `/tools/astrology/transits` — מעברים
**Status:** STUB (Phase 6)
| Element | Details |
|---------|---------|
| Form | Birth data (auto-filled) |
| Output | Current planetary positions affecting user's natal chart |
| Key challenge | BASE44 version is MOCKED — needs real Swiss Ephemeris WASM |
| Source ref | `github-source/src/pages/Transits.jsx` |

### 4.9 `/tools/astrology/synastry` — סינסטרי
**Status:** STUB (Phase 6)
| Element | Details |
|---------|---------|
| Form | 2 sets of birth data (user + partner/guest) |
| Output | Dual chart overlay, inter-aspects, compatibility analysis |
| Source ref | `github-source/src/pages/Synastry.jsx` |

### 4.10 `/tools/compatibility` — התאמה רומנטית
**Status:** STUB (Phase 5)
| Element | Details |
|---------|---------|
| Form | 2 sets of birth data + names |
| Output | Compatibility score (astro + numerology blend), strengths/challenges |
| Source ref | `github-source/src/pages/Compatibility.jsx` |

### 4.11 `/tools/graphology` — גרפולוגיה
**Status:** STUB (Phase 5)
| Element | Details |
|---------|---------|
| Form | Handwriting image upload |
| Output | Personality traits, Koppitz indicators, FDM visualization, timeline |
| Key components | AnnotatedDrawingViewer, KoppitzIndicatorsVisualization, FDMVisualization, GraphologyTimeline |
| Source ref | `github-source/src/pages/Graphology.jsx` |

### 4.12 `/tools/drawing` — ניתוח ציורים
**Status:** STUB (Phase 5)
| Element | Details |
|---------|---------|
| Form | DigitalCanvas (in-browser drawing) OR image upload |
| Output | Psychological interpretation with color/shape/position analysis |
| Key components | DigitalCanvas (freehand drawing), AnnotatedDrawingViewer |
| Source ref | `github-source/src/pages/DrawingAnalysis.jsx` |

### 4.13 `/tools/personality` — ניתוח אישיות
**Status:** STUB (Phase 4)
| Element | Details |
|---------|---------|
| Form | Questionnaire (MBTI-style questions) |
| Output | Personality type, trait breakdown, career suggestions |
| Source ref | `github-source/src/pages/PersonalityAnalysis.jsx` |

### 4.14 `/tools/career` — הדרכת קריירה
**Status:** STUB (Phase 6)
| Element | Details |
|---------|---------|
| Form | Birth data + career interests + current situation |
| Output | Career path recommendations based on astrological profile |
| Source ref | `github-source/src/pages/CareerGuidance.jsx` |

### 4.15 `/tools/timing` — כלי תזמון
**Status:** STUB (Phase 6)
| Element | Details |
|---------|---------|
| Form | Event type + date range |
| Output | Best dates calendar, void-of-course moon warnings, planetary hours |
| Source ref | `github-source/src/pages/TimingTools.jsx` |

### 4.16 `/tools/question` — שאל שאלה
**Status:** STUB (Phase 7)
| Element | Details |
|---------|---------|
| Form | Free-text question input |
| Output | Oracle answer combining tarot + numerology + astrology |
| Source ref | `github-source/src/pages/AskQuestion.jsx` |

### 4.17 `/tools/synthesis` — סינתזה מיסטית
**Status:** STUB (Phase 7)
| Element | Details |
|---------|---------|
| Form | Select which tools to combine (checkboxes) |
| Output | Cross-tool unified interpretation (THE differentiating feature) |
| Source ref | `github-source/src/pages/MysticSynthesis.jsx` |

---

## 5. AI & COACH

### 5.1 `/coach` — מאמן AI
**Status:** MISSING (Phase 7)
| Element | Details |
|---------|---------|
| Layout | Chat interface with message bubbles |
| Input | Text input + send button, voice input (future) |
| Messages | User bubble (right/RTL), AI bubble (left), typing indicator |
| Features | Conversation history, topic suggestions, save insight |
| Backend | Supabase Realtime for streaming, coaching_messages table |
| Source ref | `github-source/src/pages/AICoach.jsx` |

### 5.2 `/coach/journey` — מסעות אימון
**Status:** MISSING (Phase 7)
| Element | Details |
|---------|---------|
| Layout | Journey cards with progress, create new journey |
| Each journey | Title, description, step count, progress bar, current step |
| Source ref | `github-source/src/pages/JourneyDashboard.jsx` |

### 5.3 `/tools/document` — ניתוח מסמכים
**Status:** STUB (Phase 6)
| Element | Details |
|---------|---------|
| Form | Document upload (PDF/image) |
| Output | Text extraction + AI analysis |
| Source ref | `github-source/src/pages/DocumentAnalyzer.jsx` |

---

## 6. GROWTH & MONETIZATION

### 6.1 `/subscription` — ניהול מנוי
**Status:** MISSING (Phase 8)
| Element | Details |
|---------|---------|
| Layout | Current plan card + upgrade/downgrade options |
| Content | Plan name, price, usage stats, renewal date, payment method |
| Actions | Upgrade, downgrade, cancel, update payment |
| Source ref | `github-source/src/pages/ManageSubscription.jsx` |

### 6.2 `/referrals` — תוכנית הפניות
**Status:** MISSING (Phase 8)
| Element | Details |
|---------|---------|
| Layout | Referral link with copy button, stats dashboard |
| Content | Total referrals, successful conversions, rewards earned |
| Source ref | `github-source/src/pages/Referrals.jsx` |

### 6.3 `/pricing` — תוכניות ומחירים
**Status:** MISSING (Phase 8)
| Element | Details |
|---------|---------|
| Layout | 3 plan cards with feature comparison table |
| Plans | Free (3/month), Basic (₪49, unlimited), Premium (₪99, premium tools) |
| CTA | Stripe checkout integration |
| Source ref | `github-source/src/pages/Pricing.jsx` |

### 6.4 `/subscription/success` — אישור מנוי
**Status:** MISSING (Phase 8)
| Element | Details |
|---------|---------|
| Layout | Success confirmation with confetti animation |
| Content | Plan activated message, feature list, CTA to dashboard |

---

## 7. LEARNING & HISTORY

### 7.1 `/history` — היסטוריית ניתוחים
**Status:** MISSING (Phase 9)
| Element | Details |
|---------|---------|
| Layout | Filterable list of all past analyses |
| Filters | By tool type, date range, search text |
| Each card | Tool icon, date, summary snippet, view/compare buttons |
| Source ref | `github-source/src/pages/myanalyses.jsx` |

### 7.2 `/history/compare` — השוואת ניתוחים
**Status:** MISSING (Phase 9)
| Element | Details |
|---------|---------|
| Layout | Side-by-side comparison of 2 analyses |
| Selector | Pick 2 analyses from history to compare |
| Source ref | `github-source/src/pages/CompareAnalyses.jsx` |

### 7.3 `/learn` — למידה
**Status:** MISSING (Phase 9)
| Element | Details |
|---------|---------|
| Layout | Tutorial card grid by topic |
| Topics | Astrology basics, numerology, tarot meanings, dream symbols |
| Source ref | `github-source/src/pages/Tutorials.jsx` |

### 7.4 `/learn/astrology` — לימוד אסטרולוגיה
**Status:** MISSING (Phase 9)
| Element | Details |
|---------|---------|
| Layout | Interactive lessons with quiz |
| Content | Signs, planets, houses, aspects — progressive learning path |
| Source ref | `github-source/src/pages/AstrologyTutor.jsx` |

### 7.5 `/learn/drawing` — לימוד ציור
**Status:** MISSING (Phase 9)
| Element | Details |
|---------|---------|
| Layout | Drawing interpretation tutorials |
| Content | Color meanings, shape significance, position analysis |
| Source ref | `github-source/src/pages/DrawingTutor.jsx` |

### 7.6 `/analytics` — אנליטיקס אישי
**Status:** MISSING (Phase 9)
| Element | Details |
|---------|---------|
| Layout | Advanced self-analytics dashboard |
| Charts | Usage patterns heatmap, tool distribution pie, mood calendar, streak tracker |
| Source ref | `github-source/src/pages/AnalyticsDashboard.jsx` |

---

## APP SHELL (Present on All Authenticated Pages)

### Sidebar (Desktop)
| Element | Details |
|---------|---------|
| Width | 256px fixed, collapsible |
| Sections | ראשי (Dashboard, Daily Insights), כלים מיסטיים (Astrology, Numerology, Tarot, etc.), מתקדם (Graphology, Drawing, Human Design, etc.), מסע אישי (Coach, Goals, Mood, Journal), למידה (Tutorials, Tutor), חשבון (Profile, Settings, Subscription) |
| Footer | Usage bar (used/limit), sign-out button |
| State | Active route highlighted |

### Header
| Element | Details |
|---------|---------|
| Left (RTL) | Mobile menu hamburger (hidden on desktop) |
| Center | Page title |
| Right (RTL) | Theme toggle (sun/moon icon), user avatar dropdown (Profile, Settings, Sign out) |

### MobileNav
| Element | Details |
|---------|---------|
| Trigger | Hamburger in Header (visible < 768px) |
| Layout | Full-screen overlay, slide from right (RTL) |
| Content | Same as Sidebar sections |
| Close | X button, ESC key, tap outside |

---

## DESIGN SYSTEM

### Colors (Dark Theme Default)
- **Background:** `hsl(240 10% 3.9%)` (near-black)
- **Card:** `hsl(240 10% 7%)` (dark gray)
- **Primary:** Purple gradient (`from-purple-600 to-indigo-600`)
- **Accent colors per tool:** Emerald (goals), Amber (mood), Purple (completed), Blue (reminders)
- **Category colors:** 8 unique colors for goal categories

### Typography
- **Font:** Assistant (Hebrew-optimized Google Font)
- **Direction:** RTL always (`dir="rtl"` on root)
- **Alignment:** `text-start` / `text-end` — never `text-left` / `text-right`

### Components (shadcn/ui)
All 22+ shadcn/ui primitives installed: Button, Card, Input, Label, Textarea, Badge, Dialog, Tabs, Accordion, Alert, Separator, Skeleton, Progress, Tooltip, Switch, Select, Sheet, DropdownMenu, Popover, ScrollArea, Form, Checkbox, RadioGroup, Slider

### Animations (Framer Motion)
- Page transitions: `fadeInUp` (opacity 0→1, y 12→0, 0.3s)
- Button interactions: `whileTap={{ scale: 0.95 }}`
- Card hover: subtle shadow/scale

### Patterns
- **Forms:** React Hook Form + Zod + Hebrew error messages
- **Data fetching:** React Query (useQuery reads, useMutation writes)
- **State:** Zustand for client (theme), React Query for server
- **Toasts:** Sonner with Hebrew messages
- **Loading:** Skeleton components per page
- **Empty:** EmptyState component with icon + message + action CTA
- **Errors:** ErrorBoundary with auto-recovery (GEM 10)
