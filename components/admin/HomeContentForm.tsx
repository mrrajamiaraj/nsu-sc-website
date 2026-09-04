"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { Event } from "@/lib/types";

type FormAction = (
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) => Promise<{ error?: string; success?: boolean }>;

export function HomeContentForm({
  tagline,
  orgName,
  videoUrl,
  featuredEventId,
  events,
  action,
}: {
  tagline: string;
  orgName: string;
  videoUrl: string;
  featuredEventId: string | null;
  events: Event[];
  action: FormAction;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Badge Text" htmlFor="orgName">
        <Input id="orgName" name="orgName" required defaultValue={orgName} />
      </FormField>
      <FormField label="Tagline" htmlFor="tagline">
        <Input id="tagline" name="tagline" required defaultValue={tagline} />
      </FormField>
      <FormField
        label="Showcase Video URL"
        htmlFor="videoUrl"
        hint="A YouTube link (any format) or a direct video file link (.mp4/.webm). Leave blank to show the default placeholder. Ignored if you upload a video file below."
      >
        <Input
          id="videoUrl"
          name="videoUrl"
          type="url"
          placeholder="https://example.com/video.mp4"
          defaultValue={videoUrl}
        />
      </FormField>
      <FormField
        label="Or Upload Video File"
        htmlFor="videoFile"
        hint="MP4 or WebM, max 50MB. Plays muted, autoplays, and loops continuously on the homepage. Uploading a file replaces the URL above."
      >
        <input
          id="videoFile"
          name="videoFile"
          type="file"
          accept="video/mp4,video/webm"
          className="w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
        />
      </FormField>
      <FormField label="Featured Event" htmlFor="featuredEventId">
        <Select id="featuredEventId" name="featuredEventId" defaultValue={featuredEventId ?? ""}>
          <option value="">None</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
      </FormField>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}

      <SubmitButton>Save Changes</SubmitButton>
    </form>
  );
}
