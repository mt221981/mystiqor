import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Env vars
  checks['SUPABASE_URL'] = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING';
  checks['SUPABASE_ANON_KEY'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING';
  checks['SUPABASE_SERVICE_KEY'] = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING';
  checks['OPENAI_API_KEY'] = process.env.OPENAI_API_KEY ? 'SET' : 'MISSING';
  checks['STRIPE_SECRET_KEY'] = process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING';

  // 2. Supabase connection
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    checks['AUTH'] = authErr ? `ERROR: ${authErr.message}` : user ? `OK (${user.email})` : 'NO_SESSION';

    // 3. Tables
    const tables = ['profiles', 'subscriptions', 'analyses', 'daily_insights', 'tarot_cards'];
    for (const table of tables) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      checks[`TABLE:${table}`] = error ? `ERROR: ${error.message}` : `OK (${count} rows)`;
    }
  } catch (err) {
    checks['SUPABASE'] = `CRASH: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
