'use client'

/**
 * קומפוננטת קלט צ'אט — textarea עם שינוי גודל אוטומטי ושליחה ב-Enter
 * כפתור שליחה במיקום RTL-aware (start-3)
 * Enter שולח, Shift+Enter ירידת שורה
 */

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
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
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="pe-16 resize-none text-lg min-h-[80px] bg-gray-800 text-white border-purple-700 rounded-2xl"
        rows={2}
      />
      {/* כפתור שליחה — מיקום RTL-aware (start-3 = ימין ב-RTL) */}
      <Button
        type="submit"
        disabled={!message.trim() || disabled || isLoading}
        size="lg"
        className="absolute start-3 bottom-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </form>
  )
}
