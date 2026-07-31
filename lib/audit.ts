import type { SupabaseClient } from "@supabase/supabase-js";

// FR-52: every admin create/update/delete + login/logout recorded with timestamp, action, affected record.
export async function logAuditEvent(
  supabase: SupabaseClient,
  event: { action: string; targetTable?: string; targetId?: string; metadata?: Record<string, unknown> },
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("audit_log").insert({
    admin_id: user?.id ?? null,
    actor_label: user?.email ?? null,
    action: event.action,
    target_table: event.targetTable ?? null,
    target_id: event.targetId ?? null,
    metadata: event.metadata ?? null,
  });
}
