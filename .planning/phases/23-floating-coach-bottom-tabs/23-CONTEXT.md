# Phase 23: Floating Coach & Bottom Tabs - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

מאמן AI נגיש מכל עמוד מאומת דרך בועה צפה (FAB) שפותחת פאנל צ'אט מיני, ו-5 טאבים תחתונים במובייל שמחליפים את ההמבורגר כניווט ראשי.

</domain>

<decisions>
## Implementation Decisions

### Floating Bubble (FAB)
- **D-01:** אייקון: GiCrystalBall (react-icons/gi) — כבר משמש בסרגל הצד למאמן AI
- **D-02:** מיקום: פינה שמאלית תחתונה (inset-inline-start for RTL) — מעל הטאבים התחתונים במובייל
- **D-03:** סגנון: גרדיאנט סגול/זהב (primary → gold) + זוהר celestial-glow + אנימציית נשימה (scale 1.0→1.05 במחזור 4 שניות)
- **D-04:** גודל: 56px (w-14 h-14) — גדול מספיק ללחיצה קלה במובייל
- **D-05:** z-index: var(--z-floating) (60) — מעל header ו-tabs
- **D-06:** מוסתר ב-pathname === '/coach' — שם יש את העמוד המלא

### Chat Panel (Mini)
- **D-07:** פאנל עולה מלמטה (slide-up) עם AnimatePresence — ~380px גובה, glass-panel רקע
- **D-08:** תוכן: שדה הודעות (3-5 אחרונות), שורת קלט, כפתור "פתח שיחה מלאה" (לינק ל-/coach)
- **D-09:** משתמש ב-API routes הקיימים: /api/coach/conversations + /api/coach/messages — לא צריך API חדש
- **D-10:** z-index: var(--z-panel) (55) — מתחת לבועה עצמה

### Context-Aware Opener Messages
- **D-11:** מיפוי נתיב-להודעה — כל route מקבל הודעת פתיחה ייחודית בעברית. דוגמאות:
  - /tools/astrology → "ראיתי שקיבלת מפת לידה, רוצה לחקור יחד?"
  - /tools/tarot → "קריאת טארוט מרתקת! רוצה שנצלול לתובנות?"
  - /tools/numerology → "המספרים שלך מספרים סיפור, בוא נפענח"
  - /dashboard → "מה נעשה היום? אני כאן בשבילך"
  - default → "שלום! איך אפשר לעזור?"
- **D-12:** ההודעה מוצגת כטקסט ראשון בפאנל (לא נשלחת ל-API) — היא UI בלבד

### Bottom Tab Bar
- **D-13:** 5 טאבים: לוח בקרה (/dashboard) | מאמן AI (/coach) | תובנות (/daily-insights) | כלים (tools grid) | פרופיל (/profile)
- **D-14:** "כלים" פותח עמוד רשימת כלים (grid עם כרטיסיות + אייקונים לכל כלי) — לא את הסרגל הצדי
- **D-15:** visible only on mobile (md:hidden) — בדסקטופ הסרגל הצדי הקיים משמש
- **D-16:** z-index: var(--z-tabs) (40) — מתחת ל-header
- **D-17:** glass-nav סגנון (כמו הסרגל הצדי) — backdrop-filter blur עם שקיפות
- **D-18:** טאב פעיל מסומן עם צבע primary + indicator

### Layout Integration
- **D-19:** FloatingCoachBubble + FloatingCoachPanel + BottomTabBar נוספים ל-layout-client.tsx כ-siblings של main content
- **D-20:** main content padding-bottom: pb-20 md:pb-0 — מקום לטאבים התחתונים במובייל
- **D-21:** Zustand store (useFloatingCoachStore) מנהל: isOpen, activeConversationId, messages[], isLoading

### Coach API Extraction
- **D-22:** לחלץ fetchMessages, sendMessage, createConversation מ-coach/page.tsx ל-services/coach/api.ts — שימוש משותף בין עמוד מלא ופאנל צף

### Claude's Discretion
- אנימציית הפאנל (spring config, duration) — Claude יבחר פרמטרים
- האם הפאנל תומך ביצירת שיחה חדשה או רק ממשיך את האחרונה — Claude יחליט (מומלץ: ממשיך אחרונה או יוצר אם אין)
- עיצוב עמוד רשימת כלים (grid 2x או 3x, גודל כרטיסיות) — Claude יחליט
- אייקוני הטאבים (Lucide icons) — Claude יבחר

</decisions>

<canonical_refs>
## Canonical References

### Layout (where new components mount)
- `mystiqor-build/src/app/(auth)/layout-client.tsx` — Client auth layout, add FloatingCoach + BottomTabs here
- `mystiqor-build/src/app/(auth)/layout.tsx` — Server auth layout

### Existing Coach System (reuse)
- `mystiqor-build/src/app/(auth)/coach/page.tsx` — Full coach page (393 lines) — extract API logic from here
- `mystiqor-build/src/components/features/coach/ChatMessage.tsx` — Message bubble component
- `mystiqor-build/src/components/features/coach/ChatInput.tsx` — Input component
- `mystiqor-build/src/components/features/coach/QuickActions.tsx` — Quick action buttons
- `mystiqor-build/src/app/api/coach/messages/route.ts` — Messages API
- `mystiqor-build/src/app/api/coach/conversations/route.ts` — Conversations API
- `mystiqor-build/src/services/coach/context-builder.ts` — Context builder

### Navigation (reference for bottom tabs)
- `mystiqor-build/src/components/layouts/Sidebar.tsx` — Current sidebar navigation (47 items, 8 categories)
- `mystiqor-build/src/components/layouts/MobileNav.tsx` — Current mobile nav (hamburger)
- `mystiqor-build/src/components/layouts/Header.tsx` — Header component

### Design System
- `mystiqor-build/src/app/globals.css` — glass-nav, glass-panel, celestial-glow, gold-glow, z-index scale
- `mystiqor-build/tailwind.config.ts` — MD3 color tokens

### Research
- `.planning/research/ARCHITECTURE.md` — FloatingCoach architecture, z-index strategy, build order
- `.planning/research/FEATURES.md` — Feature landscape, comparable apps
- `.planning/research/PITFALLS.md` — z-index collisions, iOS PWA keyboard issues

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- ChatMessage.tsx — message bubble component, reusable in mini panel
- ChatInput.tsx — input with auto-height, Enter to send, reusable
- /api/coach/messages — existing GET/POST, no changes needed
- /api/coach/conversations — existing POST for creating conversations
- glass-nav, glass-panel CSS classes — for bottom tabs and panel styling
- celestial-glow, gold-glow — for bubble glow effect
- GiCrystalBall — already imported in Sidebar.tsx

### Established Patterns
- framer-motion AnimatePresence used in PageTransition component
- Zustand stores in src/stores/ (theme.ts exists)
- usePathname() for route detection (already used in Sidebar active state)
- RTL: inset-inline-start/end for positioning

### Integration Points
- layout-client.tsx — add FloatingCoachBubble, FloatingCoachPanel, BottomTabBar as siblings
- coach/page.tsx — extract API calls to shared service, then import back
- MobileNav.tsx — keep as secondary nav, tabs become primary
- globals.css — z-index scale already defined (Phase 22)

</code_context>

<specifics>
## Specific Ideas

- הבועה צריכה להרגיש "חיה" — אנימציית נשימה שנותנת תחושה שיש מישהו שם
- הפאנל צריך להיות מהיר ופשוט — לא להעמיס, מקסימום 3-5 הודעות אחרונות
- הטאבים התחתונים צריכים להיות פשוטים ואינטואיטיביים — אייקון + תווית קצרה
- "כלים" פותח עמוד grid נפרד (לא dropdown) — מבט כולל על כל הכלים

</specifics>

<deferred>
## Deferred Ideas

- סטרימינג צ'אט בזמן אמת (v1.4)
- תג התראה על הודעות שלא נקראו (v1.4)
- קיצור מקלדת לפתיחת המאמן (Cmd+K) — לא בסקופ
- ניתוב "כלים" כ-bottom sheet במקום עמוד — אולי בעתיד

</deferred>

---

*Phase: 23-floating-coach-bottom-tabs*
*Context gathered: 2026-03-30*
