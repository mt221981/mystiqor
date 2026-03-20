/**
 * טופס נתוני לידה — משולב React Hook Form + Zod
 * שדות: שם מלא, תאריך לידה, שעת לידה (אופציונלי), מקום לידה (עם geocoding)
 * משמש ב: onboarding, אסטרולוגיה, Solar Return, סינסטרי
 */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/forms/FormInput';
import { LocationSearch, type GeocodingResult } from '@/components/forms/LocationSearch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/** סכמת validation לטופס */
const BirthDataSchema = z.object({
  fullName: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  birthDate: z.string().min(1, 'תאריך לידה הוא שדה חובה'),
  birthTime: z.string().optional(),
  birthPlace: z.string().min(2, 'מקום לידה הוא שדה חובה'),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

/** טיפוס ערכי הטופס */
export type BirthDataFormValues = z.infer<typeof BirthDataSchema>;

/** Props של הטופס */
export interface BirthDataFormProps {
  /** callback לשליחת הטופס */
  onSubmit: (data: BirthDataFormValues) => void | Promise<void>;
  /** מצב טעינה */
  isLoading?: boolean;
  /** ערכים ראשוניים */
  defaultValues?: Partial<BirthDataFormValues>;
  /** טקסט כפתור שליחה */
  submitLabel?: string;
}

/**
 * טופס נתוני לידה מלא עם validation, geocoding, ו-RTL
 */
export function BirthDataForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitLabel = 'המשך',
}: BirthDataFormProps) {
  const { control, handleSubmit, setValue, watch } = useForm<BirthDataFormValues>({
    resolver: zodResolver(BirthDataSchema),
    defaultValues: {
      fullName: '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      latitude: null,
      longitude: null,
      ...defaultValues,
    },
  });

  const birthPlace = watch('birthPlace');

  /** טיפול בבחירת מיקום מה-geocoding */
  const handleLocationSelect = (result: GeocodingResult) => {
    setValue('birthPlace', result.display_name);
    setValue('latitude', result.lat);
    setValue('longitude', result.lon);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
      <FormInput
        name="fullName"
        label="שם מלא"
        control={control}
        placeholder="הכנס שם מלא"
      />

      <FormInput
        name="birthDate"
        label="תאריך לידה"
        control={control}
        type="date"
      />

      <FormInput
        name="birthTime"
        label="שעת לידה (אופציונלי)"
        control={control}
        type="time"
        placeholder="לדוגמה: 14:30"
      />

      <LocationSearch
        value={birthPlace}
        onChange={(val) => setValue('birthPlace', val)}
        onSelect={handleLocationSelect}
        label="מקום לידה"
        placeholder="הקלד שם עיר..."
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            מחשב...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
