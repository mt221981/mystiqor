/**
 * סקריפט זריעת מאמרי בלוג — מאכלס blog_posts ב-3 מאמרים עשירים בעברית
 * הרצה: npx tsx mystiqor-build/scripts/seed-blog-posts.ts
 *
 * אלגוריתם:
 * 1. טוען BLOG_POSTS_SEED מהקונסטנטות
 * 2. מתחבר ל-Supabase עם service-role key (עוקף RLS)
 * 3. מבצע upsert עם onConflict: 'slug' — אידמפוטנטי לחלוטין
 * 4. מדווח: מספר מאמרים שנזרעו, שגיאות
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { BLOG_POSTS_SEED } from '../src/lib/constants/blog-data'

/** טוען משתני סביבה מ-.env.local */
function loadEnv(): void {
  try {
    const envContent = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
    for (const line of envContent.split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m?.[1] && m[2] !== undefined) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch {
    console.warn('⚠️  .env.local לא נמצא — מניח שמשתני הסביבה כבר מוגדרים')
  }
}

/**
 * זורע מאמרי בלוג לטבלת blog_posts ב-Supabase
 * upsert עם onConflict: 'slug' מבטיח אידמפוטנטיות
 */
async function seedBlogPosts(): Promise<void> {
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ חסרים: NEXT_PUBLIC_SUPABASE_URL ו/או SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  console.log(`📝 מתחיל זריעה של ${BLOG_POSTS_SEED.length} מאמרי בלוג...`)

  const { error } = await supabase
    .from('blog_posts')
    .upsert(BLOG_POSTS_SEED as Record<string, unknown>[], { onConflict: 'slug' })

  if (error) {
    console.error('❌ שגיאה בזריעת מאמרים:', error.message)
    process.exit(1)
  }

  console.log('\n📊 סיכום:')
  console.log(`  ✅ נזרעו: ${BLOG_POSTS_SEED.length} מאמרים`)
  for (const post of BLOG_POSTS_SEED) {
    console.log(`     - ${post.slug} (${post.category})`)
  }
  console.log('\n✨ הזריעה הושלמה בהצלחה!')
}

seedBlogPosts().catch((err: unknown) => {
  console.error('❌ שגיאה קריטית:', err)
  process.exit(1)
})
