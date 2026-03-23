# Phase 5: Tools Tier 2 — Image Upload Tools - Research

**Researched:** 2026-03-23
**Domain:** Image upload, HTML5 Canvas, LLM Vision analysis, PDF export, compatibility analysis
**Confidence:** HIGH

## Summary

Phase 5 implements four image-centric tools: Drawing Analysis (HTP psychological test + in-browser canvas), Graphology (handwriting analysis), Palmistry upgrade (already stub-complete), and Compatibility (birth data for two people). The upload infrastructure from Phase 1 is fully operational — magic-byte validation, EXIF stripping, Supabase Storage, presigned URL for large files. The LLM service already supports `imageUrls: string[]` which routes to `gpt-4o` for vision analysis. Response schemas for both drawing and graphology are already defined in `src/services/analysis/response-schemas/`.

The BASE44 source provides complete reference implementations for all four tools. The drawing analysis service stub (`src/services/drawing/analysis.ts`) already defines `DrawingFeatures`, `buildDrawingAnalysisPrompt()`, and `extractDrawingFeatures()` (placeholder). The `DigitalCanvas.jsx` source component uses `canvas.toBlob()` → PNG File → same upload path as regular image upload. Compatibility analysis is pure text (no image) — birth data for two people → LLM returns structured JSON with numerology + astrology scores.

Human Design (TOOL-02) is already fully built as a Phase 4 artifact — page, API route, Zod schema, LLM prompt, and `HumanDesignCenters` visualization component all exist. Palmistry (TOOL-03) page exists with file upload wired to `/api/upload`, the only gap is the palmistry API route needs SubscriptionGuard checking. The real work in Phase 5 is drawing analysis, graphology, and compatibility.

**Primary recommendation:** Build drawing analysis page + digital canvas first (most complex); then graphology page + PDF export; then compatibility (simplest — pure text, pattern already exists from numerology compatibility in Phase 4). Human Design and Palmistry are already built — just need audit and SubscriptionGuard verification.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DRAW-01 | Upload drawing image for psychological analysis (HTP: house, tree, person) | Upload infra complete; `buildDrawingAnalysisPrompt()` + `DrawingResponseSchema` exist; LLM vision via `imageUrls` |
| DRAW-02 | In-browser digital canvas for real-time drawing (DigitalCanvas) | `DigitalCanvas.jsx` source is complete reference; `canvas.toBlob()` → PNG → `/api/upload` path |
| DRAW-03 | Koppitz scoring and FDM visualization of drawing features | `KoppitzIndicatorsVisualization.jsx` + response schema has `koppitz_score` + `fdm_categories` |
| DRAW-04 | Annotated drawing viewer with feature highlights | `AnnotatedDrawingViewer.jsx` source is complete reference; pure display component |
| DRAW-05 | Compare drawing analyses across sessions | Query `analyses` table where `tool_type='drawing'`; side-by-side card comparison |
| DRAW-06 | Drawing concept cards with educational content | Static content component; no LLM needed |
| GRPH-01 | Upload handwriting scan for psychological analysis | Upload infra complete; `GraphologyResponseSchema` exists; 8-step LLM prompt from source |
| GRPH-02 | Graphology progress tracking across sessions (GraphologyTimeline) | `GraphologyTimeline.jsx` source is display-only; queries `analyses` table |
| GRPH-03 | Graphology comparison between samples | Same pattern as DRAW-05 |
| GRPH-04 | PDF export of graphology analysis | `window.print()` + CSS `@media print` is simplest reliable approach; no new library needed |
| GRPH-05 | Graphology quick stats and tooltips | Derived from `GraphologyResponseSchema.components` (9 scored components) |
| GRPH-06 | Graphology reminder system | `localStorage` + scheduled notification via browser Notification API (no service worker needed in v1) |
| TOOL-02 | Human Design chart (type, authority, profile, centers) | ALREADY COMPLETE — page + API + HumanDesignCenters component all exist from Phase 4 |
| TOOL-03 | Palmistry via palm photo upload + AI interpretation | Page exists; API route exists; needs SubscriptionGuard audit |
| TOOL-04 | Compatibility analysis (romantic/friendship/professional) | Pure text tool; pattern from numerology/compatibility route; Compatibility.jsx is full reference |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js (App Router) | ^16.2.0 | API routes + pages | Already in project |
| TypeScript strict | ^5 | Type safety | Project standard |
| Zod | ^4.3.6 | Input + LLM response validation | Phase 1 foundation |
| React Hook Form | ^7.71.2 | Form management | Project standard |
| @tanstack/react-query | ^5.91.2 | Server state + mutations | Project standard |
| framer-motion | ^12.38.0 | Animations | Already in project |
| sharp | ^0.34.5 | EXIF stripping in upload | Already installed |
| openai | ^4.104.0 | GPT-4o vision for image analysis | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-markdown | ^10.1.0 | Render LLM markdown output | For analysis text results |
| recharts | ^3.8.0 | Charts | For graphology quick stats radar |
| lucide-react | ^0.577.0 | Icons | All UI icons |
| sonner | ^2.0.7 | Toast notifications | Upload feedback, success |

### PDF Export — CSS Print Approach
PDF export for graphology (GRPH-04) does NOT require a new library. Use `window.print()` with a `@media print` stylesheet:
- No `jspdf`, `html2canvas`, or `@react-pdf/renderer` needed
- RTL Hebrew renders correctly in browser print
- Zero new dependencies
- Pattern: `<Button onClick={() => window.print()}>ייצא PDF</Button>` with a print-specific CSS class hiding nav/buttons

### No New Packages Required
Phase 5 needs zero new npm dependencies. All required capabilities are already in the dependency tree.

**Installation:** No new packages needed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(auth)/tools/
│   ├── drawing/
│   │   └── page.tsx            # Drawing analysis — upload OR canvas → analyze
│   ├── graphology/
│   │   └── page.tsx            # Graphology — upload → analyze + PDF + timeline
│   ├── compatibility/
│   │   └── page.tsx            # Two-person form → compatibility score
│   ├── human-design/           # ALREADY EXISTS — audit only
│   └── palmistry/              # ALREADY EXISTS — SubscriptionGuard audit
├── app/api/tools/
│   ├── drawing/
│   │   └── route.ts            # POST — accepts imageUrl + drawingType, returns DrawingResponse
│   ├── graphology/
│   │   └── route.ts            # POST — accepts imageUrl, returns GraphologyResponse
│   └── compatibility/
│       └── route.ts            # POST — accepts person1/person2 data, returns compatibility
├── components/features/
│   ├── drawing/
│   │   ├── DigitalCanvas.tsx            # Port of DigitalCanvas.jsx
│   │   ├── AnnotatedDrawingViewer.tsx   # Port of AnnotatedDrawingViewer.jsx
│   │   ├── KoppitzVisualization.tsx     # Port of KoppitzIndicatorsVisualization.jsx
│   │   ├── DrawingCompare.tsx           # Side-by-side comparison
│   │   └── DrawingConceptCards.tsx      # Educational static content
│   └── graphology/
│       ├── GraphologyTimeline.tsx       # Port of GraphologyTimeline.jsx
│       ├── GraphologyQuickStats.tsx     # Radar chart of 9 components
│       ├── FDMVisualization.tsx         # Port of FDMVisualization.jsx
│       └── GraphologyCompare.tsx        # Side-by-side comparison
└── services/
    └── drawing/
        └── analysis.ts         # ALREADY EXISTS — buildDrawingAnalysisPrompt, extractDrawingFeatures
```

### Pattern 1: Image Upload → LLM Vision → Structured JSON → Save
This is the core pattern for DRAW-01 and GRPH-01. It is already implemented in palmistry:

```typescript
// Source: mystiqor-build/src/app/api/tools/palmistry/route.ts (verified)
// 1. Validate imageUrl input with Zod
// 2. Call invokeLLM with imageUrls: [imageUrl] — triggers gpt-4o automatically
// 3. Pass responseSchema + zodSchema for Zod validation
// 4. Save to analyses table with tool_type: 'drawing' | 'graphology'
// 5. Return { data: { ...result, analysis_id } }

const llmResponse = await invokeLLM({
  userId: user.id,
  imageUrls: [imageUrl],
  systemPrompt: systemPromptString,
  prompt: 'ניתוח...',
  responseSchema: drawingResponseSchemaObj,  // JSON shape hint
  zodSchema: DrawingResponseSchema,           // Zod for validation
  maxTokens: 2048,
})
```

### Pattern 2: Digital Canvas → toBlob → /api/upload → imageUrl
The canvas save path: `canvas.toBlob()` creates a PNG Blob, which is wrapped in a `File` object and sent to `/api/upload` via FormData — identical to regular file upload. The upload route returns `{ url, path }` and the URL is passed to the analysis API.

```typescript
// Source: github-source/src/components/DigitalCanvas.jsx lines 263-282 (verified)
canvas.toBlob(async (blob) => {
  const file = new File([blob], `drawing_${Date.now()}.png`, { type: 'image/png' })
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const { url } = await res.json()
  onSave(url, comprehensiveMetadata)  // passes URL + stroke metadata to parent
}, 'image/png')
```

### Pattern 3: Two-Person Form → Compatibility Analysis
Compatibility is text-only — no image upload. The pattern is identical to the existing numerology compatibility route:

```typescript
// Source: mystiqor-build/src/app/api/tools/numerology/compatibility/route.ts (pattern)
// 1. Zod schema validates { person1: { name, birthDate, birthTime? }, person2: {...}, type }
// 2. invokeLLM with structured prompt + responseSchema + zodSchema
// 3. Save to analyses with tool_type: 'compatibility'
// 4. Return structured result
```

### Pattern 4: PDF Export via CSS Print
```typescript
// In GraphologyPage — no library needed
<Button onClick={() => window.print()} variant="outline">
  ייצא PDF
</Button>
// CSS: @media print { .no-print { display: none } .print-content { display: block } }
```

### Pattern 5: Analysis Comparison
Query DB for past analyses of same tool_type, render two side-by-side cards:

```typescript
// Source: analyses table query pattern from other tools
const { data: pastAnalyses } = useQuery({
  queryKey: ['analyses', 'drawing'],
  queryFn: async () => {
    const res = await fetch('/api/analyses?tool_type=drawing&limit=10')
    return res.json()
  }
})
```

### Pattern 6: SubscriptionGuard Wrapping
Every tool form MUST be wrapped in `<SubscriptionGuard feature="analyses">`. This is the established pattern from Phases 3-4:

```typescript
// Source: mystiqor-build/src/app/(auth)/tools/palmistry/page.tsx line 151
<SubscriptionGuard feature="analyses">
  <form onSubmit={handleSubmit(onSubmit)}>
    {/* form content */}
  </form>
</SubscriptionGuard>
```

### Anti-Patterns to Avoid
- **Calling invokeLLM without imageUrls for image analysis:** Without `imageUrls`, the LLM service uses `gpt-4o-mini` (text only). Image analysis requires `imageUrls: [url]` to trigger `gpt-4o` vision mode.
- **Installing pdf-lib or html2canvas:** Not needed — `window.print()` + CSS handles RTL Hebrew correctly. These libraries have known RTL/Hebrew rendering issues and add 100KB+ to bundle.
- **Storing canvas state on server during drawing:** The canvas is client-side only until `handleSave()` exports it. Do not attempt to stream canvas operations.
- **Fetching all past analyses for comparison without pagination:** The analyses table can grow large. Always pass `limit` parameter.
- **Using `any` for LLM response data:** Use `DrawingResponse` / `GraphologyResponse` types from response schemas.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RTL PDF rendering | Custom PDF renderer | `window.print()` + CSS | Browser handles Hebrew RTL correctly; pdf-lib does not |
| Magic-byte validation | Custom byte checker | `validateMagicBytes()` from `file-validation.ts` | Already implemented and tested in Phase 1 |
| Canvas coordinate scaling | Custom touch/mouse handler | Port `getCanvasCoordinates()` from DigitalCanvas.jsx | Already handles scale, touch events, pressure |
| EXIF stripping | Custom metadata remover | `sharp()` in upload route | Already implemented in Phase 1 |
| LLM JSON mode | Custom prompting | `responseSchema` + `zodSchema` in `invokeLLM` | Phase 1 infrastructure handles validation |
| Stroke metadata collection | Custom analytics | Port `calculateStrokeMetadata()` from DigitalCanvas.jsx | Already handles speed, pressure, direction changes |

**Key insight:** The BASE44 source has complete working implementations of all complex UI components. Port them (don't rewrite from scratch) and adapt to TypeScript + project patterns.

## Common Pitfalls

### Pitfall 1: Canvas Scaling on Retina/HiDPI Displays
**What goes wrong:** Canvas draws blurry on high-DPI screens because CSS size != canvas pixel size.
**Why it happens:** The canvas element's `width`/`height` attributes control pixel resolution; CSS `width`/`height` control display size. On retina screens, the ratio is 2:1.
**How to avoid:** In the source `DigitalCanvas.jsx`, the canvas has `width=800 height=600` (fixed pixels). The coordinate scaling is handled in `getCanvasCoordinates()` with `canvas.width / rect.width`. Port this function exactly.
**Warning signs:** Drawing strokes appear offset from cursor position.

### Pitfall 2: Touch Events Not Prevented = Page Scroll During Drawing
**What goes wrong:** On mobile, drawing on canvas also scrolls the page.
**Why it happens:** Touch events bubble up to the scroll handler.
**How to avoid:** `e.preventDefault()` in `startDrawing`, `draw`, `stopDrawing` — exactly as in `DigitalCanvas.jsx` line 119. The canvas needs `touch-action: none` CSS.
**Warning signs:** Page scrolls while user tries to draw.

### Pitfall 3: Large Canvas toBlob PNG > 4.5MB → Vercel Body Limit
**What goes wrong:** An 800x600 canvas at full quality can export a PNG > 4.5MB, hitting Vercel's body limit.
**Why it happens:** Vercel serverless functions have a 4.5MB request body limit.
**How to avoid:** Use `canvas.toBlob(callback, 'image/jpeg', 0.85)` instead of PNG for large canvases. Or use the presign flow from Phase 1 (`/api/upload/presign` → direct Supabase upload). JPEG at 85% quality produces ~200-400KB for a drawing canvas. If the user uploaded a drawing (not canvas), the file already went through the Phase 1 upload path. Only the digital canvas export path has this risk.
**Warning signs:** 413 error or network error on canvas save.

### Pitfall 4: invokeLLM Without responseSchema Breaks Zod Validation
**What goes wrong:** Zod validation is silently skipped when `responseSchema` is omitted.
**Why it happens:** From `llm.ts` line 115: `if (request.zodSchema && request.responseSchema)` — BOTH must be present.
**How to avoid:** Always pass both `responseSchema` (JSON shape hint for JSON mode) AND `zodSchema` (Zod schema for validation) when expecting structured output.
**Warning signs:** `validationResult` is `undefined` in the LLM response.

### Pitfall 5: Graphology LLM Prompt Produces >4096 Tokens Response
**What goes wrong:** The BASE44 graphology prompt requests 12-18 insights each at 800-1200 words, easily exceeding the 4096 token default.
**Why it happens:** `invokeLLM` defaults to `maxTokens: 4096`. The graphology response schema requires 9+ components + insights + disclaimer.
**How to avoid:** Pass `maxTokens: 8000` (or up to 16000) for graphology. GPT-4o supports 16384 output tokens. The graphology prompt in `Graphology.jsx` lines 79-161 requests substantially more content than other tools.
**Warning signs:** Truncated JSON that fails Zod validation.

### Pitfall 6: Drawing Comparison Query N+1
**What goes wrong:** Fetching 10 past analyses then fetching each one's full result separately.
**Why it happens:** Naively fetching from analyses table without selecting results in the same query.
**How to avoid:** Single Supabase query with `.select('id, created_at, summary, results, input_data')` filtered by `tool_type` and `user_id`.
**Warning signs:** 10 separate network requests on comparison page load.

### Pitfall 7: ToolType for Compatibility Already Defined
**What goes wrong:** Using a string like `'numerology_compatibility'` for the compatibility tool_type.
**Why it happens:** The existing compatibility route uses `tool_type='compatibility'` per the STATE.md decision at line 126: "tool_type='compatibility' used for numerology compatibility analyses".
**How to avoid:** Use `tool_type: 'compatibility'` exactly — it is in `ToolType` union in `src/types/analysis.ts`.
**Warning signs:** TypeScript error "Type 'numerology_compatibility' is not assignable to type ToolType".

### Pitfall 8: Human Design + Palmistry SubscriptionGuard May Already Be Present
**What goes wrong:** Wasting time re-adding SubscriptionGuard that was already added.
**Why it happens:** Phase 4 audit confirmed "All 8 tool pages confirmed to have SubscriptionGuard wrapping". Human Design was built in Phase 4.
**How to avoid:** During plan execution, read the page files before modifying them. TOOL-02 (Human Design) is confirmed complete from Phase 4 STATE.md.
**Warning signs:** None — this is a false-work trap.

### Pitfall 9: Zod v4 `.nonempty()` Removed
**What goes wrong:** Porting BASE44 validation that uses `.nonempty()`.
**Why it happens:** Zod v4 removed `.nonempty()` — use `.min(1)` instead.
**How to avoid:** Use `z.string().min(1)` and `z.array(...).min(1)` throughout. This is flagged in STATE.md Blockers.
**Warning signs:** TypeScript error "Property nonempty does not exist".

## Code Examples

### Drawing Analysis API Route Pattern
```typescript
// Source: mystiqor-build/src/services/analysis/response-schemas/drawing.ts (verified)
// + mystiqor-build/src/app/api/tools/palmistry/route.ts pattern (verified)

import { DrawingResponseSchema } from '@/services/analysis/response-schemas/drawing'
import { buildDrawingAnalysisPrompt } from '@/services/drawing/analysis'

const DrawingInputSchema = z.object({
  imageUrl: z.string().url('כתובת URL לא תקינה'),
  drawingType: z.enum(['house', 'tree', 'person', 'free']),
  userAge: z.number().int().min(1).max(120).optional(),
  userGender: z.enum(['male', 'female', 'other']).optional(),
})

// In POST handler:
const prompt = buildDrawingAnalysisPrompt('ניתח את הציור', {})
const llmResponse = await invokeLLM({
  userId: user.id,
  imageUrls: [parsed.data.imageUrl],
  systemPrompt: '...',
  prompt,
  responseSchema: {
    summary: 'string', analysis_type: 'string',
    features: 'array', koppitz_score: 'number',
    emotional_indicators: 'array', insights: 'array'
  },
  zodSchema: DrawingResponseSchema,
  maxTokens: 3000,
})
```

### DigitalCanvas TypeScript Port — Key Interface
```typescript
// Source: github-source/src/components/DigitalCanvas.jsx (verified)
interface CanvasProps {
  taskName: string
  taskInstructions: string
  onSave: (file: File, metadata: DrawingMetadata) => void
  onCancel: () => void
}

interface DrawingMetadata {
  total_strokes: number
  total_drawing_time: number
  average_speed: number
  average_pressure: number
  erasures: number
  canvas_dimensions: { width: number; height: number }
  drawing_date: string
}
```

### Graphology Quick Stats — Component Shape
```typescript
// Source: mystiqor-build/src/services/analysis/response-schemas/graphology.ts (verified)
// GraphologyResponseSchema.components: array of { name, score_1_to_10, description }
// 9 named components form a radar chart using Recharts RadarChart (already in project)
interface GraphologyComponent {
  name: string           // e.g., "לחץ", "שיפוע", "גודל"
  score_1_to_10: number  // drives radar chart
  description: string    // tooltip content
}
```

### Compatibility Analysis — Zod Schema
```typescript
// Source: github-source/src/pages/Compatibility.jsx (verified + adapted)
const PersonSchema = z.object({
  name: z.string().min(1, 'שם חובה'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

const CompatibilityInputSchema = z.object({
  person1: PersonSchema,
  person2: PersonSchema,
  compatibilityType: z.enum(['romantic', 'friendship', 'professional', 'family']),
})
```

### Canvas toBlob → JPEG (Pitfall 3 solution)
```typescript
// Prevents >4.5MB uploads from digital canvas
canvas.toBlob(
  async (blob) => {
    if (!blob) return
    const file = new File([blob], `drawing_${Date.now()}.jpg`, { type: 'image/jpeg' })
    // ... upload via /api/upload
  },
  'image/jpeg',
  0.85  // 85% quality — sufficient for AI vision analysis
)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jsPDF for Hebrew PDFs | CSS print + window.print() | Ongoing — jsPDF RTL is broken | Zero new dependencies |
| Canvas 2D with explicit DPR | Fixed 800x600 with CSS scaling | Source already uses this | Simpler than DPR approach |
| Manual stroke recording | Metadata in toBlob callback | DigitalCanvas.jsx already does this | No server-side state needed |

**Deprecated/outdated:**
- `canvas.toDataURL()`: Still works but `toBlob()` is more memory-efficient for large canvases.
- `file_urls` parameter in BASE44 LLM calls: Replaced by `imageUrls` in `invokeLLM`.

## Open Questions

1. **Graphology maxTokens: How high is safe?**
   - What we know: GPT-4o supports up to 16,384 output tokens. The BASE44 graphology prompt requests 12-18 insights at 800-1200 words each — potentially 15,000+ tokens of output.
   - What's unclear: Whether the full prompt + response fits the 128k context window in practice.
   - Recommendation: Use `maxTokens: 8000` for graphology. If validation fails due to truncation, reduce insights requested in prompt to 5-8 (still meaningful, not truncated).

2. **Drawing comparison — which session to show?**
   - What we know: DRAW-05 requires "compare analyses across sessions". The analyses table has all past analyses per user.
   - What's unclear: Whether to show a picker (user selects two) or auto-compare latest two.
   - Recommendation: Show a session list, let user click two to compare. Plan the picker as a simple `<Select>` populated from past analyses query.

3. **GRPH-06 Reminder system — browser vs. server?**
   - What we know: Browser Notification API requires user permission. In-app reminders (just show a card on next visit) require only a DB timestamp.
   - What's unclear: How sophisticated the reminder should be.
   - Recommendation: v1 = simple DB-stored reminder with next-reminder date displayed in UI. No push notifications in Phase 5 (that's Phase 8 TRCK-06).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | None detected — Wave 0 gap |
| Quick run command | `cd mystiqor-build && npx vitest run --reporter=verbose` |
| Full suite command | `cd mystiqor-build && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DRAW-01 | Upload image → LLM analyzes → returns DrawingResponse | unit | `npx vitest run tests/api/drawing.test.ts` | Wave 0 |
| DRAW-02 | Canvas toBlob → File → upload path | unit | `npx vitest run tests/components/DigitalCanvas.test.tsx` | Wave 0 |
| DRAW-03 | Koppitz score renders with risk level badge | unit | `npx vitest run tests/components/KoppitzVisualization.test.tsx` | Wave 0 |
| DRAW-04 | AnnotatedDrawingViewer renders annotations from analysis | unit | `npx vitest run tests/components/AnnotatedDrawingViewer.test.tsx` | Wave 0 |
| DRAW-05 | Comparison page loads two past analyses | unit | `npx vitest run tests/components/DrawingCompare.test.tsx` | Wave 0 |
| DRAW-06 | Concept cards render static content | unit | `npx vitest run tests/components/DrawingConceptCards.test.tsx` | Wave 0 |
| GRPH-01 | Upload handwriting → LLM analyzes → returns GraphologyResponse | unit | `npx vitest run tests/api/graphology.test.ts` | Wave 0 |
| GRPH-02 | GraphologyTimeline renders step progress | unit | `npx vitest run tests/components/GraphologyTimeline.test.tsx` | Wave 0 |
| GRPH-03 | Comparison shows two graphology results | unit | `npx vitest run tests/components/GraphologyCompare.test.tsx` | Wave 0 |
| GRPH-04 | PDF export button triggers window.print | unit | `npx vitest run tests/components/graphology-pdf.test.tsx` | Wave 0 |
| GRPH-05 | Quick stats radar chart renders from components data | unit | `npx vitest run tests/components/GraphologyQuickStats.test.tsx` | Wave 0 |
| GRPH-06 | Reminder date saves and displays | unit | `npx vitest run tests/components/graphology-reminder.test.tsx` | Wave 0 |
| TOOL-02 | Human Design page already built — SubscriptionGuard present | smoke | `npx tsc --noEmit` in mystiqor-build | N/A (existing) |
| TOOL-03 | Palmistry page + API — SubscriptionGuard audit | smoke | `npx tsc --noEmit` in mystiqor-build | N/A (existing) |
| TOOL-04 | Compatibility form submits → returns score JSON | unit | `npx vitest run tests/api/compatibility.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd mystiqor-build && npx tsc --noEmit` (TypeScript gate, ~10s)
- **Per wave merge:** `cd mystiqor-build && npx vitest run` (full test suite)
- **Phase gate:** Full suite green + `tsc --noEmit` clean before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `mystiqor-build/vitest.config.ts` — Vitest config not found; needs creation
- [ ] `mystiqor-build/tests/` directory — no test files exist yet
- [ ] `mystiqor-build/tests/api/drawing.test.ts` — covers DRAW-01
- [ ] `mystiqor-build/tests/api/graphology.test.ts` — covers GRPH-01
- [ ] `mystiqor-build/tests/api/compatibility.test.ts` — covers TOOL-04
- [ ] `mystiqor-build/tests/components/DigitalCanvas.test.tsx` — covers DRAW-02
- [ ] `mystiqor-build/tests/setup.ts` — shared test setup for jsdom

## Sources

### Primary (HIGH confidence)
- `mystiqor-build/src/app/api/upload/route.ts` — upload infra confirmed complete
- `mystiqor-build/src/app/api/upload/presign/route.ts` — presign flow confirmed
- `mystiqor-build/src/lib/utils/file-validation.ts` — magic-byte + ALLOWED_TYPES confirmed
- `mystiqor-build/src/services/analysis/llm.ts` — imageUrls → gpt-4o confirmed at line 93
- `mystiqor-build/src/services/drawing/analysis.ts` — buildDrawingAnalysisPrompt + interfaces confirmed
- `mystiqor-build/src/services/analysis/response-schemas/drawing.ts` — DrawingResponseSchema confirmed
- `mystiqor-build/src/services/analysis/response-schemas/graphology.ts` — GraphologyResponseSchema confirmed
- `mystiqor-build/src/types/analysis.ts` — ToolType union confirmed, includes 'drawing', 'graphology', 'compatibility'
- `mystiqor-build/src/app/(auth)/tools/palmistry/page.tsx` — upload + form pattern confirmed
- `mystiqor-build/src/app/api/tools/palmistry/route.ts` — vision API route pattern confirmed
- `mystiqor-build/src/app/(auth)/tools/human-design/page.tsx` — TOOL-02 complete confirmed
- `mystiqor-build/src/app/api/tools/human-design/route.ts` — TOOL-02 API confirmed
- `mystiqor-build/package.json` — no PDF libraries; sharp present; no new deps needed

### Secondary (MEDIUM confidence)
- `github-source/src/components/DigitalCanvas.jsx` — canvas save flow verified in source
- `github-source/src/pages/DrawingAnalysis.jsx` — HTP flow + multi-drawing analysis verified
- `github-source/src/pages/Graphology.jsx` — 8-step graphology prompt verified
- `github-source/src/pages/Compatibility.jsx` — two-person form + LLM JSON schema verified
- `github-source/src/components/AnnotatedDrawingViewer.jsx` — annotation display pattern verified
- `github-source/src/components/KoppitzIndicatorsVisualization.jsx` — risk level groups verified
- `github-source/src/components/FDMVisualization.jsx` — micro phenomena display verified
- `github-source/src/components/GraphologyTimeline.jsx` — 8-step progress timeline verified
- `.planning/STATE.md` lines 126, 134 — ToolType decisions and Phase 4 completion confirmed

### Tertiary (LOW confidence)
- CSS print RTL Hebrew — based on general browser behavior knowledge; not project-specifically tested yet

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — entire dependency tree confirmed from package.json + existing code
- Architecture: HIGH — patterns verified from palmistry route + Phase 4 tools; response schemas exist
- Pitfalls: HIGH — canvas pitfalls from source code analysis; LLM pitfalls from llm.ts source; ToolType pitfall from STATE.md
- PDF export approach: MEDIUM — CSS print works for RTL Hebrew in general, but not yet verified in this specific Next.js + Tailwind setup

**Research date:** 2026-03-23
**Valid until:** 2026-05-23 (stable stack — no fast-moving dependencies)
