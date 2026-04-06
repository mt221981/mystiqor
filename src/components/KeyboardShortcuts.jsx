import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Command, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SHORTCUTS = [
  { key: 'h', label: 'דף הבית', page: 'Home' },
  { key: 'n', label: 'נומרולוגיה', page: 'Numerology' },
  { key: 'p', label: 'קריאת כף יד', page: 'Palmistry' },
  { key: 'g', label: 'גרפולוגיה', page: 'Graphology' },
  { key: 'a', label: 'אסטרולוגיה', page: 'Astrology' },
  { key: 't', label: 'טארוט', page: 'Tarot' },
  { key: 'q', label: 'שאל שאלה', page: 'AskQuestion' },
  { key: 'd', label: 'תחזית יומית', page: 'DailyForecast' },
  { key: 'm', label: 'הניתוחים שלי', page: 'MyAnalyses' },
  { key: '?', label: 'הצג קיצורי דרך', page: null },
];

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Show help on '?' or 'Shift+/'
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Close help on Escape
      if (e.key === 'Escape' && showHelp) {
        e.preventDefault();
        setShowHelp(false);
        return;
      }

      // Navigate on shortcuts
      const shortcut = SHORTCUTS.find(s => s.key === e.key.toLowerCase() && s.page);
      if (shortcut) {
        e.preventDefault();
        navigate(createPageUrl(shortcut.page));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, showHelp]);

  return (
    <>
      {/* Floating help button */}
      <Button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-8 left-8 z-40 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 p-0 shadow-2xl"
        title="קיצורי דרך (לחץ ?)"
      >
        <Command className="w-6 h-6" />
      </Button>

      {/* Help modal */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowHelp(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl px-4"
            >
              <Card className="bg-gray-900 border-2 border-purple-700 shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Command className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">קיצורי מקלדת</h2>
                        <p className="text-purple-300 text-sm">ניווט מהיר במערכת</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowHelp(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {SHORTCUTS.map((shortcut, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-white">{shortcut.label}</span>
                        <Badge className="bg-purple-900/50 text-purple-200 border-purple-600/50 font-mono text-lg px-3 py-1">
                          {shortcut.key}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                    <p className="text-purple-200 text-sm text-center">
                      💡 לחץ על <Badge className="inline-flex bg-purple-900/50 text-purple-200 mx-1">Esc</Badge> לסגירה
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}