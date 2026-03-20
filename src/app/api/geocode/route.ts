/**
 * API Route: Geocoding — חיפוש מיקום דרך Nominatim
 * GET /api/geocode?q=תל אביב
 */
import { NextResponse, type NextRequest } from 'next/server';
import { geocodeCity } from '@/services/geocode';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await geocodeCity(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: 'שגיאה בחיפוש מיקום' }, { status: 500 });
  }
}
