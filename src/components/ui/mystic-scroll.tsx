/**
 * MysticScroll — מגילה מיסטית עם עיצוב זהוב
 * עוטפת תוכן בסגנון מגילה עתיקה עם בורדרים זהובים וזוהר
 * מדוע: מספקת עיצוב ייחודי לסינתזת AI — מבדיל אותה מכרטיסים רגילים
 */

import type React from 'react'
import { cn } from '@/lib/utils'

/** Props של קומפוננטת MysticScroll */
interface MysticScrollProps {
  /** כותרת המגילה — מוצגת בראש */
  readonly title: string
  /** תוכן — ReactNode */
  readonly children: React.ReactNode
  /** מחלקות נוספות — אופציונלי */
  readonly className?: string
}

/**
 * קומפוננטת מגילה מיסטית עם עיצוב זהוב
 * מציגה כותרת + תוכן עם בורדרים זהובים, זוהר ואלמנטים דקורטיביים
 */
export function MysticScroll({ title, children, className }: MysticScrollProps) {
  return (
    <div dir="rtl" className={cn('relative rounded-2xl overflow-hidden mystic-card-gold', className)}>
      {/* זוהר רקע עדין */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,168,83,0.04) 0%, transparent 60%)' }}
      />

      {/* פס זהוב עליון */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

      {/* כותרת */}
      <div className="p-5 pb-3 text-center relative">
        <span className="text-2xl block mb-1">📜</span>
        <h3 className="text-base font-headline font-bold text-accent">{title}</h3>
        <div className="h-px w-16 mx-auto bg-accent/30 mt-2" />
      </div>

      {/* גוף תוכן */}
      <div className="px-6 pb-6 pt-2 relative">
        <div className="font-body text-on-surface-variant text-sm leading-relaxed">
          {children}
        </div>
      </div>

      {/* פס זהוב תחתון */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
    </div>
  )
}
