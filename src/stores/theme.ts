/**
 * חנות Zustand לניהול ערכת נושא (בהיר/כהה)
 * שומרת בחירה ב-localStorage ומסנכרנת עם class על ה-DOM
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** מצב ערכת הנושא */
interface ThemeState {
  /** הערכה הנוכחית — כהה או בהיר */
  theme: 'dark' | 'light';
  /** מחליף בין כהה לבהיר */
  toggleTheme: () => void;
  /** קובע ערכת נושא ספציפית */
  setTheme: (theme: 'dark' | 'light') => void;
}

/** עדכון ה-DOM class בהתאם לערכה הנבחרת */
function applyThemeToDOM(theme: 'dark' | 'light'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          applyThemeToDOM(newTheme);
          return { theme: newTheme };
        }),

      setTheme: (theme) => {
        applyThemeToDOM(theme);
        set({ theme });
      },
    }),
    { name: 'mystiqor-theme' }
  )
);
