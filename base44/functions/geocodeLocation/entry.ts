import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * פונקציה להמרת שם מקום לקואורדינטות גיאוגרפיות (lat/lon) + timezone
 * משתמשת ב-geocoding API חינמי של OpenStreetMap Nominatim
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { location_name } = await req.json();

    if (!location_name) {
      return Response.json({ 
        error: 'Missing location_name' 
      }, { status: 400 });
    }

    // שימוש ב-Nominatim של OpenStreetMap (חינמי)
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location_name)}&limit=1`;
    
    const response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'MasaPnima/1.0' // Nominatim דורש User-Agent
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return Response.json({
        success: false,
        error: 'Location not found',
        message: 'לא הצלחנו למצוא את המיקום. נסה להזין עיר ומדינה (למשל: תל אביב, ישראל)'
      }, { status: 404 });
    }

    const location = results[0];
    const latitude = parseFloat(location.lat);
    const longitude = parseFloat(location.lon);

    // קבלת timezone offset באמצעות TimeZoneDB API (או הערכה לפי longitude)
    // הערכה פשוטה: כל 15 מעלות = שעה אחת
    // לדיוק מלא צריך API של timezone, אבל זה די טוב לרוב המקרים
    let timezoneOffsetSeconds = Math.round(longitude / 15) * 3600;
    
    // אם זה ישראל, נתן +2 (UTC+2 בחורף, +3 בקיץ)
    if (location.display_name.includes('Israel') || location.display_name.includes('ישראל')) {
      timezoneOffsetSeconds = 2 * 3600; // UTC+2
    }

    return Response.json({
      success: true,
      location_name: location.display_name,
      latitude: latitude,
      longitude: longitude,
      formatted_address: location.display_name,
      timezone_offset_seconds: timezoneOffsetSeconds
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});