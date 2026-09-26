import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Service-role client for the cron (no signed-in user). Bypasses RLS, so every
// query must filter by user_id. Server-only: the key never reaches the browser.
export function createAdminClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  });
}
