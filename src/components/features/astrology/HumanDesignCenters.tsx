'use client';

/**
 * ויזואליזציית SVG של 9 מרכזי Human Design
 * מציגה כל מרכז לפי מצבו: מוגדר (סגול) / פתוח (אפור) / לא מוגדר (צהוב)
 */

import type { ReactNode } from 'react';

// ===== קבועים =====

/** 9 מרכזי האנרגיה של Human Design — עמדות ב-SVG viewBox="0 0 500 500" */
const HD_CENTERS = [
  { id: 'head',         name: 'ראש',          x: 250, y: 50,  width: 60, height: 60, shape: 'triangle' as const },
  { id: 'ajna',         name: "אג'נה",         x: 250, y: 120, width: 60, height: 60, shape: 'triangle' as const },
  { id: 'throat',       name: 'גרון',          x: 250, y: 200, width: 50, height: 50, shape: 'square' as const },
  { id: 'g',            name: 'G / זהות',      x: 250, y: 270, width: 60, height: 60, shape: 'diamond' as const },
  { id: 'heart',        name: 'לב',            x: 170, y: 270, width: 50, height: 50, shape: 'triangle' as const },
  { id: 'sacral',       name: 'סקראל',         x: 250, y: 350, width: 60, height: 50, shape: 'square' as const },
  { id: 'spleen',       name: 'טחול',          x: 160, y: 330, width: 50, height: 50, shape: 'triangle' as const },
  { id: 'solar_plexus', name: 'מקלעת שמשית',   x: 340, y: 330, width: 50, height: 50, shape: 'triangle' as const },
  { id: 'root',         name: 'שורש',          x: 250, y: 430, width: 60, height: 50, shape: 'square' as const },
] as const;

/** צבעי מרכזים: מוגדר = סגול, פתוח = אפור בהיר, לא מוגדר = צהוב */
const CENTER_COLORS: Record<'defined' | 'open' | 'undefined', string> = {
  defined: '#7c3aed',
  open: '#e2e8f0',
  undefined: '#fef3c7',
};

// ===== טיפוסים =====

/** Props של קומפוננטת מרכזי Human Design */
export interface HumanDesignCentersProps {
  /** מזהי המרכזים המוגדרים (צבועים) */
  definedCenters: string[];
  /** מזהי המרכזים הפתוחים (מתאפשרים) */
  openCenters: string[];
  /** מזהי המרכזים הלא מוגדרים (ריקים) */
  undefinedCenters: string[];
}

// ===== קומפוננטה =====

/**
 * SVG ויזואליזציה של מרכזי Human Design — כולל מקרא צבעים
 */
export function HumanDesignCenters({ definedCenters, openCenters, undefinedCenters }: HumanDesignCentersProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 500 500" className="w-full max-w-sm" aria-label="מפת מרכזי Human Design">
        {HD_CENTERS.map((center) => {
          const state: 'defined' | 'open' | 'undefined' = definedCenters.includes(center.id)
            ? 'defined'
            : openCenters.includes(center.id)
            ? 'open'
            : 'undefined';
          const fill = CENTER_COLORS[state];
          const stroke = state === 'open' ? '#94a3b8' : 'transparent';
          const cx = center.x;
          const cy = center.y;
          const w = center.width;
          const h = center.height;

          let shape: ReactNode;
          if (center.shape === 'square') {
            shape = (
              <rect
                x={cx - w / 2} y={cy - h / 2}
                width={w} height={h}
                fill={fill} stroke={stroke} strokeWidth={2}
                rx={4}
              />
            );
          } else if (center.shape === 'diamond') {
            const hw = w / 2;
            const hh = h / 2;
            shape = (
              <polygon
                points={`${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`}
                fill={fill} stroke={stroke} strokeWidth={2}
              />
            );
          } else {
            // triangle — מצביע מטה
            shape = (
              <polygon
                points={`${cx},${cy + h / 2} ${cx - w / 2},${cy - h / 2} ${cx + w / 2},${cy - h / 2}`}
                fill={fill} stroke={stroke} strokeWidth={2}
              />
            );
          }

          return (
            <g
              key={center.id}
              role="img"
              aria-label={`${center.name}: ${state === 'defined' ? 'מוגדר' : state === 'open' ? 'פתוח' : 'לא מוגדר'}`}
            >
              {shape}
              <text
                x={cx} y={cy + 5}
                textAnchor="middle"
                fontSize="9"
                fill={state === 'defined' ? '#ffffff' : '#334155'}
                fontFamily="sans-serif"
              >
                {center.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* מקרא */}
      <div className="flex gap-4 text-xs text-muted-foreground" dir="rtl">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm inline-block" style={{ backgroundColor: CENTER_COLORS.defined }} />
          מוגדר
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm inline-block border" style={{ backgroundColor: CENTER_COLORS.open }} />
          פתוח
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm inline-block" style={{ backgroundColor: CENTER_COLORS.undefined }} />
          לא מוגדר
        </span>
      </div>
    </div>
  );
}
