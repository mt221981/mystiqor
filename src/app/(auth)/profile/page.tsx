'use client';

/**
 * עמוד פרופיל — PROF-01 + PROF-02
 * לשונית 1: עריכת פרופיל אישי
 * לשונית 2: ניהול פרופילים אורחים
 * כולל ErrorBoundary, Breadcrumbs, React Query
 */

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProfileEditForm } from '@/components/features/profile/ProfileEditForm';
import { GuestProfileList } from '@/components/features/profile/GuestProfileList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
import { queryKeys } from '@/lib/query/cache-config';
import type { ProfileFormData } from '@/lib/validations/profile';

// ===== קבועים =====

/** מגבלת ברירת מחדל לפרופילים אורחים אם אין מנוי */
const DEFAULT_GUEST_LIMIT = 1;

// ===== טיפוסים =====

/** נתוני פרופיל מה-API */
interface ProfileRow {
  id: string;
  full_name: string;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
  gender: string | null;
  disciplines: string[] | null;
  focus_areas: string[] | null;
  personal_goals: string[] | null;
  ai_suggestions_enabled: boolean | null;
}

/** נתוני פרופיל אורח מה-API */
interface GuestProfileRow {
  id: string;
  full_name: string;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
  relationship: string | null;
}

/** נתוני מנוי מה-API */
interface SubscriptionRow {
  guest_profiles_limit: number;
  plan_type: string;
}

// ===== פונקציות API =====

/** שליפת פרופיל נוכחי */
async function fetchProfile(): Promise<ProfileRow> {
  const res = await fetch('/api/profile');
  if (!res.ok) throw new Error('שגיאה בשליפת פרופיל');
  const json = await res.json() as { data: ProfileRow };
  return json.data;
}

/** עדכון פרופיל */
async function updateProfile(data: Partial<ProfileFormData>): Promise<ProfileRow> {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json() as { error?: string };
    throw new Error(json.error ?? 'שגיאה בעדכון פרופיל');
  }
  const json = await res.json() as { data: ProfileRow };
  return json.data;
}

/** שליפת פרופילים אורחים */
async function fetchGuestProfiles(): Promise<GuestProfileRow[]> {
  const res = await fetch('/api/guest-profiles');
  if (!res.ok) throw new Error('שגיאה בשליפת פרופילים אורחים');
  const json = await res.json() as { data: GuestProfileRow[] };
  return json.data;
}

/** שליפת נתוני מנוי */
async function fetchSubscription(): Promise<SubscriptionRow | null> {
  const res = await fetch('/api/subscription');
  if (!res.ok) return null;
  const json = await res.json() as { data?: SubscriptionRow };
  return json.data ?? null;
}

/** יצירת פרופיל אורח */
async function createGuestProfile(data: Record<string, unknown>): Promise<GuestProfileRow> {
  const res = await fetch('/api/guest-profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json() as { error?: string };
    throw new Error(json.error ?? 'שגיאה ביצירת פרופיל אורח');
  }
  const json = await res.json() as { data: GuestProfileRow };
  return json.data;
}

/** עדכון פרופיל אורח */
async function updateGuestProfile(id: string, data: Record<string, unknown>): Promise<GuestProfileRow> {
  const res = await fetch(`/api/guest-profiles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json() as { error?: string };
    throw new Error(json.error ?? 'שגיאה בעדכון פרופיל אורח');
  }
  const json = await res.json() as { data: GuestProfileRow };
  return json.data;
}

/** מחיקת פרופיל אורח */
async function deleteGuestProfile(id: string): Promise<void> {
  const res = await fetch(`/api/guest-profiles/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const json = await res.json() as { error?: string };
    throw new Error(json.error ?? 'שגיאה במחיקת פרופיל אורח');
  }
}

// ===== Skeleton =====

/** Skeleton לטעינת פרופיל */
function ProfileSkeleton() {
  return (
    <div className="space-y-4 bg-surface-container/60 rounded-xl p-6 border border-outline-variant/10">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <MysticSkeleton className="h-4 w-24" />
          <MysticSkeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/**
 * עמוד פרופיל — טאבים: פרופיל אישי + פרופילים אורחים
 */
export default function ProfilePage() {
  const queryClient = useQueryClient();

  // שאילתת פרופיל
  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: fetchProfile,
  });

  // שאילתת פרופילים אורחים
  const {
    data: guestProfiles = [],
    isLoading: guestsLoading,
  } = useQuery({
    queryKey: ['guest-profiles'],
    queryFn: fetchGuestProfiles,
  });

  // שאילתת מנוי
  const { data: subscription } = useQuery({
    queryKey: queryKeys.subscription.current(),
    queryFn: fetchSubscription,
  });

  const guestLimit = subscription?.guest_profiles_limit ?? DEFAULT_GUEST_LIMIT;

  // Mutation: עדכון פרופיל
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      toast.success('הפרופיל עודכן בהצלחה');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'שגיאה בעדכון הפרופיל');
    },
  });

  // Mutation: יצירת פרופיל אורח
  const addGuestMutation = useMutation({
    mutationFn: createGuestProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-profiles'] });
      toast.success('פרופיל אורח נוצר בהצלחה');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'שגיאה ביצירת פרופיל אורח');
    },
  });

  // Mutation: עדכון פרופיל אורח
  const editGuestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateGuestProfile(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-profiles'] });
      toast.success('פרופיל אורח עודכן בהצלחה');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'שגיאה בעדכון פרופיל אורח');
    },
  });

  // Mutation: מחיקת פרופיל אורח
  const deleteGuestMutation = useMutation({
    mutationFn: deleteGuestProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-profiles'] });
      toast.success('פרופיל אורח נמחק');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'שגיאה במחיקת פרופיל אורח');
    },
  });

  const isGuestLoading =
    addGuestMutation.isPending ||
    editGuestMutation.isPending ||
    deleteGuestMutation.isPending;

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-6" dir="rtl">
        {/* פירורי לחם */}
        <Breadcrumbs
          items={[
            { label: 'לוח בקרה', href: '/dashboard' },
            { label: 'פרופיל' },
          ]}
        />

        {/* כותרת */}
        <div>
          <h1 className="font-headline font-bold text-2xl text-on-surface">הפרופיל שלי</h1>
          <p className="font-body text-on-surface-variant text-sm mt-1">
            נהל את פרטיך האישיים ופרופילי האורחים שלך
          </p>
        </div>

        {/* טאבים */}
        <Tabs defaultValue="profile" dir="rtl">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="profile">הפרופיל שלי</TabsTrigger>
            <TabsTrigger value="guests">פרופילים אורחים</TabsTrigger>
          </TabsList>

          {/* לשונית פרופיל אישי */}
          <TabsContent value="profile" className="mt-6">
            <div className="max-w-lg">
              {profileLoading || !profile ? (
                <ProfileSkeleton />
              ) : (
                <ProfileEditForm
                  profile={{
                    ...profile,
                    disciplines: profile.disciplines ?? [],
                    focus_areas: profile.focus_areas ?? [],
                    personal_goals: profile.personal_goals ?? [],
                    birth_date: profile.birth_date,
                    full_name: profile.full_name,
                  }}
                  onSubmit={(data) => updateMutation.mutate(data)}
                  isLoading={updateMutation.isPending}
                />
              )}
            </div>
          </TabsContent>

          {/* לשונית פרופילים אורחים */}
          <TabsContent value="guests" className="mt-6">
            {guestsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <MysticSkeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <GuestProfileList
                guestProfiles={guestProfiles}
                limit={guestLimit}
                onAdd={(data) => addGuestMutation.mutate(data)}
                onEdit={(id, data) => editGuestMutation.mutate({ id, data })}
                onDelete={(id) => deleteGuestMutation.mutate(id)}
                isLoading={isGuestLoading}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
