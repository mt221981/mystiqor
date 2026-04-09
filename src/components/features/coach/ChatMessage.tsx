'use client'

/**
 * קומפוננטת בועת צ'אט — מציגה הודעת משתמש או מאמן ב-RTL
 * הודעות משתמש: בועה עם גרדיאנט קוסמי (primary → secondary)
 * הודעות מאמן: בועה כהה surface-container עם react-markdown
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
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
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* בועת הודעה — ללא אווטאר, רוחב מלא יותר */}
      {isUser ? (
        /* הודעת משתמש — גרדיאנט קוסמי */
        <div className="bg-gradient-to-br from-primary-container to-secondary-container rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
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
        /* הודעת מאמן — surface-container עם markdown, רחבה יותר */
        <div className="bg-surface-container rounded-2xl rounded-br-sm px-4 py-3 max-w-[92%] border border-outline-variant/10">
          <div
            className="text-on-surface font-body text-sm prose prose-invert max-w-none
              [&>p]:my-2 [&>p]:leading-[1.7]
              [&>ul]:my-2 [&>ul]:ms-4 [&>ul]:list-disc
              [&>ol]:my-2 [&>ol]:ms-4 [&>ol]:list-decimal
              [&>li]:my-1 [&>li]:leading-[1.7]
              [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:mb-2 [&>h3]:text-primary
              [&>h4]:text-sm [&>h4]:font-bold [&>h4]:mt-2 [&>h4]:mb-1 [&>h4]:text-primary
              [&>strong]:text-on-surface [&>strong]:font-bold
              [&>blockquote]:border-s-4 [&>blockquote]:border-primary/40 [&>blockquote]:ps-4 [&>blockquote]:italic [&>blockquote]:text-on-surface-variant"
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
