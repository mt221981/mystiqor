import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INSIGHT_TYPES = [
  { value: "all", label: "הכל", icon: "🌟" },
  { value: "personality", label: "אישיות", icon: "👤" },
  { value: "career", label: "קריירה", icon: "💼" },
  { value: "relationships", icon: "💕", label: "יחסים" },
  { value: "health", label: "בריאות", icon: "🏥" },
  { value: "timing", label: "תזמון", icon: "⏰" },
  { value: "challenge", label: "אתגר", icon: "⚡" },
  { value: "strength", label: "חוזק", icon: "💪" },
  { value: "recommendation", label: "המלצה", icon: "💡" }
];

export default function InsightsFilter({ insights, onFilterChange }) {
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  if (!insights || insights.length === 0) return null;

  const insightCounts = {};
  INSIGHT_TYPES.forEach(type => {
    insightCounts[type.value] = type.value === "all" 
      ? insights.length 
      : insights.filter(i => i.insight_type === type.value).length;
  });

  const handleSelect = (type) => {
    setSelectedType(type);
    onFilterChange(type === "all" ? insights : insights.filter(i => i.insight_type === type));
  };

  return (
    <div className="mb-6">
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        className="border-purple-600 text-purple-300 hover:bg-purple-800/30 mb-4"
      >
        <Filter className="w-4 h-4 ml-2" />
        סנן תובנות ({insights.length})
        {showFilters && <X className="w-4 h-4 mr-2" />}
      </Button>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 p-4 bg-purple-900/20 rounded-xl border border-purple-700/30">
              {INSIGHT_TYPES.map(type => (
                <Button
                  key={type.value}
                  onClick={() => handleSelect(type.value)}
                  variant={selectedType === type.value ? "default" : "outline"}
                  className={selectedType === type.value 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "border-purple-600/50 text-purple-300 hover:bg-purple-800/20"
                  }
                  size="sm"
                >
                  <span className="ml-2">{type.icon}</span>
                  {type.label}
                  <Badge className="mr-2 bg-purple-800 text-white text-xs">
                    {insightCounts[type.value] || 0}
                  </Badge>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedType !== "all" && (
        <div className="mt-3 flex items-center gap-2">
          <Badge className="bg-purple-700 text-white">
            מציג: {insightCounts[selectedType]} תובנות מסוג "{INSIGHT_TYPES.find(t => t.value === selectedType)?.label}"
          </Badge>
          <Button
            onClick={() => handleSelect("all")}
            variant="ghost"
            size="sm"
            className="text-purple-300 hover:bg-purple-800/20"
          >
            <X className="w-3 h-3 ml-1" />
            נקה סינון
          </Button>
        </div>
      )}
    </div>
  );
}