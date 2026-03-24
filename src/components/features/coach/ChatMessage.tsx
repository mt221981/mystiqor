'use client'

/**
 * קומפוננטת בועת צ'אט — מציגה הודעת משתמש או מאמן ב-RTL
 * הודעות משתמש מצד שמאל (flex-row-reverse ב-RTL), מאמן מצד ימין
 * הודעות מאמן מוצגות עם react-markdown לטיפול בעיצוב
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
import { User, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/** Props של קומפוננטת הודעת צ'אט */
interface ChatMessageProps {
  /** אובייקט ההודעה — תפקיד, תוכן וזמן יצירה אופציונלי */
  message: { role: string; content: string; created_at?: string | null }
  /** האם זו ההודעה האחרונה ברשימה */
  isLast?: boolean
}

/**
 * קומפוננטת בועת צ'אט — RTL עם אנימציה
 * ממומגנת עם memo למניעת רינדורים מיותרים
 */
export const ChatMessage = memo(function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* אווטאר — עיגול עם אייקון לפי תפקיד */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
            : 'bg-gradient-to-br from-purple-600 to-pink-600'
        }`}
      >
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </div>

      {/* כרטיס הודעה */}
      <Card
        className={`max-w-[85%] backdrop-blur-xl ${
          isUser
            ? 'bg-blue-900/40 border-blue-700/40'
            : 'bg-purple-900/40 border-purple-700/40'
        }`}
      >
        <div className="p-5">
          {isUser ? (
            /* הודעת משתמש — טקסט רגיל */
            <p className="text-white text-lg leading-relaxed">{message.content}</p>
          ) : (
            /* הודעת מאמן — markdown עם RTL, עטוף ב-div לעיצוב */
            <div
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* זמן שליחה — מוצג רק אם קיים */}
          {message.created_at && (
            <div
              className={`text-xs mt-3 ${
                isUser ? 'text-blue-300' : 'text-purple-300'
              }`}
            >
              {new Date(message.created_at).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
})

ChatMessage.displayName = 'ChatMessage'
