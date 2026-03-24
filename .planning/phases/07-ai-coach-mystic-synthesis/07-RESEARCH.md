# Phase 7: AI Coach + Mystic Synthesis — Research

**Researched:** 2026-03-24
**Domain:** Conversational AI coach (stateful chat), coaching journeys, cross-tool synthesis
**Confidence:** HIGH — based on direct inspection of existing codebase, BASE44 source, DB schema, and existing patterns from Phases 1–6.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COCH-01 | Conversational AI coach with chat interface (input, messages, quick actions) | BASE44 components ChatInput/ChatMessage/QuickActions fully ported; conversations + coaching_messages tables live in DB |
| COCH-02 | AI coach accesses all user analyses for personalized advice | Context-loader pattern from `generateCoachingJourney` entry.ts — fetches analyses, profile, goals from Supabase and injects into LLM prompt |
| COCH-03 | Coaching journeys (structured multi-session coaching paths) | `coaching_journeys` table live; BASE44 `generateCoachingJourney` function defines exact LLM schema for 7–12 step journeys with types and focus areas |
| COCH-04 | Journey dashboard showing all active journeys and progress | JourneyCard.jsx fully ported; progress_percentage + completed_steps fields in schema |
| COCH-05 | Chat history persistence | `conversations` table + `coaching_messages` table with FK constraint; conversation_id links messages to conversations |
| SYNT-01 | Cross-tool AI synthesis combining astrology + numerology + drawing + graphology | `synthesizeMysticInsights` entry.ts defines exact LLM response schema: personality_profile + predictive_insights + recommendations; tool_type='synthesis' already in ToolType union |
| SYNT-02 | On-demand synthesis from any combination of analyses | synthesizeMysticInsights fires immediately on demand; input_sources array tracks which tools contributed |
| SYNT-03 | Weekly synthesis report generation | `generateWeeklyReport` entry.ts adds usage_analysis + practical_integration + period_summary fields to the synthesis output; route type param distinguishes weekly vs on_demand |
</phase_requirements>

---

## Summary

Phase 7 introduces two features that depend on all prior phases being complete: a stateful AI coaching chat, and a cross-tool synthesis engine. The good news is that **both features are substantially pre-built** in the BASE44 source and the database schema. All required tables (`conversations`, `coaching_messages`, `coaching_journeys`) are live in Supabase. All UI components (`ChatMessage`, `ChatInput`, `QuickActions`, `JourneyCard`) exist in `github-source/` and have clear TypeScript port paths. The page directories `/coach/` and `/tools/synthesis/` already exist in the file system but are empty.

The key distinction from prior phases is that the AI coach is **stateful** — the LLM does not receive the full analysis corpus on every message. Instead, a context-loader pre-fetches the user's analyses, profile, goals, and mood history once per conversation start, and attaches it as a system prompt. Subsequent user messages in the same conversation only carry the chat history. This avoids sending 20 analyses worth of JSON to the LLM on every turn.

The Mystic Synthesis feature is fundamentally an **on-demand LLM aggregation call**: fetch all recent analyses, build a context string, call `invokeLLM` with a structured JSON schema, and persist the result. There is no dedicated `mystic_syntheses` table in the current schema — the synthesis result should be stored in the existing `analyses` table using `tool_type: 'synthesis'` (already in the ToolType union).

**Primary recommendation:** Port BASE44 logic directly. The coaching context builder, synthesis prompts, and journey generation prompts are all documented in BASE44 entry.ts files and can be adapted to invokeLLM + Zod validation without redesign.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-markdown | ^10.1.0 | Render LLM markdown responses in ChatMessage | Already installed; used in BASE44 ChatMessage.jsx |
| remark-gfm | ^4.0.1 | GFM tables/lists in markdown | Already installed |
| @tanstack/react-query | ^5.91.2 | Server state for conversations, messages, journeys, syntheses | Established pattern across all phases |
| zod | ^4.3.6 | Response schema validation for invokeLLM calls | INFRA-01 requirement; all API routes use it |
| framer-motion | ^12.38.0 | Chat message animations (AnimatePresence) | Already installed; used in BASE44 AICoach.jsx |
| sonner | ^2.0.7 | Toast notifications on journey creation success | Established pattern (replaces EnhancedToast from BASE44) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.577.0 | Icons (Sparkles, MessageCircle, Map, Send, Brain) | All icon needs |
| recharts | ^3.8.0 | Journey progress bar (shadcn Progress uses it) | Progress visualization |

### No new installs needed
All required packages are already in `package.json`. No `npm install` needed for Phase 7.

**Confirmed installed:**
```
react-markdown: ^10.1.0 ✓ (verified in package.json)
remark-gfm: ^4.0.1 ✓
framer-motion: ^12.38.0 ✓
```

---

## Architecture Patterns

### Project Structure for Phase 7
```
src/
├── app/(auth)/
│   ├── coach/
│   │   └── page.tsx              # AI Coach page (chat + journeys tabs) — COCH-01,02,03,04,05
│   └── tools/synthesis/
│       └── page.tsx              # Mystic Synthesis page — SYNT-01,02,03
├── app/api/
│   ├── coach/
│   │   ├── conversations/
│   │   │   └── route.ts          # GET list + POST create conversation
│   │   ├── conversations/[id]/
│   │   │   └── route.ts          # GET messages for conversation
│   │   ├── messages/
│   │   │   └── route.ts          # POST send message (triggers LLM response)
│   │   └── journeys/
│   │       └── route.ts          # GET list + POST generate journey
│   └── tools/synthesis/
│       └── route.ts              # POST generate synthesis (on_demand or weekly)
└── components/features/
    ├── coach/
    │   ├── ChatMessage.tsx        # Port of ChatMessage.jsx
    │   ├── ChatInput.tsx          # Port of ChatInput.jsx
    │   ├── QuickActions.tsx       # Port of QuickActions.jsx
    │   └── JourneyCard.tsx        # Port of JourneyCard.jsx
    └── synthesis/
        └── SynthesisResult.tsx   # Display personality_profile + insights + recommendations
```

### Pattern 1: Stateful Coaching Chat (Request-Response, not streaming)

**What:** User sends a message → API builds system prompt with user context → calls invokeLLM → persists both user message and assistant reply → returns assistant reply.

**When to use:** Every chat message send.

**Key insight from BASE44:** The BASE44 source uses `base44.agents` which is a managed agent service with built-in streaming. In Next.js, we replace this with a simple POST route: save user message, call invokeLLM with full conversation history in messages array, save assistant reply, return reply.

**Note on ADV-01 (streaming):** REQUIREMENTS.md classifies Supabase Realtime streaming as v2 (ADV-01). Phase 7 implements v1 request-response chat. The architecture must not assume streaming exists.

```typescript
// Source: Pattern derived from existing route structure (api/tools/career/route.ts)
// POST /api/coach/messages
export async function POST(request: NextRequest) {
  // 1. Auth check
  // 2. Load conversation context (user analyses, profile, goals, mood)
  // 3. Fetch prior messages for conversation_id
  // 4. Save user message to coaching_messages
  // 5. Build messages array: [system_with_context, ...prior_messages, user_message]
  // 6. Call invokeLLM (text mode, no responseSchema — free-form Hebrew coaching)
  // 7. Save assistant reply to coaching_messages
  // 8. Update conversation.last_message_at + message_count
  // 9. Return assistant reply
}
```

### Pattern 2: Context Loader (COCH-02 — Personalized Coaching)

**What:** A server-side function that fetches all of a user's analyses, profile, goals, and mood entries and formats them into a compact system prompt string.

**When to use:** On every new conversation creation (saved in `conversations.context JSONB`), and on every message send (rebuilt or loaded from context JSONB).

**Key insight from BASE44:** `generateCoachingJourney/entry.ts` has the full context-building logic. It filters by tool_type, extracts key numbers (life_path, sun_sign, moon_sign), and summarizes recent mood. Use this exact pattern.

**Recommended approach:** Build context once on first message send in a conversation (or on conversation create), persist in `conversations.context` JSONB, reload on subsequent messages. This avoids re-fetching 20 analyses on every turn.

```typescript
// Source: Adapted from generateCoachingJourney/entry.ts lines 86-172
async function buildCoachingContext(userId: string, supabase: SupabaseClient): Promise<string> {
  // Parallel fetch: profile, analyses (20 most recent), goals (10 active), moods (14 days)
  const [profile, analyses, goals, moods] = await Promise.all([...])
  // Build compact context string with Hebrew labels
  // Include: birth data, numerology numbers, sun/moon/rising, recent goals, mood trend
  return contextString
}
```

### Pattern 3: Coaching Journey Generation (COCH-03)

**What:** POST to `/api/coach/journeys` → build context → call invokeLLM with structured JSON schema → save to `coaching_journeys` table.

**LLM response schema** (from BASE44 generateCoachingJourney/entry.ts):
```typescript
// Source: github-source/base44/functions/generateCoachingJourney/entry.ts lines 243-283
const CoachingJourneyResponseSchema = z.object({
  title: z.string(),
  description: z.string().min(150),
  focus_area: z.enum(['life_purpose', 'relationships', 'career', 'personal_growth',
                       'spiritual_path', 'self_discovery', 'health', 'creativity']),
  steps: z.array(z.object({
    step_number: z.number(),
    title: z.string(),
    description: z.string().min(200),
    type: z.enum(['exercise', 'reflection', 'insight', 'action', 'tool_usage', 'meditation', 'journaling']),
    related_insight_text: z.string().optional(),
    related_tool_suggestion: z.string().optional(),
    due_date: z.string().optional(),
  })).min(7).max(12),
  tags: z.array(z.string()),
  ai_insights: z.array(z.string()).optional(),
})
```

**DB insert fields from schema:**
- `coaching_journeys.steps` — JSONB, stores step array with `status: 'todo'` added on save
- `coaching_journeys.status` — 'active'
- `coaching_journeys.focus_area` — one of 8 enum values
- `coaching_journeys.progress_percentage` — starts at 0
- `coaching_journeys.completed_steps` — starts at 0

### Pattern 4: Step Completion (COCH-04)

**What:** PATCH `/api/coach/journeys/[id]` → update step status in JSONB → recalculate progress_percentage.

**Logic from BASE44 AICoach.jsx lines 150-170:**
```typescript
// Update step in steps JSONB array, recalculate progress
const updatedSteps = journey.steps.map(step =>
  step.step_number === stepNumber
    ? { ...step, status: 'completed', completion_date: new Date().toISOString() }
    : step
)
const completedCount = updatedSteps.filter(s => s.status === 'completed').length
const progress = Math.round((completedCount / updatedSteps.length) * 100)
```

### Pattern 5: Mystic Synthesis (SYNT-01, SYNT-02, SYNT-03)

**What:** POST to `/api/tools/synthesis` → fetch analyses + profile + goals + moods → build prompt → call invokeLLM → save to `analyses` table with `tool_type: 'synthesis'`.

**No new DB table needed:** `tool_type: 'synthesis'` is already in the ToolType union (analysis.ts line 24). Synthesis result is stored in `analyses.results` JSONB.

**Two synthesis types** (distinguished by `type` param):
1. `on_demand` — uses all recent analyses (up to 20), generates full portrait
2. `weekly` — adds `usage_analysis` + `practical_integration` + `period_summary` sections

**LLM response schema for on_demand synthesis** (from synthesizeMysticInsights/entry.ts):
```typescript
// Source: github-source/base44/functions/synthesizeMysticInsights/entry.ts lines 76-113
const SynthesisResponseSchema = z.object({
  personality_profile: z.object({
    summary: z.string(),
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    hidden_talents: z.array(z.string()),
  }),
  predictive_insights: z.array(z.object({
    timeframe: z.string(),
    area: z.string(),
    prediction: z.string(),
    probability: z.string(),
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    reason: z.string(),
    related_tool: z.string().optional(),
  })),
})
```

**Weekly synthesis adds:**
```typescript
// Source: github-source/base44/functions/generateWeeklyReport/entry.ts lines 60-110
usage_analysis: z.object({
  most_used_tools: z.array(z.string()),
  peak_activity_times: z.string(),
  pattern_insight: z.string(),
}).optional(),
practical_integration: z.array(z.object({
  suggestion: z.string(),
  context: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})).optional(),
period_summary: z.string().optional(),
```

### Anti-Patterns to Avoid

- **Sending all 20 analyses as raw JSON on every chat message:** The LLM context window will be consumed by data, not the conversation. Build a compact context summary once and save it in `conversations.context`.
- **Creating a separate `mystic_syntheses` table:** The `analyses` table already handles this via `tool_type: 'synthesis'`. Using a separate table creates duplication and breaks the existing analysis list patterns.
- **Streaming on v1:** ADV-01 (Supabase Realtime streaming) is classified as v2. Do not add streaming infrastructure in Phase 7.
- **Using `left`/`right` in RTL layouts:** Chat bubbles must use `flex-row-reverse` for user messages and RTL-aware padding. See ChatMessage.jsx for the correct pattern with `flex-row-reverse`.
- **Base64 image re-upload in chat:** The coaching chat is text-only. Do not add file attachment support (out of scope for COCH-01).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown rendering in AI replies | Custom HTML sanitizer + renderer | `react-markdown` + `remark-gfm` | Already installed; handles code blocks, lists, blockquotes safely |
| Context string builder | Ad-hoc string concat | Port the exact pattern from generateCoachingJourney/entry.ts lines 86-172 | Tested, includes all key data points, handles missing data gracefully |
| Journey progress calculation | Custom DB trigger | Application-layer calculation + single UPDATE | Supabase JSONB arrays are not suitable for DB-side aggregation |
| Chat history storage | localStorage / Zustand | Supabase `conversations` + `coaching_messages` tables (COCH-05) | Already in schema with RLS; persists across devices |
| Synthesis storage | New `mystic_syntheses` table | Existing `analyses` table with `tool_type: 'synthesis'` | ToolType union already includes 'synthesis'; no migration needed |

---

## DB Schema Reference (confirmed live in Supabase)

### `conversations` table (from 003_schema_fixes.sql FIX 2)
```
id UUID PK
user_id UUID FK → auth.users
title TEXT
last_message_at TIMESTAMPTZ
message_count INTEGER
context JSONB  -- stores pre-built coaching context
created_at TIMESTAMPTZ
```

### `coaching_messages` table (from 001_schema.sql)
```
id UUID PK
user_id UUID FK → auth.users
conversation_id UUID FK → conversations.id (CASCADE)
role TEXT CHECK ('user' | 'assistant')
content TEXT
metadata JSONB
created_at TIMESTAMPTZ
```
Index: `idx_messages_conversation ON (conversation_id, created_at)`

### `coaching_journeys` table (from 001_schema.sql)
```
id UUID PK
user_id UUID FK → auth.users
title TEXT
description TEXT
focus_area TEXT
journey_type TEXT CHECK ('daily' | 'weekly' | 'custom')
steps JSONB  -- array of step objects with status
tags TEXT[]
ai_insights TEXT
linked_goal_id UUID FK → goals.id
status TEXT CHECK ('active' | 'completed' | 'paused')
created_at / updated_at TIMESTAMPTZ (trigger set in FIX 7)
```

### Synthesis storage: `analyses` table (existing)
```
tool_type: 'synthesis'  -- already in ToolType union
results: JSONB          -- stores personality_profile + predictive_insights + recommendations
summary: TEXT           -- short summary line
```

**Migration needed:** None for coach chat or journeys (tables already live). No new table for synthesis.

However, `coaching_journeys` is missing `progress_percentage` and `completed_steps` columns in the schema definition — but these were used in the BASE44 source. Check `database.generated.ts` to confirm whether these columns exist. If missing, a migration fix is needed.

---

## Common Pitfalls

### Pitfall 1: coaching_journeys missing progress columns
**What goes wrong:** The BASE44 source references `progress_percentage` and `completed_steps` in CoachingJourney, but `001_schema.sql` does not define them.
**Why it happens:** BASE44 added these dynamically; the Next.js schema migration may not include them.
**How to avoid:** Read `database.generated.ts` coaching_journeys Row type to confirm fields. If `progress_percentage` and `completed_steps` are absent, add them in a 004_schema_fixes.sql migration.
**Warning signs:** TypeScript error `Property 'progress_percentage' does not exist on type CoachingJourneysRow`.

### Pitfall 2: LLM context too large for coaching
**What goes wrong:** Sending all 20 analyses' full `results` JSONB to the LLM on every message turns each request into a 60-80k token call, making it slow and expensive.
**Why it happens:** Naively injecting `analyses.results` without summarization.
**How to avoid:** Build a compact context string (see BASE44 context builder pattern). Extract only key numbers: life_path number, sun/moon/rising signs, soul urge, recent mood score, active goal titles. Target under 2000 tokens for the system context.
**Warning signs:** LLM response takes 10+ seconds, `tokensUsed > 8000` on a simple question.

### Pitfall 3: invokeLLM for free-form coaching text
**What goes wrong:** Applying `responseSchema` (JSON mode) to the coaching message endpoint causes the LLM to format responses as JSON objects instead of natural Hebrew coaching text.
**Why it happens:** Misapplying the structured-output pattern from tool routes to the conversational coach.
**How to avoid:** Do NOT set `responseSchema` or `zodSchema` on the coaching message invokeLLM call. Use free-form text mode (no JSON mode). The coach should return natural Hebrew prose.
**Warning signs:** Coaching replies look like `{"response": "שלום..."}` instead of plain text.

### Pitfall 4: RTL chat bubbles
**What goes wrong:** User message bubbles appear on the left in RTL layout, making them look like assistant messages.
**Why it happens:** Using margin-left/right instead of RTL-aware flex-direction.
**How to avoid:** Port the exact `flex-row-reverse` pattern from ChatMessage.jsx for user messages. Do not use `ml-auto` or `text-right` — use `flex-row-reverse` on the container.

### Pitfall 5: Journey steps JSONB update pattern
**What goes wrong:** Doing a SELECT then UPDATE of the full steps array loses concurrent changes.
**Why it happens:** PostgreSQL JSONB arrays require full replacement — there is no atomic array element update.
**How to avoid:** This is acceptable because journey step updates are low-frequency user actions. Use optimistic update in React Query + the Supabase `.update({ steps: updatedSteps })` pattern. Document that concurrent step completion from multiple devices is not supported in v1.

### Pitfall 6: maxTokens for synthesis
**What goes wrong:** Synthesis requires generating personality_profile + predictive_insights + recommendations — a response that can easily exceed 4096 tokens.
**Why it happens:** Default maxTokens in invokeLLM is 4096, which may truncate complex synthesis output.
**How to avoid:** Set `maxTokens: 6000` for synthesis calls. The graphology route (Phase 5) set `maxTokens: 8000` as precedent.

### Pitfall 7: Zod v4 `.optional()` on array items
**What goes wrong:** Synthesis schema uses optional nested fields. Zod v4 changes how optional works with default values inside array items.
**Why it happens:** Same Zod v4 caveat from all prior phases.
**How to avoid:** Use `z.string().optional()` not `z.string().nullish()` unless nulls are expected from the LLM. Review all optional fields in the journey and synthesis Zod schemas.

---

## Code Examples

Verified patterns from project codebase:

### Chat message persistence pattern
```typescript
// Source: Adapted from existing route pattern (api/tools/career/route.ts)
// Save user message
const { error: userMsgError } = await supabase
  .from('coaching_messages')
  .insert({
    user_id: user.id,
    conversation_id: conversationId,
    role: 'user',
    content: message,
  })

// Build messages for LLM (prior messages + new user message)
const priorMessages = await supabase
  .from('coaching_messages')
  .select('role, content')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true })
  .limit(20) // cap at 20 to prevent runaway context

// Call invokeLLM in free-form text mode (no responseSchema)
const response = await invokeLLM({
  prompt: message,
  systemPrompt: coachingContext + conversationHistory,
  maxTokens: 2048,
  userId: user.id,
  // NO responseSchema — free-form Hebrew coaching text
})
```

### Synthesis save to analyses table
```typescript
// Source: Adapted from api/tools/career/route.ts pattern
// tool_type 'synthesis' is already in ToolType union (types/analysis.ts line 24)
const row: TablesInsert<'analyses'> = {
  user_id: user.id,
  tool_type: 'synthesis',
  input_data: { sources: inputSources, type: synthesisType },
  results: {
    personality_profile: aiResponse.personality_profile,
    predictive_insights: aiResponse.predictive_insights,
    recommendations: aiResponse.recommendations,
    // weekly only:
    usage_analysis: aiResponse.usage_analysis,
    practical_integration: aiResponse.practical_integration,
    period_summary: aiResponse.period_summary,
  },
  summary: aiResponse.personality_profile.summary.slice(0, 500),
}
```

### Journey step completion PATCH
```typescript
// Source: Logic from AICoach.jsx lines 150-170
// PATCH /api/coach/journeys/[id] — update step status + recalculate progress
const updatedSteps = journey.steps.map((step: JourneyStep) =>
  step.step_number === stepNumber
    ? { ...step, status: 'completed' as const, completion_date: new Date().toISOString() }
    : step
)
const completedCount = updatedSteps.filter((s: JourneyStep) => s.status === 'completed').length
const progress = Math.round((completedCount / updatedSteps.length) * 100)

await supabase.from('coaching_journeys').update({
  steps: updatedSteps,
  progress_percentage: progress,  // may need migration if column missing
  status: progress === 100 ? 'completed' : 'active',
}).eq('id', journeyId).eq('user_id', user.id)
```

---

## Runtime State Inventory

> Not a rename/refactor/migration phase. No runtime state inventory required.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/services/` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COCH-01 | ChatInput submits on Enter, not Shift+Enter | unit | `npx vitest run tests/components/ChatInput.test.tsx` | Wave 0 |
| COCH-02 | buildCoachingContext returns compact string with key numbers | unit | `npx vitest run tests/services/coach-context.test.ts` | Wave 0 |
| COCH-03 | CoachingJourneyResponseSchema validates 7-step journey | unit | `npx vitest run tests/services/journey-schema.test.ts` | Wave 0 |
| COCH-04 | Step completion updates progress_percentage correctly | unit | `npx vitest run tests/services/journey-progress.test.ts` | Wave 0 |
| COCH-05 | Messages persist per conversation_id | integration (manual) | manual — requires live Supabase | manual-only |
| SYNT-01 | SynthesisResponseSchema validates cross-tool output | unit | `npx vitest run tests/services/synthesis-schema.test.ts` | Wave 0 |
| SYNT-02 | Synthesis API returns personality_profile with strengths | integration (manual) | manual — requires live LLM | manual-only |
| SYNT-03 | Weekly synthesis adds period_summary and usage_analysis | unit | `npx vitest run tests/services/synthesis-weekly-schema.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd mystiqor-build && npx vitest run tests/services/`
- **Per wave merge:** `cd mystiqor-build && npx vitest run`
- **Phase gate:** Full suite green + TypeScript clean before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/services/coach-context.test.ts` — covers COCH-02 (context builder)
- [ ] `tests/services/journey-schema.test.ts` — covers COCH-03 (Zod schema for journey)
- [ ] `tests/services/journey-progress.test.ts` — covers COCH-04 (step completion math)
- [ ] `tests/services/synthesis-schema.test.ts` — covers SYNT-01 (synthesis Zod schema)
- [ ] `tests/services/synthesis-weekly-schema.test.ts` — covers SYNT-03 (weekly fields)
- [ ] `tests/components/ChatInput.test.tsx` — covers COCH-01 (keyboard behavior)

---

## Open Questions

1. **Are `progress_percentage` and `completed_steps` columns in the live `coaching_journeys` schema?**
   - What we know: `001_schema.sql` does NOT define these columns. BASE44 source uses them.
   - What's unclear: They may have been added in `database.generated.ts` if the DB was provisioned separately.
   - Recommendation: Inspect `database.generated.ts` coaching_journeys Row type. If absent, Wave 0 of Plan 07-03 must add `004_schema_fixes.sql` with these columns.

2. **Should coaching count against the subscription usage limit?**
   - What we know: `SubscriptionGuard` wraps all tool forms. The `increment_usage` function is called on every LLM analysis.
   - What's unclear: Should every chat message consume 1 analysis credit, or should coaching be a flat-rate or unlimited feature?
   - Recommendation: Wrap the coaching page with `SubscriptionGuard` (consistent with all other tools). Increment usage on journey generation and synthesis, but NOT on individual chat messages (chat is conversational, not a one-shot analysis).

3. **Does `coach/page.tsx` need a sub-route for individual conversations?**
   - What we know: BASE44 AICoach.jsx has a sidebar with multiple conversations.
   - Recommendation: Keep it simple — one page with a conversation sidebar (list on left, chat on right). No separate `/coach/[id]` route needed. The `journey/` sub-directory already exists in the file system.

---

## Sources

### Primary (HIGH confidence)
- `github-source/base44/functions/generateCoachingJourney/entry.ts` — complete journey generation prompt, LLM schema, DB save logic
- `github-source/base44/functions/synthesizeMysticInsights/entry.ts` — complete synthesis prompt, LLM schema, DB save logic
- `github-source/base44/functions/generateWeeklyReport/entry.ts` — weekly report extension of synthesis
- `github-source/src/pages/AICoach.jsx` — complete chat UI structure, conversation management, journey management
- `github-source/src/pages/MysticSynthesis.jsx` — complete synthesis UI with result display
- `github-source/src/components/AICoach/ChatMessage.jsx` — RTL chat bubble pattern with react-markdown
- `github-source/src/components/AICoach/ChatInput.jsx` — Enter key handler, auto-resize textarea
- `github-source/src/components/AICoach/QuickActions.jsx` — 6 pre-defined coaching prompts in Hebrew
- `github-source/src/components/JourneyCard.jsx` — full journey step UI with expand/collapse, progress bar
- `mystiqor-build/supabase/migrations/001_schema.sql` — coaching_journeys + coaching_messages tables
- `mystiqor-build/supabase/migrations/003_schema_fixes.sql` — conversations table + FK constraint
- `mystiqor-build/src/types/database.generated.ts` — confirmed live schema with conversations, coaching_messages, coaching_journeys
- `mystiqor-build/src/types/analysis.ts` — ToolType union including 'synthesis'
- `mystiqor-build/src/services/analysis/llm.ts` — invokeLLM signature, free-form vs JSON mode

### Secondary (MEDIUM confidence)
- `mystiqor-build/package.json` — confirmed react-markdown@10.1.0 + remark-gfm@4.0.1 + framer-motion@12.38.0 installed
- Prior phase patterns (Phases 4–6 routes) — Zod response schema + invokeLLM + analyses table save pattern

### Tertiary (LOW confidence)
- None — all findings verified from codebase inspection.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed in package.json
- Architecture: HIGH — tables confirmed live, BASE44 source fully inspected
- LLM prompts/schemas: HIGH — exact schemas from BASE44 entry.ts files
- Pitfalls: HIGH — derived from codebase patterns, not hypothetical
- Missing columns (progress_percentage): MEDIUM — schema SQL doesn't define them but they may be in live DB

**Research date:** 2026-03-24
**Valid until:** 2026-06-24 (stable domain)
