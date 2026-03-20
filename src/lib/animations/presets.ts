/**
 * פריסטים לאנימציות - GEM 11
 * אנימציות framer-motion לשימוש חוזר ברחבי האפליקציה
 * ערכים מדויקים מ-AdvancedAnimations.jsx
 */

import type { Variants, Transition } from 'framer-motion';

// ===== ממשקי טיפוסים =====

/** הגדרת אנימציה עם מצבי initial, animate, exit */
interface AnimationPreset {
  readonly initial: Record<string, number>;
  readonly animate: Record<string, number>;
  readonly exit: Record<string, number>;
  readonly transition?: Transition;
}

/** הגדרת אפקט hover */
interface HoverEffect {
  readonly whileHover: Record<string, number | string | Transition> & {
    readonly transition?: Transition;
  };
}

// ===== אנימציות =====

/**
 * אוסף פריסטים לאנימציות כניסה/יציאה
 * ערכים מקוריים מ-AdvancedAnimations.jsx
 */
export const animations = {
  /** הופעה הדרגתית */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  /** הופעה הדרגתית מלמטה למעלה */
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  /** הופעה הדרגתית מלמעלה למטה */
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  /** החלקה מימין (RTL: מכיוון ההתחלה) */
  slideInRight: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },

  /** החלקה משמאל (RTL: מכיוון הסוף) */
  slideInLeft: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },

  /** הגדלה הדרגתית */
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },

  /** הגדלה עם קפיץ */
  scaleInBounce: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 15 } as Transition,
  },

  /** סיבוב בכניסה */
  rotateIn: {
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 180, opacity: 0 },
  },

  /** קונטיינר עם אנימציית stagger לילדים */
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as Variants,

  /** אלמנט ילד ב-stagger */
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  } as Variants,
} as const;

// ===== מעברים =====

/**
 * פריסטים למעברים (transitions)
 * ערכים מקוריים מ-AdvancedAnimations.jsx
 */
export const transitions = {
  /** מעבר חלק סטנדרטי */
  smooth: { duration: 0.3, ease: 'easeInOut' } as Transition,

  /** מעבר קפיצי */
  spring: { type: 'spring', stiffness: 300, damping: 30 } as Transition,

  /** מעבר קפיצי עם bounce */
  bouncy: { type: 'spring', stiffness: 400, damping: 10 } as Transition,

  /** מעבר איטי */
  slow: { duration: 0.6, ease: 'easeInOut' } as Transition,

  /** מעבר מהיר */
  fast: { duration: 0.15, ease: 'easeOut' } as Transition,
} as const;

// ===== אפקטי ריחוף =====

/**
 * אפקטי hover לאלמנטים אינטראקטיביים
 * ערכים מקוריים מ-AdvancedAnimations.jsx
 */
export const hoverEffects = {
  /** הרמה קלה */
  lift: {
    whileHover: { y: -4, transition: { duration: 0.2 } },
  },

  /** הגדלה קלה */
  scale: {
    whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  },

  /** זוהר סגול */
  glow: {
    whileHover: {
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
      transition: { duration: 0.3 },
    },
  },
} as const;

// ===== טיפוסי ייצוא =====

export type AnimationPresetKey = keyof typeof animations;
export type TransitionPresetKey = keyof typeof transitions;
export type HoverEffectKey = keyof typeof hoverEffects;
