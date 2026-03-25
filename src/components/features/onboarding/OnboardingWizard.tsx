'use client';

/**
 * אשף הכניסה — 4 שלבים: פרטים אישיים, מיקום לידה, הבנת ניתוחים (Barnum), העדפות
 * מנהל state דרך useOnboardingStore; בשלב הסיום עושה upsert לטבלת profiles.
 * השלבים עצמם: steps.tsx (שלבים 1-3) + PreferencesStep.tsx (שלב 4)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useOnboardingStore } from '@/stores/onboarding';
import { cn } from '@/lib/utils/cn';

import { PersonalInfoStep, LocationStep } from './steps';
import { BarnumEthicsStep } from './BarnumEthicsStep';
import { PreferencesStep } from './PreferencesStep';

// Re-export BarnumEthicsStep as named export — required by tests
export { BarnumEthicsStep } from './BarnumEthicsStep';
export type { BarnumEthicsStepProps } from './BarnumEthicsStep';

// ===== קבועים =====

/** תוויות שלבי האשף */
const STEP_LABELS = ['פרטים אישיים', 'מיקום לידה', 'הבנת הניתוחים', 'העדפות'] as const;

// ===== מחוון שלבים =====

/** Props של מחוון שלבים */
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: readonly string[];
}

/**
 * מחוון שלבים — פס התקדמות ותווית שלב נוכחי עם MD3 tokens
 */
function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="mb-8" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <span className="font-label text-sm text-on-surface-variant">
          שלב {currentStep} מתוך {totalSteps}
        </span>
        <span className="font-headline text-sm font-medium text-on-surface">
          {labels[currentStep - 1]}
        </span>
      </div>
      {/* פס התקדמות */}
      <div
        className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden"
        role="progressbar"
        aria-label="התקדמות אשף ההכנסה"
        aria-valuetext={`שלב ${currentStep} מתוך ${totalSteps}`}
      >
        <div
          className={cn(
            'h-full bg-gradient-to-l from-primary-container to-secondary-container rounded-full transition-all duration-300',
            currentStep === 1 && 'w-1/4',
            currentStep === 2 && 'w-2/4',
            currentStep === 3 && 'w-3/4',
            currentStep === 4 && 'w-full',
          )}
        />
      </div>
      {/* נקודות שלבים */}
      <div className="flex gap-2 mt-3 justify-center">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-300',
              i < currentStep
                ? 'bg-primary w-3 h-3'
                : 'bg-surface-container-high w-2 h-2'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/**
 * אשף הכניסה הראשי — מנהל מעבר בין 4 שלבים ושמירת פרופיל ב-Supabase
 */
export function OnboardingWizard() {
  const router = useRouter();
  const { step, data, setStep, updateData, reset } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /** רה-הידרציה של Zustand persist מ-localStorage אחרי mount */
  useEffect(() => {
    useOnboardingStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  /** מציג שלד טעינה עד שהסטור מוכן */
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-md w-full">
        <div className="h-96 bg-surface-container/60 backdrop-blur-xl rounded-2xl animate-pulse" />
      </div>
    );
  }

  /** מעבר לשלב הבא */
  const goNext = () => {
    if (step < 4) setStep((step + 1) as 1 | 2 | 3 | 4);
  };

  /** חזרה לשלב הקודם */
  const goBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4);
  };

  /**
   * השלמת onboarding — קריאה ל-API route שמאמת עם Zod, שומר פרופיל ויוצר מנוי חינמי
   */
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.fullName,
          birth_date: data.birthDate,
          birth_time: data.birthTime || '',
          birth_place: data.birthPlace || '',
          latitude: data.latitude,
          longitude: data.longitude,
          gender: data.gender,
          disciplines: data.disciplines,
          focus_areas: data.focusAreas,
          ai_suggestions_enabled: data.aiSuggestionsEnabled,
          accepted_barnum: data.acceptedBarnum,
          accepted_terms: data.acceptedTerms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? 'שגיאה בשמירת הפרופיל');
      }

      toast.success('ברוך הבא! הפרופיל נשמר בהצלחה');
      reset();
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאה בשמירת הפרופיל. נסה שוב';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md w-full">
      <div className="bg-surface-container/60 backdrop-blur-xl rounded-2xl p-8 border border-outline-variant/10">
        <StepIndicator currentStep={step} totalSteps={4} labels={STEP_LABELS} />

        {step === 1 && (
          <PersonalInfoStep onNext={goNext} />
        )}
        {step === 2 && (
          <LocationStep onNext={goNext} onBack={goBack} />
        )}
        {step === 3 && (
          <BarnumEthicsStep
            onNext={goNext}
            onUpdate={(barnumData) => updateData(barnumData)}
          />
        )}
        {step === 4 && (
          <PreferencesStep onComplete={handleComplete} onBack={goBack} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
