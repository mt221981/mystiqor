/**
 * LearningPathCard — כרטיס מסלול למידה
 * מציג תחום, תיאור, פס התקדמות ורשימת נושאים
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        {/* אייקון + כותרת */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* פס התקדמות */}
        <div className="mt-3 flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedTopics}/{totalTopics} נושאים</span>
            <span>{percentage}%</span>
          </div>
          <Progress
            value={percentage}
            aria-label={`התקדמות ב-${title}: ${percentage}%`}
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-1">
        {/* רשימת נושאים */}
        {topics.map((topic) => (
          <Button
            key={topic.id}
            variant="ghost"
            size="sm"
            onClick={() => !topic.completed && onStartTopic(topic.id)}
            className="w-full justify-start gap-2 h-auto py-2"
            aria-label={`${topic.completed ? 'הושלם' : 'לא הושלם'}: ${topic.name}`}
          >
            {topic.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={topic.completed ? 'line-through text-muted-foreground' : ''}>
              {topic.name}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
