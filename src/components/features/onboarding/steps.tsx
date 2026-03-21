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
  'ניתוח ציורים', 'כירומנטיה', 'טארוט',
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
        <Label htmlFor="fullName" className="text-sm font-medium">
          שם מלא <span className="text-destructive">*</span>
        </Label>
        <input
          id="fullName"
          type="text"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          placeholder="הכנס שם מלא"
          aria-label="שם מלא"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          dir="rtl"
        />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
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
          aria-label="תאריך לידה"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
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
          aria-label="שעת לידה"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">מגדר</Label>
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

      <Button onClick={handleNext} className="w-full mt-2">המשך</Button>
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
        <Label htmlFor="birthPlace" className="text-sm font-medium">
          מקום לידה <span className="text-destructive">*</span>
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            dir="rtl"
          />
          {isSearching && (
            <div className="absolute inset-y-0 end-3 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>
        {results.length > 0 && (
          <ul role="listbox" aria-label="תוצאות חיפוש" className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {results.map((result, i) => (
              <li key={i} role="option" aria-selected={false}>
                <button type="button" className="w-full text-start px-3 py-2 text-sm hover:bg-accent transition-colors" onClick={() => handleSelect(result)} dir="rtl">
                  {result.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {data.latitude && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" aria-hidden="true" />
            מיקום נבחר בהצלחה
          </p>
        )}
        {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">חזור</Button>
        <Button onClick={handleNext} className="flex-1">המשך</Button>
      </div>
    </div>
  );
}
