---
phase: 01-infrastructure-hardening
plan: 03
subsystem: api
tags: [supabase, storage, sharp, zod, file-upload, magic-bytes, exif, presigned-url]

# Dependency graph
requires:
  - phase: 00-foundation
    provides: Next.js App Router + Supabase server client + existing upload route

provides:
  - Magic-byte file validation utility (file-validation.ts) used by upload routes
  - Presigned URL endpoint for client-direct uploads bypassing Vercel 4.5MB limit
  - Hardened upload route with magic-byte validation and EXIF stripping via sharp

affects:
  - Any future upload-consuming feature (drawing analysis, handwriting, document upload)
  - Client-side upload components that need to use presign flow for large files

# Tech tracking
tech-stack:
  added: [sharp@0.34.5]
  patterns:
    - Magic-byte validation pattern (compare first 12 bytes vs declared MIME type)
    - Presign flow pattern (client gets signed URL, uploads directly to storage)
    - EXIF stripping via sharp before storage (privacy protection)

key-files:
  created:
    - mystiqor-build/src/lib/utils/file-validation.ts
    - mystiqor-build/src/app/api/upload/presign/route.ts
  modified:
    - mystiqor-build/src/app/api/upload/route.ts

key-decisions:
  - "sharp used for EXIF stripping — handles JPEG/PNG/WebP, strips GPS coordinates before storage"
  - "Presign flow chosen for large file uploads (>4.5MB) to bypass Vercel body limit"
  - "ALLOWED_TYPES and MAX_FILE_SIZE centralized in file-validation.ts — both routes share constants"
  - "Magic-byte validation reads first 12 bytes — sufficient for all 4 supported formats"

patterns-established:
  - "File validation pattern: MIME check → size check → magic-byte check → process → upload"
  - "Presign pattern: auth check → Zod validate metadata → createSignedUploadUrl → return {signedUrl, token, path}"

requirements-completed: [INFRA-02]

# Metrics
duration: 3min
completed: 2026-03-22
---

# Phase 01 Plan 03: Upload Hardening Summary

**Presigned URL endpoint for client-direct Supabase Storage uploads, magic-byte MIME validation utility, and EXIF stripping via sharp on the existing upload route**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-22T09:15:30Z
- **Completed:** 2026-03-22T09:18:00Z
- **Tasks:** 2
- **Files modified:** 3 (1 created utility, 1 new presign route, 1 updated upload route)

## Accomplishments

- Created `file-validation.ts` with magic-byte signatures for JPEG, PNG, WebP, PDF — shared by both upload routes
- Created `/api/upload/presign` endpoint with Zod validation, auth check, and `createSignedUploadUrl` — enables uploads >4.5MB
- Hardened existing `/api/upload` route: magic-byte validation + EXIF stripping via sharp + shared constants
- TypeScript compilation: zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create file-validation utility with magic-byte checking** - `2c56669` (feat)
2. **Task 2: Create presign route + harden existing upload route** - `2675304` (feat)

**Plan metadata:** committed via gsd-tools docs commit (see below)

## Files Created/Modified

- `mystiqor-build/src/lib/utils/file-validation.ts` - Magic-byte validation (MAGIC_BYTES signatures, validateMagicBytes, isAllowedType, ALLOWED_TYPES, MAX_FILE_SIZE)
- `mystiqor-build/src/app/api/upload/presign/route.ts` - Presigned URL endpoint (auth + Zod + createSignedUploadUrl)
- `mystiqor-build/src/app/api/upload/route.ts` - Hardened with magic-byte check + sharp EXIF strip + shared validation constants

## Decisions Made

- Used `sharp` for EXIF stripping — it handles JPEG, PNG, WebP and automatically strips all metadata including GPS coordinates. PDF files are skipped (no EXIF concern).
- Centralized `ALLOWED_TYPES` and `MAX_FILE_SIZE` in `file-validation.ts` — single source of truth used by both the direct upload route and the presign route validation schema.
- Presign route uses `z.enum(ALLOWED_TYPES)` — works with Zod v4's const array tuple.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed sharp dependency**
- **Found during:** Task 2 (hardening upload route with EXIF stripping)
- **Issue:** `sharp` was not in `package.json` dependencies; import would fail at runtime
- **Fix:** Ran `npm install sharp --save --legacy-peer-deps` (legacy-peer-deps needed due to React 19 peer dep conflicts in existing packages)
- **Files modified:** package.json, package-lock.json
- **Verification:** `npm list sharp` confirms `sharp@0.34.5` installed; TSC passes
- **Committed in:** `2675304` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking missing dependency)
**Impact on plan:** Necessary for EXIF stripping to function. No scope creep.

## Issues Encountered

- `mystiqor-build/` has its own embedded git repository — commits made inside `mystiqor-build/` git context, not the outer MystiQor repo. This is the correct pattern for this project.

## User Setup Required

None - no external service configuration required. Supabase Storage bucket `uploads` must exist (already addressed in earlier infra plans).

## Next Phase Readiness

- File upload hardening complete: presign endpoint ready for client integration
- Any component doing file uploads should use `/api/upload/presign` for files > 4MB, `/api/upload` for smaller files
- `file-validation.ts` utility can be imported by any future upload-related route

---
*Phase: 01-infrastructure-hardening*
*Completed: 2026-03-22*

## Self-Check: PASSED

- FOUND: mystiqor-build/src/lib/utils/file-validation.ts
- FOUND: mystiqor-build/src/app/api/upload/presign/route.ts
- FOUND: mystiqor-build/src/app/api/upload/route.ts
- FOUND: .planning/phases/01-infrastructure-hardening/01-03-SUMMARY.md
- Commit 2c56669 verified in mystiqor-build git log
- Commit 2675304 verified in mystiqor-build git log
