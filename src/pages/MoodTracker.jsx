import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, Plus, TrendingUp, Calendar, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import { usePageView } from "@/components/Analytics";

const MOOD_OPTIONS = [
  { value: "very_happy", label: "שמח מאוד", emoji: "😄", color: "green" },
  { value: "happy", label: "שמח", emoji: "😊", color: "lime" },
  { value: "content", label: "מרוצה", emoji: "🙂", color: "emerald" },
  { value: "neutral", label: "ניטרלי", emoji: "😐", color: "gray" },
  { value: "sad", label: "עצוב", emoji: "😢", color: "blue" },
  { value: "very_sad", label: "עצוב מאוד", emoji: "😭", color: "indigo" },
  { value: "anxious", label: "חרד", emoji: "😰", color: "amber" },
  { value: "stressed", label: "לחוץ", emoji: "😫", color: "orange" },
  { value: "energized", label: "אנרגטי", emoji: "⚡", color: "yellow" },
  { value: "tired", label: "עייף", emoji: "😴", color: "slate" }
];

export default function MoodTracker() {
  usePageView('MoodTracker');

  const [showForm, setShowForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    mood: "neutral",
    mood_score: 5,
    energy_level: 5,
    stress_level: 5,
    sleep_quality: 5,
    activities: "",
    notes: "",
    gratitude_items: ""
  });

  const queryClient = useQueryClient();

  const { data: moodEntries = [], isLoading } = useQuery({
    queryKey: ['mood_entries'],
    queryFn: () => base44.entities.MoodEntry.list('-entry_date', 30),
    initialData: []
  });

  const createMoodMutation = useMutation({
    mutationFn: async (moodData) => {
      const entry = await base44.entities.MoodEntry.create(moodData);
      
      // Analyze patterns asynchronously if we have enough data
      if (moodEntries.length >= 6) {
        setIsAnalyzing(true);
        
        const last7Days = moodEntries.slice(0, 7);
        const avgMood = last7Days.reduce((sum, e) => sum + e.mood_score, 0) / last7Days.length;
        const avgEnergy = last7Days.reduce((sum, e) => sum + (e.energy_level || 5), 0) / last7Days.length;
        const avgStress = last7Days.reduce((sum, e) => sum + (e.stress_level || 5), 0) / last7Days.length;

        base44.integrations.Core.InvokeLLM({
            prompt: `אתה פסיכולוג ומומחה לניתוח דפוסי מצב רוח.

**ממוצעים (${last7Days.length} ימים):**
מצב רוח: ${avgMood.toFixed(1)}/10 | אנרגיה: ${avgEnergy.toFixed(1)}/10 | לחץ: ${avgStress.toFixed(1)}/10

**היום:**
מצב רוח: ${moodData.mood_score}/10 | אנרגיה: ${moodData.energy_level}/10 | לחץ: ${moodData.stress_level}/10 | שינה: ${moodData.sleep_quality}/10
${moodData.notes ? `הערות: ${moodData.notes}` : ''}

**נתח דפוסים והמלץ על פעולות מעשיות:**`,
            add_context_from_internet: false,
            response_json_schema: {
              type: "object",
              properties: {
                ai_insights: { type: "string", minLength: 150, maxLength: 500 },
                patterns_detected: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 2,
                  maxItems: 4
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 5
                }
              },
              required: ["ai_insights", "patterns_detected", "recommendations"]
            }
          })
          .then(async (response) => {
            await base44.entities.MoodEntry.update(entry.id, {
              ai_insights: response.ai_insights,
              patterns_detected: response.patterns_detected,
              recommendations: response.recommendations
            });
          })
          .catch((error) => {
            console.error('AI analysis failed:', error);
          })
          .finally(() => {
            setIsAnalyzing(false);
          });
      }

      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mood_entries']);
      setShowForm(false);
      setFormData({
        mood: "neutral",
        mood_score: 5,
        energy_level: 5,
        stress_level: 5,
        sleep_quality: 5,
        activities: "",
        notes: "",
        gratitude_items: ""
      });
      EnhancedToast.success('מצב הרוח נרשם! 📊');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    createMoodMutation.mutate({
      ...formData,
      entry_date: new Date().toISOString(),
      activities: formData.activities.split(',').map(s => s.trim()).filter(Boolean),
      gratitude_items: formData.gratitude_items.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  const getMoodIcon = (score) => {
    if (score >= 7) return <Smile className="w-6 h-6 text-green-400" />;
    if (score >= 4) return <Meh className="w-6 h-6 text-yellow-400" />;
    return <Frown className="w-6 h-6 text-red-400" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  const avgMood = moodEntries.length > 0
    ? moodEntries.reduce((sum, e) => sum + e.mood_score, 0) / moodEntries.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="מעקב מצב רוח 📊"
          description="עקוב אחר מצב הרוח שלך וקבל תובנות AI על דפוסים ודרכים לשיפור"
          icon={Smile}
          iconGradient="from-purple-600 to-pink-600"
        />

        {moodEntries.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50">
              <CardContent className="p-6 text-center">
                <Smile className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{avgMood.toFixed(1)}</div>
                <p className="text-green-300">ממוצע מצב רוח</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700/50">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{moodEntries.length}</div>
                <p className="text-purple-300">רשומות</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-700/50">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">
                  {moodEntries[0]?.entry_date && moodEntries[moodEntries.length - 1]?.entry_date
                    ? Math.max(1, Math.ceil((new Date(moodEntries[0].entry_date).getTime() - new Date(moodEntries[moodEntries.length - 1].entry_date).getTime()) / (1000 * 60 * 60 * 24)))
                    : moodEntries.length}
                </div>
                <p className="text-blue-300">ימי מעקב</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xl h-14 mb-8"
        >
          <Plus className="w-6 h-6 ml-2" />
          {showForm ? 'ביטול' : 'רשום מצב רוח'}
        </Button>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/50 mb-8">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">איך אתה מרגיש היום?</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label className="text-white text-lg mb-3 block">מצב רוח כללי</Label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {MOOD_OPTIONS.map(mood => (
                          <Button
                            key={mood.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, mood: mood.value })}
                            className={`${
                              formData.mood === mood.value
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-gray-800 hover:bg-gray-700'
                            } flex-col h-auto py-3`}
                          >
                            <span className="text-3xl mb-1">{mood.emoji}</span>
                            <span className="text-xs">{mood.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-2 block">
                        דירוג מצב רוח: {formData.mood_score}/10
                      </Label>
                      <Slider
                        value={[formData.mood_score]}
                        onValueChange={([value]) => setFormData({ ...formData, mood_score: value })}
                        min={1}
                        max={10}
                        step={1}
                        className="mb-2"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-white mb-2 block">
                          רמת אנרגיה: {formData.energy_level}/10
                        </Label>
                        <Slider
                          value={[formData.energy_level]}
                          onValueChange={([value]) => setFormData({ ...formData, energy_level: value })}
                          min={1}
                          max={10}
                          step={1}
                        />
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">
                          רמת לחץ: {formData.stress_level}/10
                        </Label>
                        <Slider
                          value={[formData.stress_level]}
                          onValueChange={([value]) => setFormData({ ...formData, stress_level: value })}
                          min={1}
                          max={10}
                          step={1}
                        />
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">
                          איכות שינה: {formData.sleep_quality}/10
                        </Label>
                        <Slider
                          value={[formData.sleep_quality]}
                          onValueChange={([value]) => setFormData({ ...formData, sleep_quality: value })}
                          min={1}
                          max={10}
                          step={1}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-2 block">הערות</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="מה השפיע על מצב הרוח שלך היום?"
                        className="bg-gray-800 text-white border-purple-700"
                        dir="rtl"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={createMoodMutation.isPending || isAnalyzing}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          מנתח דפוסים...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 ml-2" />
                          שמור רישום
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {moodEntries.length === 0 ? (
          <Card className="bg-purple-900/30 backdrop-blur-xl border-purple-700/50">
            <CardContent className="p-12 text-center">
              <Smile className="w-20 h-20 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-3">התחל לעקוב אחר מצב הרוח שלך</h3>
              <p className="text-purple-200 text-lg mb-6">
                רישום יומי יעזור לך לזהות דפוסים ולשפר את הרווחה הנפשית שלך
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {moodEntries.map((entry) => {
              const moodOption = MOOD_OPTIONS.find(m => m.value === entry.mood);
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{moodOption?.emoji}</span>
                          <div>
                            <h3 className="text-white text-xl font-bold">{moodOption?.label}</h3>
                            <p className="text-gray-400 text-sm">
                              {new Date(entry.entry_date).toLocaleDateString('he-IL', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        {getMoodIcon(entry.mood_score)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-purple-950/50 rounded-lg p-3">
                          <p className="text-purple-300 text-xs mb-1">מצב רוח</p>
                          <p className="text-white font-bold text-lg">{entry.mood_score}/10</p>
                        </div>
                        <div className="bg-blue-950/50 rounded-lg p-3">
                          <p className="text-blue-300 text-xs mb-1">אנרגיה</p>
                          <p className="text-white font-bold text-lg">{entry.energy_level}/10</p>
                        </div>
                        <div className="bg-amber-950/50 rounded-lg p-3">
                          <p className="text-amber-300 text-xs mb-1">לחץ</p>
                          <p className="text-white font-bold text-lg">{entry.stress_level}/10</p>
                        </div>
                        <div className="bg-indigo-950/50 rounded-lg p-3">
                          <p className="text-indigo-300 text-xs mb-1">שינה</p>
                          <p className="text-white font-bold text-lg">{entry.sleep_quality}/10</p>
                        </div>
                      </div>

                      {entry.notes && (
                        <p className="text-gray-300 leading-relaxed mb-4">
                          {entry.notes}
                        </p>
                      )}

                      {entry.ai_insights && (
                        <div className="bg-purple-950/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <h4 className="text-purple-100 font-bold">תובנות AI</h4>
                          </div>
                          <p className="text-purple-200 text-sm leading-relaxed mb-3">
                            {entry.ai_insights}
                          </p>

                          {entry.patterns_detected?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-purple-300 text-xs font-semibold mb-2">דפוסים שזוהו:</p>
                              <div className="flex flex-wrap gap-2">
                                {entry.patterns_detected.map((pattern, idx) => (
                                  <Badge key={idx} className="bg-purple-700 text-xs">
                                    {pattern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {entry.recommendations?.length > 0 && (
                            <div>
                              <p className="text-purple-300 text-xs font-semibold mb-2">המלצות:</p>
                              <ul className="space-y-1">
                                {entry.recommendations.map((rec, idx) => (
                                  <li key={idx} className="text-purple-100 text-xs">
                                    • {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}