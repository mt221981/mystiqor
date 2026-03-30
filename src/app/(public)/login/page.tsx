/**
 * דף התחברות והרשמה — טופס משולב עם הזדהות בסיסמה ו-magic link
 * משתמש בקומפוננטות טופס נפרדות מ-login-forms.tsx
 * תומך ב-?next= query param לניתוב חזרה לדף המבוקש לאחר התחברות
 */

'use client';

import { Suspense, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Wand2, KeyRound } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { LoginForm, RegisterForm, MagicLinkForm, ForgotPasswordForm } from './login-forms';

import type { LoginFormData, RegisterFormData, ResetPasswordFormData } from '@/lib/validations/auth';

// ===== קבועים =====

/** מצבי הטופס האפשריים */
type FormMode = 'login' | 'register' | 'magic-link' | 'forgot-password';

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

// ===== קומפוננטה פנימית =====

/** תוכן דף ההתחברות — עטוף ב-Suspense כי משתמש ב-useSearchParams */
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('next') ?? '/dashboard';

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

  /** מטפל בהתחברות עם אימייל וסיסמה — מפנה ל-?next= לאחר הצלחה */
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
        router.push(redirectTo);
        router.refresh();
      } catch {
        setServerError('אירעה שגיאת תקשורת. נסה שוב מאוחר יותר');
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, redirectTo]
  );

  /** מטפל בהרשמה עם אימייל וסיסמה */
  const handleRegister = useCallback(
    async (data: RegisterFormData) => {
      setIsSubmitting(true);
      setServerError(null);
      try {
        const supabase = createClient();
        const { data: signUpData, error } = await supabase.auth.signUp({
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
        if (signUpData.session) {
          // אימות אימייל מבוטל — למשתמש יש סשן מיידי, מפנה ל-onboarding
          router.push('/onboarding');
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
    },
    [router]
  );

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

  /** מטפל באיפוס סיסמה */
  const handleForgotPassword = useCallback(async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/settings`,
      });
      if (error) {
        setServerError(translateAuthError(error.message));
        return;
      }
      setSuccessMessage(
        'נשלח קישור לאיפוס הסיסמה לאימייל שלך. בדוק את תיבת הדואר.'
      );
    } catch {
      setServerError('אירעה שגיאת תקשורת. נסה שוב מאוחר יותר');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /** מטפל בהתחברות עם Google */
  const handleGoogleLogin = useCallback(async () => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
        },
      });
      if (error) {
        setServerError(translateAuthError(error.message));
      }
    } catch {
      setServerError('אירעה שגיאת תקשורת. נסה שוב מאוחר יותר');
    } finally {
      setIsSubmitting(false);
    }
  }, [redirectTo]);

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
            {mode === 'register' && 'צור חשבון חדש והתחל את המסע'}
            {mode === 'forgot-password' && 'איפוס סיסמה'}
            {mode === 'magic-link' && 'התחבר עם קישור קסם'}
            {mode === 'login' && 'התחבר וגלה את עצמך'}
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
          {mode === 'forgot-password' && (
            <ForgotPasswordForm onSubmit={handleForgotPassword} isSubmitting={isSubmitting} />
          )}

          {/* כפתור Google */}
          {(mode === 'login' || mode === 'register') && (
            <div className="mt-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">או</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                התחבר עם Google
              </button>
            </div>
          )}

          {/* קישורי החלפת מצב */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col items-center gap-2 text-sm">
              {mode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot-password')}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary hover:underline"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    שכחתי סיסמה
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('magic-link')}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    התחבר עם קישור קסם
                  </button>
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
                </>
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
              {(mode === 'magic-link' || mode === 'forgot-password') && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary hover:underline"
                >
                  חזרה להתחברות עם סיסמה
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== ייצוא ראשי =====

/** דף התחברות והרשמה עם תמיכה ב-magic link */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
