'use client';

/**
 * דף בלוג — /learn/blog
 * מציג מאמרים חינוכיים עם סינון קטגוריה וחיפוש כותרת
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, Search } from 'lucide-react';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { BlogPostCard, type BlogPost } from '@/components/features/blog/BlogPostCard';

// ===== קבועים =====

/** קטגוריות סינון */
const CATEGORIES = ['הכל', 'אסטרולוגיה', 'נומרולוגיה', 'קריאה בכף יד', 'גרפולוגיה'] as const;

// ===== פונקציות API =====

/** שליפת מאמרי בלוג לפי קטגוריה וחיפוש */
async function fetchBlogPosts(
  category: string | null,
  search: string
): Promise<{ data: BlogPost[]; meta: { total: number } }> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search.trim()) params.set('search', search.trim());

  const response = await fetch(`/api/blog?${params.toString()}`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת הבלוג');
  }
  return (await response.json()) as { data: BlogPost[]; meta: { total: number } };
}

// ===== קומפוננטה ראשית =====

/**
 * BlogPage — דף בלוג עם סינון קטגוריה, חיפוש, ורשת כרטיסי מאמרים
 */
export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // שליפת מאמרים
  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog', selectedCategory, searchQuery],
    queryFn: () => fetchBlogPosts(selectedCategory, searchQuery),
    staleTime: 1000 * 60 * 5, // 5 דקות
  });

  const posts = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" dir="rtl">
      {/* כותרת */}
      <div className="flex items-center gap-3">
        <Newspaper className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-2xl font-bold text-on-surface">בלוג</h1>
      </div>

      {/* שדה חיפוש */}
      <div className="relative max-w-md">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="search"
          placeholder="חיפוש מאמרים..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container-lowest border-none rounded-lg px-4 py-2 pe-9 text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-1 focus:ring-primary/40 font-body text-sm"
          aria-label="חיפוש מאמרים"
        />
      </div>

      {/* כפתורי קטגוריה */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = cat === 'הכל' ? selectedCategory === null : selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat === 'הכל' ? null : cat)}
              className={cn(
                'font-label text-sm rounded-lg px-3 py-1.5 transition-colors',
                isActive
                  ? 'bg-primary-container/20 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* מצב טעינה */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MysticSkeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {/* מצב שגיאה */}
      {isError && (
        <p className="font-body text-sm text-error">שגיאה בטעינת המאמרים. נסה שוב מאוחר יותר.</p>
      )}

      {/* רשת מאמרים */}
      {!isLoading && !isError && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* מצב ריק */}
      {!isLoading && !isError && posts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-on-surface-variant">
          <Newspaper className="h-12 w-12 opacity-30" />
          <p className="font-body text-lg text-on-surface-variant">אין מאמרים</p>
          {(selectedCategory || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
            >
              נקה סינון
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
