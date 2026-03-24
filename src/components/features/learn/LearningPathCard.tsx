/**
 * LearningPathCard — כרטיס מסלול למידה
 * מציג תחום, תיאור, פס התקדמות ורשימת נושאים
 */

'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** נושא בודד במסלול */
export interface LearningTopic {
  id: string;
  name: string;
  completed: boolean;
}

/** Props של LearningPathCard */
interface LearningPathCardProps {
  /** מזהה תחום (astrology / numerology / drawing) */
  discipline: string;
  /** שם מסלול הלמידה */
  title: string;
  /** תיאור קצר של המסלול */
  description: string;
  /** אייקון Lucide */
  icon: LucideIcon;
  /** רשימת נושאים עם סטטוס השלמה */
  topics: LearningTopic[];
  /** סך הנושאים */
  totalTopics: number;
  /** נושאים שהושלמו */
  completedTopics: number;
  /** callback בלחיצה על נושא */
  onStartTopic: (topicId: string) => void;
}

/**
 * LearningPathCard — כרטיס מסלול למידה עם פס התקדמות ורשימת נושאים
 */
export function LearningPathCard({
  title,
  description,
  icon: Icon,
  topics,
  totalTopics,
  completedTopics,
  onStartTopic,
}: LearningPathCardProps) {
  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/5 hover:border-primary/10 transition-colors flex flex-col gap-4">
      {/* אייקון + כותרת */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-headline font-semibold text-on-surface">{title}</h3>
          <p className="font-body text-sm text-on-surface-variant">{description}</p>
        </div>
      </div>

      {/* פס התקדמות */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="font-label text-xs text-on-surface-variant">{completedTopics}/{totalTopics} נושאים</span>
          <span className="font-headline font-bold text-primary text-sm">{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-primary-container to-secondary-container rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`התקדמות ב-${title}: ${percentage}%`}
          />
        </div>
      </div>

      {/* רשימת נושאים */}
      <div className="flex flex-col gap-1">
        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => !topic.completed && onStartTopic(topic.id)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-surface-container-high transition-colors text-start"
            aria-label={`${topic.completed ? 'הושלם' : 'לא הושלם'}: ${topic.name}`}
          >
            {topic.completed ? (
              <CheckCircle2 className="h-4 w-4 text-tertiary shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-on-surface-variant shrink-0" />
            )}
            <span className={`font-body text-sm ${topic.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
              {topic.name}
            </span>
          </button>
        ))}
      </div>

      {/* כפתור התחלה/המשך */}
      <button
        type="button"
        className="w-full bg-primary-container text-on-primary-container rounded-lg px-4 py-2 font-headline font-bold text-sm hover:opacity-90 transition-opacity"
        onClick={() => {
          const firstIncomplete = topics.find((t) => !t.completed);
          if (firstIncomplete) onStartTopic(firstIncomplete.id);
        }}
      >
        {completedTopics === 0 ? 'התחל' : completedTopics === totalTopics ? 'הושלם ✓' : 'המשך'}
      </button>
    </div>
  );
}
