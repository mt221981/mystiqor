/**
 * סקריפט סנכרון מטא-דאטה לטארוט — מאכלס tarot_cards בכל 78 קלפים
 * הרצה: npx tsx mystiqor-build/scripts/sync-tarot-meta.ts
 *
 * אלגוריתם:
 * 1. טוען TAROT_CARD_META מהקונסטנטות
 * 2. מתחבר ל-Supabase עם service-role key (עוקף RLS)
 * 3. שולף שורות קיימות (38 קלפים — ארקנה גדולה + קלפי חצר)
 * 4. מעדכן את 38 הקיימים (רק 7 שדות מטא, לא נוגע בשמות/משמעויות)
 * 5. מוסיף 40 קלפי pip חדשים
 * 6. מדווח: Updated, Inserted, Errors
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { TAROT_CARD_META } from '../src/lib/constants/tarot-data'

// ---- קונסטנטות מיפוי ----

const SUIT_KEY = ['wands', 'cups', 'swords', 'pentacles'] as const
type Suit = (typeof SUIT_KEY)[number]

const RANK_EN = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'] as const
const SUIT_EN = ['Wands','Cups','Swords','Pentacles'] as const

/** שמות עבריים לדרגות pip */
const RANK_HE = ['אס','שניים','שלושה','ארבעה','חמישה','שישה','שבעה','שמונה','תשעה','עשרה'] as const
/** שמות עבריים לחפיסות */
const SUIT_HE = ['מטות','גביעים','חרבות','מטבעות'] as const

// ---- סוגים ----

interface TarotRow {
  id: number
  name_en: string
  arcana: 'major' | 'minor'
  suit: Suit | null
  number: number | null
}

type MetaUpdate = {
  element: string | null
  astrology: string | null
  kabbalah: string | null
  archetype: string | null
  upright_keywords: string[]
  reversed_keywords: string[]
  numerology_value: number | null
}

// ---- פונקציות עזר ----

/** טוען משתני סביבה מ-.env.local */
function loadEnv(): void {
  try {
    const envContent = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
    for (const line of envContent.split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch {
    console.warn('⚠️  .env.local לא נמצא — מניח שמשתני הסביבה כבר מוגדרים')
  }
}

/**
 * בונה מטא-דאטה לעדכון משדות TAROT_CARD_META
 */
function buildMeta(cardNumber: number): MetaUpdate {
  const meta = TAROT_CARD_META[cardNumber]
  let numerology_value: number | null = null
  if (cardNumber <= 21) {
    numerology_value = cardNumber
  } else {
    const rankInSuit = (cardNumber - 22) % 14
    numerology_value = rankInSuit <= 9 ? rankInSuit + 1 : null
  }
  return {
    element: meta.element || null,
    astrology: meta.astrology || null,
    kabbalah: meta.kabbalah ?? null,
    archetype: meta.archetype || null,
    upright_keywords: [...meta.uprightKeywords],
    reversed_keywords: [...meta.reversedKeywords],
    numerology_value,
  }
}

/**
 * מחפש שורה קיימת עבור קלף (ארקנה גדולה או חצר)
 */
function findExistingRow(cardNumber: number, rows: TarotRow[]): TarotRow | undefined {
  if (cardNumber <= 21) {
    return rows.find((r) => r.arcana === 'major' && r.number === cardNumber)
  }
  // קלף חצר — rankInSuit 10-13
  const suitIdx = Math.floor((cardNumber - 22) / 14)
  const courtPos = (cardNumber - 22) % 14 - 10 // 0=Page, 1=Knight, 2=Queen, 3=King
  const suitCards = rows
    .filter((r) => r.arcana === 'minor' && r.suit === SUIT_KEY[suitIdx] && r.number === null)
    .sort((a, b) => a.id - b.id)
  return suitCards[courtPos]
}

// ---- פונקציה ראשית ----

async function syncTarotMeta(): Promise<void> {
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ חסרים: NEXT_PUBLIC_SUPABASE_URL ו/או SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  console.log('🔌 מתחבר ל-Supabase...')

  const { data: existingData, error: fetchError } = await supabase
    .from('tarot_cards')
    .select('id, name_en, arcana, suit, number')

  if (fetchError) {
    console.error('❌ שגיאה בשליפה:', fetchError.message)
    process.exit(1)
  }

  const existing = (existingData ?? []) as TarotRow[]
  const existingNames = new Set(existing.map((r) => r.name_en))
  console.log(`📦 נמצאו ${existing.length} קלפים קיימים`)

  let updated = 0
  let inserted = 0
  let errors = 0

  for (let cardNumber = 0; cardNumber <= 77; cardNumber++) {
    const meta = TAROT_CARD_META[cardNumber]
    if (!meta) continue

    const rankInSuit = cardNumber <= 21 ? -1 : (cardNumber - 22) % 14
    const isPip = cardNumber > 21 && rankInSuit <= 9

    try {
      if (!isPip) {
        // ---- UPDATE קלף קיים (ארקנה גדולה + קלפי חצר) ----
        const row = findExistingRow(cardNumber, existing)
        if (!row) {
          console.warn(`⚠️  לא נמצא קלף עבור cardNumber ${cardNumber}`)
          errors++
          continue
        }
        const { error } = await supabase
          .from('tarot_cards')
          .update(buildMeta(cardNumber))
          .eq('id', row.id)
        if (error) { console.error(`❌ עדכון id=${row.id}:`, error.message); errors++ }
        else updated++
      } else {
        // ---- INSERT/UPDATE קלף pip ----
        const suitIdx = Math.floor((cardNumber - 22) / 14)
        const name_en = `${RANK_EN[rankInSuit]} of ${SUIT_EN[suitIdx]}`
        const metaUpdate = buildMeta(cardNumber)

        if (existingNames.has(name_en)) {
          // כבר קיים — UPDATE
          const existingPip = existing.find((r) => r.name_en === name_en)!
          const { error } = await supabase
            .from('tarot_cards')
            .update(metaUpdate)
            .eq('id', existingPip.id)
          if (error) { console.error(`❌ עדכון pip ${name_en}:`, error.message); errors++ }
          else updated++
        } else {
          // חדש לגמרי — INSERT
          const { error } = await supabase.from('tarot_cards').insert({
            name_en,
            name_he: meta.archetype || `${RANK_HE[rankInSuit]} ב${SUIT_HE[suitIdx]}`,
            arcana: 'minor' as const,
            suit: SUIT_KEY[suitIdx],
            number: rankInSuit + 1,
            meaning_upright: meta.uprightKeywords.slice(0, 2).join(', '),
            meaning_reversed: meta.reversedKeywords.slice(0, 2).join(', '),
            keywords: [...meta.uprightKeywords],
            image_url: null,
            ...metaUpdate,
          })
          if (error) { console.error(`❌ הוספת ${name_en}:`, error.message); errors++ }
          else inserted++
        }
      }
    } catch (err) {
      console.error(`❌ שגיאה לא צפויה (cardNumber=${cardNumber}):`, err)
      errors++
    }
  }

  // דוח סיכום
  console.log('\n📊 סיכום:')
  console.log(`  ✅ עודכנו: ${updated}`)
  console.log(`  ➕ נוספו:  ${inserted}`)
  console.log(`  ❌ שגיאות: ${errors}`)
  console.log(`  📋 סה"כ:   ${updated + inserted + errors} / 78`)

  if (errors > 0) {
    console.error('\n⚠️  הסנכרון הסתיים עם שגיאות')
    process.exit(1)
  }
  console.log('\n✨ הסנכרון הושלם בהצלחה!')
}

syncTarotMeta().catch((err: unknown) => {
  console.error('❌ שגיאה קריטית:', err)
  process.exit(1)
})
