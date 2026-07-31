"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { BlogPost } from "@/lib/types";

type FormAction = (prevState: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;

export function BlogPostForm({ post, action }: { post?: BlogPost; action: FormAction }) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Title" htmlFor="title">
        <Input id="title" name="title" required defaultValue={post?.title} />
      </FormField>
      <FormField label="Excerpt" htmlFor="excerpt">
        <Textarea id="excerpt" name="excerpt" rows={2} required defaultValue={post?.excerpt} />
      </FormField>
      <FormField label="Content" htmlFor="content">
        <RichTextEditor name="content" defaultValue={post?.content} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category" htmlFor="category">
          <Input id="category" name="category" required defaultValue={post?.category} />
        </FormField>
        <FormField label="Author" htmlFor="author">
          <Input id="author" name="author" required defaultValue={post?.author} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" htmlFor="date">
          <Input id="date" name="date" type="date" required defaultValue={post?.date} />
        </FormField>
        <FormField label="Read Time (minutes)" htmlFor="readTimeMinutes">
          <Input
            id="readTimeMinutes"
            name="readTimeMinutes"
            type="number"
            min={1}
            required
            defaultValue={post?.readTimeMinutes ?? 4}
          />
        </FormField>
      </div>
      <ImageUploader name="coverImage" label="Cover Image" existingUrl={post?.coverImage} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton>{post ? "Save Changes" : "Create Post"}</SubmitButton>
    </form>
  );
}
