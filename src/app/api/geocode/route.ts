/**
 * API Route: Geocoding — חיפוש מיקום דרך Nominatim
 * GET /api/geocode?q=תל אביב
 * מחזיר עד 5 תוצאות כולל אזור זמן IANA
 */
import { NextResponse, type NextRequest } from 'next/server'
import { geocodeCity } from '@/services/geocode'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await geocodeCity(q)
    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'שגיאה בחיפוש מיקום'
    const isTimeout = message.includes('זמן המתנה')
    return NextResponse.json(
      { results: [], error: isTimeout ? 'חיפוש המיקום ארך זמן רב מדי. נסה שוב.' : 'שגיאה בחיפוש מיקום' },
      { status: isTimeout ? 504 : 500 }
    )
  }
}
