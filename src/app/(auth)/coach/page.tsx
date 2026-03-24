'use client'

/**
 * דף מאמן AI — ממשק שיחה עם מאמן מיסטי אישי
 * כולל: רשימת שיחות בסרגל צד, אזור שיחה עם בועות RTL,
 * שדה קלט עם שינוי גודל אוטומטי ופעולות מהירות
 *
 * מדוע: הממשק הראשי של חווית האימון (COCH-01, COCH-02, COCH-05) —
 * המשתמש משוחח עם מאמן שמכיר את כל הניתוחים שלו.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MessageCircle, Plus, Loader2, Menu, X } from 'lucide-react'
import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { ChatMessage } from '@/components/features/coach/ChatMessage'
import { ChatInput } from '@/components/features/coach/ChatInput'
import { QuickActions } from '@/components/features/coach/QuickActions'

// ===== טיפוסים =====

/** שורת שיחה */
interface Conversation {
  id: string
  title: string | null
  last_message_at: string | null
  message_count: number | null
  created_at: string | null
}

/** שורת הודעה */
interface Message {
  id?: string
  role: string
  content: string
  created_at?: string | null
}

// ===== פונקציות API =====

/** שליפת רשימת שיחות */
async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch('/api/coach/conversations')
  if (!res.ok) throw new Error('שגיאה בטעינת השיחות')
  const json = (await res.json()) as { data: Conversation[] }
  return json.data ?? []
}

/** יצירת שיחה חדשה */
async function createConversation(): Promise<Conversation> {
  const res = await fetch('/api/coach/conversations', { method: 'POST' })
  if (!res.ok) throw new Error('שגיאה ביצירת שיחה')
  const json = (await res.json()) as { data: Conversation }
  return json.data
}

/** שליפת הודעות לשיחה */
async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/coach/messages?conversation_id=${conversationId}`)
  if (!res.ok) throw new Error('שגיאה בטעינת ההודעות')
  const json = (await res.json()) as { data: Message[] }
  return json.data ?? []
}

/** שליחת הודעה ושמירת תגובה */
async function sendMessage(data: { conversation_id: string; message: string }): Promise<Message> {
  const res = await fetch('/api/coach/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בשליחת ההודעה' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בשליחת ההודעה')
  }
  const json = (await res.json()) as { data: Message }
  return json.data
}

// ===== פונקציות עזר =====

/** פורמט זמן יחסי בעברית */
function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'עכשיו'
  if (diffMins < 60) return `לפני ${diffMins} דק'`
  if (diffHours < 24) return `לפני ${diffHours} שע'`
  if (diffDays === 1) return 'אתמול'
  return `לפני ${diffDays} ימים`
}

// ===== קומפוננטה =====

/** דף מאמן AI — ממשק שיחה מלא */
export default function CoachPage() {
  const queryClient = useQueryClient()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // שליפת רשימת שיחות
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['coach-conversations'],
    queryFn: fetchConversations,
  })

  // שליפת הודעות לשיחה הפעילה
  const { data: serverMessages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['coach-messages', activeConversationId],
    queryFn: () => fetchMessages(activeConversationId!),
    enabled: !!activeConversationId,
  })

  // מיזוג הודעות שרת עם הודעות אופטימיסטיות
  const messages: Message[] = optimisticMessages.length > 0
    ? [...serverMessages.filter((m) => !optimisticMessages.some((o) => o.content === m.content && o.role === m.role)), ...optimisticMessages]
    : serverMessages

  // גלילה אוטומטית לתחתית כשמגיעות הודעות חדשות
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ניקוי הודעות אופטימיסטיות כשהשרת מחזיר תוצאות
  useEffect(() => {
    if (serverMessages.length > 0) {
      setOptimisticMessages([])
    }
  }, [serverMessages])

  // מוטציה ליצירת שיחה חדשה
  const createMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (newConv) => {
      void queryClient.invalidateQueries({ queryKey: ['coach-conversations'] })
      setActiveConversationId(newConv.id)
      setShowSidebar(false)
    },
    onError: () => {
      toast.error('שגיאה ביצירת שיחה חדשה')
    },
  })

  // מוטציה לשליחת הודעה
  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onMutate: (variables) => {
      // עדכון אופטימיסטי — הוספת הודעת משתמש מיידית
      setOptimisticMessages((prev) => [
        ...prev,
        { role: 'user', content: variables.message, created_at: new Date().toISOString() },
      ])
    },
    onSuccess: (reply) => {
      // הוספת תגובת המאמן ל-cache
      setOptimisticMessages((prev) => [...prev, reply])
      void queryClient.invalidateQueries({ queryKey: ['coach-messages', activeConversationId] })
      void queryClient.invalidateQueries({ queryKey: ['coach-conversations'] })
    },
    onError: () => {
      // הסרת הודעה אופטימיסטית בשגיאה
      setOptimisticMessages([])
      toast.error('שגיאה בשליחת ההודעה')
    },
  })

  /** שליחת הודעה — יוצרת שיחה חדשה אם אין שיחה פעילה */
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) {
        // יצירת שיחה חדשה ואז שליחת ההודעה
        try {
          const newConv = await createConversation()
          void queryClient.invalidateQueries({ queryKey: ['coach-conversations'] })
          setActiveConversationId(newConv.id)
          setShowSidebar(false)
          sendMutation.mutate({ conversation_id: newConv.id, message: text })
        } catch {
          toast.error('שגיאה ביצירת שיחה')
        }
        return
      }
      sendMutation.mutate({ conversation_id: activeConversationId, message: text })
    },
    [activeConversationId, sendMutation, queryClient]
  )

  return (
    <div dir="rtl" className="container mx-auto px-4 py-6 max-w-6xl">
      <PageHeader
        title="מאמן AI אישי"
        description="שוחח עם המאמן האישי שלך — הוא מכיר את כל הניתוחים שלך"
        icon={<MessageCircle className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'מאמן AI' },
        ]}
      />

      <SubscriptionGuard feature="analyses">
        <div className="flex gap-4 mt-4" style={{ minHeight: '600px' }}>

          {/* ===== סרגל צד — רשימת שיחות ===== */}
          <div
            className={`
              ${showSidebar ? 'flex' : 'hidden'} md:flex
              flex-col w-full md:w-72 shrink-0
              bg-gray-900/50 border border-purple-500/20 rounded-xl p-3
            `}
          >
            {/* כפתור שיחה חדשה */}
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="mb-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Plus className="w-4 h-4 ml-2" />
              )}
              שיחה חדשה
            </Button>

            {/* רשימת שיחות */}
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">
                עדיין אין שיחות — לחץ על &quot;שיחה חדשה&quot; להתחיל
              </p>
            ) : (
              <div className="flex flex-col gap-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id)
                      setOptimisticMessages([])
                      setShowSidebar(false)
                    }}
                    className={`
                      w-full text-start p-3 rounded-lg transition-colors
                      ${activeConversationId === conv.id
                        ? 'border border-purple-500 bg-purple-900/30'
                        : 'hover:bg-gray-800/50 border border-transparent'
                      }
                    `}
                  >
                    <p className="text-sm text-white font-medium truncate">
                      {conv.title ?? 'שיחה חדשה'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatRelativeTime(conv.last_message_at)}
                      {conv.message_count ? ` · ${conv.message_count} הודעות` : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== אזור שיחה ===== */}
          <div className="flex flex-col flex-1 bg-gray-900/50 border border-purple-500/20 rounded-xl overflow-hidden">

            {/* כותרת אזור שיחה + כפתור toggle למובייל */}
            <div className="flex items-center justify-between p-3 border-b border-purple-500/20">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setShowSidebar((prev) => !prev)}
              >
                {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <p className="text-sm text-gray-400">
                {activeConversationId
                  ? conversations.find((c) => c.id === activeConversationId)?.title ?? 'שיחה'
                  : 'בחר שיחה או התחל חדשה'}
              </p>
            </div>

            {/* רשימת הודעות */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '450px' }}>
              {!activeConversationId ? (
                /* מצב ראשוני — בחר שיחה */
                <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
                  <MessageCircle className="w-16 h-16 text-purple-400/40" />
                  <p className="text-gray-500 text-center">
                    בחר שיחה קיימת או לחץ על &quot;שיחה חדשה&quot; להתחיל
                  </p>
                  <QuickActions
                    onAction={(prompt) => void handleSendMessage(prompt)}
                    disabled={sendMutation.isPending}
                  />
                </div>
              ) : isLoadingMessages ? (
                /* טעינת הודעות */
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                </div>
              ) : messages.length === 0 ? (
                /* שיחה ריקה — הצגת פעולות מהירות */
                <div className="flex flex-col items-center gap-6 py-8">
                  <p className="text-gray-500 text-center text-sm">
                    שלום! אני המאמן האישי שלך. שאל אותי כל שאלה או בחר נושא:
                  </p>
                  <QuickActions
                    onAction={(prompt) => void handleSendMessage(prompt)}
                    disabled={sendMutation.isPending}
                  />
                </div>
              ) : (
                /* הודעות שיחה */
                <>
                  {messages.map((msg, idx) => (
                    <ChatMessage
                      key={msg.id ?? `msg-${idx}`}
                      message={msg}
                      isLast={idx === messages.length - 1}
                    />
                  ))}
                  {/* אינדיקטור הקלדה של המאמן */}
                  {sendMutation.isPending && (
                    <div className="flex gap-3 flex-row">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-600 to-pink-600">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                      <Card className="bg-purple-900/40 border-purple-700/40 backdrop-blur-xl p-4">
                        <span className="text-purple-300 text-sm">המאמן מקליד...</span>
                      </Card>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* שדה קלט */}
            <div className="p-4 border-t border-purple-500/20">
              <ChatInput
                onSend={(text) => void handleSendMessage(text)}
                disabled={sendMutation.isPending}
                isLoading={sendMutation.isPending}
                placeholder="שאל את המאמן שלך..."
              />
            </div>
          </div>
        </div>
      </SubscriptionGuard>
    </div>
  )
}
