/**
 * בונה הקשר לאימון — מרכז נתוני משתמש לפרומפט מערכת מדויק
 * מביא פרופיל, ניתוחים, מטרות ומצב רוח במקביל וסוכם אותם בעברית
 *
 * מדוע: המאמן צריך להכיר את המשתמש — נתוני אסטרולוגיה, נומרולוגיה,
 * מטרות פעילות ומגמת מצב הרוח — בפורמט קומפקטי שמתאים לחלון הקשר של ה-LLM.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * בונה מחרוזת הקשר קומפקטית (מתחת ל-2000 טוקן) עבור המאמן ה-AI
 * מביא נתוני פרופיל, ניתוחים, מטרות ומצב רוח במקביל
 *
 * @param userId - מזהה המשתמש
 * @param supabase - קליינט Supabase (שרת) — generic לתמיכה בשני סוגי Database
 * @returns מחרוזת הקשר בעברית
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildCoachingContext(userId: string, supabase: SupabaseClient<any>): Promise<string> {
  // שליפת כל הנתונים במקביל — פרופיל, ניתוחים, מטרות ומצב רוח
  const [profileResult, analysesResult, goalsResult, moodResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, birth_date, birth_time, gender')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('analyses')
      .select('tool_type, results, summary, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('goals')
      .select('title, status, category, progress')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(10),
    supabase
      .from('mood_entries')
      .select('mood_score, energy_level, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(14),
  ])

  const sections: string[] = []

  // ===== פרטי המשתמש =====
  if (profileResult.data) {
    const profile = profileResult.data as {
      full_name?: string | null
      birth_date?: string | null
      gender?: string | null
    }
    const parts: string[] = []
    if (profile.full_name) parts.push(`שם: ${profile.full_name}`)
    if (profile.birth_date) parts.push(`תאריך לידה: ${profile.birth_date}`)
    if (profile.gender) parts.push(`מגדר: ${profile.gender}`)
    if (parts.length > 0) {
      sections.push(`### פרטי המשתמש\n${parts.join('\n')}`)
    }
  }

  // ===== ניתוחים אחרונים =====
  if (analysesResult.data && (analysesResult.data as unknown[]).length > 0) {
    const analysisParts: string[] = []

    for (const rawAnalysis of analysesResult.data as unknown[]) {
      const analysis = rawAnalysis as {
        tool_type?: string | null
        results?: Record<string, unknown> | null
        summary?: string | null
      }
      const toolType = analysis.tool_type ?? 'unknown'
      let line = `- ${toolType}`

      // עבור אסטרולוגיה — חולצים שמש/ירח/עולה
      if (toolType === 'astrology' && analysis.results) {
        try {
          const results = analysis.results
          const chart = results.chart as Record<string, unknown> | undefined
          const sunSign = (results.sun_sign ?? chart?.sun_sign) as string | undefined
          const moonSign = (results.moon_sign ?? chart?.moon_sign) as string | undefined
          const rising = (results.ascending ?? results.ascendant ?? chart?.rising_sign) as string | undefined
          const astroParts: string[] = []
          if (sunSign) astroParts.push(`שמש ב${sunSign}`)
          if (moonSign) astroParts.push(`ירח ב${moonSign}`)
          if (rising) astroParts.push(`עולה ב${rising}`)
          if (astroParts.length > 0) line += ` (${astroParts.join(', ')})`
        } catch {
          // ממשיכים בלי נתוני אסטרולוגיה ספציפיים
        }
      }

      // עבור נומרולוגיה — חולצים מסלול חיים
      if (toolType === 'numerology' && analysis.results) {
        try {
          const results = analysis.results
          const lifePath = (
            (results.life_path as Record<string, unknown>)?.number ??
            ((results.calculation as Record<string, unknown>)?.life_path as Record<string, unknown>)?.number
          ) as number | undefined
          if (lifePath !== undefined) line += ` (מסלול חיים: ${lifePath})`
        } catch {
          // ממשיכים בלי נתוני נומרולוגיה ספציפיים
        }
      }

      if (analysis.summary) line += `: ${analysis.summary}`
      analysisParts.push(line)
    }

    if (analysisParts.length > 0) {
      sections.push(`### ניתוחים אחרונים\n${analysisParts.join('\n')}`)
    }
  }

  // ===== יעדים פעילים =====
  if (goalsResult.data && (goalsResult.data as unknown[]).length > 0) {
    const goalLines = (goalsResult.data as unknown[]).map((rawGoal) => {
      const goal = rawGoal as { title?: string | null; category?: string | null; progress?: number | null }
      return `- ${goal.title ?? 'יעד'} (קטגוריה: ${goal.category ?? 'כללי'}, התקדמות: ${goal.progress ?? 0}%)`
    })
    sections.push(`### יעדים פעילים\n${goalLines.join('\n')}`)
  }

  // ===== מגמת מצב רוח =====
  if (moodResult.data && (moodResult.data as unknown[]).length > 0) {
    const entries = moodResult.data as unknown[]
    const scores = entries
      .map((e) => (e as { mood_score?: number | null }).mood_score)
      .filter((s): s is number => s !== null && s !== undefined)

    if (scores.length > 0) {
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
      const avgRounded = Math.round(avg * 10) / 10

      // חישוב כיוון מגמה — השוואה בין חצי ראשון לשני
      let trend = 'יציב'
      if (scores.length >= 4) {
        const half = Math.floor(scores.length / 2)
        const firstHalf = scores.slice(half)
        const secondHalf = scores.slice(0, half)
        const firstAvg = firstHalf.reduce((s, n) => s + n, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((s, n) => s + n, 0) / secondHalf.length
        if (secondAvg - firstAvg > 0.5) trend = 'עולה'
        else if (firstAvg - secondAvg > 0.5) trend = 'יורד'
      }

      sections.push(`### מגמת מצב רוח (14 ימים)\nממוצע: ${avgRounded}/10 | מגמה: ${trend}`)
    }
  }

  // אם אין נתונים כלל — מחזירים הקשר ריק
  if (sections.length === 0) {
    return 'אין נתונים זמינים עדיין.'
  }

  return sections.join('\n\n')
}
