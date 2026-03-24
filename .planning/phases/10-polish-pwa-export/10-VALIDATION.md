---
phase: 10
slug: polish-pwa-export
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 10 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compilation (`tsc --noEmit`) |
| **Quick run command** | `cd mystiqor-build && npx tsc --noEmit` |
| **Estimated runtime** | ~12 seconds |

**Vitest status:** Not configured. Automated gate is `tsc --noEmit` only.

## Sampling Rate

- **After every task commit:** Run `cd mystiqor-build && npx tsc --noEmit`
- **Max feedback latency:** 12 seconds

## Wave 0 Requirements

Complete — all core deps installed. @react-pdf/renderer and serwist installed in plan first tasks.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual |
|----------|-------------|------------|
| PDF exports Hebrew RTL correctly | EXPO-01 | Visual PDF rendering check |
| PWA install prompt appears | UX-04 | Requires HTTPS or localhost + Chrome |
| Share link generates public URL | EXPO-02 | Requires 2 browser sessions |
| Keyboard navigation works | UX-04 | Manual tab-through |

## Validation Sign-Off

- [x] nyquist_compliant: true
- [x] All tasks have automated verify
- [x] Feedback latency < 15s

**Approval:** complete
