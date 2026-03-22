/**
 * רשימת פרופילים אורחים — PROF-02
 * הצגת פרופילים אורחים עם הוספה/עריכה/מחיקה
 * כפתור הוספה מושבת כשמגיעים למגבלה
 * Dialog עם שדות נתוני לידה לכל פרופיל
 */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, User } from 'lucide-react';

// ===== סכמת אימות =====

/** סכמת אימות לטופס פרופיל אורח */
const GuestFormSchema = z.object({
  full_name: z
    .string()
    .min(2, 'שם חייב להכיל לפחות 2 תווים')
    .max(100, 'שם לא יכול להכיל יותר מ-100 תווים'),
  birth_date: z
    .string()
    .min(1, 'תאריך לידה הוא שדה חובה')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'פורמט תאריך לא תקין'),
  birth_time: z.string().optional(),
  birth_place: z.string().max(200).optional(),
  relationship: z.string().max(100).optional(),
});

/** טיפוס ערכי הטופס */
type GuestFormValues = z.infer<typeof GuestFormSchema>;

// ===== טיפוסים =====

/** פרופיל אורח */
interface GuestProfile {
  id: string;
  full_name: string;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
  relationship: string | null;
}

/** מאפייני רשימת פרופילים אורחים */
interface GuestProfileListProps {
  /** רשימת פרופילים קיימת */
  readonly guestProfiles: GuestProfile[];
  /** מגבלת פרופילים לפי מנוי */
  readonly limit: number;
  /** callback להוספה */
  readonly onAdd: (data: Record<string, unknown>) => void;
  /** callback לעריכה */
  readonly onEdit: (id: string, data: Record<string, unknown>) => void;
  /** callback למחיקה */
  readonly onDelete: (id: string) => void;
  /** מצב טעינה */
  readonly isLoading?: boolean;
}

// ===== קומפוננטה ראשית =====

/**
 * רשימת פרופילים אורחים עם CRUD מלא
 * כולל אינדיקציה למגבלת תוכנית
 */
export function GuestProfileList({
  guestProfiles,
  limit,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: GuestProfileListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GuestProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const atLimit = guestProfiles.length >= limit;

  // טופס הוספה
  const addForm = useForm<GuestFormValues>({
    resolver: zodResolver(GuestFormSchema),
    defaultValues: {
      full_name: '',
      birth_date: '',
      birth_time: '',
      birth_place: '',
      relationship: '',
    },
  });

  // טופס עריכה
  const editForm = useForm<GuestFormValues>({
    resolver: zodResolver(GuestFormSchema),
  });

  /** פתיחת dialog עריכה עם פרה-פיל */
  const openEdit = (profile: GuestProfile) => {
    setEditTarget(profile);
    editForm.reset({
      full_name: profile.full_name,
      birth_date: profile.birth_date,
      birth_time: profile.birth_time ?? '',
      birth_place: profile.birth_place ?? '',
      relationship: profile.relationship ?? '',
    });
  };

  /** שליחת טופס הוספה */
  const handleAdd = (data: GuestFormValues) => {
    onAdd(data as Record<string, unknown>);
    addForm.reset();
    setAddOpen(false);
  };

  /** שליחת טופס עריכה */
  const handleEdit = (data: GuestFormValues) => {
    if (!editTarget) return;
    onEdit(editTarget.id, data as Record<string, unknown>);
    setEditTarget(null);
  };

  /** אישור מחיקה */
  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* כותרת + מונה + כפתור הוספה */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-300">
            {guestProfiles.length}/{limit} פרופילים אורחים
          </h3>
          {atLimit && (
            <p className="text-xs text-amber-400 mt-0.5">
              הגעת למגבלת הפרופילים בתוכנית שלך
            </p>
          )}
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          disabled={atLimit || isLoading}
          size="sm"
          className="gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
          aria-label="הוסף פרופיל אורח"
        >
          <Plus className="h-4 w-4" />
          הוסף פרופיל אורח
        </Button>
      </div>

      {/* רשימת פרופילים */}
      {guestProfiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>אין פרופילים אורחים עדיין</p>
          <p className="text-sm mt-1">הוסף פרופיל כדי לנתח בני משפחה וחברים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guestProfiles.map((profile) => (
            <Card key={profile.id} className="bg-gray-900/50 border-white/10">
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <p className="font-medium text-white">{profile.full_name}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(profile.birth_date).toLocaleDateString('he-IL')}
                    {profile.birth_time && ` · ${profile.birth_time}`}
                    {profile.birth_place && ` · ${profile.birth_place}`}
                  </p>
                  {profile.relationship && (
                    <p className="text-xs text-gray-500">{profile.relationship}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(profile)}
                    aria-label={`ערוך את ${profile.full_name}`}
                    className="h-8 w-8 text-gray-400 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(profile.id)}
                    aria-label={`מחק את ${profile.full_name}`}
                    className="h-8 w-8 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog הוספה */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף פרופיל אורח</DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
            <GuestFormFields form={addForm} />
            <DialogFooter className="flex-row-reverse gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-500"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'הוסף'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                ביטול
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog עריכה */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ערוך פרופיל אורח</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <GuestFormFields form={editForm} />
            <DialogFooter className="flex-row-reverse gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-500"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'שמור'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
              >
                ביטול
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog אישור מחיקה */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת פרופיל אורח</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-400">
            האם אתה בטוח שברצונך למחוק פרופיל זה? פעולה זו אינה הפיכה.
          </p>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500"
            >
              מחק
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              ביטול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== קומפוננטת עזר =====

/** שדות טופס פרופיל אורח — משותפים ל-Add ו-Edit */
function GuestFormFields({
  form,
}: {
  form: ReturnType<typeof useForm<GuestFormValues>>;
}) {
  const { register, formState: { errors } } = form;

  return (
    <>
      {/* שם מלא */}
      <div className="space-y-1.5">
        <Label htmlFor="g-full_name">שם מלא</Label>
        <Input
          id="g-full_name"
          {...register('full_name')}
          placeholder="הכנס שם מלא"
          aria-invalid={!!errors.full_name}
        />
        {errors.full_name && (
          <p className="text-sm text-red-400" role="alert">
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* תאריך לידה */}
      <div className="space-y-1.5">
        <Label htmlFor="g-birth_date">תאריך לידה</Label>
        <Input
          id="g-birth_date"
          type="date"
          {...register('birth_date')}
          aria-invalid={!!errors.birth_date}
        />
        {errors.birth_date && (
          <p className="text-sm text-red-400" role="alert">
            {errors.birth_date.message}
          </p>
        )}
      </div>

      {/* שעת לידה */}
      <div className="space-y-1.5">
        <Label htmlFor="g-birth_time">שעת לידה (אופציונלי)</Label>
        <Input
          id="g-birth_time"
          type="time"
          {...register('birth_time')}
          placeholder="14:30"
        />
      </div>

      {/* מקום לידה */}
      <div className="space-y-1.5">
        <Label htmlFor="g-birth_place">מקום לידה (אופציונלי)</Label>
        <Input
          id="g-birth_place"
          {...register('birth_place')}
          placeholder="עיר, מדינה"
        />
      </div>

      {/* קשר */}
      <div className="space-y-1.5">
        <Label htmlFor="g-relationship">קשר (אופציונלי)</Label>
        <Input
          id="g-relationship"
          {...register('relationship')}
          placeholder="לדוגמה: בן/בת זוג, ילד, הורה"
        />
      </div>
    </>
  );
}
