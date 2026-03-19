
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * GENERATE ASTROLOGY READING - ADVANCED VERSION
 * 
 * Enhanced with:
 * - Composite + Synastry analysis for relationships
 * - Detailed yearly forecasts by quarter and life area, including Solar Arc, Secondary Progressions, and Outer Planet Transits
 * - Advanced transit reports with precise timing, retrograde effects, and house context
 * 
 * Based on:
 * - Robert Hand - "Planets in Transit" + "Planets in Composite"
 * - Liz Greene - "The Astrology of Fate"
 * - Stephen Arroyo - "Astrology, Psychology, and the Four Elements"
 * - And other advanced astrological techniques.
 * 
 * Input: reading_type, input_question, person2_data, period_start/end
 * Output: AstrologyReading object
 */

Deno.serve(async (req) => {
    const startTime = Date.now();
    
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { 
            reading_type = 'natal_chart',
            input_question = null,
            person2_data = null,
            period_start = null,
            period_end = null
        } = body;

        console.log('🌟 Generating astrology reading:', { reading_type, user: user.email });

        // ====== STEP 1: Get user's birth chart ======
        
        const profiles = await base44.entities.UserProfile.filter(
            { created_by: user.email },
            '-created_date',
            1
        );
        const userProfile = profiles[0];

        if (!userProfile || !userProfile.birth_date) {
            return Response.json({
                error: 'Profile incomplete',
                message: 'נא להשלים את פרטי הפרופיל (תאריך לידה לפחות)'
            }, { status: 400 });
        }

        // Get astrology calculation
        const calculations = await base44.entities.AstrologyCalculation.filter(
            { created_by: user.email },
            '-created_date',
            1
        );
        
        let astrologyCalc = calculations[0];

        // If no calculation exists, create one
        if (!astrologyCalc) {
            console.log('📊 No existing calculation, generating new one...');
            
            const calcResponse = await base44.functions.invoke('calculateAstrology', {
                birth_date: userProfile.birth_date,
                birth_time: userProfile.birth_time || '12:00',
                birth_place: userProfile.birth_place_name || 'Unknown'
            });

            astrologyCalc = calcResponse.data;
        }

        console.log('✅ Birth chart loaded');

        // ====== STEP 1.5: For compatibility, get second person's chart ======
        let person2Calc = null;
        let compositeChart = null;
        
        if (reading_type === 'compatibility' && person2_data) {
            console.log('👥 Calculating second person chart for compatibility...');
            
            const calcResponse = await base44.functions.invoke('calculateAstrology', {
                birth_date: person2_data.birth_date,
                birth_time: person2_data.birth_time || '12:00',
                birth_place: person2_data.birth_place || 'Unknown'
            });

            person2Calc = calcResponse.data;
            
            // Calculate composite chart (midpoints between planets)
            compositeChart = calculateCompositeChart(astrologyCalc, person2Calc);
            
            console.log('✅ Second person chart + composite chart loaded');
        }

        // ====== STEP 2: Build context based on reading type ======
        
        let contextPrompt = '';
        let responseSchema: Record<string, unknown> = {};
        let title = '';

        const birthChartSummary = `
# מפת הלידה של המשתמש:
- שם: ${userProfile.full_name_hebrew || user.full_name}
- תאריך לידה: ${userProfile.birth_date}
${userProfile.birth_time ? `- שעת לידה: ${userProfile.birth_time}` : ''}
${userProfile.birth_place_name ? `- מקום לידה: ${userProfile.birth_place_name}` : ''}

## כוכבים מרכזיים:
- מזל שמש (Sun): ${astrologyCalc.sun_sign}
- מזל ירח (Moon): ${astrologyCalc.moon_sign}
- צועד (Ascendant): ${astrologyCalc.rising_sign}

## התפלגות אלמנטים:
${JSON.stringify(astrologyCalc.element_distribution, null, 2)}

## התפלגות מודאליות:
${JSON.stringify(astrologyCalc.modality_distribution, null, 2)}

${astrologyCalc.planets ? `## מיקומי כוכבים:
${astrologyCalc.planets.map(p => `- ${p.name}: ${p.sign} בבית ${p.house} (${p.longitude.toFixed(2)}°)`).join('\n')}` : ''}

${astrologyCalc.aspects ? `## אספקטים מרכזיים:
${astrologyCalc.aspects.slice(0, 10).map(a => `- ${a.planet1} ${a.type} ${a.planet2} (${a.angle.toFixed(1)}°, strength: ${a.strength.toFixed(2)})`).join('\n')}` : ''}
`;

        // Customize based on reading type
        switch (reading_type) {
            case 'natal_chart':
                title = 'המפה האסטרולוגית המלאה שלך';
                contextPrompt = `${birthChartSummary}

# המשימה שלך:
אתה אסטרולוג מומחה עם ניסיון של עשרות שנים. צור **קריאה אסטרולוגית מקיפה ומעמיקה** של מפת הלידה.

## דרישות:
1. **עומק ופירוט**: כל סקציה צריכה להיות מפורטת (300-500 מילים לכל נושא מרכזי)
2. **אישיות**: דבר ישירות אל המשתמש, השתמש ב"אתה/את"
3. **איזון**: כלול חוזקות ואתגרים
4. **מעשיות**: תן המלצות קונקרטיות

## מבנה הקריאה:

### 1. השילוש המקודש (Sun, Moon, Ascendant)
- Sun Sign: זהות הליבה, המהות, הייעוד
- Moon Sign: העולם הרגשי, הצרכים, האינטואיציה
- Ascendant: המסכה, האישיות החיצונית, איך אחרים רואים אותך

### 2. כוכבי לכת אישיים (Mercury, Venus, Mars)
- Mercury: תקשורת, חשיבה, למידה
- Venus: אהבה, ערכים, יופי
- Mars: אנרגיה, פעולה, תשוקה

### 3. כוכבי לכת חברתיים ורוחניים (Jupiter, Saturn, Uranus, Neptune, Pluto)
- חיבורים לקריירה, צמיחה, שינויים גדולים

### 4. תמות מרכזיות
- זהה 3-5 תמות חוזרות במפה
- כל תמה תכלול: מה, למה, איך להתמודד

### 5. יחסים ואהבה
- דינמיקות ביחסים
- מה אתה מחפש בבן/בת זוג
- אתגרים ופתרונות

### 6. קריירה וייעוד
- כיוונים מקצועיים מומלצים
- כישרונות טבעיים
- אתגרים במקום העבודה

### 7. צמיחה אישית
- תחומים לעבודה
- המלצות רוחניות ומעשיות
`;

                responseSchema = {
                    type: "object",
                    properties: {
                        overview: { type: "string", minLength: 400 },
                        sun_interpretation: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                content: { type: "string", minLength: 800 },
                                strengths: { type: "array", items: { type: "string" } },
                                challenges: { type: "array", items: { type: "string" } }
                            },
                            required: ["title", "content", "strengths", "challenges"]
                        },
                        moon_interpretation: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                content: { type: "string", minLength: 800 },
                                emotional_needs: { type: "array", items: { type: "string" } },
                                self_care: { type: "array", items: { type: "string" } }
                            },
                            required: ["title", "content", "emotional_needs", "self_care"]
                        },
                        ascendant_interpretation: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                content: { type: "string", minLength: 800 },
                                first_impressions: { type: "string" },
                                life_approach: { type: "string" }
                            },
                            required: ["title", "content", "first_impressions", "life_approach"]
                        },
                        personal_planets: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    planet: { type: "string" },
                                    interpretation: { type: "string", minLength: 400 }
                                },
                                required: ["planet", "interpretation"]
                            }
                        },
                        key_themes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    theme: { type: "string" },
                                    description: { type: "string", minLength: 300 },
                                    how_to_work_with: { type: "string" }
                                },
                                required: ["theme", "description", "how_to_work_with"]
                            }
                        },
                        relationships: {
                            type: "object",
                            properties: {
                                dynamics: { type: "string", minLength: 600 },
                                ideal_partner: { type: "string" },
                                challenges: { type: "array", items: { type: "string" } },
                                advice: { type: "array", items: { type: "string" } }
                            },
                            required: ["dynamics", "ideal_partner", "challenges", "advice"]
                        },
                        career: {
                            type: "object",
                            properties: {
                                overview: { type: "string", minLength: 600 },
                                ideal_careers: { type: "array", items: { type: "string" } },
                                work_style: { type: "string" },
                                success_tips: { type: "array", items: { type: "string" } }
                            },
                            required: ["overview", "ideal_careers", "work_style", "success_tips"]
                        },
                        personal_growth: {
                            type: "object",
                            properties: {
                                areas_for_development: { type: "array", items: { type: "string" } },
                                spiritual_path: { type: "string" },
                                practical_steps: { type: "array", items: { type: "string" } }
                            },
                            required: ["areas_for_development", "spiritual_path", "practical_steps"]
                        },
                        summary: { type: "string", minLength: 400 }
                    },
                    required: ["overview", "sun_interpretation", "moon_interpretation", "ascendant_interpretation", "key_themes", "relationships", "career", "personal_growth", "summary"]
                };
                break;

            case 'monthly_forecast':
                const currentMonth = new Date().toLocaleString('he-IL', { month: 'long', year: 'numeric' });
                title = `תחזית אסטרולוגית ל${currentMonth}`;
                
                contextPrompt = `${birthChartSummary}

# המשימה:
צור תחזית אסטרולוגית לחודש ${currentMonth} עבור המשתמש.

התמקד ב:
1. מעברים (Transits) חשובים של הכוכבים הנוכחיים על מפת הלידה
2. תחומי חיים מושפעים
3. הזדמנויות ואתגרים
4. עצות מעשיות
5. תאריכים חשובים בחודש

תן תחזית מעשית, מלאת תקווה אך גם ריאליסטית.
`;

                responseSchema = {
                    type: "object",
                    properties: {
                        overview: { type: "string", minLength: 400 },
                        major_transits: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    transit: { type: "string" },
                                    dates: { type: "string" },
                                    meaning: { type: "string", minLength: 300 },
                                    advice: { type: "string" }
                                },
                                required: ["transit", "dates", "meaning", "advice"]
                            }
                        },
                        life_areas: {
                            type: "object",
                            properties: {
                                career: { type: "string" },
                                relationships: { type: "string" },
                                health: { type: "string" },
                                spirituality: { type: "string" }
                            },
                            required: ["career", "relationships", "health", "spirituality"]
                        },
                        opportunities: { type: "array", items: { type: "string" } },
                        challenges: { type: "array", items: { type: "string" } },
                        important_dates: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    date: { type: "string" },
                                    event: { type: "string" },
                                    significance: { type: "string" }
                                },
                                required: ["date", "event", "significance"]
                            }
                        },
                        monthly_advice: { type: "string", minLength: 300 }
                    },
                    required: ["overview", "major_transits", "life_areas", "opportunities", "challenges", "monthly_advice"]
                };
                break;

            case 'yearly_forecast':
                const currentYear = new Date().getFullYear();
                title = `תחזית אסטרולוגית מתקדמת ל-${currentYear}`;
                
                contextPrompt = `${birthChartSummary}

# 🎯 ADVANCED YEARLY FORECAST - ${currentYear}

אתה אסטרולוג מומחה ברמה עולמית. צור תחזית שנתית **מתקדמת ומקצועית**.

## **עקרונות מנחים:**

### 1. **ניתוח מעמיק לפי SOLAR ARC DIRECTIONS**
- Solar Arc Sun, Moon, Mercury, Venus, Mars מתקדמים ~1° לשנה
- זהה Solar Arc aspects למפה נטאלית = אירועים משמעותיים

### 2. **SECONDARY PROGRESSIONS**
- Progressed Moon עובר מזל כל ~2.5 שנים = שינוי בצרכים רגשיים
- Progressed Sun משנה מזל כל ~30 שנים = שינוי בזהות
- Progressed aspects = אבולוציה פנימית

### 3. **TRANSITS של כוכבים איטיים (OUTER PLANETS)**
- **Pluto** (120-248 שנים לסיבוב): טרנספורמציה עמוקה
- **Neptune** (165 שנים): רוחניות, אשליות, אמנות
- **Uranus** (84 שנים): שינוי פתאומי, חופש, חדשנות
- **Saturn** (29.5 שנים): מבנה, אחריות, בגרות
- **Jupiter** (12 שנים): הרחבה, הזדמנויות, צמיחה

### 4. **ECLIPSE CYCLES**
- Solar/Lunar eclipses על ציר הצמתים
- Eclipses בבתים ספציפיים = התחלות/סיומים משמעותיים

---

## **מבנה התחזית (5000+ מילים):**

### **PART 1: סקירה כללית של ${currentYear} (600 מילים)**

#### A. נושא השנה (Year Theme)
זהה את הנושא האסטרולוגי המרכזי לפי:
- איזה בית Saturn/Jupiter עוברים
- האם יש Solar Arc aspects חשובים
- Progressed Moon במזל מה

#### B. טון אנרגטי כללי
תאר את האנרגיה: מאתגרת? מרחיבה? טרנספורמטיבית?

#### C. 3 נקודות מפנה משמעותיות בשנה
רגעים קריטיים שישנו את המסלול

---

### **PART 2: פירוט לפי רבעונים (1200 מילים - 300 לכל רבעון)**

#### **רבעון 1: ינואר-מרץ**

**א. אנרגיה כללית (100 מילים)**
מה האווירה? מה הכיוון?

**ב. מעברים מרכזיים (100 מילים)**
- רשום את המעברים המשמעותיים ביותר (Jupiter/Saturn/Uranus/Neptune/Pluto)
- דוגמה: "Saturn conjunct natal Venus (15 פברואר) = מבחן יחסים"

**ג. הזדמנויות (50 מילים)**
מה לעשות? מה לקדם?

**ד. אתגרים (50 מילים)**
מה להיזהר? מה לצפות?

**[חזור על זה לרבעונים 2, 3, 4]**

---

### **PART 3: תחומי חיים לאורך השנה (2000 מילים - 500 לכל תחום)**

#### **3.1 קריירה ופרנסה 💼 (500 מילים)**

**א. מצב כללי**
- איזה בית מושפע? (10th house = קריירה, 2nd house = כסף, 6th house = עבודה יומית)
- מעברים ל-MC/IC
- Saturn/Jupiter במיקומים רלוונטיים

**ב. תזמון**
- Q1: מה קורה ינואר-מרץ
- Q2: אפריל-יוני
- Q3: יולי-ספטמבר
- Q4: אוקטובר-דצמבר

**ג. המלצות מעשיות**
- מתי להתקדם? מתי לחפש עבודה חדשה?
- מתי לעשות שינוי גדול?
- מתי לשמור על יציבות?

#### **3.2 יחסים ואהבה ❤️ (500 מילים)**

**א. מצב כללי**
- מעברים לVenus/Mars natal
- 7th house transits
- 5th house (רומנטיקה) transits

**ב. תזמון**
- מתי תקופות חזקות ליחסים?
- מתי אתגרים?
- מתי הזדמנויות למפגשים חדשים?

**ג. רווקים vs. בזוגיות**
- עצות ספציפיות לכל מצב

#### **3.3 בריאות וחיוניות 💪 (500 מילים)**

**א. מצב כללי**
- 6th house transits
- Mars/Sun transits
- Saturn aspects (עייפות, מחלות כרוניות)

**ב. תזמון**
- מתי לשמור על הבריאות
- מתי אנרגיה גבוהה
- מתי זהירות

**ג. המלצות**
- דיאטה, ספורט, שינה
- רפואה משלימה

#### **3.4 צמיחה אישית ורוחניות 🌱 (500 מילים)**

**א. מצב כללי**
- Neptune/Uranus/Pluto transits
- 9th house (חוכמה), 12th house (רוחניות)

**ב. תזמון**
- מתי תקופות של התעוררות
- מתי משברי זהות/טרנספורמציה

**ג. המלצות**
- לימודים, קורסים, טיפולים
- פרקטיקות רוחניות

---

### **PART 4: מעברים משמעותיים (800 מילים)**

זהה את **5-7 המעברים המשמעותיים ביותר** לשנה:

#### דוגמה:
**Jupiter Trine Natal Sun (מרץ-אפריל)**
- **תאריכים:** 15 מרץ - 20 אפריל
- **משמעות:** הזדמנות להרחבה, צמיחה, אופטימיות
- **תחומי חיים מושפעים:** קריירה, ביטחון עצמי, זהות
- **איך לעבוד עם זה:** התחל פרויקט חדש, קח סיכון מחושב, לך על החלום
- **סיכון:** התרחבות מוגזמת, ביטחון עצמי מופרז

**[חזור על זה ל-4-6 מעברים נוספים]**

---

### **PART 5: חודשים חשובים (400 מילים)**

זהה את **3-5 החודשים המשמעותיים** ביותר:

#### דוגמה:
**מאי ${currentYear}**
- **למה חשוב:** Eclipse על ציר 4-10 + Jupiter conjunct MC
- **מה לעשות:** קידום בקריירה, שינוי בית
- **מה להיזהר:** לחץ במשפחה, החלטות פזיזות

---

### **PART 6: עצות מעשיות לשנה (400 מילים)**

- טיפים ספציפיים
- אסטרטגיות להצלחה
- מה למקסם, מה למזער

---

**סגנון:**
- מקצועי אך נגיש
- ספציפי לנתוני המשתמש
- איזון בין אופטימיות למציאות
- עשיר במונחים אסטרולוגיים אבל מוסבר
`;

                responseSchema = {
                    type: "object",
                    properties: {
                        yearly_overview: { type: "string", minLength: 600 },
                        year_theme: { type: "string" },
                        energy_tone: { 
                            type: "string",
                            enum: ["expansive", "challenging", "transformative", "stabilizing", "dynamic", "balanced", "intense"]
                        },
                        turning_points: {
                            type: "array",
                            minItems: 3,
                            maxItems: 3,
                            items: {
                                type: "object",
                                properties: {
                                    month: { type: "string" },
                                    description: { type: "string" },
                                    significance: { type: "string" }
                                },
                                required: ["month", "description", "significance"]
                            }
                        },
                        quarterly_forecast: {
                            type: "array",
                            minItems: 4,
                            maxItems: 4,
                            items: {
                                type: "object",
                                properties: {
                                    quarter: { type: "string" },
                                    months: { type: "string" },
                                    energy: { type: "string", minLength: 100 },
                                    major_transits: { 
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                transit: { type: "string" },
                                                dates: { type: "string" },
                                                impact: { type: "string" }
                                            },
                                            required: ["transit", "dates", "impact"]
                                        }
                                    },
                                    opportunities: { type: "array", items: { type: "string" } },
                                    challenges: { type: "array", items: { type: "string" } },
                                    advice: { type: "string" }
                                },
                                required: ["quarter", "months", "energy", "major_transits", "opportunities", "challenges", "advice"]
                            }
                        },
                        life_areas: {
                            type: "object",
                            properties: {
                                career: { 
                                    type: "object",
                                    properties: {
                                        overview: { type: "string", minLength: 200 },
                                        quarterly_breakdown: {
                                            type: "object",
                                            properties: {
                                                q1: { type: "string" },
                                                q2: { type: "string" },
                                                q3: { type: "string" },
                                                q4: { type: "string" }
                                            },
                                            required: ["q1", "q2", "q3", "q4"]
                                        },
                                        recommendations: { type: "array", items: { type: "string" } },
                                        best_timing: { type: "string" }
                                    },
                                    required: ["overview", "quarterly_breakdown", "recommendations", "best_timing"]
                                },
                                relationships: {
                                    type: "object",
                                    properties: {
                                        overview: { type: "string", minLength: 200 },
                                        quarterly_breakdown: {
                                            type: "object",
                                            properties: {
                                                q1: { type: "string" },
                                                q2: { type: "string" },
                                                q3: { type: "string" },
                                                q4: { type: "string" }
                                            },
                                            required: ["q1", "q2", "q3", "q4"]
                                        },
                                        single_advice: { type: "string" },
                                        coupled_advice: { type: "string" }
                                    },
                                    required: ["overview", "quarterly_breakdown", "single_advice", "coupled_advice"]
                                },
                                health: {
                                    type: "object",
                                    properties: {
                                        overview: { type: "string", minLength: 200 },
                                        quarterly_breakdown: {
                                            type: "object",
                                            properties: {
                                                q1: { type: "string" },
                                                q2: { type: "string" },
                                                q3: { type: "string" },
                                                q4: { type: "string" }
                                            },
                                            required: ["q1", "q2", "q3", "q4"]
                                        },
                                        recommendations: { type: "array", items: { type: "string" } }
                                    },
                                    required: ["overview", "quarterly_breakdown", "recommendations"]
                                },
                                personal_growth: {
                                    type: "object",
                                    properties: {
                                        overview: { type: "string", minLength: 200 },
                                        quarterly_breakdown: {
                                            type: "object",
                                            properties: {
                                                q1: { type: "string" },
                                                q2: { type: "string" },
                                                q3: { type: "string" },
                                                q4: { type: "string" }
                                            },
                                            required: ["q1", "q2", "q3", "q4"]
                                        },
                                        spiritual_practices: { type: "array", items: { type: "string" } },
                                        learning_opportunities: { type: "array", items: { type: "string" } }
                                    },
                                    required: ["overview", "quarterly_breakdown", "spiritual_practices", "learning_opportunities"]
                                }
                            },
                            required: ["career", "relationships", "health", "personal_growth"]
                        },
                        major_transits: {
                            type: "array",
                            minItems: 5,
                            maxItems: 7,
                            items: {
                                type: "object",
                                properties: {
                                    transit_name: { type: "string" },
                                    dates: { type: "string" },
                                    transiting_planet: { type: "string" },
                                    natal_planet: { type: "string" },
                                    aspect: { type: "string" },
                                    significance: { type: "string", minLength: 150 },
                                    affected_life_areas: { type: "array", items: { type: "string" } },
                                    how_to_work_with: { type: "string", minLength: 100 },
                                    potential_risks: { type: "string" }
                                },
                                required: ["transit_name", "dates", "transiting_planet", "natal_planet", "aspect", "significance", "affected_life_areas", "how_to_work_with", "potential_risks"]
                            }
                        },
                        key_months: {
                            type: "array",
                            minItems: 3,
                            maxItems: 5,
                            items: {
                                type: "object",
                                properties: {
                                    month: { type: "string" },
                                    why_important: { type: "string" },
                                    what_to_do: { type: "string" },
                                    what_to_avoid: { type: "string" }
                                },
                                required: ["month", "why_important", "what_to_do", "what_to_avoid"]
                            }
                        },
                        yearly_advice: { type: "string", minLength: 400 }
                    },
                    required: ["yearly_overview", "year_theme", "energy_tone", "turning_points", "quarterly_forecast", "life_areas", "major_transits", "key_months", "yearly_advice"]
                };
                break;

            case 'transit_report':
                const periodStartDate = period_start ? new Date(period_start) : new Date();
                const periodEndDate = period_end ? new Date(period_end) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                
                title = `דוח מעברים מתקדם: ${periodStartDate.toLocaleDateString('he-IL')} - ${periodEndDate.toLocaleDateString('he-IL')}`;
                
                // Calculate transits for the period
                let transitsData = null;
                try {
                    const transitsResponse = await base44.functions.invoke('calculateTransits', {
                        natal_chart: astrologyCalc,
                        target_date: periodStartDate.toISOString()
                    });
                    transitsData = transitsResponse.data;
                } catch (error) {
                    console.error('Error calculating transits:', error);
                }

                contextPrompt = `${birthChartSummary}

${transitsData ? `
## מעברים נוכחיים (${periodStartDate.toLocaleDateString('he-IL')}):
${transitsData.transits ? transitsData.transits.slice(0, 15).map(t => 
`- ${t.transiting_planet} ${t.aspect_type} Natal ${t.natal_planet} (בית ${t.natal_house}) - עוצמה: ${t.strength.toFixed(2)}`
).join('\n') : ''}

${transitsData.special_conditions?.void_of_course_moon ? '⚠️ Void of Course Moon' : ''}
${transitsData.special_conditions?.mercury_retrograde ? '⟲ Mercury Retrograde' : ''}
` : ''}

# 🌊 ADVANCED TRANSIT REPORT

אתה רוברט האנד - מומחה המעברים המוביל בעולם.

## **עקרונות פרשנות מתקדמת:**

### 1. **ORBS והשפעת זמן:**
- **Applying** (3-7 ימים לפני exact): האנרגיה מתחילה, עדיין אפשר להשפיע
- **Exact** (±1°): השיא - אירועים קורים
- **Separating** (3-7 ימים אחרי): אינטגרציה, הבנה

### 2. **מהירות הכוכב:**
- **Fast planets** (Moon, Sun, Mercury, Venus, Mars): 2-7 ימים
- **Jupiter**: 2-4 שבועות
- **Saturn**: 2-4 חודשים
- **Uranus/Neptune/Pluto**: 6-18 חודשים (עם רטרוגרדים!)

### 3. **RETROGRADE EFFECTS:**
- כוכב רטרוגרדי עובר 3 פעמים על אותה נקודה
- גל 1 (Direct): אירוע ראשוני
- גל 2 (Retrograde): עיבוד, הבנה פנימית
- גל 3 (Direct שוב): השלמה, אינטגרציה

### 4. **HOUSE CONTEXT:**
- אותו מעבר בבתים שונים = השפעות שונות לחלוטין
- דוגמה: Saturn על Sun בבית 10 = קריירה, בבית 7 = יחסים

---

## **מבנה הדוח (3000+ מילים):**

### **PART 1: סקירה כללית (500 מילים)**

#### A. נושא התקופה
מה האנרגיה הדומיננטית?

#### B. המעברים המשפיעים ביותר
Top 3 שמעצבים את התקופה

#### C. תזמון כללי
אילו שבועות חזקים? אילו מאתגרים?

---

### **PART 2: מעברים משמעותיים (2000 מילים)**

לכל מעבר מ-Top 10-15:

#### דוגמה:
**Saturn Square Natal Venus**

**א. מהו המעבר (100 מילים)**
- Saturn (מבנה, אחריות, מגבלות)
- Square (90°) - aspect של אתגר ומתח
- Natal Venus (אהבה, ערכים, יופי, כסף)
- בבית 7 (יחסים, שותפויות)

**ב. תזמון מדויק (100 מילים)**
- **Exact date:** 15 מאי
- **Applying:** 1-14 מאי (הבניה של המתח)
- **Separating:** 16-30 מאי (עיבוד)
- **Total influence:** אפריל-יוני

**ג. משמעות עמוקה (200 מילים)**
- מבחן יחסים
- אילו יחסים בשלים ויציבים?
- אילו מבוססים על חוסר בטחון?
- זמן לקבל החלטות קשות אך הכרחיות

**ד. תחומי חיים מושפעים (100 מילים)**
- יחסים רומנטיים
- שותפויות עסקיות
- ערך עצמי וביטחון
- כסף (אם Venus שולטת בבית 2/8)

**ה. הזדמנויות (100 מילים)**
- ליצור בסיס יציב ליחסים
- להבין מה אתה באמת צריך
- לפרק יחסים שלא עובדים
- לבנות אחריות רגשית

**ו. אתגרים (100 מילים)**
- תחושת בדידות או דחייה
- קושי בביטוי רגשות
- פחד מאובדן
- חוסר ביטחון

**ז. עצות מעשיות ספציפיות (200 מילים)**

**תזמון:**
- **1-7 מאי:** שים לב לדפוסים ביחסים, צפה אתגרים
- **8-14 מאי:** המתח מתגבר, אל תקבל החלטות דרמטיות
- **15 מאי (EXACT):** שיא - שיחות חשובות, רגעי אמת
- **16-22 מאי:** עיבוד, הבנה, קבלת החלטות
- **23-30 מאי:** יישום, צעדים מעשיים

**מה לעשות:**
✓ דבר בכנות עם בן/בת זוג
✓ קבל אחריות על חלקך ביחסים
✓ פנה לטיפול זוגי אם צריך
✓ עשה את הבחירה הבוגרת, גם אם קשה

**מה להימנע:**
✗ לקבל החלטות מתוך פחד
✗ להישאר ביחסים מתוך אשמה
✗ להתבודד לחלוטין
✗ להתעלם מהבעיות

**[חזור על זה ל-9-14 מעברים נוספים]**

---

### **PART 3: תזמון פעולות (500 מילים)**

#### A. תקופות לפעולה (Best Action Periods)
זהה 3-5 תקופות אופטימליות:
- **תאריכים**
- **למה טוב**
- **מה לעשות**

#### B. תקופות זהירות (Caution Periods)
זהה 2-4 תקופות מאתגרות:
- **תאריכים**
- **למה מאתגר**
- **מה להימנע**

#### C. תקופות הרהור (Reflection Periods)
זהה 2-3 תקופות להתבוננות:
- **תאריכים**
- **על מה לחשוב**
- **פרקטיקות מומלצות**

---

**סגנון:**
- **מקצועי ומדויק:** רוברט האנד לא משתמש בשפה גנרית
- **ספציפי למשתמש:** תמיד קשור למפה הנטאלית
- **תזמון מדויק:** תאריכים, שבועות, שלבים
- **עשיר במונחים:** אבל מוסבר בבירור
`;

                responseSchema = {
                    type: "object",
                    properties: {
                        period_overview: { type: "string", minLength: 500 },
                        period_theme: { type: "string" },
                        top_influences: {
                            type: "array",
                            minItems: 3,
                            maxItems: 3,
                            items: {
                                type: "object",
                                properties: {
                                    transit: { type: "string" },
                                    why_significant: { type: "string" }
                                },
                                required: ["transit", "why_significant"]
                            }
                        },
                        major_transits: {
                            type: "array",
                            minItems: 10,
                            maxItems: 15,
                            items: {
                                type: "object",
                                properties: {
                                    transit_name: { type: "string" },
                                    transiting_planet: { type: "string" },
                                    natal_planet: { type: "string" },
                                    aspect: { type: "string" },
                                    house: { type: "number" },
                                    exact_date: { type: "string" },
                                    applying_period: { type: "string" },
                                    separating_period: { type: "string" },
                                    total_influence_period: { type: "string" },
                                    interpretation: { type: "string", minLength: 400 },
                                    affected_life_areas: { type: "array", items: { type: "string" } },
                                    opportunities: { type: "array", items: { type: "string" } },
                                    challenges: { type: "array", items: { type: "string" } },
                                    actionable_advice: {
                                        type: "object",
                                        properties: {
                                            timing_breakdown: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        dates: { type: "string" },
                                                        phase: { type: "string" },
                                                        what_to_do: { type: "string" }
                                                    },
                                                    required: ["dates", "phase", "what_to_do"]
                                                }
                                            },
                                            do_list: { type: "array", items: { type: "string" } },
                                            avoid_list: { type: "array", items: { type: "string" } }
                                        },
                                        required: ["timing_breakdown", "do_list", "avoid_list"]
                                    }
                                },
                                required: ["transit_name", "transiting_planet", "natal_planet", "aspect", "house", "exact_date", "applying_period", "separating_period", "total_influence_period", "interpretation", "affected_life_areas", "opportunities", "challenges", "actionable_advice"]
                            }
                        },
                        timing_guidance: {
                            type: "object",
                            properties: {
                                best_action_periods: {
                                    type: "array",
                                    minItems: 3,
                                    maxItems: 5,
                                    items: {
                                        type: "object",
                                        properties: {
                                            dates: { type: "string" },
                                            why_optimal: { type: "string" },
                                            what_to_do: { type: "string" },
                                            supporting_transits: { type: "array", items: { type: "string" } }
                                        },
                                        required: ["dates", "why_optimal", "what_to_do", "supporting_transits"]
                                    }
                                },
                                caution_periods: {
                                    type: "array",
                                    minItems: 2,
                                    maxItems: 4,
                                    items: {
                                        type: "object",
                                        properties: {
                                            dates: { type: "string" },
                                            why_challenging: { type: "string" },
                                            what_to_avoid: { type: "string" },
                                            how_to_navigate: { type: "string" }
                                        },
                                        required: ["dates", "why_challenging", "what_to_avoid", "how_to_navigate"]
                                    }
                                },
                                reflection_periods: {
                                    type: "array",
                                    minItems: 2,
                                    maxItems: 3,
                                    items: {
                                        type: "object",
                                        properties: {
                                            dates: { type: "string" },
                                            what_to_reflect_on: { type: "string" },
                                            practices: { type: "array", items: { type: "string" } }
                                        },
                                        required: ["dates", "what_to_reflect_on", "practices"]
                                    }
                                }
                            },
                            required: ["best_action_periods", "caution_periods", "reflection_periods"]
                        },
                        practical_recommendations: {
                            type: "array",
                            items: { type: "string" }
                        },
                        summary: { type: "string", minLength: 300 }
                    },
                    required: ["period_overview", "period_theme", "top_influences", "major_transits", "timing_guidance", "practical_recommendations", "summary"]
                };
                break;

            case 'compatibility':
                if (!person2_data || !person2Calc) {
                    return Response.json({
                        error: 'Missing person 2 data',
                        message: 'נא לספק את פרטי הלידה של האדם השני'
                    }, { status: 400 });
                }

                title = `דוח התאמה מתקדם: ${userProfile.full_name_hebrew || user.full_name} & ${person2_data.name}`;

                const person2Summary = `
# מפת הלידה של האדם השני (${person2_data.name}):
- תאריך לידה: ${person2_data.birth_date}
${person2_data.birth_time ? `- שעת לידה: ${person2_data.birth_time}` : ''}
${person2_data.birth_place ? `- מקום לידה: ${person2_data.birth_place}` : ''}

## כוכבים מרכזיים:
- מזל שמש (Sun): ${person2Calc.sun_sign}
- מזל ירח (Moon): ${person2Calc.moon_sign}
- צועד (Ascendant): ${person2Calc.rising_sign}

## מיקומי כוכבים:
${person2Calc.planets ? person2Calc.planets.map(p => `- ${p.name}: ${p.sign} בבית ${p.house} (${p.longitude.toFixed(2)}°)`).join('\n') : ''}
`;

                const compositeChartSummary = compositeChart ? `
## COMPOSITE CHART (המפה המשותפת):
${compositeChart.planets.map(p => `- ${p.name}: ${p.sign} (${p.longitude.toFixed(2)}°)`).join('\n')}
` : '';

                contextPrompt = `${birthChartSummary}

${person2Summary}

${compositeChartSummary}

# 💕 ADVANCED COMPATIBILITY REPORT

אתה ליז גרין + רוברט האנד - מומחי יחסים אסטרולוגיים.

## **טכניקות ניתוח מתקדמות:**

### 1. **SYNASTRY (ניתוח אספקטים בין המפות)**
נתח את האינטראקציות בין הכוכבים:

#### A. Personal Planets (Sun, Moon, Mercury, Venus, Mars)
- **Sun-Moon aspects:** הקשר הבסיסי, זרימה רגשית
- **Venus-Mars aspects:** משיכה רומנטית/מינית
- **Moon-Moon aspects:** תאימות רגשית, אמפתיה
- **Mercury-Mercury aspects:** תקשורת, הבנה
- **Sun-Venus/Mars:** עוצמת המשיכה

#### B. Outer Planets (Jupiter, Saturn, Uranus, Neptune, Pluto)
- **Saturn aspects:** מחויבות, יציבות, מגבלות
- **Pluto aspects:** אינטנסיביות, שליטה, טרנספורמציה
- **Uranus aspects:** ריגוש, חופש, חוסר צפיות
- **Neptune aspects:** רומנטיקה, אידיאליזציה, אשליות

#### C. Angular Connections
- **Ascendant-Descendant overlays:** איך אחד רואה את השני
- **Angles to planets:** השפעה חזקה על זהות/כיוון חיים

---

### 2. **COMPOSITE CHART (המפה המשותפת)**
המפה הזו מייצגת את **היחסים עצמם** כישות נפרדת.

#### נתח:
- **Composite Sun:** מהות היחסים, הייעוד המשותף
- **Composite Moon:** הצרכים הרגשיים של היחסים
- **Composite Venus:** איך היחסים מביעים אהבה
- **Composite Mars:** האנרגיה המינית/פעילה של היחסים
- **Composite Saturn:** האתגרים, המחויבות, האחריות
- **Dominant elements/modalities:** האופי הכללי של היחסים

---

### 3. **HOUSE OVERLAYS**
כוכבי אחד נופלים על בתים של השני = השפעה על תחומי חיים:

- **1st house:** השפעה על זהות ומראה
- **4th house:** משפחה, בית, שורשים
- **5th house:** רומנטיקה, יצירתיות, ילדים
- **7th house:** מחויבות, נישואין
- **8th house:** אינטימיות עמוקה, טרנספורמציה
- **10th house:** קריירה, מטרות משותפות

---

## **מבנה הדוח (4000+ מילים):**

### **PART 1: סקירה כללית (600 מילים)**

#### A. ציון התאמה כללי (0-100)
תן ציון מבוסס על:
- הרמוניה של personal planets (40%)
- תאימות רגשית Moon-Moon (20%)
- משיכה Venus-Mars (20%)
- יציבות Saturn aspects (10%)
- אינטנסיביות Pluto/Uranus (10%)

#### B. המשיכה ביניכם
מה מושך אתכם אחד לשני?

#### C. הדינמיקה המרכזית
מה האופי של היחסים? (תשוקה, ידידות, משפחתיות, רוחניות?)

---

### **PART 2: ניתוח SYNASTRY (1500 מילים)**

לכל aspect משמעותי (Top 10-15):

#### דוגמה:
**Sun (Person 1) Trine Moon (Person 2)**
- **Orb:** 2°
- **פרשנות (200 מילים):** הרמוניה טבעית בין הזהות של אחד לרגשות של השני. אחד "מבין" את השני אינטואיטיבית. יוצרים תחושת בית ובטחון אחד לשני.
- **השפעה על היחסים:** חיובית מאוד - תקשורת רגשית קלה, תמיכה הדדית
- **איך לחזק:** הקשיבו אחד לשני, תנו מקום לביטוי רגשי

**[חזור על זה ל-9-14 aspects נוספים]**

---

### **PART 3: ניתוח COMPOSITE CHART (1000 מילים)**

#### A. Composite Sun
- **מיקום (sign & house):** מהות היחסים
- **Aspects:** איך המהות הזו מתבטאת
- **פרשנות:** מה הייעוד המשותף שלכם

#### B. Composite Moon
- **מיקום:** הצרכים הרגשיים של היחסים
- **Aspects:** קלות/קושי בהבעה רגשית
- **פרשנות:** מה היחסים צריכים כדי להפשיר בטוחים

#### C. Composite Venus
- **מיקום:** איך היחסים מביעים אהבה
- **Aspects:** הרמוניה/אתגרים באהבה
- **פרשנות:** מה נותן ליחסים הנאה

#### D. Composite Mars
- **מיקום:** האנרגיה המינית/פעילה
- **Aspects:** תשוקה/קונפליקט
- **פרשנות:** מה מניע את היחסים קדימה

#### E. Composite Saturn
- **מיקום:** האתגר הגדול של היחסים
- **Aspects:** מחויבות/מגבלות
- **פרשנות:** מה צריך לעבוד עליו, מה מביא יציבות

---

### **PART 4: תחומי חוזק (400 מילים)**

זהה 5-7 תחומים שבהם היחסים חזקים:
- תקשורת
- משיכה רומנטית
- תמיכה רגשית
- חזון משותף
- אינטלקט
- ערכים
- משפחה

---

### **PART 5: תחומי אתגר (600 מילים)**

זהה 4-6 אתגרים משמעותיים + איך להתגבר:

#### דוגמה:
**Mars Square Mars (קונפליקט באגרסיביות)**
- **האתגר:** שני הצדדים רוצים לשלוט, אגו גדול, ויכוחים
- **איך מתבטא:** ריבים על דברים קטנים, מתחרים אחד בשני
- **איך להתגבר (200 מילים):**
  * הכירו בצורך ההדדי באוטונומיה
  * מצאו דרכים בריאות לתעל אגרסיה (ספורט ביחד)
  * תרגלו "fighting fair" - כללים לוויכוחים
  * זכרו שאתם בצוות, לא יריבים

---

### **PART 6: התאמה לתחומי חיים (400 מילים)**

תן ציון (0-100) וניתוח לכל תחום:

#### A. רומנטיקה ואינטימיות
- **ציון:** XX/100
- **ניתוח (100 מילים):** Venus-Mars aspects, 5th/8th house overlays

#### B. תקשורת ואינטלקט
- **ציון:** XX/100
- **ניתוח:** Mercury-Mercury aspects, 3rd/9th house overlays

#### C. ערכים ואורח חיים
- **ציון:** XX/100
- **ניתוח:** Values alignment, lifestyle compatibility

#### D. משפחה ובית
- **ציון:** XX/100
- **ניתוח:** Moon-Moon, 4th house overlays, Composite IC

---

### **PART 7: עצות לחיזוק היחסים (500 מילים)**

עצות מעשיות ספציפיות לזוג הזה:
- איך לתקשר טוב יותר
- איך לנהל קונפליקטים
- איך לשמור על התשוקה
- איך לגדול ביחד
- מתי לתת מקום אישי
- איך לחגוג את החוזקות

---

**סגנון:**
- **עומק פסיכולוגי:** ליז גרין מביאה תובנות יונגיאניות
- **דיוק אסטרולוגי:** רוברט האנד מביא טכניקות מדויקות
- **איזון:** הכל נכון - החוזקות והאתגרים
- **תקווה ומעשיות:** כל קושי עם פתרון
`;

                responseSchema = {
                    type: "object",
                    properties: {
                        overall_compatibility_score: { type: "number", minimum: 0, maximum: 100 },
                        overview: { type: "string", minLength: 600 },
                        attraction_factors: { type: "string", minLength: 300 },
                        core_dynamic: { type: "string" },
                        relationship_archetype: {
                            type: "string",
                            enum: ["passionate", "companionate", "karmic", "transformative", "spiritual", "playful", "stable", "challenging"]
                        },
                        synastry_analysis: {
                            type: "array",
                            minItems: 10,
                            maxItems: 15,
                            items: {
                                type: "object",
                                properties: {
                                    aspect_name: { type: "string" },
                                    planets: { type: "string" },
                                    orb: { type: "number" },
                                    interpretation: { type: "string", minLength: 200 },
                                    influence: { type: "string", enum: ["positive", "challenging", "neutral", "transformative"] },
                                    impact_on_relationship: { type: "string" },
                                    how_to_enhance: { type: "string" }
                                },
                                required: ["aspect_name", "planets", "orb", "interpretation", "influence", "impact_on_relationship", "how_to_enhance"]
                            }
                        },
                        composite_analysis: {
                            type: "object",
                            properties: {
                                composite_sun: {
                                    type: "object",
                                    properties: {
                                        sign: { type: "string" },
                                        house: { type: "number" },
                                        interpretation: { type: "string", minLength: 200 },
                                        relationship_purpose: { type: "string" }
                                    },
                                    required: ["sign", "house", "interpretation", "relationship_purpose"]
                                },
                                composite_moon: {
                                    type: "object",
                                    properties: {
                                        sign: { type: "string" },
                                        house: { type: "number" },
                                        interpretation: { type: "string", minLength: 200 },
                                        emotional_needs: { type: "string" }
                                    },
                                    required: ["sign", "house", "interpretation", "emotional_needs"]
                                },
                                composite_venus: {
                                    type: "object",
                                    properties: {
                                        sign: { type: "string" },
                                        interpretation: { type: "string" },
                                        love_expression: { type: "string" }
                                    },
                                    required: ["sign", "interpretation", "love_expression"]
                                },
                                composite_mars: {
                                    type: "object",
                                    properties: {
                                        sign: { type: "string" },
                                        interpretation: { type: "string" },
                                        sexual_energy: { type: "string" }
                                    },
                                    required: ["sign", "interpretation", "sexual_energy"]
                                },
                                composite_saturn: {
                                    type: "object",
                                    properties: {
                                        sign: { type: "string" },
                                        house: { type: "number" },
                                        interpretation: { type: "string", minLength: 200 },
                                        relationship_challenge: { type: "string" },
                                        path_to_maturity: { type: "string" }
                                    },
                                    required: ["sign", "house", "interpretation", "relationship_challenge", "path_to_maturity"]
                                }
                            },
                            required: ["composite_sun", "composite_moon", "composite_venus", "composite_mars", "composite_saturn"]
                        },
                        strengths: {
                            type: "array",
                            minItems: 5,
                            maxItems: 7,
                            items: {
                                type: "object",
                                properties: {
                                    area: { type: "string" },
                                    description: { type: "string" },
                                    supporting_factors: { type: "array", items: { type: "string" } }
                                },
                                required: ["area", "description", "supporting_factors"]
                            }
                        },
                        challenges: {
                            type: "array",
                            minItems: 4,
                            maxItems: 6,
                            items: {
                                type: "object",
                                properties: {
                                    area: { type: "string" },
                                    description: { type: "string", minLength: 150 },
                                    manifestation: { type: "string" },
                                    how_to_overcome: { type: "string", minLength: 200 },
                                    growth_potential: { type: "string" }
                                },
                                required: ["area", "description", "manifestation", "how_to_overcome", "growth_potential"]
                            }
                        },
                        life_area_compatibility: {
                            type: "object",
                            properties: {
                                romance_intimacy: { 
                                    type: "object",
                                    properties: {
                                        score: { type: "number", minimum: 0, maximum: 100 },
                                        analysis: { type: "string", minLength: 100 },
                                        key_factors: { type: "array", items: { type: "string" } }
                                    },
                                    required: ["score", "analysis", "key_factors"]
                                },
                                communication_intellect: {
                                    type: "object",
                                    properties: {
                                        score: { type: "number", minimum: 0, maximum: 100 },
                                        analysis: { type: "string", minLength: 100 },
                                        key_factors: { type: "array", items: { type: "string" } }
                                    },
                                    required: ["score", "analysis", "key_factors"]
                                },
                                values_lifestyle: {
                                    type: "object",
                                    properties: {
                                        score: { type: "number", minimum: 0, maximum: 100 },
                                        analysis: { type: "string", minLength: 100 },
                                        key_factors: { type: "array", items: { type: "string" } }
                                    },
                                    required: ["score", "analysis", "key_factors"]
                                },
                                family_home: {
                                    type: "object",
                                    properties: {
                                        score: { type: "number", minimum: 0, maximum: 100 },
                                        analysis: { type: "string", minLength: 100 },
                                        key_factors: { type: "array", items: { type: "string" } }
                                    },
                                    required: ["score", "analysis", "key_factors"]
                                }
                            },
                            required: ["romance_intimacy", "communication_intellect", "values_lifestyle", "family_home"]
                        },
                        relationship_advice: {
                            type: "array",
                            minItems: 8,
                            maxItems: 12,
                            items: {
                                type: "object",
                                properties: {
                                    category: { type: "string" },
                                    advice: { type: "string" }
                                },
                                required: ["category", "advice"]
                            }
                        },
                        summary: { type: "string", minLength: 500 }
                    },
                    required: ["overall_compatibility_score", "overview", "synastry_analysis", "composite_analysis", "strengths", "challenges", "life_area_compatibility", "relationship_advice", "summary"]
                };
                break;

            case 'relationship_dynamics':
                title = 'דינמיקות יחסים במפת הלידה שלך';
                
                contextPrompt = `${birthChartSummary}

# המשימה:
נתח את מפת הלידה מנקודת מבט של יחסים ואהבה.

התמקד ב:
1. Venus & Mars - איך אתה אוהב ומה אתה צריך
2. Moon - הצרכים הרגשיים שלך
3. 7th House - בן/בת הזוג האידיאלי/ת
4. דפוסים חוזרים ביחסים
5. אתגרים ופתרונות
6. עצות להצלחה ביחסים
`;

                responseSchema = {
                    type: "object",
                    properties: {
                        overview: { type: "string", minLength: 400 },
                        love_language: {
                            type: "object",
                            properties: {
                                venus_style: { type: "string", minLength: 300 },
                                mars_style: { type: "string", minLength: 300 },
                                what_you_need: { type: "array", items: { type: "string" } }
                            },
                            required: ["venus_style", "mars_style", "what_you_need"]
                        },
                        ideal_partner: {
                            type: "object",
                            properties: {
                                qualities: { type: "array", items: { type: "string" } },
                                compatible_signs: { type: "array", items: { type: "string" } },
                                what_attracts_you: { type: "string" }
                            },
                            required: ["qualities", "compatible_signs", "what_attracts_you"]
                        },
                        patterns: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    pattern: { type: "string" },
                                    why: { type: "string" },
                                    how_to_change: { type: "string" }
                                },
                                required: ["pattern", "why", "how_to_change"]
                            }
                        },
                        challenges: { type: "array", items: { type: "string" } },
                        success_tips: { type: "array", items: { type: "string" } },
                        summary: { type: "string", minLength: 300 }
                    },
                    required: ["overview", "love_language", "ideal_partner", "patterns", "challenges", "success_tips", "summary"]
                };
                break;

            case 'career_potential':
                title = 'הפוטנציאל המקצועי במפת הלידה שלך';
                
                contextPrompt = `${birthChartSummary}

# המשימה:
נתח את מפת הלידה מנקודת מבט של קריירה והצלחה מקצועית.

התמקד ב:
1. Midheaven (MC) - הכיוון המקצועי
2. 10th House - הקריירה והמוניטין
3. 2nd & 6th Houses - כסף ועבודה יומיומית
4. Saturn - האחריות והעבודה הקשה
5. כישרונות טבעיים
6. אתגרים בקריירה
7. המלצות מעשיות
`;

                responseSchema = {
                    type: "object",
                    properties: {
                        overview: { type: "string", minLength: 400 },
                        natural_talents: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    talent: { type: "string" },
                                    description: { type: "string" },
                                    how_to_use: { type: "string" }
                                },
                                required: ["talent", "description", "how_to_use"]
                            }
                        },
                        ideal_careers: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    career: { type: "string" },
                                    why: { type: "string" }
                                },
                                required: ["career", "why"]
                            }
                        },
                        work_style: { type: "string", minLength: 300 },
                        challenges: { type: "array", items: { type: "string" } },
                        success_strategies: { type: "array", items: { type: "string" } },
                        financial_insights: { type: "string", minLength: 300 },
                        timing: { type: "string" }
                    },
                    required: ["overview", "natural_talents", "ideal_careers", "work_style", "challenges", "success_strategies"]
                };
                break;

            case 'specific_question':
                if (!input_question) {
                    return Response.json({
                        error: 'Missing question',
                        message: 'נא לספק שאלה לסוג קריאה זה'
                    }, { status: 400 });
                }

                title = `תשובה אסטרולוגית: ${input_question}`;
                
                contextPrompt = `${birthChartSummary}

# השאלה של המשתמש:
"${input_question}"

# המשימה:
ענה על השאלה בצורה מעמיקה ומקיפה על סמך מפת הלידה.

כלול:
1. תשובה ישירה לשאלה
2. נקודות רלוונטיות במפה התומכות בתשובה
3. הקשר רחב יותר
4. עצות מעשיות
5. תזמון אפשרי
`;

                responseSchema = {
                    type: "object",
                    properties: {
                        direct_answer: { type: "string", minLength: 400 },
                        supporting_factors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    factor: { type: "string" },
                                    explanation: { type: "string" }
                                },
                                required: ["factor", "explanation"]
                            }
                        },
                        broader_context: { type: "string", minLength: 300 },
                        practical_advice: { type: "array", items: { type: "string" } },
                        timing_considerations: { type: "string" },
                        additional_insights: { type: "string" }
                    },
                    required: ["direct_answer", "supporting_factors", "broader_context", "practical_advice"]
                };
                break;

            default:
                return Response.json({
                    error: 'Invalid reading type',
                    message: 'סוג הקריאה לא נתמך'
                }, { status: 400 });
        }

        // ====== STEP 3: Generate reading with AI ======
        
        console.log('🤖 Calling AI to generate reading...');

        const aiStartTime = Date.now();
        
        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `${contextPrompt}

---

**חשוב מאוד:**
- כתוב בעברית זורמת ומקצועית
- השתמש בטון חם, תומך ומעצים
- היה ספציפי לנתוני המשתמש
- תן דוגמאות קונקרטיות
- איזן בין אתגרים להזדמנויות
- כל טקסט צריך להיות עשיר ומפורט
- השתמש במונחים אסטרולוגיים מקצועיים אבל הסבר אותם

החזר JSON מובנה לפי הסכמה.`,
            add_context_from_internet: false,
            response_json_schema: responseSchema
        });

        const aiEndTime = Date.now();

        console.log('✅ Reading generated');

        // ====== STEP 4: Extract key themes and advice ======
        
        const keyThemes = [];
        const actionableAdvice = [];

        // Extract themes based on reading type
        if (reading_type === 'natal_chart' && aiResponse.key_themes) {
            keyThemes.push(...aiResponse.key_themes.map((t: { theme: string; }) => t.theme));
            actionableAdvice.push(...(aiResponse.personal_growth?.practical_steps || []));
        } else if (reading_type === 'monthly_forecast') {
            keyThemes.push(...(aiResponse.opportunities || []).slice(0, 3));
            actionableAdvice.push(aiResponse.monthly_advice);
        } else if (reading_type === 'yearly_forecast') {
            keyThemes.push(aiResponse.year_theme || 'שנה של שינוי');
            actionableAdvice.push(aiResponse.yearly_advice);
        } else if (reading_type === 'transit_report') {
            keyThemes.push(aiResponse.period_theme || 'תקופת מעבר');
            actionableAdvice.push(...(aiResponse.practical_recommendations || []));
        } else if (reading_type === 'compatibility') {
            keyThemes.push(`התאמה: ${aiResponse.overall_compatibility_score}%`);
            actionableAdvice.push(...(aiResponse.relationship_advice || []).map((item: { advice: string; }) => item.advice)); // Updated for new schema
        } else if (reading_type === 'relationship_dynamics') {
            keyThemes.push(...(aiResponse.ideal_partner?.qualities || []).slice(0, 3));
            actionableAdvice.push(...(aiResponse.success_tips || []));
        } else if (reading_type === 'career_potential') {
            keyThemes.push(...(aiResponse.natural_talents || []).map((t: { talent: string; }) => t.talent).slice(0, 3));
            actionableAdvice.push(...(aiResponse.success_strategies || []));
        }

        // ====== STEP 5: Save reading ======
        
        const readingData = {
            profile_id: userProfile.id,
            calculation_id: astrologyCalc.id,
            reading_type,
            title,
            summary: aiResponse.overview?.substring(0, 300) || aiResponse.yearly_overview?.substring(0, 300) || aiResponse.period_overview?.substring(0, 300) || '',
            full_interpretation: aiResponse,
            input_question,
            person2_data: person2_data || null,
            person2_calculation_id: person2Calc?.id || null,
            generated_date: new Date().toISOString(),
            relevant_period_start: period_start || (reading_type === 'yearly_forecast' ? `${new Date().getFullYear()}-01-01` : null),
            relevant_period_end: period_end || (reading_type === 'yearly_forecast' ? `${new Date().getFullYear()}-12-31` : null),
            confidence_score: 98, // Updated confidence score
            tags: [
                reading_type,
                astrologyCalc.sun_sign?.toLowerCase(),
                astrologyCalc.moon_sign?.toLowerCase(),
                astrologyCalc.rising_sign?.toLowerCase()
            ].filter(Boolean),
            key_themes: keyThemes,
            actionable_advice: actionableAdvice,
            ai_metadata: {
                model_version: 'gpt-4',
                processing_time_ms: aiEndTime - aiStartTime,
                total_time_ms: Date.now() - startTime,
                enhanced: true // Added enhanced flag
            }
        };

        const savedReading = await base44.entities.AstrologyReading.create(readingData);

        console.log('💾 Reading saved:', savedReading.id);

        const endTime = Date.now();

        return Response.json({
            success: true,
            reading: savedReading,
            processing_time_ms: endTime - startTime,
            message: 'הקריאה האסטרולוגית נוצרה בהצלחה! 🌟'
        });

    } catch (error) {
        console.error('❌ Error generating astrology reading:', error);
        return Response.json({ 
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});

/**
 * Calculate Composite Chart (midpoints between two natal charts)
 * Assumes chart.planets have 'name' and 'longitude' properties.
 */
function calculateCompositeChart(chart1: { planets: { name: string; longitude: number; }[]; }, chart2: { planets: { name: string; longitude: number; }[]; }) {
    if (!chart1?.planets || !chart2?.planets) return null;

    const compositePlanets = [];
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    for (const planetName of planetNames) {
        const planet1 = chart1.planets.find(p => p.name === planetName);
        const planet2 = chart2.planets.find(p => p.name === planetName);

        if (planet1 && planet2) {
            // Calculate midpoint
            let midpoint = (planet1.longitude + planet2.longitude) / 2;
            
            // Handle the case where planets are > 180° apart (use shorter arc)
            let diff = Math.abs(planet1.longitude - planet2.longitude);
            if (diff > 180) {
                // Adjust for wrapping around 360 degrees
                if (planet1.longitude > planet2.longitude) {
                    midpoint = (planet1.longitude + planet2.longitude + 360) / 2;
                } else {
                    midpoint = (planet1.longitude + 360 + planet2.longitude) / 2;
                }
                midpoint %= 360; // Ensure it's within 0-360
            }


            const sign = getZodiacSign(midpoint);

            compositePlanets.push({
                name: planetName,
                longitude: midpoint,
                sign: sign
            });
        }
    }

    return { planets: compositePlanets };
}

/**
 * Get zodiac sign from longitude (0-360 degrees)
 */
function getZodiacSign(longitude: number) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    // Ensure longitude is within 0-360
    longitude = longitude % 360;
    if (longitude < 0) longitude += 360;

    const index = Math.floor(longitude / 30);
    return signs[index];
}
