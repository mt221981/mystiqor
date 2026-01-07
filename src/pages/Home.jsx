import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hash, Hand, PenTool, Layers, Sparkles, Heart, ArrowLeft, Stars, BookOpen, Compass, Brain, Zap, Smile, Search, HelpCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useCachedQuery, useUserDataQuery } from "@/components/CachedQuery";
import { useState, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { base44 } from "@/api/base44Client";
import OnboardingFlow from "@/components/OnboardingFlow";
import GoalProgressWidget from "@/components/GoalProgressWidget";
import AdvancedDailyInsights from "@/components/AdvancedDailyInsights";
import DailyInsightWidget from "@/components/DailyInsightWidget";
import SmartRecommendations from "@/components/SmartRecommendations";
import AIAssistant from "@/components/AIAssistant";
import { Progress } from "@/components/ui/progress";
import RecentAnalysesWidget from "@/components/RecentAnalysesWidget";

const tools = [
  {
    name: "נומרולוגיה",
    path: "Numerology",
    icon: Hash,
    gradient: "from-purple-500 via-purple-600 to-pink-600",
    description: "גלה את כוח המספרים"
  },
  {
    name: "אסטרולוגיה",
    path: "Astrology",
    icon: Stars,
    gradient: "from-indigo-500 via-blue-600 to-purple-600",
    description: "מפת הכוכבים שלך"
  },
  {
    name: "קריאת כף יד",
    path: "Palmistry",
    icon: Hand,
    gradient: "from-blue-500 via-cyan-600 to-teal-600",
    description: "סודות כף היד"
  },
  {
    name: "טארוט",
    path: "Tarot",
    icon: Layers,
    gradient: "from-amber-500 via-orange-600 to-red-600",
    description: "מסרים מהקלפים"
  },
  {
    name: "גרפולוגיה",
    path: "Graphology",
    icon: PenTool,
    gradient: "from-green-500 via-emerald-600 to-teal-600",
    description: "ניתוח כתב יד"
  },
  {
    name: "ציורים",
    path: "DrawingAnalysis",
    icon: PenTool,
    gradient: "from-pink-500 via-rose-600 to-purple-600",
    description: "פסיכולוגיה בציור"
  },
];

export default function Home() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const { data: user } = useCachedQuery(
    ['currentUser'],
    () => base44.auth.me(),
    { staleTime: 60000 }
  );

  const { data: userProfile } = useCachedQuery(
    ['userProfile'],
    async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    },
    { staleTime: 60000 }
  );

  const { data: allAnalyses = [] } = useUserDataQuery(
    ['allAnalyses'],
    () => base44.entities.Analysis.list('-created_date', 10),
    { staleTime: 30000 }
  );

  const { data: activeJourneys = [] } = useCachedQuery(
    ['active_journeys'],
    async () => {
      const journeys = await base44.entities.CoachingJourney.filter(
        { created_by: (await base44.auth.me()).email, status: 'active' },
        '-start_date',
        1
      );
      return journeys;
    },
    { staleTime: 30000 }
  );

  const { data: goals = [] } = useCachedQuery(
    ['userGoals'],
    () => base44.entities.UserGoal.list('-created_date', 5),
    { staleTime: 60000 }
  );

  const { data: moodEntries = [] } = useCachedQuery(
    ['moodEntries'],
    () => base44.entities.MoodEntry.list('-entry_date', 7),
    { staleTime: 60000 }
  );

  // Check onboarding
  if (!userProfile || !userProfile.birth_date) {
    return <OnboardingFlow />;
  }

  const firstName = user?.full_name?.split(' ')[0] || userProfile?.full_name_hebrew?.split(' ')[0] || "חבר";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20 overflow-x-hidden">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* 1. Hero Section - Clean & Welcoming */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            <span>המסע שלך מתחיל כאן</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-thin tracking-tight text-white">
            בוקר טוב, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{firstName}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
            היום הוא הזדמנות חדשה להכיר את עצמך קצת יותר לעומק.
          </p>
        </motion.div>

        {/* 2. Tools Grid - Reordered to Top & Wider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-slate-200">כלים לגילוי עצמי</h2>
            <Link to="/Dashboard" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              לכל הכלים
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.path} to={createPageUrl(tool.path)}>
                  <motion.div
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="h-full"
                  >
                    <div className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer h-full group">
                      <div className={`w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br ${tool.gradient} p-[1px] shadow-sm`}>
                        <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="w-full">
                        <span className="block text-sm font-bold text-slate-100 mb-0.5 group-hover:text-purple-300 transition-colors truncate">{tool.name}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors truncate block">{tool.description}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* 3. Daily Insight - Moved Down */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto w-full"
        >
          <ErrorBoundary>
            <Suspense fallback={<div className="h-64 bg-slate-900/50 rounded-3xl animate-pulse" />}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-[1.75rem] overflow-hidden shadow-2xl border border-slate-800">
                  <AdvancedDailyInsights />
                </div>
              </div>
            </Suspense>
          </ErrorBoundary>
        </motion.div>

        {/* 4. Quick Actions - Moved down */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link to="/MoodTracker">
            <Button variant="outline" className="h-10 px-6 rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-purple-400 hover:border-purple-500/50 transition-all gap-2">
              <Smile className="w-4 h-4" />
              <span>איך אני מרגיש?</span>
            </Button>
          </Link>
          <Link to="/Journal">
            <Button variant="outline" className="h-10 px-6 rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-blue-400 hover:border-blue-500/50 transition-all gap-2">
              <BookOpen className="w-4 h-4" />
              <span>יומן אישי</span>
            </Button>
          </Link>
          <Link to="/AskQuestion">
            <Button variant="outline" className="h-10 px-6 rounded-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-amber-400 hover:border-amber-500/50 transition-all gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>שאל שאלה</span>
            </Button>
          </Link>
        </motion.div>

        {/* 5. Personal Growth Section - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Goals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
             <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-bold text-slate-200">המטרות שלי</h3>
             </div>
             <ErrorBoundary>
                <GoalProgressWidget />
             </ErrorBoundary>
          </motion.div>

          {/* Active Journey or Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
             {activeJourneys.length > 0 ? (
               <>
                 <div className="flex items-center gap-2 mb-2">
                    <Compass className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-xl font-bold text-slate-200">המסע הנוכחי</h3>
                 </div>
                 <Link to={createPageUrl("JourneyDashboard")}>
                    <Card className="bg-slate-900/60 border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden">
                      <CardContent className="p-6">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <h4 className="text-lg font-bold text-white mb-1">המשך את המסע</h4>
                               <p className="text-sm text-slate-400">
                                 {activeJourneys[0].completed_steps} מתוך {activeJourneys[0].total_steps} צעדים
                               </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                               <ArrowLeft className="w-5 h-5" />
                            </div>
                         </div>
                         <Progress value={activeJourneys[0].progress_percentage || 0} className="h-2 bg-slate-800" />
                      </CardContent>
                    </Card>
                 </Link>
               </>
             ) : (
               <>
                 <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <h3 className="text-xl font-bold text-slate-200">מומלץ עבורך</h3>
                 </div>
                 <ErrorBoundary>
                   <SmartRecommendations 
                      profile={userProfile} 
                      goals={goals} 
                      moodEntries={moodEntries}
                      analyses={allAnalyses}
                    />
                 </ErrorBoundary>
               </>
             )}
          </motion.div>
        </div>

        {/* 6. Recent History */}
        {allAnalyses.length > 0 && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="pt-8 border-t border-slate-800/50"
           >
              <div className="flex items-center gap-2 mb-6">
                 <BookOpen className="w-5 h-5 text-blue-400" />
                 <h2 className="text-2xl font-bold text-slate-200">תובנות אחרונות</h2>
              </div>
              <ErrorBoundary>
                 <RecentAnalysesWidget analyses={allAnalyses} />
              </ErrorBoundary>
           </motion.div>
        )}

        {/* AI Assistant Floating Button */}
        <motion.button
          onClick={() => setShowAIAssistant(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-600/30 flex items-center justify-center z-40 hover:scale-110 transition-transform"
          whileTap={{ scale: 0.95 }}
        >
          <Brain className="w-7 h-7 text-white" />
        </motion.button>
        <AIAssistant isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />

      </div>
    </div>
  );
}