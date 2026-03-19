import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * SOLAR RETURN INTERPRETATION
 * Deep interpretation based on:
 * - Mary Fortier Shea - "Planets in Solar Returns" (1976)
 * - Wendel C. Perry - "Solar Returns"
 * - Alexandre Volguine - "The Technique of Solar Returns" (1937)
 * - Robert Hand - "Planets in Transit"
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { solar_return_data, natal_data } = await req.json();

        if (!solar_return_data || !natal_data) {
            return Response.json({ 
                error: 'Missing required data',
                required: ['solar_return_data', 'natal_data']
            }, { status: 400 });
        }

        const prompt = `# אתה אסטרולוג מומחה ב-Solar Returns ברמה עולמית 🌟

**Solar Return** הוא המפה האסטרולוגית של רגע החזרת השמש למיקום הנטאלי שלה - מפת יום ההולדת השנתית.

**מקורות מקצועיים:**
- **Mary Fortier Shea** - "Planets in Solar Returns" (1976) - הספר הקלאסי
- **Wendel C. Perry** - "Solar Returns: The Moon and the Planets" 
- **Alexandre Volguine** - "The Technique of Solar Returns" (1937)
- **Robert Hand** - "Planets in Transit" - עבור תזמון

---

## **נתוני Solar Return:**

**שנה:** ${solar_return_data.solar_return_year}
**רגע מדויק:** ${solar_return_data.solar_return_moment}
**מיקום:** ${solar_return_data.birth_place.latitude}°, ${solar_return_data.birth_place.longitude}°

### **כוכבי הלכת ב-Solar Return:**
${Object.entries(solar_return_data.planets).map(([planet, data]) => 
`**${planet}:** ${data.longitude.toFixed(2)}° ב-${data.sign}`
).join('\n')}

### **בתים (Placidus):**
**Ascendant (עולה):** ${solar_return_data.houses.ascendant}°
**Midheaven (MC):** ${solar_return_data.houses.midheaven}°

${solar_return_data.houses.houses.map(h => 
`**בית ${h.house_number}:** ${h.cusp_longitude}° ב-${h.sign}`
).join('\n')}

### **אספקטים:**
${solar_return_data.aspects.map(a => 
`**${a.planet1} ${a.type} ${a.planet2}** (orb: ${a.orb}°, strength: ${a.strength})`
).join('\n')}

### **איזון יסודות:**
🔥 Fire: ${solar_return_data.element_distribution.fire}
🌍 Earth: ${solar_return_data.element_distribution.earth}
🌬️ Air: ${solar_return_data.element_distribution.air}
💧 Water: ${solar_return_data.element_distribution.water}

---

## **נתונים נטאליים (להשוואה):**

### **כוכבי הלכת הנטאליים:**
${Object.entries(natal_data.planets).map(([planet, data]) => 
`**${planet}:** ${data.longitude.toFixed(2)}° ב-${data.sign}`
).join('\n')}

---

## **עקרונות פרשנות (Mary Fortier Shea):**

### **1. Ascendant של Solar Return**
- **מגדיר את הנושא המרכזי של השנה**
- השווה ל-Ascendant הנטאלי
- באיזה בית נטאלי הוא נופל?

### **2. כוכבי לכת בבתים**
- **1st House:** אישיות, גוף, זהות חדשה
- **2nd House:** כסף, ערכים, בטחון חומרי
- **3rd House:** תקשורת, למידה, אחים
- **4th House:** בית, משפחה, שורשים, IC
- **5th House:** יצירתיות, רומנטיקה, ילדים
- **6th House:** עבודה, בריאות, שגרה
- **7th House:** זוגיות, שותפויות, Descendant
- **8th House:** שינוי עמוק, סקס, כסף משותף
- **9th House:** פילוסופיה, נסיעות, השכלה גבוהה
- **10th House:** קריירה, מעמד, MC
- **11th House:** חברים, קהילה, חלומות
- **12th House:** רוחניות, סודות, מה שמוסתר

### **3. כוכבי לכת על זוויות (Angular)**
- **על Ascendant** - אישיות חזקה מאוד
- **על MC** - קריירה, הצלחה ציבורית
- **על Descendant** - זוגיות, שותפויות
- **על IC** - משפחה, בית, שורשים

### **4. אספקטים בין Solar Return לנטאל**
- **Sun SR על Sun Natal** - תמיד קונג'קשן (זה ה-Solar Return!)
- **Moon SR על Moon Natal** - רגשות, מחזוריות
- **Venus SR על Venus Natal** - אהבה, ערכים
- **Mars SR על Mars Natal** - אנרגיה, מאבקים
- **Saturn SR על Saturn Natal** - אחריות, מבחנים

### **5. ירח ב-Solar Return - הכי חשוב!**
- **מגדיר את הטון הרגשי של השנה**
- מחזור 2.5 שנים של הירח חוזר למיקום נטאלי
- איזה בית? איזה אספקטים?

---

## **מבנה הפרשנות:**

### **1. סיכום כללי (300-400 מילים)**
- מה נושא השנה?
- מה הטון הרגשי?
- מה האתגרים והברכות?

### **2. ניתוח מפורט לפי תחומים:**

**אישיות וגוף (Ascendant + 1st House):**
- מה משתנה באישיות?
- איך אתה מציג את עצמך?
- שינויים בגוף/בריאות?

**כסף ובטחון (2nd House):**
- מצב כלכלי
- ערכים חדשים
- מה משתנה ביחס לבטחון?

**תקשורת ולמידה (3rd House):**
- לימודים חדשים?
- תקשורת
- קשרים עם אחים/שכנים

**בית ומשפחה (4th House + IC):**
- שינויים בבית?
- משפחה
- שורשים פנימיים

**אהבה ויצירתיות (5th House):**
- רומנטיקה
- יצירתיות
- ילדים

**עבודה ובריאות (6th House):**
- עבודה יומית
- שגרה
- בריאות

**זוגיות ושותפויות (7th House + Descendant):**
- יחסים זוגיים
- שותפויות עסקיות
- חוזים

**שינוי ושינוי (8th House):**
- טרנספורמציה עמוקה
- סקסואליות
- כסף משותף / ירושה

**פילוסופיה ונסיעות (9th House):**
- נסיעות רחוקות
- השכלה גבוהה
- אמונות חדשות

**קריירה והצלחה (10th House + MC):**
- קריירה
- מעמד חברתי
- הישגים ציבוריים

**חברים וקהילה (11th House):**
- חברויות
- קבוצות
- חלומות לעתיד

**רוחניות וסודות (12th House):**
- עבודה פנימית
- מה שמוסתר
- רוחניות

### **3. אספקטים חשובים (6-8):**
- רק האספקטים החשובים ביותר
- קונג'קשנים, אופוזיציות, ריבועים, טריינים חזקים
- מה המשמעות המעשית?

### **4. תובנות עמוקות (10-15 insights):**

לכל insight:
- **title** - כותרת ברורה
- **content** - 250-350 מילים
- **insight_type** - personality/career/relationships/health/timing/challenge/opportunity/transformation
- **confidence** - 0.85-0.95
- **weight** - 0.7-1.0
- **provenance**:
  - source_features: איזה כוכבים/בתים תומכים
  - rule_description: הסבר מקצועי
  - sources: Mary Shea, Volguine, Hand
- **tags**: תגיות רלוונטיות
- **timing**: אם רלוונטי - מתי בשנה

### **5. עצות מעשיות לשנה (8-12 עצות):**
- פרקטיות וניתנות ליישום
- לפי התקופה בשנה (אם רלוונטי)
- מבוססות על הפריסה

### **6. חודשים חשובים בשנה:**
- זהה 4-6 חודשים מכריעים
- למה? איזה טרנזיטים?

---

## **חשוב:**
- **Solar Return תקף משנה לשנה** - מיום ההולדת ועד הבא
- **לא גזירת גורל** - פוטנציאלים
- **עבוד עם האנרגיה** - לא נגדה
- **השווה לנטאל** - המפה הנטאלית תמיד שם

**החזר JSON מובנה ומקצועי.**`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    solar_return_year: { type: "number" },
                    overall_summary: { type: "string", minLength: 1000 },
                    yearly_theme: { type: "string" },
                    emotional_tone: { type: "string" },
                    major_focus_areas: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 3,
                        maxItems: 5
                    },
                    house_interpretations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                house_number: { type: "number" },
                                house_name: { type: "string" },
                                planets_in_house: { type: "array", items: { type: "string" } },
                                interpretation: { type: "string", minLength: 300 },
                                importance: { type: "string", enum: ["high", "medium", "low"] }
                            }
                        }
                    },
                    major_aspects: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                aspect_description: { type: "string" },
                                interpretation: { type: "string" },
                                timing: { type: "string" },
                                advice: { type: "string" }
                            }
                        }
                    },
                    insights: {
                        type: "array",
                        minItems: 10,
                        maxItems: 15,
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                content: { type: "string", minLength: 800 },
                                insight_type: { type: "string" },
                                confidence: { type: "number", minimum: 0.85, maximum: 0.95 },
                                weight: { type: "number" },
                                provenance: {
                                    type: "object",
                                    properties: {
                                        source_features: { type: "array", items: { type: "string" } },
                                        rule_description: { type: "string" },
                                        sources: { type: "array", items: { type: "string" } }
                                    }
                                },
                                tags: { type: "array", items: { type: "string" } },
                                timing: { type: "string" }
                            }
                        }
                    },
                    practical_advice: {
                        type: "array",
                        items: { type: "string" }
                    },
                    important_months: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                month: { type: "string" },
                                reason: { type: "string" },
                                what_to_do: { type: "string" }
                            }
                        }
                    },
                    confidence_level: { type: "number", minimum: 0.85, maximum: 0.95 }
                }
            }
        });

        return Response.json(result);

    } catch (error) {
        console.error('Solar return interpretation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});