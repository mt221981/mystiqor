/**
 * TutorChat — קומפוננט תצוגה של צ'אט עם מורה AI
 * מציג הודעות, שדה קלט ולחצן שליחה.
 * הדף האב מחזיק את ה-state ומעביר onSend + messages כ-props.
 */

'use client'

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/** הודעה בצ'אט */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Props לקומפוננט TutorChat */
interface TutorChatProps {
  /** מערך הודעות להצגה */
  messages: ChatMessage[]
  /** האם בטעינה (מחכה לתגובת ה-AI) */
  isLoading: boolean
  /** פונקציה לשליחת הודעה */
  onSend: (message: string) => void
  /** טקסט placeholder בשדה הקלט */
  placeholder?: string
  /** הודעה כשאין הודעות (מצב ריק) */
  emptyMessage?: string
  /** ערך חיצוני לאכלוס שדה הקלט (מהכפתורים המהירים) */
  externalInput?: string
}

/**
 * TutorChat — ממשק צ'אט עם מורה AI
 * תצוגה בלבד — הדף האב מנהל state ומציג הודעות
 *
 * @param messages - רשימת הודעות להצגה
 * @param isLoading - האם ממתין לתגובת AI
 * @param onSend - callback לשליחת הודעה
 * @param placeholder - טקסט ב-input
 * @param emptyMessage - הודעה במצב ריק
 * @param externalInput - קלט חיצוני מכפתורים מהירים
 */
export function TutorChat({
  messages,
  isLoading,
  onSend,
  placeholder = 'כתוב שאלה...',
  emptyMessage = 'שלח שאלה כדי להתחיל',
  externalInput,
}: TutorChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // גלילה אוטומטית לתחתית כשמתווספות הודעות
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // אכלוס שדה הקלט מקלט חיצוני (כפתורים מהירים)
  useEffect(() => {
    if (externalInput) {
      setInput(externalInput)
    }
  }, [externalInput])

  /** שליחת הודעה */
  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
  }

  /** שליחה עם Enter */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* אזור הודעות */}
      <div className="max-h-[500px] overflow-y-auto rounded-lg border bg-background p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center text-sm py-8">{emptyMessage}</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-purple-600/20 text-end'
                    : 'bg-muted text-start'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {/* אינדיקטור טעינה */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* שדה קלט + כפתור שליחה */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
          dir="rtl"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          size="icon"
          aria-label="שלח הודעה"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
