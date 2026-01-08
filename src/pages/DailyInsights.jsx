import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, AlertCircle, Trash2, ThumbsUp, ThumbsDown, MessageSquare, Star, Calculator, Sun } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { usePageView } from "@/components/Analytics";
import Breadcrumbs from "@/components/Breadcrumbs";
import EnhancedToast from "@/components/EnhancedToast";
import { Textarea } from "@/components/ui/textarea";

export default function DailyInsights() {
  usePageView('DailyInsights');
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackState, setFeedbackState] = useState({}); // { [insightId]: { rating: null, comment: '', showInput: false } }

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000
  });

  const { data: insights = [], isLoading, refetch } = useQuery({
    queryKey: ['dailyInsights'],
    queryFn: async () => {
      const data = await base44.entities.DailyInsight.list('-created_date', 10);
      return data;
    },
    staleTime: 30000
  });

  const updateInsightMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DailyInsight.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['dailyInsights']);
      EnhancedToast.success('תודה על המשוב! אנחנו משתפרים בזכותך 🙏');
    },
    onError: (err) => {
        EnhancedToast.error('שגיאה בשמירת המשוב', err.message);
    }
  });

  const firstName = user?.full_name?.split(' ')[0] || "חבר יקר";

  const handleFeedback = (insightId, rating) => {
    setFeedbackState(prev => ({
        ...prev,
        [insightId]: { ...prev[insightId], rating, showInput: true }
    }));
  };

  const submitFeedback = (insightId) => {
    const feedback = feedbackState[insightId];
    if (!feedback) return;

    updateInsightMutation.mutate({
        id: insightId,
        data: {
            user_feedback: {
                rating: feedback.rating,
                comment: feedback.comment,
                feedback_date: new Date().toISOString()
            }
        }
    });
    
    // Clear state for this card
    setFeedbackState(prev => {
        const newState = { ...prev };
        delete newState[insightId];
        return newState;
    });
  };

  const handleCleanup = async () => {
    if (!window.confirm('זה ימחק את כל התובנות היומיות הקיימות. האם להמשיך?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await base44.functions.invoke('cleanupDailyInsights', {});
      
      if (response.data.success) {
        EnhancedToast.success('נוקה בהצלחה!', `נמחקו ${response.data.deleted} רשומות`);
        await refetch();
      } else {
        EnhancedToast.error('שגיאה בניקוי', response.data.error || 'נסה שוב');
      }
    } catch (error) {
      EnhancedToast.error('שגיאה', error.message || 'נסה שוב');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-amber-950/30 to-black p-6 md:p-12 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-purple-700/30">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">טוען תובנות...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-amber-950/30 to-black p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs />
        
        <PageHeader
          title="התובנות היומיות שלך ✨"
          description={`${firstName}, תובנות אישיות המשלבות נומרולוגיה, קלפים וכוכבים`}
          icon={Sparkles}
          iconGradient="from-yellow-500 to-orange-500"
        />

        {insights.length === 0 && (
          <Card className="bg-gray-900/50 border-purple-700/30">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-white text-2xl font-bold mb-2">אין עדיין תובנות יומיות</h3>
              <p className="text-purple-200 mb-6">
                התובנות היומיות שלך יופיעו כאן לאחר שתיצור אותן בדף הבית או כאן
              </p>
            </CardContent>
          </Card>
        )}

        {insights.length > 0 && (
          <div className="space-y-8">
            {insights.map((insight) => {
              // בדיקת תקינות בסיסית
              if (!insight.insight_title) return null;

              const hasFeedback = insight.user_feedback || false;
              const currentFeedback = feedbackState[insight.id] || {};

              return (
                <Card key={insight.id} className="bg-purple-900/40 backdrop-blur-xl border-purple-700/50 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="bg-purple-950/50 p-6 border-b border-purple-800/50 flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <h3 className="text-white text-2xl font-bold mb-2 flex items-center gap-2">
                                {insight.insight_title}
                                {insight.mood && <span className="text-2xl" title={insight.mood}>
                                    {insight.mood === 'inspiring' && '✨'}
                                    {insight.mood === 'reflective' && '🤔'}
                                    {insight.mood === 'empowering' && '💪'}
                                    {insight.mood === 'cautionary' && '⚠️'}
                                    {insight.mood === 'celebratory' && '🎉'}
                                </span>}
                            </h3>
                            <div className="flex items-center gap-3 text-purple-200 text-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(insight.insight_date).toLocaleDateString('he-IL', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </div>
                        </div>
                        
                        {/* Data Sources Badges */}
                        <div className="flex flex-wrap gap-2 items-center">
                            {insight.numerology_data && (
                                <Badge variant="secondary" className="bg-blue-900/50 text-blue-200 border-blue-700/50 gap-1">
                                    <Calculator className="w-3 h-3" />
                                    שנה אישית {insight.numerology_data.personal_year}
                                </Badge>
                            )}
                            {insight.astrology_transits?.length > 0 && (
                                <Badge variant="secondary" className="bg-indigo-900/50 text-indigo-200 border-indigo-700/50 gap-1">
                                    <Sun className="w-3 h-3" />
                                    אסטרולוגיה
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <p className="text-white text-lg leading-relaxed whitespace-pre-line">
                                {insight.insight_content}
                            </p>

                            {insight.actionable_tip && (
                                <div className="bg-amber-900/30 rounded-xl p-6 border-2 border-amber-600/50">
                                    <h4 className="text-amber-200 font-bold text-lg mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        הצעד המעשי שלך היום
                                    </h4>
                                    <p className="text-amber-100 leading-relaxed">
                                        {insight.actionable_tip}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Tarot & Feedback */}
                        <div className="space-y-6">
                            {/* Tarot Card Display */}
                            {insight.tarot_card && (
                                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700 text-center">
                                    <h4 className="text-purple-300 font-bold mb-3 border-b border-purple-800 pb-2">קלף היום</h4>
                                    <div className="aspect-[2/3] bg-slate-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-4xl">🃏</span>
                                    </div>
                                    <h5 className="text-white font-bold">{insight.tarot_card.name}</h5>
                                    <p className="text-slate-400 text-xs mt-1">
                                        {insight.tarot_card.orientation === 'reversed' ? 'הפוך 🙃' : 'ישר ⬆️'}
                                    </p>
                                    <p className="text-slate-300 text-sm mt-2 italic">
                                        "{insight.tarot_card.meaning}"
                                    </p>
                                </div>
                            )}

                            {/* Feedback Section */}
                            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700">
                                <h4 className="text-slate-300 font-bold text-sm mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    איך הייתה התובנה?
                                </h4>
                                
                                {hasFeedback ? (
                                    <div className="text-green-400 text-sm text-center py-2">
                                        תודה על המשוב! 🙏
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleFeedback(insight.id, star)}
                                                    className={`hover:scale-110 transition-transform ${
                                                        (currentFeedback.rating || 0) >= star ? 'text-yellow-400' : 'text-slate-600'
                                                    }`}
                                                >
                                                    <Star className="w-6 h-6 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {currentFeedback.showInput && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <Textarea 
                                                    placeholder="מה אהבת? מה לשפר?"
                                                    className="bg-slate-800 border-slate-600 text-white text-sm h-20"
                                                    value={currentFeedback.comment || ''}
                                                    onChange={(e) => setFeedbackState(prev => ({
                                                        ...prev,
                                                        [insight.id]: { ...prev[insight.id], comment: e.target.value }
                                                    }))}
                                                />
                                                <Button 
                                                    size="sm" 
                                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                                    onClick={() => submitFeedback(insight.id)}
                                                >
                                                    שלח משוב
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}