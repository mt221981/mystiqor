'use client';

/**
 * אשף הכניסה — 4 שלבים: פרטים אישיים, מיקום לידה, הבנת ניתוחים (Barnum), העדפות
 * מנהל state דרך useOnboardingStore; בשלב הסיום עושה upsert לטבלת profiles.
 * GEM 13: BarnumEthicsStep מונע המשך עד שינת שני checkboxes
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';

import { useOnboardingStore } from '@/stores/onboarding';
import { createClient } from '@/lib/supabase/client';
import { animations } from '@/lib/animations/presets';
import { GOAL_CATEGORIES } from '@/lib/constants/categories';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

// ===== קבועים =====

/** תוויות שלבי האשף */
const STEP_LABELS = ['פרטים אישיים', 'מיקום לידה', 'הבנת הניתוחים', 'העדפות'];

/** תחומי עניין */
const DISCIPLINES = [
  'נומרולוגיה',
  'אסטרולוגיה',
  'גרפולוגיה',
  'ניתוח ציורים',
  'כירומנטיה',
  'טארוט',
];

/** תחומי מיקוד */
const FOCUS_AREAS = Object.values(GOAL_CATEGORIES).map((cat) => cat.label);

// ===== ממשקי Props =====

/** Props של שלב פרטים אישיים */
interface PersonalInfoStepProps {
  onNext: () => void;
}

/** Props של שלב מיקום לידה */
interface LocationStepProps {
  onNext: () => void;
  onBack: () => void;
}

/** Props של שלב Barnum Ethics */
export interface BarnumEthicsStepProps {
  onNext: () => void;
  onUpdate: (data: { acceptedBarnum: boolean; acceptedTerms: boolean }) => void;
}

/** Props של שלב העדפות */
interface PreferencesStepProps {
  onComplete: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

// ===== שלב 1: פרטים אישיים =====

/**
 * שלב 1 — פרטים אישיים: שם, תאריך לידה, שעת לידה, מגדר
 * מבצע ולידציה לפני מעבר לשלב הבא
 */
export function PersonalInfoStep({ onNext }: PersonalInfoStepProps) {
  const { data, updateData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** ולידציה של שדות חובה לפני מעבר לשלב הבא */
  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!data.fullName.trim()) newErrors.fullName = 'שם מלא הוא שדה חובה';
    if (!data.birthDate) newErrors.birthDate = 'תאריך לידה הוא שדה חובה';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="space-y-1">
        <Label htmlFor="fullName" className="text-sm font-medium">
          שם מלא <span className="text-destructive">*</span>
        </Label>
        <input
          id="fullName"
          type="text"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          placeholder="הכנס שם מלא"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          dir="rtl"
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="birthDate" className="text-sm font-medium">
          תאריך לידה <span className="text-destructive">*</span>
        </Label>
        <input
          id="birthDate"
          type="date"
          value={data.birthDate}
          onChange={(e) => updateData({ birthDate: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.birthDate && (
          <p className="text-xs text-destructive">{errors.birthDate}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="birthTime" className="text-sm font-medium">
          שעת לידה <span className="text-muted-foreground text-xs">(אופציונלי)</span>
        </Label>
        <input
          id="birthTime"
          type="time"
          value={data.birthTime}
          onChange={(e) => updateData({ birthTime: e.target.value })}
          placeholder="לדוגמה: 14:30"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">מגדר</Label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'male', label: 'זכר' },
              { value: 'female', label: 'נקבה' },
              { value: 'other', label: 'אחר' },
              { value: 'prefer_not_to_say', label: 'מעדיף לא לציין' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateData({ gender: option.value })}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                data.gender === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleNext} className="w-full mt-2">
        המשך
      </Button>
    </div>
  );
}

// ===== שלב 2: מיקום לידה =====

/**
 * שלב 2 — מיקום לידה: חיפוש עיר עם geocoding
 * שדה birthPlace הוא חובה לפני מעבר לשלב הבא
 */
export function LocationStep({ onNext, onBack }: LocationStepProps) {
  const { data, updateData } = useOnboardingStore();
  const [error, setError] = useState('');
  const [results, setResults] = useState<Array<{ display_name: string; lat: number; lon: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  /** חיפוש מיקום ב-API Nominatim */
  const handleSearch = async (query: string) => {
    updateData({ birthPlace: query, latitude: null, longitude: null });
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const json = (await res.json()) as { results?: Array<{ display_name: string; lat: number; lon: number }> };
      setResults(json.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /** בחירת תוצאת geocoding */
  const handleSelect = (result: { display_name: string; lat: number; lon: number }) => {
    updateData({ birthPlace: result.display_name, latitude: result.lat, longitude: result.lon });
    setResults([]);
    setError('');
  };

  /** ולידציה לפני מעבר */
  const handleNext = () => {
    if (!data.birthPlace.trim()) {
      setError('מקום לידה הוא שדה חובה');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="space-y-2 relative">
        <Label htmlFor="birthPlace" className="text-sm font-medium">
          מקום לידה <span className="text-destructive">*</span>
        </Label>
        <input
          id="birthPlace"
          type="text"
          value={data.birthPlace}
          onChange={(e) => { void handleSearch(e.target.value); }}
          placeholder="הקלד שם עיר..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          dir="rtl"
        />
        {isSearching && (
          <div className="absolute end-3 top-9">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {results.map((result, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-start px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => handleSelect(result)}
                dir="rtl"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
        {data.latitude && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            מיקום נבחר בהצלחה
          </p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          חזור
        </Button>
        <Button onClick={handleNext} className="flex-1">
          המשך
        </Button>
      </div>
    </div>
  );
}

// ===== שלב 3: Barnum Ethics — GEM 13 =====

/**
 * שלב 3 — הבנת הניתוחים (Barnum Ethics)
 * GEM 13: מונע המשך עד שני checkboxes מסומנים
 * מקור לוגי: GEM 13 מ-02b_GEMS.md
 */
export function BarnumEthicsStep({ onNext, onUpdate }: BarnumEthicsStepProps) {
  const [acceptedBarnum, setAcceptedBarnum] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const bothChecked = acceptedBarnum && acceptedTerms;

  /** עדכון ה-checkbox הראשון ועדכון ה-parent */
  const handleBarnumChange = (checked: boolean) => {
    setAcceptedBarnum(checked);
    onUpdate({ acceptedBarnum: checked, acceptedTerms });
  };

  /** עדכון ה-checkbox השני ועדכון ה-parent */
  const handleTermsChange = (checked: boolean) => {
    setAcceptedTerms(checked);
    onUpdate({ acceptedBarnum, acceptedTerms: checked });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-xl font-bold text-foreground">הבנת הניתוחים</h2>

      <div className="space-y-3 rounded-xl border border-border bg-card/50 p-5">
        <p className="text-sm text-foreground leading-relaxed">
          ניתוחים מבוססים על 2-3+ נקודות מידע ספציפיות שלך
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          פוטנציאלים — לא גורל. רצון חופשי וסביבה משחקים תפקיד מרכזי
        </p>
        <p className="text-sm text-foreground leading-relaxed">
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
          <Label
            htmlFor="barnum-checkbox"
            className="text-sm leading-relaxed cursor-pointer"
          >
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
          <Label
            htmlFor="terms-checkbox"
            className="text-sm leading-relaxed cursor-pointer"
          >
            מסכים/ה לתנאי השימוש
          </Label>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!bothChecked}
        className="w-full"
      >
        המשך
      </Button>
    </div>
  );
}

// ===== שלב 4: העדפות =====

/**
 * שלב 4 — העדפות: תחומי עניין + תחומי מיקוד + הגדרות AI
 */
export function PreferencesStep({ onComplete, onBack, isLoading }: PreferencesStepProps) {
  const { data, updateData } = useOnboardingStore();

  /** החלפת בחירה ברשימת תחומים */
  const toggleDiscipline = (discipline: string) => {
    const updated = data.disciplines.includes(discipline)
      ? data.disciplines.filter((d) => d !== discipline)
      : [...data.disciplines, discipline];
    updateData({ disciplines: updated });
  };

  /** החלפת בחירה ברשימת תחומי מיקוד */
  const toggleFocusArea = (area: string) => {
    const updated = data.focusAreas.includes(area)
      ? data.focusAreas.filter((a) => a !== area)
      : [...data.focusAreas, area];
    updateData({ focusAreas: updated });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">תחומי עניין</Label>
        <div className="flex flex-wrap gap-2">
          {DISCIPLINES.map((discipline) => (
            <button
              key={discipline}
              type="button"
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

      <div className="space-y-3">
        <Label className="text-sm font-semibold">תחומי מיקוד</Label>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((area) => (
            <button
              key={area}
              type="button"
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

      <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-4">
        <div>
          <p className="text-sm font-medium">הצעות AI</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            קבל תובנות ומומלצות מותאמות אישית
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={data.aiSuggestionsEnabled}
          onClick={() => updateData({ aiSuggestionsEnabled: !data.aiSuggestionsEnabled })}
          className={cn(
            'relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            data.aiSuggestionsEnabled ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
              data.aiSuggestionsEnabled ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
          חזור
        </Button>
        <Button onClick={() => { void onComplete(); }} className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
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

// ===== מחוון שלבים =====

/** Props של מחוון שלבים */
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

/**
 * מחוון שלבים — מציג את השלב הנוכחי מתוך הסך הכולל
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
      <div className="flex gap-1.5">
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
 * אשף הכניסה הראשי — מנהל מעבר בין 4 שלבים ושמירת פרופיל
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
   * עדכון נתוני Barnum ו-store בו-זמנית
   */
  const handleBarnumUpdate = (barnumData: { acceptedBarnum: boolean; acceptedTerms: boolean }) => {
    updateData(barnumData);
  };

  /**
   * שמירת הפרופיל ב-Supabase ב-onboarding completion
   * upsert לטבלת profiles + redirect ל-/tools
   */
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('לא מחובר למערכת. נסה להתחבר מחדש');
        return;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: data.fullName,
        birth_date: data.birthDate,
        birth_time: data.birthTime || null,
        birth_place: data.birthPlace || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        gender: data.gender,
        disciplines: data.disciplines,
        focus_areas: data.focusAreas,
        ai_suggestions_enabled: data.aiSuggestionsEnabled,
        onboarding_completed: true,
      });

      if (error) throw error;

      toast.success('ברוך הבא! הפרופיל נשמר בהצלחה');
      reset();
      router.push('/tools');
    } catch {
      toast.error('שגיאה בשמירת הפרופיל. נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      {...animations.fadeIn}
      className="mx-auto max-w-md w-full"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <StepIndicator
          currentStep={step}
          totalSteps={4}
          labels={STEP_LABELS}
        />

        {step === 1 && <PersonalInfoStep onNext={goNext} />}
        {step === 2 && <LocationStep onNext={goNext} onBack={goBack} />}
        {step === 3 && (
          <BarnumEthicsStep onNext={goNext} onUpdate={handleBarnumUpdate} />
        )}
        {step === 4 && (
          <PreferencesStep
            onComplete={handleComplete}
            onBack={goBack}
            isLoading={isLoading}
          />
        )}
      </div>
    </motion.div>
  );
}
