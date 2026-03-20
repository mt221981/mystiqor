/**
 * דף נחיתה ציבורי — מציג את MystiQor למבקרים חדשים
 * כולל hero section, תיאור יכולות, ו-CTA להרשמה
 */

import Link from 'next/link';

import {
  Sparkles,
  Star,
  Moon,
  Eye,
  PenTool,
  Brain,
  Compass,
} from 'lucide-react';

// ===== קבועים =====

/** רשימת הכלים המוצגים בדף הנחיתה */
const FEATURES = [
  {
    icon: Star,
    title: 'נומרולוגיה',
    description: 'גלה את המשמעות המספרית של שמך ותאריך הלידה שלך',
  },
  {
    icon: Moon,
    title: 'אסטרולוגיה',
    description: 'מפת לידה מפורטת עם פירוש כוכבים, בתים ואספקטים',
  },
  {
    icon: Sparkles,
    title: 'טארוט',
    description: 'קריאת קלפים אינטואיטיבית עם פירושים עמוקים ומדויקים',
  },
  {
    icon: Eye,
    title: 'ניתוח חלומות',
    description: 'פענוח סמלים ודפוסים בחלומות שלך להבנה עצמית',
  },
  {
    icon: PenTool,
    title: 'גרפולוגיה',
    description: 'ניתוח כתב יד לגילוי תכונות אישיות מוסתרות',
  },
  {
    icon: Brain,
    title: 'ניתוח אישיות',
    description: 'מבט מעמיק על האישיות שלך דרך שילוב כלים מגוונים',
  },
] as const;

// ===== קומפוננטה =====

/** דף נחיתה ציבורי עם hero section ותיאור כלים */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== Header ===== */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">MystiQor</span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            התחבר
          </Link>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden px-4 py-24 text-center">
        {/* רקע דקורטיבי */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-3xl space-y-6">
          {/* אייקון */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Compass className="h-8 w-8 text-primary" />
          </div>

          {/* כותרת */}
          <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            גלה את עצמך
            <br />
            <span className="text-primary">עם MystiQor</span>
          </h1>

          {/* תיאור */}
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            פלטפורמה מתקדמת לגילוי עצמי המשלבת נומרולוגיה, אסטרולוגיה, טארוט
            וכלי ניתוח נוספים. קבל תובנות מעמיקות על האישיות, הכישורים
            והפוטנציאל שלך.
          </p>

          {/* CTA */}
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Sparkles className="h-5 w-5" />
              התחל עכשיו
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Features Grid ===== */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl">
            הכלים שלנו
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-accent/50"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border/50 px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MystiQor. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
