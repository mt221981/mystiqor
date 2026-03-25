/**
 * טופס עריכת פרופיל משתמש — PROF-01
 * React Hook Form + Zod עם pre-fill מהפרופיל הקיים
 * שדות: שם, תאריך לידה, שעת לידה, מקום, מגדר, דיסציפלינות, תחומים, מטרות
 */
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile';

/** סכמת אימות חלקית לטופס עריכת פרופיל */
const profileEditSchema = profileSchema.partial();

/** טיפוס נתוני טופס עריכה */
type ProfileEditFormData = z.infer<typeof profileEditSchema>;

// ===== קבועים =====

/** תוויות מגדר בעברית */
const GENDER_LABELS: Record<string, string> = {
  male: 'זכר',
  female: 'נקבה',
  other: 'אחר',
  prefer_not_to_say: 'מעדיף לא לציין',
};

/** דיסציפלינות זמינות */
const DISCIPLINES_OPTIONS = [
  'אסטרולוגיה',
  'נומרולוגיה',
  'טארוט',
  'עיצוב אנושי',
  'גרפולוגיה',
  'ניתוח ציורים',
];

/** תחומי עניין */
const FOCUS_AREAS_OPTIONS = [
  'קריירה',
  'מערכות יחסים',
  'בריאות',
  'פיתוח אישי',
  'רוחניות',
  'כספים',
];

// ===== טיפוסים =====

/** נתוני פרופיל לפרה-פיל (מ-DB — שדות nullable) */
interface ProfileData {
  id: string;
  full_name: string;
  birth_date: string;
  birth_time?: string | null;
  birth_place?: string | null;
  gender?: string | null;
  disciplines?: string[] | null;
  focus_areas?: string[] | null;
  personal_goals?: string[] | null;
}

/** מאפייני טופס עריכת פרופיל */
interface ProfileEditFormProps {
  /** פרופיל נוכחי לפרה-פיל */
  readonly profile: ProfileData;
  /** callback לשמירה */
  readonly onSubmit: (data: ProfileEditFormData) => void;
  /** מצב טעינה */
  readonly isLoading?: boolean;
}

// ===== קומפוננטה ראשית =====

/**
 * טופס עריכת פרופיל — RHF + Zod עם validation בעברית
 * מאפשר עדכון חלקי (partial) — לא כל השדות חובה
 */
export function ProfileEditForm({
  profile,
  onSubmit,
  isLoading = false,
}: ProfileEditFormProps) {
  const [disciplineInput, setDisciplineInput] = useState('');
  const [focusInput, setFocusInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      full_name: profile.full_name ?? '',
      birth_date: profile.birth_date ?? '',
      birth_time: profile.birth_time ?? '',
      birth_place: profile.birth_place ?? '',
      gender: profile.gender as ProfileFormData['gender'],
      disciplines: profile.disciplines ?? [],
      focus_areas: profile.focus_areas ?? [],
      personal_goals: profile.personal_goals ?? [],
    },
  });

  const disciplines: string[] = (watch('disciplines') ?? []) as string[];
  const focusAreas: string[] = (watch('focus_areas') ?? []) as string[];
  const personalGoals: string[] = (watch('personal_goals') ?? []) as string[];

  /** הוספת ערך לרשימת תגיות */
  const addTag = (
    field: 'disciplines' | 'focus_areas' | 'personal_goals',
    value: string,
    currentValues: string[],
    setInput: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (trimmed && !currentValues.includes(trimmed)) {
      setValue(field, [...currentValues, trimmed]);
    }
    setInput('');
  };

  /** הסרת ערך מרשימת תגיות */
  const removeTag = (
    field: 'disciplines' | 'focus_areas' | 'personal_goals',
    value: string,
    currentValues: string[]
  ) => {
    setValue(
      field,
      currentValues.filter((v) => v !== value)
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-surface-container/60 backdrop-blur-xl rounded-xl p-6 border border-outline-variant/10"
      dir="rtl"
    >
      {/* שם מלא */}
      <div className="space-y-1.5">
        <Label htmlFor="full_name" className="font-label text-sm text-on-surface-variant font-medium">שם מלא</Label>
        <Input
          id="full_name"
          {...register('full_name')}
          placeholder="הכנס שם מלא"
          aria-invalid={!!errors.full_name}
          className="bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40"
        />
        {errors.full_name && (
          <p className="text-sm text-red-400" role="alert">
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* תאריך לידה */}
      <div className="space-y-1.5">
        <Label htmlFor="birth_date" className="font-label text-sm text-on-surface-variant font-medium">תאריך לידה</Label>
        <Input
          id="birth_date"
          type="date"
          {...register('birth_date')}
          aria-invalid={!!errors.birth_date}
          className="bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary/40"
        />
        {errors.birth_date && (
          <p className="text-sm text-red-400" role="alert">
            {errors.birth_date.message}
          </p>
        )}
      </div>

      {/* שעת לידה */}
      <div className="space-y-1.5">
        <Label htmlFor="birth_time" className="font-label text-sm text-on-surface-variant font-medium">שעת לידה (אופציונלי)</Label>
        <Input
          id="birth_time"
          type="time"
          {...register('birth_time')}
          placeholder="לדוגמה: 14:30"
          aria-invalid={!!errors.birth_time}
          className="bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40"
        />
        {errors.birth_time && (
          <p className="text-sm text-red-400" role="alert">
            {errors.birth_time.message}
          </p>
        )}
      </div>

      {/* מקום לידה */}
      <div className="space-y-1.5">
        <Label htmlFor="birth_place" className="font-label text-sm text-on-surface-variant font-medium">מקום לידה (אופציונלי)</Label>
        <Input
          id="birth_place"
          {...register('birth_place')}
          placeholder="עיר, מדינה"
          aria-invalid={!!errors.birth_place}
          className="bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40"
        />
        {errors.birth_place && (
          <p className="text-sm text-red-400" role="alert">
            {errors.birth_place.message}
          </p>
        )}
      </div>

      {/* מגדר */}
      <div className="space-y-1.5">
        <Label className="font-label text-sm text-on-surface-variant font-medium">מגדר (אופציונלי)</Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ''}
              onValueChange={(val) =>
                field.onChange(val || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר מגדר" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GENDER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* דיסציפלינות */}
      <div className="space-y-1.5">
        <Label className="font-label text-sm text-on-surface-variant font-medium">דיסציפלינות מועדפות</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {disciplines.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded-full bg-primary-container/20 px-3 py-1 text-sm text-primary border border-primary/30"
            >
              {d}
              <button
                type="button"
                onClick={() => removeTag('disciplines', d, disciplines)}
                className="text-primary/60 hover:text-primary"
                aria-label={`הסר ${d}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Select
            value=""
            onValueChange={(val) =>
              val && addTag('disciplines', val, disciplines, setDisciplineInput)
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="הוסף דיסציפלינה" />
            </SelectTrigger>
            <SelectContent>
              {DISCIPLINES_OPTIONS.filter((d) => !disciplines.includes(d)).map(
                (d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Input
            value={disciplineInput}
            onChange={(e) => setDisciplineInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag('disciplines', disciplineInput, disciplines, setDisciplineInput);
              }
            }}
            placeholder="או הכנס ידנית"
            className="flex-1"
          />
        </div>
      </div>

      {/* תחומי עניין */}
      <div className="space-y-1.5">
        <Label className="font-label text-sm text-on-surface-variant font-medium">תחומי עניין</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {focusAreas.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-full bg-secondary-container/20 px-3 py-1 text-sm text-secondary border border-secondary/30"
            >
              {f}
              <button
                type="button"
                onClick={() => removeTag('focus_areas', f, focusAreas)}
                className="text-secondary/60 hover:text-secondary"
                aria-label={`הסר ${f}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Select
            value=""
            onValueChange={(val) =>
              val && addTag('focus_areas', val, focusAreas, setFocusInput)
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="הוסף תחום" />
            </SelectTrigger>
            <SelectContent>
              {FOCUS_AREAS_OPTIONS.filter((f) => !focusAreas.includes(f)).map(
                (f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Input
            value={focusInput}
            onChange={(e) => setFocusInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag('focus_areas', focusInput, focusAreas, setFocusInput);
              }
            }}
            placeholder="או הכנס ידנית"
            className="flex-1"
          />
        </div>
      </div>

      {/* יעדים אישיים */}
      <div className="space-y-1.5">
        <Label className="font-label text-sm text-on-surface-variant font-medium">יעדים אישיים</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {personalGoals.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-3 py-1 text-sm text-tertiary border border-tertiary/30"
            >
              {g}
              <button
                type="button"
                onClick={() => removeTag('personal_goals', g, personalGoals)}
                className="text-tertiary/60 hover:text-tertiary"
                aria-label={`הסר ${g}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag('personal_goals', goalInput, personalGoals, setGoalInput);
              }
            }}
            placeholder="הכנס יעד אישי ולחץ Enter"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              addTag('personal_goals', goalInput, personalGoals, setGoalInput)
            }
          >
            הוסף
          </Button>
        </div>
      </div>

      {/* כפתור שמירה */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-3 rounded-xl hover:opacity-90 active:scale-95 shadow-[0_10px_30px_rgba(143,45,230,0.3)]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            שומר...
          </span>
        ) : (
          'שמור שינויים'
        )}
      </Button>
    </form>
  );
}
