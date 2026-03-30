'use client'

/**
 * דף מאמן AI — ממשק שיחה עם מאמן מיסטי אישי + לוח מסעות אימון
 *
 * שני טאבים: שיחות (ממשק שיחה עם סרגל צד) ומסעות (JourneysPanel).
 * מאמן מכיר את כל ניתוחי המשתמש ומספק הכוונה אישית.
 *
 * מדוע: ממשק ראשי של חווית האימון (COCH-01, COCH-02, COCH-03, COCH-04, COCH-05) —
 * המשתמש משוחח עם מאמן שמכיר את כל הניתוחים שלו ועוקב אחר מסעות אימון.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MessageCircle, Plus, Loader2, Menu, X, Map } from 'lucide-react'
import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { ChatMessage } from '@/components/features/coach/ChatMessage'
import { ChatInput } from '@/components/features/coach/ChatInput'
import { QuickActions } from '@/components/features/coach/QuickActions'
import { JourneysPanel } from '@/components/features/coach/JourneysPanel'
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
} from '@/services/coach/api'
import type { Conversation, Message } from '@/services/coach/api'

// ===== טיפוסים =====

/** טאב פעיל בדף */
type ActiveTab = 'chat' | 'journeys'

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

/** דף מאמן AI — ממשק שיחה + מסעות אימון */
export default function CoachPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
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
      setOptimisticMessages((prev) => [
        ...prev,
        { role: 'user', content: variables.message, created_at: new Date().toISOString() },
      ])
    },
    onSuccess: (reply) => {
      setOptimisticMessages((prev) => [...prev, reply])
      void queryClient.invalidateQueries({ queryKey: ['coach-messages', activeConversationId] })
      void queryClient.invalidateQueries({ queryKey: ['coach-conversations'] })
    },
    onError: () => {
      setOptimisticMessages([])
      toast.error('שגיאה בשליחת ההודעה')
    },
  })

  /** שליחת הודעה — יוצרת שיחה חדשה אם אין שיחה פעילה */
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) {
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
        {/* ===== בורר טאבים ===== */}
        <div className="mt-4 flex gap-2 border-b border-outline-variant/20 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 font-label text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'chat'
                ? 'border-primary bg-primary-container/20 text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            שיחות
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('journeys')}
            className={`flex items-center gap-2 px-4 py-2 font-label text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'journeys'
                ? 'border-primary bg-primary-container/20 text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Map className="w-4 h-4" />
            מסעות
          </button>
        </div>

        {/* ===== תוכן לפי טאב פעיל ===== */}
        {activeTab === 'journeys' ? (
          <div className="mt-4">
            <JourneysPanel />
          </div>
        ) : (
          <div className="flex gap-4 mt-4" style={{ minHeight: '600px' }}>
            {/* ===== סרגל צד — רשימת שיחות ===== */}
            <div
              className={`
                ${showSidebar ? 'flex' : 'hidden'} md:flex
                flex-col w-full md:w-72 shrink-0
                bg-surface-container border border-outline-variant/10 rounded-xl p-3
              `}
            >
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="mb-3 w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold hover:opacity-90 active:scale-95"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Plus className="w-4 h-4 ml-2" />
                )}
                שיחה חדשה
              </Button>

              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-center text-on-surface-variant font-body text-sm py-8">
                  עדיין אין שיחות — לחץ על &quot;שיחה חדשה&quot; להתחיל
                </p>
              ) : (
                <div className="flex flex-col gap-1 overflow-y-auto">
                  {conversations.map((conv) => (
                    <button
                      type="button"
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id)
                        setOptimisticMessages([])
                        setShowSidebar(false)
                      }}
                      className={`
                        w-full text-start p-3 rounded-lg transition-colors
                        ${activeConversationId === conv.id
                          ? 'border border-primary/40 bg-primary-container/20'
                          : 'hover:bg-surface-container-high border border-transparent'
                        }
                      `}
                    >
                      <p className="text-sm text-on-surface font-body font-medium truncate">
                        {conv.title ?? 'שיחה חדשה'}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {formatRelativeTime(conv.last_message_at)}
                        {conv.message_count ? ` · ${conv.message_count} הודעות` : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== אזור שיחה ===== */}
            <div className="flex flex-col flex-1 bg-surface-container border border-outline-variant/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-outline-variant/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-on-surface-variant hover:text-on-surface"
                  onClick={() => setShowSidebar((prev) => !prev)}
                >
                  {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
                <p className="text-sm text-on-surface-variant font-body">
                  {activeConversationId
                    ? conversations.find((c) => c.id === activeConversationId)?.title ?? 'שיחה'
                    : 'בחר שיחה או התחל חדשה'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '450px' }}>
                {!activeConversationId ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
                    <MessageCircle className="w-16 h-16 text-primary/20" />
                    <p className="text-on-surface-variant text-center font-body">
                      בחר שיחה קיימת או לחץ על &quot;שיחה חדשה&quot; להתחיל
                    </p>
                    <QuickActions
                      onAction={(prompt) => void handleSendMessage(prompt)}
                      disabled={sendMutation.isPending}
                    />
                  </div>
                ) : isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-6 py-8">
                    <p className="text-on-surface-variant text-center text-sm font-body">
                      שלום! אני המאמן האישי שלך. שאל אותי כל שאלה או בחר נושא:
                    </p>
                    <QuickActions
                      onAction={(prompt) => void handleSendMessage(prompt)}
                      disabled={sendMutation.isPending}
                    />
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <ChatMessage
                        key={msg.id ?? `msg-${idx}`}
                        message={msg}
                        isLast={idx === messages.length - 1}
                      />
                    ))}
                    {sendMutation.isPending && (
                      <div className="flex gap-3 flex-row">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary-container/20">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        </div>
                        <div className="bg-surface-container rounded-2xl rounded-br-sm px-4 py-3 border border-outline-variant/10">
                          <span className="text-on-surface-variant font-body text-sm">המאמן מקליד...</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-outline-variant/10">
                <ChatInput
                  onSend={(text) => void handleSendMessage(text)}
                  disabled={sendMutation.isPending}
                  isLoading={sendMutation.isPending}
                  placeholder="שאל את המאמן שלך..."
                />
              </div>
            </div>
          </div>
        )}
      </SubscriptionGuard>
    </div>
  )
}
