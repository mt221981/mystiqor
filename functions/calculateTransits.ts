import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Calculate current planetary transits to a natal chart
 * Returns the current positions of planets and how they aspect the natal chart
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { natal_chart, target_date } = body;

    if (!natal_chart || !natal_chart.planets) {
      return Response.json({ 
        error: 'Missing natal_chart or natal_chart.planets' 
      }, { status: 400 });
    }

    // Calculate current planetary positions for target_date
    const targetDateTime = target_date ? new Date(target_date) : new Date();
    
    // Use a simple ephemeris calculation (simplified for demo)
    // In production, you'd use Swiss Ephemeris or similar
    const currentPlanets = {
      Sun: { sign: 'Scorpio', longitude: 225 + (targetDateTime.getDate() * 0.98) },
      Moon: { sign: 'Pisces', longitude: 345 + (targetDateTime.getHours() * 12) },
      Mercury: { sign: 'Scorpio', longitude: 220 + (targetDateTime.getDate() * 1.2) },
      Venus: { sign: 'Sagittarius', longitude: 250 + (targetDateTime.getDate() * 0.8) },
      Mars: { sign: 'Leo', longitude: 135 + (targetDateTime.getDate() * 0.5) },
      Jupiter: { sign: 'Gemini', longitude: 75 + (targetDateTime.getMonth() * 2.5) },
      Saturn: { sign: 'Pisces', longitude: 345 + (targetDateTime.getMonth() * 0.8) },
      Uranus: { sign: 'Taurus', longitude: 50 + (targetDateTime.getFullYear() - 2020) * 4 },
      Neptune: { sign: 'Pisces', longitude: 355 + (targetDateTime.getFullYear() - 2020) * 1.5 },
      Pluto: { sign: 'Capricorn', longitude: 295 + (targetDateTime.getFullYear() - 2020) * 1 }
    };

    // Calculate transits (aspects between current planets and natal planets)
    const transits = [];
    const aspectTypes = [
      { name: 'Conjunction', angle: 0, orb: 8, strength_base: 1.0 },
      { name: 'Opposition', angle: 180, orb: 8, strength_base: 0.9 },
      { name: 'Trine', angle: 120, orb: 8, strength_base: 0.8 },
      { name: 'Square', angle: 90, orb: 7, strength_base: 0.85 },
      { name: 'Sextile', angle: 60, orb: 6, strength_base: 0.7 }
    ];

    Object.entries(currentPlanets).forEach(([transitingPlanet, transitingData]) => {
      natal_chart.planets.forEach(natalPlanet => {
        const angleDiff = Math.abs(transitingData.longitude - (natalPlanet.longitude || 0));
        const normalizedDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;

        for (const aspectType of aspectTypes) {
          const orb = Math.abs(normalizedDiff - aspectType.angle);
          if (orb <= aspectType.orb) {
            const strength = aspectType.strength_base * (1 - (orb / aspectType.orb) * 0.3);
            transits.push({
              transiting_planet: transitingPlanet,
              transiting_sign: transitingData.sign,
              natal_planet: natalPlanet.name,
              natal_sign: natalPlanet.sign,
              natal_house: natalPlanet.house,
              aspect_type: aspectType.name,
              orb: orb.toFixed(2),
              strength: strength.toFixed(3),
              is_exact: orb < 1,
              is_applying: true // simplified
            });
            break;
          }
        }
      });
    });

    // Sort by strength
    transits.sort((a, b) => parseFloat(b.strength) - parseFloat(a.strength));

    // Check special conditions
    const specialConditions = {
      mercury_retrograde: false, // Would calculate based on actual ephemeris
      void_of_course_moon: false,
      eclipse_season: false
    };

    return Response.json({
      target_date: targetDateTime.toISOString(),
      transiting_planets: currentPlanets,
      transits: transits,
      special_conditions: specialConditions,
      transit_count: transits.length
    });

  } catch (error) {
    console.error('Error calculating transits:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});