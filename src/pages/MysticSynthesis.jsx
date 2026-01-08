import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, TrendingUp, Calendar, ArrowRight, Loader2, Layers, Star, Zap, Activity, CheckCircle, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import { usePageView } from "@/components/Analytics";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function MysticSynthesis() {
  usePageView('MysticSynthesis');
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch existing syntheses
  const { data: syntheses = [], isLoading } = useQuery({
    queryKey: ['mysticSyntheses'],
    queryFn: () => base44.entities.MysticSynthesis.list('-synthesis_date', 1),
  });

  const latestSynthesis = syntheses[0];

  // Fetch recent analyses just to show count
  const { data: analyses = [] } = useQuery({
    queryKey: ['recentAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50),
  });

  const generateSynthesisMutation = useMutation({
    mutationFn: (type = 'on_demand') => {
        if (type === 'weekly') {
            return base44.functions.invoke('generateWeeklyReport', { report_type: 'weekly' });
        }
        return base44.functions.invoke('synthesizeMysticInsights');
    },
    onMutate: () => setIsGenerating(true),
    onSuccess: () => {
      queryClient.invalidateQueries(['mysticSyntheses']);
      EnhancedToast.success('הסינתזה המיסטית הושלמה בהצלחה! ✨');
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error(error);
      EnhancedToast.error('שגיאה ביצירת הסינתזה', 'אנא נסה שוב מאוחר יותר');
      setIsGenerating(false);
    }
  });

  const handleGenerate = (type = 'on_demand') => {
    generateSynthesisMutation.mutate(type);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <Breadcrumbs />
        
        <PageHeader
          title="סינתזה מיסטית הוליסטית"
          description="ה-AI שלנו מחבר את כל הנקודות מכל הכלים לתמונה אחת שלמה וצלולה"
          icon={Sparkles}
          iconGradient="from-indigo-500 via-purple-500 to-pink-500"
        />

        {/* Hero / Action Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/40 border-indigo-500/30 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse" />
              <CardContent className="p-8 text-center relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        סינתזה הוליסטית
                    </h2>
                    <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                        שילוב כל הכלים לפרופיל אישיות מאוחד ותחזית עתידית.
                    </p>
                  </div>
                  
                  <Button 
                    size="lg" 
                    onClick={() => handleGenerate('on_demand')}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 h-12 text-lg rounded-xl transition-all hover:scale-105"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "צור סינתזה חדשה"}
                  </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/40 via-cyan-900/40 to-slate-900/40 border-cyan-500/30 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse" />
              <CardContent className="p-8 text-center relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        דוח שבועי חכם
                    </h2>
                    <p className="text-cyan-200 text-sm mb-6 leading-relaxed">
                        ניתוח דפוסי שימוש, המלצות לשילוב רוחני וסיכום שבועי.
                    </p>
                  </div>
                  
                  <Button 
                    size="lg" 
                    onClick={() => handleGenerate('weekly')}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 h-12 text-lg rounded-xl transition-all hover:scale-105"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "צור דוח שבועי"}
                  </Button>
              </CardContent>
            </Card>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {latestSynthesis && !isGenerating && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
               <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span className="text-slate-400 text-sm">
                        {new Date(latestSynthesis.synthesis_date).toLocaleDateString('he-IL')}
                        </span>
                    </div>
                    {latestSynthesis.report_type === 'weekly' && (
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                            דוח שבועי
                        </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="border-indigo-500/50 text-indigo-300">
                    מבוסס על: {latestSynthesis.input_sources?.join(', ') || 'מספר כלים'}
                  </Badge>
               </div>

               {/* Weekly Report Specific Sections */}
               {latestSynthesis.report_type === 'weekly' && latestSynthesis.usage_analysis && (
                   <div className="grid md:grid-cols-2 gap-6">
                       <Card className="bg-slate-800/40 border-slate-700">
                           <CardHeader>
                               <CardTitle className="text-lg text-white flex items-center gap-2">
                                   <Activity className="w-5 h-5 text-blue-400" />
                                   ניתוח דפוסים
                               </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-4">
                               <div className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-lg">
                                   {latestSynthesis.usage_analysis.pattern_insight}
                               </div>
                               <div className="flex flex-wrap gap-2">
                                   {latestSynthesis.usage_analysis.most_used_tools?.map((tool, i) => (
                                       <span key={i} className="bg-slate-700 text-xs px-2 py-1 rounded-full text-slate-300">
                                           {tool}
                                       </span>
                                   ))}
                               </div>
                               <div className="text-xs text-slate-500">
                                   זמן פעילות שיא: {latestSynthesis.usage_analysis.peak_activity_times}
                               </div>
                           </CardContent>
                       </Card>

                       <Card className="bg-slate-800/40 border-slate-700">
                           <CardHeader>
                               <CardTitle className="text-lg text-white flex items-center gap-2">
                                   <CheckCircle className="w-5 h-5 text-green-400" />
                                   שילוב ביומיום
                               </CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-3">
                               {latestSynthesis.practical_integration?.map((item, i) => (
                                   <div key={i} className="flex gap-3 p-3 bg-slate-900/30 rounded-lg">
                                       <div className="mt-1">
                                           <div className={`w-2 h-2 rounded-full ${
                                               item.difficulty === 'easy' ? 'bg-green-500' : 
                                               item.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                           }`} />
                                       </div>
                                       <div>
                                           <p className="text-white text-sm font-medium">{item.suggestion}</p>
                                           <p className="text-xs text-slate-400 mt-1">{item.context}</p>
                                       </div>
                                   </div>
                               ))}
                           </CardContent>
                       </Card>
                       
                       {latestSynthesis.period_summary && (
                           <Card className="md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
                               <CardContent className="p-6">
                                   <h3 className="text-lg font-bold text-white mb-3">סיכום המסע השבועי</h3>
                                   <p className="text-slate-300 leading-relaxed">
                                       {latestSynthesis.period_summary}
                                   </p>
                               </CardContent>
                           </Card>
                       )}
                   </div>
               )}

               {/* Personality Profile */}
               <motion.div variants={itemVariants}>
                 <Card className="bg-slate-900/50 border-slate-800">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-2xl text-white">
                       <Layers className="w-6 h-6 text-purple-400" />
                       פרופיל אישיות משולב
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     <p className="text-lg text-slate-200 leading-relaxed border-l-4 border-purple-500 pl-4 bg-purple-500/5 p-4 rounded-r-lg">
                       {latestSynthesis.personality_profile.summary}
                     </p>
                     
                     <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-emerald-400 flex items-center gap-2">
                            <Star className="w-4 h-4" /> חוזקות
                          </h4>
                          <ul className="space-y-2">
                            {latestSynthesis.personality_profile.strengths?.map((item, i) => (
                              <li key={i} className="text-slate-300 text-sm bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-amber-400 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> אתגרים
                          </h4>
                          <ul className="space-y-2">
                            {latestSynthesis.personality_profile.challenges?.map((item, i) => (
                              <li key={i} className="text-slate-300 text-sm bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-pink-400 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> כישרונות חבויים
                          </h4>
                          <ul className="space-y-2">
                            {latestSynthesis.personality_profile.hidden_talents?.map((item, i) => (
                              <li key={i} className="text-slate-300 text-sm bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>

               {/* Predictions */}
               <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                 {latestSynthesis.predictive_insights?.map((insight, idx) => (
                   <Card key={idx} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/30 transition-colors">
                     <CardHeader className="pb-2">
                       <div className="flex justify-between items-start">
                         <Badge className="bg-indigo-900/50 text-indigo-200 border-indigo-700/50 hover:bg-indigo-900/70">
                           {insight.timeframe}
                         </Badge>
                         <Badge variant="outline" className="text-slate-400">
                           {insight.probability}
                         </Badge>
                       </div>
                       <CardTitle className="text-lg text-white mt-2">
                         {insight.area}
                       </CardTitle>
                     </CardHeader>
                     <CardContent>
                       <p className="text-slate-300 leading-relaxed">
                         {insight.prediction}
                       </p>
                     </CardContent>
                   </Card>
                 ))}
               </motion.div>

               {/* Recommendations */}
               <motion.div variants={itemVariants}>
                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-emerald-400" />
                   צעדים מומלצים
                 </h3>
                 <div className="grid gap-4">
                   {latestSynthesis.recommendations?.map((rec, idx) => (
                     <div key={idx} className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700 flex items-start gap-4 hover:translate-x-1 transition-transform">
                       <div className="bg-emerald-500/10 p-2 rounded-full mt-1">
                         <ArrowRight className="w-5 h-5 text-emerald-400" />
                       </div>
                       <div>
                         <h4 className="font-bold text-white text-lg mb-1">{rec.action}</h4>
                         <p className="text-slate-400 text-sm mb-2">{rec.reason}</p>
                         {rec.related_tool && (
                           <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                             כלי קשור: {rec.related_tool}
                           </Badge>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}