import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * DOCUMENT ANALYZER - AI-Powered Document Intelligence
 * 
 * Extracts text from uploaded documents (PDFs, images) and uses AI to:
 * - Summarize the content
 * - Extract key insights
 * - Identify recurring themes
 * - Answer user questions
 * 
 * Supports: Numerology reports, birth charts, graphology analyses, etc.
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { file_url, user_question, analysis_type = 'general', previous_context = [] } = body;

        if (!file_url) {
            return Response.json({ error: 'Missing file_url' }, { status: 400 });
        }

        console.log('📄 Analyzing document:', file_url);

        // ====== STEP 1: Extract text from document ======
        let extractedText = '';
        
        try {
            // Try to extract data from the file
            const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
                file_url: file_url,
                json_schema: {
                    type: "object",
                    properties: {
                        full_text: {
                            type: "string",
                            description: "The complete text content of the document"
                        },
                        document_type: {
                            type: "string",
                            description: "Type of document (numerology, astrology, graphology, etc.)"
                        },
                        language: {
                            type: "string",
                            description: "Primary language of the document"
                        }
                    }
                }
            });

            if (extractionResult.status === 'success' && extractionResult.output) {
                extractedText = extractionResult.output.full_text || '';
                console.log('✅ Text extracted successfully:', extractedText.substring(0, 200) + '...');
            } else {
                return Response.json({ 
                    error: 'Failed to extract text from document',
                    details: extractionResult.details 
                }, { status: 400 });
            }
        } catch (extractError) {
            console.error('❌ Extraction error:', extractError);
            return Response.json({ 
                error: 'Error extracting text from document',
                details: extractError.message 
            }, { status: 500 });
        }

        if (!extractedText || extractedText.length < 50) {
            return Response.json({ 
                error: 'Document appears to be empty or text extraction failed',
                extracted_length: extractedText.length
            }, { status: 400 });
        }

        // ====== STEP 2: Build context from previous analyses (if any) ======
        let contextString = '';
        if (previous_context && previous_context.length > 0) {
            contextString = '\n\n**מסמכים קודמים שהמשתמש העלה:**\n';
            previous_context.forEach((doc, idx) => {
                contextString += `\nמסמך ${idx + 1}: ${doc.summary || doc.text?.substring(0, 200)}\n`;
            });
        }

        // ====== STEP 3: AI Analysis with InvokeLLM ======
        const analysisPrompt = `# אתה מומחה AI לניתוח מסמכים נומרולוגיים, אסטרולוגיים ומיסטיים

## המסמך שהמשתמש העלה:

\`\`\`
${extractedText}
\`\`\`

${contextString}

## סוג הניתוח המבוקש: ${analysis_type}

${user_question ? `## שאלת המשתמש:\n${user_question}\n` : ''}

---

## המשימה שלך:

1. **סיכום המסמך** (150-250 מילים):
   - מה התוכן העיקרי?
   - מה סוג המסמך? (דוח נומרולוגיה, מפת לידה, ניתוח גרפולוגי, וכו')
   - מה הממצאים הראשיים?

2. **תובנות מרכזיות** (5-8 תובנות):
   - זהה את התובנות החשובות ביותר
   - לכל תובנה: כותרת קצרה + הסבר (100-150 מילים)
   - דרג לפי חשיבות

3. **נושאים חוזרים** (3-5 נושאים):
   - זהה דפוסים או נושאים שחוזרים על עצמם במסמך
   - למשל: "חוזק בתקשורת", "אתגר בזוגיות", "כישרון מנהיגותי"

4. **קשרים ומתאמים**:
   - אם יש מספר מספרים/סמלים/אינדיקטורים - חבר ביניהם
   - זהה סינרגיות או קונפליקטים פנימיים

5. **המלצות מעשיות** (3-5 המלצות):
   - מה המשתמש יכול לעשות עם המידע הזה?
   - צעדים קונקרטיים

${user_question ? `6. **תשובה ישירה לשאלת המשתמש**:\n   - ענה על השאלה בצורה ממוקדת ומבוססת על המסמך\n   - אם התשובה לא במסמך, אמור זאת בבירור` : ''}

---

**חשוב מאוד:**
- בסס כל תובנה על התוכן בפועל במסמך
- אם משהו לא ברור או חסר - אמור זאת
- אם השאלה דורשת מידע שאינו במסמך - הסבר שאין לך את המידע
- השתמש בטון חם, תומך ומעודד
- כתוב בעברית ברורה וזורמת

**החזר JSON מובנה.**`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    document_type: {
                        type: "string",
                        description: "סוג המסמך שזוהה"
                    },
                    summary: {
                        type: "string",
                        minLength: 450,
                        description: "סיכום המסמך 150-250 מילים"
                    },
                    key_insights: {
                        type: "array",
                        minItems: 5,
                        maxItems: 8,
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                content: { type: "string", minLength: 300 },
                                importance: { type: "number", minimum: 1, maximum: 10 }
                            },
                            required: ["title", "content", "importance"]
                        }
                    },
                    recurring_themes: {
                        type: "array",
                        minItems: 3,
                        maxItems: 5,
                        items: {
                            type: "object",
                            properties: {
                                theme: { type: "string" },
                                description: { type: "string" },
                                frequency: { type: "string", enum: ["low", "medium", "high"] }
                            },
                            required: ["theme", "description", "frequency"]
                        }
                    },
                    connections: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                elements: { 
                                    type: "array", 
                                    items: { type: "string" },
                                    description: "רשימת האלמנטים המקושרים"
                                },
                                relationship: { type: "string" },
                                explanation: { type: "string" }
                            }
                        }
                    },
                    actionable_recommendations: {
                        type: "array",
                        minItems: 3,
                        maxItems: 5,
                        items: {
                            type: "object",
                            properties: {
                                recommendation: { type: "string" },
                                rationale: { type: "string" },
                                priority: { type: "string", enum: ["low", "medium", "high"] }
                            }
                        }
                    },
                    direct_answer: {
                        type: "string",
                        description: "תשובה ישירה לשאלת המשתמש (אם יש)"
                    },
                    confidence_score: {
                        type: "number",
                        minimum: 0,
                        maximum: 100,
                        description: "רמת הביטחון בניתוח (0-100)"
                    },
                    missing_information: {
                        type: "array",
                        items: { type: "string" },
                        description: "מידע חסר שהיה יכול לשפר את הניתוח"
                    }
                },
                required: ["document_type", "summary", "key_insights", "recurring_themes", "actionable_recommendations"]
            }
        });

        // ====== STEP 4: Return structured response ======
        const result = {
            success: true,
            file_url: file_url,
            extracted_text_length: extractedText.length,
            analysis: {
                ...aiResponse,
                analyzed_at: new Date().toISOString(),
                user_question: user_question || null
            },
            metadata: {
                analysis_type: analysis_type,
                has_previous_context: previous_context.length > 0,
                user_id: user.id
            }
        };

        console.log('✅ Document analysis complete');
        return Response.json(result);

    } catch (error) {
        console.error('❌ Document analysis error:', error);
        return Response.json({ 
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});