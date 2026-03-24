'use client';

/**
 * טופס יצירה ועריכה של רשומת יומן
 * תומך במצב מלא (D-08) ומצב מהיר עם קישור למעקב מצב רוח (D-07)
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

import { JournalCreateSchema, type JournalCreate } from '@/lib/validations/journal';
import { MoodEmojiPicker } from '@/components/features/mood/MoodEmojiPicker';
import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';

// ===== טיפוסים פנימיים =====

/** טיפוס ערכי הטופס (input — לפני הפעלת defaults של Zod) */
type JournalFormValues = z.input<typeof JournalCreateSchema>;

/** נתוני יומן עם מזהה אופציונלי לעריכה */
interface JournalEntryData extends JournalCreate {
  readonly id?: string;
}

/** מאפייני טופס רשומת יומן */
interface JournalEntryFormProps {
  /** נתונים ראשוניים לעריכה (אופציונלי) */
  readonly initialData?: JournalEntryData;
  /** callback בשמירה */
  readonly onSubmit: (data: JournalCreate) => void;
  /** האם שולח */
  readonly isLoading?: boolean;
  /** מצב הטופס — מלא (ברירת מחדל) או מהיר */
  readonly mode?: 'full' | 'quick';
  /** callback לביטול */
  readonly onCancel?: () => void;
}

// ===== קבועים =====

/** מספר שדות הכרת תודה קבוע */
const GRATITUDE_COUNT = 3;

// ===== קומפוננטה ראשית =====

/**
 * טופס רשומת יומן — מלא (D-08) ומהיר
 * מצב מלא: כותרת, תוכן, מצב רוח, אנרגיה, הכרת תודה, קישור מטרות
 * מצב מהיר: תוכן ומצב רוח בלבד
 * D-07: pre-fill מצב רוח מ-URL params ?mood_score=X&mood=label
 */
export function JournalEntryForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = 'full',
  onCancel,
}: JournalEntryFormProps) {
  const searchParams = useSearchParams();

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JournalFormValues>({
    resolver: zodResolver(JournalCreateSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      mood: initialData?.mood ?? undefined,
      mood_score: initialData?.mood_score ?? undefined,
      energy_level: initialData?.energy_level ?? undefined,
      gratitude: initialData?.gratitude ?? Array(GRATITUDE_COUNT).fill(''),
      goals: initialData?.goals ?? [],
    },
  });

  // D-07: pre-fill מצב רוח מ-URL params
  useEffect(() => {
    const urlMoodScore = searchParams.get('mood_score');
    const urlMood = searchParams.get('mood');

    if (urlMoodScore && !initialData?.mood_score) {
      const score = parseInt(urlMoodScore, 10);
      if (!isNaN(score) && score >= 1 && score <= 10) {
        setValue('mood_score', score);
      }
    }

    if (urlMood && !initialData?.mood) {
      setValue('mood', urlMood);
    }
  }, [searchParams, setValue, initialData]);

  const moodScore = watch('mood_score');
  const gratitude = watch('gratitude');

  /** טיפול בבחירת מצב רוח */
  function handleMoodChange(score: number, label: string) {
    setValue('mood_score', score);
    setValue('mood', label);
  }

  /** עדכון שדה הכרת תודה */
  function handleGratitudeChange(index: number, value: string) {
    const updated = [...(gratitude ?? [])];
    updated[index] = value;
    setValue('gratitude', updated);
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data as JournalCreate))}
      className="space-y-5"
      dir="rtl"
      noValidate
    >
      {/* מצב מלא: כותרת */}
      {mode === 'full' && (
        <FormInput
          name="title"
          label="כותרת (אופציונלי)"
          control={control}
          placeholder="תנו כותרת לרשומה..."
        />
      )}

      {/* תוכן — חובה בשני המצבים */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium">
          {mode === 'quick' ? 'מה עובר עליך?' : 'תוכן הרשומה'}
          <span className="text-destructive mr-1">*</span>
        </Label>
        <Textarea
          id="content"
          {...register('content')}
          placeholder={mode === 'quick' ? 'כתוב שורה אחת...' : 'כתוב את מחשבותיך...'}
          rows={mode === 'quick' ? 2 : 5}
          dir="rtl"
          className={cn(
            'resize-none',
            errors.content && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      {/* בורר מצב רוח — בשני המצבים */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">מצב רוח (אופציונלי)</Label>
        <MoodEmojiPicker
          value={moodScore ?? null}
          onChange={handleMoodChange}
        />
      </div>

      {/* מצב מלא: שאר השדות */}
      {mode === 'full' && (
        <>
          {/* רמת אנרגיה */}
          <div className="space-y-3">
            <Controller
              name="energy_level"
              control={control}
              render={({ field }) => (
                <>
                  <Label className="text-sm font-medium">
                    רמת אנרגיה (אופציונלי)
                    {field.value !== undefined && (
                      <span className="mr-2 text-primary">{field.value}/10</span>
                    )}
                  </Label>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={field.value !== undefined ? [field.value] : [5]}
                    onValueChange={(val) => {
                      const num = Array.isArray(val) ? val[0] : val;
                      field.onChange(num);
                    }}
                    className="w-full"
                  />
                </>
              )}
            />
          </div>

          {/* הכרת תודה — 3 שדות (D-08) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">הכרת תודה (אופציונלי)</Label>
            <div className="space-y-2">
              {Array.from({ length: GRATITUDE_COUNT }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  value={gratitude?.[index] ?? ''}
                  onChange={(e) => handleGratitudeChange(index, e.target.value)}
                  placeholder={`דבר ${index + 1} שאני אסיר תודה עליו...`}
                  dir="rtl"
                  className={cn(
                    'flex h-9 w-full bg-surface-container-lowest border-none rounded-lg px-3 py-1',
                    'text-sm text-on-surface placeholder:text-outline/40 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40'
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* כפתורי פעולה */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            ביטול
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? 'שומר...' : initialData?.id ? 'עדכן רשומה' : 'שמור רשומה'}
        </Button>
      </div>
    </form>
  );
}
