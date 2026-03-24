/**
 * BlogPostCard — כרטיס מאמר בלוג
 * מציג כותרת, תקציר, פרטי מחבר וקטגוריה, עם אפשרות להרחבה לתוכן מלא
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/dates';
import { Clock, User, ChevronDown, ChevronUp } from 'lucide-react';

/** פוסט בלוג */
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  author: string;
  category: string;
  tags: string[] | null;
  read_time_minutes: number | null;
  published_at: string | null;
  content: string;
}

/** Props של BlogPostCard */
interface BlogPostCardProps {
  /** נתוני הפוסט */
  post: BlogPost;
  /** האם הכרטיס מורחב */
  expanded: boolean;
  /** callback לשינוי מצב הרחבה */
  onToggle: () => void;
}

/**
 * BlogPostCard — כרטיס מאמר בלוג עם תוכן מורחב
 * לוחץ על "קרא עוד" / "סגור" לפתיחה/סגירה
 */
export function BlogPostCard({ post, expanded, onToggle }: BlogPostCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        {/* כותרת + קטגוריה */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">{post.title}</h3>
          <Badge variant="secondary" className="shrink-0">
            {post.category}
          </Badge>
        </div>

        {/* מטא-נתונים */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
          {post.read_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.read_time_minutes} דקות קריאה
            </span>
          )}
          {post.published_at && (
            <span>{formatDate(post.published_at)}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {/* תקציר */}
        {post.excerpt && (
          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        )}

        {/* תוכן מורחב */}
        {expanded && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap border-t pt-3 mt-1">
            {post.content}
          </div>
        )}

        {/* תגיות */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* כפתור הרחבה */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="self-start gap-1 text-primary hover:text-primary"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              סגור <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              קרא עוד <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
