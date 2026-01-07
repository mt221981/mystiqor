import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Hash, Hand, PenTool, Layers, Sparkles, Heart, ArrowLeft, Stars, TrendingUp, BookOpen, Compass, Brain } from "lucide-react";
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-block mb-6">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
              style={{ boxShadow: '0 0 60px rgba(168, 85, 247, 0.6)' }}
            >
              <Heart className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4 leading-tight">
            שלום {firstName} 💜
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
            ברוכים הבאים למסע שלך להכרה עצמית
          </p>
        </motion.div>

        <ProgressTracker />

        {/* AI-Powered Insights */}
        <ErrorBoundary>
          <Suspense fallback={<div className="text-white text-center">טוען תובנות...</div>}>
            {/* Advanced Daily Insights - Premium Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-12"
            >
              <AdvancedDailyInsights />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-2 gap-6 mb-12"
            >
              <PatternDetector moodEntries={moodEntries} goals={goals} />
              <PredictiveInsights moodEntries={moodEntries} goals={goals} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-12"
            >
              <SmartRecommendations 
                profile={userProfile} 
                goals={goals} 
                moodEntries={moodEntries}
                analyses={allAnalyses}
              />
            </motion.div>
          </Suspense>
        </ErrorBoundary>

        {/* Profile Completion & Daily Insight & Reminders */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <ProfileCompletionWidget profile={userProfile} />
          <DailyInsightWidget userProfile={userProfile} />
          <SmartRemindersWidget />
        </motion.div>

        {activeJourneys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link to={createPageUrl("JourneyDashboard")}>
              <Card className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 border-0 hover:scale-[1.02] transition-all cursor-pointer group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                <CardContent className="p-6 md:p-8 relative z-10">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Compass className="w-8 h-8 text-yellow-300" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-1 flex items-center gap-2">
                          🧭 המסע היומי שלך
                        </h3>
                        <p className="text-purple-100 text-base md:text-lg">
                          {activeJourneys[0].completed_steps || 0}/{activeJourneys[0].total_steps || 0} שלבים הושלמו
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-8 h-8 text-white group-hover:-translate-x-2 transition-transform" />
                  </div>
                  <Progress 
                    value={activeJourneys[0].progress_percentage || 0} 
                    className="h-2 mt-4"
                  />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {userProfile && userProfile.ai_suggestions_enabled && userProfile.profile_completion_score >= 60 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-3 inline-flex items-center gap-3">
                <Sparkles className="w-9 h-9 text-purple-400" />
                מיוחד בשבילך
              </h2>
              <p className="text-purple-300 text-lg">
                ה-AI בחר את הניתוחים הכי מתאימים בשבילך
              </p>
            </div>
            <AISuggestionsWidget />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 inline-flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              לוח המחוונים שלך
            </h2>
            <p className="text-purple-300 text-lg">כל המידע החשוב במקום אחד</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProfileOverviewCard userProfile={userProfile} user={user} />
            <GoalProgressWidget />
            <AstrologyWidget />
            <NumerologySummaryCard numerologyAnalysis={numerologyAnalysis} />
            <RecentAnalysesWidget analyses={allAnalyses} />
            <UpcomingTrendsWidget />
            <DocumentInsightsWidget documentAnalyses={documentAnalyses} />
          </div>
        </motion.div>

        <div className="relative mb-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-purple-700/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-950 px-6 text-purple-400 text-lg font-semibold">✨</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 inline-flex items-center gap-3 flex-wrap justify-center">
              <BookOpen className="w-10 h-10 text-purple-400" />
              מה נלמד עליך היום?
            </h2>
            <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
              כל דרך שתבחר תעזור לך להכיר את עצמך יותר טוב
            </p>
          </div>

          {hasMultipleAnalyses && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10"
            >
              <Link to={createPageUrl("MysticSynthesis")}>
                <Card className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 border-0 hover:scale-[1.02] transition-all cursor-pointer group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  <CardContent className="p-8 md:p-10 relative z-10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <Sparkles className="w-10 h-10 text-yellow-300" />
                        </div>
                        <div>
                          <h3 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
                            ✨ התמונה המלאה
                          </h3>
                          <p className="text-purple-100 text-lg md:text-xl">
                            {firstName}, חיברתי לך את כל מה שגיליתי עליך
                          </p>
                        </div>
                      </div>
                      <ArrowLeft className="w-10 h-10 text-white group-hover:-translate-x-2 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, idx) => {
              const IconComponent = tool.icon;

              return (
                <motion.div
                  key={tool.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Link to={createPageUrl(tool.path)}>
                    <Card 
                      className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border-2 border-purple-800/30 hover:border-purple-500/50 transition-all cursor-pointer group h-full"
                      style={{ 
                        boxShadow: `0 8px 32px -8px ${tool.glowColor}` 
                      }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-10`} />
                      </div>

                      <CardContent className="p-8 relative z-10">
                        <div className="flex items-start gap-4 mb-6">
                          <div className={`w-16 h-16 bg-gradient-to-br ${tool.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                              {tool.name}
                            </h3>
                            <div className="text-4xl mb-2">{tool.emoji}</div>
                          </div>
                        </div>
                        <p className="text-purple-200 leading-relaxed mb-4 text-base">
                          {tool.description}
                        </p>
                        <div className="flex items-center justify-between text-purple-400 group-hover:text-purple-300 transition-colors">
                          <span className="text-sm font-semibold">בוא נתחיל</span>
                          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center bg-gradient-to-r from-pink-900/30 via-purple-900/30 to-pink-900/30 rounded-3xl p-10 border-2 border-pink-700/30 backdrop-blur-sm"
        >
          <Heart className="w-14 h-14 text-pink-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-2xl md:text-3xl font-bold mb-3">
            {firstName}, אני פה בשבילך
          </p>
          <p className="text-purple-200 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            כל פעם שאתה לומד עוד משהו על עצמך, אתה מתקרב למי שאתה באמת 💫
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