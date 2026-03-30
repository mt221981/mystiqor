/**
 * שירות API של מאמן AI — פונקציות שיתופיות לשיחות והודעות
 *
 * מדוע: דף המאמן (coach/page.tsx) וחלונית המאמן הצפה (FloatingCoachPanel)
 * שניהם צריכים אותן פונקציות ו-types — ריכוזן כאן מונע כפילות וקובע
 * מקור אמת יחיד.
 */

// ===== טיפוסים =====

/** שורת שיחה עם מאמן */
export interface Conversation {
  id: string;
  title: string | null;
  last_message_at: string | null;
  message_count: number | null;
  created_at: string | null;
}

/** שורת הודעה בשיחה */
export interface Message {
  id?: string;
  role: string;
  content: string;
  created_at?: string | null;
}

// ===== פונקציות API =====

/**
 * שולף את רשימת השיחות של המשתמש המחובר
 * @returns מערך שיחות ממוין לפי עדכון אחרון
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch('/api/coach/conversations');
  if (!res.ok) throw new Error('שגיאה בטעינת השיחות');
  const json = (await res.json()) as { data: Conversation[] };
  return json.data ?? [];
}

/**
 * יוצר שיחה חדשה עבור המשתמש המחובר
 * @returns השיחה החדשה שנוצרה
 */
export async function createConversation(): Promise<Conversation> {
  const res = await fetch('/api/coach/conversations', { method: 'POST' });
  if (!res.ok) throw new Error('שגיאה ביצירת שיחה');
  const json = (await res.json()) as { data: Conversation };
  return json.data;
}

/**
 * שולף את ההודעות של שיחה ספציפית
 * @param conversationId - מזהה השיחה
 * @returns מערך הודעות ממוין לפי זמן יצירה
 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/coach/messages?conversation_id=${conversationId}`);
  if (!res.ok) throw new Error('שגיאה בטעינת ההודעות');
  const json = (await res.json()) as { data: Message[] };
  return json.data ?? [];
}

/**
 * שולח הודעת משתמש ומחזיר את תגובת המאמן
 * @param data - מזהה השיחה ותוכן ההודעה לשליחה
 * @returns הודעת התגובה של המאמן
 */
export async function sendMessage(data: {
  conversation_id: string;
  message: string;
}): Promise<Message> {
  const res = await fetch('/api/coach/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בשליחת ההודעה' }));
    throw new Error((err as { error?: string }).error ?? 'שגיאה בשליחת ההודעה');
  }
  const json = (await res.json()) as { data: Message };
  return json.data;
}
