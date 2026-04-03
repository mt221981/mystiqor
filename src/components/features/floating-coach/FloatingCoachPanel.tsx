'use client';

/**
 * חלונית מאמן AI מיני — מוצגת כשהבועה הצפה נלחצת
 *
 * מציגה שיחה קצרה (עד 5 הודעות אחרונות) עם מסר פתיחה רלוונטי לנתיב הנוכחי.
 * מתחברת לשירות ה-API המשותף ולחנות Zustand.
 * כוללת קישור לפתיחת השיחה המלאה בעמוד /coach.
 */

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFloatingCoachStore } from '@/stores/floating-coach';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  createConversation,
} from '@/services/coach/api';
import type { Message } from '@/services/coach/api';
import { ChatMessage } from '@/components/features/coach/ChatMessage';
import { ChatInput } from '@/components/features/coach/ChatInput';

// ===== קבועים =====

/** הודעות פתיחה לפי נתיב — ממוקדות בפעולות שהמשתמש זה עתה ביצע */
const OPENER_MESSAGES: Record<string, string> = {
  '/tools/astrology': 'ראיתי שקיבלת מפת לידה, רוצה לחקור יחד?',
  '/tools/tarot': 'קריאת טארוט מרתקת! רוצה שנצלול לתובנות?',
  '/tools/numerology': 'המספרים שלך מספרים סיפור, בוא נפענח',
  '/dashboard': 'מה נעשה היום? אני כאן בשבילך',
};

/** הודעת פתיחה ברירת-מחדל כשאין התאמה ספציפית לנתיב */
const DEFAULT_OPENER = 'שלום! איך אפשר לעזור?';

// ===== קומפוננטה =====

/**
 * חלונית מאמן AI מיני — נפתחת מעל הבועה הצפה
 * טוענת את השיחה האחרונה בפתיחה ומאפשרת שליחת הודעות חדשות
 */
export function FloatingCoachPanel() {
  const {
    isOpen,
    close,
    activeConversationId,
    setActiveConversationId,
    messages,
    setMessages,
    addMessage,
    isLoading,
    setIsLoading,
  } = useFloatingCoachStore();

  const pathname = usePathname();

  /** הודעת פתיחה לפי נתיב — לא נשמרת בחנות ולא נשלחת ל-API */
  const openerMessage = OPENER_MESSAGES[pathname] ?? DEFAULT_OPENER;

  // ===== טעינת שיחה בפתיחה =====

  useEffect(() => {
    if (!isOpen) return;

    /**
     * טוען את השיחה האחרונה בפתיחת החלונית
     * אם אין שיחות — ממתין להודעה ראשונה מהמשתמש
     */
    const loadLatestConversation = async () => {
      try {
        const conversations = await fetchConversations();
        const latest = conversations[0];
        if (latest) {
          setActiveConversationId(latest.id);
          const msgs = await fetchMessages(latest.id);
          // מציג רק 5 הודעות אחרונות בחלונית המצומצמת
          setMessages(msgs.slice(-5));
        }
      } catch {
        toast.error('לא הצלחנו לטעון את השיחה. רענן את הדף.');
      }
    };

    void loadLatestConversation();
  }, [isOpen, setActiveConversationId, setMessages]);

  // ===== שליחת הודעה =====

  /**
   * שולח הודעת משתמש — יוצר שיחה חדשה אם אין שיחה פעילה
   * מוסיף הודעת משתמש ותגובת מאמן לחנות
   * @param text - תוכן ההודעה
   */
  const handleSend = useCallback(
    async (text: string) => {
      setIsLoading(true);
      try {
        let conversationId = activeConversationId;

        // יצירת שיחה חדשה אם זו ההודעה הראשונה
        if (!conversationId) {
          const newConversation = await createConversation();
          conversationId = newConversation.id;
          setActiveConversationId(conversationId);
        }

        // הוספת הודעת המשתמש לתצוגה מיידית
        const userMessage: Message = { role: 'user', content: text };
        addMessage(userMessage);

        // שליחה ל-API וקבלת תגובת המאמן
        const assistantMessage = await sendMessage({
          conversation_id: conversationId,
          message: text,
        });
        addMessage(assistantMessage);
      } catch {
        toast.error('לא הצלחנו לשלוח את ההודעה. נסה שוב.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, setActiveConversationId, addMessage, setIsLoading]
  );

  // ===== רינדור =====

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 md:inset-x-auto md:end-6 md:w-96 md:bottom-24 glass-panel rounded-t-2xl md:rounded-2xl border border-border/20 flex flex-col"
          style={{ zIndex: 'var(--z-panel)', height: '420px' }}
        >
          {/* כותרת */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
            <span className="font-semibold text-sm text-foreground">מאמן AI</span>
            <button
              onClick={close}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              aria-label="סגור חלונית מאמן"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* אזור הודעות */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              /* הודעת פתיחה — לא מחנות, לא ל-API */
              <div className="bg-surface-container rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%] border border-border/20">
                <p className="text-sm text-foreground">{openerMessage}</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id ?? `msg-${idx}`}
                  message={msg}
                  isLast={idx === messages.length - 1}
                />
              ))
            )}

            {/* אינדיקטור טעינה */}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>המאמן מקליד...</span>
              </div>
            )}
          </div>

          {/* קלט שליחת הודעה */}
          <div className="px-3 pb-2 shrink-0">
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              isLoading={isLoading}
              placeholder="שאל את המאמן..."
            />
          </div>

          {/* קישור לשיחה המלאה */}
          <div className="px-4 pb-3 pt-1 shrink-0">
            <Link
              href="/coach"
              onClick={close}
              className="text-xs text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
            >
              פתח שיחה מלאה
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
