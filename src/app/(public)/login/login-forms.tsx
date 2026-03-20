/**
 * טפסי התחברות והרשמה — קומפוננטות טופס נפרדות
 * כל טופס משתמש ב-React Hook Form עם Zod ו-Supabase Auth
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, Loader2, Wand2 } from 'lucide-react';

import {
  loginSchema,
  registerSchema,
} from '@/lib/validations/auth';

import type { LoginFormData, RegisterFormData } from '@/lib/validations/auth';

// ===== ממשקים =====

/** פרופס של טופס התחברות */
interface LoginFormProps {
  readonly onSubmit: (data: LoginFormData) => Promise<void>;
  readonly isSubmitting: boolean;
  readonly showPassword: boolean;
  readonly onTogglePassword: () => void;
}

/** פרופס של טופס הרשמה */
interface RegisterFormProps {
  readonly onSubmit: (data: RegisterFormData) => Promise<void>;
  readonly isSubmitting: boolean;
  readonly showPassword: boolean;
  readonly onTogglePassword: () => void;
}

/** פרופס של טופס magic link */
interface MagicLinkFormProps {
  readonly onSubmit: (data: LoginFormData) => Promise<void>;
  readonly isSubmitting: boolean;
}

// ===== שדה input משותף =====

/** פרופס של שדה קלט */
interface InputFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly placeholder: string;
  readonly autoComplete: string;
  readonly icon: typeof Mail;
  readonly error?: string;
  readonly registration: Record<string, unknown>;
  readonly showPasswordToggle?: boolean;
  readonly showPassword?: boolean;
  readonly onTogglePassword?: () => void;
}

/** שדה קלט עם אייקון, label ושגיאה */
function InputField({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  icon: Icon,
  error,
  registration,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-lg border border-input bg-background py-2.5 pe-3 ps-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          style={showPasswordToggle ? { paddingInlineEnd: '2.5rem' } : undefined}
          {...registration}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ===== טופס התחברות =====

/** טופס התחברות עם אימייל וסיסמה */
export function LoginForm({
  onSubmit,
  isSubmitting,
  showPassword,
  onTogglePassword,
}: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <InputField
        id="login-email"
        label="אימייל"
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        icon={Mail}
        error={form.formState.errors.email?.message}
        registration={form.register('email')}
      />

      <InputField
        id="login-password"
        label="סיסמה"
        type={showPassword ? 'text' : 'password'}
        placeholder="הזן סיסמה"
        autoComplete="current-password"
        icon={Lock}
        error={form.formState.errors.password?.message}
        registration={form.register('password')}
        showPasswordToggle
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        התחבר
      </button>
    </form>
  );
}

// ===== טופס הרשמה =====

/** טופס הרשמה עם אימייל, סיסמה ואימות סיסמה */
export function RegisterForm({
  onSubmit,
  isSubmitting,
  showPassword,
  onTogglePassword,
}: RegisterFormProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <InputField
        id="register-email"
        label="אימייל"
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        icon={Mail}
        error={form.formState.errors.email?.message}
        registration={form.register('email')}
      />

      <InputField
        id="register-password"
        label="סיסמה"
        type={showPassword ? 'text' : 'password'}
        placeholder="לפחות 8 תווים, אות גדולה ומספר"
        autoComplete="new-password"
        icon={Lock}
        error={form.formState.errors.password?.message}
        registration={form.register('password')}
        showPasswordToggle
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />

      <InputField
        id="register-confirm"
        label="אימות סיסמה"
        type={showPassword ? 'text' : 'password'}
        placeholder="הזן סיסמה שוב"
        autoComplete="new-password"
        icon={Lock}
        error={form.formState.errors.confirmPassword?.message}
        registration={form.register('confirmPassword')}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        צור חשבון
      </button>
    </form>
  );
}

// ===== טופס Magic Link =====

/** טופס שליחת קישור קסם לאימייל */
export function MagicLinkForm({ onSubmit, isSubmitting }: MagicLinkFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: 'placeholder-not-used' },
  });

  /** מטפל בשליחה — מעביר רק את האימייל */
  const handleSubmit = (data: LoginFormData) => onSubmit(data);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground">
        הזן את כתובת האימייל שלך ונשלח לך קישור התחברות ישיר.
      </p>

      <InputField
        id="magic-email"
        label="אימייל"
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        icon={Mail}
        error={form.formState.errors.email?.message}
        registration={form.register('email')}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        שלח קישור קסם
      </button>
    </form>
  );
}
