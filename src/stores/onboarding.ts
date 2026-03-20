/**
 * חנות Zustand לאשף ההכנסה — שומר מצב בין שלבי הטופס הרב-שלבי
 * משתמש ב-persist middleware לשמירת מצב ב-localStorage
 * Phase 2 onboarding pages יצרכו חנות זו
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** נתוני ההכנסה המלאים של המשתמש */
interface OnboardingData {
  /** שם מלא */
  fullName: string;
  /** תאריך לידה — פורמט ISO */
  birthDate: string;
  /** שעת לידה — HH:MM */
  birthTime: string;
  /** מקום לידה — שם עיר */
  birthPlace: string;
  /** קו רוחב — null עד שנבחר מיקום */
  latitude: number | null;
  /** קו אורך — null עד שנבחר מיקום */
  longitude: number | null;
  /** תחומי העניין שנבחרו */
  disciplines: string[];
  /** האם הסכים לאזהרת Barnum */
  acceptedBarnum: boolean;
  /** האם הסכים לתנאי השימוש */
  acceptedTerms: boolean;
}

/** מצב ופעולות של אשף ההכנסה */
interface OnboardingState {
  /** שלב נוכחי בין 1 ל-4 */
  step: 1 | 2 | 3 | 4;
  /** נתוני ההכנסה */
  data: OnboardingData;
  /** עדכון שלב */
  setStep: (step: 1 | 2 | 3 | 4) => void;
  /** עדכון חלקי של נתוני ההכנסה */
  updateData: (partial: Partial<OnboardingData>) => void;
  /** איפוס לברירות מחדל */
  reset: () => void;
}

/** נתוני ברירת מחדל ריקים */
const INITIAL_DATA: OnboardingData = {
  fullName: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
  latitude: null,
  longitude: null,
  disciplines: [],
  acceptedBarnum: false,
  acceptedTerms: false,
};

/**
 * חנות Zustand לניהול מצב אשף ההכנסה
 * persist שומר מצב ב-localStorage תחת המפתח 'mystiqor-onboarding'
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      data: INITIAL_DATA,

      /** מגדיר את השלב הנוכחי של האשף */
      setStep: (step) => set({ step }),

      /** מעדכן שדות ספציפיים בנתוני ההכנסה ללא דריסה של השאר */
      updateData: (partial) =>
        set((state) => ({ data: { ...state.data, ...partial } })),

      /** מאפס את כל המצב לברירות המחדל */
      reset: () => set({ step: 1, data: INITIAL_DATA }),
    }),
    { name: 'mystiqor-onboarding' }
  )
);
