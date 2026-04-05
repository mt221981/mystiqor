'use client';

/**
 * הגדרת 6 הכלים העיקריים — שימוש בגריד Hero בדשבורד
 * כל כלי כולל: שם עברי, קישור, נתיב תמונה, אייקון ודרגת צבע
 */

import { Orbit, Layers, Hash, Hand, PenTool, Palette } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** הגדרת כלי עיקרי */
export interface PrimaryTool {
  /** מזהה ייחודי */
  readonly id: string;
  /** שם בעברית */
  readonly name: string;
  /** תיאור קצר */
  readonly description: string;
  /** קישור לעמוד הכלי */
  readonly href: string;
  /** נתיב תמונת artwork מקומית */
  readonly imagePath: string;
  /** אייקון Lucide */
  readonly Icon: LucideIcon;
  /** גרדיאנט Tailwind (fallback) */
  readonly gradient: string;
}

/** 6 הכלים העיקריים — סדר לפי המקור */
export const PRIMARY_TOOLS: readonly PrimaryTool[] = [
  {
    id: 'numerology',
    name: 'נומרולוגיה',
    description: 'גלה את כוח המספרים',
    href: '/tools/numerology',
    imagePath: '/images/tools/numerology.png',
    Icon: Hash,
    gradient: 'from-purple-500 via-purple-600 to-pink-600',
  },
  {
    id: 'astrology',
    name: 'אסטרולוגיה',
    description: 'מפת הכוכבים שלך',
    href: '/tools/astrology',
    imagePath: '/images/tools/astrology.png',
    Icon: Orbit,
    gradient: 'from-indigo-500 via-blue-600 to-purple-600',
  },
  {
    id: 'palmistry',
    name: 'קריאת כף יד',
    description: 'סודות כף היד',
    href: '/tools/palmistry',
    imagePath: '/images/tools/palmistry.png',
    Icon: Hand,
    gradient: 'from-blue-500 via-cyan-600 to-teal-600',
  },
  {
    id: 'tarot',
    name: 'טארוט',
    description: 'מסרים מהקלפים',
    href: '/tools/tarot',
    imagePath: '/images/tools/tarot.png',
    Icon: Layers,
    gradient: 'from-amber-500 via-orange-600 to-red-600',
  },
  {
    id: 'graphology',
    name: 'גרפולוגיה',
    description: 'ניתוח כתב יד',
    href: '/tools/graphology',
    imagePath: '/images/tools/graphology.png',
    Icon: PenTool,
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
  },
  {
    id: 'drawing',
    name: 'ציורים',
    description: 'פסיכולוגיה בציור',
    href: '/tools/drawing',
    imagePath: '/images/tools/drawing.png',
    Icon: Palette,
    gradient: 'from-pink-500 via-rose-600 to-purple-600',
  },
] as const;
