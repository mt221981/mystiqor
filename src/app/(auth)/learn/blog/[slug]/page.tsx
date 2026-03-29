'use client';

/** דף מאמר בלוג בודד — שולף לפי slug ומרנדר Markdown */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { GiSpellBook } from 'react-icons/gi';
import { PageHeader } from '@/components/layouts/PageHeader';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
import { animations } from '@/lib/animations/presets';
import { formatDate } from '@/lib/utils/dates';
import type { BlogPost } from '@/components/features/blog/BlogPostCard';

// ===== פונקציות API =====

/** שליפת מאמר בודד לפי slug */
async function fetchBlogPost(slug: string): Promise<{ data: BlogPost }> {
  const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    throw new Error('מאמר לא נמצא');
  }
  return (await res.json()) as { data: BlogPost };
}

// ===== קומפוננטה ראשית =====

/** דף מאמר בלוג בודד */
export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchBlogPost(slug),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });

  const post = data?.data;

  // מצב טעינה
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6" dir="rtl">
        <MysticSkeleton className="h-10 w-3/4 rounded-lg" />
        <MysticSkeleton className="h-6 w-1/2 rounded-lg" />
        <MysticSkeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  // מצב שגיאה
  if (isError || !post) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-on-surface-variant" dir="rtl">
        <GiSpellBook className="h-12 w-12 opacity-30" />
        <p className="font-body text-lg">המאמר לא נמצא</p>
        <a href="/learn/blog" className="text-primary hover:text-primary-fixed font-label text-sm">
          חזרה לבלוג
        </a>
      </div>
    );
  }

  // מצב תוצאה
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" dir="rtl">
      <PageHeader
        title={post.title}
        description={post.excerpt ?? ''}
        icon={<GiSpellBook className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'למידה', href: '/learn/tutorials' },
          { label: 'בלוג', href: '/learn/blog' },
          { label: post.title },
        ]}
      />

      {/* מטא-נתונים */}
      <div className="flex flex-wrap items-center gap-3 font-label text-xs text-on-surface-variant">
        <span>{post.author}</span>
        {post.read_time_minutes && <span>{post.read_time_minutes} דקות קריאה</span>}
        {post.published_at && <span>{formatDate(post.published_at)}</span>}
        <span className="bg-primary-container/10 text-primary px-2 py-0.5 rounded-full">
          {post.category}
        </span>
      </div>

      {/* תוכן המאמר */}
      <motion.article {...animations.fadeInUp} transition={{ duration: 0.4 }}>
        <div className="prose prose-sm prose-invert max-w-none font-body text-on-surface-variant">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </motion.article>

      {/* תגיות */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-outline-variant/10 pt-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-label text-xs bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full border border-outline-variant/10"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
