import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Trash2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "./EnhancedToast";

export default function SavedInsights() {
  const [savedInsights, setSavedInsights] = useState([]);

  useEffect(() => {
    loadSavedInsights();
  }, []);

  const loadSavedInsights = () => {
    const saved = localStorage.getItem('saved_graphology_insights');
    if (saved) {
      setSavedInsights(JSON.parse(saved));
    }
  };

  const removeInsight = (index) => {
    const updated = savedInsights.filter((_, i) => i !== index);
    setSavedInsights(updated);
    localStorage.setItem('saved_graphology_insights', JSON.stringify(updated));
    EnhancedToast.success('התובנה הוסרה', '🗑️');
  };

  const exportInsights = async () => {
    try {
      const content = savedInsights.map((item, idx) => ({
        heading: `תובנה ${idx + 1}: ${item.insight.title}`,
        text: item.insight.content
      }));

      const response = await base44.functions.invoke('generatePDF', {
        title: "התובנות השמורות שלי",
        subtitle: `${savedInsights.length} תובנות`,
        content
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saved-insights-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      EnhancedToast.success('PDF הורד בהצלחה!', '📄');
    } catch (error) {
      EnhancedToast.error('שגיאה בייצוא', error.message);
    }
  };

  if (savedInsights.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-700/30">
        <CardContent className="p-12 text-center">
          <BookmarkCheck className="w-24 h-24 text-gray-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">
            אין תובנות שמורות
          </h3>
          <p className="text-gray-400 text-lg">
            לחץ על הכוכב ליד תובנה כדי לשמור אותה לצפייה מהירה
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookmarkCheck className="w-8 h-8 text-yellow-400" />
          <h2 className="text-3xl font-bold text-white">תובנות שמורות ({savedInsights.length})</h2>
        </div>
        <Button
          onClick={exportInsights}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-5 h-5 ml-2" />
          ייצא ל-PDF
        </Button>
      </div>

      <AnimatePresence>
        {savedInsights.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-gradient-to-br from-gray-900/80 to-purple-900/60 backdrop-blur-xl border-purple-700/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-yellow-600 text-white">
                        ⭐ שמור
                      </Badge>
                      {item.insight.insight_type && (
                        <Badge className="bg-purple-700 text-white">
                          {item.insight.insight_type}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {item.insight.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      נשמר ב: {new Date(item.savedAt).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeInsight(idx)}
                    className="border-red-600 text-red-400 hover:bg-red-900/30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>

                <div className="bg-purple-900/30 rounded-xl p-6">
                  <p className="text-white leading-relaxed whitespace-pre-wrap">
                    {item.insight.content}
                  </p>
                </div>

                {item.insight.provenance?.sources && (
                  <div className="mt-4">
                    <p className="text-purple-300 text-sm font-semibold mb-2">📚 מקורות:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.insight.provenance.sources.slice(0, 3).map((source, i) => (
                        <Badge key={i} variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-600/50 text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function BookmarkButton({ insight, analysisId }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [insight]);

  const checkIfSaved = () => {
    const saved = localStorage.getItem('saved_graphology_insights');
    if (saved) {
      const insights = JSON.parse(saved);
      const exists = insights.some(item => 
        item.insight.title === insight.title && 
        item.analysisId === analysisId
      );
      setIsSaved(exists);
    }
  };

  const toggleSave = () => {
    const saved = localStorage.getItem('saved_graphology_insights');
    let insights = saved ? JSON.parse(saved) : [];

    if (isSaved) {
      insights = insights.filter(item => 
        !(item.insight.title === insight.title && item.analysisId === analysisId)
      );
      EnhancedToast.info('התובנה הוסרה מהשמורים', '🔖');
    } else {
      insights.push({
        insight,
        analysisId,
        savedAt: new Date().toISOString()
      });
      EnhancedToast.success('התובנה נשמרה!', '⭐');
    }

    localStorage.setItem('saved_graphology_insights', JSON.stringify(insights));
    setIsSaved(!isSaved);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleSave}
      className={isSaved ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-400'}
      title={isSaved ? 'הסר מהשמורים' : 'שמור תובנה'}
    >
      {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
    </Button>
  );
}