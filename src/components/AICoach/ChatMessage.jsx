import React, { memo } from "react";
import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const ChatMessage = memo(({ message, isLast }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-blue-600 to-cyan-600' 
          : 'bg-gradient-to-br from-purple-600 to-pink-600'
      }`}>
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </div>

      <Card className={`max-w-[85%] ${
        isUser 
          ? 'bg-blue-900/40 border-blue-700/40' 
          : 'bg-purple-900/40 border-purple-700/40'
      } backdrop-blur-xl`}>
        <div className="p-5">
          {isUser ? (
            <p className="text-white text-lg leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown 
              className="text-white prose prose-invert prose-lg max-w-none
                [&>p]:my-3 [&>p]:leading-relaxed [&>p]:text-lg
                [&>ul]:my-3 [&>ul]:mr-4 [&>ul]:list-disc [&>ul]:text-lg
                [&>ol]:my-3 [&>ol]:mr-4 [&>ol]:list-decimal [&>ol]:text-lg
                [&>li]:my-2 [&>li]:leading-relaxed
                [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-3 [&>h3]:text-purple-200
                [&>h4]:text-xl [&>h4]:font-bold [&>h4]:mt-3 [&>h4]:mb-2 [&>h4]:text-purple-300
                [&>strong]:text-purple-200 [&>strong]:font-bold
                [&>blockquote]:border-r-4 [&>blockquote]:border-purple-500 [&>blockquote]:pr-4 [&>blockquote]:italic [&>blockquote]:text-purple-200"
            >
              {message.content}
            </ReactMarkdown>
          )}
          
          {message.created_date && (
            <div className={`text-xs mt-3 ${
              isUser ? 'text-blue-300' : 'text-purple-300'
            }`}>
              {new Date(message.created_date).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;