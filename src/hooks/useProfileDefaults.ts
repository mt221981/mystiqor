'use client'

/**
 * Hook לברירות מחדל לטפסים ממולאות מפרופיל המשתמש
 * שולף פרופיל פעם אחת ומשתף דרך React Query cache לכל הכלים
 */

import { useQuery } from '@tanstack/react-query'
import { CACHE_TIMES, queryKeys } from '@/lib/query/cache-config'

// ===== ממשקים =====

/** ממשק פרופיל גולמי מה-API (שמות עמודות DB) */
interface ProfileApiData {
  full_name: string
  birth_date: string
  birth_time: string | null
  birth_place: string | null
  latitude: number | null
  longitude: number | null
}

/** ברירות מחדל לטפסים ממולאות מפרופיל המשתמש */
export interface ProfileDefaults {
  /** שם מלא מהפרופיל — ריק אם חסר */
  fullName: string
  /** תאריך לידה בפורמט YYYY-MM-DD — ריק אם חסר */
  birthDate: string
  /** שעת לידה בפורמט HH:mm — '12:00' כברירת מחדל אם חסר */
  birthTime: string
  /** קו רוחב — null אם חסר */
  latitude: number | null
  /** קו אורך — null אם חסר */
  longitude: number | null
  /** מקום לידה (טקסט) — ריק אם חסר */
  birthPlace: string
}

// ===== פונקציית שליפה =====

/**
 * שולפת פרופיל משתמש מה-API
 */
async function fetchProfile(): Promise<ProfileApiData> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('שגיאה בשליפת פרופיל')
  const json = (await res.json()) as { data: ProfileApiData }
  return json.data
}

// ===== Hook =====

/**
 * שולף את פרופיל המשתמש ומחזיר ברירות מחדל מוכנות לשימוש ב-values: של useForm
 * מטרה: מילוי אוטומטי של שדות שם, תאריך לידה, שעת לידה ומיקום בטפסי הכלים
 * השאילתה משותפת ומועברת cache — קריאת API אחת בלבד, גם כשמרובים כלים פתוחים
 *
 * @returns defaults — ברירות מחדל מוכנות, או undefined בזמן טעינה
 * @returns isLoading — true עד שהנתונים חוזרים
 */
export function useProfileDefaults(): { defaults: ProfileDefaults | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: fetchProfile,
    retry: false,
    staleTime: CACHE_TIMES.LONG,
  })

  if (!data) return { defaults: undefined, isLoading }

  return {
    defaults: {
      fullName: data.full_name ?? '',
      birthDate: data.birth_date ?? '',
      birthTime: data.birth_time ?? '12:00',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      birthPlace: data.birth_place ?? '',
    },
    isLoading,
  }
}
