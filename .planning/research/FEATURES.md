# Feature Landscape

**Domain:** Hebrew-first mystical self-discovery platform — AI coaching, personal journey tracking, payments, profile management
**Researched:** 2026-04-03
**Source:** Direct inspection of BASE44 source pages (temp_source/src/pages/) + PROJECT.md context

---

## Source Inventory

Every target feature has existing BASE44 source code. This is migration + TypeScript hardening, not greenfield design. The table below maps features to their source file and documents what the original built.

| Feature | Source File | Original Completeness |
|---------|------------|----------------------|
| AI Coach (chat + journeys) | AICoach.jsx | High — full chat UI, journey management, streaming via subscription |
| Mystic Synthesis | MysticSynthesis.jsx | High — on-demand + weekly report, personality profile, predictions |
| Goals management | MyGoals.jsx | High — full CRUD, categories, AI recommendations, action plan |
| Mood tracker | MoodTracker.jsx | High — multi-metric sliders, AI pattern analysis after 6 entries |
| Journal | Journal.jsx | High — full CRUD, gratitude, goals, on-demand AI insights |
| Daily insights | DailyInsights.jsx | Medium — display + feedback UI; generation is a cron/function |
| Personality analysis | PersonalityAnalysis.jsx | Medium — Big Five framing missing; uses birth data + LLM only |
| Document analyzer | DocumentAnalyzer.jsx | Medium — upload + analysis type + Q&A; history is local state only |
| Analytics dashboard | AnalyticsDashboard.jsx | Medium — event aggregation, charts, date ranges |
| Notifications | Notifications.jsx | Medium — pending/dismissed/sent tabs, reminder types |
| Settings | UserSettings.jsx | Medium — notification, display, privacy prefs CRUD |
| Referrals | Referrals.jsx | Medium — code generation, email share, completed tracking |
| Stripe payments | TestStripe.jsx | Low — test page only, no real checkout flow |
| Profile + guest profiles | EditProfile.jsx, ManageProfiles.jsx | Medium — basic edit exists; guest is separate |
| Email notifications | — (email service in src/services/) | Low — service layer exists, no transactional templates |

---

## Table Stakes

Features users expect. Missing = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **AI Coach — persistent chat** | Core product promise; chat is center of the UX per memory feedback | High | Supabase Realtime, streaming AI responses, conversation history in DB |
| **AI Coach — coaching journeys** | Listed as distinct tab in source; users expect structured growth plans | Medium | AI function `generateCoachingJourney`, CoachingJourney DB entity |
| **Goals CRUD with progress tracking** | Every personal growth app has goals; progress bar is visual anchor | Medium | UserGoal entity, progress_percentage field, category system |
| **Mood tracker — log entry** | Daily tracking loop; without it mood insights are meaningless | Low | MoodEntry entity, 4-metric sliders (mood/energy/stress/sleep) |
| **Mood tracker — AI pattern analysis** | The AI insight after 6+ entries is the payoff; users wait for it | Medium | LLM call with last-7-days average comparison |
| **Journal — CRUD with gratitude** | Self-discovery context requires reflection journal | Low | JournalEntry entity, gratitude_items array, goals array |
| **Journal — on-demand AI insights** | Button per entry that calls LLM; users expect the "reveal" moment | Medium | LLM prompt with entry content + mood + gratitude |
| **Daily insights — display page** | Cron generates; page must display with feedback (thumbs up/down) | Low | DailyInsight entity, user_feedback field |
| **Daily insights — generation cron** | Without cron, the page is always empty | High | Supabase cron (pg_cron) or Vercel cron, LLM batch per user |
| **Mystic synthesis — on-demand** | Connects all 13 tools into one holistic profile; core value prop | High | Must read recent analyses across all tool types, LLM synthesis |
| **Profile edit** | Name, birth data, location — required for personalization | Low | UserProfile entity, LocationSearch component already built |
| **Notifications page** | Reminder management; pending/dismissed/sent tabs | Low | UserReminder entity, 5 reminder types |
| **Settings page** | Notification prefs, display prefs, privacy prefs | Low | notification_settings + display_settings JSON fields on UserProfile |
| **Stripe checkout** | Without payments the subscription tiers are fake | High | Stripe SDK, checkout session API, webhook handler |
| **Subscription success/cancel pages** | Post-checkout redirect required by Stripe | Low | Depends on Stripe checkout |
| **Email — welcome** | Every SaaS sends a welcome email | Low | Resend (already in services), welcome template |
| **Email — payment failed** | Critical for subscription health | Low | Stripe webhook `invoice.payment_failed` event |
| **Analytics dashboard** | Existing users, tool usage, session metrics | Medium | AnalyticsEvent entity already tracking from v1.2 |

---

## Differentiators

Features that set this product apart. Not table stakes but meaningfully valued.

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Mystic synthesis — weekly report** | Usage pattern analysis + spiritual integration suggestions + period summary | High | Must have usage data; `generateWeeklyReport` function |
| **Personality analysis (Big Five framing)** | Bridges psychological Big Five with mystical data (birth + name); unique positioning | High | LLM with structured JSON output: openness, conscientiousness, etc. mapped to mystical traits |
| **Document analyzer** | Upload PDF/image/text + choose analysis type (career/relationship/etc) + ask follow-up Q | High | File upload to Supabase Storage, vision AI for images, multi-turn context |
| **Goal AI recommendations + action plan** | AI generates mystical-tool-linked action steps for each goal | High | `generateGoalRecommendations` function, links goals to specific tools |
| **Journey dashboard** | Coaching journeys as structured step-by-step plans with completion tracking | Medium | CoachingJourney entity, progress_percentage, step status updates |
| **Referral system with rewards** | Unique referral code per user, reward on conversion, email sharing | Medium | Referral entity, reward_value tracking, email integration |
| **Guest profiles** | Users run analyses for family members; unique positioning for Hebrew family-oriented market | Medium | UserProfile with is_guest flag, profile switcher |
| **AI insights cross-tool awareness** | Coach and synthesis both read analysis history — insights that reference "your tarot showed X but numerology says Y" | High | Analysis entity read across all tool types, LLM context injection |

---

## Anti-Features

Features to explicitly NOT build in this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Real-time mood chart with Recharts** | Mood entries show as cards in source; chart is extra complexity for marginal UX gain | Simple card list; add chart only if time allows as enhancement |
| **Admin panel for insights** | Out of scope per PROJECT.md — use Supabase Studio | Supabase Studio is the admin; no custom admin UI |
| **Social sharing of analyses** | Out of scope (social features deferred to v3.0) | Privacy-first; keep all data private |
| **Mobile push notifications** | settings.push_notifications exists in source but is always false; requires separate PWA/service worker work | Email notifications only for v1.3; push in v2.0 |
| **Multi-language UI** | Hebrew-only per PROJECT.md constraint | Single language, no i18n library |
| **Big Five as standalone questionnaire** | Source uses birth data + LLM only, not a validated psychometric instrument | Frame as "mystical personality profile" not clinical Big Five; prevents scope creep into validated assessment |
| **Stripe subscription management portal** | Stripe Customer Portal can be used instead of building custom UI | Use `stripe.billingPortal.sessions.create()` redirect — 1 API call replaces full UI |
| **Document history persistence** | Source stores previous analyses in local state only — no DB entity | Keep session-only; heavy storage costs for documents |
| **Full test suite** | Listed in PROJECT.md but not a user-facing feature | Core service unit tests only; no E2E for v1.3 |

---

## Feature Dependencies

```
Stripe checkout
  → Stripe webhooks (subscription created/updated/deleted)
    → UserProfile subscription fields update
    → Email: payment confirmation
    → Email: payment failed

Daily insights cron
  → UserProfile (birth data, past analyses exist)
  → DailyInsight entity
  → Display page (already has feedback UI)

Mystic synthesis
  → Analysis history (all 13 tools must have at least one run each OR it gracefully handles partial data)
  → LLM wrapper (already built in Phase 1)

Goal AI recommendations
  → UserGoal entity (created first)
  → AI Coach (can reference same recommendations)
  → Mystical tools (linked recommendations point to specific tools)

AI Coach streaming
  → Supabase Realtime (subscription to conversation updates)
  → conversation entity in DB
  → CoachingJourney entity (journey tab depends on same page)

Mood AI pattern analysis
  → 6+ mood entries must exist before AI runs
  → LLM wrapper

Journal AI insights
  → JournalEntry must be saved first
  → LLM wrapper

Referral rewards
  → Stripe (reward = trial extension or discount coupon — requires Stripe coupon API)
  → UserProfile (reward applied to subscription)

Notifications (UserReminder)
  → Settings (notification_settings prefs gate what gets created)
  → Email service (for email-type reminders)
  → Cron or Supabase trigger (to fire reminders at remind_date)

Analytics dashboard
  → AnalyticsEvent entity (already being populated in v1.2)
  → No new dependencies — just query + aggregate + chart
```

---

## Complexity Map

Ordered from most to least complex to implement correctly.

| Feature | Complexity | Reason |
|---------|------------|--------|
| Stripe integration | Very High | Checkout session, 5 webhook event types, idempotency, RLS on subscription fields |
| Daily insights cron | Very High | Supabase pg_cron OR Vercel cron, per-user personalization at scale, rate limits |
| AI Coach streaming | High | Supabase Realtime subscription + message ordering + optimistic UI |
| Mystic synthesis | High | Cross-tool data aggregation, LLM context window limits, graceful partial-data handling |
| Document analyzer | High | File upload to Storage, vision AI for images, multi-turn Q&A context |
| Personality analysis (Big Five framing) | High | Structured JSON schema, linking mystical data to psychological dimensions |
| Goal AI recommendations | High | `generateGoalRecommendations` function with mystical tool linking |
| Coaching journeys | Medium | Step tracking, progress computation, journey generation function |
| Mood AI analysis | Medium | Fire-and-forget after save, update entry with results asynchronously |
| Journal AI insights | Medium | On-demand LLM call, save result back to entry |
| Referral system | Medium | Code generation, conversion tracking, reward application |
| Email notifications | Medium | Resend templates (3: welcome, payment-failed, usage-limit), webhook triggers |
| Analytics dashboard | Medium | Query aggregation, Recharts visualization, date range filtering |
| Goals CRUD | Low | Standard CRUD with category + progress tracking |
| Mood tracker log | Low | Form submission with sliders |
| Journal CRUD | Low | Standard CRUD with gratitude/goals arrays |
| Profile edit | Low | Form already exists in source |
| Settings page | Low | Toggle switches for JSON pref fields |
| Notifications page | Low | List with read/dismiss/delete |
| Daily insights display | Low | Query + card list + thumbs feedback |

---

## MVP Recommendation

The milestone has many features. Prioritize in this order to ensure the core platform works end-to-end:

**Must ship first (blocking other things):**
1. Stripe checkout + webhooks — without this, subscriptions are fake and limits are unenforced
2. AI Coach chat — the literal center of the product per UX priority feedback
3. Goals CRUD — fast win, high user value, no complex dependencies
4. Mood tracker — fast win, daily habit loop, minimal backend

**Ship second (high value, medium complexity):**
5. Journal with AI insights — completes the personal journey trio (goals + mood + journal)
6. Daily insights cron + display — gives users a reason to return daily
7. Mystic synthesis — headline feature connecting all 13 tools
8. Profile + settings — required for personalization to work correctly

**Ship third (differentiators + infra):**
9. Email notifications (welcome + payment-failed minimum)
10. Personality analysis (Big Five framing)
11. Document analyzer
12. Coaching journeys
13. Analytics dashboard
14. Referrals
15. Notifications page
16. Guest profiles

**Defer if time runs out:**
- Referral reward application (complex Stripe coupon flow)
- Document analysis history persistence
- Mood/analytics charts (card lists work fine)
- Performance/accessibility pass (can be own phase)
- Test suite (can be own phase)

---

## Existing Code to Preserve

The BASE44 source defines the exact UX contract. Migration must preserve these behaviors:

| Behavior | Source Evidence |
|----------|----------------|
| Mood AI analysis fires only after 6+ entries | `if (moodEntries.length >= 6)` check in createMoodMutation |
| AI Coach auto-creates conversation on first message | `if (!currentConversationId)` guard in handleSendMessage |
| Synthesis supports both on-demand and weekly modes | `type === 'weekly'` branch in generateSynthesisMutation |
| Goals have 8 categories with Hebrew labels + icons + gradient colors | GOAL_CATEGORIES constant |
| Mood has 10 distinct options with emoji | MOOD_OPTIONS constant |
| Journal gratitude is an array (not a single text) | `gratitude_items: ["", "", ""]` default |
| Document analyzer supports 4 file types, 10MB max | allowedTypes + size check |
| Referral code format is `MASAPNIMA-{username}-{6chars}` | Code generation in useEffect |
| Notifications split into pending/dismissed/sent tabs | 3 separate queries |
| Settings has 3 JSON preference groups | notification_settings, display_settings, privacy_settings |
| Daily insights feedback is thumbs-up/down + text comment | user_feedback object with rating + comment |

---

## Sources

- Direct code inspection: `temp_source/src/pages/AICoach.jsx`
- Direct code inspection: `temp_source/src/pages/MysticSynthesis.jsx`
- Direct code inspection: `temp_source/src/pages/MyGoals.jsx`
- Direct code inspection: `temp_source/src/pages/MoodTracker.jsx`
- Direct code inspection: `temp_source/src/pages/Journal.jsx`
- Direct code inspection: `temp_source/src/pages/PersonalityAnalysis.jsx`
- Direct code inspection: `temp_source/src/pages/DocumentAnalyzer.jsx`
- Direct code inspection: `temp_source/src/pages/DailyInsights.jsx`
- Direct code inspection: `temp_source/src/pages/UserSettings.jsx`
- Direct code inspection: `temp_source/src/pages/Referrals.jsx`
- Direct code inspection: `temp_source/src/pages/AnalyticsDashboard.jsx`
- Direct code inspection: `temp_source/src/pages/Notifications.jsx`
- Project context: `.planning/PROJECT.md`
- Migration state: `.planning/STATE.md`
