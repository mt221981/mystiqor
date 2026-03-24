/**
 * BlogPostCard — כרטיס מאמר בלוג
 * מציג כותרת, תקציר, פרטי מחבר וקטגוריה, עם אפשרות להרחבה לתוכן מלא
 */

'use client';

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
    <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/5 hover:border-primary/10 transition-colors flex flex-col">
      <div className="p-5 pb-3">
        {/* כותרת + קטגוריה */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-headline font-semibold text-on-surface text-lg leading-tight line-clamp-2">
            {post.title}
          </h3>
          <span className="bg-primary-container/10 text-primary font-label text-xs px-2 py-0.5 rounded-full shrink-0">
            {post.category}
          </span>
        </div>

        {/* מטא-נתונים */}
        <div className="flex flex-wrap items-center gap-3 font-label text-xs text-on-surface-variant mt-1">
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
      </div>

      <div className="px-5 pb-5 flex flex-col gap-3 flex-1">
        {/* תקציר */}
        {post.excerpt && (
          <p className="font-body text-sm text-on-surface-variant line-clamp-3">{post.excerpt}</p>
        )}

        {/* תוכן מורחב */}
        {expanded && (
          <div className="font-body text-sm text-on-surface leading-relaxed whitespace-pre-wrap border-t border-outline-variant/10 pt-3 mt-1">
            {post.content}
          </div>
        )}

        {/* תגיות */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="font-label text-xs bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full border border-outline-variant/10">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* כפתור הרחבה */}
        <button
          type="button"
          onClick={onToggle}
          className="self-start flex items-center gap-1 text-primary hover:text-primary-fixed font-label text-sm font-semibold transition-colors"
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
        </button>
      </div>
    </div>
  );
}
