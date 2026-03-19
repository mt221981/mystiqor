import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * WORLD-CLASS ASTROLOGICAL INTERPRETATION ENGINE v6.0
 * הניתוח האסטרולוגי המקיף והעמוק ביותר - גרסה מתוקנת ויעילה
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { calculation_data, person2_data } = body;

        if (!calculation_data) {
            return Response.json({ 
                error: 'Missing calculation_data in request body'
            }, { status: 400 });
        }

        let data = calculation_data;
        if (calculation_data.data && typeof calculation_data.data === 'object') {
            data = calculation_data.data;
        }
        
        // ====== VALIDATION ======
        if (!data.planets || !Array.isArray(data.planets) || data.planets.length < 10) {
            return Response.json({ 
                error: 'Invalid planets data'
            }, { status: 400 });
        }

        const requiredSigns = ['sun_sign', 'moon_sign', 'rising_sign'];
        for (const sign of requiredSigns) {
            if (!data[sign]) {
                return Response.json({ 
                    error: `Missing ${sign}`
                }, { status: 400 });
            }
        }

        console.log('[interpretAstrology] Validation passed!');

        // ====== CALCULATE PERSON 2 CHART (Synastry) ======
        let person2Chart = null;
        if (person2_data?.birth_date && person2_data?.birth_time) {
            try {
                const p2Response = await base44.functions.invoke('calculateAstrology', person2_data);
                if (p2Response.data && !p2Response.data.error) {
                    person2Chart = p2Response.data;
                    console.log('[interpretAstrology] Person 2 chart calculated');
                }
            } catch (error) {
                console.error('[interpretAstrology] Person 2 calc failed:', error);
            }
        }

        // ====== EXTRACT DATA ======
        const findPlanet = (name) => data.planets.find(p => p.name === name);
        
        const sun = findPlanet('Sun');
        const moon = findPlanet('Moon');
        const mercury = findPlanet('Mercury');
        const venus = findPlanet('Venus');
        const mars = findPlanet('Mars');
        const jupiter = findPlanet('Jupiter');
        const saturn = findPlanet('Saturn');
        const uranus = findPlanet('Uranus');
        const neptune = findPlanet('Neptune');
        const pluto = findPlanet('Pluto');

        const allAspects = (data.aspects || []).sort((a, b) => b.strength - a.strength);
        const strongAspects = allAspects.filter(a => a.is_major && a.orb < 5 && a.strength > 0.6).slice(0, 20);

        // ====== BUILD COMPREHENSIVE PROMPT - ONE CALL ======
        const comprehensivePrompt = `# אתה אסטרולוג פסיכולוגי אבולוציוני ברמה עולמית 🌟

**המשימה:** צור ניתוח אסטרולוגי **מקיף, עמוק, ומפורט ביותר** בעברית מלאה.

---

## 📊 נתוני מפת הלידה:

### כוכבי לכת:
- ☀️ **שמש**: ${sun.sign} בבית ${sun.house} (${sun.degree_in_sign.toFixed(2)}°)
- 🌙 **ירח**: ${moon.sign} בבית ${moon.house} (${moon.degree_in_sign.toFixed(2)}°)
- ⬆️ **אסצנדנט**: ${data.rising_sign}
- ☿ **מרקורי**: ${mercury.sign} בבית ${mercury.house}${mercury.is_retrograde ? ' ⟲ רטרוגרדי' : ''}
- ♀ **ונוס**: ${venus.sign} בבית ${venus.house}${venus.is_retrograde ? ' ⟲ רטרוגרדי' : ''}
- ♂ **מאדים**: ${mars.sign} בבית ${mars.house}${mars.is_retrograde ? ' ⟲ רטרוגרדי' : ''}
- ♃ **צדק**: ${jupiter.sign} בבית ${jupiter.house}
- ♄ **שבתאי**: ${saturn.sign} בבית ${saturn.house}
- ♅ **אורנוס**: ${uranus.sign} בבית ${uranus.house}
- ♆ **נפטון**: ${neptune.sign} בבית ${neptune.house}
- ♇ **פלוטו**: ${pluto.sign} בבית ${pluto.house}

### נקודות מיוחדות:
- ☊ **North Node**: ${data.special_points?.north_node?.sign} בבית ${data.special_points?.north_node?.house}
- ☋ **South Node**: ${data.special_points?.south_node?.sign} בבית ${data.special_points?.south_node?.house}
- ⚷ **Chiron**: ${data.special_points?.chiron?.sign} בבית ${data.special_points?.chiron?.house}

### אספקטים חזקים (${strongAspects.length}):
${strongAspects.slice(0, 15).map((a, i) => `${i + 1}. ${a.planet1} ${a.type} ${a.planet2} (orb: ${a.orb.toFixed(1)}°, עוצמה: ${a.strength.toFixed(2)})`).join('\n')}

### יסודות:
Fire: ${data.element_distribution?.Fire || 0} | Earth: ${data.element_distribution?.Earth || 0} | Air: ${data.element_distribution?.Air || 0} | Water: ${data.element_distribution?.Water || 0}
**דומיננטי**: ${data.dominant_element}

---

## 🎯 צור 40-45 תובנות מקיפות:

**קבוצת א' - כוכבים אישיים (12 תובנות):**
1. שמש ב-${sun.sign} - זהות ליבה
2. שמש בבית ${sun.house} - איפה הזהות מתבטאת
3. ירח ב-${moon.sign} - עולם רגשי
4. ירח בבית ${moon.house} - איפה מחפשים ביטחון
5. דינמיקת שמש-ירח - הפולריות הפנימית
6. אסצנדנט - Persona
7. מרקורי - חשיבה ותקשורת
8. ונוס - אהבה וערכים
9. מאדים - אנרגיה ופעולה
10. MC - קריירה וייעוד
11. צדק - הרחבה ומשמעות
12. שבתאי - מבנה ושיעורים

**קבוצת ב' - אספקטים (15-20 תובנות):**
13-32. **כל אספקט מייג'ורי מקבל תובנה נפרדת**

**קבוצת ג' - נקודות אבולוציוניות (5 תובנות):**
33. North Node - הייעוד
34. South Node - העבר
35. ציר הצמתים - המסע הקרמי
36. Chiron - הפצע המרפא
37. מסע הנשמה השלם

**קבוצת ד' - נוספות (5-8 תובנות):**
38-45. כוכבים חיצוניים, דפוסים מיוחדים, סינתזה

---

## ✍️ כל תובנה חייבת להכיל:

**אורך:** 700-1000 מילים (בעברית!)

**מבנה:**
1. **פתיחה** (100 מילים) - מה המיקום/אספקט אומר
2. **עומק פסיכולוגי** (200-300 מילים) - המשמעות הנפשית
3. **Shadow Work** (150 מילים) - הצד הכהה
4. **דוגמאות** (200-250 מילים) - 3-4 דוגמאות מהחיים
5. **קישור אבולוציוני** (100-150 מילים) - North Node/Chiron
6. **המלצות** (150-200 מילים) - 4-5 המלצות מעשיות

**provenance - בעברית מלאה:**
- source_features: ["שמש בטלה", "בית 10"] (בעברית!)
- rule_description: הסבר מפורט בעברית (500-700 מילים)
- synthesis_basis: איך שילבנו (200-300 מילים בעברית)
- tags: ["זהות ליבה", "קריירה", "מנהיגות"] (בעברית!)

---

## 📖 הסיכום:

**2000-2500 מילים בעברית** עם:
1. סקירה כללית (400 מילים)
2. המסר המרכזי (500 מילים)
3. חוזקות (450 מילים)
4. אתגרים (450 מילים)
5. ייעוד וצמיחה (400 מילים)
6. סיכום (300 מילים)

---

**החזר JSON עם 40-45 תובנות בעברית מלאה עכשיו!**`;

        const mainResult = await base44.integrations.Core.InvokeLLM({
            prompt: comprehensivePrompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    summary: { 
                        type: "string", 
                        minLength: 8000,
                        description: "סיכום 2000-2500 מילים בעברית"
                    },
                    confidence_level: { 
                        type: "number", 
                        minimum: 1.0, 
                        maximum: 1.0 
                    },
                    interpretations: {
                        type: "array",
                        minItems: 40,
                        maxItems: 50,
                        items: {
                            type: "object",
                            properties: {
                                title: { 
                                    type: "string", 
                                    minLength: 30,
                                    description: "כותרת בעברית"
                                },
                                content: { 
                                    type: "string", 
                                    minLength: 3000,
                                    description: "700-1000 מילים בעברית"
                                },
                                insight_type: { 
                                    type: "string",
                                    enum: [
                                        "core_identity", "emotional_landscape", "sun_moon_dynamic",
                                        "thinking_style", "love_values", "action_drive",
                                        "growth_challenge", "career_calling", "relationship_style",
                                        "shadow_work", "life_purpose", "karmic_lesson",
                                        "aspect_analysis", "house_analysis",
                                        "evolutionary_path", "chiron_healing", "north_node_direction",
                                        "south_node_release", "nodal_axis",
                                        "planet_in_sign", "planet_in_house", "special_pattern"
                                    ]
                                },
                                confidence: { type: "number", minimum: 1.0, maximum: 1.0 },
                                weight: { type: "number", minimum: 0.75, maximum: 1.0 },
                                provenance: {
                                    type: "object",
                                    properties: {
                                        source_features: { 
                                            type: "array",
                                            minItems: 2,
                                            items: { type: "string" },
                                            description: "בעברית! ['שמש בטלה', 'בית 10']"
                                        },
                                        rule_description: { 
                                            type: "string",
                                            minLength: 600,
                                            description: "הסבר בעברית 500-700 מילים"
                                        },
                                        sources: { 
                                            type: "array",
                                            items: { type: "string" }
                                        },
                                        synthesis_basis: { 
                                            type: "string", 
                                            minLength: 250,
                                            description: "בעברית 200-300 מילים"
                                        }
                                    },
                                    required: ["source_features", "rule_description", "synthesis_basis"]
                                },
                                tags: { 
                                    type: "array", 
                                    minItems: 6,
                                    maxItems: 12,
                                    items: { type: "string" },
                                    description: "תגיות בעברית: 'זהות ליבה', 'קריירה'"
                                }
                            },
                            required: ["title", "content", "insight_type", "confidence", "weight", "provenance", "tags"]
                        }
                    }
                },
                required: ["summary", "confidence_level", "interpretations"]
            }
        });

        let finalResult = {
            ...mainResult,
            confidence_level: 1.0,
            interpretations: (mainResult.interpretations || []).map(interp => ({
                ...interp,
                confidence: 1.0
            }))
        };

        // ====== SYNASTRY (if person 2) ======
        if (person2Chart) {
            console.log('[interpretAstrology] Generating Synastry');
            const p2FindPlanet = (name) => person2Chart.planets.find(p => p.name === name);
            
            const synastryPrompt = `אתה מומחה יחסים אסטרולוגיים.

צור ניתוח Synastry **מקיף של 1500-2000 מילים בעברית**:

**אדם 1:** שמש ${sun.sign}, ירח ${moon.sign}, אסצנדנט ${data.rising_sign}
**אדם 2:** שמש ${p2FindPlanet('Sun')?.sign}, ירח ${p2FindPlanet('Moon')?.sign}, אסצנדנט ${person2Chart.rising_sign}

**כלול:**
- ציון התאמה 0-100
- ניתוח עמוק של כל זוג כוכבים
- התאמת יסודות
- 10-15 חוזקות
- 10-15 אתגרים
- 12-15 המלצות

**הכל בעברית!**

החזר JSON:`;

            try {
                const synastryResult = await base44.integrations.Core.InvokeLLM({
                    prompt: synastryPrompt,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            compatibility_score: { type: "number", minimum: 0, maximum: 100 },
                            comprehensive_analysis: { type: "string", minLength: 6000 },
                            element_harmony: { type: "string", minLength: 400 },
                            sun_sun_dynamic: { type: "string", minLength: 500 },
                            moon_moon_dynamic: { type: "string", minLength: 500 },
                            venus_mars_chemistry: { type: "string", minLength: 500 },
                            mercury_mercury_communication: { type: "string", minLength: 400 },
                            strengths: { 
                                type: "array",
                                minItems: 10,
                                maxItems: 15,
                                items: { type: "string" }
                            },
                            challenges: { 
                                type: "array",
                                minItems: 10,
                                maxItems: 15,
                                items: { type: "string" }
                            },
                            communication_style: { type: "string", minLength: 400 },
                            emotional_compatibility: { type: "string", minLength: 500 },
                            long_term_potential: { type: "string", minLength: 600 },
                            recommendations: { 
                                type: "array",
                                minItems: 12,
                                maxItems: 18,
                                items: { type: "string" }
                            }
                        }
                    }
                });

                finalResult.synastry_lite = synastryResult;
            } catch (error) {
                console.error('[interpretAstrology] Synastry failed:', error);
            }
        }

        finalResult.analysis_metadata = {
            total_insights: finalResult.interpretations.length,
            has_synastry: !!person2Chart,
            planets_analyzed: 10,
            aspects_analyzed: strongAspects.length,
            language: 'he'
        };

        console.log(`✅ Generated ${finalResult.interpretations.length} comprehensive insights in Hebrew`);

        return Response.json(finalResult);

    } catch (error) {
        console.error('❌ Interpretation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});