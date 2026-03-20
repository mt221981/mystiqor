/**
 * דף התחברות והרשמה — טופס משולב עם הזדהות בסיסמה ו-magic link
 * משתמש בקומפוננטות טופס נפרדות מ-login-forms.tsx
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Wand2 } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { LoginForm, RegisterForm, MagicLinkForm } from './login-forms';

import type { LoginFormData, RegisterFormData } from '@/lib/validations/auth';

// ===== קבועים =====

/** מצבי הטופס האפשריים */
type FormMode = 'login' | 'register' | 'magic-link';

/** הודעות שגיאה מתורגמות מ-Supabase */
const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  'Invalid login credentials': 'כתובת אימייל או סיסמה שגויים',
  'Email not confirmed': 'כתובת האימייל טרם אומתה. בדוק את תיבת הדואר',
  'User already registered': 'כתובת אימייל זו כבר רשומה במערכת',
  'Signup requires a valid password': 'נא להזין סיסמה תקינה',
  'Email rate limit exceeded': 'נשלחו יותר מדי בקשות. נסה שוב מאוחר יותר',
};

/** מתרגם הודעת שגיאה מ-Supabase לעברית */
function translateAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? 'אירעה שגיאה. נסה שוב מאוחר יותר';
}

// ===== קומפוננטה =====

/** דף התחברות והרשמה עם תמיכה ב-magic link */
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** מאפס שגיאות והודעות בעת החלפת מצב */
  const switchMode = useCallback((newMode: FormMode) => {
    setMode(newMode);
    setServerError(null);
    setSuccessMessage(null);
    setShowPassword(false);
  }, []);

  /** מטפל בהתחברות עם אימייל וסיסמה */
  const handleLogin = useCallback(
    async (data: LoginFormData) => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) {
          setServerError(translateAuthError(error.message));
          return;
        }
        router.push('/dashboard');
        router.refresh();
      } catch {
        setServerError('אירעה שגיאת תקשורת. נסה שוב מאוחר יותר');
      } finally {
        setIsSubmitting(false);
      }
    },
    [router]
  );

  /** מטפל בהרשמה עם אימייל וסיסמה */
  const handleRegister = useCallback(async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        setServerError(translateAuthError(error.message));
        return;
      }
      setSuccessMessage(
        'נשלח אימייל אימות לכתובת שהזנת. בדוק את תיבת הדואר שלך.'
      );
    } catch {
      setServerError('אירעה שגיאת תקשורת. נסה שוב מאוחר יותר');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /** מטפל בשליחת magic link */
  const handleMagicLink = useCallback(async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        setServerError(translateAuthError(error.message));
        return;
      }
      setSuccessMessage(
        'נשלח קישור התחברות לאימייל שלך. בדוק את תיבת הדואר.'
      );
    } catch {
      setServerError('אירעה שגיאת תקשורת. נסה שוב מאוחר יותר');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* לוגו ושם המותג */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold text-foreground">MystiQor</span>
          </Link>
          <p className="mt-3 text-muted-foreground">
            {mode === 'register'
              ? 'צור חשבון חדש והתחל את המסע'
              : 'התחבר וגלה את עצמך'}
          </p>
        </div>

        {/* כרטיס טופס */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          {successMessage && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">
              {successMessage}
            </div>
          )}
          {serverError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          {/* טפסים לפי מצב */}
          {mode === 'login' && (
            <LoginForm
              onSubmit={handleLogin}
              isSubmitting={isSubmitting}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
            />
          )}
          {mode === 'register' && (
            <RegisterForm
              onSubmit={handleRegister}
              isSubmitting={isSubmitting}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
            />
          )}
          {mode === 'magic-link' && (
            <MagicLinkForm onSubmit={handleMagicLink} isSubmitting={isSubmitting} />
          )}

          {/* מפריד וקישורי החלפת מצב */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">או</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-sm">
              {mode !== 'magic-link' && (
                <button
                  type="button"
                  onClick={() => switchMode('magic-link')}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  התחבר עם קישור קסם
                </button>
              )}
              {mode === 'magic-link' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary hover:underline"
                >
                  התחבר עם סיסמה
                </button>
              )}
              {mode === 'login' && (
                <p className="text-muted-foreground">
                  אין לך חשבון?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-primary hover:underline"
                  >
                    הרשם עכשיו
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p className="text-muted-foreground">
                  יש לך חשבון?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-primary hover:underline"
                  >
                    התחבר
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
