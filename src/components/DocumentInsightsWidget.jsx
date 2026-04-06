import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Lightbulb, TrendingUp, Sparkles, ArrowLeft, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * DOCUMENT INSIGHTS WIDGET
 * ווידג'ט המציג תובנות חדשות מניתוחי מסמכים
 */

export default function DocumentInsightsWidget({ documentAnalyses = [] }) {
  // Filter only document analyses that have insights
  const analysesWithInsights = documentAnalyses.filter(analysis => 
    analysis.results?.analysis?.key_insights && 
    analysis.results.analysis.key_insights.length > 0
  );

  if (!analysesWithInsights || analysesWithInsights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 border-violet-700/30">
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-violet-300 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">תובנות ממסמכים</h3>
          <p className="text-violet-200 mb-4">
            העלה מסמך וקבל תובנות חכמות מה-AI
          </p>
          <Link to={createPageUrl('DocumentAnalyzer')}>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <FileText className="w-4 h-4 ml-2" />
              העלה מסמך
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Get the most recent analysis
  const latestAnalysis = analysesWithInsights[0];
  const insights = latestAnalysis.results.analysis.key_insights || [];
  const documentType = latestAnalysis.results.analysis.document_type || 'מסמך';
  
  // Get top 3 insights by importance
  const topInsights = [...insights]
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, 3);

  // Get recurring themes if available
  const recurringThemes = latestAnalysis.results.analysis.recurring_themes || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-violet-900/60 to-indigo-900/60 backdrop-blur-xl border-2 border-violet-600/50 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-2xl flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-400" />
              תובנות חדשות
            </CardTitle>
            <Link to={createPageUrl('DocumentAnalyzer')}>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-violet-300 hover:text-white hover:bg-violet-800/30"
              >
                ראה הכל →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Latest Document Info */}
          <div className="bg-violet-800/30 rounded-lg p-4 border border-violet-600/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-300" />
                <span className="text-violet-200 font-semibold">{documentType}</span>
              </div>
              <span className="text-violet-300 text-xs">
                {new Date(latestAnalysis.created_date).toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
            {latestAnalysis.results.analysis.summary && (
              <p className="text-violet-100 text-sm leading-relaxed line-clamp-2">
                {latestAnalysis.results.analysis.summary}
              </p>
            )}
          </div>

          {/* Top Insights */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              התובנות המרכזיות:
            </h4>
            {topInsights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-700/30 hover:border-yellow-500/50 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="text-yellow-200 font-bold text-sm flex-1">
                    {idx + 1}. {insight.title}
                  </h5>
                  <Badge className="bg-yellow-600 text-white text-xs shrink-0">
                    {insight.importance}/10
                  </Badge>
                </div>
                <p className="text-yellow-100 text-xs leading-relaxed line-clamp-2">
                  {insight.content}
                </p>
                <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-yellow-300 text-xs">קרא עוד</span>
                  <ArrowLeft className="w-3 h-3 text-yellow-300 mr-1" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recurring Themes */}
          {recurringThemes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                נושאים חוזרים:
              </h4>
              <div className="flex flex-wrap gap-2">
                {recurringThemes.slice(0, 4).map((theme, idx) => (
                  <Badge 
                    key={idx}
                    className={`${
                      theme.frequency === 'high' ? 'bg-red-600' :
                      theme.frequency === 'medium' ? 'bg-yellow-600' :
                      'bg-blue-600'
                    } text-white`}
                  >
                    {theme.theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="pt-4 mt-4 border-t border-violet-700/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">
                  {analysesWithInsights.length}
                </div>
                <div className="text-violet-300 text-xs">מסמכים</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {insights.length}
                </div>
                <div className="text-violet-300 text-xs">תובנות</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {latestAnalysis.results.analysis.confidence_score || 0}%
                </div>
                <div className="text-violet-300 text-xs">דיוק</div>
              </div>
            </div>
          </div>

          {/* All Documents Count */}
          {analysesWithInsights.length > 1 && (
            <div className="text-center">
              <p className="text-violet-300 text-xs">
                יש לך עוד {analysesWithInsights.length - 1} מסמכים עם תובנות
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}