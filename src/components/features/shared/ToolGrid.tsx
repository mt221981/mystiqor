/**
 * רשת כלים — מציגה 6 כלים מיסטיים עם אייקונים עשירים ו-hover effects
 */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { hoverEffects } from '@/lib/animations/presets';
import { motion } from 'framer-motion';
import {
  GiAbacus,
  GiAstrolabe,
  GiQuillInk,
  GiPaintBrush,
  GiHandOfGod,
  GiCardRandom,
} from 'react-icons/gi';

/** צבע קטגוריה לכל כלי */
const CATEGORY_COLORS: Record<string, string> = {
  numerology: 'from-purple-500/20 to-blue-500/10 border-purple-400/15 hover:border-purple-400/30',
  astrology: 'from-indigo-500/20 to-purple-500/10 border-indigo-400/15 hover:border-indigo-400/30',
  graphology: 'from-teal-500/20 to-cyan-500/10 border-teal-400/15 hover:border-teal-400/30',
  drawing: 'from-amber-500/20 to-orange-500/10 border-amber-400/15 hover:border-amber-400/30',
  palmistry: 'from-rose-500/20 to-pink-500/10 border-rose-400/15 hover:border-rose-400/30',
  tarot: 'from-violet-500/20 to-fuchsia-500/10 border-violet-400/15 hover:border-violet-400/30',
};

/** צבע אייקון לכל כלי */
const ICON_COLORS: Record<string, string> = {
  numerology: 'text-purple-300',
  astrology: 'text-indigo-300',
  graphology: 'text-teal-300',
  drawing: 'text-amber-300',
  palmistry: 'text-rose-300',
  tarot: 'text-violet-300',
};

/** הגדרת כלי */
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

/** רשימת הכלים */
const TOOLS: Tool[] = [
  { id: 'numerology', name: 'נומרולוגיה', description: 'גימטריה + מספרי חיים', icon: <GiAbacus className="h-9 w-9" />, href: '/tools/numerology' },
  { id: 'astrology', name: 'אסטרולוגיה', description: 'מפת לידה + תחזיות', icon: <GiAstrolabe className="h-9 w-9" />, href: '/tools/astrology' },
  { id: 'graphology', name: 'גרפולוגיה', description: 'ניתוח כתב יד', icon: <GiQuillInk className="h-9 w-9" />, href: '/tools/graphology' },
  { id: 'drawing', name: 'ניתוח ציורים', description: 'בית-עץ-אדם', icon: <GiPaintBrush className="h-9 w-9" />, href: '/tools/drawing' },
  { id: 'palmistry', name: 'קריאה בכף יד', description: 'ניתוח כף יד', icon: <GiHandOfGod className="h-9 w-9" />, href: '/tools/palmistry' },
  { id: 'tarot', name: 'טארוט', description: 'קלפים + פרשנות AI', icon: <GiCardRandom className="h-9 w-9" />, href: '/tools/tarot' },
];

/** Props של רשת כלים */
export interface ToolGridProps {
  className?: string;
}

/** רשת 6 כלים עם hover effect מיסטי ולינקים */
export function ToolGrid({ className }: ToolGridProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-4', className)}>
      {TOOLS.map((tool) => (
        <Link key={tool.id} href={tool.href}>
          <motion.div {...hoverEffects.lift}>
            <div className={cn(
              'rounded-xl p-5 cursor-pointer h-full text-center space-y-3',
              'bg-gradient-to-br border transition-all duration-300',
              'hover:shadow-lg hover:shadow-primary-container/10',
              CATEGORY_COLORS[tool.id] ?? 'from-surface-container to-surface-container-low border-outline-variant/10'
            )}>
              <div className={cn(
                'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl',
                'mystic-icon-wrap',
                ICON_COLORS[tool.id] ?? 'text-primary'
              )}>
                {tool.icon}
              </div>
              <div>
                <h3 className="font-headline font-semibold text-on-surface text-sm">{tool.name}</h3>
                <p className="font-body text-xs text-on-surface-variant mt-1">{tool.description}</p>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
