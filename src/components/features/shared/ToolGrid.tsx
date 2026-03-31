/**
 * רשת כלים מיסטיים — 10 כלים עיקריים עם כרטיסים גדולים, אנימציות stagger ואייקונים בולטים
 */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { motion, useReducedMotion } from 'framer-motion';
import {
  GiAbacus,
  GiAstrolabe,
  GiQuillInk,
  GiPaintBrush,
  GiHandOfGod,
  GiCardRandom,
  GiDreamCatcher,
  GiBodyBalance,
  GiHearts,
  GiCrystalBall,
} from 'react-icons/gi';

/** הגדרת כלי */
interface Tool {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly href: string;
  readonly gradient: string;
  readonly iconColor: string;
}

/** 10 הכלים העיקריים */
const TOOLS: readonly Tool[] = [
  { id: 'astrology', name: 'אסטרולוגיה', description: 'מפת לידה + תחזיות כוכבים', icon: <GiAstrolabe className="h-12 w-12" />, href: '/tools/astrology', gradient: 'from-indigo-500/25 to-purple-500/10 border-indigo-400/20 hover:border-indigo-400/40', iconColor: 'text-indigo-300' },
  { id: 'tarot', name: 'טארוט', description: 'קלפים + פרשנות קבלית', icon: <GiCardRandom className="h-12 w-12" />, href: '/tools/tarot', gradient: 'from-violet-500/25 to-fuchsia-500/10 border-violet-400/20 hover:border-violet-400/40', iconColor: 'text-violet-300' },
  { id: 'numerology', name: 'נומרולוגיה', description: 'גימטריה + מספרי חיים', icon: <GiAbacus className="h-12 w-12" />, href: '/tools/numerology', gradient: 'from-purple-500/25 to-blue-500/10 border-purple-400/20 hover:border-purple-400/40', iconColor: 'text-purple-300' },
  { id: 'dream', name: 'חלומות', description: 'פירוש חלומות מיסטי', icon: <GiDreamCatcher className="h-12 w-12" />, href: '/tools/dream', gradient: 'from-blue-500/25 to-cyan-500/10 border-blue-400/20 hover:border-blue-400/40', iconColor: 'text-blue-300' },
  { id: 'palmistry', name: 'קריאה בכף יד', description: 'ניתוח קווי כף היד', icon: <GiHandOfGod className="h-12 w-12" />, href: '/tools/palmistry', gradient: 'from-rose-500/25 to-pink-500/10 border-rose-400/20 hover:border-rose-400/40', iconColor: 'text-rose-300' },
  { id: 'graphology', name: 'גרפולוגיה', description: 'ניתוח כתב יד', icon: <GiQuillInk className="h-12 w-12" />, href: '/tools/graphology', gradient: 'from-teal-500/25 to-cyan-500/10 border-teal-400/20 hover:border-teal-400/40', iconColor: 'text-teal-300' },
  { id: 'drawing', name: 'ניתוח ציורים', description: 'בית-עץ-אדם + קופיץ', icon: <GiPaintBrush className="h-12 w-12" />, href: '/tools/drawing', gradient: 'from-amber-500/25 to-orange-500/10 border-amber-400/20 hover:border-amber-400/40', iconColor: 'text-amber-300' },
  { id: 'human-design', name: 'עיצוב אנושי', description: '9 מרכזים + פרופיל', icon: <GiBodyBalance className="h-12 w-12" />, href: '/tools/human-design', gradient: 'from-emerald-500/25 to-green-500/10 border-emerald-400/20 hover:border-emerald-400/40', iconColor: 'text-emerald-300' },
  { id: 'compatibility', name: 'התאמה', description: 'בדוק התאמה בין שניים', icon: <GiHearts className="h-12 w-12" />, href: '/tools/compatibility', gradient: 'from-pink-500/25 to-rose-500/10 border-pink-400/20 hover:border-pink-400/40', iconColor: 'text-pink-300' },
  { id: 'coach', name: 'מאמן AI', description: 'שיחה עם המאמן האישי', icon: <GiCrystalBall className="h-12 w-12" />, href: '/coach', gradient: 'from-[#8f2de6]/25 to-[#d4a853]/10 border-primary/20 hover:border-primary/40', iconColor: 'text-primary' },
];

/** Props של רשת כלים */
export interface ToolGridProps {
  readonly className?: string;
}

/** רשת 10 כלים עם כרטיסים גדולים, אנימציות stagger ואייקונים בולטים */
export function ToolGrid({ className }: ToolGridProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5', className)}
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? {} : {
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {TOOLS.map((tool) => (
        <motion.div
          key={tool.id}
          variants={shouldReduceMotion ? {} : {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <Link href={tool.href}>
            <div className={cn(
              'rounded-2xl p-6 cursor-pointer h-full text-center space-y-4',
              'bg-gradient-to-br border transition-all duration-300',
              'hover:shadow-xl hover:shadow-primary-container/15 hover:-translate-y-1',
              tool.gradient,
            )}>
              <div className={cn(
                'mx-auto flex h-20 w-20 items-center justify-center rounded-2xl',
                'bg-surface-container/50 ring-1 ring-white/10',
                'transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(143,45,230,0.3)]',
                tool.iconColor,
              )}>
                {tool.icon}
              </div>
              <div>
                <h3 className="font-headline font-bold text-foreground text-lg">{tool.name}</h3>
                <p className="font-body text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
