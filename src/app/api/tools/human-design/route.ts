/**
 * POST /api/tools/human-design — חישוב Human Design (סימולציה ב-LLM)
 * קלט: { birthDate, birthTime, birthPlace }
 * הערה: Human Design אמיתי דורש חישוב 88 מעלות שמש לאחור.
 *       v1 משתמש בסימולציה של LLM עם גילוי נאות למשתמש.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { invokeLLM } from '@/services/analysis/llm';
import { getPersonalContext } from '@/services/analysis/personal-context';
import { HumanDesignInputSchema } from '@/lib/validations/human-design';
import type { TablesInsert } from '@/types/database';
import { zodValidationError } from '@/lib/utils/api-error';
import { checkUsageQuota } from '@/lib/utils/usage-guard';

export const maxDuration = 30

// re-export so legacy imports continue to work
export { HumanDesignInputSchema };

// ===== טיפוסים =====

/** תוצאת Human Design מה-LLM */
interface HDResult {
  type: 'Generator' | 'Manifesting Generator' | 'Projector' | 'Manifestor' | 'Reflector';
  profile: string;
  authority: string;
  strategy: string;
  definedCenters: string[];
  undefinedCenters: string[];
  openCenters: string[];
  channels: string[];
  gates: string[];
  description: string;
  strengths: string[];
  challenges: string[];
  disclosure: string;
}

// ===== Handler =====

/** מחשב Human Design דרך סימולציית LLM — שומר תוצאה בטבלת analyses */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    const body = await request.json() as unknown;
    const parsed = HumanDesignInputSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten());
    }

    const { birthDate, birthTime, birthPlace } = parsed.data;

    // שליפת הקשר האישי להעשרת הפרומפט
    const ctx = await getPersonalContext(supabase, user.id);
    const personalLine = ctx.firstName
      ? `פנה ישירות אל ${ctx.firstName} — מספר חיים ${ctx.lifePathNumber}. `
      : '';

    // קריאת LLM לסימולציית Human Design
    const llmResponse = await invokeLLM<HDResult>({
      systemPrompt: personalLine + `אתה מומחה Human Design. בהינתן תאריך, שעה ומקום לידה, ספק ניתוח Human Design מפורט.
החזר JSON בלבד: { type: 'Generator'|'Manifesting Generator'|'Projector'|'Manifestor'|'Reflector', profile: string, authority: string, strategy: string, definedCenters: string[], undefinedCenters: string[], openCenters: string[], channels: string[], gates: string[], description: string, strengths: string[], challenges: string[], disclosure: string }.
שים disclosure: 'ניתוח זה מבוסס על סימולציה ולא חישוב אסטרונומי מדויק — לניתוח HD מדויק יש לפנות למומחה.'`,
      prompt: `תאריך לידה: ${birthDate}, שעה: ${birthTime}, מקום: ${birthPlace}`,
      responseSchema: {
        type: 'string',
        profile: 'string',
        authority: 'string',
        strategy: 'string',
        definedCenters: 'array',
        undefinedCenters: 'array',
        openCenters: 'array',
        channels: 'array',
        gates: 'array',
        description: 'string',
        strengths: 'array',
        challenges: 'array',
        disclosure: 'string',
      },
      userId: user.id,
      maxTokens: 1200,
    });

    const hdData = llmResponse.data;

    // שמירת תוצאה בטבלת analyses
    // JSON.parse(JSON.stringify(...)) ממיר לטיפוס Json תואם
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'human_design',
      input_data: JSON.parse(JSON.stringify({ birthDate, birthTime, birthPlace })),
      results: JSON.parse(JSON.stringify(hdData)),
      summary: `Human Design: ${hdData.type} | ${hdData.profile}`,
    };

    const { data: savedAnalysis, error: insertError } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single();

    if (insertError) {
      console.error('[human-design] שגיאת שמירת ניתוח:', insertError)
      return NextResponse.json(
        { error: 'הניתוח הושלם אך לא נשמר — אנא נסה שוב' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: hdData,
      analysis_id: savedAnalysis.id,
    });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 });
  }
}
