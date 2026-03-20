/**
 * רשת כלים — מציגה 6 כלים מיסטיים עם אייקונים ו-hover effects
 */
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
  gradient: string;
}

/** רשימת הכלים */
const TOOLS: Tool[] = [
  { id: 'numerology', name: 'נומרולוגיה', description: 'גימטריה + מספרי חיים', icon: <Hash className="h-8 w-8" />, href: '/tools/numerology', gradient: 'from-violet-600 to-purple-600' },
  { id: 'astrology', name: 'אסטרולוגיה', description: 'מפת לידה + תחזיות', icon: <Stars className="h-8 w-8" />, href: '/tools/astrology', gradient: 'from-indigo-600 to-blue-600' },
  { id: 'graphology', name: 'גרפולוגיה', description: 'ניתוח כתב יד', icon: <PenTool className="h-8 w-8" />, href: '/tools/graphology', gradient: 'from-emerald-600 to-teal-600' },
  { id: 'drawing', name: 'ניתוח ציורים', description: 'HTP + Koppitz', icon: <Palette className="h-8 w-8" />, href: '/tools/drawing', gradient: 'from-orange-600 to-amber-600' },
  { id: 'palmistry', name: 'כירומנטיה', description: 'ניתוח כף יד', icon: <Hand className="h-8 w-8" />, href: '/tools/palmistry', gradient: 'from-rose-600 to-pink-600' },
  { id: 'tarot', name: 'טארוט', description: 'קלפים + פרשנות AI', icon: <Layers className="h-8 w-8" />, href: '/tools/tarot', gradient: 'from-cyan-600 to-sky-600' },
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
            <Card className="h-full border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center space-y-3">
                <div className={cn(
                  'mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                  tool.gradient
                )}>
                  {tool.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
