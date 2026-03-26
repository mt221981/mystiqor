/**
 * לייאאוט שורש — מגדיר RTL, עברית, פונטים, ערכת נושא ומטא-נתונים גלובליים
 * כל דפי האפליקציה יורשים מלייאאוט זה
 */

import { Plus_Jakarta_Sans, Inter, Manrope, Heebo } from 'next/font/google';
import Script from 'next/script';

import './globals.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ===== פונטים =====

/** פונט כותרות — Plus Jakarta Sans */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-headline',
  display: 'swap',
});

/** פונט גוף — Inter */
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

/** פונט תוויות — Manrope */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-label',
  display: 'swap',
});

/** פונט עברי — Heebo */
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hebrew',
  display: 'swap',
});

// ===== מטא-נתונים =====

/** מטא-נתונים גלובליים של האפליקציה */
export const metadata: Metadata = {
  title: {
    default: 'MystiQor — גלה את עצמך',
    template: '%s | MystiQor',
  },
  description:
    'פלטפורמה מתקדמת לגילוי עצמי המשלבת נומרולוגיה, אסטרולוגיה, טארוט וכלי ניתוח נוספים. גלה את הפוטנציאל שלך.',
  keywords: [
    'נומרולוגיה',
    'אסטרולוגיה',
    'טארוט',
    'גילוי עצמי',
    'מיסטיקור',
    'ניתוח אישיות',
  ],
  authors: [{ name: 'MystiQor' }],
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'MystiQor',
    title: 'MystiQor — גלה את עצמך',
    description:
      'פלטפורמה מתקדמת לגילוי עצמי המשלבת נומרולוגיה, אסטרולוגיה, טארוט וכלי ניתוח נוספים.',
  },
};

/** הגדרות viewport */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0d0b1e',
};

// ===== ממשקים =====

/** פרופס של לייאאוט השורש */
interface RootLayoutProps {
  readonly children: ReactNode;
}

// ===== קומפוננטה =====

/** לייאאוט שורש — עוטף את כל האפליקציה עם RTL, פונטים וערכת נושא קוסמי */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={cn('dark', plusJakartaSans.variable, inter.variable, manrope.variable, heebo.variable)}
      suppressHydrationWarning
    >
      <head>
        {/* Material Symbols Outlined — אייקונים מגוגל */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen bg-surface text-on-surface">
        {children}
        {/* רישום Service Worker — נדרש לאפשר התקנת PWA */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        `}</Script>
      </body>
    </html>
  );
}
