'use client'

/**
 * קומפוננטת בועת צ'אט — מציגה הודעת משתמש או מאמן ב-RTL
 * הודעות משתמש: בועה עם גרדיאנט קוסמי (primary → secondary)
 * הודעות מאמן: בועה כהה surface-container עם react-markdown
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
import { User, Sparkles } from 'lucide-react'
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
 * קומפוננטת בועת צ'אט — RTL עם אנימציה וצבעי MD3
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
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-primary-container to-secondary-container'
            : 'bg-primary-container/20 text-primary'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-primary" />
        )}
      </div>

      {/* בועת הודעה */}
      {isUser ? (
        /* הודעת משתמש — גרדיאנט קוסמי, זנב בפינה שמאל תחתון (RTL) */
        <div className="bg-gradient-to-br from-primary-container to-secondary-container rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
          <p className="text-white font-body text-sm">{message.content}</p>
          {message.created_at && (
            <p className="text-white/70 font-label text-xs mt-1">
              {new Date(message.created_at).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      ) : (
        /* הודעת מאמן — surface-container עם markdown, זנב בפינה ימין תחתון */
        <div className="bg-surface-container rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] border border-outline-variant/10">
          <div
            className="text-on-surface font-body text-sm prose prose-invert max-w-none
              [&>p]:my-2 [&>p]:leading-[1.7]
              [&>ul]:my-2 [&>ul]:mr-4 [&>ul]:list-disc
              [&>ol]:my-2 [&>ol]:mr-4 [&>ol]:list-decimal
              [&>li]:my-1 [&>li]:leading-[1.7]
              [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:mb-2 [&>h3]:text-primary
              [&>h4]:text-sm [&>h4]:font-bold [&>h4]:mt-2 [&>h4]:mb-1 [&>h4]:text-primary
              [&>strong]:text-on-surface [&>strong]:font-bold
              [&>blockquote]:border-r-4 [&>blockquote]:border-primary/40 [&>blockquote]:pr-4 [&>blockquote]:italic [&>blockquote]:text-on-surface-variant"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          {message.created_at && (
            <p className="text-on-surface-variant/80 font-label text-xs mt-1">
              {new Date(message.created_at).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
})

ChatMessage.displayName = 'ChatMessage'
