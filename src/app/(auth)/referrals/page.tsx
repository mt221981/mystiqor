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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30">
            <Users className="h-5 w-5 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">הפניית חברים</h1>
        </div>
        <p className="text-muted-foreground text-base">
          הזמן חברים וקבל 5 ניתוחים בונוס לכל חבר שמצטרף
        </p>
      </div>

      {/* הסבר אופן הפעולה */}
      <div className="mb-6 rounded-xl border border-purple-500/20 bg-purple-600/5 p-4">
        <div className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">איך זה עובד?</p>
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
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      {/* מצב טעינה */}
      {loadState === 'loading' && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      )}

      {/* מצב שגיאה */}
      {loadState === 'error' && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400 mb-4">שגיאה בטעינת קוד ההפניה</p>
          <button
            type="button"
            onClick={() => void fetchReferralCode()}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            נסה שנית
          </button>
        </div>
      )}

      {/* מצב: אין קוד — הצגת כפתור יצירה */}
      {loadState === 'loaded' && !referralCode && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/20 border border-purple-500/30">
              <Gift className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            אין לך עדיין קוד הפניה
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            צור קוד הפניה אישי כדי להתחיל להזמין חברים ולהרוויח בונוסים
          </p>
          <button
            type="button"
            onClick={() => void handleGenerateCode()}
            disabled={isGenerating}
            className={cn(
              'rounded-xl bg-gradient-to-l from-purple-600 to-indigo-600 px-6 py-3',
              'font-medium text-white transition-all duration-200',
              'hover:from-purple-700 hover:to-indigo-700',
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
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-muted-foreground mb-3">קוד ההפניה האישי שלך</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-purple-500/30 bg-purple-600/10 px-5 py-4">
                <span className="text-3xl font-bold tracking-[0.3em] text-purple-300 font-mono">
                  {referralCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyCode()}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-4',
                  'border font-medium text-sm transition-all duration-200',
                  copiedCode
                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
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
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="h-4 w-4 text-purple-400" />
              <p className="text-sm text-muted-foreground">קישור הזמנה</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 overflow-hidden">
                <p className="text-sm text-gray-400 truncate font-mono">
                  {shareUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-3',
                  'border font-medium text-sm transition-all duration-200 whitespace-nowrap',
                  copiedLink
                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
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
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'יוצר קוד חדש...' : 'צור קוד הפניה חדש'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
