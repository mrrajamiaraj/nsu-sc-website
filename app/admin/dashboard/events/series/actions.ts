"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { eventSeriesSchema } from "@/lib/validation/events";

type FormState = { error?: string } | undefined;

function parse(formData: FormData) {
  return eventSeriesSchema.safeParse({
    name: formData.get("name"),
    abbreviation: String(formData.get("abbreviation") ?? "").toUpperCase(),
    sport: formData.get("sport") || null,
    description: formData.get("description") || null,
  });
}

function friendlyError(message: string) {
  return message.includes("event_series_abbreviation_key")
    ? "Another series already uses that abbreviation."
    : message;
}

function revalidateSeries() {
  revalidatePath("/admin/dashboard/events", "layout");
  revalidatePath("/events", "layout");
}

export async function createSeries(_prevState: FormState, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_series")
    .insert({ ...parsed.data, sport: parsed.data.sport || null, description: parsed.data.description || null })
    .select("id")
    .single();
  if (error) return { error: friendlyError(error.message) };

  await logAuditEvent(supabase, { action: "CREATE_EVENT_SERIES", targetTable: "event_series", targetId: data.id });
  revalidateSeries();
  redirect("/admin/dashboard/events/series");
}

export async function updateSeries(id: string, _prevState: FormState, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("event_series")
    .update({
      ...parsed.data,
      sport: parsed.data.sport || null,
      description: parsed.data.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: friendlyError(error.message) };

  await logAuditEvent(supabase, { action: "UPDATE_EVENT_SERIES", targetTable: "event_series", targetId: id });
  revalidateSeries();
  redirect("/admin/dashboard/events/series");
}

// Seasons are kept; they just stop belonging to a series.
export async function deleteSeries(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("event_series").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_EVENT_SERIES", targetTable: "event_series", targetId: id });
  revalidateSeries();
}
