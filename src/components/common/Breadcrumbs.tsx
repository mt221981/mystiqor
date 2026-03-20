/**
 * פירורי לחם (Breadcrumbs) — מציג שרשרת ניווט עם קישורים
 * תומך ב-RTL עם מפריד מתאים, הפריט האחרון ללא קישור (עמוד נוכחי)
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ===== ממשקי טיפוסים =====

/** פריט פירורי לחם בודד */
interface BreadcrumbItem {
  /** תווית בעברית */
  readonly label: string;
  /** קישור (אופציונלי — ללא = עמוד נוכחי) */
  readonly href?: string;
}

/** מאפייני פירורי לחם */
interface BreadcrumbsProps {
  /** רשימת הפריטים מהשורש לעמוד הנוכחי */
  readonly items: readonly BreadcrumbItem[];
}

// ===== קומפוננטה ראשית =====

/** פירורי לחם — שרשרת ניווט RTL עם מפרידים */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="פירורי לחם" className="flex items-center gap-1.5">
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {/* מפריד — לא מוצג לפני הפריט הראשון */}
              {index > 0 && (
                <ChevronLeft
                  className="h-3.5 w-3.5 text-gray-500"
                  aria-hidden="true"
                />
              )}

              {/* פריט — קישור או טקסט (האחרון תמיד טקסט) */}
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'text-gray-400 hover:text-purple-400',
                    'transition-colors duration-150'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast ? 'font-medium text-white' : 'text-gray-400'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
