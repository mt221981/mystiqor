/**
 * NumberCard — כרטיס אינטראקטיבי להצגת מספר נומרולוגי בודד
 * לחיצה פותחת מודאל מיסטי עם פרשנות מעמיקה לכל מספר
 * מדוע: מאפשר חוויה מיסטית עמוקה — כל מספר הוא שער לתובנה
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { getNumberMeaning, NUMBER_TYPE_LABELS } from '@/lib/constants/numerology-meanings'

/** Props של כרטיס מספר נומרולוגי */
export interface NumberCardProps {
  /** מפתח סוג המספר (life_path, destiny, soul...) */
  readonly numberKey: string
  /** תווית עברית, למשל "נתיב חיים" */
  readonly label: string
  /** ערך המספר הנומרולוגי */
  readonly value: number
  /** מחלקת Tailwind לרקע — ברירת מחדל bg-surface-container */
  readonly color?: string
  /** פרשנות AI אישית למספר הזה (אופציונלי) */
  readonly personalInterpretation?: string
}

/**
 * כרטיס מספר נומרולוגי אינטראקטיבי
 * מציג: ערך מספרי גדול + תווית + לחיצה פותחת פרשנות מעמיקה
 */
export function NumberCard({
  numberKey,
  label,
  value,
  color = 'bg-surface-container',
  personalInterpretation,
}: NumberCardProps) {
  const [open, setOpen] = useState(false)
  const meaning = getNumberMeaning(value)
  const typeInfo = NUMBER_TYPE_LABELS[numberKey]

  return (
    <>
      {/* כרטיס — לחיץ */}
      <Card
        className={cn(
          'text-center border border-outline-variant/10 hover:border-primary/40',
          'transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(143,45,230,0.15)]',
          color
        )}
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${value} — לחץ לפרטים`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true) }}
      >
        <CardContent className="pt-5 pb-4 px-3 flex flex-col items-center gap-1.5">
          {/* אייקון סוג */}
          {typeInfo && (
            <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">
              {typeInfo.icon}
            </span>
          )}

          {/* מספר גדול במרכז */}
          <span
            className="text-5xl font-headline font-black text-primary leading-none group-hover:scale-110 transition-transform"
            aria-hidden="true"
          >
            {value}
          </span>

          {/* תווית עברית */}
          <span className="text-sm font-headline font-semibold text-on-surface mt-0.5">
            {label}
          </span>

          {/* כותרת המספר */}
          <span className="text-xs font-body text-on-surface-variant/70">
            {meaning.title}
          </span>

          {/* רמז ללחיצה */}
          <span className="text-[10px] font-body text-primary/50 group-hover:text-primary/80 transition-colors mt-1">
            לחץ לגילוי ▾
          </span>
        </CardContent>
      </Card>

      {/* מודאל פרשנות מעמיקה */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-surface-container to-surface border border-primary/20 shadow-[0_0_60px_rgba(143,45,230,0.2)] p-0"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* כותרת מעוצבת */}
            <div className="bg-gradient-to-br from-primary/20 to-secondary/10 p-6 pb-4 text-center border-b border-primary/10">
              <div className="text-4xl mb-2">{typeInfo?.icon}</div>
              <span className="text-7xl font-headline font-black text-primary leading-none block">
                {value}
              </span>
              <DialogTitle className="text-xl font-headline font-bold text-on-surface mt-2">
                {label} — {meaning.title}
              </DialogTitle>
              <DialogDescription className="text-sm font-body text-on-surface-variant mt-1">
                {typeInfo?.description}
              </DialogDescription>
            </div>

            {/* גוף — תוכן מעמיק */}
            <div className="p-6 space-y-5" dir="rtl">
              {/* תיאור מעמיק */}
              <div className="space-y-2">
                <h3 className="text-sm font-headline font-bold text-primary flex items-center gap-2">
                  ✦ המשמעות העמוקה
                </h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  {meaning.deepDescription}
                </p>
              </div>

              {/* קבלה ואסוציאציות */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                  <div className="text-2xl font-headline font-bold text-primary">{meaning.hebrewLetter}</div>
                  <div className="text-[10px] font-body text-on-surface-variant mt-1">אות עברית</div>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                  <div className="text-xs font-headline font-bold text-primary leading-tight">{meaning.sephira}</div>
                  <div className="text-[10px] font-body text-on-surface-variant mt-1">ספירה</div>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                  <div className="text-xs font-headline font-bold text-primary leading-tight">{meaning.association}</div>
                  <div className="text-[10px] font-body text-on-surface-variant mt-1">כוכב</div>
                </div>
              </div>

              {/* מילות מפתח */}
              <div className="flex flex-wrap gap-2 justify-center">
                {meaning.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs font-body px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {kw}
                  </span>
                ))}
              </div>

              {/* פרשנות AI אישית — אם קיימת */}
              {personalInterpretation && (
                <div className="space-y-2 border-t border-outline-variant/10 pt-4">
                  <h3 className="text-sm font-headline font-bold text-secondary flex items-center gap-2">
                    ✦ המסר האישי שלך
                  </h3>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {personalInterpretation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}
