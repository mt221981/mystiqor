# Phase 27: Holistic Sidebar Redesign - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the sidebar to feel like an organic part of the mystical app — not a separate pasted component. Refine backgrounds, spacing, typography, active/hover states, logo integration, and category separators.

</domain>

<decisions>
## Implementation Decisions

### Sidebar Visual Design
- Background: semi-transparent with blur — bg-surface/60 backdrop-blur-md (merges with app)
- Category separators: subtle thin lines border-outline-variant/5 with spacing
- Active state: bg-primary/10 text-primary with side indicator bar
- Hover effect: bg-white/5 with smooth transition

### Logo Integration
- Keep current blend-luminous + mask vignette approach — refine sizing
- Logo width: w-40 (160px) — doesn't stretch sidebar
- Logo area padding: py-4 px-3 — more compact
- Keep "המסע המיסטי שלך" subtitle

### Claude's Discretion
- Font sizes and weights for nav items
- Spacing between items
- Category header styling
- Collapsed/expanded state animations
- ScrollArea styling refinements

</decisions>

<code_context>
## Existing Code Insights

### Target File
- src/components/layouts/Sidebar.tsx — single file, all sidebar rendering

### Current State (post Phase 26)
- All icons migrated to Lucide (Phase 26 complete)
- Logo uses Image with blend-luminous + mask-image vignette
- NAV_SECTIONS has 6 categories with collapsible sections
- localStorage persistence for open/closed state
- Active path highlighting exists

### Integration Points
- layout-client.tsx renders Sidebar
- Mobile view shows/hides via state

</code_context>

<specifics>
## Specific Ideas

No specific requirements — create a holistic, mystical sidebar that feels part of the cosmic dark theme.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
