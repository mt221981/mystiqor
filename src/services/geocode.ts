/**
 * שירות גיאוקודינג — ממיר שם עיר לקואורדינטות + אזור זמן
 * משתמש ב-Nominatim (OpenStreetMap) — חינמי, תומך בעברית
 * מוסיף: tz-lookup לאזור זמן, cache בזיכרון, timeout של 5 שניות
 * שירות זה הוא server-side only — לא לייבא בקומפוננטות לקוח
 */

import tzlookup from '@photostructure/tz-lookup'

/** תוצאת גיאוקודינג לעיר אחת — כולל אזור זמן IANA */
export interface GeocodingResult {
  /** שם מקום מלא כפי שמוחזר מ-Nominatim */
  display_name: string
  /** קו רוחב — ערך עשרוני */
  lat: number
  /** קו אורך — ערך עשרוני */
  lon: number
  /** קוד מדינה ISO דו-ספרתי (il, us, gb וכו') */
  country_code: string
  /** אזור זמן IANA — למשל 'Asia/Jerusalem', 'America/New_York' */
  timezone_name: string
}

/** מבנה תשובה גולמי מ-Nominatim API */
interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address: {
    country_code?: string
  }
}

// =========================================
// Cache בזיכרון — Map עם TTL של שעה
// =========================================

/** ערך מאוחסן ב-cache עם זמן תפוגה */
interface CacheEntry {
  results: GeocodingResult[]
  expiresAt: number
}

/** cache פנימי — מפתח הוא שם עיר מנורמל */
const geocodeCache = new Map<string, CacheEntry>()

/** זמן חיים של ערך ב-cache: שעה אחת */
const CACHE_TTL_MS = 60 * 60 * 1000

/** timeout לבקשת Nominatim: 5 שניות */
const REQUEST_TIMEOUT_MS = 5000

/**
 * מנקה ערכים שפג תוקפם מה-cache
 * נקרא באופן עצלני — רק כשמתבצע חיפוש חדש
 */
function pruneExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of geocodeCache) {
    if (entry.expiresAt <= now) {
      geocodeCache.delete(key)
    }
  }
}

/**
 * מחפש עיר בשמה ומחזיר עד 5 תוצאות עם קואורדינטות ואזור זמן
 * תומך בחיפוש בעברית ובאנגלית
 * כולל: cache בזיכרון, timeout של 5 שניות, lookup אזור זמן מקואורדינטות
 *
 * @param cityName - שם העיר לחיפוש (עברית או אנגלית)
 * @returns מערך של עד 5 תוצאות גיאוקודינג כולל timezone_name
 * @throws Error אם הבקשה לנומינטים נכשלה או עברה timeout
 */
export async function geocodeCity(cityName: string): Promise<GeocodingResult[]> {
  const trimmed = cityName.trim()
  if (!trimmed) {
    return []
  }

  // נרמול מפתח cache — lowercase ללא רווחים כפולים
  const cacheKey = trimmed.toLowerCase().replace(/\s+/g, ' ')

  // בדיקת cache — מחזיר ישירות אם יש ערך בתוקף
  const cached = geocodeCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results
  }

  // ניקוי עצלני של ערכים שפגו
  if (geocodeCache.size > 100) {
    pruneExpiredEntries()
  }

  // שליחת בקשה ל-Nominatim עם timeout של 5 שניות
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const encoded = encodeURIComponent(trimmed)
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&addressdetails=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MystiQor/1.0 (contact@mystiqor.com)',
        'Accept-Language': 'he,en',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`שגיאת גיאוקודינג: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as NominatimResult[]

    const results: GeocodingResult[] = data.map((item) => {
      const lat = parseFloat(item.lat)
      const lon = parseFloat(item.lon)

      // tz-lookup — ממיר קואורדינטות לאזור זמן IANA
      let timezone_name = 'Asia/Jerusalem' // ברירת מחדל לישראל
      try {
        timezone_name = tzlookup(lat, lon)
      } catch {
        // אם tz-lookup נכשל (נקודה בים וכו') — משאיר ברירת מחדל
        console.warn(`[Geocode] tz-lookup failed for ${lat},${lon} — defaulting to Asia/Jerusalem`)
      }

      return {
        display_name: item.display_name,
        lat,
        lon,
        country_code: item.address?.country_code ?? 'il',
        timezone_name,
      }
    })

    // שמירה ב-cache עם TTL של שעה
    geocodeCache.set(cacheKey, {
      results,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    return results
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('שגיאת גיאוקודינג: הבקשה חרגה מזמן המתנה (5 שניות)')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
