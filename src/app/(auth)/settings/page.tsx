'use client';

/**
 * עמוד הגדרות — PROF-03
 * כולל: ערכת נושא (בהיר/כהה), הגדרות התראות (placeholder), העדפות AI
 * ErrorBoundary + Breadcrumbs
 */

import { useThemeStore } from '@/stores/theme';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <h1 className="text-2xl font-bold text-white">הגדרות</h1>
          <p className="text-gray-400 text-sm mt-1">
            נהל את העדפות המערכת שלך
          </p>
        </div>

        {/* ===== ערכת נושא ===== */}
        <Card className="bg-gray-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-indigo-400" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
              )}
              ערכת נושא
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              מצב נוכחי: <span className="text-white font-medium">{theme === 'dark' ? 'כהה' : 'בהיר'}</span>
            </p>

            {/* כפתורי בחירה */}
            <div className="flex gap-3">
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className={
                  theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-500'
                    : ''
                }
              >
                <Moon className="h-4 w-4 ml-1.5" />
                כהה
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className={
                  theme === 'light'
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                    : ''
                }
              >
                <Sun className="h-4 w-4 ml-1.5" />
                בהיר
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-400 hover:text-white"
              >
                החלף
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ===== הגדרות התראות (placeholder) ===== */}
        <Card className="bg-gray-900/50 border-white/10 opacity-60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-500" />
              הגדרות התראות
              <span className="text-xs font-normal text-gray-600 mr-auto">
                בקרוב
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              הגדרות התראות יהיו זמינות בקרוב
            </p>

            {/* toggles מושבתים */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-500">התראות אימייל</Label>
                  <p className="text-xs text-gray-600">קבל עדכונים לאימייל</p>
                </div>
                <Switch disabled checked={false} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-500 flex items-center gap-1.5">
                    <BellOff className="h-3.5 w-3.5" />
                    תזכורות
                  </Label>
                  <p className="text-xs text-gray-600">תזכורות לפעילויות יומיות</p>
                </div>
                <Switch disabled checked={false} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== העדפות AI ===== */}
        <Card className="bg-gray-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              העדפות AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-toggle">הצעות AI</Label>
                <p className="text-xs text-gray-400">
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
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
