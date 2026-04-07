/**
 * API Route: יצירת URL חתום להעלאה ישירה ל-Supabase Storage
 * POST /api/upload/presign
 * עוקף את מגבלת 4.5MB של Vercel — הלקוח מעלה ישירות ל-Storage
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { ALLOWED_TYPES, MAX_FILE_SIZE } from '@/lib/utils/file-validation'
import { zodValidationError } from '@/lib/utils/api-error'

/** סכמת ולידציה לבקשת presign */
const PresignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_TYPES),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body: unknown = await request.json()
    const parsed = PresignRequestSchema.safeParse(body)
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten())
    }

    const ext = parsed.data.filename.split('.').pop() ?? 'bin'
    const path = `${user.id}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUploadUrl(path)

    if (error) {
      console.error('[Upload Presign] Storage error:', error.message)
      return NextResponse.json({ error: 'שגיאה ביצירת URL להעלאה' }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
