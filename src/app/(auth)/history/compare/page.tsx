/**
 * דף השוואת ניתוחים — HIST-03
 * קורא שני מזהי ניתוח מה-URL, שולף אותם עם תוצאות מלאות,
 * ומציג אותם זה לצד זה דרך ComparePanel
 */
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { GitCompare, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
import { ComparePanel, type AnalysisWithResults } from '@/components/features/history/ComparePanel';
import { CACHE_TIMES } from '@/lib/query/cache-config';

/** תגובת API ניתוחים עם תוצאות */
interface AnalysesWithResultsResponse {
  data: AnalysisWithResults[];
  meta: { offset: number; limit: number; total: number };
}

/**
 * שליפת ניתוחים עם תוצאות מלאות
 * API אין endpoint ליחיד לפי ID, לכן שולפים 200 רשומות ומסננים
 */
async function fetchAnalysesWithResults(): Promise<AnalysisWithResults[]> {
  const res = await fetch('/api/analysis?include_results=true&limit=200');
  if (!res.ok) throw new Error('שגיאה בטעינת ניתוחים');
  const json = (await res.json()) as AnalysesWithResultsResponse;
  return json.data;
}

/** ולידציה שמחרוזת היא UUID תקין */
function isValidUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/** רכיב פנימי שמשתמש ב-useSearchParams */
function ComparePageContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids') ?? '';
  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);

  /** ולידציה שיש בדיוק 2 UUIDs תקינים */
  const isValid = ids.length === 2 && ids.every(isValidUuid);

  /** שליפת ניתוחים עם תוצאות */
  const { data: allAnalyses, isLoading, isError } = useQuery<AnalysisWithResults[]>({
    queryKey: ['analyses-with-results'],
    queryFn: fetchAnalysesWithResults,
    enabled: isValid,
    staleTime: CACHE_TIMES.SHORT,
  });

  /** חיפוש כל אחד מהניתוחים ברשימה */
  const left = allAnalyses?.find((a) => a.id === ids[0]);
  const right = allAnalyses?.find((a) => a.id === ids[1]);
  const bothFound = !!left && !!right;

  return (
    <div className="space-y-6 p-6">
      {/* כותרת הדף */}
      <div className="flex items-center gap-3">
        <GitCompare className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-2xl font-bold text-on-surface">השוואת ניתוחים</h1>
      </div>

      {/* כפתור חזרה */}
      <div>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 font-label text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה להיסטוריה
        </Link>
      </div>

      {/* שגיאת ולידציה — IDs חסרים או לא תקינים */}
      {!isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            יש לבחור בדיוק שני ניתוחים להשוואה.{' '}
            <Link href="/history" className="underline">
              חזרה להיסטוריה
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* מצב טעינה */}
      {isValid && isLoading && (
        <div className="flex items-center gap-3 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-body text-on-surface-variant">טוען ניתוחים...</span>
        </div>
      )}

      {/* שגיאת טעינה מ-API */}
      {isValid && isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>שגיאה בטעינת הניתוחים. נסה שוב.</AlertDescription>
        </Alert>
      )}

      {/* skeleton בזמן טעינה */}
      {isValid && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MysticSkeleton className="h-64 rounded-xl" />
          <MysticSkeleton className="h-64 rounded-xl" />
        </div>
      )}

      {/* ניתוח לא נמצא אחרי טעינה */}
      {isValid && !isLoading && !isError && !bothFound && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            אחד מהניתוחים לא נמצא.{' '}
            <Link href="/history" className="underline">
              חזרה להיסטוריה
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* לוח ההשוואה */}
      {bothFound && <ComparePanel left={left} right={right} />}
    </div>
  );
}

/** עמוד השוואת ניתוחים — עוטף ב-Suspense כנדרש עבור useSearchParams */
export default function CompareHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <GitCompare className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-on-surface">השוואת ניתוחים</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MysticSkeleton className="h-64 rounded-xl" />
            <MysticSkeleton className="h-64 rounded-xl" />
          </div>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
