import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Plus, Map, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/PageHeader";
import ChatMessage from "@/components/AICoach/ChatMessage";
import ChatInput from "@/components/AICoach/ChatInput";
import QuickActions from "@/components/AICoach/QuickActions";
import EmptyState from "@/components/EmptyState";
import EnhancedToast from "@/components/EnhancedToast";
import JourneyCard from "@/components/JourneyCard";
import { usePageView, useTimeTracking, trackFeatureUsage } from "@/components/Analytics";

export default function AICoach() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isGeneratingJourney, setIsGeneratingJourney] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  usePageView('AICoach');
  useTimeTracking('AICoach');

  // Fetch conversations list
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['aiCoachConversations'],
    queryFn: async () => {
      try {
        const allConversations = await base44.agents.listConversations({
          agent_name: 'personal_coach'
        });
        return allConversations || [];
      } catch (error) {
        console.error('Error loading conversations:', error);
        return [];
      }
    }
  });

  // Fetch current conversation
  const { data: currentConversation, isLoading: loadingConversation } = useQuery({
    queryKey: ['aiCoachConversation', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return null;
      try {
        return await base44.agents.getConversation(currentConversationId);
      } catch (error) {
        console.error('Error loading conversation:', error);
        return null;
      }
    },
    enabled: !!currentConversationId
  });

  // Fetch coaching journeys
  const { data: journeys = [], isLoading: loadingJourneys } = useQuery({
    queryKey: ['coachingJourneys'],
    queryFn: async () => {
      try {
        const allJourneys = await base44.entities.CoachingJourney.list('-created_date', 50);
        return allJourneys || [];
      } catch (error) {
        console.error('Error loading journeys:', error);
        return [];
      }
    }
  });

  const messages = useMemo(() => {
    return currentConversation?.messages || [];
  }, [currentConversation]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!currentConversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(currentConversationId, (data) => {
      queryClient.setQueryData(['aiCoachConversation', currentConversationId], data);
    });

    return () => unsubscribe();
  }, [currentConversationId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const conversation = await base44.agents.createConversation({
        agent_name: 'personal_coach',
        metadata: {
          name: `שיחה ${conversations.length + 1}`,
          created_at: new Date().toISOString()
        }
      });
      return conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['aiCoachConversations'] });
      setCurrentConversationId(conversation.id);
      trackFeatureUsage('ai_coach_new_conversation');
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, fileUrls = [] }) => {
      setIsProcessing(true);
      await base44.agents.addMessage(currentConversation, {
        role: 'user',
        content: message,
        file_urls: fileUrls
      });
    },
    onSuccess: () => {
      trackFeatureUsage('ai_coach_send_message');
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // Generate new journey
  const generateJourneyMutation = useMutation({
    mutationFn: async (options = {}) => {
      const result = await base44.functions.invoke('generateCoachingJourney', options);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachingJourneys'] });
      EnhancedToast.success('מסע חדש נוצר! 🎉', 'המסע האישי שלך מוכן');
      trackFeatureUsage('coaching_journey_created');
    }
  });

  // Complete step
  const completeStepMutation = useMutation({
    mutationFn: async ({ journeyId, stepNumber }) => {
      const journey = journeys.find(j => j.id === journeyId);
      if (!journey) throw new Error('Journey not found');

      const updatedSteps = journey.steps.map(step => 
        step.step_number === stepNumber 
          ? { ...step, status: 'completed', completion_date: new Date().toISOString() }
          : step
      );

      const completedCount = updatedSteps.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedCount / updatedSteps.length) * 100);

      await base44.entities.CoachingJourney.update(journeyId, {
        steps: updatedSteps,
        completed_steps: completedCount,
        progress_percentage: progress,
        status: progress === 100 ? 'completed' : 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachingJourneys'] });
      EnhancedToast.success('כל הכבוד! 🎉', 'השלב הושלם');
      trackFeatureUsage('journey_step_completed');
    }
  });

  const handleSendMessage = useCallback(async (message, fileUrls = []) => {
    if (!currentConversationId) {
      const conversation = await createConversationMutation.mutateAsync();
      setCurrentConversationId(conversation.id);
    }
    await sendMessageMutation.mutateAsync({ message, fileUrls });
  }, [currentConversationId, createConversationMutation, sendMessageMutation]);

  const handleQuickAction = useCallback((action) => {
    handleSendMessage(action.prompt);
    trackFeatureUsage('ai_coach_quick_action', { action: action.label });
  }, [handleSendMessage]);

  const handleGenerateJourney = async () => {
    setIsGeneratingJourney(true);
    try {
      await generateJourneyMutation.mutateAsync({});
      setActiveTab('journeys');
    } catch (error) {
      EnhancedToast.error('שגיאה ביצירת מסע', error.message);
    } finally {
      setIsGeneratingJourney(false);
    }
  };

  const handleStepComplete = (journeyId, stepNumber) => {
    completeStepMutation.mutate({ journeyId, stepNumber });
  };

  const activeJourneys = journeys.filter(j => j.status === 'active');
  const completedJourneys = journeys.filter(j => j.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-black dark:via-purple-950/30 dark:to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="המדריך האישי שלי"
          description="המדריך הרוחני האישי שלך, זמין תמיד לתמיכה והכוונה"
          icon={Sparkles}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              שיחה
            </TabsTrigger>
            <TabsTrigger value="journeys" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              המסעות שלי
              {activeJourneys.length > 0 && (
                <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeJourneys.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Conversations Sidebar */}
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">שיחות קודמות</CardTitle>
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
                    <div className="flex flex-col items-center justify-center h-96 space-y-6">
                      <EmptyState
                        icon={Sparkles}
                        title="ברוכים הבאים למדריך האישי"
                        description="התחל שיחה חדשה או בחר שיחה קיימת"
                      />
                      <QuickActions onAction={handleQuickAction} />
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
                            <span>המדריך חושב...</span>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <ChatInput
                        onSend={handleSendMessage}
                        disabled={isProcessing}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Journeys Tab */}
          <TabsContent value="journeys">
            <div className="space-y-6">
              {/* Generate Journey Button */}
              <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-xl font-bold mb-2">
                        מסע אימון אישי חדש
                      </h3>
                      <p className="text-purple-100">
                        ה-AI ייצור עבורך מסע מותאם אישית מבוסס על הניתוחים שלך
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerateJourney}
                      disabled={isGeneratingJourney}
                      className="bg-white text-purple-600 hover:bg-purple-50"
                    >
                      {isGeneratingJourney ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          יוצר מסע...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 ml-2" />
                          צור מסע חדש
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Journeys */}
              {activeJourneys.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">מסעות פעילים</h2>
                  <div className="grid gap-6">
                    {activeJourneys.map((journey) => (
                      <JourneyCard
                        key={journey.id}
                        journey={journey}
                        onStepComplete={handleStepComplete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Journeys */}
              {completedJourneys.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">מסעות שהושלמו 🎉</h2>
                  <div className="grid gap-4">
                    {completedJourneys.map((journey) => (
                      <JourneyCard
                        key={journey.id}
                        journey={journey}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {journeys.length === 0 && !isGeneratingJourney && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Map className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">עוד אין מסעות</h3>
                    <p className="text-gray-600 mb-6">
                      צור מסע אימון אישי ראשון ותתחיל במסע שלך
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}