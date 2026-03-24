'use client'

/**
 * קומפוננטת קלט צ'אט — textarea עם שינוי גודל אוטומטי ושליחה ב-Enter
 * כפתור שליחה במיקום RTL-aware (start-3)
 * Enter שולח, Shift+Enter ירידת שורה
 */

import { useState, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'

/** Props של קומפוננטת קלט הצ'אט */
interface ChatInputProps {
  /** פונקציה הנקראת עם ההודעה כשהמשתמש שולח */
  onSend: (message: string) => void
  /** האם הקלט מושבת (בזמן שליחה/טעינה) */
  disabled?: boolean
  /** האם מוצג אינדיקטור טעינה על הכפתור */
  isLoading?: boolean
  /** טקסט placeholder בשדה הקלט */
  placeholder?: string
}

/**
 * שדה קלט לצ'אט עם שינוי גודל אוטומטי ו-keyboard shortcuts
 * @param props - הגדרות הקלט
 */
export function ChatInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = 'כתוב את השאלה שלך כאן...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * שולח את ההודעה ומנקה את השדה
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled) return

    onSend(message.trim())
    setMessage('')

    // איפוס גובה ה-textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  /**
   * Enter ללא Shift שולח; Shift+Enter מוסיף שורה
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  /**
   * עדכון הטקסט ושינוי גובה ה-textarea בהתאם לתוכן
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // שינוי גובה אוטומטי — מוגבל ל-200px
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* מיכל קלט עם MD3 surface-container-lowest */}
      <div className="bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/10 focus-within:ring-1 focus-within:ring-primary/40">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="bg-transparent text-on-surface placeholder:text-outline/40 font-body resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 pe-14 min-h-[60px]"
          rows={2}
        />
      </div>
      {/* כפתור שליחה — מיקום RTL-aware (start-3 = ימין ב-RTL) */}
      <button
        type="submit"
        disabled={!message.trim() || disabled || isLoading}
        className="absolute start-3 bottom-3 bg-primary-container text-on-primary-container rounded-full p-2 hover:bg-primary-container/80 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="שלח הודעה"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  )
}
