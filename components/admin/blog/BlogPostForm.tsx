"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { Textarea } from "@/components/admin/Textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { CATEGORIES, SPORTS } from "@/lib/blog";
import type { BlogPost } from "@/lib/types";

type FormAction = (prevState: { error?: string; notice?: string } | undefined, formData: FormData) => Promise<{ error?: string; notice?: string }>;
type Option = { id: string; label: string };

const hint = "mt-1 text-xs text-slate-400";

// Gazette story editor. A story needs a body to be published: the site never shows a
// summary-only post. Read time is worked out from the text.
export function BlogPostForm({ post, action, events, achievements, teams }: { post?: BlogPost; action: FormAction; events: Option[]; achievements: Option[]; teams: Option[] }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Headline" htmlFor="title">
        <Input id="title" name="title" required defaultValue={post?.title} />
        <p className={hint}>Sentence case, like a newspaper: &ldquo;Mridul captains IM10 FC to the title&rdquo;.</p>
      </FormField>
      <FormField label="Standfirst" htmlFor="excerpt">
        <Textarea id="excerpt" name="excerpt" rows={2} required defaultValue={post?.excerpt} />
        <p className={hint}>One or two sentences under the headline.</p>
      </FormField>
      <FormField label="Story" htmlFor="content">
        <RichTextEditor name="content" defaultValue={post?.content} />
        <p className={hint}>Required. Headings (H2) become &ldquo;In this story&rdquo;; quotes become pull quotes.</p>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category" htmlFor="category">
          <Select id="category" name="category" required defaultValue={CATEGORIES.find((c) => c.toLowerCase() === post?.category.toLowerCase()) ?? "Club news"}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Sport" htmlFor="sport">
          <Select id="sport" name="sport" defaultValue={post?.sport ?? ""}>
            <option value="">None</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Author" htmlFor="author">
          <Input id="author" name="author" required defaultValue={post?.author ?? "NSU SC Media Team"} />
        </FormField>
        <FormField label="Author's role" htmlFor="authorRole">
          <Input id="authorRole" name="authorRole" placeholder="Media team, NSU SC" defaultValue={post?.authorRole ?? ""} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Published" htmlFor="date">
          <Input id="date" name="date" type="date" required defaultValue={post?.date} />
        </FormField>
        <FormField label="Web address" htmlFor="slug">
          <Input id="slug" name="slug" placeholder="made from the headline" defaultValue={post?.slug ?? ""} />
          <p className={hint}>/blog/&hellip; Leave empty to use the headline.</p>
        </FormField>
      </div>
      <ImageUploader name="coverImage" label="Cover photo" existingUrl={post?.coverImage} aspectRatio={16 / 10} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Photo credit" htmlFor="coverCredit">
          <Input id="coverCredit" name="coverCredit" placeholder="NSU Games & Sports Club" defaultValue={post?.coverCredit ?? ""} />
        </FormField>
        <FormField label="Tags" htmlFor="tags">
          <Input id="tags" name="tags" placeholder="futsal, im10-fc" defaultValue={post?.tags.join(", ") ?? ""} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="About an event" htmlFor="relatedEventId">
          <Select id="relatedEventId" name="relatedEventId" defaultValue={post?.relatedEventId ?? ""}>
            <option value="">None</option>
            {events.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="About an achievement" htmlFor="relatedAchievementId">
          <Select id="relatedAchievementId" name="relatedAchievementId" defaultValue={post?.relatedAchievementId ?? ""}>
            <option value="">None</option>
            {achievements.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="About a squad" htmlFor="relatedTeamId">
          <Select id="relatedTeamId" name="relatedTeamId" defaultValue={post?.relatedTeamId ?? ""}>
            <option value="">None</option>
            {teams.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.notice && <p className="text-sm text-amber-300">{state.notice}</p>}

      <SubmitButton>{post ? "Save changes" : "Publish story"}</SubmitButton>
    </form>
  );
}
