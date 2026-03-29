'use client';

/**
 * כרטיס רשומת יומן — מציג רשומה בודדת עם תאריך, כותרת, תוכן, מצב רוח
 * D-09: שימוש באמוג'י מצב רוח, תאריך בפורמט עברי, תצוגה מקוצרת
 */

import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Pencil, Trash2, Zap, Heart } from 'lucide-react';

import { MOOD_EMOJIS } from '@/components/features/mood/MoodEmojiPicker';
import { cn } from '@/lib/utils/cn';

// ===== קבועים =====

/** מקסימום תווים בתצוגת תוכן מקוצרת */
const CONTENT_PREVIEW_LENGTH = 150;

// ===== ממשקי טיפוסים =====

/** נתוני רשומת יומן לתצוגה */
interface JournalEntryData {
  readonly id: string;
  readonly title: string | null;
  readonly content: string;
  readonly mood: string | null;
  readonly mood_score: number | null;
  readonly energy_level: number | null;
  readonly gratitude: string[] | null;
  readonly goals: string[] | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

/** מאפייני כרטיס רשומת יומן */
interface JournalEntryCardProps {
  /** נתוני הרשומה */
  readonly entry: JournalEntryData;
  /** callback לעריכה */
  readonly onEdit: (entry: JournalEntryData) => void;
  /** callback למחיקה */
  readonly onDelete: (id: string) => void;
}

// ===== פונקציות עזר =====

/** מחזיר אמוג'י לפי ציון מצב רוח */
function getMoodEmojiByScore(score: number): string {
  const closest = MOOD_EMOJIS.reduce((prev, curr) =>
    Math.abs(curr.score - score) < Math.abs(prev.score - score) ? curr : prev
  );
  return closest.emoji;
}

/** מקצר תוכן לאורך מקסימלי */
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}...`;
}

// ===== קומפוננטה ראשית =====

/**
 * כרטיס רשומת יומן — D-09
 * מציג: תאריך, כותרת/תצוגה מקוצרת, אמוג'י מצב רוח, כפתורי עריכה/מחיקה
 */
export function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const formattedDate = entry.created_at
    ? format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: he })
    : '';

  const contentPreview = truncateContent(entry.content, CONTENT_PREVIEW_LENGTH);
  const hasGratitude = entry.gratitude?.some((g) => g.trim().length > 0);

  return (
    <article
      className={cn(
        'bg-surface-container rounded-xl p-5 border border-outline-variant/5',
        'transition-colors duration-200 hover:border-primary/10'
      )}
      dir="rtl"
    >
      {/* כותרת + פעולות */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* תאריך */}
          <time
            dateTime={entry.created_at ?? undefined}
            className="font-label block text-xs text-on-surface-variant mb-1"
          >
            {formattedDate}
          </time>

          {/* כותרת או תצוגה ראשונה של תוכן */}
          {entry.title ? (
            <h3 className="font-headline text-sm font-semibold text-on-surface truncate">{entry.title}</h3>
          ) : (
            <h3 className="font-headline text-sm font-medium text-on-surface-variant truncate">
              {entry.content.slice(0, 60)}
              {entry.content.length > 60 && '...'}
            </h3>
          )}
        </div>

        {/* כפתורי פעולה */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            aria-label="ערוך רשומה"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md',
              'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1'
            )}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            aria-label="מחק רשומה"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md',
              'text-error/80 hover:bg-error/10 hover:text-error',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-error/40 focus:ring-offset-1'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* תצוגת תוכן מקוצרת */}
      {entry.title && (
        <p className="font-body mb-3 text-sm text-on-surface-variant leading-relaxed">{contentPreview}</p>
      )}

      {/* תחתית הכרטיס — מצב רוח + אנרגיה + הכרת תודה */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* D-09: אמוג'י מצב רוח */}
        {entry.mood_score !== null && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5',
              'bg-primary/10 border border-primary/20'
            )}
            title={`מצב רוח: ${entry.mood ?? entry.mood_score}`}
          >
            <span className="text-sm" aria-hidden="true">
              {getMoodEmojiByScore(entry.mood_score)}
            </span>
            {entry.mood && (
              <span className="font-label text-xs text-primary">{entry.mood}</span>
            )}
          </div>
        )}

        {/* רמת אנרגיה */}
        {entry.energy_level !== null && (
          <div
            className="flex items-center gap-1 text-xs text-on-surface-variant"
            title={`אנרגיה: ${entry.energy_level}/10`}
          >
            <Zap className="h-3 w-3 text-yellow-400" aria-hidden="true" />
            <span>{entry.energy_level}/10</span>
          </div>
        )}

        {/* הכרת תודה */}
        {hasGratitude && (
          <div
            className="flex items-center gap-1 text-xs text-on-surface-variant"
            title="יש הכרת תודה"
          >
            <Heart className="h-3 w-3 text-pink-400" aria-hidden="true" />
            <span>הכרת תודה</span>
          </div>
        )}
      </div>
    </article>
  );
}
