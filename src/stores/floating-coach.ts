/**
 * חנות Zustand לניהול מצב חלונית המאמן הצפה
 *
 * ללא persist — המצב מאופס בכל ניווט (D-21).
 * מאפשרת תקשורת בין FloatingCoachBubble ל-FloatingCoachPanel.
 */

import { create } from 'zustand';
import type { Message } from '@/services/coach/api';

/** מצב חלונית המאמן הצפה */
interface FloatingCoachState {
  /** האם החלונית פתוחה */
  isOpen: boolean;
  /** מזהה השיחה הפעילה, או null אם אין שיחה פעילה */
  activeConversationId: string | null;
  /** הודעות השיחה הנוכחית */
  messages: Message[];
  /** האם בתהליך טעינה */
  isLoading: boolean;
  /** פותח את החלונית */
  open: () => void;
  /** סוגר את החלונית */
  close: () => void;
  /** מחליף בין פתוח לסגור */
  toggle: () => void;
  /** קובע את מזהה השיחה הפעילה */
  setActiveConversationId: (id: string | null) => void;
  /** מחליף את כל ההודעות */
  setMessages: (msgs: Message[]) => void;
  /** מוסיף הודעה בודדת לסוף הרשימה */
  addMessage: (msg: Message) => void;
  /** קובע מצב טעינה */
  setIsLoading: (loading: boolean) => void;
}

/** חנות מצב חלונית המאמן הצפה — ללא persist */
export const useFloatingCoachStore = create<FloatingCoachState>()((set) => ({
  isOpen: false,
  activeConversationId: null,
  messages: [],
  isLoading: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
