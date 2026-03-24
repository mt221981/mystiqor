'use client';

/**
 * דף מדריכים ומסלולי למידה — /learn/tutorials
 * מציג 3 מסלולי למידה (אסטרולוגיה, נומרולוגיה, ציורים) עם מעקב התקדמות
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GraduationCap, Stars, Hash, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LearningPathCard } from '@/components/features/learn/LearningPathCard';
import { ProgressTracker } from '@/components/features/learn/ProgressTracker';
import type { Tables } from '@/types/database';

// ===== טיפוסים =====

type LearningProgressRow = Tables<'learning_progress'>;

/** קלט מוטציה להשלמת נושא */
interface CompleteTopicInput {
  discipline: string;
  topic: string;
  completed: boolean;
}

// ===== נתוני מסלולי למידה =====

/** הגדרות מסלולי למידה — 3 תחומים */
const LEARNING_PATHS = [
  {
    discipline: 'astrology',
    title: 'אסטרולוגיה',
    description: 'מבנה מפת הנטל, כוכבי הלכת, בתים וטרנזיטים',
    icon: Stars,
    topics: [
      { id: 'zodiac_signs', name: 'מזלות הגלגל' },
      { id: 'planets', name: 'כוכבי הלכת' },
      { id: 'houses', name: 'בתי הגלגל' },
      { id: 'aspects', name: 'זוויות בין כוכבים' },
      { id: 'transits', name: 'טרנזיטים' },
      { id: 'solar_return', name: 'חזרה שמשית' },
    ],
  },
  {
    discipline: 'numerology',
    title: 'נומרולוגיה',
    description: 'מספרי ליבה, גורל, נשמה ותאימות',
    icon: Hash,
    topics: [
      { id: 'life_path', name: 'מספר נתיב חיים' },
      { id: 'destiny_number', name: 'מספר גורל' },
      { id: 'soul_number', name: 'מספר נשמה' },
      { id: 'compatibility', name: 'תאימות מספרים' },
      { id: 'master_numbers', name: 'מספרי מאסטר' },
    ],
  },
  {
    discipline: 'drawing',
    title: 'ציורים',
    description: 'יסודות HTP, ניקוד Koppitz, מודל FDM וצבעים',
    icon: Pencil,
    topics: [
      { id: 'htp_basics', name: 'יסודות HTP' },
      { id: 'koppitz_scoring', name: 'ניקוד Koppitz' },
      { id: 'fdm_model', name: 'מודל FDM' },
      { id: 'color_meaning', name: 'משמעות צבעים' },
      { id: 'composition', name: 'קומפוזיציה בציור' },
    ],
  },
] as const;

// ===== פונקציות API =====

/** שליפת כל רשומות ההתקדמות של המשתמש */
async function fetchProgress(): Promise<LearningProgressRow[]> {
  const response = await fetch('/api/learn/progress');
  if (!response.ok) throw new Error('שגיאה בטעינת ההתקדמות');
  const data = (await response.json()) as { data: LearningProgressRow[] };
  return data.data;
}

/** סימון נושא כהושלם */
async function completeTopic(input: CompleteTopicInput): Promise<LearningProgressRow> {
  const response = await fetch('/api/learn/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'שגיאה בשמירת ההתקדמות');
  }
  const data = (await response.json()) as { data: LearningProgressRow };
  return data.data;
}

// ===== קומפוננטה ראשית =====

/**
 * TutorialsPage — דף מסלולי למידה עם מעקב התקדמות
 */
export default function TutorialsPage() {
  const queryClient = useQueryClient();

  // שליפת התקדמות
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['learning-progress'],
    queryFn: fetchProgress,
    staleTime: 1000 * 60 * 2,
  });

  // מוטציה — השלמת נושא
  const { mutate: markComplete } = useMutation({
    mutationFn: completeTopic,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['learning-progress'] });
      toast.success(`הנושא "${variables.topic}" סומן כהושלם`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  /** בדיקה האם נושא הושלם */
  function isTopicCompleted(discipline: string, topicId: string): boolean {
    return (
      progressData?.some(
        (p) => p.discipline === discipline && p.topic === topicId && p.completed
      ) ?? false
    );
  }

  // חישוב סך ההתקדמות
  const totalTopics = LEARNING_PATHS.reduce((sum, path) => sum + path.topics.length, 0);
  const completedTopics =
    progressData?.filter((p) => p.completed).length ?? 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" dir="rtl">
      {/* כותרת */}
      <div className="flex items-center gap-3">
        <GraduationCap className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-2xl font-bold text-on-surface">מדריכים ומסלולי למידה</h1>
      </div>

      {/* פס התקדמות כללי */}
      <div className="max-w-md">
        <ProgressTracker
          completed={completedTopics}
          total={totalTopics}
          label="התקדמות כוללת"
        />
      </div>

      {/* מצב טעינה */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {/* רשת מסלולי למידה */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LEARNING_PATHS.map((path) => {
            const topics = path.topics.map((t) => ({
              id: t.id,
              name: t.name,
              completed: isTopicCompleted(path.discipline, t.id),
            }));
            const completedCount = topics.filter((t) => t.completed).length;

            return (
              <LearningPathCard
                key={path.discipline}
                discipline={path.discipline}
                title={path.title}
                description={path.description}
                icon={path.icon}
                topics={topics}
                totalTopics={path.topics.length}
                completedTopics={completedCount}
                onStartTopic={(topicId) =>
                  markComplete({
                    discipline: path.discipline,
                    topic: topicId,
                    completed: true,
                  })
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
