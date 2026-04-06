import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Calendar, Heart, Lightbulb, TrendingUp, Trash2, Edit, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Slider } from "@/components/ui/slider";

const MOOD_OPTIONS = [
  { value: "very_happy", emoji: "😄", label: "מאוד שמח", color: "text-green-400" },
  { value: "happy", emoji: "😊", label: "שמח", color: "text-blue-400" },
  { value: "neutral", emoji: "😐", label: "ניטרלי", color: "text-gray-400" },
  { value: "sad", emoji: "😔", label: "עצוב", color: "text-orange-400" },
  { value: "very_sad", emoji: "😢", label: "מאוד עצוב", color: "text-red-400" }
];

export default function Journal() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "neutral",
    mood_score: 5,
    energy_level: 5,
    gratitude_items: ["", "", ""],
    goals: [""]
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.JournalEntry.list('-entry_date', 50),
    initialData: [],
    staleTime: 30000
  });

  const createEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      resetForm();
      EnhancedToast.success('הרישום נשמר בהצלחה! 📖');
    }
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JournalEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      resetForm();
      EnhancedToast.success('הרישום עודכן בהצלחה!');
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      EnhancedToast.success('הרישום נמחק');
    }
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async (entry) => {
      const prompt = `אתה יועץ אישי מומחה. נתח את הרישום הבא ביומן:

תוכן: ${entry.content}
מצב רוח: ${entry.mood_score}/10
אנרגיה: ${entry.energy_level}/10
${entry.gratitude_items ? `תודות: ${entry.gratitude_items.filter(Boolean).join(', ')}` : ''}
${entry.goals ? `מטרות: ${entry.goals.filter(Boolean).join(', ')}` : ''}

תן 2-3 תובנות קצרות ומעשיות (1-2 משפטים כל תובנה) שיעזרו לאדם לצמוח.
כתוב בעברית, בצורה חמה ומעודדת.`;

      const insights = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      return insights;
    },
    onSuccess: (insights, entry) => {
      updateEntryMutation.mutate({
        id: entry.id,
        data: { ...entry, ai_insights: insights }
      });
    }
  });

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      content: "",
      mood: "neutral",
      mood_score: 5,
      energy_level: 5,
      gratitude_items: ["", "", ""],
      goals: [""]
    });
    setShowForm(false);
    setEditingEntry(null);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      EnhancedToast.error('נא להזין תוכן');
      return;
    }

    const entryData = {
      ...formData,
      entry_date: new Date().toISOString(),
      gratitude_items: formData.gratitude_items.filter(Boolean),
      goals: formData.goals.filter(Boolean)
    };

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data: entryData });
    } else {
      createEntryMutation.mutate(entryData);
    }
  }, [formData, editingEntry, createEntryMutation, updateEntryMutation]);

  const handleEdit = useCallback((entry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title || "",
      content: entry.content,
      mood: entry.mood || "neutral",
      mood_score: entry.mood_score || 5,
      energy_level: entry.energy_level || 5,
      gratitude_items: entry.gratitude_items?.length > 0 ? entry.gratitude_items : ["", "", ""],
      goals: entry.goals?.length > 0 ? entry.goals : [""]
    });
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id) => {
    if (confirm('האם אתה בטוח שברצונך למחוק רישום זה?')) {
      deleteEntryMutation.mutate(id);
    }
  }, [deleteEntryMutation]);

  if (isLoading) {
    return <LoadingSpinner message="טוען יומן..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <PageHeader
            title="היומן המיסטי שלי"
            description="תעד את המסע האישי שלך"
            icon={BookOpen}
            iconGradient="from-indigo-600 to-purple-600"
          />
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 ml-2" />
            רישום חדש
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="bg-indigo-900/30 backdrop-blur-xl border-indigo-700/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">
                    {editingEntry ? 'ערוך רישום' : 'רישום חדש'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">כותרת (אופציונלי)</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-indigo-800/30 border-indigo-600/50 text-white"
                        placeholder="תן כותרת לרישום..."
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-white">מה עובר עליך?</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="bg-indigo-800/30 border-indigo-600/50 text-white min-h-[200px]"
                        placeholder="כתוב בחופשיות על היום שלך, רגשות, מחשבות..."
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white">איך אתה מרגיש?</Label>
                      <div className="flex gap-4 flex-wrap">
                        {MOOD_OPTIONS.map((mood) => (
                          <Button
                            key={mood.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, mood: mood.value })}
                            className={`${
                              formData.mood === mood.value
                                ? 'bg-indigo-600 border-2 border-indigo-400'
                                : 'bg-indigo-800/30 border border-indigo-600/50'
                            } hover:bg-indigo-700`}
                          >
                            <span className="text-2xl ml-2">{mood.emoji}</span>
                            <span className="text-white">{mood.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white">
                        דירוג מצב רוח: {formData.mood_score}/10
                      </Label>
                      <Slider
                        value={[formData.mood_score]}
                        onValueChange={([value]) => setFormData({ ...formData, mood_score: value })}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white">
                        רמת אנרגיה: {formData.energy_level}/10
                      </Label>
                      <Slider
                        value={[formData.energy_level]}
                        onValueChange={([value]) => setFormData({ ...formData, energy_level: value })}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-400" />
                        על מה אני אסיר תודה היום?
                      </Label>
                      {formData.gratitude_items.map((item, index) => (
                        <Input
                          key={index}
                          value={item}
                          onChange={(e) => {
                            const newItems = [...formData.gratitude_items];
                            newItems[index] = e.target.value;
                            setFormData({ ...formData, gratitude_items: newItems });
                          }}
                          className="bg-indigo-800/30 border-indigo-600/50 text-white"
                          placeholder={`דבר ${index + 1}...`}
                          dir="rtl"
                        />
                      ))}
                      <Button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          gratitude_items: [...formData.gratitude_items, ""]
                        })}
                        variant="outline"
                        size="sm"
                        className="border-indigo-500 text-indigo-300"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף עוד
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        מטרות להיום/תקופה הקרובה
                      </Label>
                      {formData.goals.map((goal, index) => (
                        <Input
                          key={index}
                          value={goal}
                          onChange={(e) => {
                            const newGoals = [...formData.goals];
                            newGoals[index] = e.target.value;
                            setFormData({ ...formData, goals: newGoals });
                          }}
                          className="bg-indigo-800/30 border-indigo-600/50 text-white"
                          placeholder={`מטרה ${index + 1}...`}
                          dir="rtl"
                        />
                      ))}
                      <Button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          goals: [...formData.goals, ""]
                        })}
                        variant="outline"
                        size="sm"
                        className="border-indigo-500 text-indigo-300"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף מטרה
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={resetForm}
                        variant="outline"
                        className="flex-1 border-indigo-500 text-indigo-300"
                      >
                        ביטול
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                        disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                      >
                        <BookOpen className="w-5 h-5 ml-2" />
                        {editingEntry ? 'עדכן' : 'שמור'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {entries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="היומן שלך ריק"
            description="התחל לתעד את המסע האישי שלך"
          />
        ) : (
          <div className="space-y-6">
            {entries.map((entry, idx) => {
              const moodOption = MOOD_OPTIONS.find(m => m.value === entry.mood) || MOOD_OPTIONS[2];
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-indigo-900/30 backdrop-blur-xl border-indigo-700/30 hover:border-indigo-500/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{moodOption.emoji}</span>
                            <div>
                              {entry.title && (
                                <CardTitle className="text-white text-xl mb-1">
                                  {entry.title}
                                </CardTitle>
                              )}
                              <div className="flex items-center gap-2 text-indigo-300 text-sm">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(entry.entry_date), 'dd MMMM yyyy, HH:mm', { locale: he })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 flex-wrap mt-3">
                            <Badge className="bg-purple-800/50 text-purple-200">
                              מצב רוח: {entry.mood_score}/10
                            </Badge>
                            <Badge className="bg-blue-800/50 text-blue-200">
                              אנרגיה: {entry.energy_level}/10
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(entry)}
                            variant="ghost"
                            size="icon"
                            className="text-indigo-300 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(entry.id)}
                            variant="ghost"
                            size="icon"
                            className="text-red-300 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-white leading-relaxed whitespace-pre-wrap">
                        {entry.content}
                      </p>

                      {entry.gratitude_items && entry.gratitude_items.length > 0 && (
                        <div className="bg-pink-900/20 rounded-lg p-4">
                          <h4 className="text-pink-300 font-bold mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            תודות
                          </h4>
                          <ul className="space-y-1">
                            {entry.gratitude_items.map((item, i) => (
                              <li key={i} className="text-pink-200">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.goals && entry.goals.length > 0 && (
                        <div className="bg-green-900/20 rounded-lg p-4">
                          <h4 className="text-green-300 font-bold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            מטרות
                          </h4>
                          <ul className="space-y-1">
                            {entry.goals.map((goal, i) => (
                              <li key={i} className="text-green-200">• {goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.ai_insights ? (
                        <div className="bg-purple-900/20 rounded-lg p-4">
                          <h4 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            תובנות AI
                          </h4>
                          <p className="text-purple-200 leading-relaxed whitespace-pre-wrap">
                            {entry.ai_insights}
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => generateInsightsMutation.mutate(entry)}
                          disabled={generateInsightsMutation.isPending}
                          variant="outline"
                          className="border-purple-500 text-purple-300 hover:bg-purple-800/30"
                        >
                          <Lightbulb className="w-4 h-4 ml-2" />
                          קבל תובנות AI
                        </Button>
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