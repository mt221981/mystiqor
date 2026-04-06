import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const FOCUS_AREAS = [
  { value: "life_purpose", label: "ייעוד חיים", emoji: "🌟" },
  { value: "relationships", label: "יחסים ואהבה", emoji: "❤️" },
  { value: "career", label: "קריירה", emoji: "💼" },
  { value: "personal_growth", label: "צמיחה אישית", emoji: "🌱" },
  { value: "spiritual_path", label: "דרך רוחנית", emoji: "🙏" },
  { value: "self_discovery", label: "גילוי עצמי", emoji: "🔍" },
  { value: "health", label: "בריאות ואיזון", emoji: "💪" },
  { value: "creativity", label: "יצירתיות", emoji: "🎨" }
];

export default function JourneyTypeSelector({ 
  onGenerate, 
  isGenerating = false,
  hasActiveDaily = false,
  hasActiveWeekly = false,
  suggestedFocusArea = "personal_growth"
}) {
  const [selectedType, setSelectedType] = React.useState(null);
  const [focusArea, setFocusArea] = React.useState(suggestedFocusArea);

  const handleGenerate = () => {
    if (!selectedType) return;
    onGenerate(selectedType, focusArea);
    setSelectedType(null);
  };

  return (
    <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700/30">
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-white mb-2">
            מה סוג המסע שתרצה?
          </h3>
          <p className="text-purple-200">
            בחר את הסוג והתחום שמעניין אותך
          </p>
        </div>

        {/* Journey Type Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.button
            onClick={() => setSelectedType('daily')}
            disabled={hasActiveDaily}
            className={`p-6 rounded-xl border-2 transition-all text-right ${
              selectedType === 'daily'
                ? 'bg-purple-600 border-purple-400 shadow-lg'
                : hasActiveDaily
                ? 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed'
                : 'bg-gray-800 border-gray-600 hover:border-purple-500 hover:bg-gray-700'
            }`}
            whileHover={!hasActiveDaily ? { scale: 1.02 } : {}}
            whileTap={!hasActiveDaily ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-white" />
              <h4 className="text-xl font-bold text-white">מסע יומי 🌅</h4>
            </div>
            <p className="text-sm text-purple-100 mb-2">
              3-5 שלבים מרוכזים ליום אחד
            </p>
            <p className="text-xs text-purple-200">
              מושלם כשרוצים להתמקד בנושא ספציפי
            </p>
            {hasActiveDaily && (
              <p className="text-xs text-yellow-300 mt-2">
                ⚠️ יש לך כבר מסע יומי פעיל
              </p>
            )}
          </motion.button>

          <motion.button
            onClick={() => setSelectedType('weekly')}
            disabled={hasActiveWeekly}
            className={`p-6 rounded-xl border-2 transition-all text-right ${
              selectedType === 'weekly'
                ? 'bg-pink-600 border-pink-400 shadow-lg'
                : hasActiveWeekly
                ? 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed'
                : 'bg-gray-800 border-gray-600 hover:border-pink-500 hover:bg-gray-700'
            }`}
            whileHover={!hasActiveWeekly ? { scale: 1.02 } : {}}
            whileTap={!hasActiveWeekly ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-white" />
              <h4 className="text-xl font-bold text-white">מסע שבועי 🗓️</h4>
            </div>
            <p className="text-sm text-pink-100 mb-2">
              7-10 שלבים מעמיקים לשבוע שלם
            </p>
            <p className="text-xs text-pink-200">
              למסע מקיף עם שילוב כלים שונים
            </p>
            {hasActiveWeekly && (
              <p className="text-xs text-yellow-300 mt-2">
                ⚠️ יש לך כבר מסע שבועי פעיל
              </p>
            )}
          </motion.button>
        </div>

        {/* Focus Area Selection */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-purple-200">
              <Target className="w-5 h-5" />
              <span className="font-semibold">על מה תרצה להתמקד?</span>
            </div>
            <Select value={focusArea} onValueChange={setFocusArea}>
              <SelectTrigger className="bg-gray-800 text-white border-purple-600 h-14">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOCUS_AREAS.map(area => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.emoji} {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 text-lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  יוצר את המסע שלך...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 ml-2" />
                  צור מסע מותאם אישית
                </>
              )}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}