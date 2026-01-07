import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Calendar, MapPin, Star, Target, Sparkles, Edit, Moon, Clock, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { usePageView } from "@/components/Analytics";

export default function UserProfile() {
  usePageView('UserProfile');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter(
        { created_by: (await base44.auth.me()).email },
        '-created_date',
        1
      );
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const { data: activeGoals = [] } = useQuery({
    queryKey: ['active_goals'],
    queryFn: async () => {
      const goals = await base44.entities.UserGoal.filter(
        { status: { $in: ['active', 'in_progress'] } },
        '-created_date',
        5
      );
      return goals;
    },
    enabled: !!user
  });

  const { data: todayInsight } = useQuery({
    queryKey: ['today_insight'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const insights = await base44.entities.DailyInsight.filter(
        { insight_date: today },
        '-created_date',
        1
      );
      return insights[0] || null;
    },
    enabled: !!user
  });

  const { data: recentAnalyses = [] } = useQuery({
    queryKey: ['recent_analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 5),
    enabled: !!user
  });

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  const completionScore = userProfile?.profile_completion_score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="הפרופיל שלי 👤"
          description="כל המידע שלך במקום אחד"
          icon={User}
          iconGradient="from-purple-600 to-pink-600"
        />

        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl">
                {userProfile?.profile_photo_url ? (
                  <img src={userProfile.profile_photo_url} alt="Profile" className="rounded-full w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {userProfile?.full_name_hebrew || user?.full_name || 'שם המשתמש'}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </div>
                  {userProfile?.birth_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(userProfile.birth_date).toLocaleDateString('he-IL')}
                    </div>
                  )}
                  {userProfile?.birth_place_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {userProfile.birth_place_name}
                    </div>
                  )}
                </div>
              </div>

              <Link to={createPageUrl("EditProfile")}>
                <Button className="bg-white/10 hover:bg-white/20 border-white/30">
                  <Edit className="w-4 h-4 ml-2" />
                  ערוך פרופיל
                </Button>
              </Link>
            </div>

            {/* Profile Completion */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-purple-200 font-semibold">השלמת פרופיל</span>
                <span className="text-white font-bold">{completionScore}%</span>
              </div>
              <Progress value={completionScore} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Today's Insight */}
          {todayInsight && (
            <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  התובנה היומית שלך
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-purple-100 font-bold mb-2">
                  {todayInsight.insight_title || todayInsight.title}
                </h3>
                <p className="text-purple-200 text-sm leading-relaxed">
                  {(todayInsight.insight_content || todayInsight.content)?.substring(0, 150)}...
                </p>
                <Link to={createPageUrl("Home")}>
                  <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                    קרא עוד
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Active Goals Summary */}
          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                היעדים הפעילים שלי
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <p className="text-green-200 text-sm">אין יעדים פעילים כרגע</p>
              ) : (
                <div className="space-y-3">
                  {activeGoals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="bg-green-950/30 rounded-lg p-3">
                      <h4 className="text-white font-semibold mb-1">{goal.goal_title}</h4>
                      <Progress value={goal.progress_percentage || 0} className="h-2 mb-1" />
                      <p className="text-green-300 text-xs">{goal.progress_percentage || 0}% הושלם</p>
                    </div>
                  ))}
                </div>
              )}
              <Link to={createPageUrl("MyGoals")}>
                <Button className="mt-4 w-full bg-green-600 hover:bg-green-700">
                  ראה את כל היעדים
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-purple-900/40 border-purple-700">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{recentAnalyses.length}</div>
              <p className="text-purple-300 text-sm">ניתוחים אחרונים</p>
            </CardContent>
          </Card>

          <Card className="bg-green-900/40 border-green-700">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{activeGoals.length}</div>
              <p className="text-green-300 text-sm">יעדים פעילים</p>
            </CardContent>
          </Card>

          <Card className="bg-indigo-900/40 border-indigo-700">
            <CardContent className="p-6 text-center">
              <Moon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">
                {userProfile?.preferred_disciplines?.length || 0}
              </div>
              <p className="text-indigo-300 text-sm">כלים מועדפים</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-900/40 border-amber-700">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{completionScore}%</div>
              <p className="text-amber-300 text-sm">פרופיל מלא</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              פעילות אחרונה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalyses.slice(0, 5).map((analysis) => (
                <div key={analysis.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-700">
                      {analysis.tool_type}
                    </Badge>
                    <p className="text-gray-300 text-sm flex-1">
                      {analysis.summary?.substring(0, 80)}...
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(analysis.created_date).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link to={createPageUrl("MyAnalyses")}>
              <Button variant="outline" className="w-full mt-4 border-purple-700 hover:bg-purple-900/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ראה את כל הניתוחים
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}