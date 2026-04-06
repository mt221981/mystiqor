import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EnhancedToast from "@/components/EnhancedToast";

const TOOL_INFO = {
  numerology: { name: "נומרולוגיה", emoji: "🔢", gradient: "from-purple-600 to-pink-600", path: "Numerology" },
  astrology: { name: "אסטרולוגיה", emoji: "⭐", gradient: "from-indigo-600 to-blue-600", path: "Astrology" },
  palmistry: { name: "כף יד", emoji: "🖐️", gradient: "from-blue-600 to-cyan-600", path: "Palmistry" },
  graphology: { name: "גרפולוגיה", emoji: "✍️", gradient: "from-green-600 to-emerald-600", path: "Graphology" },
  tarot: { name: "טארוט", emoji: "🃏", gradient: "from-amber-600 to-orange-600", path: "Tarot" },
  drawing_analysis: { name: "ניתוח ציור", emoji: "🎨", gradient: "from-pink-600 to-rose-600", path: "DrawingAnalysis" }
};

export default function AISuggestionsWidget() {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  const { data: analyses } = useQuery({
    queryKey: ['userAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50),
    staleTime: 30000
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      if (!userProfile) {
        throw new Error('No profile found');
      }

      const analysesCompleted = analyses?.length || 0;
      const completedTools = [...new Set(analyses?.map(a => a.tool_type) || [])];
      
      const prompt = `אתה יועץ מיסטי מומחה שעוזר למשתמשים לבחור את הניתוחים הבאים שלהם.

**פרטי המשתמש:**
- שם: ${userProfile.full_name_hebrew || 'לא צוין'}
- תאריך לידה: ${userProfile.birth_date ? new Date(userProfile.birth_date).toLocaleDateString('he-IL') : 'לא צוין'}
- שעת לידה: ${userProfile.birth_time || 'לא צוין'}
- מקום לידה: ${userProfile.birth_place_name || 'לא צוין'}
- תחומים מועדפים: ${userProfile.preferred_disciplines?.join(', ') || 'לא צוינו'}
- תחומי מיקוד: ${userProfile.focus_areas?.join(', ') || 'לא צוינו'}
- מטרות אישיות: ${userProfile.personal_goals?.join(', ') || 'לא צוינו'}

**ניתוחים שכבר בוצעו:** ${analysesCompleted} ניתוחים (${completedTools.join(', ') || 'אף אחד'})

**כלים זמינים:**
1. numerology - נומרולוגיה (מספרים ומשמעויות)
2. astrology - אסטרולוגיה (מפת לידה, כוכבים)
3. palmistry - קריאת כף יד (צריך תמונה)
4. graphology - גרפולוגיה (ניתוח כתב יד)
5. tarot - טארוט (קלפים וסמלים)
6. drawing_analysis - ניתוח ציורים (פסיכולוגיה)

**התפקיד שלך:**
1. הצע 2-3 כלים הכי מתאימים למשתמש הזה
2. התבסס על:
   - העדפות שלו (preferred_disciplines)
   - תחומי המיקוד שלו (focus_areas)
   - המטרות האישיות שלו
   - מה שכבר עשה (אל תציע שוב)
   - נתונים שיש לו (אם יש birth_time מלא - אסטרולוגיה מדויקת!)

3. לכל הצעה:
   - למה זה מתאים דווקא לו?
   - איך זה יעזור להגיע למטרות שלו?
   - מה הערך המוסף?

**חשוב:**
- אם יש לו birth_time - אסטרולוגיה היא הצעה מעולה
- אם יש לו focus על relationships - numerology + astrology + tarot
- אם יש לו focus על career - numerology + graphology + palmistry
- אם הוא חדש - התחל מנומרולוגיה או אסטרולוגיה (בסיסי)
- גוון בעברית, אישי, מעצים

החזר JSON מובנה.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              minItems: 2,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  tool: {
                    type: "string",
                    enum: ["numerology", "astrology", "palmistry", "graphology", "tarot", "drawing_analysis"]
                  },
                  title: { type: "string" },
                  reason: { type: "string", minLength: 100 },
                  relevance_score: { type: "number", minimum: 0, maximum: 1 },
                  expected_benefit: { type: "string" }
                },
                required: ["tool", "title", "reason", "relevance_score"]
              }
            },
            overall_recommendation: { type: "string" },
            next_step_priority: { type: "string" }
          },
          required: ["suggestions"]
        }
      });

      // Update profile with last suggestion date
      await base44.entities.UserProfile.update(userProfile.id, {
        last_suggestion_date: new Date().toISOString()
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateSuggestionsMutation.mutateAsync();
      EnhancedToast.success('המלצות חדשות נוצרו! ✨');
    } catch (error) {
      EnhancedToast.error('שגיאה ביצירת המלצות', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on first load if profile is complete and no suggestions exist
  React.useEffect(() => {
    if (
      userProfile &&
      userProfile.ai_suggestions_enabled &&
      !userProfile.last_suggestion_date &&
      userProfile.profile_completion_score >= 60
    ) {
      handleGenerate();
    }
  }, [userProfile]);

  if (!userProfile || !userProfile.ai_suggestions_enabled) {
    return null;
  }

  const suggestions = generateSuggestionsMutation.data?.suggestions || [];
  const shouldRegenerate = userProfile.last_suggestion_date && 
    (new Date() - new Date(userProfile.last_suggestion_date)) > 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <Card className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-xl border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            המלצות AI בשבילך
          </div>
          {suggestions.length > 0 && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="ghost"
              size="sm"
              className="text-purple-300 hover:text-purple-100"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-spin" />
            <p className="text-purple-200">מייצר המלצות מותאמות אישית...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-6">
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-purple-200 mb-4">
              תן לAI לנתח את הפרופיל שלך ולהציע את הניתוחים הכי מתאימים בשבילך
            </p>
            <Button
              onClick={handleGenerate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              צור המלצות אישיות
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {generateSuggestionsMutation.data?.overall_recommendation && (
              <div className="bg-indigo-950/50 rounded-lg p-4 border border-indigo-700/50 mb-4">
                <p className="text-indigo-200 text-sm leading-relaxed">
                  {generateSuggestionsMutation.data.overall_recommendation}
                </p>
              </div>
            )}

            <AnimatePresence>
              {suggestions.map((suggestion, idx) => {
                const toolInfo = TOOL_INFO[suggestion.tool];
                if (!toolInfo) return null;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link to={createPageUrl(toolInfo.path)}>
                      <Card className={`bg-gradient-to-r ${toolInfo.gradient} border-0 hover:scale-[1.02] transition-all cursor-pointer`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-3xl">{toolInfo.emoji}</span>
                            <div className="flex-1">
                              <h4 className="text-white font-bold text-lg mb-1">
                                {suggestion.title}
                              </h4>
                              <Badge className="bg-white/20 text-white text-xs mb-2">
                                התאמה: {Math.round(suggestion.relevance_score * 100)}%
                              </Badge>
                            </div>
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed mb-3">
                            {suggestion.reason}
                          </p>
                          {suggestion.expected_benefit && (
                            <p className="text-white/80 text-xs italic">
                              💫 {suggestion.expected_benefit}
                            </p>
                          )}
                          <div className="flex items-center justify-end mt-3 text-white/90">
                            <span className="text-sm font-semibold">התחל עכשיו</span>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {shouldRegenerate && (
              <p className="text-purple-300 text-xs text-center mt-4">
                💡 המלצות אלו נוצרו לפני שבוע - רוצה המלצות מעודכנות?
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}