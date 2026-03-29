# Phase 20: Dream & Blog Content - Research

**Researched:** 2026-03-29
**Domain:** Content integration — dream emotion grid UI + blog seed script + blog detail page
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** כפתורי אימוג'י לבחירה — גריד של 12 כפתורי רגש עם אימוג'י + שם, מחליפים את TagInput הנוכחי
**D-02:** בחירה מרובה — המשתמש יכול לבחור כמה רגשות (toggle on/off)
**D-03:** הרגשות מגיעים מ-`DREAM_EMOTIONS` ב-`dream-data.ts` (12 רגשות כבר קיימים עם אימוג'י + תיאור)
**D-04:** 3 מאמרים לפי הדרישות: נומרולוגיה למתחילים, מדריך למזלות, קריאה בכף היד
**D-05:** כל מאמר עשיר — 800-1200 מילים בעברית, עם כותרות משנה, רשימות, דוגמאות מעשיות
**D-06:** מאמרים נכנסים לטבלת `blog_posts` ב-Supabase דרך seed script (לא hardcoded בקוד)
**D-07:** תוכן בפורמט Markdown — מאוחסן בשדה `content` בטבלה
**D-08:** דף מאמר נפרד בנתיב `/learn/blog/[slug]` — לא expand בתוך הרשימה
**D-09:** תוכן מעוצב עם Markdown rendering — כותרות, פסקאות, רשימות, תמונות
**D-10:** BlogPostCard ברשימה מפנה לדף המאמר (link, לא expand)

### Claude's Discretion

- עיצוב דף המאמר (layout, typography) — קלוד מחליט לפי design system קיים
- מבנה הטבלה `blog_posts` — קלוד מחליט אם צריך migration או שהטבלה כבר קיימת
- האם לשמור את expand/collapse ב-BlogPostCard כתצוגה מקדימה — קלוד מחליט

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DREAM-01 | מילון 10+ רגשות חלומות עם אימוג'ים ותיאורים בעברית — בחירה בטופס | DREAM_EMOTIONS constant already has 12 emotions; TagInput at line 257-263 of dream/page.tsx needs replacement with emoji grid |
| BLOG-01 | 3+ מאמרי בלוג מלאים (נומרולוגיה למתחילים, מזלות, סימנים בכף היד) עם תוכן עשיר | blog_posts table exists in DB + Supabase; seed script pattern established by sync-tarot-meta.ts |
| BLOG-02 | מאמרי בלוג ב-DB (טבלת blog_posts) ולא hardcoded | API route /api/blog already queries blog_posts; just needs data seeded and [slug] detail page built |
</phase_requirements>

---

## Summary

Phase 20 is a content-delivery phase with three distinct work items: (1) replace a TagInput component with an emoji toggle grid in the dream form, (2) seed three rich Hebrew blog articles into the `blog_posts` Supabase table via a script, and (3) build a `/learn/blog/[slug]` detail page that renders Markdown content.

The foundational infrastructure is already in place and working. `DREAM_EMOTIONS` is a typed constant with 12 emotions ready to render. The `blog_posts` table is fully typed in `database.ts` with the exact schema needed (id, title, slug, content, excerpt, author, category, tags, read_time_minutes, is_published, published_at). The `/api/blog` route queries the table correctly. `ReactMarkdown` with `prose prose-invert` is already the established rendering pattern in this project.

The primary implementation risk is content quality — the three blog articles must be substantive (800-1200 Hebrew words each) and in valid Markdown format. Everything else is straightforward component work following established project patterns.

**Primary recommendation:** Three plans — Plan 01: emotion grid + BlogPostCard link refactor. Plan 02: blog seed script (3 articles). Plan 03: `/learn/blog/[slug]` page assembly.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ReactMarkdown | ^10.1.0 | Markdown to React rendering | Already installed + in use; `prose prose-invert` pattern established in dream/page.tsx and tarot page |
| remark-gfm | ^4.0.1 | GFM (tables, strikethrough, task lists) in Markdown | Already installed; standard companion to react-markdown |
| @supabase/supabase-js | ^2.99.3 | Supabase client for seed script | Already used in sync-tarot-meta.ts pattern |
| tsx (via npx) | dev runtime | Run TypeScript seed scripts without compilation | Same approach as `npx tsx mystiqor-build/scripts/sync-tarot-meta.ts` |
| next/link | built-in | Navigation from BlogPostCard list to detail page | App Router standard; already used project-wide |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | ^5.91.2 | Data fetching on [slug] page | Same staleTime pattern as blog list page |
| framer-motion | ^12.38.0 | Fade-in animation on blog detail | Same `animations.fadeInUp` already used in dream/page.tsx |
| sonner | ^2.0.7 | Toast on seed script errors | Already in project; not needed for seed script (console.log is fine) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ReactMarkdown | @mdx-js/react | MDX is overkill — blog content is static Markdown strings in DB, not JSX files |
| Supabase seed script | Supabase Studio manual insert | Script is reproducible, version-controlled, re-runnable; manual insert is not |
| new API route for /api/blog/[slug] | Extend existing /api/blog with slug param | Dedicated route is cleaner and follows project pattern; existing route handles list |

**Installation:** No new packages needed — all dependencies already present.

---

## Architecture Patterns

### Recommended Project Structure

```
mystiqor-build/
├── scripts/
│   └── seed-blog-posts.ts          # NEW — seeds 3 articles into blog_posts
├── src/
│   ├── app/
│   │   ├── (auth)/learn/blog/
│   │   │   ├── page.tsx            # EXISTING — update BlogPostCard usage (remove expand, add link)
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # NEW — blog detail page
│   │   ├── api/blog/
│   │   │   ├── route.ts            # EXISTING — no changes needed
│   │   │   └── [slug]/
│   │   │       └── route.ts        # NEW — GET single blog post by slug
│   │   └── (auth)/tools/dream/
│   │       └── page.tsx            # EXISTING — replace TagInput (emotions) with EmotionGrid
│   └── components/features/blog/
│       ├── BlogPostCard.tsx         # EXISTING — refactor from expand/collapse to link
│       └── EmotionGrid.tsx          # NEW — 12 emotion toggle buttons component (or inline in page)
```

### Pattern 1: Emotion Toggle Grid (replacing TagInput)

**What:** A 3x4 or 4x3 grid of buttons, each showing emoji + label. Clicking toggles selection (stored in `emotions` form array). Selected = highlighted with primary color, unselected = ghost/transparent.
**When to use:** When user needs to pick from a fixed enum of values with visual richness.

**Example (established pattern — toggle from watch + setValue):**

```typescript
// Source: dream/page.tsx lines 138-158 — existing watch/setValue pattern
const emotions = watch('emotions') ?? [];

function toggleEmotion(value: string) {
  const next = emotions.includes(value)
    ? emotions.filter((e) => e !== value)
    : [...emotions, value];
  setValue('emotions', next, { shouldValidate: false });
}
```

Grid button structure (follows existing mystic card styling):
```typescript
// Source: established design system patterns in this project
<button
  type="button"
  onClick={() => toggleEmotion(emotion.value)}
  className={cn(
    'flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors font-label text-sm',
    emotions.includes(emotion.value)
      ? 'border-primary bg-primary-container/20 text-primary'
      : 'border-outline-variant/10 bg-surface-container-lowest text-on-surface-variant hover:border-primary/30'
  )}
>
  <span className="text-2xl">{emotion.emoji}</span>
  <span>{emotion.label}</span>
</button>
```

### Pattern 2: Blog Seed Script (following sync-tarot-meta.ts)

**What:** A `scripts/seed-blog-posts.ts` TypeScript file that uses `@supabase/supabase-js` with service-role key, upserts 3 blog post objects, and reports success/failure.
**When to use:** Seeding static content data into Supabase in a reproducible, version-controlled way.

```typescript
// Source: mystiqor-build/scripts/sync-tarot-meta.ts — established script pattern
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(): void {
  try {
    const envContent = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
    for (const line of envContent.split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m?.[1] && m[2] !== undefined) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch {
    console.warn('⚠️  .env.local לא נמצא')
  }
}

// upsert pattern — safe to re-run
const { error } = await supabase
  .from('blog_posts')
  .upsert(BLOG_POSTS_SEED, { onConflict: 'slug' })
```

Run command: `npx tsx mystiqor-build/scripts/seed-blog-posts.ts`

### Pattern 3: Blog Detail Page (/learn/blog/[slug]/page.tsx)

**What:** Next.js App Router dynamic page that fetches a single blog post from `/api/blog/[slug]`, renders content with ReactMarkdown.
**When to use:** Any content detail page in this project.

```typescript
// Source: dream/page.tsx line 300 — established prose rendering pattern
<div className="prose prose-sm prose-invert max-w-none font-body text-on-surface-variant">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
</div>
```

Page structure (follows PageHeader + breadcrumbs pattern from all tools):
```typescript
// Pattern: astrology dictionary page + dream page
<PageHeader
  title={post.title}
  description={post.excerpt ?? ''}
  icon={<GiSpellBook className="h-5 w-5" />}
  breadcrumbs={[
    { label: 'למידה', href: '/learn/tutorials' },
    { label: 'בלוג', href: '/learn/blog' },
    { label: post.title },
  ]}
/>
```

### Pattern 4: BlogPostCard Link Refactor

**What:** Remove `expanded`/`onToggle` props. Replace expand/collapse button with `<Link href={/learn/blog/${post.slug}}>קרא עוד</Link>`.
**Key:** The `BlogPost` interface on line 12 of BlogPostCard.tsx needs `slug: string` added — it is present in the DB type (`Tables<'blog_posts'>.Row.slug`) but not in the component's local interface.

```typescript
// Current BlogPost interface (line 12-22) — missing slug
export interface BlogPost {
  id: string;
  title: string;
  // ... (no slug)
}

// After change
export interface BlogPost {
  id: string;
  title: string;
  slug: string;  // ADD THIS
  // ...
}
```

### Anti-Patterns to Avoid

- **Hardcoding blog content in React component files:** BLOG-02 explicitly forbids this — all content goes through seed script into DB.
- **Reusing expand/collapse in BlogPostCard after the link refactor:** D-10 locks navigation to the detail page. Remove the expand behavior entirely.
- **Using `left`/`right` CSS properties:** CLAUDE.md mandates `start`/`end` for RTL. The emotion grid must use `gap`, `grid`, not `float: left`.
- **Seeding without upsert (onConflict: 'slug'):** Script must be re-runnable safely. Using `insert` instead of `upsert` will fail on re-run.
- **Passing `content` to the blog list API response if it's large:** The list page BlogPostCard now only needs excerpt + metadata; content is fetched on the detail page. However, the existing `/api/blog` route returns `*` — this is acceptable for now given the small dataset (3 posts).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown rendering | Custom HTML parser | ReactMarkdown + remark-gfm | Already installed; handles heading anchors, lists, code blocks, images safely |
| Database upsert with conflict handling | Custom fetch + check-then-insert logic | Supabase `.upsert({ onConflict: 'slug' })` | One-line safe idempotent operation |
| RTL-safe navigation link | Custom `<a>` with manual styling | `next/link` + Tailwind | Handles prefetching, SPA navigation, and can be styled with Tailwind |
| TypeScript env loading in scripts | dotenv package | Manual `readFileSync` parse | Project already uses this pattern in sync-tarot-meta.ts — consistent, no extra dep |

**Key insight:** This phase has no algorithmic complexity. The value is in the content quality and clean component wiring, not technical novelty.

---

## Runtime State Inventory

> Step 2.5: Runtime state check for seed-related work.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `blog_posts` table in Supabase — currently empty (API route works but returns 0 posts) | Seed script inserts 3 records; upsert on `slug` for idempotency |
| Live service config | None relevant to this phase | None |
| OS-registered state | None | None |
| Secrets/env vars | `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` — required by seed script | Already present (same as sync-tarot-meta.ts requirements) |
| Build artifacts | None | None |

**blog_posts table schema (from database.ts — already correct, no migration needed):**

```
id: string (uuid, auto)
title: string
slug: string          ← used as onConflict key for upsert
content: string       ← Markdown text, 800-1200 words per article
excerpt: string | null
author: string
category: string
tags: string[]
read_time_minutes: number
is_published: boolean
published_at: string  ← ISO timestamp
```

No DB migration required. Table and all required columns already exist in the type definition and presumably in the actual Supabase schema (the API route queries it without error per the existing code).

---

## Common Pitfalls

### Pitfall 1: slug missing from BlogPost interface

**What goes wrong:** `BlogPostCard` and the blog list page use a local `BlogPost` interface that does not include `slug`. When the card tries to link to `/learn/blog/${post.slug}`, TypeScript will error.
**Why it happens:** The component predates the decision to add a detail page. The DB type has `slug` but the component interface was hand-typed without it.
**How to avoid:** Add `slug: string` to the `BlogPost` interface in BlogPostCard.tsx before building the link.
**Warning signs:** TypeScript error "Property 'slug' does not exist on type 'BlogPost'"

### Pitfall 2: New API route for /api/blog/[slug] needs auth check

**What goes wrong:** Forgetting to add `supabase.auth.getUser()` check on the new `GET /api/blog/[slug]` route, making individual posts publicly accessible without login.
**Why it happens:** It's easy to copy just the DB query part and omit the auth boilerplate when creating a new route.
**How to avoid:** Use the existing `/api/blog/route.ts` as a template — it has the auth check at line 24-30. Copy it exactly.
**Warning signs:** Route returns 200 for unauthenticated requests.

### Pitfall 3: BlogPage still passes expanded/onToggle after refactor

**What goes wrong:** After updating BlogPostCard to use a link, the parent `blog/page.tsx` still manages `expandedId` state and passes `expanded` / `onToggle` props that no longer exist — TypeScript errors.
**Why it happens:** The page and card are separate files; updating one without the other causes type mismatch.
**How to avoid:** Update BlogPostCard props interface first, then fix call sites. Remove `expandedId` state and `handleToggle` function from blog/page.tsx.
**Warning signs:** TypeScript "Object literal may only specify known properties" on BlogPostCard usage.

### Pitfall 4: Emoji not rendering correctly in some environments

**What goes wrong:** The emoji in `DREAM_EMOTIONS` (e.g., `🥹`, `✨`) may not render consistently on all platforms without specifying font-family.
**Why it happens:** Hebrew RTL apps use Heebo which may not include emoji glyphs in all environments.
**How to avoid:** Wrap emoji spans with `style={{ fontFamily: 'emoji' }}` or use `className="not-prose"` to prevent prose styles from affecting emoji display size. Per Phase 14 decision, SVG text uses explicit fontFamily — same care applies here.
**Warning signs:** Emoji renders as square box or wrong size.

### Pitfall 5: ReactMarkdown prose styles clash with dark theme

**What goes wrong:** `prose` class defaults to light-colored text/headings that clash with the dark mystic theme.
**Why it happens:** Tailwind's `prose` plugin uses its own color scale.
**How to avoid:** Use `prose-invert` (already established in this project — dream/page.tsx line 300). This is a locked pattern.
**Warning signs:** Blog content renders with dark text on dark background, unreadable.

---

## Code Examples

### EmotionGrid component (inline or extracted)

```typescript
// Source: pattern derived from dream/page.tsx + DREAM_EMOTIONS constant
import { DREAM_EMOTIONS } from '@/lib/constants/dream-data';
import { cn } from '@/lib/utils/cn';

/** Props לגריד בחירת רגשות */
interface EmotionGridProps {
  selected: string[];
  onToggle: (value: string) => void;
}

/** גריד בחירת רגשות — 12 כפתורי toggle עם אימוג'י */
export function EmotionGrid({ selected, onToggle }: EmotionGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {DREAM_EMOTIONS.map((emotion) => (
        <button
          key={emotion.value}
          type="button"
          onClick={() => onToggle(emotion.value)}
          title={emotion.description}
          aria-pressed={selected.includes(emotion.value)}
          className={cn(
            'flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors font-label text-xs',
            selected.includes(emotion.value)
              ? 'border-primary bg-primary-container/20 text-primary'
              : 'border-outline-variant/10 bg-surface-container-lowest text-on-surface-variant hover:border-primary/30 hover:text-on-surface'
          )}
        >
          <span className="text-2xl leading-none" style={{ fontFamily: 'emoji' }}>
            {emotion.emoji}
          </span>
          <span>{emotion.label}</span>
        </button>
      ))}
    </div>
  );
}
```

### Seed script structure

```typescript
// Source: sync-tarot-meta.ts pattern + blog_posts schema from database.ts

const BLOG_POSTS_SEED = [
  {
    slug: 'numerology-beginners-guide',
    title: 'נומרולוגיה למתחילים — המדריך המלא',
    category: 'נומרולוגיה',
    author: 'MystiQor',
    tags: ['נומרולוגיה', 'מספר חיים', 'למתחילים'],
    read_time_minutes: 8,
    is_published: true,
    published_at: new Date().toISOString(),
    excerpt: 'גלה כיצד מספרים חושפים את מסלול חייך...',
    content: `# נומרולוגיה למתחילים\n\n## מה היא נומרולוגיה?\n\n...`, // 800-1200 words
  },
  // ... 2 more articles
] as const;

// Upsert — safe to re-run
const { error } = await supabase
  .from('blog_posts')
  .upsert(BLOG_POSTS_SEED, { onConflict: 'slug' });
```

### New API route /api/blog/[slug]/route.ts

```typescript
// Source: /api/blog/route.ts — copy auth pattern, add slug filter
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (error || !post) return NextResponse.json({ error: 'מאמר לא נמצא' }, { status: 404 });
  return NextResponse.json({ data: post });
}
```

---

## Environment Availability

Step 2.6: External dependency check.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | seed script execution | Yes | v24.12.0 | — |
| npx tsx | running .ts seed scripts | Yes (Node 24 ships with npx) | via npx | — |
| Supabase project (NEXT_PUBLIC_SUPABASE_URL) | seed script + app | Assumed yes (phases 18-19 used it) | — | — |
| SUPABASE_SERVICE_ROLE_KEY in .env.local | seed script (bypasses RLS) | Assumed yes (same as sync-tarot-meta.ts) | — | Must be present |

**Missing dependencies with no fallback:** None identified.

**Note:** The seed script requires `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS. This key was already needed for `sync-tarot-meta.ts` (phase 18) — if that script ran successfully, this key is available.

---

## Validation Architecture

nyquist_validation is enabled (not set to false in config.json).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `mystiqor-build/vitest.config.ts` |
| Quick run command | `cd mystiqor-build && npx vitest run tests/services/dream.test.ts` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DREAM-01 | DREAM_EMOTIONS has 12+ items with required fields | unit | `npx vitest run tests/services/dream.test.ts` | ❌ Wave 0 (new test needed) |
| DREAM-01 | EmotionGrid toggle selects/deselects emotions | unit | `npx vitest run tests/components/EmotionGrid.test.tsx` | ❌ Wave 0 |
| BLOG-01 | BLOG_POSTS_SEED has 3 articles with 800+ char content and required fields | unit | `npx vitest run tests/services/blog.test.ts` | ❌ Wave 0 |
| BLOG-02 | Blog API route returns posts from DB (not hardcoded) | smoke / manual | Verify via browser: `/learn/blog` shows seeded articles | manual |

**Existing test that remains valid:** `tests/services/dream.test.ts` tests DreamInputSchema — no changes needed to that file; the schema continues to accept `emotions: string[]`.

### Sampling Rate

- **Per task commit:** `cd mystiqor-build && npx vitest run`
- **Per wave merge:** `cd mystiqor-build && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `mystiqor-build/tests/services/blog.test.ts` — validates BLOG_POSTS_SEED shape (BLOG-01)
- [ ] `mystiqor-build/tests/components/EmotionGrid.test.tsx` — validates toggle behavior (DREAM-01)

*(EmotionGrid component test is lightweight — test that clicking toggles the aria-pressed state and calls onToggle with correct value.)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Blog content in React component (hardcoded) | Seed script → DB → API route | Phase 20 decision | Editable without code deploy |
| TagInput (free text) for dream emotions | Emoji grid (constrained vocabulary) | Phase 20 decision | Better UX, consistent emotion values for AI analysis |
| BlogPostCard expand in-place | Link to dedicated detail page | Phase 20 decision | Better reading experience, shareable URLs |

**No deprecated items:** All libraries in use (ReactMarkdown, react-markdown, remark-gfm) are current versions.

---

## Open Questions

1. **Does the `blog_posts` table actually exist in Supabase (not just in types)?**
   - What we know: `database.ts` defines the type. The `/api/blog/route.ts` queries it without any "table does not exist" handling. The API was likely tested during v1.0 MVP build.
   - What's unclear: Whether any rows exist or the table was created but empty.
   - Recommendation: The planner should include a Wave 0 verification step: run the blog API and confirm it returns 200 with empty array (not 500). If it errors, a Supabase migration is needed — but this is LOW probability given the type definitions are precise.

2. **Should BlogPostCard retain the excerpt-only view or show nothing until detail page?**
   - What we know: D-10 says "link, לא expand". Claude's Discretion says Claude decides whether to keep expand/collapse as preview.
   - Recommendation: Keep the excerpt visible in the card (it's just text, no toggle needed). Remove only the expand/collapse button and the full `content` rendering from the card. The card becomes a pure preview + link.

---

## Project Constraints (from CLAUDE.md)

- TypeScript strict — no `any`, no `@ts-ignore`
- Every function — JSDoc in Hebrew
- Every component — typed Props interface
- Every API route — Zod input validation
- Every DB query — through typed service layer
- Error handling — try/catch + typed errors + user feedback
- Max 300 lines per file
- `start`/`end` — never `left`/`right` (RTL)
- Hebrew labels, errors, placeholders, toasts
- Hebrew code comments
- RLS policies on EVERY Supabase table (seed script uses service-role to bypass; app queries go through authenticated client)
- Score MANDATORY — every file, every phase (threshold: 78% per file, 52/60 per phase)
- NEVER break working code — `/api/blog`, `BlogPostCard` excerpt display, `TagInput` for symbols field (symbols stays as TagInput; only emotions is replaced)
- Imports — absolute `@/` paths

---

## Sources

### Primary (HIGH confidence)

- Direct file reads — `mystiqor-build/src/lib/constants/dream-data.ts` — confirmed 12 DREAM_EMOTIONS with DreamEmotion interface
- Direct file reads — `mystiqor-build/src/types/database.ts` — confirmed blog_posts table schema (all required fields present, no migration needed)
- Direct file reads — `mystiqor-build/src/app/(auth)/tools/dream/page.tsx` — confirmed TagInput location (lines 257-263), existing watch/setValue emotion pattern
- Direct file reads — `mystiqor-build/src/app/(auth)/learn/blog/page.tsx` — confirmed expandedId/handleToggle state that needs removal
- Direct file reads — `mystiqor-build/src/components/features/blog/BlogPostCard.tsx` — confirmed slug missing from BlogPost interface, expand/collapse button at line 95-110
- Direct file reads — `mystiqor-build/src/app/api/blog/route.ts` — confirmed auth pattern, query structure, BlogQuerySchema usage
- Direct file reads — `mystiqor-build/scripts/sync-tarot-meta.ts` — confirmed seed script pattern (loadEnv, upsert, summary report)
- Direct file reads — `mystiqor-build/package.json` — confirmed react-markdown ^10.1.0 and remark-gfm ^4.0.1 installed

### Secondary (MEDIUM confidence)

- Project convention inference — `prose prose-invert` Markdown rendering confirmed from dream/page.tsx line 300 and tarot page (same project)

### Tertiary (LOW confidence)

None — all findings verified from source files.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed via package.json
- Architecture: HIGH — patterns confirmed from existing working code in this codebase
- Pitfalls: HIGH — identified from direct code analysis (BlogPost interface missing slug, existing expandedId state that must be removed)
- Content quality: MEDIUM — the 3 blog articles must be written; quality depends on execution

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (stable infrastructure, content-delivery phase)
