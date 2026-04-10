import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NG_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.NG_APP_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  throw new Error("Supabase storage variables no configuradas en .env");
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

export default supabaseAdmin;
