"use client";

import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { CoreValueContent } from "@/components/about/CoreValues";

type FormAction = (
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) => Promise<{ error?: string; success?: boolean }>;

export interface AboutContentFormValues {
  heroSubtitle: string;
  storyHeading: string;
  storyHighlights: string[];
  statEstablished: string;
  statMembers: string;
  statChampionships: string;
  missionText: string;
  missionPoints: string[];
  visionText: string;
  visionPoints: string[];
  coreValues: CoreValueContent[];
}

export function AboutContentForm({
  values,
  action,
}: {
  values: AboutContentFormValues;
  action: FormAction;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-8">
      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Hero</h3>
        <FormField label="Subtitle" htmlFor="heroSubtitle">
          <Textarea id="heroSubtitle" name="heroSubtitle" required defaultValue={values.heroSubtitle} rows={2} />
        </FormField>
      </div>

      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Our Story</h3>
        <FormField label="Heading" htmlFor="storyHeading">
          <Input id="storyHeading" name="storyHeading" required defaultValue={values.storyHeading} />
        </FormField>
        <FormField label="Highlights" htmlFor="storyHighlights" hint="One highlight per line.">
          <Textarea
            id="storyHighlights"
            name="storyHighlights"
            required
            defaultValue={values.storyHighlights.join("\n")}
            rows={4}
          />
        </FormField>
      </div>

      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Established" htmlFor="statEstablished">
            <Input id="statEstablished" name="statEstablished" required defaultValue={values.statEstablished} />
          </FormField>
          <FormField label="Active Members" htmlFor="statMembers">
            <Input id="statMembers" name="statMembers" required defaultValue={values.statMembers} />
          </FormField>
          <FormField label="Championships" htmlFor="statChampionships">
            <Input
              id="statChampionships"
              name="statChampionships"
              required
              defaultValue={values.statChampionships}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Mission &amp; Vision</h3>
        <FormField label="Mission Text" htmlFor="missionText">
          <Textarea id="missionText" name="missionText" required defaultValue={values.missionText} rows={3} />
        </FormField>
        <FormField label="Mission Points" htmlFor="missionPoints" hint="One point per line.">
          <Textarea
            id="missionPoints"
            name="missionPoints"
            required
            defaultValue={values.missionPoints.join("\n")}
            rows={3}
          />
        </FormField>
        <FormField label="Vision Text" htmlFor="visionText">
          <Textarea id="visionText" name="visionText" required defaultValue={values.visionText} rows={3} />
        </FormField>
        <FormField label="Vision Points" htmlFor="visionPoints" hint="One point per line.">
          <Textarea
            id="visionPoints"
            name="visionPoints"
            required
            defaultValue={values.visionPoints.join("\n")}
            rows={3}
          />
        </FormField>
      </div>

      <div className="space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Core Values</h3>
        {values.coreValues.map((value, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <FormField label={`Value ${index + 1} Title`} htmlFor={`coreValueTitle${index}`}>
              <Input id={`coreValueTitle${index}`} name={`coreValueTitle${index}`} required defaultValue={value.title} />
            </FormField>
            <FormField label={`Value ${index + 1} Description`} htmlFor={`coreValueDescription${index}`}>
              <Input
                id={`coreValueDescription${index}`}
                name={`coreValueDescription${index}`}
                required
                defaultValue={value.description}
              />
            </FormField>
          </div>
        ))}
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}

      <SubmitButton>Save Changes</SubmitButton>
    </form>
  );
}
