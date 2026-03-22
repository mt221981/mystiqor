/**
 * API Route: העלאת קבצים — שומר ב-Supabase Storage
 * POST /api/upload (FormData with file field)
 * מבצע: אימות auth, בדיקת magic bytes, הסרת EXIF, העלאה ל-Storage
 * לקבצים גדולים (>4.5MB) — השתמש ב-/api/upload/presign במקום
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { validateMagicBytes, isAllowedType, MAX_FILE_SIZE } from '@/lib/utils/file-validation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'לא נבחר קובץ' }, { status: 400 })
    }

    if (!isAllowedType(file.type)) {
      return NextResponse.json(
        { error: 'סוג קובץ לא נתמך. נתמכים: JPEG, PNG, WebP, PDF' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'קובץ גדול מדי. מקסימום: 10MB' }, { status: 400 })
    }

    // בדיקת Magic Bytes — מוודא שהקובץ באמת מהסוג שהוצהר
    const fileBuffer = await file.arrayBuffer()
    if (!validateMagicBytes(fileBuffer, file.type)) {
      return NextResponse.json(
        { error: 'תוכן הקובץ לא תואם לסוג שהוצהר' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${user.id}/${Date.now()}.${ext}`

    // הסרת EXIF מתמונות — מגן על פרטיות (מסיר קואורדינטות GPS)
    let uploadBuffer: Buffer | ArrayBuffer = fileBuffer
    if (file.type.startsWith('image/')) {
      uploadBuffer = await sharp(Buffer.from(fileBuffer)).toBuffer()
    }

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(path, uploadBuffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error('[Upload] Storage error:', error.message)
      return NextResponse.json({ error: 'שגיאה בהעלאת הקובץ' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl, path: data.path })
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
