/**
 * בדיקות לנתוני seed של בלוג — Wave 0 scaffold
 * מכסה: BLOG-02 (3 מאמרים מלאים עם תוכן עשיר)
 *
 * NOTE: בדיקות אלו יכשלו עד שתוכנית 02 תיצור את הקובץ blog-data.ts
 * זהו התנהגות Wave 0 צפויה
 */

import { describe, it, expect } from 'vitest';
import { BLOG_POSTS_SEED } from '@/lib/constants/blog-data';

describe('BLOG_POSTS_SEED', () => {
  /** Test 1: יש בדיוק 3 מאמרים */
  it('has exactly 3 articles', () => {
    expect(BLOG_POSTS_SEED).toHaveLength(3);
  });

  /** Test 2: כל מאמר מכיל את השדות הנדרשים */
  it('each article has required fields', () => {
    for (const post of BLOG_POSTS_SEED) {
      // slug — מחרוזת לא ריקה
      expect(typeof post.slug).toBe('string');
      expect(post.slug.length).toBeGreaterThan(0);

      // title — מחרוזת לא ריקה
      expect(typeof post.title).toBe('string');
      expect(post.title.length).toBeGreaterThan(0);

      // content — מחרוזת ארוכה (לפחות 800 תווים)
      expect(typeof post.content).toBe('string');
      expect(post.content.length).toBeGreaterThanOrEqual(800);

      // category — מחרוזת לא ריקה
      expect(typeof post.category).toBe('string');
      expect(post.category.length).toBeGreaterThan(0);

      // author — חייב להיות MystiQor
      expect(post.author).toBe('MystiQor');

      // is_published — חייב להיות true
      expect(post.is_published).toBe(true);

      // read_time_minutes — מספר לפחות 1
      expect(typeof post.read_time_minutes).toBe('number');
      expect(post.read_time_minutes).toBeGreaterThanOrEqual(1);

      // excerpt — מחרוזת
      expect(typeof post.excerpt).toBe('string');

      // tags — מערך עם לפחות תגית אחת
      expect(Array.isArray(post.tags)).toBe(true);
      expect(post.tags.length).toBeGreaterThanOrEqual(1);
    }
  });

  /** Test 3: slug-ים ייחודיים */
  it('slugs are unique', () => {
    const slugs = BLOG_POSTS_SEED.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(BLOG_POSTS_SEED.length);
  });

  /** Test 4: תוכן Markdown תקין עם כותרת אחת לפחות */
  it('content is valid Markdown with at least one heading', () => {
    for (const post of BLOG_POSTS_SEED) {
      const hasHeading = post.content
        .split('\n')
        .some((line) => line.startsWith('#'));
      expect(hasHeading).toBe(true);
    }
  });
});
