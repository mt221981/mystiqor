import React, { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Brain, Copy, MessageSquare, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "./EnhancedToast";
import ChatHistory from "./ChatHistory";
import MessageRating from "./MessageRating";

export default function AIAssistant({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const messagesEndRef = useRef(null);

  const { data: goals = [] } = useQuery({
    queryKey: ['userGoals'],
    queryFn: () => base44.entities.UserGoal.list('-created_date', 10),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-entry_date', 7),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['recentAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 5),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: conversationMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['conversationMessages', currentConversation?.id, messagesPage],
    queryFn: async () => {
      if (!currentConversation?.id) return [];
      const msgs = await base44.entities.Message.filter(
        { conversation_id: currentConversation.id },
        '-created_date',
        20 * messagesPage
      );
      return msgs.reverse();
    },
    enabled: !!currentConversation?.id && isOpen,
    staleTime: 30000
  });

  useEffect(() => {
    if (conversationMessages.length > 0) {
      setMessages(conversationMessages);
    } else if (!currentConversation && isOpen) {
      setMessages([
        { role: 'assistant', content: 'שלום! אני כאן כדי לעזור לך במסע האישי שלך. איך אוכל לעזור?' }
      ]);
    }
  }, [conversationMessages, currentConversation, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createConversation = async (firstMessage) => {
    try {
      const conv = await base44.entities.Conversation.create({
        title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
        conversation_type: 'general',
        status: 'active',
        last_message_date: new Date().toISOString(),
        messages_count: 0
      });
      setCurrentConversation(conv);
      queryClient.invalidateQueries(['chatConversations']);
      return conv;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const saveMessage = async (conv, role, content) => {
    try {
      const msg = await base44.entities.Message.create({
        conversation_id: conv.id,
        role,
        content,
        message_type: 'text',
        is_read: role === 'user'
      });

      await base44.entities.Conversation.update(conv.id, {
        last_message_date: new Date().toISOString(),
        messages_count: (conv.messages_count || 0) + 1
      });

      return msg;
    } catch (error) {
      console.error('Failed to save message:', error);
      return null;
    }
  };

  const generateResponse = async (userMessage) => {
    try {
      const userContext = {
        activeGoals: goals.filter(g => g.status === 'active').length,
        recentGoals: goals.slice(0, 3).map(g => ({ title: g.goal_title, progress: g.progress_percentage })),
        avgMood: moodEntries.length > 0 ? (moodEntries.reduce((sum, m) => sum + (m.mood_score || 5), 0) / moodEntries.length).toFixed(1) : null,
        analysesCount: analyses.length
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה מאמן אישי חכם ואמפתי באפליקציה לצמיחה אישית ופיתוח עצמי בעברית.

יעדים פעילים: ${userContext.activeGoals}
${userContext.avgMood ? `מצב רוח ממוצע: ${userContext.avgMood}/10` : ''}
ניתוחים שבוצעו: ${userContext.analysesCount}

המשתמש שאל: "${userMessage}"

ענה בעברית בצורה חמה, תומכת ומעשית. תן עצות קונקרטיות.`,
        add_context_from_internet: false
      });

      let content;
      if (typeof response === 'string') {
        content = response;
      } else if (response.choices?.[0]) {
        content = response.choices[0].message?.content || response.choices[0].text;
      } else if (response.content) {
        content = response.content;
      } else {
        content = 'מצטער, לא הצלחתי לעבד את התשובה.';
      }

      return content || 'מצטער, נתקלתי בבעיה.';
    } catch (error) {
      console.error('Generate response error:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    
    let conv = currentConversation;
    if (!conv) {
      conv = await createConversation(userMessage);
      if (!conv) {
        EnhancedToast.error('שגיאה', 'לא הצלחתי ליצור שיחה');
        setInput(userMessage); // Restore input on failure
        return;
      }
    }

    const userMsg = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    
    await saveMessage(conv, 'user', userMessage);
    
    setIsTyping(true);

    try {
      const aiResponse = await generateResponse(userMessage);
      const assistantMsg = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMsg]);
      
      await saveMessage(conv, 'assistant', aiResponse);
      queryClient.invalidateQueries(['chatConversations']);
    } catch (error) {
      console.error('AI response error:', error);
      EnhancedToast.error('שגיאה', 'לא הצלחתי ליצור תשובה');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
    setShowHistory(false);
    setMessagesPage(1);
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([
      { role: 'assistant', content: 'שלום! אני כאן כדי לעזור לך במסע האישי שלך. איך אוכל לעזור?' }
    ]);
    setShowHistory(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-6xl h-[85vh] flex gap-4"
        >
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-80 flex-shrink-0"
            >
              <ChatHistory 
                onSelectConversation={handleSelectConversation}
                currentConversationId={currentConversation?.id}
              />
            </motion.div>
          )}

          <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-purple-900/50 rounded-2xl border-2 border-purple-500/50 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {currentConversation?.title || 'AI Assistant'}
                  </h3>
                  <p className="text-purple-100 text-xs">המאמן האישי שלך</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleNewChat}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages && messagesPage === 1 && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  <span className="text-purple-300 mr-3">טוען הודעות...</span>
                </div>
              )}

              {messages.length > 20 && (
                <div className="text-center">
                  <Button
                    onClick={() => setMessagesPage(p => p + 1)}
                    variant="ghost"
                    size="sm"
                    className="text-purple-300 hover:text-white"
                  >
                    טען הודעות נוספות
                  </Button>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800/80 text-gray-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            EnhancedToast.success('הועתק!');
                          }}
                          className="h-6 px-2 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {msg.id && (
                          <MessageRating 
                            messageId={msg.id} 
                            initialRating={msg.metadata?.rating}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800/80 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">מקליד...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-purple-700/50 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="הקלד הודעה..."
                className="bg-gray-800 border-purple-700 text-white"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}