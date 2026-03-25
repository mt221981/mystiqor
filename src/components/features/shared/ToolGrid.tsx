/**
 * רשת כלים — מציגה 6 כלים מיסטיים עם אייקונים ו-hover effects
 */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { hoverEffects } from '@/lib/animations/presets';
import { motion } from 'framer-motion';
import { Hash, Stars, PenTool, Palette, Hand, Layers } from 'lucide-react';

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
  { id: 'numerology', name: 'נומרולוגיה', description: 'גימטריה + מספרי חיים', icon: <Hash className="h-8 w-8" />, href: '/tools/numerology' },
  { id: 'astrology', name: 'אסטרולוגיה', description: 'מפת לידה + תחזיות', icon: <Stars className="h-8 w-8" />, href: '/tools/astrology' },
  { id: 'graphology', name: 'גרפולוגיה', description: 'ניתוח כתב יד', icon: <PenTool className="h-8 w-8" />, href: '/tools/graphology' },
  { id: 'drawing', name: 'ניתוח ציורים', description: 'HTP + Koppitz', icon: <Palette className="h-8 w-8" />, href: '/tools/drawing' },
  { id: 'palmistry', name: 'קריאה בכף יד', description: 'ניתוח כף יד', icon: <Hand className="h-8 w-8" />, href: '/tools/palmistry' },
  { id: 'tarot', name: 'טארוט', description: 'קלפים + פרשנות AI', icon: <Layers className="h-8 w-8" />, href: '/tools/tarot' },
];

/** Props של רשת כלים */
export interface ToolGridProps {
  className?: string;
}

/** רשת 6 כלים עם hover effect ולינקים */
export function ToolGrid({ className }: ToolGridProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-4', className)}>
      {TOOLS.map((tool) => (
        <Link key={tool.id} href={tool.href}>
          <motion.div {...hoverEffects.lift}>
            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/5 hover:border-primary/20 transition-colors cursor-pointer h-full text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-container/10 text-primary">
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
