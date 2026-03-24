'use client';

/**
 * דף הפניית חברים — /referrals
 * מציג את קוד ההפניה האישי עם אפשרות העתקה ושיתוף
 * יצירת קוד חדש אם אין קוד קיים
 */

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Share2, Gift, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/** מצב טעינת קוד הפניה */
type LoadState = 'loading' | 'loaded' | 'error';

/**
 * דף הפניית חברים — הצגת קוד הפניה עם העתקה ושיתוף
 */
export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** שליפת קוד הפניה קיים מ-API */
  const fetchReferralCode = useCallback(async () => {
    try {
      setLoadState('loading');
      const response = await fetch('/api/referrals');
      if (!response.ok) {
        throw new Error('שגיאה בשליפת קוד הפניה');
      }
      const data = (await response.json()) as { code: string | null };
      setReferralCode(data.code);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
      setErrorMessage('שגיאה בטעינת קוד ההפניה');
    }
  }, []);

  useEffect(() => {
    void fetchReferralCode();
  }, [fetchReferralCode]);

  /** יצירת קוד הפניה חדש */
  const handleGenerateCode = useCallback(async () => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);
      const response = await fetch('/api/referrals', { method: 'POST' });
      if (!response.ok) {
        throw new Error('שגיאה ביצירת קוד הפניה');
      }
      const data = (await response.json()) as { code: string };
      setReferralCode(data.code);
    } catch {
      setErrorMessage('שגיאה ביצירת קוד הפניה — נסה שנית');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /** העתקת קוד ההפניה ללוח */
  const handleCopyCode = useCallback(async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setErrorMessage('שגיאה בהעתקת הקוד');
    }
  }, [referralCode]);

  /** העתקת קישור ההזמנה ללוח */
  const handleCopyLink = useCallback(async () => {
    if (!referralCode) return;
    const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setErrorMessage('שגיאה בהעתקת הקישור');
    }
  }, [referralCode]);

  /** URL לשיתוף */
  const shareUrl = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}`
    : null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8" dir="rtl">

      {/* כותרת ראשית */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/20 border border-primary/30">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-headline font-bold text-3xl text-on-surface">הפניית חברים</h1>
        </div>
        <p className="font-body text-on-surface-variant text-base">
          הזמן חברים וקבל 5 ניתוחים בונוס לכל חבר שמצטרף
        </p>
      </div>

      {/* הסבר אופן הפעולה */}
      <div className="mb-6 rounded-xl border border-outline-variant/10 bg-surface-container p-4">
        <div className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-on-surface-variant font-body">
            <p className="font-label font-medium text-on-surface mb-1">איך זה עובד?</p>
            <ol className="list-decimal list-inside space-y-1 pr-1">
              <li>צור קוד הפניה אישי</li>
              <li>שתף את הקישור עם חברים</li>
              <li>כשחבר נרשם — תקבל 5 ניתוחים בונוס</li>
            </ol>
          </div>
        </div>
      </div>

      {/* הצגת שגיאה */}
      {errorMessage && (
        <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error font-body">
          {errorMessage}
        </div>
      )}

      {/* מצב טעינה */}
      {loadState === 'loading' && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* מצב שגיאה */}
      {loadState === 'error' && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-6 text-center">
          <p className="text-error font-body mb-4">שגיאה בטעינת קוד ההפניה</p>
          <button
            type="button"
            onClick={() => void fetchReferralCode()}
            className="rounded-lg bg-primary-container text-on-primary-container px-4 py-2 font-label text-sm font-medium transition-colors hover:bg-primary-container/80"
          >
            נסה שנית
          </button>
        </div>
      )}

      {/* מצב: אין קוד — הצגת כפתור יצירה */}
      {loadState === 'loaded' && !referralCode && (
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 border border-primary/30">
              <Gift className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="font-headline font-semibold text-xl text-on-surface mb-2">
            אין לך עדיין קוד הפניה
          </h2>
          <p className="font-body text-on-surface-variant text-sm mb-6">
            צור קוד הפניה אישי כדי להתחיל להזמין חברים ולהרוויח בונוסים
          </p>
          <button
            type="button"
            onClick={() => void handleGenerateCode()}
            disabled={isGenerating}
            className={cn(
              'rounded-xl bg-gradient-to-br from-primary-container to-secondary-container px-6 py-3',
              'font-headline font-bold text-white transition-all duration-200',
              'hover:opacity-90 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isGenerating ? 'יוצר קוד...' : 'צור קוד הפניה'}
          </button>
        </div>
      )}

      {/* מצב: יש קוד — הצגת הקוד */}
      {loadState === 'loaded' && referralCode && (
        <div className="space-y-4">

          {/* קוד הפניה */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
            <p className="text-sm text-on-surface-variant font-body mb-3">קוד ההפניה האישי שלך</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-surface-container-lowest rounded-lg font-mono text-primary text-lg font-bold px-5 py-4">
                <span className="text-3xl font-bold tracking-[0.3em]">
                  {referralCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyCode()}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-4',
                  'border font-label text-sm transition-all duration-200',
                  copiedCode
                    ? 'border-tertiary/50 bg-tertiary/10 text-tertiary'
                    : 'border-outline-variant/20 bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                )}
                aria-label="העתק קוד הפניה"
              >
                {copiedCode ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedCode ? 'הועתק!' : 'העתק'}
              </button>
            </div>
          </div>

          {/* קישור שיתוף */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="h-4 w-4 text-primary" />
              <p className="text-sm text-on-surface-variant font-body">קישור הזמנה</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 overflow-hidden">
                <p className="text-sm text-on-surface-variant truncate font-mono">
                  {shareUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-3',
                  'border font-label text-sm transition-all duration-200 whitespace-nowrap',
                  copiedLink
                    ? 'border-tertiary/50 bg-tertiary/10 text-tertiary'
                    : 'border-outline-variant/20 bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                )}
                aria-label="העתק קישור הזמנה"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedLink ? 'הועתק!' : 'העתק קישור'}
              </button>
            </div>
          </div>

          {/* הפרדה ויצירת קוד חדש */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => void handleGenerateCode()}
              disabled={isGenerating}
              className="text-sm text-on-surface-variant hover:text-on-surface font-body underline underline-offset-4 transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'יוצר קוד חדש...' : 'צור קוד הפניה חדש'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
