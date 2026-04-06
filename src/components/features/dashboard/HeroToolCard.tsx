'use client';

/**
 * HeroToolCard — כרטיס כלי עם תמונת artwork בפורמט פורטרט
 * עיצוב מבוסס על המקור — aspect-[4/5], hover עם הרמה + זוהר
 */

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import type { PrimaryTool } from '@/lib/constants/tools';

/** מאפייני HeroToolCard */
interface HeroToolCardProps {
  /** הגדרת הכלי */
  readonly tool: PrimaryTool;
}

/** כרטיס כלי בגריד Hero */
export function HeroToolCard({ tool }: HeroToolCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Link href={tool.href}>
      <motion.div
        whileHover={shouldReduceMotion ? {} : { y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container/80 p-0.5 transition-all duration-300 hover:bg-surface-container-high/80 hover:shadow-xl hover:shadow-primary-container/15 group hover:-translate-y-1">
          <div className="w-full h-full relative flex items-center justify-center rounded-xl overflow-hidden">
            <Image
              src={tool.imagePath}
              alt={tool.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16.67vw"
            />
            {/* שכבת hover */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-white/5 transition-colors duration-300" />
            {/* שכבת דעיכה לשם כלי */}
            <div className="absolute inset-0 tool-card-fade" />
            {/* שם ותיאור הכלי */}
            <div className="absolute bottom-0 inset-x-0 px-2 pb-2 text-center">
              <p className="font-headline font-bold text-foreground text-xs sm:text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
                {tool.name}
              </p>
              <p className="font-body text-[10px] sm:text-xs text-muted-foreground mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight line-clamp-1">
                {tool.description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
