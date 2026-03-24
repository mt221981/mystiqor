/**
 * PWA Manifest — הגדרות האפליקציה להתקנה על מסך הבית
 * Next.js App Router מטפל אוטומטית ב-/manifest.webmanifest
 */
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MystiQor — גלה את עצמך',
    short_name: 'MystiQor',
    description: 'פלטפורמה מתקדמת לגילוי עצמי המשלבת אסטרולוגיה, נומרולוגיה, טארוט וכלי ניתוח נוספים',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1a1025',
    theme_color: '#1a1025',
    lang: 'he',
    dir: 'rtl',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
