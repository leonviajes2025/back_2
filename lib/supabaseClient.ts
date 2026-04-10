import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NG_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.NG_APP_SUPABASE_SERVICE_ROLE_KEY;

let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error("Supabase storage variables no configuradas en .env");
  }

  _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  return _supabaseAdmin;
}

export default getSupabaseAdmin;
