/**
 * ולידציית קבצים — בדיקת Magic Bytes ואימות סוג קובץ
 * Magic Bytes הם הבתים הראשונים של קובץ שמזהים את הפורמט האמיתי
 * אמין יותר מכותרת MIME שניתנת לזיוף
 */

/** חתימות Magic Bytes לפורמטים נתמכים — null = any byte */
const MAGIC_BYTES: Record<string, (number | null)[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
}

/** סוגי קבצים מותרים להעלאה */
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const
export type AllowedFileType = typeof ALLOWED_TYPES[number]

/** גודל מקסימלי: 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * מוודא שהקובץ תואם לסוג MIME המוצהר על פי Magic Bytes ראשוניים
 * קורא את 12 הבתים הראשונים ומשווה לחתימות ידועות
 *
 * @param buffer - ArrayBuffer של הקובץ (לפחות 12 בתים ראשונים)
 * @param declaredType - סוג ה-MIME שהמשתמש הצהיר עליו
 * @returns true אם ה-Magic Bytes תואמים לסוג המוצהר
 */
export function validateMagicBytes(buffer: ArrayBuffer, declaredType: string): boolean {
  const signatures = MAGIC_BYTES[declaredType]
  if (!signatures) return false

  const bytes = new Uint8Array(buffer.slice(0, 12))
  return signatures.some(sig =>
    sig.every((byte, i) => byte === null || bytes[i] === byte)
  )
}

/**
 * בודק אם סוג הקובץ נמצא ברשימת הסוגים המותרים
 *
 * @param type - סוג MIME של הקובץ
 * @returns true אם הסוג מותר
 */
export function isAllowedType(type: string): type is AllowedFileType {
  return (ALLOWED_TYPES as readonly string[]).includes(type)
}
