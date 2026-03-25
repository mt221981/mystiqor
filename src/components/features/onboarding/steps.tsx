'use client';

/**
 * שלבי אשף ההכנסה 1-2: PersonalInfoStep, LocationStep
 * קבועים DISCIPLINES ו-FOCUS_AREAS מיוצאים לשימוש ב-PreferencesStep.tsx
 * BarnumEthicsStep נמצא ב-BarnumEthicsStep.tsx
 * PreferencesStep נמצא ב-PreferencesStep.tsx
 */

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

import { useOnboardingStore } from '@/stores/onboarding';
import { GOAL_CATEGORIES } from '@/lib/constants/categories';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

// ===== קבועים =====

/** תחומי עניין זמינים */
export const DISCIPLINES = [
  'נומרולוגיה', 'אסטרולוגיה', 'גרפולוגיה',
  'ניתוח ציורים', 'קריאה בכף יד', 'טארוט',
];

/** תחומי מיקוד — מיוצאים מ-GOAL_CATEGORIES */
export const FOCUS_AREAS = Object.values(GOAL_CATEGORIES).map((cat) => cat.label);

// ===== ממשקי Props =====

/** Props של שלב פרטים אישיים */
export interface PersonalInfoStepProps {
  onNext: () => void;
}

/** Props של שלב מיקום לידה */
export interface LocationStepProps {
  onNext: () => void;
  onBack: () => void;
}

/** Props של שלב Barnum Ethics (re-exported from BarnumEthicsStep.tsx) */
export type { BarnumEthicsStepProps } from './BarnumEthicsStep';

// ===== שלב 1: פרטים אישיים =====

/**
 * שלב 1 — פרטים אישיים: שם, תאריך לידה, שעת לידה, מגדר
 * ולידציה: שם מלא ותאריך לידה חובה לפני מעבר לשלב הבא
 */
export function PersonalInfoStep({ onNext }: PersonalInfoStepProps) {
  const { data, updateData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!data.fullName.trim()) newErrors.fullName = 'שם מלא הוא שדה חובה';
    if (!data.birthDate) newErrors.birthDate = 'תאריך לידה הוא שדה חובה';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="space-y-1">
        <Label htmlFor="fullName" className="text-on-surface-variant font-label text-sm font-medium">
          שם מלא <span className="text-error">*</span>
        </Label>
        <input
          id="fullName"
          type="text"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          placeholder="הכנס שם מלא"
          aria-label="שם מלא"
          className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-1 focus:ring-primary/40 text-sm"
          dir="rtl"
        />
        {errors.fullName && <p className="text-xs text-error">{errors.fullName}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="birthDate" className="text-on-surface-variant font-label text-sm font-medium">
          תאריך לידה <span className="text-error">*</span>
        </Label>
        <input
          id="birthDate"
          type="date"
          value={data.birthDate}
          onChange={(e) => updateData({ birthDate: e.target.value })}
          aria-label="תאריך לידה"
          className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 text-sm"
        />
        {errors.birthDate && <p className="text-xs text-error">{errors.birthDate}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="birthTime" className="text-on-surface-variant font-label text-sm font-medium">
          שעת לידה <span className="text-on-surface-variant text-xs font-label">(אופציונלי)</span>
        </Label>
        <input
          id="birthTime"
          type="time"
          value={data.birthTime}
          onChange={(e) => updateData({ birthTime: e.target.value })}
          aria-label="שעת לידה"
          className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-on-surface-variant font-label text-sm font-medium">מגדר</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="בחר מגדר">
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
              aria-pressed={data.gender === option.value}
              onClick={() => updateData({ gender: option.value })}
              className={cn(
                'rounded-full px-4 py-1.5 font-label text-sm transition-colors',
                data.gender === option.value
                  ? 'bg-primary-container/20 text-primary border border-primary/30'
                  : 'border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleNext} className="w-full mt-2 bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-3 rounded-xl">המשך</Button>
    </div>
  );
}

// ===== שלב 2: מיקום לידה =====

/** תוצאת geocoding */
interface GeoResult {
  display_name: string;
  lat: number;
  lon: number;
}

/**
 * שלב 2 — מיקום לידה: חיפוש עיר עם geocoding ב-Nominatim דרך /api/geocode
 */
export function LocationStep({ onNext, onBack }: LocationStepProps) {
  const { data, updateData } = useOnboardingStore();
  const [error, setError] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    updateData({ birthPlace: query, latitude: null, longitude: null });
    if (query.length < 2) { setResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const json = (await res.json()) as { results?: GeoResult[] };
      setResults(json.results ?? []);
    } catch { setResults([]); }
    finally { setIsSearching(false); }
  };

  const handleSelect = (result: GeoResult) => {
    updateData({ birthPlace: result.display_name, latitude: result.lat, longitude: result.lon });
    setResults([]);
    setError('');
  };

  const handleNext = () => {
    if (!data.birthPlace.trim()) { setError('מקום לידה הוא שדה חובה'); return; }
    setError('');
    onNext();
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="relative space-y-2">
        <Label htmlFor="birthPlace" className="text-on-surface-variant font-label text-sm font-medium">
          מקום לידה <span className="text-error">*</span>
        </Label>
        <div className="relative">
          <input
            id="birthPlace"
            type="text"
            value={data.birthPlace}
            onChange={(e) => { void handleSearch(e.target.value); }}
            placeholder="הקלד שם עיר..."
            aria-label="מקום לידה"
            aria-autocomplete="list"
            aria-expanded={results.length > 0}
            className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-1 focus:ring-primary/40 text-sm"
            dir="rtl"
          />
          {isSearching && (
            <div className="absolute inset-y-0 end-3 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" aria-hidden="true" />
            </div>
          )}
        </div>
        {results.length > 0 && (
          <ul role="listbox" aria-label="תוצאות חיפוש" className="absolute z-50 w-full mt-1 bg-surface-container border border-outline-variant/20 rounded-lg shadow-lg max-h-60 overflow-auto">
            {results.map((result, i) => (
              <li key={i} role="option" aria-selected={false}>
                <button type="button" className="w-full text-start px-4 py-3 font-label text-sm text-on-surface hover:bg-surface-container-high transition-colors" onClick={() => handleSelect(result)} dir="rtl">
                  {result.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {data.latitude && (
          <p className="text-xs text-tertiary font-label flex items-center gap-1">
            <Check className="h-3 w-3 text-tertiary" aria-hidden="true" />
            מיקום נבחר בהצלחה
          </p>
        )}
        {error && <p className="text-xs text-error font-label" role="alert">{error}</p>}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 border border-outline-variant/20 hover:bg-surface-container text-on-surface-variant font-headline rounded-lg py-2 px-4">חזור</Button>
        <Button onClick={handleNext} className="flex-1 bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold rounded-xl">המשך</Button>
      </div>
    </div>
  );
}
