/**
 * QuickConceptButtons — כפתורי מושג מהיר לצ'אט עם המורה
 * מאפשר בחירה בלחיצה אחת של שאלה/נושא נפוץ ושליחתו לצ'אט
 */

'use client'

/** מושג עם תווית לתצוגה ופרומפט לשליחה */
export interface Concept {
  /** תווית קצרה להצגה בכפתור */
  label: string
  /** הפרומפט המלא שיישלח למורה */
  prompt: string
}

/** Props לקומפוננט QuickConceptButtons */
interface QuickConceptButtonsProps {
  /** רשימת מושגים להצגה */
  concepts: Concept[]
  /** callback כשמשתמש לוחץ על מושג */
  onSelect: (prompt: string) => void
  /** האם הכפתורים מושבתים (בזמן טעינה) */
  disabled?: boolean
}

/**
 * QuickConceptButtons — כפתורי מושגים מהירים
 * מציג כפתורים בשורות גמישות עם מושגי לימוד נפוצים
 *
 * @param concepts - רשימת מושגים עם label ו-prompt
 * @param onSelect - callback לבחירת מושג
 * @param disabled - האם מושבת
 */
export function QuickConceptButtons({ concepts, onSelect, disabled }: QuickConceptButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {concepts.map((concept) => (
        <button
          key={concept.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(concept.prompt)}
          className="bg-surface-container border border-outline-variant/20 rounded-full px-4 py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {concept.label}
        </button>
      ))}
    </div>
  )
}
