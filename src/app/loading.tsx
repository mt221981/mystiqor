/**
 * מסך טעינה גלובלי — מוצג בזמן ניווט בין דפים
 * משתמש ב-framer-motion לאנימציית ספינר חלקה
 */

'use client';

import { motion } from 'framer-motion';

/** מסך טעינה מרכזי עם ספינר מונפש וטקסט בעברית */
export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      {/* ספינר מסתובב עם גרדיאנט סגול */}
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-muted border-t-primary"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* טקסט טעינה עם אנימציית הבהוב */}
      <motion.p
        className="text-lg font-medium text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        טוען...
      </motion.p>
    </div>
  );
}
