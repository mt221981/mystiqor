import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hash, Hand, PenTool, Layers, Sparkles, Heart, ArrowLeft, Stars, TrendingUp, BookOpen, Compass, Brain, Zap, Smile, MessageSquare, Plus, CheckCircle, Search, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCachedQuery, useUserDataQuery } from "@/components/CachedQuery";
import { useState, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { base44 } from "@/api/base44Client";
import ProgressTracker from "@/components/ProgressTracker";
import OnboardingFlow from "@/components/OnboardingFlow";
import GoalProgressWidget from "@/components/GoalProgressWidget";
import UpcomingTrendsWidget from "@/components/UpcomingTrendsWidget";
import ProfileOverviewCard from "@/components/ProfileOverviewCard";
import NumerologySummaryCard from "@/components/NumerologySummaryCard";
import RecentAnalysesWidget from "@/components/RecentAnalysesWidget";
import DocumentInsightsWidget from "@/components/DocumentInsightsWidget";
import AstrologyWidget from "@/components/AstrologyWidget";
import AISuggestionsWidget from "@/components/AISuggestionsWidget";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Progress } from "@/components/ui/progress";
import ProfileCompletionWidget from "@/components/ProfileCompletionWidget";
import DailyInsightWidget from "@/components/DailyInsightWidget";
import SmartRemindersWidget from "@/components/SmartRemindersWidget";
import AIAssistant from "@/components/AIAssistant";
import PatternDetector from "@/components/PatternDetector";
import SmartRecommendations from "@/components/SmartRecommendations";
import PredictiveInsights from "@/components/PredictiveInsights";
import AdvancedDailyInsights from "@/components/AdvancedDailyInsights";

const tools = [
  {
    name: "נומרולוגיה",
    path: "Numerology",
    icon: Hash,
    gradient: "from-purple-500 via-purple-600 to-pink-600",
    glowColor: "rgba(168, 85, 247, 0.4)",
    description: "המספרים שלך מספרים עליך",
    emoji: "🔢"
  },
  {
    name: "אסטרולוגיה",
    path: "Astrology",
    icon: Stars,
    gradient: "from-indigo-500 via-blue-600 to-purple-600",
    glowColor: "rgba(99, 102, 241, 0.4)",
    description: "הכוכבים מספרים על הדרך שלך",
    emoji: "⭐"
  },
  {
    name: "קריאת כף יד",
    path: "Palmistry",
    icon: Hand,
    gradient: "from-blue-500 via-cyan-600 to-teal-600",
    glowColor: "rgba(59, 130, 246, 0.4)",
    description: "הקווים בכף היד מגלים מי אתה",
    emoji: "🖐️"
  },
  {
    name: "גרפולוגיה",
    path: "Graphology",
    icon: PenTool,
    gradient: "from-green-500 via-emerald-600 to-teal-600",
    glowColor: "rgba(34, 197, 94, 0.4)",
    description: "איך שאתה כותב מגלה מי אתה",
    emoji: "✍️"
  },
  {
    name: "ניתוח ציורים",
    path: "DrawingAnalysis",
    icon: PenTool,
    gradient: "from-pink-500 via-rose-600 to-purple-600",
    glowColor: "rgba(236, 72, 153, 0.4)",
    description: "הציורים שלך מגלים את העולם הפנימי",
    emoji: "🎨"
  },
  {
    name: "קלפי טארוט",
    path: "Tarot",
    icon: Layers,
    gradient: "from-amber-500 via-orange-600 to-red-600",
    glowColor: "rgba(245, 158, 11, 0.4)",
    description: "הקלפים מראים לך את הדרך",
    emoji: "🃏"
  },
];

export default function Home() {
  const queryClient = useQueryClient();
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
    () => base44.entities.Analysis.list('-created_date', 100),
    { staleTime: 30000 }
  );

  const { data: activeJourneys = [] } = useCachedQuery(
    ['active_journeys'],
    async () => {
      const journeys = await base44.entities.CoachingJourney.filter(
        { created_by: (await base44.auth.me()).email, status: 'active' },
        '-start_date',
        2
      );
      return journeys;
    },
    { staleTime: 30000 }
  );

  const { data: goals = [] } = useCachedQuery(
    ['userGoals'],
    () => base44.entities.UserGoal.list('-created_date', 50),
    { staleTime: 60000 }
  );

  const { data: moodEntries = [] } = useCachedQuery(
    ['moodEntries'],
    () => base44.entities.MoodEntry.list('-entry_date', 30),
    { staleTime: 60000 }
  );

  const numerologyAnalysis = allAnalyses.find(a => a.tool_type === 'numerology');
  const documentAnalyses = allAnalyses.filter(a =>
    a.tool_type === 'document_analyzer' ||
    (a.results?.analysis?.key_insights && a.results.analysis.key_insights.length > 0)
  );

  const needsOnboarding = !userProfile || !userProfile.birth_date;

  if (needsOnboarding) {
    return <OnboardingFlow />;
  }

  const firstName = user?.full_name?.split(' ')[0] || userProfile?.full_name_hebrew?.split(' ')[0] || "חבר יקר";
  const hasMultipleAnalyses = allAnalyses && allAnalyses.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* AI Assistant Floating Button */}
        <motion.button
          onClick={() => setShowAIAssistant(true)}
          className="fixed bottom-6 left-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center z-40"
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.4)',
              '0 0 40px rgba(168, 85, 247, 0.6)',
              '0 0 20px rgba(168, 85, 247, 0.4)',
            ]
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.button>

        <AIAssistant isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
        {/* Header Section - Redesigned */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10 pb-6 border-b border-purple-800/20">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 md:gap-6"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/50"
              >
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-slate-950 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
                שלום, <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-400 to-pink-400">{firstName}</span> 👋
              </h1>
              <p className="text-purple-300 text-lg font-medium">
                המסע שלך להכרה עצמית ממשיך כאן.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide"
          >
            <Link to="/MoodTracker">
              <Button variant="outline" className="bg-slate-900/50 border-purple-500/20 hover:bg-purple-900/30 text-white gap-2 h-12 px-6 rounded-xl shadow-lg backdrop-blur-md whitespace-nowrap transition-all hover:scale-105 hover:border-purple-500/50">
                <Smile className="w-5 h-5 text-pink-400" />
                איך אני מרגיש?
              </Button>
            </Link>
            <Link to="/Journal">
              <Button variant="outline" className="bg-slate-900/50 border-blue-500/20 hover:bg-blue-900/30 text-white gap-2 h-12 px-6 rounded-xl shadow-lg backdrop-blur-md whitespace-nowrap transition-all hover:scale-105 hover:border-blue-500/50">
                <BookOpen className="w-5 h-5 text-blue-400" />
                יומן אישי
              </Button>
            </Link>
            <Link to="/AskQuestion">
              <Button variant="outline" className="bg-slate-900/50 border-amber-500/20 hover:bg-amber-900/30 text-white gap-2 h-12 px-6 rounded-xl shadow-lg backdrop-blur-md whitespace-nowrap transition-all hover:scale-105 hover:border-amber-500/50">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                שאל שאלה
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Main Dashboard Grid - Modular Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN - Primary Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Daily Insight & Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <ErrorBoundary>
                <Suspense fallback={<div className="h-48 bg-gray-800/50 rounded-3xl animate-pulse" />}>
                  <AdvancedDailyInsights />
                </Suspense>
              </ErrorBoundary>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GoalProgressWidget />
                <DailyInsightWidget userProfile={userProfile} />
              </div>
            </motion.div>

            {/* AI Analysis Section */}
            <ErrorBoundary>
              <Suspense fallback={<div className="h-32 bg-gray-800/50 rounded-3xl animate-pulse" />}>
                <div className="bg-slate-900/40 border border-purple-500/10 rounded-3xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">ניתוח מעמיק</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <PatternDetector moodEntries={moodEntries} goals={goals} />
                    <PredictiveInsights moodEntries={moodEntries} goals={goals} />
                  </div>
                </div>
              </Suspense>
            </ErrorBoundary>

            {/* Smart Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SmartRecommendations 
                profile={userProfile} 
                goals={goals} 
                moodEntries={moodEntries}
                analyses={allAnalyses}
              />
            </motion.div>

            {/* Recent Analyses */}
            {allAnalyses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <RecentAnalysesWidget analyses={allAnalyses} />
              </motion.div>
            )}

            {/* Compact Tools Grid */}
            <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/20 rounded-3xl p-6 md:p-8 border border-purple-500/20 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">מרכז הכלים</h2>
                    <p className="text-purple-300 text-sm">גישה מהירה לכלים המיסטיים</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path} to={createPageUrl(tool.path)}>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="h-full"
                      >
                        <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-800/40 hover:bg-gray-800/80 border border-transparent hover:border-purple-500/30 transition-all cursor-pointer group h-full">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} p-0.5 shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300`}>
                            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-200 group-hover:text-white text-center line-clamp-1">
                            {tool.name}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar / Secondary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
             <div className="sticky top-24 space-y-6">
                {/* Profile Overview */}
                <ProfileOverviewCard userProfile={userProfile} user={user} />
                
                {/* Progress Tracker */}
                <div className="bg-slate-900/50 rounded-3xl p-1 border border-purple-500/10">
                   <ProgressTracker />
                </div>

                {/* Completion Widget */}
                <ProfileCompletionWidget profile={userProfile} />

                {/* Cosmic Stack */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2 text-purple-300 font-bold text-sm tracking-wider uppercase">
                    <Stars className="w-4 h-4" />
                    תמונת מצב קוסמית
                  </div>
                  <AstrologyWidget />
                  <NumerologySummaryCard numerologyAnalysis={numerologyAnalysis} />
                  <SmartRemindersWidget />
                </div>
                
                <UpcomingTrendsWidget />
             </div>
          </div>
        </div>

        {/* Separator - Only visible if we have active journeys or suggestions below */}
        {(activeJourneys.length > 0 || (userProfile && userProfile.ai_suggestions_enabled)) && (
           <div className="my-12 relative flex items-center justify-center opacity-30">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full absolute" />
              <div className="bg-slate-950 relative px-4 text-purple-500">
                 <Sparkles className="w-4 h-4" />
              </div>
           </div>
        )}

        {/* Active Journey Banner */}
        {activeJourneys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 max-w-5xl mx-auto"
          >
            <Link to={createPageUrl("JourneyDashboard")}>
              <Card className="relative overflow-hidden bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 border border-purple-500/30 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                <CardContent className="p-6 md:p-8 relative z-10">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Compass className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                          המשך את המסע שלך
                        </h3>
                        <p className="text-purple-200 text-lg">
                          {activeJourneys[0].completed_steps || 0} מתוך {activeJourneys[0].total_steps || 0} שלבים הושלמו
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <span className="text-xs text-purple-300 uppercase tracking-wider">התקדמות</span>
                        <div className="font-bold text-white text-lg">{activeJourneys[0].progress_percentage || 0}%</div>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-purple-900 transition-colors text-white">
                        <ArrowLeft className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={activeJourneys[0].progress_percentage || 0} 
                    className="h-1.5 mt-6 bg-gray-800"
                  />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Final Suggestions - Full Width */}
        {userProfile && userProfile.ai_suggestions_enabled && userProfile.profile_completion_score >= 60 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2 inline-flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                מיוחד בשבילך
              </h2>
            </div>
            <AISuggestionsWidget />
          </motion.div>
        )}

        {/* Synthesis Call to Action */}
        {hasMultipleAnalyses && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-16 max-w-4xl mx-auto"
          >
            <Link to={createPageUrl("MysticSynthesis")}>
              <Card className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-pink-900/60 border border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                <CardContent className="p-8 relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-yellow-300" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">
                      התמונה המלאה
                    </h3>
                    <p className="text-purple-200 text-lg mb-6">
                      {firstName}, בוא נחבר את כל הנקודות ונבין מי אתה באמת.
                    </p>
                    <Button className="bg-white text-purple-900 hover:bg-purple-100 font-bold px-8 py-6 h-auto text-lg rounded-xl shadow-lg">
                      גלה את הסינתזה המיסטית שלך
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-8 opacity-60 hover:opacity-100 transition-opacity"
        >
          <p className="text-purple-300 text-sm flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
            נוצר באהבה למסע שלך
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}