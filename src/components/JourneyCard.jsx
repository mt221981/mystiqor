import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Circle, 
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Hash,
  Stars,
  Hand,
  PenTool,
  Layers,
  BookOpen,
  Target,
  Brain,
  Heart,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const TOOL_ICONS = {
  numerology: Hash,
  astrology: Stars,
  palmistry: Hand,
  graphology: PenTool,
  tarot: Layers,
  journal: BookOpen,
  meditation: Brain,
  compatibility: Heart
};

const FOCUS_AREA_COLORS = {
  life_purpose: "purple",
  relationships: "pink",
  career: "blue",
  personal_growth: "green",
  spiritual_path: "indigo",
  self_discovery: "amber",
  health: "emerald",
  creativity: "rose"
};

const TYPE_ICONS = {
  exercise: TrendingUp,
  reflection: Brain,
  insight: Sparkles,
  action: Target,
  tool_usage: Stars,
  meditation: Brain,
  journaling: BookOpen
};

export default function JourneyCard({ 
  journey, 
  onStepComplete, 
  onStepReset,
  isUpdating = false,
  showCompleted = false 
}) {
  const [isExpanded, setIsExpanded] = useState(!showCompleted);

  if (!journey) return null;

  const {
    title,
    description,
    focus_area,
    steps = [],
    progress_percentage = 0,
    completed_steps = 0,
    total_steps = steps.length,
    status
  } = journey;

  const color = FOCUS_AREA_COLORS[focus_area] || "purple";

  return (
    <Card className={`bg-gradient-to-br from-gray-900/90 to-${color}-900/30 backdrop-blur-xl border-2 border-${color}-700/40 hover:border-${color}-500/60 transition-all`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`bg-${color}-600 text-white`}>
                {focus_area.replace('_', ' ')}
              </Badge>
              {status === 'completed' && (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  הושלם
                </Badge>
              )}
              <Badge variant="outline" className="text-gray-300">
                {completed_steps}/{total_steps} שלבים
              </Badge>
            </div>
            <CardTitle className="text-2xl text-white mb-2">{title}</CardTitle>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">התקדמות</span>
            <span className="text-white font-bold">{Math.round(progress_percentage)}%</span>
          </div>
          <Progress value={progress_percentage} className="h-3" />
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-4">
              {steps.map((step, idx) => {
                const StepIcon = TYPE_ICONS[step.type] || Sparkles;
                const ToolIcon = step.related_tool_suggestion ? TOOL_ICONS[step.related_tool_suggestion] : null;
                const isCompleted = step.status === 'completed';
                const isInProgress = step.status === 'in_progress';

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCompleted
                        ? 'bg-green-900/30 border-green-600/50'
                        : isInProgress
                        ? 'bg-blue-900/30 border-blue-600/50'
                        : 'bg-gray-800/50 border-gray-600/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        ) : (
                          <Circle className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-lg font-bold ${isCompleted ? 'text-green-100 line-through' : 'text-white'}`}>
                              {step.step_number}. {step.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              <StepIcon className="w-3 h-3 ml-1" />
                              {step.type}
                            </Badge>
                            {step.estimated_time_minutes && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 ml-1" />
                                {step.estimated_time_minutes} דק'
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                          {step.description}
                        </p>

                        {step.why_this_matters && (
                          <div className="bg-purple-900/30 rounded-lg p-3 mb-3">
                            <p className="text-purple-200 text-sm">
                              <strong>למה זה חשוב:</strong> {step.why_this_matters}
                            </p>
                          </div>
                        )}

                        {/* Tool Suggestion */}
                        {step.related_tool_suggestion && ToolIcon && (
                          <Link to={createPageUrl(step.related_tool_suggestion === 'drawing' ? 'DrawingAnalysis' : step.related_tool_suggestion.charAt(0).toUpperCase() + step.related_tool_suggestion.slice(1))}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-500 text-purple-300 hover:bg-purple-900/30 mb-3"
                            >
                              <ToolIcon className="w-4 h-4 ml-2" />
                              נסה: {step.related_tool_suggestion}
                            </Button>
                          </Link>
                        )}

                        {/* Actions */}
                        {!showCompleted && status === 'active' && (
                          <div className="flex gap-2">
                            {!isCompleted ? (
                              <Button
                                onClick={() => onStepComplete?.(step.step_number)}
                                disabled={isUpdating}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 ml-2" />
                                סיימתי!
                              </Button>
                            ) : (
                              <Button
                                onClick={() => onStepReset?.(step.step_number)}
                                disabled={isUpdating}
                                size="sm"
                                variant="outline"
                                className="border-gray-500"
                              >
                                בטל סימון
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Completion Message */}
              {status === 'completed' && journey.completion_celebration && (
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 text-center">
                  <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-white text-xl font-bold mb-2">
                    {journey.completion_celebration}
                  </p>
                  <p className="text-purple-200">
                    סיימת את המסע הזה! אתה מדהים! 🎉
                  </p>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}