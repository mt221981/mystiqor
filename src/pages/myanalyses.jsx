import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Hash, Hand, PenTool, Stars, Layers, HelpCircle, Palette, Sparkles, Calendar as CalendarIcon, TrendingUp, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import EnhancedEmptyState from "@/components/EnhancedEmptyState";
import OptimizedImage from "@/components/OptimizedImage";
import AnalysisTimeline from "@/components/AnalysisTimeline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Helper function to safely extract string from any value
function safeString(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    // Try to extract meaningful text from object
    if (value.text) return safeString(value.text);
    if (value.content) return safeString(value.content);
    if (value.summary) return safeString(value.summary);
    if (value.synthesis) return safeString(value.synthesis);
    if (value.message) return safeString(value.message);
    if (value.description) return safeString(value.description);
    // If it's an array, join it
    if (Array.isArray(value)) {
      return value.map(v => safeString(v)).filter(Boolean).join(', ');
    }
    // Last resort - don't render complex objects
    return '';
  }
  return String(value);
}

// Extract meaningful summary from analysis results
function extractSummary(results) {
  if (!results) return '';
  
  // Try various possible summary fields
  const possibleSummaries = [
    results.synthesis,
    results.interpretation?.synthesis,
    results.overall_summary,
    results.personality_snapshot?.summary,
    results.combined_message,
    results.main_theme,
    results.overall_message,
    results.summary
  ];
  
  for (const summary of possibleSummaries) {
    const text = safeString(summary);
    if (text && text.length > 10) {
      return text;
    }
  }
  
  return '';
}

export default function MyAnalyses() {
  const [selectedTool, setSelectedTool] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [minConfidence, setMinConfidence] = useState(0);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 200),
    staleTime: 30000
  });

  const toolLabels = {
    numerology: "נומרולוגיה",
    astrology: "אסטרולוגיה",
    palmistry: "קריאת כף יד",
    graphology: "גרפולוגיה",
    tarot: "קלפי טארוט",
    drawing: "ניתוח ציור",
    question: "שאל שאלה",
    combined: "ניתוח משולב"
  };

  const toolIcons = {
    numerology: Hash,
    astrology: Stars,
    palmistry: Hand,
    graphology: PenTool,
    tarot: Layers,
    drawing: Palette,
    question: HelpCircle,
    combined: Sparkles
  };

  const toolColors = {
    numerology: "from-purple-600 to-pink-600",
    astrology: "from-indigo-600 to-purple-600",
    palmistry: "from-blue-600 to-cyan-600",
    graphology: "from-green-600 to-teal-600",
    tarot: "from-amber-600 to-orange-600",
    drawing: "from-rose-600 to-pink-600",
    question: "from-violet-600 to-purple-600",
    combined: "from-purple-600 via-pink-600 to-purple-600"
  };

  const filteredAnalyses = useMemo(() => {
    let filtered = analyses;

    if (selectedTool !== "all") {
      filtered = filtered.filter(a => a.tool_type === selectedTool);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => {
        const summaryText = safeString(a.summary);
        const toolText = toolLabels[a.tool_type]?.toLowerCase() || '';
        const resultsText = extractSummary(a.results).toLowerCase();
        
        return summaryText.toLowerCase().includes(query) ||
               toolText.includes(query) ||
               resultsText.includes(query);
      });
    }

    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filtered = filtered.filter(a => new Date(a.created_date) >= fromDate);
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => new Date(a.created_date) <= toDate);
    }

    if (minConfidence > 0) {
      filtered = filtered.filter(a => (a.confidence_score || 0) >= minConfidence);
    }

    return filtered;
  }, [analyses, selectedTool, searchQuery, dateRange, minConfidence]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = analyses.filter(a => {
      const date = new Date(a.created_date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const thisWeek = analyses.filter(a => {
      const date = new Date(a.created_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    });
    const avgConfidence = analyses.length > 0 
      ? Math.round(analyses.reduce((acc, a) => acc + (a.confidence_score || 0), 0) / analyses.length)
      : 0;

    return {
      total: analyses.length,
      thisMonth: thisMonth.length,
      thisWeek: thisWeek.length,
      avgConfidence
    };
  }, [analyses]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 p-6 md:p-12 flex items-center justify-center">
        <Card className="bg-purple-900/50 border-purple-700/30">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">טוען את הניתוחים שלך...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="מה ראיתי עד עכשיו"
          description="כל הניתוחים שעשית - במקום אחד"
          icon={History}
          iconGradient="from-purple-600 to-pink-600"
        />

        <Card className="bg-indigo-900/50 border-indigo-700/30 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-indigo-300 text-sm mb-1">סך הכל ניתוחים</p>
                <p className="text-4xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-purple-300 text-sm mb-1">חודש זה</p>
                <p className="text-4xl font-bold text-white">{stats.thisMonth}</p>
              </div>
              <div className="text-center">
                <p className="text-pink-300 text-sm mb-1">שבוע זה</p>
                <p className="text-4xl font-bold text-white">{stats.thisWeek}</p>
              </div>
              <div className="text-center">
                <p className="text-blue-300 text-sm mb-1">ממוצע דיוק</p>
                <p className="text-4xl font-bold text-white">{stats.avgConfidence}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-bold text-lg">סינון ניתוחים</h3>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                onClick={() => setSelectedTool("all")}
                variant={selectedTool === "all" ? "default" : "outline"}
                className={selectedTool === "all" 
                  ? "bg-purple-600 hover:bg-purple-700" 
                  : "border-purple-600 text-purple-300 hover:bg-purple-900/30"
                }
              >
                הכל ({analyses.length})
              </Button>
              {Object.keys(toolLabels).map(tool => {
                const count = analyses.filter(a => a.tool_type === tool).length;
                if (count === 0) return null;
                
                return (
                  <Button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    variant={selectedTool === tool ? "default" : "outline"}
                    className={selectedTool === tool 
                      ? "bg-purple-600 hover:bg-purple-700" 
                      : "border-purple-600 text-purple-300 hover:bg-purple-900/30"
                    }
                  >
                    {toolLabels[tool]} ({count})
                  </Button>
                );
              })}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white text-sm mb-2 block">מתאריך:</Label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="bg-gray-800 text-white border-purple-700"
                />
              </div>
              <div>
                <Label className="text-white text-sm mb-2 block">עד תאריך:</Label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="bg-gray-800 text-white border-purple-700"
                />
              </div>
              <div>
                <Label className="text-white text-sm mb-2 block">ציון דיוק מינימלי: {minConfidence}%</Label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {(dateRange.from || dateRange.to || minConfidence > 0) && (
              <Button
                onClick={() => {
                  setDateRange({ from: "", to: "" });
                  setMinConfidence(0);
                }}
                variant="ghost"
                className="text-purple-300 text-sm mt-4"
              >
                נקה סינונים
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="חפש לפי תוכן, תאריך או סוג ניתוח..."
          />
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            className={viewMode === 'grid' 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'border-purple-600 text-purple-300'
            }
          >
            תצוגת רשת
          </Button>
          <Button
            onClick={() => setViewMode('timeline')}
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            className={viewMode === 'timeline' 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'border-purple-600 text-purple-300'
            }
          >
            <CalendarIcon className="w-4 h-4 ml-2" />
            ציר זמן
          </Button>
        </div>

        {filteredAnalyses.length === 0 ? (
          <EnhancedEmptyState
            icon={History}
            title={searchQuery || selectedTool !== 'all' || dateRange.from || dateRange.to || minConfidence > 0 
              ? "לא נמצאו תוצאות" 
              : "עדיין לא עשית ניתוחים"
            }
            description={searchQuery || selectedTool !== 'all' || dateRange.from || dateRange.to || minConfidence > 0
              ? "נסה לשנות את הסינון או החיפוש"
              : "בוא נתחיל את המסע שלך! בחר כלי מהתפריט"
            }
            actionLabel="חזור לדף הבית"
            onAction={() => window.location.href = createPageUrl("Home")}
          />
        ) : viewMode === 'timeline' ? (
          <AnalysisTimeline analyses={filteredAnalyses} />
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {filteredAnalyses.map((analysis, idx) => {
                const ToolIcon = toolIcons[analysis.tool_type] || Sparkles;
                const gradient = toolColors[analysis.tool_type] || "from-purple-600 to-pink-600";
                const summaryText = safeString(analysis.summary) || toolLabels[analysis.tool_type];
                const resultsPreview = extractSummary(analysis.results);
                
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-gradient-to-br from-gray-900/80 to-purple-900/60 backdrop-blur-xl border-purple-700/30 hover:border-purple-500 transition-all hover:scale-[1.01] cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform shrink-0`}>
                            <ToolIcon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                {summaryText}
                              </h3>
                              <Badge className="bg-purple-700 text-white shrink-0">
                                {toolLabels[analysis.tool_type]}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span className="text-purple-300">
                                📅 {new Date(analysis.created_date).toLocaleDateString('he-IL', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              {analysis.confidence_score && (
                                <span className="text-green-300">
                                  ✓ דיוק: {analysis.confidence_score}%
                                </span>
                              )}
                              {analysis.insights_count && (
                                <span className="text-blue-300">
                                  💎 {analysis.insights_count} תובנות
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {analysis.image_url && (
                          <div className="mb-4">
                            <OptimizedImage
                              src={analysis.image_url}
                              alt={`תמונה מניתוח ${toolLabels[analysis.tool_type]}`}
                              className="w-full h-48 object-cover rounded-xl"
                            />
                          </div>
                        )}

                        {resultsPreview && (
                          <div className="space-y-2">
                            <p className="text-purple-200 leading-relaxed line-clamp-3">
                              {resultsPreview}
                            </p>
                          </div>
                        )}

                        {analysis.tags && analysis.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {analysis.tags.slice(0, 5).map((tag, i) => (
                              <Badge key={i} variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-600/50 text-xs">
                                {safeString(tag)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {analyses.length >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <h3 className="text-white text-xl font-bold">המסע שלך</h3>
                </div>
                <p className="text-green-100 leading-relaxed">
                  ביצעת {analyses.length} ניתוחים עד כה! כל ניתוח הוא צעד נוסף בהכרה העצמית שלך. 
                  {stats.thisMonth > 0 && ` החודש הזה ביצעת ${stats.thisMonth} ניתוחים - מרשים! 🌟`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}