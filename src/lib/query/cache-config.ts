/**
 * הגדרות caching ל-React Query - GEM 8
 * זמני cache, אסטרטגיות retry ומפתחות שאילתות טיפוסיים
 * מקור: CachedQuery.jsx - ערכים מדויקים מהמערכת המקורית
 */

import type { QueryClientConfig } from '@tanstack/react-query';

// ===== זמני cache =====

/**
 * קבועי זמן cache במילישניות
 * ערכים מקוריים מ-CachedQuery.jsx
 */
export const CACHE_TIMES = {
  /** 2 דקות - נתונים דינמיים שמשתנים בתדירות */
  SHORT: 2 * 60 * 1000,
  /** 5 דקות - נתונים סטנדרטיים */
  MEDIUM: 5 * 60 * 1000,
  /** 15 דקות - נתונים יציבים */
  LONG: 15 * 60 * 1000,
  /** שעה - נתונים כמעט סטטיים */
  VERY_LONG: 60 * 60 * 1000,
} as const;

/** טיפוס זמני cache */
export type CacheTime = (typeof CACHE_TIMES)[keyof typeof CACHE_TIMES];

// ===== הגדרות ברירת מחדל =====

/**
 * מחזיר הגדרות ברירת מחדל ל-React Query
 * כולל retry חכם שלא מנסה שוב על שגיאות 401/403
 */
export function defaultQueryOptions(): QueryClientConfig {
  return {
    defaultOptions: {
      queries: {
        staleTime: CACHE_TIMES.LONG,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          /** לא מנסים שוב על שגיאות אימות */
          if (isAuthError(error)) {
            return false;
          }
          /** מנסים עד 2 פעמים לשגיאות אחרות */
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
      mutations: {
        retry: false,
      },
    },
  };
}

/**
 * בודק אם שגיאה היא שגיאת אימות (401/403)
 * משמש למניעת retry מיותר
 */
function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('not authenticated')
    );
  }
  return false;
}

// ===== מפתחות שאילתות =====

/**
 * מפתחות שאילתות טיפוסיים לשימוש עם React Query
 * כל מפתח הוא factory function שמייצרת מערך מפתחות
 * זה מאפשר invalidation ממוקדת
 */
export const queryKeys = {
  /** מפתחות מנוי */
  subscription: {
    all: ['subscription'] as const,
    current: () => [...queryKeys.subscription.all, 'current'] as const,
  },

  /** מפתחות פרופיל משתמש */
  profile: {
    all: ['profile'] as const,
    current: () => [...queryKeys.profile.all, 'current'] as const,
    byId: (id: string) => [...queryKeys.profile.all, id] as const,
  },

  /** מפתחות ניתוחים */
  analyses: {
    all: ['analyses'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.analyses.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.analyses.all, id] as const,
    byType: (type: string) =>
      [...queryKeys.analyses.all, 'type', type] as const,
  },

  /** מפתחות יעדים */
  goals: {
    all: ['goals'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.goals.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.goals.all, id] as const,
    active: () => [...queryKeys.goals.all, 'active'] as const,
    completed: () => [...queryKeys.goals.all, 'completed'] as const,
  },

  /** מפתחות מצבי רוח */
  moods: {
    all: ['moods'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.moods.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.moods.all, id] as const,
    recent: (days: number) =>
      [...queryKeys.moods.all, 'recent', days] as const,
  },

  /** מפתחות יומן */
  journal: {
    all: ['journal'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.journal.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.journal.all, id] as const,
  },

  /** מפתחות תובנות */
  insights: {
    all: ['insights'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.insights.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.insights.all, id] as const,
    daily: () => [...queryKeys.insights.all, 'daily'] as const,
  },

  /** מפתחות חלומות */
  dreams: {
    all: ['dreams'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.dreams.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.dreams.all, id] as const,
  },

  /** מפתחות מסעות */
  journeys: {
    all: ['journeys'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.journeys.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.journeys.all, id] as const,
    active: () => [...queryKeys.journeys.all, 'active'] as const,
  },

  /** מפתחות תזכורות */
  reminders: {
    all: ['reminders'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.reminders.all, 'list', filters] as const,
    upcoming: () => [...queryKeys.reminders.all, 'upcoming'] as const,
  },

  /** מפתחות למידה */
  learning: {
    all: ['learning'] as const,
    courses: () => [...queryKeys.learning.all, 'courses'] as const,
    progress: (courseId: string) =>
      [...queryKeys.learning.all, 'progress', courseId] as const,
  },
} as const;
