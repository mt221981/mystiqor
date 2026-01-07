import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const GOAL_CATEGORIES = {
  career: { icon: "💼", color: "from-blue-600 to-cyan-600" },
  relationships: { icon: "💕", color: "from-pink-600 to-rose-600" },
  personal_growth: { icon: "🌱", color: "from-green-600 to-emerald-600" },
  health: { icon: "💪", color: "from-red-600 to-orange-600" },
  spirituality: { icon: "🧘", color: "from-purple-600 to-violet-600" },
  creativity: { icon: "🎨", color: "from-amber-600 to-yellow-600" },
  finance: { icon: "💰", color: "from-green-600 to-teal-600" },
  other: { icon: "⭐", color: "from-gray-600 to-slate-600" }
};

const FOCUS_ICONS = {
  life_purpose: "🎯",
  relationships: "💕",
  career: "💼",
  personal_growth: "🌱",
  spiritual_path: "🧘",
  self_discovery: "🔍",
  health: "💪",
  creativity: "🎨"
};

export default function GoalProgressWidget({ className }) {
  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: async () => {
      const allGoals = await base44.entities.UserGoal.list('-created_date', 50);
      return allGoals.filter(g => ['active', 'in_progress'].includes(g.status));
    },
    staleTime: 3 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const { data: journeys = [], isLoading: loadingJourneys } = useQuery({
    queryKey: ['activeJourneys'],
    queryFn: async () => {
      const allJourneys = await base44.entities.CoachingJourney.list('-created_date', 50);
      return allJourneys.filter(j => j.status === 'active');
    },
    staleTime: 3 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const isLoading = loadingGoals || loadingJourneys;

  if (isLoading) {
    return (
      <Card className="bg-purple-900/30 border-purple-700/30 animate-pulse">
        <CardContent className="p-6">
          <div className="h-24" />
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0 && journeys.length === 0) {
    return (
      <Card className="bg-purple-900/30 border-purple-700/30">
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
            <p className="text-purple-300 mb-4">עדיין אין יעדים או מסעות</p>
            <div className="flex gap-2">
              <Link to={createPageUrl("MyGoals")} className="flex-1">
                <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
                  <Target className="w-4 h-4 ml-2" />
                  צור יעד
                </Button>
              </Link>
              <Link to={createPageUrl("AICoach")} className="flex-1">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="sm">
                  <Map className="w-4 h-4 ml-2" />
                  צור מסע
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgGoalProgress = goals.length > 0 
    ? goals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / goals.length 
    : 0;

  const avgJourneyProgress = journeys.length > 0
    ? journeys.reduce((sum, j) => sum + (j.progress_percentage || 0), 0) / journeys.length
    : 0;

  const overallProgress = goals.length > 0 && journeys.length > 0
    ? (avgGoalProgress + avgJourneyProgress) / 2
    : goals.length > 0 
    ? avgGoalProgress 
    : avgJourneyProgress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-purple-700/50 h-full flex flex-col">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-white text-xl font-bold">היעדים והמסעות</h3>
            </div>
            <div className="flex gap-1">
              {goals.length > 0 && (
                <Badge className="bg-purple-700 text-white">
                  {goals.length} יעדים
                </Badge>
              )}
              {journeys.length > 0 && (
                <Badge className="bg-indigo-700 text-white">
                  {journeys.length} מסעות
                </Badge>
              )}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-purple-300">התקדמות כללית:</span>
              <span className="text-white font-bold">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Journeys Section */}
          {journeys.length > 0 && (
            <div className="mb-4">
              <h4 className="text-purple-200 font-semibold text-sm mb-3 flex items-center gap-2">
                <Map className="w-4 h-4" />
                מסעות פעילים:
              </h4>
              <div className="space-y-2">
                {journeys.slice(0, 2).map((journey) => {
                  const focusIcon = FOCUS_ICONS[journey.focus_area] || "✨";
                  
                  return (
                    <div key={journey.id} className="bg-indigo-950/50 rounded-lg p-3 border border-indigo-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{focusIcon}</span>
                        <h4 className="text-white font-semibold text-sm flex-1 line-clamp-1">
                          {journey.title}
                        </h4>
                        <span className="text-indigo-300 text-xs shrink-0">
                          {journey.progress_percentage || 0}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-300 text-xs mb-2">
                        <span>{journey.completed_steps || 0}/{journey.total_steps || 0} שלבים</span>
                      </div>
                      <Progress value={journey.progress_percentage || 0} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Goals Section */}
          {goals.length > 0 && (
            <div className="mb-4">
              <h4 className="text-purple-200 font-semibold text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                יעדים פעילים:
              </h4>
              <div className="space-y-2">
                {goals.slice(0, 2).map((goal) => {
                  const category = GOAL_CATEGORIES[goal.goal_category] || GOAL_CATEGORIES.other;
                  
                  return (
                    <div key={goal.id} className="bg-purple-950/50 rounded-lg p-3 border border-purple-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{category.icon}</span>
                        <h4 className="text-white font-semibold text-sm flex-1 line-clamp-1">
                          {goal.goal_title}
                        </h4>
                        <span className="text-purple-300 text-xs shrink-0">
                          {goal.progress_percentage || 0}%
                        </span>
                      </div>
                      <Progress value={goal.progress_percentage || 0} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {(goals.length > 2 || journeys.length > 2) && (
            <div className="mb-4 pt-4 border-t border-purple-700/30">
              <div className="grid grid-cols-2 gap-4 text-center">
                {goals.length > 2 && (
                  <div>
                    <div className="text-xl font-bold text-white">+{goals.length - 2}</div>
                    <div className="text-purple-300 text-xs">יעדים נוספים</div>
                  </div>
                )}
                {journeys.length > 2 && (
                  <div>
                    <div className="text-xl font-bold text-white">+{journeys.length - 2}</div>
                    <div className="text-purple-300 text-xs">מסעות נוספים</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <Link to={createPageUrl("MyGoals")} className="flex-1">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 border-purple-500" size="sm">
                יעדים
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("AICoach")} className="flex-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-500" size="sm">
                מסעות
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}