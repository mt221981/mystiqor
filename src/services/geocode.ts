/**
 * שירות גיאוקודינג — ממיר שם עיר לקואורדינטות
 * משתמש ב-Nominatim (OpenStreetMap) — חינמי, תומך בעברית
 * חשוב: דורש User-Agent לפי תנאי שימוש של Nominatim
 * שירות זה הוא server-side only — לא לייבא בקומפוננטות לקוח
 */

/** תוצאת גיאוקודינג לעיר אחת */
export interface GeocodingResult {
  /** שם מקום מלא כפי שמוחזר מ-Nominatim */
  display_name: string
  /** קו רוחב — ערך עשרוני */
  lat: number
  /** קו אורך — ערך עשרוני */
  lon: number
  /** קוד מדינה ISO דו-ספרתי (il, us, gb וכו') */
  country_code: string
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

/**
 * מחפש עיר בשמה ומחזיר עד 5 תוצאות ממוינות לפי רלוונטיות
 * תומך בחיפוש בעברית ובאנגלית
 *
 * @param cityName - שם העיר לחיפוש (עברית או אנגלית)
 * @returns מערך של עד 5 תוצאות גיאוקודינג
 * @throws Error אם הבקשה לנומינטים נכשלה
 */
export async function geocodeCity(cityName: string): Promise<GeocodingResult[]> {
  const trimmed = cityName.trim()
  if (!trimmed) {
    return []
  }

  const encoded = encodeURIComponent(trimmed)
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&addressdetails=1`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MasaPnima/1.0 (contact@masapnima.co.il)',
      'Accept-Language': 'he,en',
    },
  })

  if (!response.ok) {
    throw new Error(`שגיאת גיאוקודינג: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as NominatimResult[]

  return data.map((item) => ({
    display_name: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    country_code: item.address?.country_code ?? 'il',
  }))
}
