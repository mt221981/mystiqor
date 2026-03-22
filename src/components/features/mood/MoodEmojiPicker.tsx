'use client';

/**
 * בורר אמוג'י למצב רוח — 5 כפתורים מאנימציה לבחירת ציון מצב רוח
 * ממפה לציוני 2,4,6,8,10 בהתאם להחלטה D-05
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ===== ממשקי טיפוסים =====

/** מאפייני בורר אמוג'י מצב רוח */
interface MoodEmojiPickerProps {
  /** ציון נבחר כעת (null = לא נבחר) */
  readonly value: number | null;
  /** callback בעת בחירה — מעביר ציון ותיאור */
  readonly onChange: (score: number, label: string) => void;
}

// ===== קבועים =====

/** מיפוי אמוג'י לציוני מצב רוח (D-05) */
const MOOD_EMOJIS = [
  { emoji: '\u{1F622}', label: 'גרוע מאוד', score: 2 },
  { emoji: '\u{1F614}', label: 'לא טוב', score: 4 },
  { emoji: '\u{1F610}', label: 'בסדר', score: 6 },
  { emoji: '\u{1F60A}', label: 'טוב', score: 8 },
  { emoji: '\u{1F604}', label: 'מעולה', score: 10 },
] as const;

// ===== קומפוננטה ראשית =====

/**
 * בורר אמוג'י מצב רוח — 5 כפתורים גדולים הניתנים לגישה מקלדת
 * הכפתור הנבחר מסומן עם מסגרת סגולה והגדלה קלה
 */
export function MoodEmojiPicker({ value, onChange }: MoodEmojiPickerProps) {
  return (
    <div
      className="grid grid-cols-5 gap-3"
      role="group"
      aria-label="בחר מצב רוח"
      dir="rtl"
    >
      {MOOD_EMOJIS.map(({ emoji, label, score }) => {
        const isSelected = value === score;

        return (
          <motion.button
            key={score}
            type="button"
            onClick={() => onChange(score, label)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl p-3',
              'border-2 transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
              'cursor-pointer select-none',
              isSelected
                ? 'border-purple-500 bg-purple-500/10 scale-110'
                : 'border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-400/5'
            )}
            aria-pressed={isSelected}
            aria-label={label}
          >
            {/* אמוג'י */}
            <span className="text-3xl leading-none" role="img" aria-hidden="true">
              {emoji}
            </span>

            {/* תיאור */}
            <span
              className={cn(
                'text-xs font-medium',
                isSelected ? 'text-purple-300' : 'text-gray-400'
              )}
            >
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

export { MOOD_EMOJIS };
