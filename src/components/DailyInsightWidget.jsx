import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function DailyInsightWidget({ userProfile }) {
  const today = new Date().toISOString().split('T')[0];

  const { data: todayInsight, isLoading, error, refetch } = useQuery({
    queryKey: ['daily_insight', today],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const insights = await base44.entities.DailyInsight.filter(
          { 
            created_by: user.email,
            insight_date: today
          },
          '-created_date',
          1
        );
        
        if (insights && insights.length > 0) {
          return insights[0];
        }

        // Generate new insight if not exists
        const response = await base44.functions.invoke('generateDailyInsight', {});
        return response.data?.insight || null;
      } catch (error) {
        console.error('Failed to load/generate daily insight:', error);
        return null;
      }
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!userProfile
  });

  if (!userProfile) return null;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-600/50">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-purple-200 mt-3">מייצר תובנה יומית...</p>
        </CardContent>
      </Card>
    );
  }

  if (!todayInsight || error) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-gray-600/50">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-300 mb-4">
            {error ? 'שגיאה בטעינת תובנה יומית' : 'לא נמצאה תובנה להיום'}
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-gray-500"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            נסה שוב
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-purple-900/50 border-2 border-purple-500/50 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            התובנה היומית שלך
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <div className="bg-purple-950/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-100 mb-3">
              {todayInsight.insight_title || todayInsight.title}
            </h3>
            <p className="text-purple-200 leading-relaxed text-lg">
              {todayInsight.insight_content || todayInsight.content}
            </p>
          </div>

          {todayInsight.actionable_tip && (
            <div className="bg-indigo-950/50 rounded-lg p-4">
              <p className="text-indigo-200 font-semibold mb-2">💡 פעולה מומלצת להיום:</p>
              <p className="text-indigo-100 text-sm leading-relaxed">
                {todayInsight.actionable_tip}
              </p>
            </div>
          )}

          {todayInsight.related_astro_event && (
            <div className="bg-pink-950/50 rounded-lg p-4">
              <p className="text-pink-200 text-sm">
                🌙 <strong>אירוע אסטרולוגי:</strong> {todayInsight.related_astro_event}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </motion.div>
  );
}