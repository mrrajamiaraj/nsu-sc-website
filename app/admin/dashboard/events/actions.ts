"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage } from "@/lib/storage";
import { eventSchema } from "@/lib/validation/events";

function parseFormData(formData: FormData) {
  return eventSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    endDate: formData.get("endDate") || null,
    venue: formData.get("venue"),
    description: formData.get("description"),
    status: formData.get("status"),
    teamCount: formData.get("teamCount") || null,
    participantCount: formData.get("participantCount") || null,
    winners: formData.get("winners") || null,
    runnersUp: formData.get("runnersUp") || null,
    prizePool: formData.get("prizePool") || null,
  });
}

function revalidateEventPaths(id?: string) {
  revalidatePath("/admin/dashboard/events");
  revalidatePath("/events");
  revalidatePath("/");
  if (id) revalidatePath(`/events/${id}`);
}

export async function createEvent(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();

  let bannerImage: string | null = null;
  const file = formData.get("bannerImage") as File | null;
  if (file && file.size > 0) {
    try {
      bannerImage = await uploadImage("events", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      name: parsed.data.name,
      date: parsed.data.date,
      end_date: parsed.data.endDate || null,
      venue: parsed.data.venue,
      description: parsed.data.description,
      status: parsed.data.status,
      banner_image: bannerImage,
      gallery: bannerImage ? [bannerImage] : [],
      team_count: parsed.data.teamCount,
      participant_count: parsed.data.participantCount,
      winners: parsed.data.winners,
      runners_up: parsed.data.runnersUp,
      prize_pool: parsed.data.prizePool,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logAuditEvent(supabase, { action: "CREATE_EVENT", targetTable: "events", targetId: data.id });
  revalidateEventPaths(data.id);
  redirect("/admin/dashboard/events");
}

export async function updateEvent(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    name: parsed.data.name,
    date: parsed.data.date,
    end_date: parsed.data.endDate || null,
    venue: parsed.data.venue,
    description: parsed.data.description,
    status: parsed.data.status,
    team_count: parsed.data.teamCount,
    participant_count: parsed.data.participantCount,
    winners: parsed.data.winners,
    runners_up: parsed.data.runnersUp,
    prize_pool: parsed.data.prizePool,
  };

  const file = formData.get("bannerImage") as File | null;
  if (file && file.size > 0) {
    try {
      const url = await uploadImage("events", file);
      updates.banner_image = url;
      updates.gallery = [url];
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { error } = await supabase.from("events").update(updates).eq("id", id);
  if (error) {
    return { error: error.message };
  }

  await logAuditEvent(supabase, { action: "UPDATE_EVENT", targetTable: "events", targetId: id });
  revalidateEventPaths(id);
  redirect("/admin/dashboard/events");
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, { action: "DELETE_EVENT", targetTable: "events", targetId: id });
  revalidateEventPaths(id);
}
