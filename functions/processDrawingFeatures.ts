import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * ADVANCED DRAWING ANALYSIS - PROFESSIONAL VERSION
 * 
 * מערכת מקצועית לניתוח אופי מציורים פרויקטיביים
 * 
 * מבוסס על:
 * - Machover (1949) - "Drawing of the Human Figure"
 * - Hammer (1958) - "Clinical Application of Projective Drawings"
 * - Koch (1952) - "Baum Test (Tree Test)"
 * - Koppitz (1968) - "Emotional Indicators in HTP"
 * - Buck (1948) - "House-Tree-Person Test"
 * - Guo et al. (2023) - Meta-analysis of 30 studies
 * 
 * הכללים כוללים:
 * - מאפיינים גרפיים (גודל, מיקום, לחץ, קואורדינציה)
 * - סימבוליקה תוכנית (דמות, עץ, בית)
 * - אינדיקטורים רגשיים (30+ אינדיקטורים של Koppitz)
 * - זיהוי חריגות וזיופים
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
            image_url,
            drawing_type = 'person', // 'person', 'tree', 'house', 'family', 'free'
            user_age = null,
            user_gender = null,
            drawing_metadata = null // dynamic data: strokes, timing, pressure
        } = body;

        console.log('🎨 Advanced Drawing Analysis Start:', { drawing_type, user: user.email });

        // ====== PHASE 1: IMAGE QUALITY & AUTHENTICITY CHECK ======
        
        const authenticityCheck = analyzeAuthenticity(drawing_metadata);
        console.log('🔍 Authenticity Check:', authenticityCheck);

        // ====== PHASE 2: DEEP AI ANALYSIS WITH PROFESSIONAL RULES ======
        
        const analysisPrompt = buildProfessionalAnalysisPrompt(drawing_type, user_age, user_gender);
        
        const aiStartTime = Date.now();
        
        const aiAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            file_urls: [image_url],
            response_json_schema: {
                type: "object",
                properties: {
                    // PART 1: GRAPHIC FEATURES (מאפיינים גרפיים)
                    graphic_features: {
                        type: "object",
                        properties: {
                            size_analysis: {
                                type: "object",
                                properties: {
                                    overall_size: { 
                                        type: "string",
                                        enum: ["very_small", "small", "medium", "large", "very_large"],
                                        description: "גודל יחסי לדף"
                                    },
                                    interpretation: { type: "string", minLength: 100 },
                                    psychological_meaning: { type: "string" },
                                    confidence: { type: "number", minimum: 0, maximum: 1 }
                                }
                            },
                            placement_analysis: {
                                type: "object",
                                properties: {
                                    vertical_position: {
                                        type: "string",
                                        enum: ["top", "upper_middle", "center", "lower_middle", "bottom"]
                                    },
                                    horizontal_position: {
                                        type: "string",
                                        enum: ["far_left", "left", "center", "right", "far_right"]
                                    },
                                    interpretation: { type: "string", minLength: 150 },
                                    time_orientation: { 
                                        type: "string",
                                        enum: ["past_focused", "present_focused", "future_focused", "balanced"]
                                    },
                                    confidence: { type: "number" }
                                }
                            },
                            line_pressure: {
                                type: "object",
                                properties: {
                                    pressure_level: {
                                        type: "string",
                                        enum: ["very_light", "light", "medium", "heavy", "very_heavy"]
                                    },
                                    consistency: {
                                        type: "string",
                                        enum: ["very_consistent", "consistent", "variable", "inconsistent", "erratic"]
                                    },
                                    interpretation: { type: "string", minLength: 150 },
                                    energy_level: { type: "string" },
                                    tension_indicators: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            line_quality: {
                                type: "object",
                                properties: {
                                    line_type: {
                                        type: "string",
                                        enum: ["firm_continuous", "sketchy", "broken", "tremulous", "reinforced"]
                                    },
                                    tremor_present: { type: "boolean" },
                                    interpretation: { type: "string", minLength: 100 },
                                    psychological_indicators: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            erasures_corrections: {
                                type: "object",
                                properties: {
                                    erasure_count: {
                                        type: "string",
                                        enum: ["none", "few", "moderate", "many", "excessive"]
                                    },
                                    areas_erased: { type: "array", items: { type: "string" } },
                                    interpretation: { type: "string", minLength: 100 },
                                    conflict_areas: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            shading: {
                                type: "object",
                                properties: {
                                    shading_present: { type: "boolean" },
                                    shading_areas: { type: "array", items: { type: "string" } },
                                    shading_intensity: {
                                        type: "string",
                                        enum: ["light", "moderate", "heavy", "very_heavy"]
                                    },
                                    interpretation: { type: "string", minLength: 150 },
                                    anxiety_indicators: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            detail_level: {
                                type: "object",
                                properties: {
                                    detail_amount: {
                                        type: "string",
                                        enum: ["minimal", "sparse", "adequate", "rich", "excessive"]
                                    },
                                    detail_quality: { type: "string" },
                                    interpretation: { type: "string", minLength: 150 },
                                    cognitive_style: { type: "string" },
                                    confidence: { type: "number" }
                                }
                            },
                            distortions: {
                                type: "object",
                                properties: {
                                    distortion_present: { type: "boolean" },
                                    distortion_types: { type: "array", items: { type: "string" } },
                                    severity: {
                                        type: "string",
                                        enum: ["none", "mild", "moderate", "severe", "bizarre"]
                                    },
                                    interpretation: { type: "string" },
                                    reality_testing: { type: "string" },
                                    confidence: { type: "number" }
                                }
                            },
                            symmetry_balance: {
                                type: "object",
                                properties: {
                                    balance_quality: {
                                        type: "string",
                                        enum: ["well_balanced", "slightly_unbalanced", "unbalanced", "severely_tilted"]
                                    },
                                    interpretation: { type: "string" },
                                    stability_indicators: { type: "string" },
                                    confidence: { type: "number" }
                                }
                            }
                        },
                        required: ["size_analysis", "placement_analysis", "line_pressure", "line_quality"]
                    },

                    // PART 2: CONTENT ANALYSIS (ניתוח תוכן)
                    content_analysis: {
                        type: "object",
                        properties: {
                            identified_objects: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        object_type: { type: "string" },
                                        completeness: { type: "string" },
                                        notable_features: { type: "array", items: { type: "string" } },
                                        omissions: { type: "array", items: { type: "string" } }
                                    }
                                }
                            },
                            person_analysis: {
                                type: "object",
                                properties: {
                                    body_parts_present: { type: "array", items: { type: "string" } },
                                    body_parts_omitted: { type: "array", items: { type: "string" } },
                                    proportions: { type: "string" },
                                    facial_expression: { type: "string" },
                                    posture: { type: "string" },
                                    specific_features: {
                                        type: "object",
                                        properties: {
                                            head_size: { type: "string" },
                                            hands: { type: "string" },
                                            feet: { type: "string" },
                                            eyes: { type: "string" },
                                            mouth: { type: "string" },
                                            arms: { type: "string" }
                                        }
                                    },
                                    interpretation: { type: "string", minLength: 300 },
                                    koppitz_indicators: { 
                                        type: "array",
                                        items: { type: "string" },
                                        description: "30 emotional indicators by Koppitz"
                                    }
                                }
                            },
                            house_analysis: {
                                type: "object",
                                properties: {
                                    structure_present: { type: "boolean" },
                                    has_door: { type: "boolean" },
                                    has_windows: { type: "boolean" },
                                    has_chimney: { type: "boolean" },
                                    has_path: { type: "boolean" },
                                    has_fence: { type: "boolean" },
                                    house_size: { type: "string" },
                                    house_stability: { type: "string" },
                                    interpretation: { type: "string", minLength: 300 },
                                    family_security_indicators: { type: "string" }
                                }
                            },
                            tree_analysis: {
                                type: "object",
                                properties: {
                                    has_roots: { type: "boolean" },
                                    has_trunk: { type: "boolean" },
                                    has_branches: { type: "boolean" },
                                    has_leaves: { type: "boolean" },
                                    trunk_characteristics: { type: "string" },
                                    branch_characteristics: { type: "string" },
                                    crown_characteristics: { type: "string" },
                                    tree_vitality: {
                                        type: "string",
                                        enum: ["dead", "dying", "struggling", "healthy", "flourishing"]
                                    },
                                    interpretation: { type: "string", minLength: 300 },
                                    growth_stability_indicators: { type: "string" }
                                }
                            }
                        }
                    },

                    // PART 3: PSYCHOLOGICAL INDICATORS (אינדיקטורים פסיכולוגיים)
                    psychological_profile: {
                        type: "object",
                        properties: {
                            self_esteem: {
                                type: "object",
                                properties: {
                                    score: { type: "number", minimum: 0, maximum: 10 },
                                    interpretation: { type: "string", minLength: 200 },
                                    supporting_signs: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            anxiety_level: {
                                type: "object",
                                properties: {
                                    score: { type: "number", minimum: 0, maximum: 10 },
                                    interpretation: { type: "string", minLength: 200 },
                                    supporting_signs: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            social_orientation: {
                                type: "object",
                                properties: {
                                    score: { type: "number", minimum: 0, maximum: 10 },
                                    type: {
                                        type: "string",
                                        enum: ["extroverted", "balanced", "introverted", "withdrawn"]
                                    },
                                    interpretation: { type: "string", minLength: 200 },
                                    supporting_signs: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            emotional_control: {
                                type: "object",
                                properties: {
                                    score: { type: "number", minimum: 0, maximum: 10 },
                                    interpretation: { type: "string", minLength: 200 },
                                    impulse_control: { type: "string" },
                                    supporting_signs: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            aggression_hostility: {
                                type: "object",
                                properties: {
                                    score: { type: "number", minimum: 0, maximum: 10 },
                                    interpretation: { type: "string" },
                                    supporting_signs: { type: "array", items: { type: "string" } },
                                    confidence: { type: "number" }
                                }
                            },
                            depression_indicators: {
                                type: "object",
                                properties: {
                                    present: { type: "boolean" },
                                    severity: {
                                        type: "string",
                                        enum: ["none", "mild", "moderate", "severe"]
                                    },
                                    signs: { type: "array", items: { type: "string" } },
                                    interpretation: { type: "string" }
                                }
                            },
                            thought_disorder_indicators: {
                                type: "object",
                                properties: {
                                    present: { type: "boolean" },
                                    signs: { type: "array", items: { type: "string" } },
                                    severity: { type: "string" },
                                    interpretation: { type: "string" }
                                }
                            }
                        },
                        required: ["self_esteem", "anxiety_level", "social_orientation", "emotional_control"]
                    },

                    // PART 4: KOPPITZ EMOTIONAL INDICATORS (30 אינדיקטורים)
                    koppitz_indicators: {
                        type: "object",
                        properties: {
                            total_indicators: { type: "number" },
                            indicators_found: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        indicator_name: { type: "string" },
                                        description: { type: "string" },
                                        clinical_meaning: { type: "string" },
                                        severity: { type: "string" }
                                    }
                                }
                            },
                            emotional_disturbance_risk: {
                                type: "string",
                                enum: ["low", "moderate", "high", "very_high"]
                            },
                            interpretation: { type: "string", minLength: 200 }
                        }
                    },

                    // PART 5: STRENGTHS & RESOURCES (חוזקות ומשאבים)
                    strengths: {
                        type: "array",
                        minItems: 3,
                        maxItems: 7,
                        items: {
                            type: "object",
                            properties: {
                                strength: { type: "string" },
                                evidence: { type: "string" },
                                how_to_leverage: { type: "string" }
                            }
                        }
                    },

                    // PART 6: CHALLENGES & AREAS FOR GROWTH (אתגרים)
                    challenges: {
                        type: "array",
                        minItems: 3,
                        maxItems: 7,
                        items: {
                            type: "object",
                            properties: {
                                challenge: { type: "string" },
                                manifestation: { type: "string" },
                                suggestions: { type: "string" }
                            }
                        }
                    },

                    // PART 7: INTEGRATED INTERPRETATION (פרשנות משולבת)
                    integrated_interpretation: {
                        type: "object",
                        properties: {
                            personality_snapshot: {
                                type: "object",
                                properties: {
                                    summary: { type: "string", minLength: 300, maxLength: 500 },
                                    dominant_themes: { type: "array", items: { type: "string" } },
                                    archetype: { type: "string" }
                                }
                            },
                            self_image: { type: "string", minLength: 300 },
                            interpersonal_relationships: { type: "string", minLength: 300 },
                            emotional_state: { type: "string", minLength: 300 },
                            coping_mechanisms: { type: "string", minLength: 200 },
                            life_purpose_creativity: { type: "string", minLength: 200 }
                        },
                        required: ["personality_snapshot", "self_image", "interpersonal_relationships", "emotional_state"]
                    },

                    // PART 8: DEVELOPMENTAL & CULTURAL CONTEXT
                    contextual_notes: {
                        type: "object",
                        properties: {
                            age_appropriateness: { type: "string" },
                            developmental_level: { type: "string" },
                            cultural_considerations: { type: "string" }
                        }
                    },

                    // PART 9: RECOMMENDATIONS (המלצות)
                    recommendations: {
                        type: "object",
                        properties: {
                            personal_growth: { type: "array", items: { type: "string" } },
                            therapeutic_considerations: { type: "string" },
                            follow_up_suggestions: { type: "array", items: { type: "string" } }
                        }
                    },

                    // PART 10: CONFIDENCE & RELIABILITY
                    analysis_quality: {
                        type: "object",
                        properties: {
                            overall_confidence: { type: "number", minimum: 0.7, maximum: 1.0 },
                            image_quality_score: { type: "number", minimum: 0, maximum: 1 },
                            spontaneity_score: { type: "number", minimum: 0, maximum: 1 },
                            interpretation_reliability: { type: "string" },
                            limitations: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                required: ["graphic_features", "content_analysis", "psychological_profile", "integrated_interpretation", "strengths", "challenges", "analysis_quality"]
            }
        });

        const aiEndTime = Date.now();
        console.log('✅ AI Analysis Complete in', aiEndTime - aiStartTime, 'ms');

        // ====== PHASE 3: POST-PROCESSING & SCORING ======
        
        // Calculate composite scores
        const compositeScores = calculateCompositeScores(aiAnalysis, authenticityCheck);
        
        // Generate feature list for saving
        const features = extractFeatures(aiAnalysis, drawing_type);

        // ====== PHASE 4: BUILD PROFESSIONAL REPORT ======
        
        const professionalReport = {
            ...aiAnalysis,
            composite_scores: compositeScores,
            authenticity_assessment: authenticityCheck,
            features: features,
            analysis_metadata: {
                drawing_type,
                user_age,
                user_gender,
                analysis_date: new Date().toISOString(),
                processing_time_ms: Date.now() - startTime,
                ai_time_ms: aiEndTime - aiStartTime,
                version: '3.0.0_professional',
                methodology: 'HTP + Koppitz + Machover + Meta-analysis (Guo 2023)'
            }
        };

        console.log('📊 Analysis complete. Confidence:', compositeScores.overall_confidence);

        return Response.json({
            success: true,
            analysis: professionalReport,
            message: 'ניתוח מקצועי הושלם בהצלחה'
        });

    } catch (error) {
        console.error('❌ Error in drawing analysis:', error);
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});

/**
 * ANALYZE AUTHENTICITY & DETECT FORGERY
 * זיהוי חריגות וניסיונות הטעיה
 */
function analyzeAuthenticity(metadata) {
    if (!metadata || !metadata.strokes) {
        return {
            authenticity_score: 0.8,
            warnings: ['לא זמין מידע דינמי - ניתוח חלקי'],
            is_reliable: true,
            notes: 'ציור סטטי (סרוק או צולם)'
        };
    }

    const warnings = [];
    let authenticityScore = 1.0;

    // Check 1: Drawing speed (too slow = suspicious)
    const avgStrokeTime = metadata.strokes.reduce((acc, s) => acc + (s.duration || 0), 0) / metadata.strokes.length;
    if (avgStrokeTime > 5000) { // >5 sec per stroke = very slow
        warnings.push('קצב ציור איטי חריג - ייתכן ציור מחושב ולא ספונטני');
        authenticityScore -= 0.15;
    }

    // Check 2: Pressure consistency (too uniform = suspicious)
    if (metadata.pressure_variance !== undefined && metadata.pressure_variance < 0.05) {
        warnings.push('לחץ אחיד חריג - ייתכן שימוש בכלי דיגיטלי או העתקה');
        authenticityScore -= 0.2;
    }

    // Check 3: Too many pauses
    const pauseCount = metadata.strokes.filter(s => s.pause_before > 3000).length;
    if (pauseCount > metadata.strokes.length * 0.5) {
        warnings.push('הפסקות רבות - ייתכן התבוננות במקור או חוסר ספונטניות');
        authenticityScore -= 0.1;
    }

    // Check 4: Erasures in dynamic data
    if (metadata.erasures && metadata.erasures.length > 15) {
        warnings.push('מחיקות רבות מאוד - אולי פרפקציוניזם קיצוני או ניסיון "לעצב" ציור');
        authenticityScore -= 0.05;
    }

    return {
        authenticity_score: Math.max(authenticityScore, 0.3),
        warnings,
        is_reliable: authenticityScore >= 0.6,
        notes: warnings.length > 0 ? 'זוהו חריגות בדפוס הציור' : 'ציור נראה טבעי וספונטני'
    };
}

/**
 * BUILD PROFESSIONAL ANALYSIS PROMPT
 */
function buildProfessionalAnalysisPrompt(drawingType, userAge, userGender) {
    const ageContext = userAge ? `\n**גיל המשתמש:** ${userAge} שנים (התאם את הפרשנות לנורמות גיל!)` : '';
    const genderContext = userGender ? `\n**מגדר:** ${userGender}` : '';

    return `# אתה פסיכולוג קליני מומחה בניתוח ציורים פרויקטיביים - רמה עולמית 🎨

**תחום מומחיות:**
- HTP (House-Tree-Person) - Buck (1948)
- DAP (Draw-A-Person) - Machover (1949), Koppitz (1968)
- Baum Test - Koch (1952)
- Meta-analysis - Guo et al. (2023) - 30 מחקרים

**סוג הציור המבוקש:** ${drawingType === 'person' ? 'ציור אדם (DAP)' : drawingType === 'tree' ? 'ציור עץ (Baum)' : drawingType === 'house' ? 'ציור בית (HTP)' : 'ציור חופשי'}
${ageContext}${genderContext}

---

## **PHASE 1: ניתוח מאפיינים גרפיים (GRAPHIC FEATURES)**

### 1.1 גודל הציור
**מדוד:**
- גודל יחסי לדף: very_small (<10%), small (10-25%), medium (25-60%), large (60-80%), very_large (>80%)

**פרשנות (Machover, Koppitz):**
- **Very Small:** ביטחון עצמי נמוך מאוד, הקטנה עצמית, חרדה, דיכאון אפשרי
- **Small:** ביטחון עצמי נמוך, ביישנות, מופנמות
- **Medium:** נורמלי, מאוזן
- **Large:** ביטחון עצמי גבוה, מוחצנות
- **Very Large:** גרנדיוזיות, אגרסיביות, פיצוי על נחיתות פנימית

**התאמות גיל:**
${userAge && userAge < 8 ? '- ילדים קטנים (<8) מציירים לעתים גדול מדי - זה נורמלי!' : ''}
${userAge && userAge > 12 ? '- מבוגר עם ציור קטן מאוד = סימן משמעותי יותר' : ''}

### 1.2 מיקום על הדף
**מדוד:**
- **אנכי:** top (10% עליון), upper_middle, center, lower_middle, bottom (10% תחתון)
- **אופקי:** far_left, left, center, right, far_right

**פרשנות:**
- **Top:** שאפתנות, אידיאליזם, פנטזיה, ניתוק מהמציאות
- **Bottom:** חוסר ביטחון, דיכאון, קרקעיות, פסימיות
- **Left:** עבר, רגרסיה, תלות
- **Right:** עתיד, אופטימיות, מוחצנות
- **Center:** ממוקד בהווה, אגוצנטרי

### 1.3 לחץ הקו (Line Pressure)
**מדוד:**
- very_light, light, medium, heavy, very_heavy
- עקביות: very_consistent, consistent, variable, inconsistent, erratic

**פרשנות:**
- **Heavy:** אנרגיה גבוהה, דרייב, תוקפנות, מתח, חרדה
- **Light:** אנרגיה נמוכה, עדינות, ביישנות, דיכאון אפשרי
- **Inconsistent:** חוסר יציבות רגשית, עוררות משתנה

### 1.4 איכות הקו (Line Quality)
**מדוד:**
- firm_continuous (חזק ורצוף), sketchy (מקוטע), broken (שבור), tremulous (רועד), reinforced (מחוזק)

**פרשנות:**
- **Tremulous:** חרדה, מתח, חוסר ביטחון, פחד
- **Reinforced (קווים חוזרים):** חוסר בטחון, פרפקציוניזם, אובססיביות
- **Broken:** היסוס, חוסר החלטיות

### 1.5 מחיקות (Erasures)
**מדוד:**
- מספר: none, few (1-3), moderate (4-8), many (9-15), excessive (>15)
- איזורים שנמחקו

**פרשנות (Koppitz):**
- מחיקות = חוסר שביעות רצון, חרדה, פרפקציוניזם
- מחיקות באזורים ספציפיים = קונפליקט באזור זה
- דוגמאות: מחיקה בידיים = קונפליקט בפעולה/שליטה, בפנים = דאגה לדימוי

### 1.6 הצללות (Shading)
**מדוד:**
- נוכחות, מיקום, עוצמה (light/moderate/heavy/very_heavy)

**פרשנות (Machover, Hammer):**
- **הצללה = חרדה!** (אחד הסימנים הברורים ביותר)
- הצללת פנים: חרדה לגבי זהות, דימוי עצמי פגוע
- הצללת גוף: דאגה גופנית, תחושת נחיתות
- הצללה כבדה מאוד: דיכאון נסער, מצוקה חריפה

### 1.7 רמת פירוט (Detail Level)
**מדוד:**
- minimal, sparse, adequate, rich, excessive

**פרשנות:**
- **Excessive (יותר מדי):** אובססיביות, פרפקציוניזם, חשיבה מפרטת (אפשרי בהפרעות חשיבה)
- **Minimal (מעט מדי):** דיכאון, דלות רגשית, חוסר אנרגיה, או הגנתיות

### 1.8 עיוותים (Distortions)
**מדוד:**
- רמת חומרה: none, mild, moderate, severe, bizarre

**פרשנות:**
- **Severe/Bizarre:** הפרעות חשיבה (סכיזופרניה), פגיעה בבוחן מציאות
- **Moderate:** קונפליקט, חרדה, עיוות בדימוי העצמי
- **Transparency (שקיפות):** רגרסיה, הפרעת חשיבה

---

## **PHASE 2: ניתוח תוכן (CONTENT ANALYSIS)**

${drawingType === 'person' ? `
### ציור אדם (DAP) - כללי Machover + Koppitz

**חלקי גוף חיוניים לזהות:**
- ראש, גוף, זרועות, ידיים, רגליים, כפות רגליים
- פנים: עיניים, אף, פה, אוזניים, גבות
- שיער, צוואר, כתפיים

**השמטות משמעותיות (Koppitz Emotional Indicators):**
1. **אין ידיים:** חוסר אונים, תחושת חוסר יכולת, בעיה חברתית
2. **אין רגליים:** חוסר יציבות, תלותיות, חוסר ביטחון
3. **אין עיניים:** התנתקות, הכחשה, הימנעות מראיית מציאות
4. **אין פה:** קושי בתקשורת, חוסר ביטוי רגשי
5. **אין אף:** ביישנות קיצונית, חוסר אונים
6. **גוף לא מחובר לראש:** הפרדה חשיבה-רגש, פירוק

**מאפיינים ספציפיים:**
- **ראש גדול מדי:** דגש על אינטלקט, פנטזיה, או שאיפת שליטה
- **ידיים כאגרופים:** תוקפנות מודחקת, כעס
- **ידיים מאחורי גב:** הסתרה, אשמה
- **שיניים מודגשות:** תוקפנות, עוינות
- **עיניים גדולות מדי:** חשדנות, פרנויה, רגישות לביקורת
- **אוזניים גדולות:** רגישות-יתר לביקורת
- **גופף ארוך ודק:** תחושת חולשה גופנית
- **כפתורים בשורה:** תלותיות, צורך בתמיכה חיצונית (ילדים)

**מגדר ומין:**
- איזה מין הדמות? (אם זה לא תואם למין המצייר - נושא להתבוננות)
- הדגשת מאפיינים מיניים משניים - עיסוק במיניות או חרדה בנושא

**ביגוד:**
- ללא בגדים: חוסר הגנה, פגיעות (או פשטנות אם ילד קטן)
- בגדים מפורטים: התאמה חברתית, תשומת לב למראה

**תנוחה והבעה:**
- דמות זקופה: ביטחון, עמידה ביציבות
- דמות מכופפת/מכווצת: דיכאון, חרדה, נסיגה
- הבעת פנים: שמחה/עצב/ניטרלי/כועס

` : ''}

${drawingType === 'house' ? `
### ציור בית (HTP) - כללי Buck + Hammer

**אלמנטים חיוניים:**
- קירות, גג, דלת, חלונות, ארובה, שביל, גדר

**השמטות משמעותיות:**
- **אין חלונות:** מסתגר, בידוד, ניתוק חברתי (Guo 2023: מנבא הפרעות חשיבה)
- **אין דלת:** חוסר נגישות, קושי בקשר, פחד מפלישה
- **אין ארובה:** חוסר חום במשפחה, קרירות רגשית

**מאפיינים:**
- **בית קטן מדי:** חוסר שביעות רצון מהבית/משפחה, ערך נמוך למשפחה
- **בית נטוי:** חוסר יציבות, חרדה (Guo 2023)
- **בית ללא יסוד/קו אדמה:** חוסר ביטחון, חוסר שורשים
- **דלת ללא ידית/נעולה:** חוסר נגישות רגשית
- **חלונות עם וילונות סגורים:** הסתרה, פרטיות
- **גדר סביב בית:** הגנתיות, צורך בגבולות
- **עשן בארובה:** חום, חיים במשפחה (חיובי!)
- **גג מקושט מדי:** פנטזיה, דמיון, אסקפיזם (Guo 2023: קשור להפרעות אפקטיביות)

` : ''}

${drawingType === 'tree' ? `
### ציור עץ (Baum Test) - כללי Koch

**חלקי העץ:**
- שורשים, גזע, ענפים, צמרת/עלווה, פרחים/פירות

**ניתוח שורשים:**
- **אין שורשים:** חוסר שייכות, ניתוק מהמציאות, חוסר יציבות
- **שורשים מודגשים מדי:** עיסוק פנימי, קונפליקט (Guo 2023)
- **שורשים עמוקים:** צורך ביציבות, חיבור לשורשים

**ניתוח גזע:**
- **דק מאוד:** פגיעות, רגישות, חולשה
- **עבה מאוד:** כוח, עמידות
- **סדקים בגזע:** טראומות, צלקות נפשיות, פציעות בעבר
- **קשרים בגזע:** נקודות קשות בחיים

**ניתוח ענפים:**
- **ענפים חדים/קוצניים:** תוקפנות, עוינות (Guo 2023)
- **ענפים שבורים:** טראומה, אובדן
- **אין ענפים:** חוסר יכולת להגיע החוצה, בידוד

**ניתוח צמרת:**
- **צמרת שטוחה/כרותה:** לחץ חיצוני, הגבלה, "תקרת זכוכית" (Guo 2023)
- **צמרת עשירה:** חיוניות, צמיחה, אופטימיות
- **עץ מת (אין עלים):** דיכאון, חוסר חיוניות (Guo 2023: מנבא דיכאון)

**גודל העץ:**
- עץ קטן מאוד + הרבה חלל ריק: בדידות, חוסר ביטחון (Guo 2023)
- עץ גדול עם נוף: חיוניות, בריאות נפשית (Guo 2023)

` : ''}

---

## **PHASE 2: 30 אינדיקטורים רגשיים של Koppitz (1968)**

זהה אם קיימים אינדיקטורים אלו - כל אחד = סימן למצוקה רגשית:

**קבוצה A - השמטות:**
1. אין ידיים
2. אין רגליים
3. אין פה
4. אין גוף
5. אין אף
6. אין עיניים
7. אין צוואר

**קבוצה B - איכות קו:**
8. קווים רועדים (tremulous lines)
9. קווים מקוטעים (broken/sketchy)
10. לחץ כבד מאוד או קל מאוד

**קבוצה C - מאפיינים מיוחדים:**
11. הצללת פנים
12. הצללת גוף/איברים
13. הצללת ידיים/צוואר
14. אסימטריה גסה
15. דמות משופעת (>15°)
16. דמות קטנה מאוד (<4 אינץ')
17. דמות גדולה מאוד (>9 אינץ')
18. שקיפות (רואים דרך הגוף)
19. ראש קטן מאוד
20. עיניים ריקות או נקודות
21. שיניים מודגשות
22. זרועות קצרות
23. זרועות ארוכות
24. זרועות כאגרופים
25. ידיים גדולות
26. ידיים כלליות
27. רגליים מחוברות
28. מפשעה מודגשת
29. מפרקים מודגשים
30. דמות "מונסטר"

**ניקוד Koppitz:**
- 0-1 אינדיקטורים: תקין
- 2-3: אפשרית מצוקה רגשית
- 4+: מצוקה רגשית משמעותית (p<0.001 הבדל מילדים נורמליים)

---

## **PHASE 3: META-ANALYSIS FINDINGS (Guo et al. 2023)**

**39 מאפייני ציור שהוכחו כמנבאים הפרעות (p<0.05):**

**קטגוריה 1: OMISSION (השמטה):**
- השמטת איברים חיוניים
- ציור לא שלם

**קטגוריה 2: DISTORTION (עיוות):**
- פרופורציות לא תקינות
- ציור ביזארי
- שקיפות

**קטגוריה 3: ADDITION/DETAIL (תוספת):**
- פרטים מיותרים רבים מדי
- קישוטים מוגזמים

**קטגוריה 4: SIMPLIFICATION (פישוט):**
- ציור מינימליסטי מדי
- חוסר פרטים בסיסיים

**סימנים ספציפיים שזוהו:**
- **בית נטוי** → הפרעות אפקטיביות
- **גג מקושט** → הפרעות אפקטיביות
- **עץ מת** → דיכאון
- **מרחק רב בין בית-עץ-אדם** → הפרעות חשיבה
- **אין חלונות בבית** → הפרעות חשיבה
- **ענפים חדים** → תוקפנות

---

## **PHASE 4: אינטגרציה והסקת מסקנות**

**עקרון ההערכה ההוליסטית:**
1. **התבונן בציור בכללותו תחילה** - מה הרושם הראשוני?
2. **נתח פרטים** - זהה כל המאפיינים
3. **שקלל והצלב** - אל תסתמך על סימן יחיד
4. **בנה תמונה מאוחדת** - מהן התמות המרכזיות?

**דוגמאות שקלול:**
- סימנים רבים לחרדה + מעט סימני תוקפנות = אדם חרדתי (לא תוקפני)
- דימוי עצמי נמוך + ציור גרנדיוזי = מנגנון פיצוי נרקיסיסטי
- חרדה גבוהה + תוקפנות גבוהה = נטייה להתפרצויות תחת לחץ

---

## **PHASE 5: דו"ח מקצועי**

**מבנה:**

### A. סיכום פרופיל (200-300 מילים)
תמונה כללית של האישיות המתגלה מהציור

### B. תחומים מפורטים:

#### 1. דימוי עצמי וביטחון (300 מילים)
על בסיס גודל, מיקום, לחץ, השמטות

#### 2. יחסים בין-אישיים (300 מילים)
על בסיס חלונות/דלת בבית, ידיים בדמות, מרחקים

#### 3. מצב רגשי (300 מילים)
חרדה/דיכאון - לפי הצללות, רעידות, קווים, עץ מת

#### 4. שליטה בדחפים ותוקפנות (200 מילים)
לפי ענפים חדים, אגרופים, שיניים, לחץ כבד

#### 5. כוחות וכישרונות (200 מילים)
מה חיובי? פרטים = יצירתיות? סימטריה = מאורגן?

### C. חוזקות (3-7)
### D. אתגרים (3-7)
### E. המלצות

---

## **CRITICAL GUIDELINES:**

✅ **התבסס רסמית על המקורות** - ציין מחקרים ושמות
✅ **היה ספציפי** - "הידיים שציירת חסרות" ולא "יש בעיה בציור"
✅ **פרש בהקשר גיל** - מה שנורמלי בגיל 5 לא נורמלי בגיל 15
✅ **שקלל** - לא לסמוך על סימן יחיד
✅ **לשון מכבדת** - "ייתכן ש...", "נראה כי...", לא "יש לך הפרעה"
✅ **איזן** - גם חוזקות וגם אתגרים
✅ **10-15 תובנות מעמיקות** מבוססות סימנים

**אם איכות תמונה לא טובה - אמור בכנות!**

החזר JSON מובנה ומקצועי.`;
}

/**
 * CALCULATE COMPOSITE SCORES
 */
function calculateCompositeScores(aiAnalysis, authenticityCheck) {
    const psychProfile = aiAnalysis.psychological_profile || {};
    
    // Overall confidence calculation
    const confidenceFactors = [
        aiAnalysis.analysis_quality?.overall_confidence || 0.85,
        authenticityCheck.authenticity_score || 0.8,
        aiAnalysis.analysis_quality?.image_quality_score || 0.9
    ];
    
    const overallConfidence = confidenceFactors.reduce((a, b) => a + b, 0) / confidenceFactors.length;

    // Emotional disturbance risk (based on Koppitz)
    const koppitzCount = aiAnalysis.koppitz_indicators?.total_indicators || 0;
    let emotionalRisk = 'low';
    if (koppitzCount >= 4) emotionalRisk = 'very_high';
    else if (koppitzCount === 3) emotionalRisk = 'high';
    else if (koppitzCount === 2) emotionalRisk = 'moderate';

    return {
        overall_confidence: Math.round(overallConfidence * 100),
        emotional_disturbance_risk: emotionalRisk,
        self_esteem_score: psychProfile.self_esteem?.score || 5,
        anxiety_score: psychProfile.anxiety_level?.score || 5,
        social_score: psychProfile.social_orientation?.score || 5,
        authenticity_reliable: authenticityCheck.is_reliable,
        koppitz_indicator_count: koppitzCount
    };
}

/**
 * EXTRACT FEATURES FOR DATABASE
 */
function extractFeatures(aiAnalysis, drawingType) {
    const features = [];
    
    // Graphic features
    if (aiAnalysis.graphic_features) {
        const gf = aiAnalysis.graphic_features;
        
        if (gf.size_analysis) {
            features.push({
                feature_key: 'drawing_size',
                feature_value: gf.size_analysis.overall_size,
                confidence: gf.size_analysis.confidence,
                category: 'graphic',
                interpretation: gf.size_analysis.interpretation
            });
        }
        
        if (gf.placement_analysis) {
            features.push({
                feature_key: 'vertical_placement',
                feature_value: gf.placement_analysis.vertical_position,
                confidence: gf.placement_analysis.confidence,
                category: 'graphic'
            });
        }
        
        if (gf.line_pressure) {
            features.push({
                feature_key: 'line_pressure',
                feature_value: gf.line_pressure.pressure_level,
                confidence: gf.line_pressure.confidence,
                category: 'graphic'
            });
        }
    }

    // Koppitz indicators
    if (aiAnalysis.koppitz_indicators?.indicators_found) {
        aiAnalysis.koppitz_indicators.indicators_found.forEach(indicator => {
            features.push({
                feature_key: 'koppitz_indicator',
                feature_value: indicator.indicator_name,
                confidence: 0.95,
                category: 'emotional_indicator',
                clinical_meaning: indicator.clinical_meaning
            });
        });
    }

    // Psychological scores
    if (aiAnalysis.psychological_profile) {
        Object.entries(aiAnalysis.psychological_profile).forEach(([key, value]) => {
            if (value.score !== undefined) {
                features.push({
                    feature_key: `psych_${key}`,
                    numeric_value: value.score,
                    confidence: value.confidence || 0.85,
                    category: 'psychological_trait'
                });
            }
        });
    }

    return features;
}