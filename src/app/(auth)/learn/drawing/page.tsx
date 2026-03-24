'use client'

/**
 * דף מורה ציור ואמנות — צ'אט AI חינוכי עם כפתורי מושגים מהירים
 *
 * מדוע: מאפשר למשתמש ללמוד ניתוח ציורים (HTP, Koppitz, FDM) דרך שיחה עם AI
 * שמכיר את הניתוחים שלו (GROW-05).
 * הדף מנהל את state ההודעות ושולח בקשות ל-/api/learn/tutor/drawing.
 */

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Palette } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layouts/PageHeader'
import { TutorChat, type ChatMessage } from '@/components/features/learn/TutorChat'
import { QuickConceptButtons, type Concept } from '@/components/features/learn/QuickConceptButtons'

// ===== קבועים =====

/** מושגים מהירים לניתוח ציורים */
const DRAWING_CONCEPTS: Concept[] = [
  { label: 'מה זה HTP?', prompt: 'הסבר לי את שיטת HTP — בית, עץ, אדם' },
  { label: 'ציון Koppitz', prompt: 'מהו ציון Koppitz ואיך מחשבים אותו?' },
  { label: 'מודל FDM', prompt: 'הסבר לי את מודל FDM לניתוח ציורים' },
  { label: 'משמעות צבעים', prompt: 'מה משמעות הצבעים השונים בציורי ילדים?' },
  { label: 'קומפוזיציה', prompt: 'איך מנתחים קומפוזיציה ומיקום בציור?' },
]

// ===== פונקציות API =====

/** שליחת הודעה למורה ניתוח ציורים */
async function sendTutorMessage(message: string): Promise<ChatMessage> {
  const res = await fetch('/api/learn/tutor/drawing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error ?? 'שגיאה בשליחת ההודעה')
  }
  const json = (await res.json()) as { data: ChatMessage }
  return json.data
}

// ===== קומפוננט ראשי =====

/**
 * DrawingTutorPage — דף מורה ציור ואמנות
 * מציג צ'אט עם 5 כפתורי מושגים מהירים
 */
export default function DrawingTutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [externalInput, setExternalInput] = useState<string>('')

  // מוטציה לשליחת הודעה ל-API
  const mutation = useMutation({
    mutationFn: sendTutorMessage,
    onSuccess: (reply, sentMessage) => {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: sentMessage },
        { role: 'assistant', content: reply.content },
      ])
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'שגיאה בשליחת ההודעה')
    },
  })

  /** שליחת הודעה — מופעל גם מהצ'אט וגם מהכפתורים המהירים */
  const handleSend = useCallback(
    (message: string) => {
      if (!message.trim() || mutation.isPending) return
      mutation.mutate(message)
      setExternalInput('')
    },
    [mutation]
  )

  /** בחירת מושג מהיר — ממלא את שדה הקלט ושולח */
  const handleConceptSelect = useCallback(
    (prompt: string) => {
      setExternalInput(prompt)
      handleSend(prompt)
    },
    [handleSend]
  )

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <PageHeader
        title="מורה ציור ואמנות"
        description="שאל שאלות על ניתוח ציורים וקבל הסברים מותאמים אישית"
        icon={<Palette className="h-6 w-6 text-primary" />}
      />

      <div className="bg-surface-container rounded-xl border border-outline-variant/5 p-5">
        <h2 className="font-headline font-semibold text-on-surface text-base mb-4">נושאים נפוצים</h2>
        <QuickConceptButtons
          concepts={DRAWING_CONCEPTS}
          onSelect={handleConceptSelect}
          disabled={mutation.isPending}
        />
      </div>

      <div className="bg-surface-container rounded-xl border border-outline-variant/5 p-5">
        <TutorChat
          messages={messages}
          isLoading={mutation.isPending}
          onSend={handleSend}
          placeholder="שאל שאלה על ניתוח ציורים..."
          emptyMessage="שאל שאלה על ניתוח ציורים או בחר נושא מלמעלה"
          externalInput={externalInput}
        />
      </div>
    </div>
  )
}
