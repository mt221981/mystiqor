'use client';

/**
 * עמוד הגדרות — PROF-03
 * כולל: ערכת נושא (בהיר/כהה), הגדרות התראות (placeholder), העדפות AI
 * ErrorBoundary + Breadcrumbs
 */

import { useThemeStore } from '@/stores/theme';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Bell, BellOff, Brain } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query/cache-config';

// ===== טיפוסים =====

/** נתוני פרופיל מה-API (שדות רלוונטיים להגדרות) */
interface ProfileSettings {
  id: string;
  ai_suggestions_enabled: boolean | null;
}

// ===== פונקציות API =====

/** שליפת פרופיל */
async function fetchProfile(): Promise<ProfileSettings> {
  const res = await fetch('/api/profile');
  if (!res.ok) throw new Error('שגיאה בשליפת הגדרות');
  const json = await res.json() as { data: ProfileSettings };
  return json.data;
}

/** עדכון הגדרות AI */
async function updateAiSettings(ai_suggestions_enabled: boolean): Promise<void> {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ai_suggestions_enabled }),
  });
  if (!res.ok) {
    const json = await res.json() as { error?: string };
    throw new Error(json.error ?? 'שגיאה בעדכון הגדרות');
  }
}

// ===== קומפוננטה ראשית =====

/**
 * עמוד הגדרות — ערכת נושא, התראות, העדפות AI
 */
export default function SettingsPage() {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const queryClient = useQueryClient();

  // שאילתת פרופיל לנתוני AI
  const { data: profile } = useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: fetchProfile,
  });

  // Mutation לעדכון העדפות AI
  const aiMutation = useMutation({
    mutationFn: updateAiSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      toast.success('ההגדרות נשמרו');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'שגיאה בשמירת ההגדרות');
    },
  });

  const aiEnabled = profile?.ai_suggestions_enabled ?? true;

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-6 max-w-2xl" dir="rtl">
        {/* פירורי לחם */}
        <Breadcrumbs
          items={[
            { label: 'לוח בקרה', href: '/dashboard' },
            { label: 'הגדרות' },
          ]}
        />

        {/* כותרת */}
        <div>
          <h1 className="font-headline font-bold text-2xl text-on-surface">הגדרות</h1>
          <p className="font-body text-on-surface-variant text-sm mt-1">
            נהל את העדפות המערכת שלך
          </p>
        </div>

        {/* ===== ערכת נושא ===== */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
          <h2 className="font-label text-sm text-on-surface font-medium flex items-center gap-2 mb-4">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-secondary" />
            )}
            ערכת נושא
          </h2>
          <div className="space-y-4">
            <p className="font-body text-sm text-on-surface-variant">
              מצב נוכחי: <span className="text-on-surface font-medium">{theme === 'dark' ? 'כהה' : 'בהיר'}</span>
            </p>

            {/* כפתורי בחירה */}
            <div className="flex gap-3">
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className={
                  theme === 'dark'
                    ? 'bg-primary-container text-on-primary-container hover:bg-primary-container/80'
                    : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
                }
              >
                <Moon className="h-4 w-4 ms-1.5" />
                כהה
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className={
                  theme === 'light'
                    ? 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80'
                    : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
                }
              >
                <Sun className="h-4 w-4 ms-1.5" />
                בהיר
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-on-surface-variant hover:text-on-surface"
              >
                החלף
              </Button>
            </div>
          </div>
        </div>

        {/* ===== הגדרות התראות (placeholder) ===== */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5 opacity-60">
          <h2 className="font-label text-sm text-on-surface font-medium flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-on-surface-variant" />
            הגדרות התראות
            <span className="font-label text-xs font-normal text-on-surface-variant mr-auto">
              בקרוב
            </span>
          </h2>
          <div className="space-y-4">
            <p className="font-body text-sm text-on-surface-variant/80">
              הגדרות התראות יהיו זמינות בקרוב
            </p>

            {/* toggles מושבתים */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-label text-sm text-on-surface font-medium">התראות אימייל</Label>
                  <p className="font-body text-xs text-on-surface-variant">קבל עדכונים לאימייל</p>
                </div>
                <Switch disabled checked={false} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-label text-sm text-on-surface font-medium flex items-center gap-1.5">
                    <BellOff className="h-3.5 w-3.5" />
                    תזכורות
                  </Label>
                  <p className="font-body text-xs text-on-surface-variant">תזכורות לפעילויות יומיות</p>
                </div>
                <Switch disabled checked={false} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== העדפות AI ===== */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
          <h2 className="font-label text-sm text-on-surface font-medium flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-primary" />
            העדפות AI
          </h2>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-toggle" className="font-label text-sm text-on-surface font-medium">הצעות AI</Label>
              <p className="font-body text-xs text-on-surface-variant">
                אפשר ל-AI להציע תובנות ופעולות מותאמות אישית
              </p>
            </div>
            <Switch
              id="ai-toggle"
              checked={aiEnabled}
              disabled={aiMutation.isPending}
              onCheckedChange={(checked) =>
                aiMutation.mutate(checked)
              }
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
