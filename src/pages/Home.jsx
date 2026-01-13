import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Hand, FileSignature, FileStack, Sparkles, Heart, ArrowLeft, Sun, BookOpen, Compass, Brain, Zap, Smile, Search, HelpCircle, ChevronLeft, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { useCachedQuery, useUserDataQuery } from "@/components/CachedQuery";
import { useState, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { base44 } from "@/api/base44Client";
import OnboardingFlow from "@/components/OnboardingFlow";
import AdvancedDailyInsights from "@/components/AdvancedDailyInsights";
import DailyInsightWidget from "@/components/DailyInsightWidget";
import AIAssistant from "@/components/AIAssistant";
import { Progress } from "@/components/ui/progress";
import RecentAnalysesWidget from "@/components/RecentAnalysesWidget";

const tools = [
  {
    name: "נומרולוגיה",
    path: "Numerology",
    icon: Calculator,
    gradient: "from-purple-500 via-purple-600 to-pink-600",
    description: "גלה את כוח המספרים"
  },
  {
    name: "אסטרולוגיה",
    path: "Astrology",
    icon: Sun,
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
    icon: FileStack,
    gradient: "from-amber-500 via-orange-600 to-red-600",
    description: "מסרים מהקלפים"
  },
  {
    name: "גרפולוגיה",
    path: "Graphology",
    icon: FileSignature,
    gradient: "from-green-500 via-emerald-600 to-teal-600",
    description: "ניתוח כתב יד"
  },
  {
    name: "ציורים",
    path: "DrawingAnalysis",
    icon: Palette,
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

  const { data: userProfile, isLoading: isLoadingProfile } = useCachedQuery(
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



  // Check onboarding
  if (isLoadingProfile) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"></div>;
  }

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

        {/* 2. Tools Grid - Reordered to Top, 3 Cols, More Prominent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 drop-shadow-sm">כלים לגילוי עצמי</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.path} to={createPageUrl(tool.path)}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="h-full"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 p-0.5 transition-all duration-300 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-purple-500/10 group hover:-translate-y-1">
                      {tool.image ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-black rounded-xl overflow-hidden">
                           <img 
                             src={tool.image} 
                             alt={tool.name} 
                             className="w-full h-full object-contain"
                           />
                           {/* Overlay for hover effect */}
                           <div className="absolute inset-0 bg-transparent group-hover:bg-white/5 transition-colors duration-300" />
                        </div>
                      ) : (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

                          <div className="flex h-full flex-col items-center justify-center p-8 text-center relative z-10">
                            {/* Icon with soft glow */}
                            <div className="relative mb-6">
                              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                              <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.gradient} p-[2px] shadow-lg`}>
                                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                  <Icon className="w-9 h-9 text-white/90" />
                                </div>
                              </div>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                              {tool.description}
                            </p>
                          </div>
                        </>
                      )}
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

        {/* 5. Personal Growth Section - Removed by user request */}

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