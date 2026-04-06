
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, Sparkles, BookOpen, Brain, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ChatMessage from "@/components/AICoach/ChatMessage";
import ChatInput from "@/components/AICoach/ChatInput";
import { usePageView, useTimeTracking, trackFeatureUsage } from "@/components/Analytics";
import PersonalizedLessonCard from "@/components/PersonalizedLessonCard"; // New import

const QUICK_QUESTIONS = [
  { 
    id: 'what_is_this', 
    title: 'מה זה בכלל ניתוח ציורים?', 
    emoji: '🎨',
    prompt: 'הסבר לי בפשטות מה זה ניתוח אישיות מציורים ואיך זה עובד',
    color: 'from-blue-600 to-cyan-600'
  },
  { 
    id: 'line_pressure', 
    title: 'למה חשוב איך אני לוחץ?', 
    emoji: '✏️',
    prompt: 'הסבר לי בפשטות מה לחץ הקו בציור אומר עליי ועל האישיות שלי',
    color: 'from-purple-600 to-pink-600'
  },
  { 
    id: 'shading_meaning', 
    title: 'מה עם הצללות?', 
    emoji: '🌑',
    prompt: 'למה הצללות בציור חשובות ומה הן אומרות? תסביר בפשטות',
    color: 'from-gray-700 to-gray-900'
  },
  { 
    id: 'my_analysis', 
    title: 'מה מצאתם בציור שלי?', 
    emoji: '🔍',
    prompt: 'תן לי סיכום פשוט וברור של מה שמצאת בניתוח הציור שלי - מה הדברים החשובים?',
    color: 'from-green-600 to-emerald-600'
  },
  { 
    id: 'what_next', 
    title: 'מה עושים עם המידע?', 
    emoji: '💡',
    prompt: 'איך אני יכול להשתמש בניתוח הזה כדי לשפר את עצמי? תן לי צעדים מעשיים',
    color: 'from-amber-600 to-orange-600'
  },
  { 
    id: 'is_accurate', 
    title: 'זה באמת עובד?', 
    emoji: '🤔',
    prompt: 'איך אני יכול לדעת שהניתוח מדויק? על מה זה מבוסס? תסביר במילים פשוטות',
    color: 'from-indigo-600 to-purple-600'
  }
];

const LEARNING_TOPICS = [
  {
    id: 'basics',
    name: 'הבסיס - מה חשוב לדעת',
    emoji: '🌱',
    color: 'from-green-600 to-emerald-600',
    description: 'למד את היסודות של ניתוח ציורים',
    prompt: 'אני רוצה ללמוד את הבסיס של ניתוח ציורים. תתחיל מההתחלה ותסביר לי את הדברים החשובים ביותר'
  },
  {
    id: 'symbols',
    name: 'סמלים - מה כל דבר אומר',
    emoji: '🏠',
    color: 'from-blue-600 to-indigo-600',
    description: 'הבן מה כל חלק בציור מסמל',
    prompt: 'תסביר לי מה הסמלים השונים בציורים (בית, עץ, אדם) אומרים על האישיות'
  },
  {
    id: 'signs',
    name: 'סימני אזהרה - מה לשים לב',
    emoji: '⚠️',
    color: 'from-orange-600 to-red-600',
    description: 'למד לזהות סימנים חשובים',
    prompt: 'מה הסימנים החשובים שצריך לשים לב אליהם בציור? תסביר בפשטות'
  },
  {
    id: 'my_drawing',
    name: 'הציור שלי - הסבר לי',
    emoji: '🎨',
    color: 'from-purple-600 to-pink-600',
    description: 'קבל הסבר מפורט על הניתוח שלך',
    prompt: 'תעבור איתי על הניתוח של הציור שלי, תסביר כל דבר בפשטות ותענה על שאלות'
  }
];

export default function DrawingTutor() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  usePageView('DrawingTutor');
  useTimeTracking('DrawingTutor');

  // Fetch user's latest drawing analysis
  const { data: latestAnalysis } = useQuery({
    queryKey: ['latestDrawingAnalysis'],
    queryFn: async () => {
      const analyses = await base44.entities.Analysis.filter(
        { tool_type: 'drawing' },
        '-created_date',
        1
      );
      return analyses[0] || null;
    }
  });

  // Analyze the latest analysis to generate personalized suggestions
  const personalizedSuggestions = latestAnalysis ? generatePersonalizedSuggestions(latestAnalysis) : [];

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['drawingTutorConversations'],
    queryFn: async () => {
      const convs = await base44.agents.listConversations({
        agent_name: 'drawing_tutor'
      });
      return convs || [];
    }
  });

  // Fetch current conversation
  const { data: currentConversation } = useQuery({
    queryKey: ['drawingTutorConversation', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return null;
      return await base44.agents.getConversation(currentConversationId);
    },
    enabled: !!currentConversationId
  });

  const messages = currentConversation?.messages || [];

  // Subscribe to conversation updates
  useEffect(() => {
    if (!currentConversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(currentConversationId, (data) => {
      queryClient.setQueryData(['drawingTutorConversation', currentConversationId], data);
    });

    return () => unsubscribe();
  }, [currentConversationId, queryClient]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create conversation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const conversation = await base44.agents.createConversation({
        agent_name: 'drawing_tutor',
        metadata: {
          name: `שיחה ${conversations.length + 1}`,
          created_at: new Date().toISOString()
        }
      });
      return conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['drawingTutorConversations'] });
      setCurrentConversationId(conversation.id);
      setShowWelcome(false);
      trackFeatureUsage('drawing_tutor_conversation_created');
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }) => {
      setIsProcessing(true);
      await base44.agents.addMessage(currentConversation, {
        role: 'user',
        content: message
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const handleSendMessage = async (message) => {
    if (!currentConversationId) {
      const conversation = await createConversationMutation.mutateAsync();
      setTimeout(() => {
        sendMessageMutation.mutate({ message });
      }, 500);
    } else {
      await sendMessageMutation.mutateAsync({ message });
    }
  };

  const handleQuickQuestion = (question) => {
    setShowWelcome(false);
    handleSendMessage(question.prompt);
    trackFeatureUsage('drawing_tutor_quick_question', { question: question.id });
  };

  const handleLearningTopic = (topic) => {
    setShowWelcome(false);
    handleSendMessage(topic.prompt);
    trackFeatureUsage('drawing_tutor_learning_topic', { topic: topic.id });
  };

  const handlePersonalizedSuggestion = (suggestion) => {
    setShowWelcome(false);
    handleSendMessage(suggestion.prompt);
    trackFeatureUsage('drawing_tutor_personalized_suggestion', { suggestion: suggestion.id });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-purple-950 to-rose-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="המורה שלך לניתוח ציורים 🎨"
          description="שאל שאלות, למד מושגים, והבן את הניתוח שלך"
          icon={Brain}
          iconGradient="from-rose-600 to-pink-600"
        />

        {/* Welcome & Quick Start */}
        {showWelcome && !currentConversationId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-6"
          >
            {/* Hero Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-white text-3xl font-bold mb-3">שלום! אני המורה שלך</h2>
                <p className="text-white text-xl leading-relaxed">
                  יש לך שאלות על הניתוח? רוצה להבין משהו?<br/>
                  אני כאן כדי לעזור! פשוט בחר נושא או שאל אותי מה שאתה רוצה 😊
                </p>
              </CardContent>
            </Card>

            {/* Personalized Suggestions Based on Latest Analysis */}
            {personalizedSuggestions.length > 0 && (
              <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-0">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-white text-2xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-7 h-7" />
                      מיוחד בשבילך - על סמך הניתוח שלך
                    </h3>
                    <p className="text-white/90 text-lg">
                      הכנתי לך כמה הסברים שיעזרו לך להבין טוב יותר את הממצאים:
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {personalizedSuggestions.map((suggestion, idx) => (
                      <PersonalizedLessonCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        index={idx}
                        onClick={() => handlePersonalizedSuggestion(suggestion)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Questions */}
            <Card className="bg-gray-900/80 border-purple-700/30">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  ❓ שאלות נפוצות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {QUICK_QUESTIONS.map((question) => (
                    <Button
                      key={question.id}
                      onClick={() => handleQuickQuestion(question)}
                      variant="outline"
                      size="lg"
                      className={`justify-start text-right h-auto py-6 text-lg bg-gradient-to-r ${question.color} bg-opacity-10 hover:bg-opacity-20 border-2 hover:border-white/50 transition-all`}
                    >
                      <span className="text-4xl ml-3">{question.emoji}</span>
                      <span className="flex-1 text-white font-semibold">{question.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Topics */}
            <Card className="bg-gray-900/80 border-purple-700/30">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  📚 רוצה ללמוד לעומק?
                </CardTitle>
                <p className="text-purple-200 text-center">
                  בחר נושא והמורה ילמד אותך צעד אחר צעד
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {LEARNING_TOPICS.map((topic) => (
                    <Card 
                      key={topic.id}
                      className={`bg-gradient-to-br ${topic.color} bg-opacity-20 border-2 border-white/20 hover:border-white/50 cursor-pointer transition-all`}
                      onClick={() => handleLearningTopic(topic)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-4xl">{topic.emoji}</div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-xl mb-1">{topic.name}</h4>
                            <p className="text-white/70 text-sm">{topic.description}</p>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                          size="sm"
                        >
                          <BookOpen className="w-4 h-4 ml-2" />
                          התחל ללמוד
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Or Ask Anything */}
            <Card className="bg-indigo-900/50 border-indigo-700/30">
              <CardContent className="p-6 text-center">
                <p className="text-indigo-200 text-lg mb-4">או פשוט שאל את המורה כל שאלה:</p>
                <Button
                  onClick={() => {
                    createConversationMutation.mutate();
                    setShowWelcome(false);
                  }}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xl px-12 py-6"
                >
                  <MessageCircle className="w-6 h-6 ml-2" />
                  פתח שיחה חופשית
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chat Interface */}
        {(currentConversationId || !showWelcome) && (
          <Card className="bg-gray-900/80 border-purple-700/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Brain className="w-7 h-7 text-purple-400" />
                  שיחה עם המורה
                </CardTitle>
                {currentConversationId && (
                  <Button
                    onClick={() => {
                      setCurrentConversationId(null);
                      setShowWelcome(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    ← חזור להתחלה
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages Area */}
              <div className="min-h-[500px] max-h-[600px] overflow-y-auto space-y-4 p-4 bg-gray-800/30 rounded-xl">
                {messages.length === 0 && !isProcessing && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-purple-200 text-xl mb-6">
                      שאל אותי כל שאלה שעולה לך!<br/>
                      אני כאן כדי לעזור לך להבין
                    </p>
                    
                    {/* Quick Suggestions in Chat */}
                    <div className="w-full max-w-md space-y-2">
                      <p className="text-purple-300 text-sm mb-3">💡 רעיונות לשאלות:</p>
                      {['מה זה אומר שיש לי הצללות?', 'למה הציור שלי קטן?', 'מה אפשר ללמוד מהציור?'].map((suggestion, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion)}
                          variant="outline"
                          size="sm"
                          className="w-full text-right justify-start text-purple-200 hover:bg-purple-900/30"
                        >
                          "{suggestion}"
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <ChatMessage message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isProcessing && (
                  <div className="flex items-center gap-3 text-purple-300 text-lg bg-purple-900/30 rounded-lg p-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>המורה כותב תשובה...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div>
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                  placeholder="כתוב את השאלה שלך כאן... (לחץ Enter לשליחה)"
                />
                <p className="text-purple-300 text-sm text-center mt-2">
                  💡 טיפ: אתה יכול לשאול כל שאלה - המורה מכיר את הניתוח שלך!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Card */}
        <Card className="bg-blue-900/30 border-blue-700/50 mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
              <div>
                <h4 className="text-blue-200 font-bold mb-2 text-xl">💡 איך להשתמש במורה?</h4>
                <ul className="text-blue-100 text-base space-y-2 leading-relaxed">
                  <li>• <strong>שאל שאלות פשוטות</strong> - "מה זה אומר שיש לי מחיקות?"</li>
                  <li>• <strong>בקש הסברים</strong> - "תסביר לי על הציור שלי"</li>
                  <li>• <strong>למד נושאים</strong> - "למד אותי על סימבולים בציורים"</li>
                  <li>• <strong>בקש חידון</strong> - "תן לי חידון כדי לבדוק אם הבנתי"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * GENERATE PERSONALIZED SUGGESTIONS
 * יוצר הצעות מותאמות אישית על סמך ממצאי הניתוח
 */
function generatePersonalizedSuggestions(analysis) {
  const suggestions = [];
  const results = analysis.results || {};
  const gf = results.graphic_features || {};
  const koppitz = results.koppitz_indicators || {};
  const psychological = results.psychological_profile || {};

  // High Anxiety Detection
  if (koppitz.emotional_disturbance_risk === 'high' || koppitz.emotional_disturbance_risk === 'very_high') {
    suggestions.push({
      id: 'anxiety_explanation',
      title: 'הבנת סימני המתח שמצאנו',
      emoji: '⚠️',
      color: 'from-red-600 to-orange-600',
      description: 'מצאנו כמה סימנים שמראים על מתח. בוא נבין מה זה אומר ומה אפשר לעשות',
      finding: `${koppitz.total_indicators} סימני מתח`,
      why_relevant: 'זה יעזור לך להבין למה אתה מרגיש ככה ומה לעשות עם זה',
      prompt: `בניתוח שלי זוהו ${koppitz.total_indicators} סימני מתח (אינדיקטורים של Koppitz). תסביר לי בפשטות:\n\n1. מה כל הסימנים האלה אומרים עליי?\n2. למה זה קרה? מה גרם לי לצייר ככה?\n3. האם זה משהו רציני שצריך לדאוג ממנו?\n4. מה אני יכול לעשות היום כדי להרגיש טוב יותר?\n5. איך אני יודע שהמצב משתפר?\n\nתהיה מעודד, תומך ומעשי בהסבר שלך. אני רוצה להרגיש שאני מבין ושיש תקווה.`
    });
  }

  // Shading (Anxiety Indicator)
  if (gf.shading && gf.shading.shading_present) {
    const areas = gf.shading.shading_areas || [];
    suggestions.push({
      id: 'shading_explanation',
      title: 'למה יש לי הצללות בציור?',
      emoji: '🌑',
      color: 'from-gray-700 to-gray-900',
      description: 'הצללות הן סימן חשוב בציור. בוא נבין מה הן אומרות ולמה זה קרה',
      finding: `הצללות ב: ${areas.join(', ')}`,
      why_relevant: 'הצללות מראות בדיוק על מה אתה חרד - זה מידע חשוב',
      prompt: `בציור שלי יש הצללות באזורים הבאים: ${areas.join(', ')}. תסביר לי בשפה פשוטה:\n\n1. מה זה בכלל הצללה בציור? למה אני עושה את זה?\n2. למה זה קורה באופן לא מודע? איך זה עובד?\n3. מה הצללה ב-${areas[0]} אומרת עליי? מה מדאיג אותי?\n4. זה משהו רע? האם זה אומר שיש לי בעיה?\n5. מה אני יכול לעשות כדי להפחית את החרדה הזאת?\n\nדבר איתי כמו חבר טוב - בשפה פשוטה, מעודדת וחמה.`
    });
  }

  // Size Issues
  if (gf.size_analysis) {
    const size = gf.size_analysis.overall_size;
    if (size === 'very_small' || size === 'small') {
      suggestions.push({
        id: 'small_size_explanation',
        title: 'למה הציור שלי יצא קטן?',
        emoji: '📏',
        color: 'from-blue-600 to-cyan-600',
        description: 'גודל קטן אומר משהו על איך אתה מרגיש. בוא נבין מה ואיך לשנות את זה',
        finding: `גודל: ${size}`,
        why_relevant: 'זה קשור לביטחון העצמי שלך - דבר שאפשר לשפר',
        prompt: `הציור שלי יצא קטן מאוד. תסביר לי בשפה פשוטה:\n\n1. מה זה אומר על האישיות שלי? על מה אני מרגיש?\n2. למה אנשים מציירים קטן? מה קורה בראש?\n3. האם זה קשור לביטחון העצמי שלי? איך?\n4. זה קבוע או שאפשר לשנות את זה?\n5. תן לי 5 דרכים מעשיות לבנות ביטחון עצמי\n\nתהיה אופטימי ותומך - אני רוצה להרגיש שיש תקווה ושאני יכול להשתפר!`
      });
    }
  }

  // Low Self-Esteem
  if (psychological.self_esteem && psychological.self_esteem.score <= 4) {
    suggestions.push({
      id: 'self_esteem_boost',
      title: 'איך לבנות ביטחון עצמי?',
      emoji: '💪',
      color: 'from-green-600 to-emerald-600',
      description: 'הניתוח מראה ביטחון נמוך. בוא נלמד ביחד איך לחזק אותו - צעד אחר צעד',
      finding: `ביטחון עצמי: ${psychological.self_esteem.score}/10`,
      why_relevant: 'ביטחון עצמי משפיע על כל תחומי החיים - כדאי לעבוד על זה',
      prompt: `בניתוח שלי יש ציון נמוך בביטחון עצמי (${psychological.self_esteem.score}/10). תסביר לי:\n\n1. איך הציור מראה את הביטחון הנמוך? מה הסימנים?\n2. מאיפה זה בא? למה אני מרגיש ככה?\n3. תן לי 7 דרכים **מעשיות** לבנות ביטחון - דברים שאני יכול להתחיל היום\n4. איך אני יודע שזה עובד? איך אני מודד שיפור?\n5. כמה זמן לוקח לראות שינוי?\n\nתהיה חיובי, מעשי ומעצים. אני רוצה להרגיש שאני יכול לשפר!`
    });
  }

  // High Anxiety Level
  if (psychological.anxiety_level && psychological.anxiety_level.score >= 7) {
    suggestions.push({
      id: 'anxiety_management',
      title: 'כלים להתמודדות עם מתח',
      emoji: '🧘',
      color: 'from-purple-600 to-pink-600',
      description: 'נראה שיש לך מתח. בוא נלמד טכניקות פשוטות שעובדות',
      finding: `רמת מתח: ${psychological.anxiety_level.score}/10`,
      why_relevant: 'טכניקות הרגעה פשוטות יכולות לשנות את איך שאתה מרגיש',
      prompt: `בניתוח יש לי ציון גבוה במתח וחרדה (${psychological.anxiety_level.score}/10). תסביר לי:\n\n1. מה בציור שלי מראה על המתח? אילו סימנים?\n2. למה אני מרגיש מתח? מה גורם לזה?\n3. תן לי 5 טכניקות **פשוטות** להרגעה שאני יכול לעשות עכשיו\n4. איך כל טכניקה עובדת? למה היא עוזרת?\n5. מתי אני אמור לפנות לעזרה מקצועית?\n\nדבר בשפה חמה, מעודדת ומעשית. אני רוצה כלים שאני יכול להשתמש בהם מיד!`
    });
  }

  // Omissions
  const omissions = results.content_analysis?.person_analysis?.body_parts_omitted || [];
  if (omissions.length > 0) {
    suggestions.push({
      id: 'omissions_explanation',
      title: 'למה חסרים חלקים בציור שלי?',
      emoji: '❓',
      color: 'from-amber-600 to-red-600',
      description: 'השמטות זה לא בטעות - זה אומר משהו חשוב. בוא נבין מה',
      finding: `חסר: ${omissions.join(', ')}`,
      why_relevant: 'כל חלק שחסר מראה על קונפליקט או דאגה - חשוב להבין',
      prompt: `בציור שלי חסרים החלקים הבאים: ${omissions.join(', ')}. תסביר לי:\n\n1. למה זה קורה באופן לא מודע? איך זה עובד בראש?\n2. מה כל חלק שחסר אומר עליי? על מה אני חרד?\n3. האם זה אומר שיש לי בעיה רצינית?\n4. מה זה אומר על החיים שלי?\n5. מה אני יכול לעשות כדי לעבוד על זה?\n\nתהיה סבלני, תומך ומעודד בהסבר. אל תפחיד אותי - תעזור לי להבין.`
    });
  }

  // Social Issues
  if (psychological.social_orientation) {
    if (psychological.social_orientation.score <= 3) {
      suggestions.push({
        id: 'introversion_understanding',
        title: 'הבנת המופנמות שלי',
        emoji: '🤫',
        color: 'from-indigo-600 to-purple-600',
        description: 'נראה שאתה יותר מופנם. זה לא רע - בוא נבין את החוזקות שלך',
        finding: `נטייה חברתית: ${psychological.social_orientation.score}/10`,
        why_relevant: 'להבין את עצמך עוזר לך להרגיש טוב עם מי שאתה',
        prompt: `הניתוח מראה שאני יותר מופנם (ציון ${psychological.social_orientation.score}/10). תסביר לי:\n\n1. מה בציור מראה שאני מופנם?\n2. מה זה אומר להיות מופנם? זה רע?\n3. מה היתרונות של להיות מופנם? מה החוזקות?\n4. איך אני יכול להרגיש טוב עם זה?\n5. מתי כדאי לצאת מאזור הנוחות?\n\nתדגיש את החיובי ותעזור לי להרגיש גאה במי שאני.`
      });
    } else if (psychological.social_orientation.score >= 8) {
      suggestions.push({
        id: 'extroversion_understanding',
        title: 'הבנת המוחצנות שלי',
        emoji: '🎉',
        color: 'from-pink-600 to-rose-600',
        description: 'אתה אדם חברתי! בוא נבין את החוזקות שלך',
        finding: `נטייה חברתית: ${psychological.social_orientation.score}/10`,
        why_relevant: 'להבין את החוזקות שלך עוזר לך למצות את הפוטנציאל',
        prompt: `הניתוח מראה שאני מוחצן מאוד (ציון ${psychological.social_orientation.score}/10). תסביר לי:\n\n1. מה בציור מראה את זה? אילו מאפיינים?\n2. מה היתרונות של להיות מוחצן? איך אני יכול להשתמש בזה?\n3. איך אני יכול לרתום את המוחצנות שלי לטובתי?\n4. מה לשים לב אליו כדי לשמור על איזון?\n5. איך זה משפיע על מערכות היחסים שלי?\n\nתהיה חיובי ומעצים. אני רוצה להרגיש שאני מבין את עצמי טוב יותר.`
      });
    }
  }

  // Erasures
  if (gf.erasures_corrections && (gf.erasures_corrections.erasure_count === 'many' || gf.erasures_corrections.erasure_count === 'excessive')) {
    suggestions.push({
      id: 'erasures_explanation',
      title: 'למה מחקתי כל כך הרבה?',
      emoji: '🧹',
      color: 'from-orange-600 to-amber-600',
      description: 'מחיקות רבות אומרות משהו על הפרפקציוניזם שלך. בוא נבין',
      finding: `מחיקות: ${gf.erasures_corrections.erasure_count}`,
      why_relevant: 'פרפקציוניזם יכול לעזור אבל גם להפריע - חשוב למצוא איזון',
      prompt: `בציור שלי יש הרבה מחיקות. תסביר לי:\n\n1. מה זה אומר עליי? על האישיות שלי?\n2. האם זה קשור לפרפקציוניזם? איך?\n3. זה דבר טוב או רע? מה היתרונות והחסרונות?\n4. איך אני יכול "לשחרר" את הצורך במושלם?\n5. תן לי טכניקות מעשיות להתמודדות\n\nתהיה מעודד, מאזן ומעשי.`
    });
  }

  // Tree - Dead/Dying (if exists)
  const tree = results.content_analysis?.tree_analysis;
  if (tree && (tree.tree_vitality === 'dead' || tree.tree_vitality === 'dying')) {
    suggestions.push({
      id: 'tree_vitality',
      title: 'למה העץ שלי נראה עצוב?',
      emoji: '🍂',
      color: 'from-brown-600 to-amber-600',
      description: 'עץ מת או גווע מראה על חוסר חיוניות. בוא נבין מה זה אומר',
      finding: `עץ: ${tree.tree_vitality}`,
      why_relevant: 'זה יכול לעזור לזהות דיכאון או חוסר מוטיבציה',
      prompt: `העץ שציירתי נראה מת או גווע. תסביר לי:\n\n1. מה זה אומר עליי? על המצב הרגשי שלי?\n2. האם זה קשור לדיכאון או לחוסר מוטיבציה?\n3. מה אני יכול לעשות כדי להרגיש יותר "חי" וחיוני?\n4. תן לי 3 צעדים קטנים שאני יכול לעשות היום\n5. איך אני יודע מתי לפנות לעזרה מקצועית? למי?\n\nתהיה עדין, תומך ומעודד. אני רוצה להרגיש שאני יכול לצמוח שוב.`
    });
  }

  // House - No Windows/Door
  const house = results.content_analysis?.house_analysis;
  if (house && (!house.has_windows || !house.has_door)) {
    const missing = [];
    if (!house.has_windows) missing.push('חלונות');
    if (!house.has_door) missing.push('דלת');
    
    suggestions.push({
      id: 'house_isolation',
      title: 'למה הבית שלי סגור?',
      emoji: '🏠',
      color: 'from-blue-600 to-indigo-600',
      description: 'בית ללא חלונות או דלת מראה על בידוד. בוא נבין למה',
      finding: `חסר: ${missing.join(' ו')}`,
      why_relevant: 'זה קשור לקשרים החברתיים ולתחושת הבידוד שלך',
      prompt: `הבית שציירתי ללא ${missing.join(' ו')}. תסביר לי:\n\n1. מה זה אומר עליי? על הקשרים שלי עם העולם?\n2. האם אני מרגיש בודד או מבודד? האם אני רוצה להיות לבד?\n3. זה דבר שאני עושה במודע או שזה קורה לי?\n4. איך אני יכול להיפתח יותר לאנשים ולהרגיש פחות מבודד (אם אני רוצה)?\n5. מה אם אני בעצם אוהב להיות לבד וזה בסדר?\n\nתהיה מעודד ועוזר לי להבין את עצמי, גם אם זה אומר שאני אוהב את המרחב האישי שלי.`
    });
  }

  return suggestions.slice(0, 4); // Maximum 4 personalized suggestions
}
