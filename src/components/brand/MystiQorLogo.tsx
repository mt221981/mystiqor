'use client'

/**
 * MystiQorLogo — לוגו SVG inline עם שובל קוסמי וגרדיאנט סגול-זהב
 * שני variants: full (טקסט + סמל) ל-sidebar, icon (רק Q מעוצבת) ל-header
 */

import { cn } from '@/lib/utils'

/** Props של הלוגו */
interface MystiQorLogoProps {
  /** full = טקסט + סמל, icon = רק סמל */
  readonly variant?: 'full' | 'icon'
  /** גודל הלוגו */
  readonly size?: 'sm' | 'md' | 'lg'
  /** מחלקות נוספות */
  readonly className?: string
}

/** מידות לפי גודל */
const SIZES = {
  sm: { width: 52, height: 52, fontSize: 0 },
  md: { width: 293, height: 98, fontSize: 28 },
  lg: { width: 390, height: 130, fontSize: 36 },
} as const

/**
 * לוגו MystiQor — SVG inline עם gradient סגול-זהב וניצוצות
 * לא צריך PNG, לא צריך blend-mode, לא צריך mask
 */
export function MystiQorLogo({ variant = 'full', size = 'md', className }: MystiQorLogoProps) {
  if (variant === 'icon') {
    return <IconLogo size={size} className={className} />
  }
  return <FullLogo size={size} className={className} />
}

/** לוגו מלא — טקסט + ניצוצות */
function FullLogo({ size, className }: { size: 'sm' | 'md' | 'lg'; className?: string }) {
  const dims = SIZES[size]

  return (
    <svg
      viewBox="0 0 240 80"
      width={dims.width}
      height={dims.height}
      className={cn('select-none', className)}
      aria-label="MystiQor"
      role="img"
    >
      <defs>
        {/* גרדיאנט ראשי — סגול לזהב */}
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ddb8ff" />
          <stop offset="45%" stopColor="#8f2de6" />
          <stop offset="100%" stopColor="#d4a853" />
        </linearGradient>
        {/* גרדיאנט זוהר לניצוצות */}
        <radialGradient id="sparkle-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0c674" stopOpacity="1" />
          <stop offset="100%" stopColor="#d4a853" stopOpacity="0" />
        </radialGradient>
        {/* פילטר זוהר */}
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* שובל קוסמי — קו מתעקל מאחורי הטקסט */}
      <path
        d="M 20 55 Q 60 20, 120 40 Q 180 60, 230 30"
        fill="none"
        stroke="url(#logo-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M 15 58 Q 55 25, 115 42 Q 175 58, 225 28"
        fill="none"
        stroke="#d4a853"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.2"
      />

      {/* ניצוצות */}
      <circle cx="225" cy="28" r="2.5" fill="url(#sparkle-grad)" filter="url(#logo-glow)" />
      <circle cx="218" cy="24" r="1.5" fill="#f0c674" opacity="0.7" />
      <circle cx="230" cy="22" r="1" fill="#ddb8ff" opacity="0.5" />
      <circle cx="210" cy="32" r="1" fill="#f0c674" opacity="0.4" />
      <circle cx="22" cy="54" r="1.5" fill="#8f2de6" opacity="0.3" />

      {/* טקסט MystiQor */}
      <text
        x="120"
        y="52"
        textAnchor="middle"
        fontFamily="'Noto Sans Hebrew', 'Plus Jakarta Sans', sans-serif"
        fontSize={dims.fontSize}
        fontWeight="500"
        fill="url(#logo-grad)"
        filter="url(#logo-glow)"
        letterSpacing="2"
      >
        MystiQor
      </text>

      {/* כיתוב תחתי */}
      <text
        x="120"
        y="70"
        textAnchor="middle"
        fontFamily="'Heebo', sans-serif"
        fontSize="10"
        fontWeight="300"
        fill="#c4b8d6"
        opacity="0.7"
      >
        המסע המיסטי שלך
      </text>
    </svg>
  )
}

/** לוגו אייקון — Q מעוצבת עם ניצוצות */
function IconLogo({ size, className }: { size: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = size === 'sm' ? 28 : size === 'md' ? 36 : 44

  return (
    <svg
      viewBox="0 0 40 40"
      width={s}
      height={s}
      className={cn('select-none', className)}
      aria-label="MystiQor"
      role="img"
    >
      <defs>
        <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ddb8ff" />
          <stop offset="50%" stopColor="#8f2de6" />
          <stop offset="100%" stopColor="#d4a853" />
        </linearGradient>
        <filter id="icon-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Q מעוצבת */}
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="26"
        fontWeight="800"
        fill="url(#icon-grad)"
        filter="url(#icon-glow)"
      >
        Q
      </text>

      {/* ניצוצות */}
      <circle cx="32" cy="10" r="2" fill="#f0c674" opacity="0.8" />
      <circle cx="35" cy="14" r="1" fill="#ddb8ff" opacity="0.5" />
      <circle cx="29" cy="7" r="1" fill="#d4a853" opacity="0.4" />
    </svg>
  )
}
