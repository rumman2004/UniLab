// ------------------------------------------------------------
//  Supabase clients
//  - admin: uses the SERVICE ROLE key. SERVER ONLY. Full access,
//           bypasses Row Level Security. Used for uploads/deletes.
//  - The public/anon key is exposed to the browser separately
//    (see /api/config) only if you want client-side reads. Here we
//    proxy all reads through Express, so the browser never needs a key.
// ------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '\x1b[33m[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.\n' +
      '          The API will start but database/storage calls will fail.\n' +
      '          Fill them in your .env file.\x1b[0m'
  );
}

// A single shared admin client for the whole server process.
export const supabase = createClient(
  SUPABASE_URL || 'http://localhost',
  SUPABASE_SERVICE_ROLE_KEY || 'missing-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

export const BUCKET = SUPABASE_BUCKET || 'resources';

// Tells routes whether Supabase is actually configured, so we can
// return a friendly error instead of a crash when it is not.
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
);
