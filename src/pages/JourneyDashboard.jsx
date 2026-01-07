import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Compass, 
  Plus, 
  CheckCircle, 
  Sparkles,
  Target,
  TrendingUp,
  Loader2
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import JourneyCard from "@/components/JourneyCard";
import JourneyTypeSelector from "@/components/JourneyTypeSelector";

const FOCUS_AREA_MAP = {
  life_purpose: { name: "ייעוד חיים", color: "purple", emoji: "🌟" },
  relationships: { name: "יחסים", color: "pink", emoji: "❤️" },
  career: { name: "קריירה", color: "blue", emoji: "💼" },
  personal_growth: { name: "צמיחה אישית", color: "green", emoji: "🌱" },
  spiritual_path: { name: "דרך רוחנית", color: "indigo", emoji: "🙏" },
  self_discovery: { name: "גילוי עצמי", color: "amber", emoji: "🔍" },
  health: { name: "בריאות", color: "emerald", emoji: "💪" },
  creativity: { name: "יצירתיות", color: "rose", emoji: "🎨" }
};

export default function JourneyDashboard() {
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ['coaching_journeys'],
    queryFn: async () => {
      const allJourneys = await base44.entities.CoachingJourney.list('-start_date', 50);
      return allJourneys;
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  const generateJourneyMutation = useMutation({
    mutationFn: async ({ journey_type, focus_area }) => {
      const response = await base44.functions.invoke('generatePersonalizedJourney', {
        journey_type,
        focus_area
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['coaching_journeys'] });
      setSelectedJourney(data.journey);
      EnhancedToast.success(
        'המסע שלך מוכן! 🎉',
        data.motivational_message
      );
    },
    onError: (error) => {
      console.error('Journey generation error:', error);
      EnhancedToast.error('שגיאה ביצירת המסע', 'אנא נסה שוב');
    }
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({ journeyId, stepNumber, newStatus }) => {
      const journey = journeys.find(j => j.id === journeyId);
      if (!journey) throw new Error('Journey not found');

      const updatedSteps = journey.steps.map(step => {
        if (step.step_number === stepNumber) {
          return {
            ...step,
            status: newStatus,
            completion_date: newStatus === 'completed' ? new Date().toISOString() : undefined
          };
        }
        return step;
      });

      const completedCount = updatedSteps.filter(s => s.status === 'completed').length;
      const progress = (completedCount / updatedSteps.length) * 100;

      await base44.entities.CoachingJourney.update(journeyId, {
        steps: updatedSteps,
        completed_steps: completedCount,
        progress_percentage: Math.round(progress),
        status: progress === 100 ? 'completed' : 'active'
      });

      return { journeyId, updatedSteps, progress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching_journeys'] });
      EnhancedToast.success('יפה! 🎉', 'השלב עודכן בהצלחה');
    }
  });

  const handleGenerateJourney = (type, focusArea) => {
    setIsGenerating(true);
    generateJourneyMutation.mutate({ journey_type: type, focus_area: focusArea }, {
      onSettled: () => setIsGenerating(false)
    });
  };

  const activeJourneys = journeys.filter(j => j.status === 'active');
  const completedJourneys = journeys.filter(j => j.status === 'completed');
  const currentDailyJourney = activeJourneys.find(j => j.tags?.includes('daily'));
  const currentWeeklyJourney = activeJourneys.find(j => j.tags?.includes('weekly'));

  const suggestedFocusArea = userProfile?.focus_areas?.[0] || 'personal_growth';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="המסעות שלי 🧭"
          description="מסעות אישיים מותאמים בדיוק בשבילך"
          icon={Compass}
          iconGradient="from-purple-500 to-pink-500"
        />

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-purple-900/50 border-purple-700/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{activeJourneys.length}</div>
              <div className="text-purple-300">מסעות פעילים</div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/50 border-green-700/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{completedJourneys.length}</div>
              <div className="text-green-300">מסעות שהושלמו</div>
            </CardContent>
          </Card>

          <Card className="bg-amber-900/50 border-amber-700/30">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">
                {journeys.reduce((sum, j) => sum + (j.completed_steps || 0), 0)}
              </div>
              <div className="text-amber-300">שלבים שהושלמו</div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Journey */}
        <JourneyTypeSelector
          onGenerate={handleGenerateJourney}
          isGenerating={isGenerating}
          hasActiveDaily={!!currentDailyJourney}
          hasActiveWeekly={!!currentWeeklyJourney}
          suggestedFocusArea={suggestedFocusArea}
        />

        {/* Active Journeys */}
        {activeJourneys.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              המסעות הפעילים שלך
            </h2>
            <div className="grid gap-6">
              {activeJourneys.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  onStepComplete={(stepNumber) => 
                    updateStepMutation.mutate({ 
                      journeyId: journey.id, 
                      stepNumber, 
                      newStatus: 'completed' 
                    })
                  }
                  onStepReset={(stepNumber) =>
                    updateStepMutation.mutate({
                      journeyId: journey.id,
                      stepNumber,
                      newStatus: 'todo'
                    })
                  }
                  isUpdating={updateStepMutation.isLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Journeys */}
        {completedJourneys.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              מסעות שהושלמו
            </h2>
            <div className="grid gap-6">
              {completedJourneys.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  showCompleted
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {journeys.length === 0 && !isGenerating && (
          <Card className="bg-gray-900/50 border-gray-700/30 text-center py-16">
            <CardContent>
              <Compass className="w-24 h-24 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                אין לך עדיין מסעות
              </h3>
              <p className="text-gray-300 text-lg mb-8">
                בוא נתחיל את המסע הראשון שלך! 🚀
              </p>
              <Button
                onClick={() => handleGenerateJourney('daily', suggestedFocusArea)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 ml-2" />
                צור מסע יומי
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}