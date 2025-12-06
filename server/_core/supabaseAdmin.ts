import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;
  if (!ENV.supabaseUrl || !ENV.supabaseServiceKey) {
    return null;
  }

  adminClient = createClient(ENV.supabaseUrl, ENV.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
