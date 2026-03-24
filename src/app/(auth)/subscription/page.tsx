/**
 * דף ניהול מנוי — /subscription
 * מציג את הקומפוננטה המרכזית לניהול מנוי
 */

'use client';

import { SubscriptionManagement } from '@/components/features/subscription/SubscriptionManagement';

/** דף ניהול מנוי — עטיפה פשוטה עם כותרת */
export default function SubscriptionPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">ניהול מנוי</h1>
        <p className="mt-2 text-muted-foreground">
          צפה ונהל את פרטי המנוי שלך
        </p>
      </div>
      <SubscriptionManagement />
    </div>
  );
}
