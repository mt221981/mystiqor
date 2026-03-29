'use client'

/**
 * InstallPrompt — רכיב לעידוד התקנת PWA על מסך הבית
 * - Android/Chrome: מציג כפתור התקנה דרך beforeinstallprompt
 * - iOS: מציג הוראות ידניות (Safari לא תומך ב-beforeinstallprompt)
 * - מסתתר אם האפליקציה כבר מותקנת (standalone mode)
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// ===== ממשקים =====

/** ממשק עבור אירוע התקנה (לא חלק מהסטנדרט הרשמי של TypeScript) */
interface BeforeInstallPromptEvent extends Event {
  /** מציג את תיבת הדו-שיח של ההתקנה */
  prompt(): Promise<void>
  /** בחירת המשתמש — accepted או dismissed */
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ===== קומפוננטה =====

/** רכיב עידוד התקנה — מטפל ב-Android (native prompt) ו-iOS (הוראות ידניות) */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // בדיקה אם האפליקציה כבר מותקנת ופועלת במצב standalone
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    // זיהוי iOS — beforeinstallprompt לא נתמך ב-Safari (Pitfall 7)
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))

    /** מאזין לאירוע התקנה מהדפדפן */
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  /** מפעיל את חלונית ההתקנה הדפדפן-מובנית */
  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  // לא מציגים אם האפליקציה כבר מותקנת או שהמשתמש דחה
  if (isStandalone || dismissed) return null
  // לא מציגים אם אין prompt זמין וגם לא iOS
  if (!deferredPrompt && !isIOS) return null

  return (
    <div className="fixed bottom-4 start-4 end-4 md:start-auto md:end-4 md:w-80 bg-surface-container/60 backdrop-blur-xl rounded-xl p-6 border border-outline-variant/10 shadow-xl" style={{ zIndex: 'var(--z-floating)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-headline font-semibold text-sm text-on-surface">התקינו את MystiQor</p>
          {isIOS ? (
            <p className="text-xs text-on-surface-variant mt-1">
              לחצו על כפתור השיתוף ואז &quot;הוסף למסך הבית&quot;
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant mt-1">
              התקינו את האפליקציה לגישה מהירה ממסך הבית
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-on-surface-variant hover:text-on-surface font-label text-sm transition-colors text-lg leading-none"
          aria-label="סגור"
        >
          &times;
        </button>
      </div>
      {!isIOS && deferredPrompt && (
        <button
          type="button"
          onClick={handleInstall}
          className="mt-3 w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold rounded-lg px-4 py-2.5 text-sm shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95 transition-transform"
        >
          התקנה
        </button>
      )}
    </div>
  )
}
