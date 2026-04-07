'use client';

/**
 * הגדרת כל הכלים המיסטיים — מקור אחיד לדאשבורד ולעמוד הכלים
 * אייקונים: Phosphor Icons (duotone) — עשירים ומפורטים יותר מ-Lucide
 */

import {
  Hash as PhHash,
  Planet,
  HandPalm,
  CardsThree,
  PenNib,
  Palette,
  MoonStars,
  Atom,
  HeartHalf,
  ChatsCircle,
} from '@phosphor-icons/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

/** טיפוס אייקון — Phosphor Icon */
type IconComponent = PhosphorIcon;

/** הגדרת כלי */
export interface ToolDefinition {
  /** מזהה ייחודי */
  readonly id: string;
  /** שם בעברית */
  readonly name: string;
  /** תיאור קצר */
  readonly description: string;
  /** קישור לעמוד הכלי */
  readonly href: string;
  /** אייקון Phosphor */
  readonly Icon: IconComponent;
  /** גרדיאנט Tailwind */
  readonly gradient: string;
  /** צבע ייחודי לאייקון (hex) */
  readonly accentColor: string;
  /** כלי ראשי — מוצג בדאשבורד */
  readonly isPrimary: boolean;
}

/** @deprecated — השתמש ב-ToolDefinition */
export type PrimaryTool = ToolDefinition;

/** כל הכלים — 6 ראשיים + 4 משניים */
export const ALL_TOOLS: readonly ToolDefinition[] = [
  {
    id: 'numerology',
    name: 'נומרולוגיה',
    description: 'גלה את כוח המספרים',
    href: '/tools/numerology',
    Icon: PhHash,
    gradient: 'from-purple-500 via-purple-600 to-pink-600',
    accentColor: '#8f2de6',
    isPrimary: true,
  },
  {
    id: 'astrology',
    name: 'אסטרולוגיה',
    description: 'מפת הכוכבים שלך',
    href: '/tools/astrology',
    Icon: Planet,
    gradient: 'from-indigo-500 via-blue-600 to-purple-600',
    accentColor: '#3626ce',
    isPrimary: true,
  },
  {
    id: 'palmistry',
    name: 'קריאת כף יד',
    description: 'סודות כף היד',
    href: '/tools/palmistry',
    Icon: HandPalm,
    gradient: 'from-blue-500 via-cyan-600 to-teal-600',
    accentColor: '#0891b2',
    isPrimary: true,
  },
  {
    id: 'tarot',
    name: 'טארוט',
    description: 'מסרים מהקלפים',
    href: '/tools/tarot',
    Icon: CardsThree,
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    accentColor: '#d97706',
    isPrimary: true,
  },
  {
    id: 'graphology',
    name: 'גרפולוגיה',
    description: 'ניתוח כתב יד',
    href: '/tools/graphology',
    Icon: PenNib,
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    accentColor: '#059669',
    isPrimary: true,
  },
  {
    id: 'drawing',
    name: 'ציורים',
    description: 'פסיכולוגיה בציור',
    href: '/tools/drawing',
    Icon: Palette,
    gradient: 'from-pink-500 via-rose-600 to-purple-600',
    accentColor: '#db2777',
    isPrimary: true,
  },
  {
    id: 'dream',
    name: 'חלומות',
    description: 'פירוש חלומות מיסטי',
    href: '/tools/dream',
    Icon: MoonStars,
    gradient: 'from-blue-500 via-indigo-600 to-purple-600',
    accentColor: '#6366f1',
    isPrimary: false,
  },
  {
    id: 'human-design',
    name: 'עיצוב אנושי',
    description: '9 מרכזים + פרופיל',
    href: '/tools/human-design',
    Icon: Atom,
    gradient: 'from-emerald-500 via-green-600 to-teal-600',
    accentColor: '#10b981',
    isPrimary: false,
  },
  {
    id: 'compatibility',
    name: 'התאמה',
    description: 'בדוק התאמה בין שניים',
    href: '/tools/compatibility',
    Icon: HeartHalf,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    accentColor: '#f43f5e',
    isPrimary: false,
  },
  {
    id: 'coach',
    name: 'מאמן AI',
    description: 'שיחה עם המאמנת האישית',
    href: '/coach',
    Icon: ChatsCircle,
    gradient: 'from-purple-500 via-violet-600 to-pink-600',
    accentColor: '#d4a853',
    isPrimary: false,
  },
] as const;

/** 6 כלים ראשיים — לדאשבורד */
export const PRIMARY_TOOLS: readonly ToolDefinition[] = ALL_TOOLS.filter(t => t.isPrimary);
