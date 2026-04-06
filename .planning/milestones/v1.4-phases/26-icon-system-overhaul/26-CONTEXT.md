# Phase 26: Icon System Overhaul - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace all react-icons/gi icons with Lucide icons across the entire app. Create a centralized icon mapping, ensure every tool has a unique icon, and remove the gi dependency.

</domain>

<decisions>
## Implementation Decisions

### Icon Source Strategy
- Use Lucide Icons (lucide-react) — already installed, professional, consistent 1400+ set
- Single color for all icons: text-primary (purple) with subtle glow
- Sidebar icon size: h-5 w-5 (20px)
- No tooltips needed — names already displayed

### Icon Mapping (17 tools)
- Astrology → Orbit
- Tarot → Layers
- Numerology → Hash
- Dream → Moon
- Palmistry → Hand
- Graphology → PenTool
- Drawing → Palette
- Human Design → Dna
- Compatibility → Heart
- Coach/Crystal Ball → Sparkles
- Personality → Brain
- Career → Compass
- Relationships → Users
- Document → FileSearch
- Timing → Clock
- Synthesis → Merge
- Daily Insights → Sun

### Migration Scope
- Replace ALL gi icons across sidebar, tool pages, and headers
- Create centralized mapping at lib/constants/tool-icons.ts
- Remove react-icons/gi dependency completely after migration

### Claude's Discretion
- Mapping of secondary/utility icons (non-tool icons like GiGraduateCap, GiNewspaper, etc.) to Lucide equivalents
- Import organization and cleanup strategy

</decisions>

<code_context>
## Existing Code Insights

### Current Icon Usage
- 42 unique Gi* icons across codebase
- Main files: Sidebar.tsx (26 imports), ToolGrid.tsx (10), tool pages (1-4 each)
- BottomTabBar.tsx uses GiCrystalBall for coach tab
- HeroToolCard.tsx uses icons from lib/constants/tools.ts

### Integration Points
- src/components/layouts/Sidebar.tsx — NAV_SECTIONS array
- src/components/features/shared/ToolGrid.tsx — TOOL_IMAGES mapping
- src/components/layouts/BottomTabBar.tsx — TABS array
- src/lib/constants/tools.ts — PRIMARY_TOOLS array (Icon field)
- 13+ individual tool page files

</code_context>

<specifics>
## Specific Ideas

No specific requirements — use Lucide equivalents that are visually distinct per tool.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
