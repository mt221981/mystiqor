import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Link as LinkIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EnhancedToast from "./EnhancedToast";

export default function GoalLinker({ analysisId, currentGoalId }) {
  const [selectedGoalId, setSelectedGoalId] = React.useState(currentGoalId || '');
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: async () => {
      return await base44.entities.UserGoal.filter({ status: 'active' }, '-created_date', 20);
    }
  });

  const linkGoalMutation = useMutation({
    mutationFn: async ({ goalId, analysisId }) => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');

      const relatedAnalyses = goal.related_analysis_ids || [];
      if (!relatedAnalyses.includes(analysisId)) {
        relatedAnalyses.push(analysisId);
      }

      await base44.entities.UserGoal.update(goalId, {
        related_analysis_ids: relatedAnalyses
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeGoals']);
      queryClient.invalidateQueries(['userGoals']);
      EnhancedToast.success('הניתוח קושר ליעד! 🎯');
    },
    onError: (error) => {
      EnhancedToast.error('שגיאה בקישור ליעד', error.message);
    }
  });

  const handleLink = () => {
    if (!selectedGoalId) {
      EnhancedToast.error('בחר יעד לקישור');
      return;
    }
    linkGoalMutation.mutate({ goalId: selectedGoalId, analysisId });
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <Card className="bg-purple-900/30 border-purple-700/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-purple-400" />
          <h4 className="text-white font-semibold">קשר את הניתוח הזה ליעד</h4>
        </div>
        <div className="flex gap-2">
          <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
            <SelectTrigger className="flex-1 bg-gray-800 text-white border-purple-600">
              <SelectValue placeholder="בחר יעד..." />
            </SelectTrigger>
            <SelectContent>
              {goals.map(goal => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.goal_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleLink}
            disabled={linkGoalMutation.isLoading || !selectedGoalId}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
        {currentGoalId && (
          <p className="text-green-300 text-xs mt-2">
            ✓ מקושר ליעד נוכחי
          </p>
        )}
      </CardContent>
    </Card>
  );
}