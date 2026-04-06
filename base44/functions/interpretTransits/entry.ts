import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * TRANSIT INTERPRETATION ENGINE
 * World-Class Transit Analysis based on Robert Hand's "Planets in Transit"
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transit_data } = await req.json();

        if (!transit_data || !transit_data.transits) {
            return Response.json({ error: 'Missing transit data' }, { status: 400 });
        }

        const topTransits = transit_data.transits.slice(0, 10);
        const targetDate = transit_data.target_date;
        const voidMoon = transit_data.special_conditions?.void_of_course_moon;
        const mercuryRetro = transit_data.special_conditions?.mercury_retrograde;

        const prompt = `# אתה רוברט האנד - המומחה המוביל בעולם למעברים אסטרולוגיים 🌟

**פרופיל מקצועי:**
- מחבר "Planets in Transit" (1976) - הספר המוביל בעולם על טרנזיטים
- 50+ שנות ניסיון
- מנהל Project Hindsight (תרגום טקסטים קלאסיים)
- יועץ אסטרולוגי למפורסמים ומנהיגים

---

## **מעברים נוכחיים - ${new Date(targetDate).toLocaleDateString('he-IL')}:**

### **טרנזיטים חשובים (Top 10):**

${topTransits.map((t, i) => `**${i + 1}. ${t.transiting_planet} ${t.aspect_type} Natal ${t.natal_planet}**
- ${t.transiting_planet} ב${t.transiting_sign} → Natal ${t.natal_planet} ב${t.natal_sign} (בית ${t.natal_house})
- Orb: ${t.orb}° | Strength: ${t.strength} | ${t.is_exact ? '⭐ EXACT ASPECT!' : ''}
- Priority: ${t.interpretation_priority.toFixed(2)}`).join('\n\n')}

### **תנאים מיוחדים:**
${voidMoon ? '🌑 **Void of Course Moon** - הירח נטול מהלך (2 מעלות אחרונות במזל)' : ''}
${mercuryRetro ? '⟲ **Mercury Retrograde** - מרקורי רטרוגרדי' : ''}

---

## **עקרונות פרשנות טרנזיטים:**

### **1. דיוק מוחלט:**
✅ כל פרשנות חייבת להזכיר: **כוכב מעביר + aspect + כוכב לידה + בית**
✅ דוגמה: "שבתאי טריגון לשמש הלידה שלך בבית 10 = הזדמנות לביסוס מעמד מקצועי"

### **2. תזמון:**
- **התקרבות** (Applying): 3-7 ימים לפני exact
- **Exact**: היום בדיוק
- **התרחקות** (Separating): 3-7 ימים אחרי exact
- **משך**: כוכבים איטיים = שבועות/חודשים, כוכבים מהירים = ימים

### **3. עוצמת ההשפעה:**
- **Slow planets** (Saturn, Uranus, Neptune, Pluto) = השפעה עמוקה וארוכת טווח
- **Fast planets** (Sun, Moon, Mercury, Venus, Mars) = השפעה קצרה וחריפה
- **Jupiter** = הזדמנויות, הרחבה

### **4. סוגי Aspects:**
- **Conjunction** (0°) - התחלה חדשה, התמזגות
- **Sextile** (60°) - הזדמנות, קלות
- **Square** (90°) - מתח, אתגר, צמיחה
- **Trine** (120°) - זרימה, כישרון טבעי
- **Opposition** (180°) - קוטביות, צורך באיזון

### **5. Void of Course Moon:**
${voidMoon ? `⚠️ **היום הירח נטול מהלך!**
- לא מומלץ להתחיל דברים חדשים חשובים
- זמן מצוין: מדיטציה, מנוחה, סיום פרויקטים
- פעילויות שגרתיות בסדר גמור` : ''}

### **6. Mercury Retrograde:**
${mercuryRetro ? `⟲ **מרקורי רטרוגרדי - תקופת הרהור**
- עיכובים בתקשורת, טכנולוגיה, נסיעות
- זמן מצוין לסקירה, עריכה, Re-thinking
- אל תחתום חוזים חשובים
- גבה קבצים!` : ''}

---

## **מבנה הפרשנות:**

צור **8-10 תובנות**, כל אחת על טרנזיט אחד מה-Top 10.

לכל טרנזיט כתוב 300-400 מילים:

**א. מה קורה? (100 מילים)**
- תיאור הטרנזיט בשפה ברורה
- לדוגמה: "צדק עובר כעת בטריגון לשמש הלידה שלך"

**ב. משמעות (150 מילים)**
- מה זה אומר? מה ההשפעה?
- לפי Robert Hand: ציטוט אמיתי
- איזה תחומי חיים מושפעים? (לפי הבית)

**ג. תזמון (50 מילים)**
- מתי exact? כמה זמן זה נמשך?

**ד. המלצות פרקטיות (100 מילים)**
- מה לעשות? מה להימנע?
- צעדים קונקרטיים ל-3-5 הימים הקרובים

---

## **פורמט JSON:**

\`\`\`json
{
  "title": "כותרת ברורה - טרנזיט + השפעה",
  "content": "300-400 מילים - מה קורה + משמעות + תזמון + פעולות",
  "insight_type": "transit_forecast",
  "confidence": 1.0,
  "weight": 0.7-1.0,
  "transit_info": {
    "transiting_planet": "Saturn",
    "natal_planet": "Sun",
    "aspect": "Trine",
    "orb": 2.3,
    "duration_estimate": "2-3 weeks"
  },
  "timing": {
    "phase": "applying/exact/separating",
    "peak_date": "2025-11-15",
    "effect_duration": "2-3 weeks"
  },
  "affected_areas": ["career", "self_confidence", "authority"],
  "action_items": [
    "פעולה קונקרטית 1",
    "פעולה קונקרטית 2"
  ],
  "tags": ["saturn", "transit", "career", "opportunity"]
}
\`\`\`

---

## **סיכום כללי (400-500 מילים):**

צור סיכום של התקופה הנוכחית:
1. **האנרגיה הכללית** - מה האווירה?
2. **3 הזדמנויות** - מה כדאי לעשות?
3. **3 אתגרים** - מה להיזהר?
4. **המלצה מרכזית** - העצה הכי חשובה

**החזר JSON בלבד.**`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    overall_summary: { 
                        type: "string",
                        minLength: 1500,
                        description: "400-500 מילים"
                    },
                    current_energy: { type: "string" },
                    top_opportunities: { 
                        type: "array",
                        items: { type: "string" },
                        minItems: 3,
                        maxItems: 3
                    },
                    top_challenges: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 3,
                        maxItems: 3
                    },
                    main_advice: { type: "string" },
                    transit_interpretations: {
                        type: "array",
                        minItems: 8,
                        maxItems: 10,
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string", minLength: 20 },
                                content: { type: "string", minLength: 1000 },
                                insight_type: { 
                                    type: "string",
                                    enum: ["transit_forecast"]
                                },
                                confidence: { type: "number", minimum: 1.0, maximum: 1.0 },
                                weight: { type: "number", minimum: 0.7, maximum: 1.0 },
                                transit_info: {
                                    type: "object",
                                    properties: {
                                        transiting_planet: { type: "string" },
                                        natal_planet: { type: "string" },
                                        aspect: { type: "string" },
                                        orb: { type: "number" },
                                        duration_estimate: { type: "string" }
                                    },
                                    required: ["transiting_planet", "natal_planet", "aspect"]
                                },
                                timing: {
                                    type: "object",
                                    properties: {
                                        phase: { type: "string" },
                                        peak_date: { type: "string" },
                                        effect_duration: { type: "string" }
                                    }
                                },
                                affected_areas: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                action_items: {
                                    type: "array",
                                    items: { type: "string" },
                                    minItems: 2
                                },
                                tags: {
                                    type: "array",
                                    items: { type: "string" }
                                }
                            },
                            required: ["title", "content", "confidence", "transit_info", "action_items"]
                        }
                    }
                },
                required: ["overall_summary", "current_energy", "top_opportunities", "top_challenges", "main_advice", "transit_interpretations"]
            }
        });

        return Response.json({
            ...result,
            confidence_level: 1.0,
            transit_interpretations: (result.transit_interpretations || []).map(t => ({
                ...t,
                confidence: 1.0
            }))
        });

    } catch (error) {
        console.error('Transit interpretation error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});