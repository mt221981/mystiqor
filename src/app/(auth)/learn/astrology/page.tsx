'use client'

/**
 * דף מורה אסטרולוגיה — צ'אט AI חינוכי עם כפתורי מושגים מהירים
 *
 * מדוע: מאפשר למשתמש ללמוד אסטרולוגיה דרך שיחה עם AI שמכיר את הניתוחים שלו (GROW-04).
 * הדף מנהל את state ההודעות ושולח בקשות ל-/api/learn/tutor/astrology.
 */

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Stars } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layouts/PageHeader'
import { TutorChat, type ChatMessage } from '@/components/features/learn/TutorChat'
import { QuickConceptButtons, type Concept } from '@/components/features/learn/QuickConceptButtons'

// ===== קבועים =====

/** מושגים מהירים לאסטרולוגיה */
const ASTROLOGY_CONCEPTS: Concept[] = [
  { label: 'מה זה מזל עולה?', prompt: 'הסבר לי מה זה מזל עולה ואיך הוא משפיע על האישיות' },
  { label: 'כוכבי הלכת', prompt: 'ספר לי על כוכבי הלכת ומשמעותם באסטרולוגיה' },
  { label: 'בתים אסטרולוגיים', prompt: 'הסבר לי את 12 הבתים האסטרולוגיים' },
  { label: 'אספקטים', prompt: 'מהם אספקטים באסטרולוגיה ואילו סוגים יש?' },
  { label: 'טרנזיטים', prompt: 'הסבר לי מה זה טרנזיטים ואיך הם משפיעים' },
  { label: 'חזרת שמש', prompt: 'מהי חזרת שמש (Solar Return) ומה אפשר ללמוד ממנה?' },
]

// ===== פונקציות API =====

/** שליחת הודעה למורה אסטרולוגיה */
async function sendTutorMessage(message: string): Promise<ChatMessage> {
  const res = await fetch('/api/learn/tutor/astrology', {
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
 * AstrologyTutorPage — דף מורה אסטרולוגיה
 * מציג צ'אט עם 6 כפתורי מושגים מהירים
 */
export default function AstrologyTutorPage() {
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
        title="מורה אסטרולוגיה"
        description="שאל שאלות על אסטרולוגיה וקבל הסברים מותאמים אישית"
        icon={<Stars className="h-6 w-6 text-primary" />}
      />

      <div className="bg-surface-container rounded-xl border border-outline-variant/5 p-5">
        <h2 className="font-headline font-semibold text-on-surface text-base mb-4">נושאים נפוצים</h2>
        <QuickConceptButtons
          concepts={ASTROLOGY_CONCEPTS}
          onSelect={handleConceptSelect}
          disabled={mutation.isPending}
        />
      </div>

      <div className="bg-surface-container rounded-xl border border-outline-variant/5 p-5">
        <TutorChat
          messages={messages}
          isLoading={mutation.isPending}
          onSend={handleSend}
          placeholder="שאל שאלה על אסטרולוגיה..."
          emptyMessage="שאל שאלה על אסטרולוגיה או בחר נושא מלמעלה"
          externalInput={externalInput}
        />
      </div>
    </div>
  )
}
