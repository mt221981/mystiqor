import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Info, Sparkles, Award, Heart, Users, Upload, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import EnhancedToast from "@/components/EnhancedToast";
import AnalysisJourney from "@/components/AnalysisJourney";
import OptimizedImage from "@/components/OptimizedImage";
import DigitalCanvas from "@/components/DigitalCanvas";
import { usePageView, useTimeTracking, trackAnalysisComplete } from "@/components/Analytics";
import AnnotatedDrawingViewer from "@/components/AnnotatedDrawingViewer";
import PsychologicalProfileChart from "@/components/PsychologicalProfileChart";
import KoppitzIndicatorsVisualization from "@/components/KoppitzIndicatorsVisualization";
import GraphicFeaturesBreakdown from "@/components/GraphicFeaturesBreakdown";

const DRAWING_TASKS = [
  {
    id: 'person',
    name: 'אדם',
    emoji: '👤',
    description: 'צייר אדם שלם',
    instructions: 'צייר אדם כפי שאתה מדמיין אותו. אל תדאג לאיכות - פשוט צייר מה שעולה לך.',
    color: 'from-blue-600 to-cyan-600',
    duration: '5-10 דקות'
  },
  {
    id: 'tree',
    name: 'עץ',
    emoji: '🌳',
    description: 'צייר עץ כלשהו',
    instructions: 'צייר עץ שאתה אוהב. זה יכול להיות כל עץ - גדול, קטן, עם פירות או בלי.',
    color: 'from-green-600 to-emerald-600',
    duration: '5-10 דקות'
  },
  {
    id: 'house',
    name: 'בית',
    emoji: '🏠',
    description: 'צייר בית',
    instructions: 'צייר בית שאתה רוצה. יכול להיות בית שאתה מכיר או בית מהדמיון.',
    color: 'from-amber-600 to-orange-600',
    duration: '5-10 דקות'
  }
];

const KOPPITZ_RISK_LEVELS = {
  low: { color: 'bg-green-600', text: 'נמוכה', emoji: '✅' },
  moderate: { color: 'bg-yellow-600', text: 'בינונית', emoji: '⚠️' },
  high: { color: 'bg-orange-600', text: 'גבוהה', emoji: '⚠️⚠️' },
  very_high: { color: 'bg-red-600', text: 'גבוהה מאוד', emoji: '🚨' }
};

export default function DrawingAnalysis() {
  const [currentStep, setCurrentStep] = useState('intro');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [userInfo, setUserInfo] = useState({ age: '', gender: '' });
  const [uploadedImages, setUploadedImages] = useState({});
  const [drawingMethod, setDrawingMethod] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  const [drawings, setDrawings] = useState({});
  
  const queryClient = useQueryClient();
  const { incrementUsage } = useSubscription();

  usePageView('DrawingAnalysis');
  useTimeTracking('DrawingAnalysis');

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result;
    }
  });

  const analyzeDrawingMutation = useMutation({
    mutationFn: async ({ imageUrl, drawingType, userAge, userGender, metadata }) => {
      const response = await base44.functions.invoke('processDrawingFeatures', {
        image_url: imageUrl,
        drawing_type: drawingType,
        user_age: parseInt(userAge) || null,
        user_gender: userGender || null,
        drawing_metadata: metadata || null
      });
      return response.data;
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    }
  });

  const handleImageUpload = async (file, taskId, metadata = null) => {
    try {
      const { file_url } = await uploadFileMutation.mutateAsync(file);
      setUploadedImages(prev => ({ ...prev, [taskId]: file_url }));
      
      if (metadata) {
        setDrawings(prev => ({ ...prev, [taskId]: { url: file_url, metadata } }));
      }
      
      EnhancedToast.success('הציור נשמר! ✅');
    } catch (error) {
      EnhancedToast.error('שגיאה בשמירה', error.message);
    }
  };

  const handleStartUserInfo = () => {
    setCurrentStep('user_info');
  };

  const handleUserInfoSubmit = () => {
    if (!userInfo.age || !userInfo.gender) {
      EnhancedToast.error('נא למלא את כל הפרטים');
      return;
    }
    setCurrentStep('drawing');
  };

  const handleChooseMethod = (method) => {
    setDrawingMethod(method);
    if (method === 'digital') {
      setCurrentStep('digital_drawing');
    }
  };

  const handleDigitalDrawingSave = (file, metadata) => {
    handleImageUpload(file, currentTask.id, metadata);
    setCurrentStep('drawing');
    setDrawingMethod(null);
  };

  const handleNextTask = () => {
    setDrawingMethod(null);
    if (currentTaskIndex < DRAWING_TASKS.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleAnalyze();
    }
  };

  const handleSkipTask = () => {
    setDrawingMethod(null);
    if (currentTaskIndex < DRAWING_TASKS.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleAnalyze();
    }
  };

  const handleAnalyze = async () => {
    const uploadedCount = Object.keys(uploadedImages).length;
    
    if (uploadedCount === 0) {
      EnhancedToast.error('נא להעלות לפחות ציור אחד');
      return;
    }

    setIsProcessing(true);
    setAnalysisStartTime(Date.now());
    setCurrentStep('analyzing');

    try {
      const analysisPromises = Object.entries(uploadedImages).map(([taskId, imageUrl]) => {
        const drawingData = drawings[taskId];
        const metadata = drawingData?.metadata || null;
        
        return analyzeDrawingMutation.mutateAsync({
          imageUrl,
          drawingType: taskId,
          userAge: userInfo.age,
          userGender: userInfo.gender,
          metadata: metadata
        });
      });

      const allAnalyses = await Promise.all(analysisPromises);
      const integratedAnalysis = integrateMultipleDrawings(allAnalyses);

      setAnalysisResults(integratedAnalysis);

      const duration = Date.now() - analysisStartTime;
      
      await saveAnalysisMutation.mutateAsync({
        tool_type: 'drawing',
        input_data: {
          drawings: Object.keys(uploadedImages),
          user_age: userInfo.age,
          user_gender: userInfo.gender,
          drawing_method: drawingMethod || 'upload'
        },
        results: integratedAnalysis,
        summary: integratedAnalysis.integrated_interpretation?.personality_snapshot?.summary || 'ניתוח אופי מציורים',
        confidence_score: integratedAnalysis.composite_scores?.overall_confidence || 85,
        processing_time_ms: duration,
        insights_count: (integratedAnalysis.strengths?.length || 0) + (integratedAnalysis.challenges?.length || 0),
        tags: ['drawing_analysis', 'htp', 'projective', ...Object.keys(uploadedImages)]
      });

      await incrementUsage();
      await trackAnalysisComplete('drawing_analysis', Math.floor(duration / 1000), integratedAnalysis.composite_scores?.overall_confidence || 85);

      setCurrentStep('results');

    } catch (error) {
      EnhancedToast.error('שגיאה בניתוח', error.message);
      console.error(error);
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('intro');
    setCurrentTaskIndex(0);
    setUserInfo({ age: '', gender: '' });
    setDrawings({});
    setUploadedImages({});
    setDrawingMethod(null);
    setAnalysisResults(null);
  };

  const currentTask = DRAWING_TASKS[currentTaskIndex];

  if (isProcessing) {
    return <AnalysisJourney isAnalyzing={true} userName="חבר יקר" />;
  }

  return (
    <SubscriptionGuard toolName="ניתוח ציורים">
      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-purple-950 to-rose-900 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            title="גלה את עצמך דרך ציור 🎨"
            description="ניתוח אישיות מקצועי ממה שאתה מצייר"
            icon={Palette}
            iconGradient="from-rose-600 to-pink-600"
          />

          <AnimatePresence mode="wait">
            {/* INTRO */}
            {currentStep === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 mb-6">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">✨</div>
                      <h2 className="text-white text-3xl font-bold mb-4">איך זה עובד?</h2>
                      <p className="text-white text-xl leading-relaxed mb-6">
                        הציור שלך חושף דברים מעניינים על האישיות, הרגשות והחוזקות שלך.<br/>
                        זה פשוט, מהנה ומעניין!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/80 border-purple-700/30 mb-6">
                  <CardContent className="p-8">
                    <h3 className="text-white text-2xl font-bold mb-6 text-center">
                      מה תצטרך לצייר?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {DRAWING_TASKS.map((task) => (
                        <div key={task.id} className={`bg-gradient-to-br ${task.color} rounded-2xl p-6 text-center`}>
                          <div className="text-7xl mb-3">{task.emoji}</div>
                          <h4 className="text-white font-bold text-2xl mb-2">{task.name}</h4>
                          <p className="text-white/90 text-base">{task.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={handleStartUserInfo}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-2xl px-16 py-8"
                      >
                        <Sparkles className="w-7 h-7 ml-3" />
                        בוא נתחיל!
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/30 border-blue-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                      <p className="text-blue-100 text-base leading-relaxed">
                        <strong>טיפ:</strong> אין דרך נכונה או לא נכונה לצייר! 
                        צייר באופן חופשי ללא מחשבות - ככה הניתוח יהיה הכי מדויק 😊
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* USER INFO */}
            {currentStep === 'user_info' && (
              <motion.div
                key="user_info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gray-900/80 border-purple-700/30">
                  <CardHeader>
                    <CardTitle className="text-white text-3xl text-center">קצת עליך</CardTitle>
                    <p className="text-purple-200 text-center text-lg">
                      (עוזר לנו לתת ניתוח מדויק יותר)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-8 max-w-md mx-auto">
                    <div>
                      <Label className="text-white text-2xl mb-3 block text-center">כמה אתה בן?</Label>
                      <Select value={userInfo.age} onValueChange={(value) => setUserInfo({ ...userInfo, age: value })}>
                        <SelectTrigger className="bg-gray-800 text-white border-purple-700 h-16 text-xl">
                          <SelectValue placeholder="בחר גיל..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5-7">5-7</SelectItem>
                          <SelectItem value="8-10">8-10</SelectItem>
                          <SelectItem value="11-13">11-13</SelectItem>
                          <SelectItem value="14-17">14-17</SelectItem>
                          <SelectItem value="18-25">18-25</SelectItem>
                          <SelectItem value="26-35">26-35</SelectItem>
                          <SelectItem value="36-50">36-50</SelectItem>
                          <SelectItem value="51+">51+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white text-2xl mb-3 block text-center">מגדר</Label>
                      <Select value={userInfo.gender} onValueChange={(value) => setUserInfo({ ...userInfo, gender: value })}>
                        <SelectTrigger className="bg-gray-800 text-white border-purple-700 h-16 text-xl">
                          <SelectValue placeholder="בחר..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">זכר</SelectItem>
                          <SelectItem value="female">נקבה</SelectItem>
                          <SelectItem value="other">אחר</SelectItem>
                          <SelectItem value="prefer_not_to_say">מעדיף/ה לא לומר</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleUserInfoSubmit}
                      disabled={!userInfo.age || !userInfo.gender}
                      size="lg"
                      className="w-full bg-purple-600 hover:bg-purple-700 h-16 text-xl"
                    >
                      המשך לציורים →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* DRAWING TASKS */}
            {currentStep === 'drawing' && currentTask && (
              <motion.div
                key={`drawing-${currentTaskIndex}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                {/* Simple Progress */}
                <div className="mb-6">
                  <div className="text-center mb-3">
                    <span className="text-white text-2xl font-bold">
                      ציור {currentTaskIndex + 1} מתוך {DRAWING_TASKS.length}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden max-w-md mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                      style={{ width: `${((currentTaskIndex) / DRAWING_TASKS.length) * 100}%` }}
                    />
                  </div>
                </div>

                <Card className={`bg-gradient-to-br ${currentTask.color} border-0 mb-6`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="text-8xl mb-4">{currentTask.emoji}</div>
                      <h2 className="text-white text-4xl font-bold mb-3">{currentTask.name}</h2>
                      <p className="text-white text-xl">{currentTask.description}</p>
                    </div>

                    {!drawingMethod ? (
                      <div className="space-y-6">
                        <h3 className="text-white font-bold text-2xl text-center">איך תרצה לצייר?</h3>
                        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          <Button
                            onClick={() => handleChooseMethod('digital')}
                            size="lg"
                            className="bg-white text-purple-700 hover:bg-purple-50 h-32 text-xl flex-col gap-3"
                          >
                            <Pencil className="w-12 h-12" />
                            <div>
                              <div className="font-bold text-2xl">צייר כאן</div>
                              <div className="text-sm opacity-80">ציור על המסך</div>
                            </div>
                          </Button>
                          <Button
                            onClick={() => handleChooseMethod('upload')}
                            variant="outline"
                            size="lg"
                            className="border-4 border-white text-white hover:bg-white/10 h-32 text-xl flex-col gap-3"
                          >
                            <Upload className="w-12 h-12" />
                            <div>
                              <div className="font-bold text-2xl">העלה ציור</div>
                              <div className="text-sm opacity-80">צייר על נייר וצלם</div>
                            </div>
                          </Button>
                        </div>

                        {/* Simple Instructions */}
                        <div className="bg-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
                          <p className="text-white text-xl leading-relaxed text-center">
                            {currentTask.instructions}
                          </p>
                        </div>
                      </div>
                    ) : drawingMethod === 'upload' ? (
                      <div className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-white/10 rounded-2xl p-6">
                          <h4 className="text-white font-bold text-xl mb-3 text-center">מה לעשות:</h4>
                          <div className="space-y-3 text-white text-lg">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">1️⃣</span>
                              <span>קח דף נייר ועיפרון</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">2️⃣</span>
                              <span>צייר {currentTask.name} באופן חופשי</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">3️⃣</span>
                              <span>צלם או סרוק את הציור</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">4️⃣</span>
                              <span>העלה אותו למטה</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleImageUpload(file, currentTask.id);
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            onClick={() => document.getElementById('file-upload').click()}
                            size="lg"
                            className="w-full bg-white text-purple-700 hover:bg-purple-50 h-20 text-2xl"
                          >
                            <Upload className="w-8 h-8 ml-3" />
                            לחץ כאן להעלאת הציור
                          </Button>
                        </div>

                        {uploadedImages[currentTask.id] && (
                          <div className="text-center">
                            <OptimizedImage
                              src={uploadedImages[currentTask.id]}
                              alt={currentTask.name}
                              className="w-full max-h-80 object-contain rounded-2xl border-4 border-green-500 mb-4"
                            />
                            <Badge className="bg-green-600 text-white text-xl px-6 py-3">
                              ✅ הציור התקבל!
                            </Badge>
                          </div>
                        )}

                        <Button
                          onClick={() => setDrawingMethod(null)}
                          variant="outline"
                          size="lg"
                          className="w-full border-white/50 text-white text-lg"
                        >
                          ← רוצה לצייר כאן במקום
                        </Button>
                      </div>
                    ) : null}

                    {drawingMethod && (
                      <div className="flex gap-4 mt-8 max-w-2xl mx-auto">
                        <Button
                          onClick={handleSkipTask}
                          variant="outline"
                          size="lg"
                          className="flex-1 border-white/50 text-white hover:bg-white/10 text-xl h-16"
                        >
                          דלג
                        </Button>
                        <Button
                          onClick={handleNextTask}
                          disabled={!uploadedImages[currentTask.id]}
                          size="lg"
                          className="flex-1 bg-white text-purple-700 hover:bg-purple-50 text-xl h-16"
                        >
                          {currentTaskIndex < DRAWING_TASKS.length - 1 ? 'הבא →' : 'סיים ונתח! ✨'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* DIGITAL DRAWING */}
            {currentStep === 'digital_drawing' && currentTask && (
              <motion.div
                key="digital_drawing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="bg-gray-900/80 border-purple-700/30">
                  <CardHeader>
                    <div className="text-center">
                      <div className="text-6xl mb-3">{currentTask.emoji}</div>
                      <CardTitle className="text-white text-3xl">
                        צייר {currentTask.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DigitalCanvas
                      taskName={currentTask.name}
                      taskInstructions={currentTask.instructions}
                      onSave={handleDigitalDrawingSave}
                      onCancel={() => {
                        setCurrentStep('drawing');
                        setDrawingMethod(null);
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* RESULTS - SIMPLIFIED ORDER */}
            {currentStep === 'results' && analysisResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* 1. SUCCESS HEADER */}
                <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0">
                  <CardContent className="p-8 text-center">
                    <div className="text-7xl mb-4">🎉</div>
                    <h2 className="text-white text-4xl font-bold mb-3">
                      הניתוח שלך מוכן!
                    </h2>
                    <p className="text-white text-xl">
                      גילינו דברים מעניינים על האישיות שלך
                    </p>
                  </CardContent>
                </Card>

                {/* 2. THE STORY - MAIN SUMMARY (MOST IMPORTANT!) */}
                {analysisResults.integrated_interpretation?.personality_snapshot && (
                  <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <h3 className="text-white text-3xl font-bold mb-4">
                          💫 מי אתה על פי הציורים שלך
                        </h3>
                      </div>
                      <p className="text-white text-2xl leading-relaxed text-center mb-6">
                        {analysisResults.integrated_interpretation.personality_snapshot.summary}
                      </p>
                      {analysisResults.integrated_interpretation.personality_snapshot.dominant_themes && (
                        <div className="flex flex-wrap justify-center gap-3">
                          {analysisResults.integrated_interpretation.personality_snapshot.dominant_themes.map((theme, idx) => (
                            <Badge key={idx} className="bg-white/20 text-white text-lg px-4 py-2">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 3. YOUR STRENGTHS (POSITIVE FIRST!) */}
                {analysisResults.strengths && analysisResults.strengths.length > 0 && (
                  <Card className="bg-gradient-to-r from-green-700 to-emerald-700 border-0">
                    <CardContent className="p-8">
                      <h3 className="text-white text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                        <span className="text-5xl">💪</span>
                        הכוחות שלך
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysisResults.strengths.map((strength, idx) => (
                          <div key={idx} className="bg-white/10 rounded-2xl p-6">
                            <h4 className="text-white font-bold text-xl mb-3 flex items-start gap-2">
                              <span className="text-2xl">✓</span>
                              {strength.strength}
                            </h4>
                            <p className="text-green-100 text-base leading-relaxed mb-3">
                              {strength.evidence}
                            </p>
                            <div className="bg-emerald-900/40 rounded-xl p-3">
                              <p className="text-emerald-100 text-sm">
                                <strong>💡 טיפ:</strong> {strength.how_to_leverage}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 4. AREAS TO GROW (POSITIVE FRAMING!) */}
                {analysisResults.challenges && analysisResults.challenges.length > 0 && (
                  <Card className="bg-gradient-to-r from-amber-600 to-orange-600 border-0">
                    <CardContent className="p-8">
                      <h3 className="text-white text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                        <span className="text-5xl">🌱</span>
                        תחומים לצמיחה
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysisResults.challenges.map((challenge, idx) => (
                          <div key={idx} className="bg-white/10 rounded-2xl p-6">
                            <h4 className="text-white font-bold text-xl mb-3">
                              {challenge.challenge}
                            </h4>
                            <p className="text-orange-100 text-base leading-relaxed mb-3">
                              {challenge.manifestation}
                            </p>
                            <div className="bg-green-900/40 rounded-xl p-3">
                              <p className="text-green-100 text-sm">
                                <strong>💡 מה אפשר לעשות:</strong> {challenge.suggestions}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 5. WANT TO UNDERSTAND MORE? */}
                <Card className="bg-gray-900/80 border-purple-700/30">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <h3 className="text-white text-3xl font-bold mb-4">
                        רוצה להבין יותר? 🔍
                      </h3>
                      <p className="text-purple-200 text-xl mb-6">
                        לחץ על הכפתורים למטה כדי לראות פירוט מעמיק
                      </p>
                      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        <Button
                          onClick={() => {
                            document.getElementById('annotated-drawing')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 h-24 text-lg flex-col gap-2"
                        >
                          <span className="text-3xl">🔍</span>
                          <span>הציור עם הסברים</span>
                        </Button>
                        <Button
                          onClick={() => {
                            document.getElementById('profile-chart')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          size="lg"
                          className="bg-purple-600 hover:bg-purple-700 h-24 text-lg flex-col gap-2"
                        >
                          <span className="text-3xl">📊</span>
                          <span>הפרופיל המלא</span>
                        </Button>
                        <Button
                          onClick={() => {
                            document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          size="lg"
                          className="bg-pink-600 hover:bg-pink-700 h-24 text-lg flex-col gap-2"
                        >
                          <span className="text-3xl">💡</span>
                          <span>המלצות</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 6. ANNOTATED DRAWING */}
                <div id="annotated-drawing">
                  {Object.keys(uploadedImages).length > 0 && (
                    <AnnotatedDrawingViewer
                      imageUrl={Object.values(uploadedImages)[0]}
                      analysisResults={analysisResults}
                      drawingType={Object.keys(uploadedImages)[0]}
                    />
                  )}
                </div>

                {/* 7. PSYCHOLOGICAL PROFILE */}
                <div id="profile-chart">
                  {analysisResults.psychological_profile && (
                    <PsychologicalProfileChart 
                      psychologicalProfile={analysisResults.psychological_profile}
                    />
                  )}
                </div>

                {/* 8. GRAPHIC FEATURES (OPTIONAL) */}
                {analysisResults.graphic_features && (
                  <GraphicFeaturesBreakdown 
                    graphicFeatures={analysisResults.graphic_features}
                  />
                )}

                {/* 9. KOPPITZ (IF RELEVANT) */}
                {analysisResults.koppitz_indicators && analysisResults.koppitz_indicators.total_indicators > 0 && (
                  <KoppitzIndicatorsVisualization 
                    koppitzData={analysisResults.koppitz_indicators}
                  />
                )}

                {/* 10. DETAILED INTERPRETATIONS */}
                {analysisResults.integrated_interpretation && (
                  <div className="space-y-4">
                    {analysisResults.integrated_interpretation.self_image && (
                      <Card className="bg-purple-900/40 border-purple-700/40">
                        <CardContent className="p-6">
                          <h4 className="text-purple-200 font-bold text-2xl mb-3 flex items-center gap-2">
                            <Award className="w-7 h-7" />
                            איך אתה רואה את עצמך
                          </h4>
                          <p className="text-purple-100 text-lg leading-relaxed">
                            {analysisResults.integrated_interpretation.self_image}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {analysisResults.integrated_interpretation.interpersonal_relationships && (
                      <Card className="bg-pink-900/40 border-pink-700/40">
                        <CardContent className="p-6">
                          <h4 className="text-pink-200 font-bold text-2xl mb-3 flex items-center gap-2">
                            <Users className="w-7 h-7" />
                            איך אתה עם אנשים
                          </h4>
                          <p className="text-pink-100 text-lg leading-relaxed">
                            {analysisResults.integrated_interpretation.interpersonal_relationships}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {analysisResults.integrated_interpretation.emotional_state && (
                      <Card className="bg-blue-900/40 border-blue-700/40">
                        <CardContent className="p-6">
                          <h4 className="text-blue-200 font-bold text-2xl mb-3 flex items-center gap-2">
                            <Heart className="w-7 h-7" />
                            המצב הרגשי שלך
                          </h4>
                          <p className="text-blue-100 text-lg leading-relaxed">
                            {analysisResults.integrated_interpretation.emotional_state}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* 11. RECOMMENDATIONS */}
                <div id="recommendations">
                  {analysisResults.recommendations && (
                    <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0">
                      <CardContent className="p-8">
                        <h3 className="text-white text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                          <Sparkles className="w-8 h-8" />
                          המלצות בשבילך
                        </h3>
                        {analysisResults.recommendations.personal_growth && (
                          <div className="space-y-3">
                            {analysisResults.recommendations.personal_growth.map((rec, idx) => (
                              <div key={idx} className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                                <span className="text-white text-2xl font-bold">{idx + 1}</span>
                                <span className="text-white text-lg leading-relaxed flex-1">{rec}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* 12. SIMPLE NOTE */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-gray-400 shrink-0 mt-1" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <strong>שים לב:</strong> זהו ניתוח מקצועי המבוסס על מחקר פסיכולוגי, 
                        אך הוא לא מחליף שיחה עם פסיכולוג. אם אתה מרגיש קשיים - מומלץ לפנות למומחה.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 13. RESET */}
                <div className="text-center pt-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="border-purple-500 text-purple-300 hover:bg-purple-900/30 px-12 py-6 text-xl"
                  >
                    <Palette className="w-6 h-6 ml-2" />
                    צייר ציורים חדשים
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SubscriptionGuard>
  );
}

// Helper to integrate multiple drawings
function integrateMultipleDrawings(analyses) {
  if (analyses.length === 1) {
    return analyses[0].analysis;
  }

  const combined = {
    ...analyses[0].analysis,
    composite_scores: {
      overall_confidence: Math.round(
        analyses.reduce((acc, a) => acc + (a.analysis.analysis_quality?.overall_confidence || 0.85), 0) / analyses.length * 100
      )
    },
    integrated_interpretation: {
      personality_snapshot: {
        summary: `${analyses[0].analysis.integrated_interpretation?.personality_snapshot?.summary || ''}`,
        dominant_themes: Array.from(new Set(
          analyses.flatMap(a => a.analysis.integrated_interpretation?.personality_snapshot?.dominant_themes || [])
        ))
      },
      self_image: analyses[0].analysis.integrated_interpretation?.self_image,
      interpersonal_relationships: analyses[0].analysis.integrated_interpretation?.interpersonal_relationships,
      emotional_state: analyses[0].analysis.integrated_interpretation?.emotional_state,
      coping_mechanisms: analyses[0].analysis.integrated_interpretation?.coping_mechanisms
    },
    koppitz_indicators: analyses[0].analysis.koppitz_indicators,
    strengths: Array.from(new Set(
      analyses.flatMap(a => a.analysis.strengths || [])
    )).slice(0, 6),
    challenges: Array.from(new Set(
      analyses.flatMap(a => a.analysis.challenges || [])
    )).slice(0, 6),
    recommendations: analyses[0].analysis.recommendations,
    authenticity_assessment: analyses[0].analysis.authenticity_assessment,
    analysis_metadata: {
      ...analyses[0].analysis.analysis_metadata,
      drawings_analyzed: analyses.length
    },
    graphic_features: analyses[0].analysis.graphic_features,
    content_analysis: analyses[0].analysis.content_analysis,
    psychological_profile: analyses[0].analysis.psychological_profile
  };

  return combined;
}