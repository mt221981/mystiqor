/**
 * API Route: העלאת קבצים — שומר ב-Supabase Storage
 * POST /api/upload (FormData with file field)
 * מגבלות: 10MB, סוגי קבצים: image/jpeg, image/png, application/pdf
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** סוגי קבצים מותרים */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
/** גודל מקסימלי: 10MB */
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'לא נבחר קובץ' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'סוג קובץ לא נתמך. נתמכים: JPEG, PNG, WebP, PDF' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'קובץ גדול מדי. מקסימום: 10MB' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: 'שגיאה בהעלאת הקובץ' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
