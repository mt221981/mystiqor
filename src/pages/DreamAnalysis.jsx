import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Moon, Plus, Sparkles, Eye, Heart, Brain, Calendar, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import { usePageView } from "@/components/Analytics";

const EMOTIONS = [
  { value: "fear", label: "פחד", emoji: "😨" },
  { value: "joy", label: "שמחה", emoji: "😊" },
  { value: "sadness", label: "עצב", emoji: "😢" },
  { value: "anger", label: "כעס", emoji: "😠" },
  { value: "confusion", label: "בלבול", emoji: "😕" },
  { value: "peace", label: "שלווה", emoji: "😌" },
  { value: "anxiety", label: "חרדה", emoji: "😰" },
  { value: "excitement", label: "התרגשות", emoji: "🤩" },
  { value: "love", label: "אהבה", emoji: "❤️" },
  { value: "curiosity", label: "סקרנות", emoji: "🤔" }
];

export default function DreamAnalysis() {
  usePageView('DreamAnalysis');

  const [showForm, setShowForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    dream_date: new Date().toISOString().split('T')[0],
    title: "",
    description: "",
    emotions: [],
    recurring: false,
    lucid: false,
    key_symbols: "",
    people_in_dream: "",
    location: "",
    mood_after_waking: "neutral"
  });

  const queryClient = useQueryClient();

  const { data: dreams = [], isLoading } = useQuery({
    queryKey: ['dreams'],
    queryFn: () => base44.entities.Dream.list('-dream_date', 50),
    initialData: []
  });

  const createDreamMutation = useMutation({
    mutationFn: async (dreamData) => {
      const dream = await base44.entities.Dream.create(dreamData);
      
      // Analyze dream with AI asynchronously
      setIsAnalyzing(true);
      
      // 1. Generate Dream Image (Parallel)
      base44.integrations.Core.GenerateImage({
        prompt: `Surrealistic dream art, ethereal, mystical style: ${dreamData.title} - ${dreamData.description.substring(0, 300)}. High quality, detailed, fantasy art.`
      })
      .then(async (imgRes) => {
        if (imgRes && imgRes.url) {
          await base44.entities.Dream.update(dream.id, { image_url: imgRes.url });
          queryClient.invalidateQueries(['dreams']);
        }
      })
      .catch(err => console.error("Image generation failed", err));

      // 2. Analyze Text
      base44.integrations.Core.InvokeLLM({
          prompt: `אתה פסיכולוג ומומחה לפרשנות חלומות ברמה עולמית.

**החלום:**
- כותרת: ${dreamData.title}
- תיאור מלא: ${dreamData.description}
- רגשות: ${dreamData.emotions?.join(', ') || 'לא צוין'}
- סמלים מרכזיים: ${dreamData.key_symbols || 'לא צוין'}
- אנשים בחלום: ${dreamData.people_in_dream || 'לא צוין'}
- מקום: ${dreamData.location || 'לא צוין'}
- מצב רוח בהתעוררות: ${dreamData.mood_after_waking}
${dreamData.recurring ? '- זהו חלום חוזר!' : ''}
${dreamData.lucid ? '- זהו חלום צלול (lucid dream)!' : ''}

**המשימה:** פרש את החלום בעומק, עם התייחסות לסמלים, נושאים פסיכולוגיים, וקשר לחיי המציאות.

**החזר JSON:**`,
          add_context_from_internet: false,
          response_json_schema: {
            type: "object",
            properties: {
              ai_interpretation: { type: "string", minLength: 200, maxLength: 800 },
              psychological_themes: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4
              },
              symbols_meanings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    symbol: { type: "string" },
                    meaning: { type: "string" },
                    personal_context: { type: "string" }
                  }
                },
                minItems: 1,
                maxItems: 5
              },
              connection_to_waking_life: { type: "string", minLength: 100, maxLength: 400 }
            },
            required: ["ai_interpretation", "psychological_themes", "symbols_meanings", "connection_to_waking_life"]
          }
        })
        .then(async (response) => {
          // Update dream with AI analysis
          await base44.entities.Dream.update(dream.id, {
            ai_interpretation: response.ai_interpretation,
            psychological_themes: response.psychological_themes,
            symbols_meanings: response.symbols_meanings,
            connection_to_waking_life: response.connection_to_waking_life
          });
        })
        .catch((error) => {
          console.error('AI analysis failed:', error);
          // Dream is saved, analysis failed - that's OK
        })
        .finally(() => {
          setIsAnalyzing(false);
        });

      return dream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dreams']);
      setShowForm(false);
      setFormData({
        dream_date: new Date().toISOString().split('T')[0],
        title: "",
        description: "",
        emotions: [],
        recurring: false,
        lucid: false,
        key_symbols: "",
        people_in_dream: "",
        location: "",
        mood_after_waking: "neutral"
      });
      EnhancedToast.success('החלום נשמר ונותח! 🌙');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      EnhancedToast.error('נא למלא כותרת ותיאור החלום');
      return;
    }

    createDreamMutation.mutate({
      ...formData,
      key_symbols: formData.key_symbols.split(',').map(s => s.trim()).filter(Boolean),
      people_in_dream: formData.people_in_dream.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  const toggleEmotion = (emotion) => {
    setFormData(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/30 to-black p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="ניתוח חלומות 🌙"
          description="תעד את החלומות שלך וקבל פרשנות עמוקה מבוססת AI"
          icon={Moon}
          iconGradient="from-indigo-600 to-purple-600"
        />

        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xl h-14 mb-8"
        >
          <Plus className="w-6 h-6 ml-2" />
          {showForm ? 'ביטול' : 'הוסף חלום חדש'}
        </Button>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gray-900/80 backdrop-blur-xl border-indigo-700/50 mb-8">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">רשום את החלום שלך</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white text-lg mb-2 block">תאריך החלום</Label>
                        <Input
                          type="date"
                          value={formData.dream_date}
                          onChange={(e) => setFormData({ ...formData, dream_date: e.target.value })}
                          className="bg-gray-800 text-white border-indigo-700 h-12"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <Label className="text-white text-lg mb-2 block">כותרת החלום *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="למשל: טיסה מעל העיר"
                          className="bg-gray-800 text-white border-indigo-700 h-12"
                          dir="rtl"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-2 block">תיאור החלום *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="תאר את החלום במפורט ככל האפשר..."
                        className="bg-gray-800 text-white border-indigo-700 min-h-40"
                        dir="rtl"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-2 block">רגשות בחלום</Label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {EMOTIONS.map(emotion => (
                          <Button
                            key={emotion.value}
                            type="button"
                            onClick={() => toggleEmotion(emotion.value)}
                            className={`${
                              formData.emotions.includes(emotion.value)
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                          >
                            {emotion.emoji} {emotion.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white text-lg mb-2 block">סמלים מרכזיים</Label>
                        <Input
                          value={formData.key_symbols}
                          onChange={(e) => setFormData({ ...formData, key_symbols: e.target.value })}
                          placeholder="למשל: מים, ציפורים, בית (מופרד בפסיקים)"
                          className="bg-gray-800 text-white border-indigo-700 h-12"
                          dir="rtl"
                        />
                      </div>

                      <div>
                        <Label className="text-white text-lg mb-2 block">אנשים בחלום</Label>
                        <Input
                          value={formData.people_in_dream}
                          onChange={(e) => setFormData({ ...formData, people_in_dream: e.target.value })}
                          placeholder="שמות או תיאורים (מופרד בפסיקים)"
                          className="bg-gray-800 text-white border-indigo-700 h-12"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={createDreamMutation.isPending || isAnalyzing}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-14"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          מנתח את החלום...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 ml-2" />
                          שמור ונתח חלום
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {dreams.length === 0 ? (
          <Card className="bg-indigo-900/30 backdrop-blur-xl border-indigo-700/50">
            <CardContent className="p-12 text-center">
              <Moon className="w-20 h-20 text-indigo-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-3">עדיין אין חלומות</h3>
              <p className="text-indigo-200 text-lg mb-6">
                התחל לתעד את החלומות שלך וקבל תובנות עמוקות מהתת מודע
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {dreams.map((dream) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-gray-900/80 backdrop-blur-xl border-indigo-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Moon className="w-6 h-6 text-indigo-400" />
                          <h3 className="text-white text-2xl font-bold">{dream.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                          <Calendar className="w-4 h-4" />
                          {new Date(dream.dream_date).toLocaleDateString('he-IL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {dream.lucid && (
                            <Badge className="bg-purple-600">
                              <Eye className="w-3 h-3 ml-1" />
                              חלום צלול
                            </Badge>
                          )}
                          {dream.recurring && (
                            <Badge className="bg-amber-600">חלום חוזר</Badge>
                          )}
                          {dream.emotions?.map(emotion => {
                            const emotionData = EMOTIONS.find(e => e.value === emotion);
                            return emotionData ? (
                              <Badge key={emotion} className="bg-indigo-700">
                                {emotionData.emoji} {emotionData.label}
                              </Badge>
                            ) : null;
                          })}
                        </div>

                        <p className="text-gray-300 leading-relaxed mb-6">
                          {dream.description}
                        </p>

                        {dream.image_url && (
                          <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-indigo-500/30">
                            <img 
                              src={dream.image_url} 
                              alt="Dream visualization" 
                              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="bg-indigo-950/80 p-2 text-center text-xs text-indigo-200">
                              ✨ Dreamscape AI Visualization
                            </div>
                          </div>
                        )}

                        {dream.ai_interpretation && (
                          <div className="bg-indigo-950/50 rounded-lg p-6 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-5 h-5 text-yellow-400" />
                              <h4 className="text-indigo-100 font-bold text-lg">פרשנות AI</h4>
                            </div>
                            <p className="text-indigo-200 leading-relaxed mb-4">
                              {dream.ai_interpretation}
                            </p>

                            {dream.psychological_themes?.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-indigo-300 font-semibold mb-2 flex items-center gap-2">
                                  <Brain className="w-4 h-4" />
                                  נושאים פסיכולוגיים:
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {dream.psychological_themes.map((theme, idx) => (
                                    <Badge key={idx} className="bg-purple-700">
                                      {theme}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {dream.symbols_meanings?.length > 0 && (
                              <div>
                                <h5 className="text-indigo-300 font-semibold mb-3">סמלים ומשמעויות:</h5>
                                <div className="space-y-3">
                                  {dream.symbols_meanings.map((item, idx) => (
                                    <div key={idx} className="bg-indigo-900/30 rounded-lg p-3">
                                      <p className="text-white font-semibold mb-1">
                                        {item.symbol}
                                      </p>
                                      <p className="text-indigo-200 text-sm">
                                        {item.meaning}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {dream.connection_to_waking_life && (
                              <div className="mt-4 bg-purple-950/50 rounded-lg p-4">
                                <h5 className="text-purple-200 font-semibold mb-2 flex items-center gap-2">
                                  <Heart className="w-4 h-4" />
                                  קשר לחיי המציאות:
                                </h5>
                                <p className="text-purple-100 text-sm leading-relaxed">
                                  {dream.connection_to_waking_life}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}