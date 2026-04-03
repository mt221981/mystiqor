'use client';

/**
 * שלב 3 של אשף ההכנסה — הבנת הניתוחים (Barnum Ethics) — GEM 13
 * שני checkboxes חייבים להיות מסומנים; כפתור "המשך" מושבת עד אז.
 * מופרד לקובץ נפרד לשמירה על מגבלת 300 שורות.
 */

import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboarding';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface BarnumEthicsStepProps {
  onNext: () => void;
  onUpdate: (data: { acceptedBarnum: boolean; acceptedTerms: boolean }) => void;
}

/**
 * שלב הבנת הניתוחים — GEM 13
 * מיישם את העיקרון האנטי-Barnum: ניתוחים הם פוטנציאלים, לא גורל
 */
export function BarnumEthicsStep({ onNext, onUpdate }: BarnumEthicsStepProps) {
  const [acceptedBarnum, setAcceptedBarnum] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const bothChecked = acceptedBarnum && acceptedTerms;

  const handleBarnumChange = (checked: boolean) => {
    setAcceptedBarnum(checked);
    onUpdate({ acceptedBarnum: checked, acceptedTerms });
  };

  const handleTermsChange = (checked: boolean) => {
    setAcceptedTerms(checked);
    onUpdate({ acceptedBarnum, acceptedTerms: checked });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-xl font-bold text-foreground">הבנת הניתוחים</h2>

      <div className="space-y-3 rounded-xl border border-border bg-card/50 p-5">
        <p className="text-sm text-foreground">
          ניתוחים מבוססים על 2-3+ נקודות מידע ספציפיות שלך
        </p>
        <p className="text-sm text-foreground">
          פוטנציאלים — לא גורל. רצון חופשי וסביבה משחקים תפקיד מרכזי
        </p>
        <p className="text-sm text-foreground">
          מקורות לטענות, סתירות מזוהות, גיבוי מדעי
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="barnum-checkbox"
            checked={acceptedBarnum}
            onCheckedChange={(checked) => handleBarnumChange(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="barnum-checkbox" className="text-sm cursor-pointer">
            מבין/ה שהניתוחים מצביעים על פוטנציאלים, לא גורל
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="terms-checkbox"
            checked={acceptedTerms}
            onCheckedChange={(checked) => handleTermsChange(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="terms-checkbox" className="text-sm cursor-pointer">
            מסכים/ה לתנאי השימוש
          </Label>
        </div>
      </div>

      <Button onClick={onNext} disabled={!bothChecked} className="w-full">
        המשך
      </Button>
    </div>
  );
}
