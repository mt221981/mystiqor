/**
 * דף 404 — מוצג כשהנתיב המבוקש לא נמצא
 * עיצוב נקי עם הודעה בעברית וקישור חזרה לדף הבית
 */

import Link from 'next/link';

import { Sparkles } from 'lucide-react';

/** דף שגיאת 404 עם הודעה בעברית וניווט חזרה */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      {/* אייקון דקורטיבי */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>

      {/* קוד שגיאה */}
      <h1 className="text-7xl font-bold tracking-tight text-primary">404</h1>

      {/* הודעת שגיאה */}
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          הדף לא נמצא
        </h2>
        <p className="max-w-md text-muted-foreground">
          הדף שחיפשת לא קיים או שהוסר. אולי הכוכבים מכוונים אותך למקום אחר.
        </p>
      </div>

      {/* כפתור חזרה */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
}
