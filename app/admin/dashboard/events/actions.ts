"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { deleteImage, uploadImage } from "@/lib/storage";
import { eventSchema } from "@/lib/validation/events";

type FormState = { error?: string } | undefined;

const text = (formData: FormData, key: string) => formData.get(key) || null;

function parseFormData(formData: FormData) {
  return eventSchema.safeParse({
    name: formData.get("name"),
    seriesId: text(formData, "seriesId"),
    seasonNumber: text(formData, "seasonNumber"),
    date: text(formData, "date"),
    yearOnly: formData.get("yearOnly") === "on",
    endDate: text(formData, "endDate"),
    venue: text(formData, "venue"),
    description: formData.get("description"),
    status: formData.get("status"),
    registrationOpens: text(formData, "registrationOpens"),
    registrationDeadline: text(formData, "registrationDeadline"),
    registrationUrl: text(formData, "registrationUrl"),
    teamCount: text(formData, "teamCount"),
    participantCount: text(formData, "participantCount"),
    matchCount: text(formData, "matchCount"),
    winners: text(formData, "winners"),
    runnersUp: text(formData, "runnersUp"),
    secondRunnerUp: text(formData, "secondRunnerUp"),
    manOfTournament: text(formData, "manOfTournament"),
    prizePool: text(formData, "prizePool"),
    prizeFirst: text(formData, "prizeFirst"),
    prizeSecond: text(formData, "prizeSecond"),
    prizeThird: text(formData, "prizeThird"),
  });
}

function toRow(data: NonNullable<ReturnType<typeof parseFormData>["data"]>) {
  return {
    name: data.name,
    series_id: data.seriesId || null,
    season_number: data.seasonNumber ?? null,
    date: data.date || null,
    year_only: Boolean(data.date) && data.yearOnly,
    end_date: data.endDate || null,
    venue: data.venue || null,
    description: data.description,
    status: data.status,
    registration_opens: data.registrationOpens || null,
    registration_deadline: data.registrationDeadline || null,
    registration_url: data.registrationUrl || null,
    team_count: data.teamCount ?? null,
    participant_count: data.participantCount ?? null,
    match_count: data.matchCount ?? null,
    winners: data.winners,
    runners_up: data.runnersUp,
    second_runner_up: data.secondRunnerUp,
    man_of_tournament: data.manOfTournament,
    prize_pool: data.prizePool,
    prize_first: data.prizeFirst,
    prize_second: data.prizeSecond,
    prize_third: data.prizeThird,
  };
}

function revalidateEventPaths(id?: string) {
  revalidatePath("/admin/dashboard/events");
  revalidatePath("/events");
  revalidatePath("/");
  if (id) revalidatePath(`/events/${id}`);
}

export async function createEvent(_prevState: FormState, formData: FormData) {
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
    .insert({ ...toRow(parsed.data), banner_image: bannerImage, gallery: bannerImage ? [bannerImage] : [] })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logAuditEvent(supabase, { action: "CREATE_EVENT", targetTable: "events", targetId: data.id });
  revalidateEventPaths(data.id);
  redirect("/admin/dashboard/events");
}

export async function updateEvent(id: string, _prevState: FormState, formData: FormData) {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const updates: Record<string, unknown> = toRow(parsed.data);

  const file = formData.get("bannerImage") as File | null;
  if (file && file.size > 0) {
    try {
      const url = await uploadImage("events", file);
      // Swap the old banner for the new one but keep the rest of the photo gallery.
      const { data: existing } = await supabase.from("events").select("banner_image, gallery").eq("id", id).maybeSingle();
      const gallery = ((existing?.gallery as string[] | null) ?? []).filter((photo) => photo !== existing?.banner_image);
      updates.banner_image = url;
      updates.gallery = [url, ...gallery];
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

// --- Photo gallery -----------------------------------------------------------

async function loadGallery(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("gallery, gallery_captions, banner_image").eq("id", id).maybeSingle();
  return {
    supabase,
    gallery: (data?.gallery as string[] | null) ?? [],
    captions: (data?.gallery_captions as Record<string, string> | null) ?? {},
    banner: (data?.banner_image as string | null) ?? null,
  };
}

export async function addEventPhotos(id: string, _prevState: FormState, formData: FormData) {
  const files = formData.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);
  if (files.length === 0) return { error: "Choose at least one photo." };

  const uploaded: string[] = [];
  try {
    for (const file of files) uploaded.push(await uploadImage("events", file));
  } catch (err) {
    await Promise.all(uploaded.map((url) => deleteImage(url)));
    return { error: err instanceof Error ? err.message : "Photo upload failed." };
  }

  const { supabase, gallery } = await loadGallery(id);
  const { error } = await supabase.from("events").update({ gallery: [...gallery, ...uploaded] }).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "ADD_EVENT_PHOTOS", targetTable: "events", targetId: id, metadata: { count: uploaded.length } });
  revalidateEventPaths(id);
  revalidatePath(`/admin/dashboard/events/${id}/edit`);
  return {};
}

export async function removeEventPhoto(id: string, url: string) {
  const { supabase, gallery, captions, banner } = await loadGallery(id);
  const nextCaptions = { ...captions };
  delete nextCaptions[url];

  const { error } = await supabase
    .from("events")
    .update({ gallery: gallery.filter((photo) => photo !== url), gallery_captions: nextCaptions })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // The banner is the same file; keep it in storage while it's still the banner.
  if (url !== banner) await deleteImage(url);
  await logAuditEvent(supabase, { action: "REMOVE_EVENT_PHOTO", targetTable: "events", targetId: id });
  revalidateEventPaths(id);
  revalidatePath(`/admin/dashboard/events/${id}/edit`);
}

export async function saveEventCaptions(id: string, _prevState: FormState, formData: FormData) {
  const { supabase, gallery } = await loadGallery(id);
  const captions: Record<string, string> = {};
  gallery.forEach((url, index) => {
    const caption = String(formData.get(`caption-${index}`) ?? "").trim();
    if (caption) captions[url] = caption.slice(0, 160);
  });

  const { error } = await supabase.from("events").update({ gallery_captions: captions }).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_EVENT_CAPTIONS", targetTable: "events", targetId: id });
  revalidateEventPaths(id);
  return {};
}
