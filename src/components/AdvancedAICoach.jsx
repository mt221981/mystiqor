import React, { useState, useRef, useEffect, memo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Send, 
  Loader2,
  TrendingUp,
  Heart,
  Target,
  Calendar,
  X,
  Minimize2,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import EnhancedToast from "./EnhancedToast";

const QUICK_PROMPTS = [
  { icon: Target, text: "עזור לי להגדיר יעד חדש", category: "goals" },
  { icon: Heart, text: "נתח את מצב הרוח שלי", category: "mood" },
  { icon: TrendingUp, text: "מה הדפוסים שזיהית אצלי?", category: "patterns" },
  { icon: Calendar, text: "תן לי המלצה ליום הזה", category: "daily" },
];

const MessageBubble = memo(({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            : 'bg-gray-800 text-gray-100 border border-gray-700'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="text-sm prose prose-sm prose-invert max-w-none"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="text-purple-300">{children}</strong>,
              em: ({ children }) => <em className="text-pink-300">{children}</em>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default function AdvancedAICoach({ isOpen, onClose, context = {} }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `שלום! 👋 אני המאמן האישי שלך.\n\nאני כאן כדי לעזור לך:\n✨ להגדיר ולהשיג יעדים\n📊 להבין דפוסים במצב הרוח\n🎯 לקבל המלצות מותאמות אישית\n💡 לקבל תובנות עמוקות על עצמך\n\nבמה תרצה שאעזור לך היום?`
      }]);
    }
  }, [isOpen]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const contextData = {
        ...context,
        recentGoals: context.goals?.slice(0, 5) || [],
        recentMood: context.moodEntries?.slice(0, 7) || [],
        analyses: context.analyses?.length || 0
      };

      const prompt = `אתה מאמן אישי מיומן ואמפתי. השתמש בהקשר הבא על המשתמש:\n${JSON.stringify(contextData, null, 2)}\n\nשאלת המשתמש: ${userMessage}\n\nהיה חם, תומך, ומעשי. תן תשובות קצרות ומדויקות עם המלצות ספציפיות.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      return response.choices?.[0]?.message?.content || response;
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      EnhancedToast.error('שגיאה בשיחה', 'נסה שוב');
    }
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);

    chatMutation.mutate(userMessage);
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt.text);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 left-6 z-50"
        style={{ maxWidth: isMinimized ? '300px' : '450px', width: '100%' }}
      >
        <Card className="bg-gray-900 border-2 border-purple-500 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">המאמן האישי שלך</h3>
                <p className="text-purple-100 text-xs">מונע על ידי AI מתקדם</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-950">
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}
                {chatMutation.isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-gray-400 text-sm">חושב...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length <= 1 && (
                <div className="p-3 bg-gray-900 border-t border-gray-800">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickPrompt(prompt)}
                        className="text-xs border-purple-700 text-purple-300 hover:bg-purple-900/30"
                      >
                        <prompt.icon className="w-3 h-3 ml-1" />
                        {prompt.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="כתוב הודעה..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                    disabled={chatMutation.isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || chatMutation.isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}