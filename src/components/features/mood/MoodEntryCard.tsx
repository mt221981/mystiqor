'use client';

/**
 * כרטיס רשומת מצב רוח — מציג מצב רוח, ציון, תאריך, מדדים והערות
 * כולל כפתור מחיקה עם אישור
 */

import { format } from 'date-fns';
import { he } from 'date-fns/locale/he';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ===== ממשקי טיפוסים =====

/** נתוני רשומת מצב רוח להצגה */
interface MoodEntryData {
  readonly id: string;
  readonly mood: string;
  readonly mood_score: number;
  readonly energy_level: number | null;
  readonly stress_level: number | null;
  readonly sleep_quality: number | null;
  readonly notes: string | null;
  readonly created_at: string | null;
}

/** מאפייני כרטיס רשומת מצב רוח */
interface MoodEntryCardProps {
  readonly entry: MoodEntryData;
  readonly onDelete: (id: string) => void;
}

// ===== עזר =====

/** מחזיר אמוג'י לפי ציון מצב רוח */
function getEmojiForScore(score: number): string {
  if (score <= 2) return '\u{1F622}';
  if (score <= 4) return '\u{1F614}';
  if (score <= 6) return '\u{1F610}';
  if (score <= 8) return '\u{1F60A}';
  return '\u{1F604}';
}

/** מחזיר צבע רקע לפי ציון */
function getScoreColor(score: number): string {
  if (score <= 3) return 'text-red-400';
  if (score <= 5) return 'text-orange-400';
  if (score <= 7) return 'text-yellow-400';
  return 'text-green-400';
}

/** מעצב תאריך בעברית */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: he });
  } catch {
    return '';
  }
}

// ===== קומפוננטה ראשית =====

/** כרטיס רשומת מצב רוח — מציג מצב רוח, מדדים, הערות וכפתור מחיקה */
export function MoodEntryCard({ entry, onDelete }: MoodEntryCardProps) {
  const emoji = getEmojiForScore(entry.mood_score);
  const scoreColor = getScoreColor(entry.mood_score);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 p-4',
        'transition-colors duration-200 hover:border-white/20'
      )}
    >
      {/* שורה עליונה — אמוג'י, מצב רוח, ציון, תאריך, מחיקה */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* אמוג'י */}
          <span
            className="text-3xl leading-none"
            role="img"
            aria-label={entry.mood}
          >
            {emoji}
          </span>

          {/* שם מצב רוח וציון */}
          <div>
            <p className="font-medium text-white">{entry.mood}</p>
            <p className={cn('text-sm font-bold', scoreColor)}>
              {entry.mood_score}/10
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* תאריך */}
          <span className="text-xs text-gray-500">
            {formatDate(entry.created_at)}
          </span>

          {/* כפתור מחיקה */}
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className={cn(
              'rounded-lg p-1.5 text-gray-500',
              'hover:bg-red-500/10 hover:text-red-400',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
            )}
            aria-label="מחק רשומה"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* פיצ'רים נוספים — אנרגיה, לחץ, שינה */}
      {(entry.energy_level !== null ||
        entry.stress_level !== null ||
        entry.sleep_quality !== null) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.energy_level !== null && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5',
                'bg-blue-500/10 text-xs font-medium text-blue-300'
              )}
            >
              אנרגיה: {entry.energy_level}/10
            </span>
          )}
          {entry.stress_level !== null && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5',
                'bg-orange-500/10 text-xs font-medium text-orange-300'
              )}
            >
              לחץ: {entry.stress_level}/10
            </span>
          )}
          {entry.sleep_quality !== null && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5',
                'bg-indigo-500/10 text-xs font-medium text-indigo-300'
              )}
            >
              שינה: {entry.sleep_quality}/10
            </span>
          )}
        </div>
      )}

      {/* הערות */}
      {entry.notes && (
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">
          {entry.notes}
        </p>
      )}
    </div>
  );
}
