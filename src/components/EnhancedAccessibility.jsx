import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accessibility, 
  ZoomIn, 
  ZoomOut, 
  Type,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Settings,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced Accessibility Manager
 * מנהל נגישות מתקדם עם font scaling, high contrast, focus indicators
 */

export default function EnhancedAccessibility() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('a11y-font-size');
    const savedHighContrast = localStorage.getItem('a11y-high-contrast') === 'true';
    const savedFocusMode = localStorage.getItem('a11y-focus-mode') === 'true';
    const savedReducedMotion = localStorage.getItem('a11y-reduced-motion') === 'true';

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast) setHighContrast(true);
    if (savedFocusMode) setFocusMode(true);
    if (savedReducedMotion) setReducedMotion(true);

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !localStorage.getItem('a11y-reduced-motion')) {
      setReducedMotion(true);
    }

    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast && !localStorage.getItem('a11y-high-contrast')) {
      setHighContrast(true);
    }
  }, []);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('a11y-font-size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('a11y-high-contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    // Apply focus mode (enhanced focus indicators)
    if (focusMode) {
      document.documentElement.classList.add('focus-mode');
    } else {
      document.documentElement.classList.remove('focus-mode');
    }
    localStorage.setItem('a11y-focus-mode', focusMode.toString());
  }, [focusMode]);

  useEffect(() => {
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    localStorage.setItem('a11y-reduced-motion', reducedMotion.toString());
  }, [reducedMotion]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 10, 150));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 10, 80));
  };

  const resetFontSize = () => {
    setFontSize(100);
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-2xl z-40"
        aria-label="הגדרות נגישות"
        title="הגדרות נגישות"
      >
        <Accessibility className="w-6 h-6 text-white" />
      </Button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-80 md:w-96 z-50"
            >
              <Card className="h-full bg-gradient-to-b from-gray-900 to-gray-950 border-l-2 border-blue-500/50 rounded-none overflow-y-auto">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                        <Accessibility className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-white font-bold text-xl">נגישות</h2>
                    </div>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Font Size Control */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Type className="w-5 h-5 text-blue-400" />
                      <h3 className="text-white font-semibold">גודל טקסט</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={decreaseFontSize}
                        variant="outline"
                        size="icon"
                        className="border-gray-700 hover:bg-gray-800"
                        disabled={fontSize <= 80}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="text-white font-bold text-lg">{fontSize}%</div>
                        <Button
                          onClick={resetFontSize}
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          אפס
                        </Button>
                      </div>
                      <Button
                        onClick={increaseFontSize}
                        variant="outline"
                        size="icon"
                        className="border-gray-700 hover:bg-gray-800"
                        disabled={fontSize >= 150}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* High Contrast */}
                  <div className="mb-6">
                    <Button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`w-full justify-start gap-3 ${
                        highContrast 
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {highContrast ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      <div className="flex-1 text-right">
                        <div className="font-semibold">ניגודיות גבוהה</div>
                        <div className="text-xs opacity-80">
                          {highContrast ? 'מופעל' : 'כבוי'}
                        </div>
                      </div>
                    </Button>
                  </div>

                  {/* Focus Mode */}
                  <div className="mb-6">
                    <Button
                      onClick={() => setFocusMode(!focusMode)}
                      className={`w-full justify-start gap-3 ${
                        focusMode 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {focusMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      <div className="flex-1 text-right">
                        <div className="font-semibold">מצב מיקוד משופר</div>
                        <div className="text-xs opacity-80">
                          {focusMode ? 'מופעל' : 'כבוי'}
                        </div>
                      </div>
                    </Button>
                  </div>

                  {/* Reduced Motion */}
                  <div className="mb-6">
                    <Button
                      onClick={() => setReducedMotion(!reducedMotion)}
                      className={`w-full justify-start gap-3 ${
                        reducedMotion 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <div className="flex-1 text-right">
                        <div className="font-semibold">הפחת תנועה</div>
                        <div className="text-xs opacity-80">
                          {reducedMotion ? 'מופעל' : 'כבוי'}
                        </div>
                      </div>
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-sm text-blue-300">
                    <p className="mb-2">
                      ההגדרות נשמרות אוטומטית ויישמרו גם בפעם הבאה שתבקר
                    </p>
                    <p className="text-xs opacity-75">
                      השתמש ב-Tab כדי לנווט בין אלמנטים
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Styles */}
      <style>{`
        /* High Contrast Mode */
        .high-contrast {
          filter: contrast(1.2);
        }

        .high-contrast * {
          border-color: currentColor !important;
        }

        /* Focus Mode - Enhanced Focus Indicators */
        .focus-mode *:focus {
          outline: 3px solid #3B82F6 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
        }

        /* Reduced Motion */
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        /* Skip to main content link */
        .skip-to-main {
          position: absolute;
          left: -9999px;
          z-index: 999;
          padding: 1em;
          background-color: #000;
          color: #fff;
          text-decoration: none;
        }

        .skip-to-main:focus {
          left: 50%;
          transform: translateX(-50%);
          top: 0;
        }
      `}</style>

      {/* Skip to main content link */}
      <a href="#main-content" className="skip-to-main">
        דלג לתוכן הראשי
      </a>
    </>
  );
}