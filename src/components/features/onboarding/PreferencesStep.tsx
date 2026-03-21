'use client';

/**
 * שלב 4 של אשף ההכנסה — העדפות: תחומי עניין, תחומי מיקוד, הגדרות AI
 * נפרד ל-PreferencesStep.tsx כדי לשמור על מגבלת 300 שורות
 */

import { Loader2 } from 'lucide-react';

import { useOnboardingStore } from '@/stores/onboarding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';
import { DISCIPLINES, FOCUS_AREAS } from './steps';

/** Props של שלב העדפות */
export interface PreferencesStepProps {
  onComplete: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

/**
 * שלב 4 — העדפות: תחומי עניין, תחומי מיקוד, הגדרות AI
 * Multi-select tags + toggle לתכונות AI
 */
export function PreferencesStep({ onComplete, onBack, isLoading }: PreferencesStepProps) {
  const { data, updateData } = useOnboardingStore();

  /** החלפת בחירת תחום עניין */
  const toggleDiscipline = (discipline: string) => {
    const updated = data.disciplines.includes(discipline)
      ? data.disciplines.filter((d) => d !== discipline)
      : [...data.disciplines, discipline];
    updateData({ disciplines: updated });
  };

  /** החלפת בחירת תחום מיקוד */
  const toggleFocusArea = (area: string) => {
    const updated = data.focusAreas.includes(area)
      ? data.focusAreas.filter((a) => a !== area)
      : [...data.focusAreas, area];
    updateData({ focusAreas: updated });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* תחומי עניין */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">תחומי עניין</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="בחר תחומי עניין">
          {DISCIPLINES.map((discipline) => (
            <button
              key={discipline}
              type="button"
              aria-pressed={data.disciplines.includes(discipline)}
              onClick={() => toggleDiscipline(discipline)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors',
                data.disciplines.includes(discipline)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/50'
              )}
            >
              {discipline}
            </button>
          ))}
        </div>
      </div>

      {/* תחומי מיקוד */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">תחומי מיקוד</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="בחר תחומי מיקוד">
          {FOCUS_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              aria-pressed={data.focusAreas.includes(area)}
              onClick={() => toggleFocusArea(area)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors',
                data.focusAreas.includes(area)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/50'
              )}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* הגדרות AI */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-4">
        <div>
          <p id="ai-toggle-label" className="text-sm font-medium">הצעות AI</p>
          <p className="text-xs text-muted-foreground mt-0.5">קבל תובנות מותאמות אישית</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={data.aiSuggestionsEnabled ? 'true' : 'false'}
          aria-labelledby="ai-toggle-label"
          onClick={() => updateData({ aiSuggestionsEnabled: !data.aiSuggestionsEnabled })}
          className={cn(
            'relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            data.aiSuggestionsEnabled ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
              data.aiSuggestionsEnabled ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {/* כפתורי ניווט */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
          חזור
        </Button>
        <Button
          onClick={() => { void onComplete(); }}
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              שומר...
            </span>
          ) : (
            'סיים'
          )}
        </Button>
      </div>
    </div>
  );
}
