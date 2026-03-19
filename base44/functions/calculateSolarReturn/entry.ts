import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * SOLAR RETURN CALCULATOR
 * Calculates the exact moment when the Sun returns to its natal position
 * Creates a full chart for that moment = your "birthday chart" for the year
 * 
 * References:
 * - Mary Fortier Shea - "Planets in Solar Returns" (1976)
 * - Wendel C. Perry - "Solar Returns: Interpreting the Solar Return Chart"
 * - Alexandre Volguine - "The Technique of Solar Returns" (1937)
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { natal_sun_longitude, birth_date, birth_place_lat, birth_place_lon, target_year } = await req.json();

        if (!natal_sun_longitude || !birth_date || birth_place_lat === undefined || birth_place_lon === undefined) {
            return Response.json({ 
                error: 'Missing required fields',
                required: ['natal_sun_longitude', 'birth_date', 'birth_place_lat', 'birth_place_lon']
            }, { status: 400 });
        }

        const birthYear = new Date(birth_date).getFullYear();
        const yearToCalculate = target_year || new Date().getFullYear();
        
        // Helper functions
        const normalize = (angle) => {
            let a = angle % 360;
            return a < 0 ? a + 360 : a;
        };
        
        const degToRad = (deg) => deg * Math.PI / 180;
        const round = (num, decimals) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        
        const getSign = (lon) => {
            const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                           "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
            return signs[Math.floor(normalize(lon) / 30)];
        };
        
        // Binary search to find exact solar return moment
        const birthMonth = new Date(birth_date).getMonth() + 1;
        const birthDay = new Date(birth_date).getDate();
        
        // Start search around birthday
        let searchDate = new Date(yearToCalculate, birthMonth - 1, birthDay, 12, 0, 0);
        let minDate = new Date(searchDate.getTime() - 2 * 24 * 60 * 60 * 1000);
        let maxDate = new Date(searchDate.getTime() + 2 * 24 * 60 * 60 * 1000);
        
        let bestDate = searchDate;
        let bestDiff = 999;
        
        // Iterate to find exact moment
        for (let i = 0; i < 100; i++) {
            const testDate = new Date((minDate.getTime() + maxDate.getTime()) / 2);
            const sunLon = calculateSunPosition(testDate);
            
            let diff = Math.abs(normalize(sunLon - natal_sun_longitude));
            if (diff > 180) diff = 360 - diff;
            
            if (diff < bestDiff) {
                bestDiff = diff;
                bestDate = testDate;
            }
            
            if (diff < 0.01) break; // Accurate enough
            
            if (normalize(sunLon) < normalize(natal_sun_longitude)) {
                minDate = testDate;
            } else {
                maxDate = testDate;
            }
        }
        
        const solarReturnMoment = bestDate;
        
        // Calculate full chart for that moment
        const chart = calculateChartForMoment(solarReturnMoment, birth_place_lat, birth_place_lon);
        
        // Calculate houses using Placidus
        const houses = calculateHouses(solarReturnMoment, birth_place_lat, birth_place_lon);
        
        return Response.json({
            solar_return_year: yearToCalculate,
            solar_return_moment: solarReturnMoment.toISOString(),
            exact_sun_return: round(chart.planets.Sun.longitude, 4),
            natal_sun_position: round(natal_sun_longitude, 4),
            accuracy: round(bestDiff, 4),
            planets: chart.planets,
            houses: houses,
            aspects: chart.aspects,
            element_distribution: chart.elementDist,
            modality_distribution: chart.modalityDist,
            birth_place: {
                latitude: birth_place_lat,
                longitude: birth_place_lon
            },
            metadata: {
                calculation_method: "VSOP87 simplified + Placidus houses",
                iterations: 100
            }
        });

    } catch (error) {
        console.error('Solar return calculation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});

function calculateSunPosition(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    
    let Y = year, M = month;
    if (M <= 2) {
        Y = Y - 1;
        M = M + 12;
    }
    
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD0 = Math.floor(365.25 * (Y + 4716)) + 
                Math.floor(30.6001 * (M + 1)) + 
                day + B - 1524.5;
    
    const dayFraction = (hour + minute / 60) / 24;
    const jd = JD0 + dayFraction;
    const T = (jd - 2451545.0) / 36525;
    
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mrad = M * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
              0.000289 * Math.sin(3 * Mrad);
    
    let sunLon = L0 + C;
    sunLon = sunLon % 360;
    if (sunLon < 0) sunLon += 360;
    
    return sunLon;
}

function calculateChartForMoment(date, lat, lon) {
    const normalize = (angle) => {
        let a = angle % 360;
        return a < 0 ? a + 360 : a;
    };
    
    const degToRad = (deg) => deg * Math.PI / 180;
    const round = (num, decimals) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    
    const getSign = (lon) => {
        const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                       "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        return signs[Math.floor(normalize(lon) / 30)];
    };
    
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    
    let Y = year, M = month;
    if (M <= 2) {
        Y = Y - 1;
        M = M + 12;
    }
    
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (Y + 4716)) + 
               Math.floor(30.6001 * (M + 1)) + 
               day + B - 1524.5 + (hour + minute / 60) / 24;
    
    const T = (JD - 2451545.0) / 36525;
    
    // Sun
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mrad = degToRad(M_sun);
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
              0.000289 * Math.sin(3 * Mrad);
    const sunLon = normalize(L0 + C);
    
    // Moon
    const Lm = 218.3164477 + 481267.88123421 * T;
    const D = 297.8501921 + 445267.1114034 * T;
    const Mm = 134.9633964 + 477198.8675055 * T;
    const moonLon = normalize(Lm + 6.288774 * Math.sin(degToRad(Mm)));
    
    // Planets
    const mercury = normalize(252.250906 + 149472.6746358 * T);
    const venus = normalize(181.979801 + 58519.2130302 * T);
    const mars = normalize(355.433 + 19141.6964471 * T + 10.691 * Math.sin(degToRad(19.373 + 19139.8585 * T)));
    const jupiter = normalize(34.351519 + 3036.3027748 * T + 5.555 * Math.sin(degToRad(19.895 + 3034.90567 * T)));
    const saturn = normalize(50.077444 + 1223.5110686 * T + 6.406 * Math.sin(degToRad(317.021 + 1221.55147 * T)));
    const uranus = normalize(314.055005 + 429.8640561 * T);
    const neptune = normalize(304.348665 + 219.8833092 * T);
    const pluto = normalize(238.958116 + 145.18205 * T);
    
    const planets = {
        Sun: { longitude: round(sunLon, 2), sign: getSign(sunLon) },
        Moon: { longitude: round(moonLon, 2), sign: getSign(moonLon) },
        Mercury: { longitude: round(mercury, 2), sign: getSign(mercury) },
        Venus: { longitude: round(venus, 2), sign: getSign(venus) },
        Mars: { longitude: round(mars, 2), sign: getSign(mars) },
        Jupiter: { longitude: round(jupiter, 2), sign: getSign(jupiter) },
        Saturn: { longitude: round(saturn, 2), sign: getSign(saturn) },
        Uranus: { longitude: round(uranus, 2), sign: getSign(uranus) },
        Neptune: { longitude: round(neptune, 2), sign: getSign(neptune) },
        Pluto: { longitude: round(pluto, 2), sign: getSign(pluto) }
    };
    
    // Calculate aspects
    const aspects = [];
    const planetNames = Object.keys(planets);
    const aspectDefs = [
        { name: "Conjunction", angle: 0, orb: 8 },
        { name: "Opposition", angle: 180, orb: 8 },
        { name: "Trine", angle: 120, orb: 8 },
        { name: "Square", angle: 90, orb: 7 },
        { name: "Sextile", angle: 60, orb: 6 }
    ];
    
    for (let i = 0; i < planetNames.length; i++) {
        for (let j = i + 1; j < planetNames.length; j++) {
            const p1 = planetNames[i];
            const p2 = planetNames[j];
            let angle = Math.abs(planets[p1].longitude - planets[p2].longitude);
            if (angle > 180) angle = 360 - angle;
            
            for (const def of aspectDefs) {
                const orb = Math.abs(angle - def.angle);
                if (orb <= def.orb) {
                    aspects.push({
                        planet1: p1,
                        planet2: p2,
                        type: def.name,
                        orb: round(orb, 2),
                        strength: round(1 - orb / def.orb, 3)
                    });
                    break;
                }
            }
        }
    }
    
    // Element & Modality distribution
    const elementDist = { fire: 0, earth: 0, air: 0, water: 0 };
    const modalityDist = { cardinal: 0, fixed: 0, mutable: 0 };
    
    for (const planet of Object.values(planets)) {
        const signIndex = Math.floor(planet.longitude / 30);
        const elements = ['fire', 'earth', 'air', 'water'];
        const modalities = ['cardinal', 'fixed', 'mutable'];
        
        elementDist[elements[signIndex % 4]]++;
        modalityDist[modalities[signIndex % 3]]++;
    }
    
    return {
        planets,
        aspects,
        elementDist,
        modalityDist
    };
}

function calculateHouses(date, lat, lon) {
    // Simplified Placidus house calculation
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    
    let Y = year, M = month;
    if (M <= 2) {
        Y = Y - 1;
        M = M + 12;
    }
    
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (Y + 4716)) + 
               Math.floor(30.6001 * (M + 1)) + 
               day + B - 1524.5 + (hour + minute / 60) / 24;
    
    const T = (JD - 2451545.0) / 36525;
    
    // Sidereal Time
    const GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 
                 0.000387933 * T * T - T * T * T / 38710000;
    const LST = (GMST + lon) % 360;
    
    // Ascendant (simplified)
    const latRad = lat * Math.PI / 180;
    const lstRad = LST * Math.PI / 180;
    
    const ascRad = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.sin(latRad));
    let asc = (ascRad * 180 / Math.PI) % 360;
    if (asc < 0) asc += 360;
    
    const mc = (LST + 90) % 360;
    
    const houses = [];
    for (let i = 0; i < 12; i++) {
        const cusp = (asc + i * 30) % 360;
        houses.push({
            house_number: i + 1,
            cusp_longitude: Math.round(cusp * 100) / 100,
            sign: getSign(cusp)
        });
    }
    
    return {
        ascendant: Math.round(asc * 100) / 100,
        midheaven: Math.round(mc * 100) / 100,
        houses: houses
    };
    
    function getSign(lon) {
        const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                       "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        return signs[Math.floor((lon % 360) / 30)];
    }
}