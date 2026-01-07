import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Plus, CheckCircle, Sparkles, TrendingUp, Edit, Trash2, Lightbulb, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import { usePageView } from "@/components/Analytics";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolRecommendationWidget from "@/components/ToolRecommendationWidget";
import GoalProgressModal from "@/components/GoalProgressModal";

const GOAL_CATEGORIES = {
  career: { label: "קריירה", icon: "💼", color: "from-blue-600 to-cyan-600" },
  relationships: { label: "יחסים", icon: "💕", color: "from-pink-600 to-rose-600" },
  personal_growth: { label: "צמיחה אישית", icon: "🌱", color: "from-green-600 to-emerald-600" },
  health: { label: "בריאות", icon: "💪", color: "from-red-600 to-orange-600" },
  spirituality: { label: "רוחניות", icon: "🧘", color: "from-purple-600 to-violet-600" },
  creativity: { label: "יצירתיות", icon: "🎨", color: "from-amber-600 to-yellow-600" },
  finance: { label: "כלכלה", icon: "💰", color: "from-green-600 to-teal-600" },
  other: { label: "אחר", icon: "⭐", color: "from-gray-600 to-slate-600" }
};

const MYSTICAL_TOOLS = [
  { value: "numerology", label: "נומרולוגיה" },
  { value: "astrology", label: "אסטרולוגיה" },
  { value: "palmistry", label: "כף יד" },
  { value: "graphology", label: "גרפולוגיה" },
  { value: "tarot", label: "טארוט" },
  { value: "drawing", label: "ניתוח ציורים" }
];

export default function MyGoals() {
  usePageView('MyGoals');

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [analyzingGoal, setAnalyzingGoal] = useState(null);
  
  const [formData, setFormData] = useState({
    goal_title: "",
    goal_description: "",
    goal_category: "personal_growth",
    target_date: "",
    preferred_tools: []
  });

  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['userGoals'],
    queryFn: () => base44.entities.UserGoal.list('-created_date', 100),
    initialData: []
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.UserGoal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userGoals']);
      setShowForm(false);
      resetForm();
      EnhancedToast.success('היעד נוצר בהצלחה! 🎯');
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userGoals']);
      setEditingGoal(null);
      resetForm();
      EnhancedToast.success('היעד עודכן בהצלחה! ✨');
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => base44.entities.UserGoal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['userGoals']);
      EnhancedToast.success('היעד נמחק');
    }
  });

  const resetForm = () => {
    setFormData({
      goal_title: "",
      goal_description: "",
      goal_category: "personal_growth",
      target_date: "",
      preferred_tools: []
    });
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.goal_title || !formData.goal_description) {
      EnhancedToast.error('נא למלא את כל השדות החובה');
      return;
    }

    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.id,
        data: formData
      });
    } else {
      createGoalMutation.mutate({
        ...formData,
        status: 'active',
        progress_percentage: 0
      });
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      goal_title: goal.goal_title,
      goal_description: goal.goal_description,
      goal_category: goal.goal_category,
      target_date: goal.target_date || "",
      preferred_tools: goal.preferred_tools || []
    });
    setShowForm(true);
  };

  const handleGenerateRecommendations = async (goalId) => {
    setIsGeneratingRecommendations(true);
    try {
      const response = await base44.functions.invoke('generateGoalRecommendations', { goal_id: goalId });
      if (response.data?.success) {
        queryClient.invalidateQueries(['userGoals']);
        queryClient.invalidateQueries(['coachRecommendations']);
        EnhancedToast.success('המלצות חדשות נוצרו! ✨');
      } else {
        throw new Error(response.data?.error || 'Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Generate recommendations error:', error);
      EnhancedToast.error('שגיאה ביצירת המלצות', error.message || 'אנא נסה שוב');
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const activeGoals = goals.filter(g => ['active', 'in_progress'].includes(g.status));
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 flex items-center justify-center">
        <Card className="bg-purple-900/50 border-purple-700/30">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">טוען את היעדים שלך...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />
        
        <PageHeader
          title="היעדים שלי 🎯"
          description="הגדר יעדים אישיים ותן לAI לעזור לך להגיע אליהם"
          icon={Target}
          iconGradient="from-purple-600 to-pink-600"
        />

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700/50">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-4xl font-bold text-white">{activeGoals.length}</div>
              <p className="text-purple-300">יעדים פעילים</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-4xl font-bold text-white">{completedGoals.length}</div>
              <p className="text-green-300">יעדים שהושלמו</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-700/50">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-4xl font-bold text-white">
                {activeGoals.length > 0 
                  ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / activeGoals.length)
                  : 0}%
              </div>
              <p className="text-blue-300">ממוצע התקדמות</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Goal Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xl h-14"
          >
            <Plus className="w-6 h-6 ml-2" />
            {showForm ? 'ביטול' : 'יעד חדש'}
          </Button>
        </div>

        {/* Goal Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/50 mb-8">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">
                    {editingGoal ? 'עריכת יעד' : 'יעד חדש'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label className="text-white text-lg mb-2 block">כותרת היעד *</Label>
                      <Input
                        value={formData.goal_title}
                        onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
                        placeholder="למשל: שיפור הביטחון העצמי"
                        className="bg-gray-800 text-white text-lg h-14 border-purple-700"
                        dir="rtl"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-2 block">תיאור מפורט *</Label>
                      <Textarea
                        value={formData.goal_description}
                        onChange={(e) => setFormData({ ...formData, goal_description: e.target.value })}
                        placeholder="תאר את היעד שלך במפורט..."
                        className="bg-gray-800 text-white text-lg border-purple-700 min-h-32"
                        dir="rtl"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-2 block">קטגוריה</Label>
                      <Select
                        value={formData.goal_category}
                        onValueChange={(value) => setFormData({ ...formData, goal_category: value })}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-purple-700 h-14">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(GOAL_CATEGORIES).map(([key, { label, icon }]) => (
                            <SelectItem key={key} value={key}>
                              {icon} {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-2 block">תאריך יעד</Label>
                      <Input
                        type="date"
                        value={formData.target_date}
                        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                        className="bg-gray-800 text-white text-lg h-14 border-purple-700"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-2 block">כלים מועדפים (אופציונלי)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {MYSTICAL_TOOLS.map(tool => (
                          <Button
                            key={tool.value}
                            type="button"
                            onClick={() => {
                              const current = formData.preferred_tools || [];
                              const updated = current.includes(tool.value)
                                ? current.filter(t => t !== tool.value)
                                : [...current, tool.value];
                              setFormData({ ...formData, preferred_tools: updated });
                            }}
                            className={`${
                              (formData.preferred_tools || []).includes(tool.value)
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                          >
                            {tool.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14"
                      >
                        {editingGoal ? 'עדכן יעד' : 'צור יעד'}
                      </Button>
                      <Button
                        type="button"
                        onClick={resetForm}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        ביטול
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Target className="w-7 h-7 text-purple-400" />
              יעדים פעילים
            </h2>
            <div className="grid gap-6">
              {activeGoals.map((goal) => {
                const category = GOAL_CATEGORIES[goal.goal_category] || GOAL_CATEGORIES.other;
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/50 hover:border-purple-500 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-2xl`}>
                                {category.icon}
                              </div>
                              <div>
                                <h3 className="text-white text-xl font-bold">{goal.goal_title}</h3>
                                <Badge className="bg-purple-700 text-white text-xs">
                                  {category.label}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-4">
                              {goal.goal_description}
                            </p>

                            {goal.target_date && (
                              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                <Calendar className="w-4 h-4" />
                                יעד: {new Date(goal.target_date).toLocaleDateString('he-IL')}
                              </div>
                            )}

                            {/* Progress */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-purple-300">התקדמות:</span>
                                <span className="text-white font-bold">{goal.progress_percentage || 0}%</span>
                              </div>
                              <Progress value={goal.progress_percentage || 0} className="h-3" />
                            </div>

                            {/* Related Journeys */}
                            {goal.related_journey_id && (
                              <div className="bg-purple-950/50 rounded-lg p-3 mb-3">
                                <p className="text-purple-200 text-sm">
                                  🧭 <strong>קשור למסע:</strong>{' '}
                                  <Link to={createPageUrl("JourneyDashboard")} className="underline hover:text-purple-100">
                                    צפה במסע
                                  </Link>
                                </p>
                              </div>
                            )}

                            {/* Recommended Tools */}
                            {goal.recommended_tools && goal.recommended_tools.length > 0 && (
                              <div className="mb-4">
                                <ToolRecommendationWidget
                                  recommendedTools={goal.recommended_tools}
                                  reason="כלים אלו יעזרו לך להגיע ליעד הזה:"
                                />
                              </div>
                            )}

                            {/* AI Summary */}
                            {goal.ai_summary && (
                              <div className="bg-indigo-950/50 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
                                  <p className="text-indigo-100 text-sm leading-relaxed">
                                    {goal.ai_summary}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Action Plan */}
                            {goal.ai_action_plan && goal.ai_action_plan.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-purple-300 font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  תוכנית פעולה ({goal.ai_action_plan.filter(a => a.status === 'completed').length}/{goal.ai_action_plan.length})
                                </h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {goal.ai_action_plan.slice(0, 5).map((action, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-3 rounded-lg text-sm ${
                                        action.status === 'completed'
                                          ? 'bg-green-950/40 border-l-4 border-green-500'
                                          : action.status === 'in_progress'
                                          ? 'bg-blue-950/40 border-l-4 border-blue-500'
                                          : 'bg-gray-800/50 border-l-4 border-gray-600'
                                      }`}
                                    >
                                      <p className="text-white">{action.action}</p>
                                    </div>
                                  ))}
                                </div>
                                {goal.ai_action_plan.length > 5 && (
                                  <Button
                                    onClick={() => setSelectedGoal(goal)}
                                    variant="ghost"
                                    className="text-purple-300 text-xs mt-2"
                                  >
                                    הצג הכל ({goal.ai_action_plan.length})
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleEdit(goal)}
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm('האם אתה בטוח שברצונך למחוק יעד זה?')) {
                                  deleteGoalMutation.mutate(goal.id);
                                }
                              }}
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid md:grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleGenerateRecommendations(goal.id)}
                            disabled={isGeneratingRecommendations}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          >
                            <Sparkles className="w-5 h-5 ml-2" />
                            {isGeneratingRecommendations ? 'מייצר...' : 'המלצות AI'}
                          </Button>
                          <Button
                            onClick={() => setAnalyzingGoal(goal)}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                          >
                            <TrendingUp className="w-5 h-5 ml-2" />
                            נתח התקדמות
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-green-400" />
              יעדים שהושלמו 🎉
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => {
                const category = GOAL_CATEGORIES[goal.goal_category] || GOAL_CATEGORIES.other;
                
                return (
                  <Card key={goal.id} className="bg-green-900/20 backdrop-blur-xl border-green-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{category.icon}</div>
                        <div>
                          <h3 className="text-white font-bold">{goal.goal_title}</h3>
                          <p className="text-green-300 text-xs">
                            הושלם ב-{new Date(goal.completed_date).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <Card className="bg-purple-900/30 backdrop-blur-xl border-purple-700/50">
            <CardContent className="p-12 text-center">
              <Target className="w-20 h-20 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-3">עדיין אין יעדים</h3>
              <p className="text-purple-200 text-lg mb-6">
                הגדר יעד אישי ותן לAI לעזור לך להגיע אליו!
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xl h-14"
              >
                <Plus className="w-6 h-6 ml-2" />
                צור יעד ראשון
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Goal Progress Analysis Modal */}
        {analyzingGoal && (
          <GoalProgressModal
            goal={analyzingGoal}
            isOpen={!!analyzingGoal}
            onClose={() => setAnalyzingGoal(null)}
            onAnalysisComplete={() => queryClient.invalidateQueries(['userGoals'])}
          />
        )}
      </div>
    </div>
  );
}