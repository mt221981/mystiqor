/** עמוד כלים מיסטיים — רשת 6 כלים עיקריים */

import { ToolGrid } from '@/components/features/shared/ToolGrid';
import { PageHeader } from '@/components/layouts/PageHeader';
import { GiSpellBook } from 'react-icons/gi';

/** עמוד כלים מיסטיים — יעד טאב הכלים בניווט התחתון */
export default function ToolsPage() {
  return (
    <div dir="rtl" className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeader
        title="כלים מיסטיים"
        description="בחר כלי לניתוח מיסטי מעמיק"
        icon={<GiSpellBook className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים' },
        ]}
      />
      <div className="mt-6">
        <ToolGrid />
      </div>
    </div>
  );
}
