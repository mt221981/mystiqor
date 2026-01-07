import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

/**
 * תצוגת Confidence Score עם tooltip מפורט
 * רכיב חדש - לא משנה כלום קיים
 */

export default function ConfidenceBadge({ 
  score, 
  details,
  size = "default" 
}) {
  // אם אין score - לא מציגים כלום (graceful degradation)
  if (score === undefined || score === null) {
    return null;
  }

  // המרה לאחוזים
  const percentage = typeof score === 'number' && score <= 1 
    ? Math.round(score * 100) 
    : Math.round(score);

  // צבעים לפי רמת ביטחון
  const getColorClass = () => {
    if (percentage >= 90) return "bg-green-600 text-white border-green-700";
    if (percentage >= 75) return "bg-blue-600 text-white border-blue-700";
    if (percentage >= 60) return "bg-yellow-600 text-white border-yellow-700";
    if (percentage >= 40) return "bg-orange-600 text-white border-orange-700";
    return "bg-red-600 text-white border-red-700";
  };

  // אייקון לפי רמה
  const getIcon = () => {
    if (percentage >= 75) return <CheckCircle className="w-3 h-3" />;
    if (percentage >= 50) return <HelpCircle className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  // טקסט תיאור
  const getLabel = () => {
    if (percentage >= 90) return "דיוק גבוה מאוד";
    if (percentage >= 75) return "דיוק גבוה";
    if (percentage >= 60) return "דיוק טוב";
    if (percentage >= 40) return "דיוק בינוני";
    return "דיוק נמוך";
  };

  // תוכן tooltip מפורט
  const tooltipContent = (
    <div className="text-right space-y-2 max-w-xs">
      <div className="font-bold text-white">
        רמת דיוק: {percentage}%
      </div>
      <div className="text-sm text-gray-200">
        {getLabel()}
      </div>
      
      {details && (
        <div className="mt-3 pt-3 border-t border-gray-600 text-xs space-y-1">
          {details.input_quality !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-300">איכות קלט:</span>
              <span className="font-semibold">{Math.round(details.input_quality * 100)}%</span>
            </div>
          )}
          {details.calculation_confidence !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-300">ביטחון חישובי:</span>
              <span className="font-semibold">{Math.round(details.calculation_confidence * 100)}%</span>
            </div>
          )}
          {details.data_completeness !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-300">שלמות נתונים:</span>
              <span className="font-semibold">{Math.round(details.data_completeness * 100)}%</span>
            </div>
          )}
          {details.notes && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-gray-300">{details.notes}</div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
        💡 דיוק גבוה יותר = ניתוח מדויק ומהימן יותר
      </div>
    </div>
  );

  const sizeClasses = {
    small: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1.5",
    large: "text-base px-4 py-2"
  };

  return (
    <TooltipProvider>
      <TooltipPrimitive>
        <TooltipTrigger asChild>
          <Badge 
            className={`
              ${getColorClass()} 
              ${sizeClasses[size]}
              flex items-center gap-1.5
              cursor-help
              transition-all
              hover:scale-105
              shadow-lg
            `}
          >
            {getIcon()}
            <span className="font-bold">{percentage}%</span>
            <span className="hidden sm:inline">דיוק</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 border-gray-700">
          {tooltipContent}
        </TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
}