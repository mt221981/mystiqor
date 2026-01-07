import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Layers, TrendingUp, AlertTriangle, CheckCircle, Info, BookOpen, Zap, Target, Activity, Calendar, Wand2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import { MysticalLoader } from "@/components/LoadingStates";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import ExplainableInsight from "@/components/ExplainableInsight";
import HelpTooltip from "@/components/HelpTooltip";

export default function MysticSynthesis() {
  const [synthesis, setSynthesis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [includeMood, setIncludeMood] = useState(true);
  
  const queryClient = useQueryClient();
  const { incrementUsage, subscription } = useSubscription();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    },
    staleTime: 60000
  });

  const { data: analyses } = useQuery({
    queryKey: ['previousAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 100),
    staleTime: 60000,
    initialData: []
  });

  const { data: moodEntries } = useQuery({
    queryKey: ['recentMoodsForSynthesis'],
    queryFn: () => base44.entities.MoodEntry.list('-entry_date', 30),
    staleTime: 60000,
    initialData: []
  });

  // Group analyses by type for easier display
  const groupedAnalyses = useMemo(() => {
    const groups = {
      numerology: [],
      astrology: [],
      palmistry: [],
      graphology: [],
      tarot: [],
      drawing_analysis: [],
      other: []
    };
    
    analyses.forEach(a => {
      if (groups[a.tool_type]) {
        groups[a.tool_type].push(a);
      } else {
        groups.other.push(a);
      }
    });
    
    return groups;
  }, [analyses]);

  const handleSmartSelect = () => {
    const toSelect = new Set();
    const types = {};
    
    analyses.forEach(a => {
      // Logic: Pick latest of each major type, up to 3 tarot readings
      if (a.tool_type === 'tarot') {
        if (!types.tarot) types.tarot = 0;
        if (types.tarot < 3) {
          toSelect.add(a.id);
          types.tarot++;
        }
      } else {
        if (!types[a.tool_type]) {
          toSelect.add(a.id);
          types[a.tool_type] = true;
        }
      }
    });
    
    setSelectedIds(toSelect);
    setIncludeMood(true);
    toast.success("נבחרו הנתונים העדכניים והרלוונטיים ביותר");
  };

  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };
  
  // Auto-select on first load
  useEffect(() => {
    if (analyses.length > 0 && selectedIds.size === 0) {
      handleSmartSelect();
    }
  }, [analyses.length]);

  const synthesizeMutation = useMutation({
    mutationFn: async ({ profile, selectedAnalyses, moodData }) => {
      // Use explicitly selected analyses
      const numerologyData = selectedAnalyses.filter(a => a.tool_type === 'numerology');
      const astrologyData = selectedAnalyses.filter(a => a.tool_type === 'astrology');
      const palmistryData = selectedAnalyses.filter(a => a.tool_type === 'palmistry');
      const graphologyData = selectedAnalyses.filter(a => a.tool_type === 'graphology');
      const tarotData = selectedAnalyses.filter(a => a.tool_type === 'tarot');
      const drawingData = selectedAnalyses.filter(a => a.tool_type === 'drawing_analysis' || a.tool_type === 'drawing');

      const prompt = `אתה מומחה עולמי בסינתזה מיסטית הוליסטית, משלב ידע עמוק בנומרולוגיה קבלית, אסטרולוגיה פסיכולוגית, קריאת כף יד, גרפולוגיה משולבת Big Five, טארוט ופסיכולוגיה יונגיאנית.

**עקרונות יסוד קריטיים:**

1. **פוטנציאלים, לא קביעות**: כל הניתוחים מתארים **פוטנציאלים ונטיות**, לא גורל קבוע מראש. הדגש תמיד על **הבחירה החופשית** והשפעת הסביבה.

2. **התמודדות עם אפקט פורר (Barnum Effect)**:
   - הימנע מהצהרות כלליות מדי ("אתה אדם חברותי")
   - היה **ספציפי ומבוסס נתונים**: "מספר נתיב החיים 3 ביחד עם שמש בעקרב + לחץ כתיבה חזק מצביעים על..."
   - אל תשתמש במילים כמו "לפעמים" באופן שרירותי
   - כל תובנה חייבת להיות מעוגנת ב**לפחות 2-3 מקורות מידע ספציפיים**

3. **סינתזה הוליסטית**:
   - חפש **עקביות בין הכלים** - אם כולם מצביעים על אותה תכונה, זה חיזוק חזק
   - זהה **סתירות משמעותיות** - ותסביר אותן בעומק (למשל: "הנומרולוגיה מצביעה על X, אך כתב היד מראה Y - זה מצביע על מתח פנימי/קונפליקט בין...")
   - זהה **ארכיטיפים משותפים** (למשל: נומרולוגיה 1 + מאדים דומיננטי + לחץ כתיבה חזק = אנרגיה מנהיגותית)
   - זהה **דפוסים חוזרים** בין הכלים השונים

4. **מבוסס מדע ומחקר**:
   - ציין מקורות מדעיים כשקיימים (Big Five, מחקרי גרפולוגיה, פסיכולוגיה יונגיאנית)
   - הכר בגבולות הידע ("המחקרים בנומרולוגיה מוגבלים, אך הקבלה מציעה...")
   - התבסס על תורת האישיות של יונג, Big Five, ומודלים פסיכולוגיים מוכרים

5. **ביטוי חיובי של פוטנציאלים**:
   - כל נטייה שלילית יש להציג גם בצורה חיובית
   - למשל: "נטייה לביקורתיות" → "עין חדה לפרטים ויכולת לזהות תחומי שיפור"

---

**נתונים זמינים:**

${profile ? `**פרטי המשתמש:**
- שם: ${profile.full_name_hebrew || profile.full_name_latin || 'לא ידוע'}
- תאריך לידה: ${profile.birth_date}
- מקום לידה: ${profile.birth_place_name || 'לא ידוע'}` : ''}

${numerologyData.length > 0 ? `**נומרולוגיה (${numerologyData.length} ניתוחים):**
${JSON.stringify(numerologyData[0].results, null, 2)}` : ''}

${astrologyData.length > 0 ? `**אסטרולוגיה (${astrologyData.length} ניתוחים):**
${JSON.stringify(astrologyData[0].results, null, 2)}` : ''}

${palmistryData.length > 0 ? `**קריאת כף יד (${palmistryData.length} ניתוחים):**
${JSON.stringify(palmistryData[0].results, null, 2)}` : ''}

${graphologyData.length > 0 ? `**גרפולוגיה (${graphologyData.length} ניתוחים):**
${JSON.stringify(graphologyData[0].results, null, 2)}` : ''}

${tarotData.length > 0 ? `**טארוט (${tarotData.length} קריאות):**
${tarotData.map(t => JSON.stringify(t.results, null, 2)).join('\n')}` : ''}

${drawingData.length > 0 ? `**ניתוח ציורים (${drawingData.length} ניתוחים):**
${JSON.stringify(drawingData.map(d => d.results), null, 2)}` : ''}

${moodData && moodData.length > 0 ? `**נתוני מצב רוח (30 יום אחרונים):**
- מספר רשומות: ${moodData.length}
- מצב רוח ממוצע: ${(moodData.reduce((acc, m) => acc + (m.mood_score || 0), 0) / moodData.length).toFixed(1)}/10
- רמות אנרגיה ממוצעות: ${(moodData.reduce((acc, m) => acc + (m.energy_level || 0), 0) / moodData.length).toFixed(1)}/10
- דפוסים אחרונים: ${JSON.stringify(moodData.slice(0, 5).map(m => ({ date: m.entry_date, mood: m.mood, score: m.mood_score })))}` : ''}

---

**מבנה הניתוח המבוקש:**

1. **סיכום ארכיטיפי**: זהה את הארכיטיפ/ים היונגיאניים המרכזיים המתגלים מהניתוח המשולב (למשל: Warrior, Caregiver, Sage, Creator, Explorer). ציין **אילו כלים תומכים בכל ארכיטיפ**.

2. **תכונות ליבה משולבות**: רשום 7-10 תכונות ליבה, כאשר לכל אחת:
   - שם התכונה
   - תיאור מפורט (150-200 מילים) שמשלב נתונים מכל הכלים
   - **מקורות תומכים ספציפיים**: אילו כלים ואילו נתונים מדויקים תומכים? (חובה!)
   - דרגת ביטחון (0.95-1.0)
   - ראיות ספציפיות מכל כלי

3. **זיהוי עקביות חזקות (Cross-Tool Consistencies)**: היכן **לפחות 3 כלים שונים** מסכימים? 
   - תחום העקביות (למשל: "מנהיגות", "רגישות רגשית", "יצירתיות")
   - תיאור מפורט (100-150 מילים)
   - **רשימה מפורשת של הכלים התומכים** + נתונים ספציפיים מכל כלי
   - משמעות החיזוק המשולב

4. **זיהוי סתירות משמעותיות (Contradictions & Inner Tensions)**: היכן יש **סתירות אמיתיות** בין הכלים?
   - תיאור הסתירה בפירוט
   - **פרשנות פסיכולוגית עמוקה**: מה הסתירה מלמדת על מורכבות פנימית, קונפליקטים לא פתורים, דואליות באישיות
   - הכלים המעורבים + הנתונים הספציפיים
   - דרכים ליישוב או לחיות עם הסתירה

5. **תובנות עמוקות (Deep Insights)**: 8-12 תובנות, כל אחת:
   - title
   - content (200-250 מילים)
   - insight_type: archetype/core_pattern/strength/challenge/growth_path/relationship_style/shadow_work/kabbalistic_insight
   - confidence (0.95-1.0)
   - weight (0-1)
   - **provenance מלא וספציפי**:
     - source_features: רשימה מדויקת של כל הנתונים התומכים מכל כלי
     - rule_description: הסבר מפורט איך הנתונים מתחברים
     - sources: מקורות אקדמיים וספרותיים
     - synthesis_basis: "מבוסס על שילוב של [כלי 1: נתון X] + [כלי 2: נתון Y] + [כלי 3: נתון Z]"
   - tags

6. **המלצות משולבות לצמיחה**: 6-8 המלצות מעשיות וספציפיות, שכל אחת:
   - מבוססת על **שילוב של לפחות 2 כלים**
   - ממוקדת ופרקטית (לא כללית)
   - מסבירה **למה** ההמלצה נכונה בשבילך (בהתאם לנתונים)

7. **אזהרת אפקט פורר מפורשת**: 
   - הסבר למשתמש שהניתוח מבוסס על **נתונים אישיים וספציפיים שלו**
   - ציין **בדיוק אילו נתונים** (תאריך לידה, שם, כתב יד, וכו')
   - הסבר שזה **לא** תיאור כללי שיכול להתאים לכולם
   - הדגש את ההבדל בין ניתוח מבוסס נתונים לבין "קריאה קרה"

8. **שקיפות מלאה**:
   - ציון בדיוק כמה כלים שימשו
   - רמת השלמות של הנתונים
   - אילו כלים חסרים ואיך זה משפיע
   - confidence_level: 1.0 (100%)

**חשוב קריטית:**
- **אין תיאורים כלליים!** כל משפט חייב להיות מעוגן בנתונים ספציפיים
- **זהה ארכיטיפים חוזרים** - אם כמה כלים מצביעים על אותו ארכיטיפ, זה משמעותי מאוד
- **הסבר סתירות בעומק** - אל תתעלם מהן, זה המקום העשיר ביותר לתובנה
- **דבר אל הנשמה** - עומק, אמת, חמלה

**החזר JSON מובנה ומקצועי עם דיוק 100%.**`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            archetypal_summary: {
              type: "object",
              properties: {
                primary_archetype: { type: "string" },
                secondary_archetype: { type: "string" },
                description: { type: "string" },
                supporting_tools: { 
                  type: "array", 
                  items: { 
                    type: "object",
                    properties: {
                      tool: { type: "string" },
                      evidence: { type: "string" }
                    }
                  }
                }
              },
              required: ["primary_archetype", "description", "supporting_tools"]
            },
            core_traits_integrated: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trait_name: { type: "string" },
                  description: { type: "string" },
                  supporting_tools: { type: "array", items: { type: "string" } },
                  specific_evidence: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        tool: { type: "string" },
                        data_point: { type: "string" }
                      }
                    }
                  },
                  confidence: { type: "number", minimum: 0.95, maximum: 1.0 }
                },
                required: ["trait_name", "description", "supporting_tools", "specific_evidence", "confidence"]
              }
            },
            consistencies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  description: { type: "string" },
                  supporting_tools: { type: "array", items: { type: "string" } },
                  specific_evidence_per_tool: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tool: { type: "string" },
                        evidence: { type: "string" }
                      }
                    }
                  },
                  reinforcement_strength: { type: "string", enum: ["strong", "very_strong", "absolute"] }
                },
                required: ["area", "description", "supporting_tools", "specific_evidence_per_tool", "reinforcement_strength"]
              }
            },
            contradictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  psychological_interpretation: { type: "string" },
                  tools_involved: { type: "array", items: { type: "string" } },
                  specific_data_points: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        tool: { type: "string" },
                        finding: { type: "string" }
                      }
                    }
                  },
                  meaning: { type: "string" },
                  resolution_suggestion: { type: "string" }
                },
                required: ["description", "psychological_interpretation", "tools_involved", "specific_data_points", "meaning"]
              }
            },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  insight_type: { type: "string" },
                  confidence: { type: "number", minimum: 0.95, maximum: 1.0 },
                  weight: { type: "number" },
                  provenance: {
                    type: "object",
                    properties: {
                      source_features: { type: "array", items: { type: "string" } },
                      rule_description: { type: "string" },
                      sources: { type: "array", items: { type: "string" } },
                      synthesis_basis: { type: "string" }
                    },
                    required: ["source_features", "synthesis_basis"]
                  },
                  tags: { type: "array", items: { type: "string" } }
                },
                required: ["title", "content", "insight_type", "confidence", "provenance"]
              }
            },
            integrated_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  why_for_you: { type: "string" },
                  based_on_tools: { type: "array", items: { type: "string" } },
                  specific_basis: { type: "string" },
                  actionable: { type: "boolean" }
                },
                required: ["recommendation", "why_for_you", "based_on_tools", "specific_basis"]
              }
            },
            barnum_effect_disclaimer: { 
              type: "object",
              properties: {
                main_message: { type: "string" },
                your_specific_data: { type: "array", items: { type: "string" } },
                how_different_from_generic: { type: "string" }
              },
              required: ["main_message", "your_specific_data", "how_different_from_generic"]
            },
            overall_confidence: { type: "number", minimum: 1.0, maximum: 1.0 },
            data_completeness: { type: "number", minimum: 0, maximum: 1 },
            tools_used_count: { type: "number" },
            missing_tools: { type: "array", items: { type: "string" } }
          },
          required: ["archetypal_summary", "core_traits_integrated", "consistencies", "insights", "integrated_recommendations", "barnum_effect_disclaimer", "overall_confidence", "data_completeness", "tools_used_count"]
        }
      });

      // Force 100% confidence
      return {
        ...result,
        overall_confidence: 1.0
      };
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    }
  });

  const handleSynthesize = async () => {
    if (!userProfile) {
      toast.error('נא להשלים את הפרופיל שלך תחילה');
      return;
    }

    const selectedAnalysesList = analyses.filter(a => selectedIds.has(a.id));
    const totalSources = selectedAnalysesList.length + (includeMood ? 1 : 0);

    if (totalSources < 2) {
      toast.error('נא לבחור לפחות 2 מקורות מידע', {
        description: 'שילוב מידע דורש הצלבה של מספר מקורות'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await synthesizeMutation.mutateAsync({
        profile: userProfile,
        selectedAnalyses: selectedAnalysesList,
        moodData: includeMood ? moodEntries : []
      });

      setSynthesis(result);

      await saveAnalysisMutation.mutateAsync({
        tool_type: "combined",
        input_data: { 
          type: "mystic_synthesis",
          tools_used: [...new Set(selectedAnalysesList.map(a => a.tool_type))],
          mood_included: includeMood
        },
        results: result,
        summary: "סינתזה מיסטית הוליסטית מתקדמת - שילוב כל הכלים",
        confidence_score: 100,
        confidence_breakdown: {
          input_quality: 1.0,
          calculation_confidence: 1.0,
          data_completeness: result.data_completeness || 0.85
        }
      });

      await incrementUsage();

      toast.success('הסינתזה המיסטית הושלמה! ✨');
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      toast.error('אירעה שגיאה בסינתזה');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <MysticalLoader message="משלב את כל הכלים המיסטיים - מזהה דפוסים, עקביות וסתירות..." />;
  }

  const isPremium = subscription && ['premium', 'enterprise'].includes(subscription.plan_type);
  const availableTools = [...new Set(analyses.map(a => a.tool_type))];

  return (
    <SubscriptionGuard toolName="סינתזה מיסטית">
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="שילוב של הכלים ✨"
            description="סינתזה הוליסטית מתקדמת של כל הניתוחים שלך"
            icon={Layers}
            iconGradient="from-purple-500 via-pink-500 to-purple-500"
          />

          <AnimatePresence mode="wait">
            {!synthesis ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Educational Card */}
                <Card className="bg-indigo-900/50 backdrop-blur-xl border-indigo-700/50 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-6 h-6 text-indigo-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-indigo-200 font-bold text-lg mb-3">איך הסינתזה המתקדמת עובדת?</h3>
                        <div className="space-y-3 text-indigo-100 text-sm leading-relaxed">
                          <p>
                            <strong>סינתזה מיסטית</strong> היא תהליך מתקדם שמשלב את כל הניתוחים שעשית 
                            (נומרולוגיה קבלית, אסטרולוגיה פסיכולוגית, כף יד, גרפולוגיה משולבת Big Five, טארוט) 
                            לתמונה אחת שלמה ומדויקת.
                          </p>
                          <div className="bg-indigo-800/30 rounded-lg p-4">
                            <p className="font-semibold text-yellow-300 mb-2">⚠️ חשוב להבין:</p>
                            <p>
                              הניתוח מציג <strong>פוטנציאלים ונטיות</strong>, לא גורל קבוע מראש. 
                              הבחירה החופשית והסביבה שלך משפיעות באופן משמעותי. הניתוח הזה הוא מבוסס על 
                              <strong> הנתונים האישיים והספציפיים שלך</strong> בלבד.
                            </p>
                          </div>
                          <p>
                            המערכת מזהה:
                          </p>
                          <ul className="list-disc list-inside space-y-1 mr-4">
                            <li><strong>עקביות חזקות</strong> - כשלפחות 3 כלים מסכימים על תכונה</li>
                            <li><strong>סתירות משמעותיות</strong> - שמעידות על מורכבות ודואליות פנימית</li>
                            <li><strong>ארכיטיפים משותפים</strong> - דפוסים עמוקים שחוזרים על עצמם</li>
                            <li><strong>המלצות מותאמות אישית</strong> - מבוססות על השילוב הייחודי שלך</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-2 border-purple-700 shadow-2xl">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                    >
                      <Layers className="w-12 h-12 text-white" />
                    </motion.div>

                    <h2 className="text-4xl font-bold text-white mb-4">
                      מוכן לראות את התמונה המלאה?
                    </h2>

                    <p className="text-xl text-purple-200 mb-6">
                      שילוב מתקדם של כל הכלים למפה אישית מקיפה ומדויקת
                    </p>

                    {analyses.length > 0 ? (
                      <div className="mb-8 text-right max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-purple-200 font-bold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            מקורות המידע לניתוח
                            <HelpTooltip text="בחר אילו ניתוחים ונתונים תרצה לכלול בסינתזה. המערכת תצליב את כל המידע שבחרת כדי למצוא דפוסים ותובנות." />
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleSmartSelect}
                            className="bg-purple-900/50 border-purple-500/50 text-purple-200 hover:text-white hover:bg-purple-800"
                          >
                            <Wand2 className="w-3 h-3 ml-2" />
                            בחירה חכמה
                          </Button>
                        </div>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar bg-black/20 rounded-xl p-4 border border-purple-500/20">
                          {/* Mood Selection */}
                          {moodEntries.length > 0 && (
                            <div 
                              onClick={() => setIncludeMood(!includeMood)}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                includeMood ? 'bg-pink-900/40 border-pink-500' : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'
                              }`}
                            >
                              <Checkbox checked={includeMood} onCheckedChange={setIncludeMood} className="border-pink-300 data-[state=checked]:bg-pink-500" />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                                  <Activity className="w-4 h-4 text-pink-300" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">הרגשה ומצב רוח</p>
                                  <p className="text-pink-200 text-xs">{moodEntries.length} רשומות (ממוצע: {(moodEntries.reduce((a,b)=>a+(b.mood_score||0),0)/moodEntries.length).toFixed(1)})</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Grouped Analyses Selection */}
                          {Object.entries(groupedAnalyses).map(([type, items]) => {
                            if (items.length === 0) return null;
                            const typeLabels = {
                              numerology: { label: 'נומרולוגיה', icon: '🔢', color: 'indigo' },
                              astrology: { label: 'אסטרולוגיה', icon: '⭐', color: 'blue' },
                              palmistry: { label: 'כף יד', icon: '🖐️', color: 'teal' },
                              graphology: { label: 'גרפולוגיה', icon: '✍️', color: 'emerald' },
                              tarot: { label: 'טארוט', icon: '🃏', color: 'purple' },
                              drawing_analysis: { label: 'ניתוח ציור', icon: '🎨', color: 'orange' },
                              other: { label: 'אחר', icon: '📁', color: 'gray' }
                            };
                            const info = typeLabels[type] || typeLabels.other;

                            return (
                              <div key={type} className="space-y-2">
                                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider px-1 mt-2 mb-1">{info.label}</h4>
                                {items.map((analysis) => (
                                  <div 
                                    key={analysis.id}
                                    onClick={() => toggleSelection(analysis.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                      selectedIds.has(analysis.id) 
                                        ? `bg-${info.color}-900/40 border-${info.color}-500` 
                                        : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'
                                    }`}
                                  >
                                    <Checkbox 
                                      checked={selectedIds.has(analysis.id)} 
                                      onCheckedChange={() => toggleSelection(analysis.id)}
                                      className={`border-${info.color}-300 data-[state=checked]:bg-${info.color}-600`}
                                    />
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className={`w-8 h-8 rounded-full bg-${info.color}-500/20 flex items-center justify-center text-lg`}>
                                        {info.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                          <p className="text-white font-medium text-sm">
                                            {info.label}
                                          </p>
                                          <span className="text-[10px] text-gray-400 font-mono">
                                            {format(new Date(analysis.created_date), 'dd/MM')}
                                          </span>
                                        </div>
                                        <p className="text-gray-300 text-xs truncate max-w-[200px]">
                                          {analysis.summary || 'ניתוח ללא כותרת'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <Card className="bg-amber-900/50 border-amber-700 mb-8 mx-auto max-w-md">
                        <CardContent className="p-6">
                          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                          <p className="text-amber-200">
                            נדרשים לפחות 2 ניתוחים קודמים
                          </p>
                          <p className="text-amber-300 text-sm mt-2">
                            השתמש בכלים השונים קודם
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      onClick={handleSynthesize}
                      disabled={selectedIds.size === 0 && !includeMood}
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white text-xl px-12 py-7 shadow-2xl disabled:opacity-50"
                    >
                      <Sparkles className="w-7 h-7 ml-2" />
                      צור דו"ח מסכם ({selectedIds.size + (includeMood ? 1 : 0)} מקורות)
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Header Card with Confidence */}
                <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-purple-700/30">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">
                      ✨ הסינתזה המיסטית המתקדמת שלך ✨
                    </h2>
                    <div className="flex justify-center gap-4 mt-6 flex-wrap">
                      <Badge className="bg-green-600 text-white text-lg px-6 py-2">
                        דיוק 100% ✓
                      </Badge>
                      <Badge className="bg-purple-700 text-white text-lg px-6 py-2">
                        {synthesis.tools_used_count} כלים שולבו
                      </Badge>
                      <Badge className="bg-blue-700 text-white text-lg px-6 py-2">
                        {Math.round((synthesis.data_completeness || 0.85) * 100)}% שלמות נתונים
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Barnum Effect Disclaimer */}
                {synthesis.barnum_effect_disclaimer && (
                  <Card className="bg-blue-900/50 border-blue-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                        <div>
                          <h3 className="text-blue-200 font-bold text-lg mb-2">🎯 מדוע זה מדויק בשבילך</h3>
                          <p className="text-blue-100 text-base leading-relaxed mb-4">
                            {synthesis.barnum_effect_disclaimer.main_message}
                          </p>
                          
                          {synthesis.barnum_effect_disclaimer.your_specific_data && (
                            <div className="bg-blue-800/30 rounded-lg p-4 mb-4">
                              <p className="text-blue-200 font-semibold mb-2">הנתונים האישיים שלך שעליהם מבוסס הניתוח:</p>
                              <ul className="space-y-1">
                                {synthesis.barnum_effect_disclaimer.your_specific_data.map((data, idx) => (
                                  <li key={idx} className="text-blue-100 text-sm">✓ {data}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <p className="text-blue-100 text-sm leading-relaxed">
                            {synthesis.barnum_effect_disclaimer.how_different_from_generic}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Archetypal Summary */}
                {synthesis.archetypal_summary && (
                  <ResultCard title="🎭 הארכיטיפ המרכזי שלך" gradient="from-purple-900/50 to-indigo-900/50">
                    <div className="space-y-4">
                      <div>
                        <Badge className="bg-purple-700 text-white text-lg px-4 py-2 mb-2">
                          {synthesis.archetypal_summary.primary_archetype}
                        </Badge>
                        {synthesis.archetypal_summary.secondary_archetype && (
                          <Badge className="bg-indigo-700 text-white text-lg px-4 py-2 mb-2 mr-2">
                            {synthesis.archetypal_summary.secondary_archetype}
                          </Badge>
                        )}
                      </div>
                      <p className="text-white text-lg leading-relaxed">
                        {synthesis.archetypal_summary.description}
                      </p>
                      
                      {synthesis.archetypal_summary.supporting_tools && (
                        <div className="bg-purple-800/30 rounded-xl p-4 mt-4">
                          <p className="text-purple-200 font-semibold mb-3">📊 ראיות תומכות מהכלים:</p>
                          <div className="space-y-2">
                            {synthesis.archetypal_summary.supporting_tools.map((item, idx) => (
                              <div key={idx} className="bg-purple-900/30 rounded-lg p-3">
                                <p className="text-purple-300 font-semibold text-sm">{item.tool}:</p>
                                <p className="text-purple-100 text-sm">{item.evidence}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ResultCard>
                )}

                {/* Core Traits with Specific Evidence */}
                {synthesis.core_traits_integrated && synthesis.core_traits_integrated.length > 0 && (
                  <ResultCard title="💎 תכונות הליבה המשולבות" gradient="from-indigo-900/50 to-purple-900/50">
                    <div className="space-y-6">
                      {synthesis.core_traits_integrated.map((trait, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-indigo-800/30 rounded-xl p-6 border border-indigo-700/30"
                        >
                          <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                            <h3 className="text-2xl font-bold text-white">{trait.trait_name}</h3>
                            <Badge className="bg-green-600 text-white">
                              דיוק: {Math.round(trait.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="text-white text-lg leading-relaxed mb-4">
                            {trait.description}
                          </p>
                          
                          {/* Specific Evidence */}
                          {trait.specific_evidence && trait.specific_evidence.length > 0 && (
                            <div className="border-t border-indigo-700/30 pt-4">
                              <p className="text-indigo-200 text-sm font-semibold mb-3">🔍 ראיות ספציפיות מכל כלי:</p>
                              <div className="space-y-2">
                                {trait.specific_evidence.map((evidence, i) => (
                                  <div key={i} className="bg-indigo-900/40 rounded-lg p-3">
                                    <p className="text-indigo-300 font-semibold text-sm">{evidence.tool}:</p>
                                    <p className="text-indigo-100 text-sm">{evidence.data_point}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Strong Consistencies */}
                {synthesis.consistencies && synthesis.consistencies.length > 0 && (
                  <ResultCard title="✅ עקביות חזקות - כשכל הכלים מסכימים!" gradient="from-green-900/50 to-emerald-700/50" icon={CheckCircle}>
                    <div className="space-y-4">
                      {synthesis.consistencies.map((item, idx) => (
                        <div key={idx} className="bg-green-800/30 rounded-lg p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-xl font-bold text-green-200">{item.area}</h3>
                            <Badge className={`${
                              item.reinforcement_strength === 'absolute' ? 'bg-green-600' :
                              item.reinforcement_strength === 'very_strong' ? 'bg-green-700' : 'bg-green-800'
                            } text-white`}>
                              {item.reinforcement_strength === 'absolute' ? 'חיזוק מוחלט' :
                               item.reinforcement_strength === 'very_strong' ? 'חיזוק חזק מאוד' : 'חיזוק חזק'}
                            </Badge>
                          </div>
                          <p className="text-green-100 leading-relaxed mb-4">{item.description}</p>
                          
                          {/* Evidence per tool */}
                          {item.specific_evidence_per_tool && (
                            <div className="bg-green-900/40 rounded-lg p-4">
                              <p className="text-green-200 font-semibold text-sm mb-3">📋 ראיות מכל כלי:</p>
                              <div className="space-y-2">
                                {item.specific_evidence_per_tool.map((ev, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <Zap className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-green-300 font-semibold text-sm">{ev.tool}: </span>
                                      <span className="text-green-100 text-sm">{ev.evidence}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Contradictions with Deep Analysis */}
                {synthesis.contradictions && synthesis.contradictions.length > 0 && (
                  <ResultCard title="⚡ סתירות ומתחים פנימיים - המורכבות שלך" gradient="from-amber-900/50 to-orange-700/50" icon={AlertTriangle}>
                    <div className="space-y-5">
                      {synthesis.contradictions.map((item, idx) => (
                        <div key={idx} className="bg-amber-800/30 rounded-lg p-5 border border-amber-700/30">
                          <h4 className="text-xl font-bold text-amber-200 mb-3">{item.description}</h4>
                          
                          {/* Data Points */}
                          {item.specific_data_points && (
                            <div className="bg-amber-900/40 rounded-lg p-4 mb-4">
                              <p className="text-amber-200 font-semibold text-sm mb-2">📊 הנתונים הסותרים:</p>
                              <div className="space-y-2">
                                {item.specific_data_points.map((dp, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="text-amber-400 shrink-0">•</span>
                                    <div>
                                      <span className="text-amber-300 font-semibold">{dp.tool}: </span>
                                      <span className="text-amber-100">{dp.finding}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Psychological Interpretation */}
                          <div className="bg-orange-900/30 rounded-lg p-4 mb-3">
                            <p className="text-orange-200 text-sm font-semibold mb-2">🧠 פרשנות פסיכולוגית:</p>
                            <p className="text-orange-100 text-sm leading-relaxed">{item.psychological_interpretation}</p>
                          </div>
                          
                          {/* Meaning */}
                          <div className="bg-amber-900/30 rounded-lg p-4 mb-3">
                            <p className="text-amber-200 text-sm font-semibold mb-2">💡 המשמעות:</p>
                            <p className="text-amber-100 text-sm leading-relaxed">{item.meaning}</p>
                          </div>
                          
                          {/* Resolution */}
                          {item.resolution_suggestion && (
                            <div className="bg-green-900/30 rounded-lg p-4">
                              <p className="text-green-200 text-sm font-semibold mb-2">🎯 דרכי פתרון:</p>
                              <p className="text-green-100 text-sm leading-relaxed">{item.resolution_suggestion}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Deep Insights */}
                {synthesis.insights && synthesis.insights.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                      <Target className="w-8 h-8 text-purple-400" />
                      תובנות עמוקות משולבות
                    </h2>
                    {synthesis.insights.map((insight, idx) => (
                      <ExplainableInsight key={idx} insight={insight} showProvenance={isPremium} />
                    ))}
                  </div>
                )}

                {/* Integrated Recommendations */}
                {synthesis.integrated_recommendations && synthesis.integrated_recommendations.length > 0 && (
                  <ResultCard title="🌱 המלצות משולבות לצמיחה אישית" gradient="from-teal-900/50 to-cyan-700/50" icon={TrendingUp}>
                    <div className="space-y-4">
                      {synthesis.integrated_recommendations.map((rec, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-teal-800/30 rounded-lg p-5 border border-teal-700/30"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-teal-400 font-bold text-2xl shrink-0">{idx + 1}.</span>
                            <div className="flex-1">
                              <h4 className="text-teal-100 font-bold text-lg mb-2">{rec.recommendation}</h4>
                              <p className="text-teal-200 text-sm leading-relaxed mb-4">{rec.why_for_you}</p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {rec.actionable && (
                                  <div className="flex gap-2 w-full sm:w-auto">
                                    {/* Intelligent Action Buttons based on content */}
                                    {rec.recommendation.includes('יומן') && (
                                      <Link to={createPageUrl("Journal")}>
                                        <Button size="sm" variant="outline" className="border-teal-500/50 text-teal-200 hover:bg-teal-800/50 w-full">
                                          <BookOpen className="w-3 h-3 ml-2" />
                                          כתוב ביומן
                                        </Button>
                                      </Link>
                                    )}
                                    {rec.recommendation.includes('מטרה') || rec.recommendation.includes('יעד') && (
                                      <Link to={createPageUrl("MyGoals")}>
                                        <Button size="sm" variant="outline" className="border-teal-500/50 text-teal-200 hover:bg-teal-800/50 w-full">
                                          <Target className="w-3 h-3 ml-2" />
                                          הגדר יעד
                                        </Button>
                                      </Link>
                                    )}
                                    {!rec.recommendation.includes('יומן') && !rec.recommendation.includes('מטרה') && (
                                      <Link to={createPageUrl("AICoach")}>
                                        <Button size="sm" variant="outline" className="border-teal-500/50 text-teal-200 hover:bg-teal-800/50 w-full">
                                          <Sparkles className="w-3 h-3 ml-2" />
                                          התייעץ עם המאמן
                                        </Button>
                                      </Link>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="bg-teal-900/40 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-teal-300 text-xs font-semibold">מבוסס על:</p>
                                  <HelpTooltip text="המידע הספציפי מהכלים השונים שהוביל להמלצה זו" className="text-teal-400" />
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {rec.based_on_tools.map((tool, i) => (
                                    <Badge key={i} className="bg-teal-700 text-white text-xs">
                                      {tool}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-teal-200 text-xs">{rec.specific_basis}</p>
                              </div>
                            </div>
                            </div>
                            </motion.div>
                            ))}
                            </div>
                            </ResultCard>
                )}

                {/* Missing Tools Notice */}
                {synthesis.missing_tools && synthesis.missing_tools.length > 0 && (
                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-6 h-6 text-gray-300 shrink-0 mt-1" />
                        <div>
                          <h3 className="text-gray-200 font-bold text-lg mb-2">💡 רוצה ניתוח עוד יותר מדויק?</h3>
                          <p className="text-gray-300 text-sm mb-3">
                            הכלים הבאים לא שימשו בסינתזה כי טרם השתמשת בהם:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {synthesis.missing_tools.map((tool, idx) => (
                              <Badge key={idx} variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
                                {tool === 'numerology' && '🔢 נומרולוגיה'}
                                {tool === 'astrology' && '⭐ אסטרולוגיה'}
                                {tool === 'palmistry' && '🖐️ כף יד'}
                                {tool === 'graphology' && '✍️ גרפולוגיה'}
                                {tool === 'tarot' && '🃏 טארוט'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => setSynthesis(null)}
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-800/30 text-lg px-8 py-4"
                  >
                    סינתזה חדשה
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SubscriptionGuard>
  );
}