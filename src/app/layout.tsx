/**
 * לייאאוט שורש — מגדיר RTL, עברית, פונטים, ערכת נושא ומטא-נתונים גלובליים
 * כל דפי האפליקציה יורשים מלייאאוט זה
 */

import { Assistant, Geist } from 'next/font/google';

import './globals.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// ===== פונטים =====

/** פונט ראשי — Assistant תומך עברית ולטינית */
const assistant = Assistant({
  subsets: ['latin', 'hebrew'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-assistant',
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
  themeColor: '#1a1025',
};

// ===== ממשקים =====

/** פרופס של לייאאוט השורש */
interface RootLayoutProps {
  readonly children: ReactNode;
}

// ===== קומפוננטה =====

/** לייאאוט שורש — עוטף את כל האפליקציה עם RTL, פונטים וערכת נושא */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="he" dir="rtl" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body
        className={`${assistant.variable} font-[family-name:var(--font-assistant)] antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
