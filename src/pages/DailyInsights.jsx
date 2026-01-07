import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, AlertCircle, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { usePageView } from "@/components/Analytics";
import Breadcrumbs from "@/components/Breadcrumbs";
import EnhancedToast from "@/components/EnhancedToast";

export default function DailyInsights() {
  usePageView('DailyInsights');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const firstName = user?.full_name?.split(' ')[0] || "חבר יקר";

  // בדיקה אם יש נתונים ישנים/פגומים
  const hasInvalidData = insights.some(insight => {
    return typeof insight.insight_title === 'object' || 
           typeof insight.insight_content === 'object' ||
           typeof insight.actionable_tip === 'object';
  });

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
          description={`${firstName}, תובנות אישיות יומיות`}
          icon={Sparkles}
          iconGradient="from-yellow-500 to-orange-500"
        />

        {hasInvalidData && (
          <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 backdrop-blur-xl border-red-700/50 mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-12 h-12 text-red-300 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-red-200 font-bold text-2xl mb-3">⚠️ נדרש ניקוי נתונים</h3>
                  <p className="text-red-100 text-lg leading-relaxed mb-4">
                    יש נתונים ישנים במערכת שגורמים לשגיאה. לחץ על הכפתור למטה כדי לנקות אותם.
                  </p>
                  <Button
                    onClick={handleCleanup}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        מנקה...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5 ml-2" />
                        נקה את כל הנתונים הישנים
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!hasInvalidData && insights.length === 0 && (
          <Card className="bg-gray-900/50 border-purple-700/30">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-white text-2xl font-bold mb-2">אין עדיין תובנות יומיות</h3>
              <p className="text-purple-200 mb-6">
                התובנות היומיות שלך יופיעו כאן לאחר שתיצור אותן
              </p>
            </CardContent>
          </Card>
        )}

        {!hasInvalidData && insights.length > 0 && (
          <div className="space-y-6">
            {insights.map((insight) => {
              // בדיקת תקינות - אם הנתונים תקינים
              const isValid = 
                typeof insight.insight_title === 'string' &&
                typeof insight.insight_content === 'string' &&
                typeof insight.actionable_tip === 'string';

              if (!isValid) {
                return null; // לא מציגים insights לא תקינים
              }

              return (
                <Card key={insight.id} className="bg-purple-900/40 backdrop-blur-xl border-purple-700/50">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-white text-2xl font-bold mb-2">
                          {insight.insight_title}
                        </h3>
                        <p className="text-purple-300 text-sm">
                          {new Date(insight.insight_date).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {insight.mood && (
                        <span className="text-4xl">
                          {insight.mood === 'inspiring' && '✨'}
                          {insight.mood === 'reflective' && '🤔'}
                          {insight.mood === 'empowering' && '💪'}
                          {insight.mood === 'cautionary' && '⚠️'}
                          {insight.mood === 'celebratory' && '🎉'}
                        </span>
                      )}
                    </div>

                    <p className="text-white text-lg leading-relaxed mb-6">
                      {insight.insight_content}
                    </p>

                    {insight.actionable_tip && (
                      <div className="bg-amber-900/30 rounded-lg p-6 border-2 border-amber-600/50">
                        <h4 className="text-amber-200 font-bold text-lg mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          הצעד המעשי שלך היום
                        </h4>
                        <p className="text-amber-100 leading-relaxed">
                          {insight.actionable_tip}
                        </p>
                      </div>
                    )}
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