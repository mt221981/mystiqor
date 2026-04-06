import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * BEST DAYS FINDER - Electional Astrology
 * Finds optimal timing for important activities based on transits
 * 
 * References:
 * - Vivian Robson - "Electional Astrology" (1937)
 * - Robert Hand - "Planets in Transit" (1976)
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { activity_type, start_date, end_date, natal_chart } = await req.json();

        if (!activity_type || !start_date || !end_date) {
            return Response.json({ 
                error: 'Missing required fields',
                required: ['activity_type', 'start_date', 'end_date']
            }, { status: 400 });
        }

        const activities = {
            'business_launch': {
                favorable: ['Sun-Jupiter Trine', 'Moon in Capricorn', 'Mars-Midheaven aspect'],
                avoid: ['Void Moon', 'Mercury Retrograde', 'Saturn-Sun Square']
            },
            'relationship_start': {
                favorable: ['Venus-Moon aspect', 'Moon in Libra/Taurus', 'Venus-Jupiter aspect'],
                avoid: ['Mars-Venus Square', 'Void Moon', 'Venus Retrograde']
            },
            'contract_signing': {
                favorable: ['Mercury Direct', 'Jupiter aspects', 'Moon in Earth sign'],
                avoid: ['Mercury Retrograde', 'Void Moon', 'Mars-Mercury Square']
            },
            'surgery': {
                favorable: ['Moon in Fixed sign', 'Avoid Moon opposite Mars'],
                avoid: ['Moon in sign ruling body part', 'Mars-Moon aspect', 'Void Moon']
            },
            'travel': {
                favorable: ['Jupiter aspects', 'Moon in Sagittarius/Gemini'],
                avoid: ['Mercury Retrograde', 'Mars-Uranus aspect', 'Void Moon']
            },
            'creative_project': {
                favorable: ['Venus-Neptune aspect', 'Moon in Pisces/Leo', 'Sun-Uranus aspect'],
                avoid: ['Saturn-Venus Square', 'Void Moon']
            },
            'job_interview': {
                favorable: ['Sun-Midheaven aspect', 'Moon in Capricorn', 'Jupiter-Sun aspect'],
                avoid: ['Saturn-Sun aspect', 'Void Moon', 'Mercury Retrograde']
            },
            'marriage': {
                favorable: ['Venus-Jupiter aspect', 'Moon in Libra/Taurus', 'Sun in 7th house'],
                avoid: ['Void Moon', 'Mars-Venus Square', 'Saturn-Venus aspect']
            }
        };

        const activityRules = activities[activity_type] || activities['business_launch'];

        // Scan days in range
        const startD = new Date(start_date);
        const endD = new Date(end_date);
        const dayScores = [];

        for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
            const score = await scoreDayForActivity(d, activityRules, natal_chart);
            dayScores.push({
                date: d.toISOString().split('T')[0],
                score: score.total,
                favorable_factors: score.favorable,
                unfavorable_factors: score.unfavorable,
                moon_sign: score.moonSign,
                void_moon: score.voidMoon,
                mercury_retro: score.mercuryRetro
            });
        }

        // Sort by score
        dayScores.sort((a, b) => b.score - a.score);

        const bestDays = dayScores.slice(0, 5);
        const worstDays = dayScores.slice(-3);

        return Response.json({
            activity_type,
            date_range: { start: start_date, end: end_date },
            best_days: bestDays,
            worst_days: worstDays,
            total_days_analyzed: dayScores.length,
            recommendation: bestDays[0]
        });

    } catch (error) {
        console.error('Best days finder error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});

async function scoreDayForActivity(date, rules, natalChart) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    
    let Y = year, M = month;
    if (M <= 2) {
        Y = Y - 1;
        M = M + 12;
    }
    
    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD = Math.floor(365.25 * (Y + 4716)) + 
               Math.floor(30.6001 * (M + 1)) + 
               day + B - 1524.5 + 0.5;
    
    const T = (JD - 2451545.0) / 36525;
    
    const normalize = (angle) => {
        let a = angle % 360;
        return a < 0 ? a + 360 : a;
    };
    
    const degToRad = (deg) => deg * Math.PI / 180;
    
    // Calculate Moon
    const Lm = 218.3164477 + 481267.88123421 * T;
    const moonLon = normalize(Lm);
    const moonSign = Math.floor(moonLon / 30);
    const moonSignName = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                          "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][moonSign];
    
    // Void of Course Moon check
    const nextSignBoundary = (moonSign + 1) * 30;
    const voidMoon = (nextSignBoundary - moonLon) < 2;
    
    // Mercury Retrograde check
    const mercuryRetro = Math.abs(Math.sin(T / 0.241 * 13.5 * Math.PI)) > 0.82;
    
    let score = 50; // Base score
    const favorable = [];
    const unfavorable = [];
    
    // Check favorable conditions
    if (rules.favorable.some(f => f.includes(moonSignName))) {
        score += 20;
        favorable.push(`ירח ב${moonSignName}`);
    }
    
    if (!mercuryRetro && rules.avoid.includes('Mercury Retrograde')) {
        score += 15;
        favorable.push('מרקורי לא רטרוגרדי');
    }
    
    if (!voidMoon) {
        score += 15;
        favorable.push('ירח לא נטול מהלך');
    }
    
    // Check unfavorable conditions
    if (voidMoon && rules.avoid.includes('Void Moon')) {
        score -= 30;
        unfavorable.push('ירח נטול מהלך');
    }
    
    if (mercuryRetro && rules.avoid.includes('Mercury Retrograde')) {
        score -= 25;
        unfavorable.push('מרקורי רטרוגרדי');
    }
    
    return {
        total: Math.max(0, Math.min(100, score)),
        favorable,
        unfavorable,
        moonSign: moonSignName,
        voidMoon,
        mercuryRetro
    };
}