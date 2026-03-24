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
        <h1 className="font-headline font-bold text-3xl text-on-surface">ניהול מנוי</h1>
        <p className="mt-2 font-body text-on-surface-variant">
          צפה ונהל את פרטי המנוי שלך
        </p>
      </div>
      <SubscriptionManagement />
    </div>
  );
}
