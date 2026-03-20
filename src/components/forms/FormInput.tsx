/**
 * שדה קלט לטפסים עם React Hook Form + Zod
 * תומך ב-RTL, הודעות שגיאה בעברית, ונגישות
 */
'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

/** Props של שדה קלט */
export interface FormInputProps<T extends FieldValues> {
  /** שם השדה — חייב להתאים לסכמת Zod */
  name: Path<T>;
  /** תווית בעברית */
  label: string;
  /** React Hook Form control */
  control: Control<T>;
  /** טקסט placeholder בעברית */
  placeholder?: string;
  /** סוג שדה */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time';
  /** האם השדה מושבת */
  disabled?: boolean;
  /** CSS נוסף */
  className?: string;
}

/**
 * שדה קלט אוניברסלי לטפסים — RTL, validation, error display
 */
export function FormInput<T extends FieldValues>({
  name,
  label,
  control,
  placeholder,
  type = 'text',
  disabled = false,
  className,
}: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn('space-y-2', className)}>
          <Label htmlFor={name} className="text-start block text-sm font-medium">
            {label}
          </Label>
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            dir="rtl"
            className={cn(
              fieldState.error && 'border-destructive focus-visible:ring-destructive'
            )}
            value={field.value ?? ''}
          />
          {fieldState.error && (
            <p className="text-sm text-destructive text-start mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
