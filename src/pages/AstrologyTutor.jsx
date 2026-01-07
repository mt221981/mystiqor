
import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Loader2, GraduationCap, BookOpen, Target,
  Award, Brain, TrendingUp, MessageCircle, Plus, CheckCircle,
  Lock, Trophy, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ChatMessage from "@/components/AICoach/ChatMessage";
import ChatInput from "@/components/AICoach/ChatInput";
import EnhancedToast from "@/components/EnhancedToast";
import EnhancedEmptyState from "@/components/EnhancedEmptyState";
import { usePageView, useTimeTracking, trackFeatureUsage } from "@/components/Analytics";

const LEARNING_PATHS = {
  beginner: {
    name: "מתחילים - היסודות",
    icon: "🌱",
    color: "from-green-600 to-emerald-600",
    topics: [
      { id: 'sun_moon_ascendant', name: 'השילוש המקודש: שמש, ירח, צועד', emoji: '☀️🌙⬆️', duration: '30 דק' },
      { id: 'zodiac_signs', name: '12 מזלות הזודיאק', emoji: '♈♉♊', duration: '45 דק' },
      { id: 'elements_modalities', name: 'יסודות ומודאליות', emoji: '🔥🌍💨💧', duration: '40 דק' },
      { id: 'planets', name: 'כוכבי הלכת - המשפיעים', emoji: '🪐', duration: '60 דק' }
    ]
  },
  intermediate: {
    name: "מתקדמים - עומק",
    icon: "🔍",
    color: "from-blue-600 to-indigo-600",
    topics: [
      { id: 'houses', name: '12 הבתים האסטרולוגיים', emoji: '🏠', duration: '60 דק' },
      { id: 'aspects', name: 'אספקטים - קשרים בין כוכבים', emoji: '🔗', duration: '75 דק' },
      { id: 'dignities', name: 'Dignities - חוזק כוכבים', emoji: '👑', duration: '45 דק' },
      { id: 'chart_patterns', name: 'תבניות במפה', emoji: '🎨', duration: '50 דק' }
    ]
  },
  advanced: {
    name: "מקצועיים - מיומנות",
    icon: "🚀",
    color: "from-purple-600 to-pink-600",
    topics: [
      { id: 'transits', name: 'מעברים - Transits', emoji: '🌊', duration: '90 דק' },
      { id: 'progressions', name: 'Progressions - התקדמויות', emoji: '📈', duration: '90 דק' },
      { id: 'synastry', name: 'Synastry - התאמה', emoji: '💕', duration: '120 דק' },
      { id: 'composite_charts', name: 'Composite Charts', emoji: '🌟', duration: '120 דק' },
      { id: 'predictive_techniques', emoji: '🔮', name: 'טכניקות חיזוי', duration: '100 דק' }
    ]
  }
};

const QUICK_CONCEPTS = [
  { 
    id: 'what_is_ascendant', 
    title: 'מה זה אסצנדנט?', 
    emoji: '⬆️',
    prompt: 'הסבר לי מה זה אסצנדנט (Ascendant) בצורה פשוטה, עם דוגמה ממפת הלידה שלי'
  },
  { 
    id: 'houses_meaning', 
    title: 'מה זה בתים?', 
    emoji: '🏠',
    prompt: 'הסבר לי מה זה 12 הבתים באסטרולוגיה ומה כל אחד מייצג'
  },
  { 
    id: 'aspects_basics', 
    title: 'מה זה אספקטים?', 
    emoji: '🔗',
    prompt: 'מה זה אספקטים (aspects) ואיך הם משפיעים על המפה שלי?'
  },
  { 
    id: 'retrograde', 
    title: 'מה זה רטרוגרד?', 
    emoji: '⟲',
    prompt: 'הסבר לי מה זה כוכב רטרוגרדי ולמה זה חשוב'
  },
  { 
    id: 'transits', 
    title: 'מה זה מעברים?', 
    emoji: '🌊',
    prompt: 'מה זה מעברים (transits) ואיך הם משפיעים עליי?'
  },
  { 
    id: 'my_chart_overview', 
    title: 'סקירת המפה שלי', 
    emoji: '🗺️',
    prompt: 'תן לי סקירה כללית של מפת הלידה שלי - מה הדברים החשובים ביותר שאני צריך לדעת?'
  }
];

export default function AstrologyTutor() {
  const [activeTab, setActiveTab] = useState('chat');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const hasProcessedUrlQuestion = useRef(false); // Ref to ensure URL param is processed only once

  usePageView('AstrologyTutor');
  useTimeTracking('AstrologyTutor');

  // Fetch learning progress
  const { data: learningProgress, isLoading: loadingProgress } = useQuery({
    queryKey: ['learningProgress'],
    queryFn: async () => {
      const progress = await base44.entities.LearningProgress.list('', 1);
      return progress[0] || null;
    }
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['tutorConversations'],
    queryFn: async () => {
      const convs = await base44.agents.listConversations({
        agent_name: 'astrology_tutor'
      });
      return convs || [];
    }
  });

  // Fetch current conversation
  const { data: currentConversation } = useQuery({
    queryKey: ['tutorConversation', currentConversationId],
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
      queryClient.setQueryData(['tutorConversation', currentConversationId], data);
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
        agent_name: 'astrology_tutor',
        metadata: {
          name: `שיחת לימוד ${conversations.length + 1}`,
          created_at: new Date().toISOString()
        }
      });
      return conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['tutorConversations'] });
      setCurrentConversationId(conversation.id);
      trackFeatureUsage('astrology_tutor_conversation_created');
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

  // Initialize learning progress
  const initProgressMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.LearningProgress.create({
        current_level: 'beginner',
        completed_topics: [],
        current_learning_path: 'basics',
        topics_progress: {},
        total_study_time_minutes: 0,
        quizzes_completed: 0,
        achievements: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningProgress'] });
      EnhancedToast.success('מסלול הלמידה שלך מוכן! 🎓');
    }
  });

  // Memoize handleSendMessage to make it stable for useEffect dependencies
  const handleSendMessage = useCallback(async (message) => {
    if (!currentConversationId) {
      const conversation = await createConversationMutation.mutateAsync();
      // setCurrentConversationId(conversation.id); // This is handled by onSuccess of createConversationMutation
      // The subsequent message sending should happen after currentConversationId is set.
      // We can rely on the subscription to update `currentConversation` and then `sendMessageMutation` will work.
      // A small delay here can ensure state updates propagate if needed, but the current logic of waiting for `conversation` then sending message via `sendMessageMutation.mutate` (which is async) is sound.
      // Re-evaluating existing handleSendMessage: the setTimeout after `mutateAsync` was specifically to wait for state.
      // Let's refine it: it should ensure `currentConversationId` is ready for `sendMessageMutation`.
      // If `currentConversationId` is set by `createConversationMutation.onSuccess` shortly after `mutateAsync()`, then `sendMessageMutation` will use the updated `currentConversation` from the query.
      // The existing setTimeout logic is likely to ensure `currentConversationId` is set before sending.
      // Let's retain the spirit of the original setTimeout for robustness.
      setTimeout(() => {
        sendMessageMutation.mutate({ message });
      }, 500); // Small delay to allow currentConversationId to be set via onSuccess
    } else {
      await sendMessageMutation.mutateAsync({ message });
    }
  }, [currentConversationId, createConversationMutation, sendMessageMutation]);


  // Check for pre-filled question from URL
  useEffect(() => {
    if (hasProcessedUrlQuestion.current) {
      return; // Ensure this effect runs only once per component mount
    }

    const urlParams = new URLSearchParams(window.location.search);
    const prefilledQuestion = urlParams.get('question');
    
    if (prefilledQuestion) {
      hasProcessedUrlQuestion.current = true; // Mark as processed
      // If there's a prefilled question, send it.
      // handleSendMessage will internally manage conversation creation if currentConversationId is null.
      handleSendMessage(prefilledQuestion);
      setActiveTab('chat'); // Ensure chat tab is active
      // Optionally, clear the URL parameter to prevent re-triggering on subsequent renders
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleSendMessage]); // Depend on handleSendMessage to ensure it's up-to-date


  const handleQuickConcept = (concept) => {
    handleSendMessage(concept.prompt);
    trackFeatureUsage('astrology_tutor_quick_concept', { concept: concept.id });
  };

  const handleStartPath = (pathKey) => {
    setSelectedPath(pathKey);
    const path = LEARNING_PATHS[pathKey];
    handleSendMessage(`אני רוצה להתחיל במסלול "${path.name}". בוא נתחיל עם הנושא הראשון: ${path.topics[0].name}`);
    setActiveTab('chat');
  };

  const handleRequestQuiz = (topicId) => {
    handleSendMessage(`אני מוכן לחידון על ${topicId}. תן לי 5 שאלות עם תשובות נכונות/לא נכונות`);
    trackFeatureUsage('astrology_tutor_quiz_requested', { topic: topicId });
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!learningProgress || !learningProgress.topics_progress) return 0;
    
    const allTopics = [
      ...LEARNING_PATHS.beginner.topics,
      ...LEARNING_PATHS.intermediate.topics,
      ...LEARNING_PATHS.advanced.topics
    ];
    
    const completedCount = allTopics.filter(topic => 
      learningProgress.topics_progress[topic.id]?.completed
    ).length;
    
    return Math.round((completedCount / allTopics.length) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="המורה האסטרולוגי שלי 🎓"
          description="למד אסטרולוגיה בצורה אינטראקטיבית עם AI מומחה"
          icon={GraduationCap}
          iconGradient="from-purple-600 to-pink-600"
        />

        {/* Learning Progress Overview */}
        {learningProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-10 h-10 text-yellow-300" />
                    <div>
                      <h3 className="text-white text-2xl font-bold">
                        רמה: {getLevelHebrew(learningProgress.current_level)}
                      </h3>
                      <p className="text-purple-100">
                        {learningProgress.completed_topics?.length || 0} נושאים הושלמו
                      </p>
                    </div>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-3xl font-bold text-white">{overallProgress}%</div>
                    <div className="text-purple-100 text-xs">התקדמות</div>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-3 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {learningProgress.achievements?.map((achievement, idx) => (
                    <Badge key={idx} className="bg-yellow-600 text-white">
                      🏆 {achievement}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Initialize Learning Progress */}
        {!learningProgress && !loadingProgress && (
          <Card className="bg-green-900/50 border-green-700 mb-8">
            <CardContent className="p-8 text-center">
              <GraduationCap className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">התחל את מסע הלמידה שלך!</h3>
              <p className="text-green-200 mb-6">
                צור מסלול למידה אישי ותתחיל ללמוד אסטרולוגיה בקצב שלך
              </p>
              <Button
                onClick={() => initProgressMutation.mutate()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Star className="w-5 h-5 ml-2" />
                התחל ללמוד
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              שיחה עם המורה
            </TabsTrigger>
            <TabsTrigger value="paths" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              מסלולי למידה
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              ההתקדמות שלי
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Conversations Sidebar */}
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">שיחות לימוד</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => createConversationMutation.mutate()}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    שיחה חדשה
                  </Button>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {conversations.map((conv) => (
                      <Button
                        key={conv.id}
                        onClick={() => setCurrentConversationId(conv.id)}
                        variant={currentConversationId === conv.id ? "default" : "ghost"}
                        className="w-full justify-start text-right"
                      >
                        {conv.metadata?.name || 'שיחה ללא שם'}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-3">
                <CardContent className="p-6">
                  {!currentConversationId ? (
                    <div className="flex flex-col items-center justify-center h-[600px] space-y-6">
                      <EnhancedEmptyState
                        icon={GraduationCap}
                        title="ברוכים הבאים למורה האסטרולוגי"
                        description="שאל שאלות, בקש הסברים, או בחר מושג מהרשימה למטה"
                      />
                      
                      {/* Quick Concepts */}
                      <div className="w-full max-w-2xl">
                        <h4 className="text-white font-bold mb-3 text-center">🚀 מושגים מהירים:</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {QUICK_CONCEPTS.map((concept) => (
                            <Button
                              key={concept.id}
                              onClick={() => handleQuickConcept(concept)}
                              variant="outline"
                              className="justify-start text-right h-auto py-3"
                            >
                              <span className="text-2xl ml-2">{concept.emoji}</span>
                              <span>{concept.title}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-[600px]">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
                          <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>המורה חושב...</span>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <ChatInput
                        onSend={handleSendMessage}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths">
            <div className="space-y-6">
              {Object.entries(LEARNING_PATHS).map(([key, path]) => (
                <Card key={key} className={`bg-gradient-to-r ${path.color} bg-opacity-10 border-2`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{path.icon}</div>
                        <div>
                          <CardTitle className="text-white text-2xl">{path.name}</CardTitle>
                          <p className="text-indigo-200">{path.topics.length} נושאים</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartPath(key)}
                        className="bg-white text-purple-600 hover:bg-purple-50"
                      >
                        <BookOpen className="w-4 h-4 ml-2" />
                        התחל מסלול
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {path.topics.map((topic) => {
                        const isCompleted = learningProgress?.topics_progress?.[topic.id]?.completed;
                        const quizScore = learningProgress?.topics_progress?.[topic.id]?.quiz_score;

                        return (
                          <div
                            key={topic.id}
                            className={`rounded-lg p-4 border-2 transition-all ${
                              isCompleted 
                                ? 'bg-green-900/30 border-green-600/50' 
                                : 'bg-indigo-900/30 border-indigo-600/30'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{topic.emoji}</span>
                                <div>
                                  <h4 className="text-white font-semibold text-sm">{topic.name}</h4>
                                  <p className="text-indigo-300 text-xs">{topic.duration}</p>
                                </div>
                              </div>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <Lock className="w-5 h-5 text-indigo-400" />
                              )}
                            </div>
                            {isCompleted && quizScore !== undefined && (
                              <Badge className="bg-green-600 text-white text-xs">
                                ציון: {quizScore}%
                              </Badge>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button
                                onClick={() => {
                                  handleSendMessage(`למד אותי על ${topic.name}`);
                                  setActiveTab('chat');
                                }}
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs"
                              >
                                למד
                              </Button>
                              {isCompleted && (
                                <Button
                                  onClick={() => {
                                    handleRequestQuiz(topic.id);
                                    setActiveTab('chat');
                                  }}
                                  size="sm"
                                  className="flex-1 text-xs bg-purple-600"
                                >
                                  חידון
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            {learningProgress ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0">
                    <CardContent className="p-4 text-center">
                      <Brain className="w-8 h-8 text-white mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white mb-1">
                        {learningProgress.completed_topics?.length || 0}
                      </div>
                      <div className="text-blue-100 text-xs">נושאים הושלמו</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
                    <CardContent className="p-4 text-center">
                      <Award className="w-8 h-8 text-white mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white mb-1">
                        {learningProgress.quizzes_completed || 0}
                      </div>
                      <div className="text-purple-100 text-xs">חידונים הושלמו</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white mb-1">
                        {learningProgress.average_quiz_score || 0}%
                      </div>
                      <div className="text-green-100 text-xs">ציון ממוצע</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-600 to-orange-600 border-0">
                    <CardContent className="p-4 text-center">
                      <Target className="w-8 h-8 text-white mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white mb-1">
                        {Math.floor((learningProgress.total_study_time_minutes || 0) / 60)}h
                      </div>
                      <div className="text-amber-100 text-xs">זמן למידה</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Topics Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>התקדמות לפי נושאים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(LEARNING_PATHS).map(([pathKey, path]) => (
                        <div key={pathKey}>
                          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-2xl">{path.icon}</span>
                            {path.name}
                          </h4>
                          <div className="space-y-2">
                            {path.topics.map((topic) => {
                              const progress = learningProgress.topics_progress?.[topic.id];
                              const isCompleted = progress?.completed;
                              const quizScore = progress?.quiz_score;

                              return (
                                <div
                                  key={topic.id}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    isCompleted ? 'bg-green-900/30' : 'bg-gray-800/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {isCompleted ? (
                                      <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : (
                                      <Lock className="w-5 h-5 text-gray-400" />
                                    )}
                                    <span className="text-2xl">{topic.emoji}</span>
                                    <div>
                                      <p className="text-white font-semibold text-sm">{topic.name}</p>
                                      {progress?.last_studied && (
                                        <p className="text-gray-400 text-xs">
                                          נלמד לאחרונה: {new Date(progress.last_studied).toLocaleDateString('he-IL')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {quizScore !== undefined && (
                                    <Badge className="bg-purple-600 text-white">
                                      {quizScore}%
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Recommended */}
                {learningProgress.next_recommended_topic && (
                  <Card className="bg-gradient-to-r from-yellow-600 to-amber-600 border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-10 h-10 text-white" />
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-xl mb-1">הנושא הבא שלך:</h3>
                          <p className="text-yellow-100">{learningProgress.next_recommended_topic}</p>
                        </div>
                        <Button
                          onClick={() => {
                            handleSendMessage(`בוא נלמד על ${learningProgress.next_recommended_topic}`);
                            setActiveTab('chat');
                          }}
                          className="bg-white text-amber-600 hover:bg-amber-50"
                        >
                          <BookOpen className="w-4 h-4 ml-2" />
                          התחל
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <EnhancedEmptyState
                icon={TrendingUp}
                title="התחל ללמוד כדי לעקוב אחר ההתקדמות"
                description="פתח שיחה עם המורה או התחל מסלול למידה"
                actionLabel="חזור לשיחה"
                onAction={() => setActiveTab('chat')}
              />
            )}
          </TabsContent>

          {/* This TabsContent for "paths" was duplicated, it should be removed or made unique if intended */}
          {/* Re-using the paths content from above, it seems like a copy-paste error in the original outline if this was intended to be different */}
          {/* For now, I'm removing the duplicated TabsContent value="paths" as it mirrors the first one */}
          {/* If the intention was to have two different 'paths' tabs, this needs clarification. */}
        </Tabs>
      </div>
    </div>
  );
}

function getLevelHebrew(level) {
  const levels = {
    beginner: 'מתחיל',
    intermediate: 'בינוני',
    advanced: 'מתקדם',
    expert: 'מומחה'
  };
  return levels[level] || level;
}
