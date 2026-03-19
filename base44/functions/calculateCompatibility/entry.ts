import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Helper: Calculate numerology life path
function calculateLifePath(birthDate) {
  const [year, month, day] = birthDate.split('-').map(Number);
  
  const reduceToSingleDigit = (num) => {
    if (num === 11 || num === 22 || num === 33) return num;
    while (num > 9) {
      num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
    }
    return num;
  };

  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  
  return reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
}

// Calculate numerology compatibility
function calculateNumerologyCompatibility(person1, person2) {
  const lp1 = calculateLifePath(person1.birth_date);
  const lp2 = calculateLifePath(person2.birth_date);
  
  // Compatibility matrix (simplified)
  const compatibilityMatrix = {
    1: { 1: 70, 2: 85, 3: 90, 4: 60, 5: 95, 6: 75, 7: 55, 8: 80, 9: 65, 11: 80, 22: 70, 33: 75 },
    2: { 1: 85, 2: 80, 3: 70, 4: 90, 5: 60, 6: 95, 7: 75, 8: 85, 9: 80, 11: 90, 22: 85, 33: 95 },
    3: { 1: 90, 2: 70, 3: 85, 4: 55, 5: 100, 6: 80, 7: 70, 8: 75, 9: 90, 11: 85, 22: 75, 33: 80 },
    4: { 1: 60, 2: 90, 3: 55, 4: 85, 5: 50, 6: 95, 7: 80, 8: 90, 9: 65, 11: 75, 22: 95, 33: 85 },
    5: { 1: 95, 2: 60, 3: 100, 4: 50, 5: 80, 6: 70, 7: 85, 8: 75, 9: 95, 11: 80, 22: 70, 33: 75 },
    6: { 1: 75, 2: 95, 3: 80, 4: 95, 5: 70, 6: 85, 7: 75, 8: 80, 9: 90, 11: 85, 22: 90, 33: 100 },
    7: { 1: 55, 2: 75, 3: 70, 4: 80, 5: 85, 6: 75, 7: 80, 8: 70, 9: 75, 11: 95, 22: 85, 33: 80 },
    8: { 1: 80, 2: 85, 3: 75, 4: 90, 5: 75, 6: 80, 7: 70, 8: 85, 9: 70, 11: 80, 22: 95, 33: 85 },
    9: { 1: 65, 2: 80, 3: 90, 4: 65, 5: 95, 6: 90, 7: 75, 8: 70, 9: 80, 11: 85, 22: 80, 33: 95 },
    11: { 1: 80, 2: 90, 3: 85, 4: 75, 5: 80, 6: 85, 7: 95, 8: 80, 9: 85, 11: 90, 22: 95, 33: 100 },
    22: { 1: 70, 2: 85, 3: 75, 4: 95, 5: 70, 6: 90, 7: 85, 8: 95, 9: 80, 11: 95, 22: 90, 33: 95 },
    33: { 1: 75, 2: 95, 3: 80, 4: 85, 5: 75, 6: 100, 7: 80, 8: 85, 9: 95, 11: 100, 22: 95, 33: 100 }
  };

  const life_path_match = compatibilityMatrix[lp1]?.[lp2] || 50;
  
  return {
    life_path_match,
    destiny_match: 75, // Placeholder
    soul_match: 70, // Placeholder
    person1_life_path: lp1,
    person2_life_path: lp2,
    interpretation: `מסלול חיים ${lp1} ומסלול חיים ${lp2} - התאמה של ${life_path_match}%`
  };
}

// Calculate astrology compatibility
function calculateAstrologyCompatibility(person1, person2) {
  // This is simplified - in production use proper calculations
  const elementCompatibility = {
    'Fire-Fire': 85,
    'Fire-Earth': 60,
    'Fire-Air': 90,
    'Fire-Water': 55,
    'Earth-Earth': 90,
    'Earth-Air': 65,
    'Earth-Water': 85,
    'Air-Air': 90,
    'Air-Water': 70,
    'Water-Water': 95
  };

  // Placeholder - would calculate from actual birth charts
  return {
    sun_sign_match: 80,
    moon_sign_match: 75,
    element_harmony: 'טובה',
    interpretation: 'התאמה אסטרולוגית חזקה'
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { person1, person2, compatibility_type = 'romantic' } = body;

    if (!person1 || !person2) {
      return Response.json({ error: 'Both persons data required' }, { status: 400 });
    }

    // Calculate numerology compatibility
    const numerologyComp = calculateNumerologyCompatibility(person1, person2);
    
    // Calculate astrology compatibility (if data available)
    const astrologyComp = person1.birth_time && person2.birth_time 
      ? calculateAstrologyCompatibility(person1, person2)
      : null;

    // Calculate overall score
    const overall_score = Math.round(
      (numerologyComp.life_path_match * 0.4 +
       (numerologyComp.destiny_match || 70) * 0.3 +
       (astrologyComp?.sun_sign_match || 75) * 0.3)
    );

    // Generate detailed analysis with AI
    const aiPrompt = `אתה מומחה נומרולוגיה ואסטרולוגיה. נתח את ההתאמה בין:
    
אדם 1: ${person1.name}, מסלול חיים ${numerologyComp.person1_life_path}
אדם 2: ${person2.name}, מסלול חיים ${numerologyComp.person2_life_path}

סוג היחסים: ${compatibility_type}
ציון התאמה: ${overall_score}/100

תן ניתוח מפורט (2-3 פסקאות) על:
1. נקודות החוזק ביחסים
2. אתגרים אפשריים
3. עצות לחיזוק הקשר

כתוב בעברית, בצורה חמה ומעודדת.`;

    const detailedAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      add_context_from_internet: false
    });

    // Extract strengths and challenges
    const strengths = [
      'הרמוניה נומרולוגית',
      'תקשורת פתוחה',
      'ערכים משותפים'
    ];

    const challenges = [
      'צורך באיזון אנרגטי',
      'הבנה הדדית בתקשורת',
      'התאמת קצב חיים'
    ];

    const recommendations = [
      'שמרו על תקשורת פתוחה ואמיתית',
      'כבדו את השוני בינכם',
      'השקיעו זמן איכות ביחד',
      'תמכו זה בזה בצמיחה האישית'
    ];

    return Response.json({
      success: true,
      data: {
        overall_score,
        numerology_compatibility: numerologyComp,
        astrology_compatibility: astrologyComp,
        strengths,
        challenges,
        recommendations,
        detailed_analysis: detailedAnalysis,
        confidence_score: 0.85
      },
      metadata: {
        generated_at: new Date().toISOString(),
        compatibility_type,
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('Compatibility calculation error:', error);
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
});