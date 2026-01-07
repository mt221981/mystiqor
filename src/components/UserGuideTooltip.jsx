import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOOLTIPS = {
  home: {
    title: "ברוך הבא למסע פנימה! 🌟",
    content: "כאן תוכל לגלות את עצמך דרך כלים מיסטיים שונים. התחל עם הכלי שמדבר אליך הכי הרבה.",
    position: "bottom-center"
  },
  numerology: {
    title: "נומרולוגיה - המספרים שלך 🔢",
    content: "הזן את שמך המלא ותאריך לידה לקבלת ניתוח מעמיק. השם בעברית חשוב מאוד לדיוק הניתוח!",
    position: "top-center"
  },
  astrology: {
    title: "אסטרולוגיה - מפת הכוכבים שלך ⭐",
    content: "שעת הלידה חשובה מאוד! ללא שעת לידה מדויקת, הניתוח יהיה חלקי בלבד.",
    position: "top-center"
  },
  profile: {
    title: "השלם את הפרופיל שלך 👤",
    content: "מילוי פרטים מלאים יאפשר ניתוחים מדויקים יותר ויחסוך זמן בעתיד.",
    position: "bottom-right"
  },
  subscription: {
    title: "המנוי שלך 💎",
    content: "עקוב אחר השימוש שלך בניתוחים. משתמשים בתוכנית החינמית? שדרג כדי לקבל ניתוחים ללא הגבלה!",
    position: "top-right"
  }
};

export default function UserGuideTooltip({ 
  page, 
  onDismiss,
  autoShow = true 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedTooltips = JSON.parse(localStorage.getItem('dismissedTooltips') || '{}');
    
    if (autoShow && !dismissedTooltips[page] && TOOLTIPS[page]) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [page, autoShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    
    const dismissedTooltips = JSON.parse(localStorage.getItem('dismissedTooltips') || '{}');
    dismissedTooltips[page] = true;
    localStorage.setItem('dismissedTooltips', JSON.stringify(dismissedTooltips));
    
    if (onDismiss) onDismiss();
  };

  if (!TOOLTIPS[page] || dismissed) return null;

  const tooltip = TOOLTIPS[page];

  const positionClasses = {
    "top-center": "top-24 left-1/2 -translate-x-1/2",
    "top-right": "top-24 left-4",
    "bottom-center": "bottom-24 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-24 left-4",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className={`fixed ${positionClasses[tooltip.position]} z-50 max-w-md`}
        >
          <div className="bg-gradient-to-br from-purple-600/95 to-pink-600/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 border-purple-400/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">
                  {tooltip.title}
                </h3>
                <p className="text-white/95 text-sm leading-relaxed">
                  {tooltip.content}
                </p>
              </div>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/20 flex-shrink-0 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleDismiss}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg"
              >
                הבנתי, תודה! ✨
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}