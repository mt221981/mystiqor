/**
 * usage-guard — בדיקת מכסת שימוש וסטטוס מנוי לפני קריאת LLM
 * STAB-01: חוסם גישה לפני שניגש ל-OpenAI — חוסך עלויות ומגן על המשתמש
 *
 * חשוב: קורא ישירות לטבלת subscriptions ב-Supabase — לא ל-/api/subscription/usage
 * (קריאת שרת-לשרת מיותרת כשיש גישה ישירה ל-DB)
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

/** תוצאת בדיקת מכסת שימוש — discriminated union */
export type UsageGuardResult =
  | { allowed: true }
  | { allowed: false; response: ReturnType<typeof NextResponse.json> }

/**
 * בודק אם המשתמש רשאי לבצע ניתוח נוסף — מכסה ומנוי פעיל
 *
 * לוגיקה:
 * 1. שולף שורת מנוי מ-DB לפי user_id
 * 2. בודק שהמנוי קיים
 * 3. בודק שהסטטוס הוא 'active' או 'trial'
 * 4. בודק שלא נוצלה המכסה (analyses_used < analyses_limit; -1 = ללא הגבלה)
 *
 * @param supabase - קליינט Supabase בצד השרת (מ-createClient בכל route)
 * @param userId - מזהה המשתמש המאומת
 * @returns { allowed: true } אם מותר, או { allowed: false, response } לשליחה חזרה
 */
export async function checkUsageQuota(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UsageGuardResult> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type, status, analyses_used, analyses_limit')
    .eq('user_id', userId)
    .single()

  // מנוי לא נמצא — משתמש חדש שלא עבר onboarding, או free tier ללא שורת מנוי
  // מאפשרים גישה כדי לא לחסום משתמשים חדשים
  if (!sub) {
    return { allowed: true }
  }

  // מנוי לא פעיל — בוטל, פג, בפיגור
  const activeStatuses = ['active', 'trial'] as const
  type ActiveStatus = typeof activeStatuses[number]
  if (!activeStatuses.includes(sub.status as ActiveStatus)) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'המנוי שלך אינו פעיל — אנא חדש אותו כדי להמשיך' },
        { status: 402 }
      ),
    }
  }

  // מכסה נוצלה — analyses_limit === -1 פירושו ללא הגבלה (premium/enterprise)
  if (sub.analyses_limit !== -1 && sub.analyses_used >= sub.analyses_limit) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: `הגעת למגבלת ${sub.analyses_limit} ניתוחים לחודש זה — שדרג את המנוי כדי להמשיך`,
        },
        { status: 429 }
      ),
    }
  }

  return { allowed: true }
}
