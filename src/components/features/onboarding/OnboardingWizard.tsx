'use client';

/**
 * אשף הכניסה — 4 שלבים: פרטים אישיים, מיקום לידה, הבנת ניתוחים (Barnum), העדפות
 * מנהל state דרך useOnboardingStore; בשלב הסיום עושה upsert לטבלת profiles.
 * השלבים עצמם: steps.tsx (שלבים 1-3) + PreferencesStep.tsx (שלב 4)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { useOnboardingStore } from '@/stores/onboarding';
import { animations } from '@/lib/animations/presets';
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
 * מחוון שלבים — פס התקדמות ותווית שלב נוכחי
 */
function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="mb-8" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          שלב {currentStep} מתוך {totalSteps}
        </span>
        <span className="text-sm font-medium text-foreground">
          {labels[currentStep - 1]}
        </span>
      </div>
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-label="התקדמות אשף ההכנסה"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < currentStep ? 'bg-primary' : 'bg-border'
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
      router.push('/tools');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאה בשמירת הפרופיל. נסה שוב';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div {...animations.fadeIn} className="mx-auto max-w-md w-full">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
    </motion.div>
  );
}
