import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function HelpTooltip({ text, className = "" }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button className={`inline-flex items-center justify-center text-purple-300 hover:text-white transition-colors cursor-help ${className}`}>
            <Info className="w-4 h-4" />
            <span className="sr-only">מידע נוסף</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-slate-900 border-purple-500/30 text-slate-100 p-3 leading-relaxed">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}