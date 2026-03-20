/**
 * זיהוי מכשיר מובייל לפי רוחב מסך
 * מבוסס על matchMedia לביצועים אופטימליים — מגיב רק לשינויי breakpoint
 *
 * מקור: use-mobile.jsx — שופר עם TypeScript וסוג החזרה ברור
 */

import { useState, useEffect } from 'react';

/** נקודת שבירה למובייל — מתחת ל-768px נחשב מובייל */
const MOBILE_BREAKPOINT = 768;

/**
 * מחזיר האם המכשיר הנוכחי הוא מובייל לפי רוחב מסך
 * מאזין לשינויים ב-matchMedia ומתעדכן בזמן אמת
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );

    const onChange = () => setIsMobile(mql.matches);

    mql.addEventListener('change', onChange);
    // הגדרת ערך התחלתי
    setIsMobile(mql.matches);

    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
