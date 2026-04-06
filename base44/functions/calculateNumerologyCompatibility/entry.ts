import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Helper functions for numerology calculations
function reduceToSingleDigit(num) {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
}

function calculateLifePath(birthDate) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  return reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
}

function cleanHebrewText(text) {
  if (!text) return '';
  return text.replace(/[\u0591-\u05C7]/g, '').replace(/[״׳־]/g, '').replace(/\s+/g, '').trim();
}

const GEMATRIA = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
  'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200,
  'ש': 300, 'ת': 400
};

const HEBREW_VOWELS = ['א', 'ה', 'ו', 'י', 'ע'];

function calculateGematria(text) {
  let sum = 0;
  for (const char of text) {
    sum += GEMATRIA[char] || 0;
  }
  return sum;
}

function calculateNumerologyNumbers(person) {
  const lifePathNumber = calculateLifePath(person.birthDate);
  const cleanName = cleanHebrewText(person.fullName);
  const destinyValue = calculateGematria(cleanName);
  const destinyNumber = reduceToSingleDigit(destinyValue);
  
  const vowels = cleanName.split('').filter(c => HEBREW_VOWELS.includes(c)).join('');
  const soulValue = calculateGematria(vowels);
  const soulNumber = reduceToSingleDigit(soulValue);
  
  return {
    name: person.fullName,
    life_path: lifePathNumber,
    destiny: destinyNumber,
    soul: soulNumber
  };
}

// Compatibility matrix
const COMPATIBILITY_MATRIX = {
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { person1, person2 } = body;

    if (!person1 || !person2) {
      return Response.json({ error: 'Both persons data required' }, { status: 400 });
    }

    // Calculate numbers for both people
    const person1Numbers = calculateNumerologyNumbers(person1);
    const person2Numbers = calculateNumerologyNumbers(person2);

    // Calculate compatibility scores
    const lifePathScore = COMPATIBILITY_MATRIX[person1Numbers.life_path]?.[person2Numbers.life_path] || 50;
    const destinyScore = COMPATIBILITY_MATRIX[person1Numbers.destiny]?.[person2Numbers.destiny] || 50;
    const soulScore = COMPATIBILITY_MATRIX[person1Numbers.soul]?.[person2Numbers.soul] || 50;

    const overallScore = Math.round((lifePathScore * 0.4 + destinyScore * 0.3 + soulScore * 0.3));

    // Generate AI analysis
    const aiPrompt = `אתה מומחה נומרולוגיה. נתח את ההתאמה בין שני אנשים:

**${person1Numbers.name}:**
- מסלול חיים: ${person1Numbers.life_path}
- גורל: ${person1Numbers.destiny}
- דחף נשמה: ${person1Numbers.soul}

**${person2Numbers.name}:**
- מסלול חיים: ${person2Numbers.life_path}
- גורל: ${person2Numbers.destiny}
- דחף נשמה: ${person2Numbers.soul}

**ציוני התאמה:**
- מסלול חיים: ${lifePathScore}%
- גורל: ${destinyScore}%
- נשמה: ${soulScore}%
- **ציון כללי: ${overallScore}%**

תן ניתוח מעמיק בעברית:
1. סיכום כללי על ההתאמה (2-3 משפטים)
2. ניתוח התאמת מסלול חיים (פסקה)
3. 3-5 חוזקות משותפות עם הסברים
4. 3-4 אתגרים פוטנציאליים עם פתרונות
5. 5-7 עצות מעשיות לחיזוק הקשר
6. ניתוח ארוכי טווח

כתוב בשפה חמה, אישית ומעודדת.`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          overall_summary: { type: "string" },
          life_path_compatibility: {
            type: "object",
            properties: {
              score: { type: "number" },
              analysis: { type: "string" }
            }
          },
          shared_strengths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strength: { type: "string" },
                description: { type: "string" },
                how_to_leverage: { type: "string" }
              }
            }
          },
          potential_challenges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                challenge: { type: "string" },
                description: { type: "string" },
                how_to_overcome: { type: "string" }
              }
            }
          },
          practical_advice: {
            type: "array",
            items: { type: "string" }
          },
          long_term_potential: {
            type: "object",
            properties: {
              prognosis: { 
                type: "string",
                enum: ["excellent", "very_good", "good", "moderate", "challenging"]
              },
              analysis: { type: "string" },
              key_success_factors: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          life_areas_analysis: {
            type: "object",
            properties: {
              communication: { type: "string" },
              romance: { type: "string" },
              work_collaboration: { type: "string" }
            }
          }
        },
        required: ["overall_summary", "life_path_compatibility", "shared_strengths", "potential_challenges", "practical_advice"]
      }
    });

    return Response.json({
      person1: person1Numbers,
      person2: person2Numbers,
      compatibility: {
        overall_compatibility_score: overallScore,
        life_path_compatibility: {
          score: lifePathScore,
          analysis: aiAnalysis.life_path_compatibility?.analysis || ""
        },
        destiny_compatibility: {
          score: destinyScore
        },
        soul_compatibility: {
          score: soulScore
        },
        overall_summary: aiAnalysis.overall_summary,
        shared_strengths: aiAnalysis.shared_strengths || [],
        potential_challenges: aiAnalysis.potential_challenges || [],
        practical_advice: aiAnalysis.practical_advice || [],
        long_term_potential: aiAnalysis.long_term_potential,
        life_areas_analysis: aiAnalysis.life_areas_analysis
      }
    });

  } catch (error) {
    console.error('Numerology compatibility calculation error:', error);
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
});