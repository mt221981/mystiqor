import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Heart, TrendingUp, Bell, Sparkles, Activity, CheckCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PageHeader from "@/components/PageHeader";
import { usePageView } from "@/components/Analytics";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { SkeletonStats, SkeletonCard } from "@/components/SkeletonLoader";
import AnimatedCounter from "@/components/AnimatedCounter";
import BiorhythmChart from "@/components/dashboard/BiorhythmChart";

const COLORS = {
  primary: '#9333EA',
  secondary: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6'
};

export default function Dashboard() {
  usePageView('Dashboard');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 10 * 60 * 1000,
    retry: 1
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter(
        { created_by: user.email },
        '-created_date',
        1
      );
      return profiles[0] || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['allGoals'],
    queryFn: () => base44.entities.UserGoal.list('-created_date', 100),
    staleTime: 3 * 60 * 1000
  });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-entry_date', 30),
    staleTime: 5 * 60 * 1000
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['recentAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50),
    staleTime: 5 * 60 * 1000
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['allReminders'],
    queryFn: () => base44.entities.UserReminder.list('-created_date', 50),
    staleTime: 2 * 60 * 1000
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['allJourneys'],
    queryFn: () => base44.entities.CoachingJourney.list('-created_date', 50),
    staleTime: 3 * 60 * 1000
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const activeGoals = goals.filter(g => ['active', 'in_progress'].includes(g.status));
    const completedGoals = goals.filter(g => g.status === 'completed');
    const avgGoalProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / activeGoals.length
      : 0;

    const last7DaysMoods = moodEntries.filter(m => {
      const date = new Date(m.entry_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    });

    const avgMoodScore = last7DaysMoods.length > 0
      ? last7DaysMoods.reduce((sum, m) => sum + (m.mood_score || 5), 0) / last7DaysMoods.length
      : 5;

    const pendingReminders = reminders.filter(r => r.status === 'pending');
    const activeJourneys = journeys.filter(j => j.status === 'active');

    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      avgGoalProgress: Math.round(avgGoalProgress),
      totalAnalyses: analyses.length,
      avgMoodScore: avgMoodScore.toFixed(1),
      moodEntriesCount: moodEntries.length,
      pendingReminders: pendingReminders.length,
      activeJourneys: activeJourneys.length,
      last7DaysMoods: last7DaysMoods.length
    };
  }, [goals, moodEntries, analyses, reminders, journeys]);

  // Prepare chart data
  const goalsChartData = useMemo(() => {
    const categories = ['career', 'relationships', 'personal_growth', 'health', 'spirituality', 'creativity'];
    return categories.map(cat => ({
      name: {
        career: 'קריירה',
        relationships: 'יחסים',
        personal_growth: 'צמיחה',
        health: 'בריאות',
        spirituality: 'רוחניות',
        creativity: 'יצירתיות'
      }[cat],
      count: goals.filter(g => g.goal_category === cat).length
    })).filter(d => d.count > 0);
  }, [goals]);

  const moodTrendData = useMemo(() => {
    return moodEntries
      .slice(0, 14)
      .reverse()
      .map(m => ({
        date: new Date(m.entry_date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
        mood: m.mood_score || 5,
        energy: m.energy_level || 5,
        stress: 10 - (m.stress_level || 5)
      }));
  }, [moodEntries]);

  const goalProgressData = useMemo(() => {
    return goals
      .filter(g => ['active', 'in_progress'].includes(g.status))
      .slice(0, 5)
      .map(g => ({
        name: g.goal_title.length > 20 ? g.goal_title.substring(0, 20) + '...' : g.goal_title,
        progress: g.progress_percentage || 0
      }));
  }, [goals]);

  const analysisTypeData = useMemo(() => {
    const types = analyses.reduce((acc, a) => {
      acc[a.tool_type] = (acc[a.tool_type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(types).map(([type, count]) => ({
      name: {
        numerology: 'נומרולוגיה',
        astrology: 'אסטרולוגיה',
        palmistry: 'כף יד',
        graphology: 'גרפולוגיה',
        tarot: 'טארוט',
        drawing: 'ציור'
      }[type] || type,
      value: count
    }));
  }, [analyses]);

  const isLoading = userLoading || profileLoading || !user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="הדשבורד שלי 📊"
            description="סקירה מקיפה של כל הפעילות והנתונים שלך"
            icon={BarChart3}
          />
          <SkeletonStats />
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <SkeletonCard count={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="הדשבורד שלי 📊"
          description="סקירה מקיפה של כל הפעילות והנתונים שלך"
          icon={BarChart3}
        />

        {/* Biorhythm Chart - Visual Upgrade */}
        {profile?.birth_date && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8"
          >
            <BiorhythmChart birthDate={profile.birth_date} />
          </motion.div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">
                  <AnimatedCounter value={stats.activeGoals} />
                </div>
                <p className="text-purple-300 text-sm">יעדים פעילים</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 border-pink-700">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{stats.avgMoodScore}</div>
                <p className="text-pink-300 text-sm">מצב רוח ממוצע</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">
                  <AnimatedCounter value={stats.completedGoals} />
                </div>
                <p className="text-green-300 text-sm">יעדים הושלמו</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-700">
              <CardContent className="p-6 text-center">
                <Bell className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">
                  <AnimatedCounter value={stats.pendingReminders} />
                </div>
                <p className="text-amber-300 text-sm">תזכורות ממתינות</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Mood Trend Chart */}
          {moodTrendData.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-gray-900/80 border-purple-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    מגמת מצב רוח (14 ימים)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={moodTrendData}>
                      <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={[0, 10]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                      <Line type="monotone" dataKey="mood" stroke={COLORS.primary} strokeWidth={2} name="מצב רוח" />
                      <Line type="monotone" dataKey="energy" stroke={COLORS.success} strokeWidth={2} name="אנרגיה" />
                      <Line type="monotone" dataKey="stress" stroke={COLORS.danger} strokeWidth={2} name="רגיעה" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Goals Progress Chart */}
          {goalProgressData.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-gray-900/80 border-green-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    התקדמות יעדים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={goalProgressData}>
                      <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Bar dataKey="progress" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Goals by Category */}
          {goalsChartData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gray-900/80 border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    יעדים לפי קטגוריה
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={goalsChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {goalsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Analysis Types */}
          {analysisTypeData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gray-900/80 border-pink-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    ניתוחים לפי סוג
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analysisTypeData} layout="vertical">
                      <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <YAxis dataKey="name" type="category" stroke="#9CA3AF" style={{ fontSize: '12px' }} width={100} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill={COLORS.secondary} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-900/80 border-purple-700/50">
          <CardHeader>
            <CardTitle className="text-white">גישה מהירה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to={createPageUrl("MyGoals")}>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Target className="w-4 h-4 ml-2" />
                  היעדים שלי
                </Button>
              </Link>
              <Link to={createPageUrl("MoodTracker")}>
                <Button className="w-full bg-pink-600 hover:bg-pink-700">
                  <Heart className="w-4 h-4 ml-2" />
                  מעקב מצב רוח
                </Button>
              </Link>
              <Link to={createPageUrl("MyAnalyses")}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Sparkles className="w-4 h-4 ml-2" />
                  הניתוחים שלי
                </Button>
              </Link>
              <Link to={createPageUrl("Notifications")}>
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  <Bell className="w-4 h-4 ml-2" />
                  תזכורות
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}