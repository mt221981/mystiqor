---
phase: 10-polish-pwa-export
plan: "01"
subsystem: export-sharing
tags: [pdf-export, social-sharing, react-pdf, heebo, rls, supabase]
dependency_graph:
  requires: []
  provides: [pdf-export, share-link-generation, public-share-page]
  affects: [analyses-table, next-config, public-routes]
tech_stack:
  added: ["@react-pdf/renderer", "react-share"]
  patterns: [dynamic-import-ssr-false, unicode-rle-hebrew, admin-client-bypass-rls]
key_files:
  created:
    - mystiqor-build/supabase/migrations/005_schema_fixes.sql
    - mystiqor-build/src/components/features/export/pdf-styles.ts
    - mystiqor-build/src/components/features/export/AnalysisPDF.tsx
    - mystiqor-build/src/components/features/export/ExportButton.tsx
    - mystiqor-build/src/app/api/analysis/share/route.ts
    - mystiqor-build/src/app/(public)/share/[token]/page.tsx
    - mystiqor-build/src/components/features/sharing/SharePanel.tsx
    - mystiqor-build/public/fonts/Heebo-Regular.ttf
  modified:
    - mystiqor-build/src/types/database.ts
    - mystiqor-build/src/lib/validations/analysis.ts
    - mystiqor-build/next.config.ts
    - mystiqor-build/package.json
decisions:
  - "Heebo font downloaded directly from Google Fonts CDN (117KB) — static weight 400, not variable"
  - "ExportButton uses lazy initialization pattern (showPDF state) to avoid rendering PDFDownloadLink until user clicks — prevents unnecessary PDF worker load"
  - "Public share page uses createAdminClient() directly (not self-fetch via GET /api/share) — avoids request overhead in server component"
  - "navigator.share check uses 'share' in navigator pattern — avoids TS2774 error from direct property boolean evaluation"
  - "SharePanel strips user_id in route GET response for privacy — user_id destructured and omitted"
metrics:
  duration: "7 minutes"
  completed: "2026-03-24"
  tasks: 2
  files_created: 8
  files_modified: 4
---

# Phase 10 Plan 01: PDF Export + Social Sharing Summary

**One-liner:** React-pdf PDF export with Heebo Hebrew RTL font + share token API + public share page + WhatsApp/Telegram/Facebook social buttons.

## What Was Built

### Task 1: DB Migration + PDF Export Components + next.config
- **005_schema_fixes.sql**: Idempotent migration adds `share_token UUID DEFAULT gen_random_uuid()` and `is_public BOOLEAN DEFAULT FALSE NOT NULL` to analyses table, plus unique index and RLS policy allowing public reads on `is_public=true`.
- **database.ts**: Updated `analyses` Row/Insert/Update types with `share_token: string | null` and `is_public: boolean`.
- **pdf-styles.ts**: Registers Heebo font at module scope, defines `pdfStyles` StyleSheet with `direction: 'rtl'`, exports `hebrewText(text)` Unicode RLE wrapper (`\u202B`), and `TOOL_NAMES_HE` lookup map for all 18 tool types.
- **AnalysisPDF.tsx**: React-pdf Document with `renderResults()` recursive helper (max depth 3) for string/number/array/object values — all wrapped with `hebrewText()` for correct RTL rendering.
- **ExportButton.tsx**: `PDFDownloadLink` loaded via `dynamic(..., {ssr: false})` with lazy `showPDF` state — PDF worker only loads on first click.
- **analysis.ts**: Added `ShareAnalysisSchema` (UUID) and `ShareTokenSchema` (UUID) without modifying existing schemas.
- **next.config.ts**: Added `transpilePackages: ['@react-pdf/renderer']` (fixes ESM error) and `headers()` for `/sw.js` with `Cache-Control: no-cache`.
- **Heebo-Regular.ttf**: 117KB static font file in `public/fonts/` — required for PDF Hebrew text rendering.

### Task 2: Share API Route + Public Share Page + SharePanel
- **route.ts (POST)**: Authenticates user, validates `analysis_id` UUID with `ShareAnalysisSchema`, verifies ownership via `eq('user_id', user.id)`, sets `is_public=true`, returns `{ share_url, share_token }`.
- **route.ts (GET)**: Validates token UUID with `ShareTokenSchema`, queries via `createAdminClient()` with `share_token + is_public=true`, strips `user_id` from response.
- **share/[token]/page.tsx**: Server component — `createAdminClient()` direct query, `notFound()` for missing/non-public analyses, `generateMetadata()` with Open Graph title/description, Hebrew RTL card layout with tool name + date + summary + recursive results, "הרשמו ב-MystiQor" CTA link.
- **SharePanel.tsx**: `useMutation` calls POST `/api/analysis/share`, shows share URL in read-only input with copy button + 2-second "הועתק!" feedback, native share via `'share' in navigator` check, WhatsappShareButton + TelegramShareButton + FacebookShareButton with 32px icons.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript TS2774 on navigator.share check**
- **Found during:** Task 2 verification (tsc --noEmit)
- **Issue:** `navigator.share &&` triggers TS2774 — TypeScript knows `share` is always defined as a function type on the NavigatorShareData interface, so boolean evaluation always returns true
- **Fix:** Changed to `'share' in navigator` pattern which properly checks runtime API availability without TypeScript error
- **Files modified:** `src/components/features/sharing/SharePanel.tsx`
- **Commit:** b98a8e6

## Known Stubs

None — all components are fully wired:
- ExportButton renders real PDFDownloadLink with AnalysisPDF
- SharePanel calls real `/api/analysis/share` endpoint
- Public share page queries real analyses table via admin client
- Font file is real Heebo TTF (117KB), not a placeholder

## Verification Results

All acceptance criteria passed:

**Task 1 (16/16):**
- share_token + is_public in migration SQL
- share_token + is_public in database.ts types
- ShareAnalysisSchema + ShareTokenSchema in validations
- Heebo-Regular.ttf exists (117KB)
- hebrewText + direction:rtl + Font.register in pdf-styles.ts
- AnalysisPDF.tsx exists with Document/Page
- PDFDownloadLink + ssr:false in ExportButton.tsx
- transpilePackages + sw.js + Cache-Control in next.config.ts
- tsc --noEmit: 0 errors

**Task 2 (12/12):**
- share route.ts exists with POST + GET handlers
- share_token + is_public in route
- share/[token]/page.tsx with notFound() + generateMetadata()
- SharePanel.tsx with WhatsappShareButton + navigator.share + useMutation
- tsc --noEmit: 0 errors

## Self-Check: PASSED
