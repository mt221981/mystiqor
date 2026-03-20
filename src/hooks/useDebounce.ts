/**
 * GEM — hooks לויסות קצב עדכונים
 * useDebounce: מעדכן רק אחרי שהערך הפסיק להשתנות למשך delay
 * useThrottle: מגביל עדכונים לפעם אחת בכל interval
 *
 * מקור: useDebounce.jsx — שופר עם TypeScript generics וטיפוח קוד
 */

import { useState, useEffect, useRef } from 'react';

/**
 * מחזיר ערך שמתעדכן רק אחרי שהקלט הפסיק להשתנות למשך delay
 * שימושי לחיפוש, שמירה אוטומטית, וקריאות API
 *
 * @param value - הערך לעקיבה
 * @param delay - זמן המתנה במילישניות (ברירת מחדל: 500)
 * @returns הערך המעוכב
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * מחזיר ערך שמתעדכן לכל היותר פעם אחת בכל interval
 * שימושי לאירועי scroll, resize, ועדכוני UI תכופים
 *
 * @param value - הערך לעקיבה
 * @param interval - פרק זמן מינימלי בין עדכונים במילישניות (ברירת מחדל: 500)
 * @returns הערך המווסת
 */
export function useThrottle<T>(value: T, interval = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - lastRan.current;
    const remaining = Math.max(0, interval - elapsed);

    const handler = setTimeout(() => {
      setThrottledValue(value);
      lastRan.current = Date.now();
    }, remaining);

    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);

  return throttledValue;
}
