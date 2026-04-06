import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Upload, Sparkles, Loader2, MessageCircle, X, 
  TrendingUp, Target, Lightbulb, AlertCircle, CheckCircle, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import { usePageView, useTimeTracking } from "@/components/Analytics";

export default function DocumentAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [analysisType, setAnalysisType] = useState('general');
  const [userQuestion, setUserQuestion] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [previousAnalyses, setPreviousAnalyses] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  usePageView('DocumentAnalyzer');
  useTimeTracking('DocumentAnalyzer');

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result;
    }
  });

  const analyzeDocumentMutation = useMutation({
    mutationFn: async ({ file_url, user_question, analysis_type, previous_context }) => {
      const result = await base44.functions.invoke('analyzeDocument', {
        file_url,
        user_question,
        analysis_type,
        previous_context
      });
      return result.data;
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      EnhancedToast.error('סוג קובץ לא נתמך', 'נא להעלות PDF, תמונה או קובץ טקסט');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      EnhancedToast.error('הקובץ גדול מדי', 'הגודל המקסימלי הוא 10MB');
      return;
    }

    setUploadedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    EnhancedToast.success('קובץ נבחר! 📄', file.name);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      EnhancedToast.error('נא לבחור קובץ תחילה');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Step 1: Upload file
      EnhancedToast.info('מעלה קובץ...', '⏳');
      const { file_url } = await uploadFileMutation.mutateAsync(uploadedFile);
      
      // Step 2: Analyze document
      EnhancedToast.info('מנתח מסמך...', 'זה ייקח רגע 🤖');
      const result = await analyzeDocumentMutation.mutateAsync({
        file_url,
        user_question: userQuestion,
        analysis_type: analysisType,
        previous_context: previousAnalyses
      });

      if (result.success) {
        setAnalysisResult(result);
        setPreviousAnalyses([...previousAnalyses, {
          file_name: uploadedFile.name,
          file_url: file_url,
          summary: result.analysis.summary,
          analyzed_at: new Date().toISOString()
        }]);
        EnhancedToast.success('הניתוח הושלם! ✨', 'גלול למטה לראות תוצאות');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      EnhancedToast.error('שגיאה בניתוח', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setUserQuestion('');
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getImportanceBadgeColor = (importance) => {
    if (importance >= 8) return 'bg-red-600';
    if (importance >= 6) return 'bg-orange-600';
    if (importance >= 4) return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  const getFrequencyBadgeColor = (frequency) => {
    if (frequency === 'high') return 'bg-red-600';
    if (frequency === 'medium') return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  const getPriorityBadgeColor = (priority) => {
    if (priority === 'high') return 'bg-red-600';
    if (priority === 'medium') return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="מנתח מסמכים חכם"
          description="העלה דוחות, מפות לידה או ניתוחים - אקרא ואנתח בשבילך"
          icon={FileText}
          iconGradient="from-indigo-600 to-purple-600"
        />

        {/* Info Card */}
        <Card className="bg-indigo-900/50 backdrop-blur-xl border-indigo-700/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-indigo-300 shrink-0 mt-1" />
              <div>
                <h3 className="text-indigo-200 font-bold text-lg mb-2">איך זה עובד?</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-2">
                  העלה מסמך (PDF, תמונה או טקסט) של דוח נומרולוגי, מפת לידה, ניתוח גרפולוגי או כל מסמך מיסטי אחר. 
                  הבינה המלאכותית שלי תקרא את המסמך, תסכם אותו, תזהה תובנות מרכזיות ותענה על שאלות שלך.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-green-600/30 text-green-200">PDF</Badge>
                  <Badge className="bg-blue-600/30 text-blue-200">תמונות</Badge>
                  <Badge className="bg-purple-600/30 text-purple-200">קבצי טקסט</Badge>
                  <Badge className="bg-yellow-600/30 text-yellow-200">עד 10MB</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        {!analysisResult && (
          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-2xl">העלה מסמך לניתוח</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!uploadedFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-purple-600 rounded-xl bg-purple-900/20 hover:bg-purple-900/40 transition-all flex flex-col items-center justify-center gap-4"
                  >
                    <Upload className="w-12 h-12 text-purple-400" />
                    <div className="text-center">
                      <p className="text-white text-lg font-bold">לחץ להעלאת קובץ</p>
                      <p className="text-purple-300 text-sm">PDF, תמונה או טקסט - עד 10MB</p>
                    </div>
                  </button>
                ) : (
                  <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{uploadedFile.name}</p>
                          <p className="text-purple-300 text-sm">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleReset}
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-900/30"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    {filePreview && (
                      <div className="mt-4">
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="max-h-64 w-full object-contain rounded-lg border border-purple-700/50"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Analysis Type */}
              <div>
                <label className="text-white font-bold mb-2 block">סוג הניתוח</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger className="bg-gray-800 border-purple-600/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">כללי - סיכום מלא</SelectItem>
                    <SelectItem value="numerology">נומרולוגיה</SelectItem>
                    <SelectItem value="astrology">אסטרולוגיה</SelectItem>
                    <SelectItem value="graphology">גרפולוגיה</SelectItem>
                    <SelectItem value="palmistry">כף יד</SelectItem>
                    <SelectItem value="tarot">טארוט</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User Question */}
              <div>
                <label className="text-white font-bold mb-2 block flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  יש לך שאלה ספציפית? (אופציונלי)
                </label>
                <Textarea
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="למשל: מה המסמך אומר על הקריירה שלי? האם יש קשר בין מספר המסלול למזל השמש?"
                  className="bg-gray-800 border-purple-600/50 text-white h-24"
                  dir="rtl"
                />
              </div>

              {/* Previous Analyses Info */}
              {previousAnalyses.length > 0 && (
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/30">
                  <p className="text-blue-200 text-sm mb-2">
                    📚 יש לך {previousAnalyses.length} מסמכים קודמים - אזכור אותם בניתוח
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {previousAnalyses.map((doc, idx) => (
                      <Badge key={idx} className="bg-blue-600/30 text-blue-200">
                        {doc.file_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={!uploadedFile || isAnalyzing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-14 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    מנתח מסמך...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 ml-2" />
                    נתח את המסמך
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary */}
              <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-700/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-2xl flex items-center gap-3">
                      <FileText className="w-8 h-8 text-indigo-400" />
                      סיכום המסמך
                    </CardTitle>
                    <Badge className="bg-indigo-600">
                      {analysisResult.analysis.document_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-indigo-800/30 rounded-lg p-6">
                    <p className="text-white text-lg leading-relaxed">
                      {analysisResult.analysis.summary}
                    </p>
                  </div>
                  
                  {analysisResult.analysis.confidence_score && (
                    <div className="mt-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-semibold">
                        רמת ביטחון: {analysisResult.analysis.confidence_score}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Direct Answer (if question was asked) */}
              {analysisResult.analysis.direct_answer && (
                <Card className="bg-green-900/50 border-green-700/30">
                  <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center gap-3">
                      <MessageCircle className="w-6 h-6 text-green-400" />
                      תשובה לשאלתך
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-800/30 rounded-lg p-6">
                      <p className="text-white text-lg leading-relaxed">
                        {analysisResult.analysis.direct_answer}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Insights */}
              {analysisResult.analysis.key_insights && (
                <div>
                  <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-3">
                    <Lightbulb className="w-8 h-8 text-yellow-400" />
                    תובנות מרכזיות
                  </h2>
                  <div className="grid gap-4">
                    {analysisResult.analysis.key_insights.map((insight, idx) => (
                      <Card key={idx} className="bg-gray-900/80 border-yellow-700/30">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-yellow-200 font-bold text-xl">
                              {idx + 1}. {insight.title}
                            </h3>
                            <Badge className={`${getImportanceBadgeColor(insight.importance)} text-white`}>
                              {insight.importance}/10
                            </Badge>
                          </div>
                          <p className="text-white leading-relaxed">
                            {insight.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Recurring Themes */}
              {analysisResult.analysis.recurring_themes && (
                <Card className="bg-purple-900/50 border-purple-700/30">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-purple-400" />
                      נושאים חוזרים
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.analysis.recurring_themes.map((theme, idx) => (
                        <div key={idx} className="bg-purple-800/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-purple-200 font-bold text-lg">
                              {theme.theme}
                            </h4>
                            <Badge className={`${getFrequencyBadgeColor(theme.frequency)} text-white`}>
                              {theme.frequency === 'high' ? 'גבוה' : theme.frequency === 'medium' ? 'בינוני' : 'נמוך'}
                            </Badge>
                          </div>
                          <p className="text-purple-100">
                            {theme.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Connections */}
              {analysisResult.analysis.connections && analysisResult.analysis.connections.length > 0 && (
                <Card className="bg-blue-900/50 border-blue-700/30">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center gap-3">
                      <Target className="w-8 h-8 text-blue-400" />
                      קשרים ומתאמים
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.analysis.connections.map((connection, idx) => (
                        <div key={idx} className="bg-blue-800/30 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {connection.elements.map((elem, i) => (
                              <Badge key={i} className="bg-blue-600 text-white">
                                {elem}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-blue-200 font-semibold mb-2">
                            {connection.relationship}
                          </p>
                          <p className="text-blue-100">
                            {connection.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actionable Recommendations */}
              {analysisResult.analysis.actionable_recommendations && (
                <Card className="bg-green-900/50 border-green-700/30">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center gap-3">
                      <Target className="w-8 h-8 text-green-400" />
                      המלצות מעשיות
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.analysis.actionable_recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-green-800/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-green-200 font-bold flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              {rec.recommendation}
                            </h4>
                            <Badge className={`${getPriorityBadgeColor(rec.priority)} text-white`}>
                              {rec.priority === 'high' ? 'גבוה' : rec.priority === 'medium' ? 'בינוני' : 'נמוך'}
                            </Badge>
                          </div>
                          <p className="text-green-100 text-sm">
                            {rec.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Missing Information */}
              {analysisResult.analysis.missing_information && analysisResult.analysis.missing_information.length > 0 && (
                <Card className="bg-orange-900/50 border-orange-700/30">
                  <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-orange-400" />
                      מידע חסר
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.analysis.missing_information.map((info, idx) => (
                        <li key={idx} className="text-orange-100 flex items-start gap-2">
                          <span className="text-orange-400 mt-1">•</span>
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleReset}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Upload className="w-5 h-5 ml-2" />
                  נתח מסמך נוסף
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="bg-gray-900 border-purple-700 p-8 max-w-md">
              <CardContent className="text-center">
                <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
                <h3 className="text-white text-2xl font-bold mb-2">מנתח את המסמך...</h3>
                <p className="text-purple-300">
                  קורא את התוכן, מזהה תובנות ומכין את הניתוח המלא 🤖
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}