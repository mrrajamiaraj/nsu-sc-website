"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/Input";
import { Textarea } from "@/components/admin/Textarea";
import { Select } from "@/components/admin/Select";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Member, MemberTier, Team } from "@/lib/types";

type FormAction = (prevState: { error?: string; notice?: string } | undefined, formData: FormData) => Promise<{ error?: string; notice?: string }>;

export function MemberForm({
  member,
  action,
  teams,
  staffTeamIds = [],
}: {
  member?: Member;
  action: FormAction;
  teams: Pick<Team, "id" | "name">[];
  staffTeamIds?: string[];
}) {
  const [state, formAction] = useFormState(action, {});
  const [tier, setTier] = useState<MemberTier>(member?.tier ?? "General");
  const designationRequired = tier !== "Sub-Executive";
  const staffRole = tier === "Executive" ? "Team Manager" : tier === "Sub-Executive" ? "Team In-charge" : null;

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={member?.name} />
      </FormField>
      <FormField label={designationRequired ? "Designation" : "Designation (optional)"} htmlFor="designation">
        <Input
          id="designation"
          name="designation"
          required={designationRequired}
          defaultValue={member?.designation ?? ""}
          placeholder="e.g. President"
        />
      </FormField>
      <FormField label="Tier" htmlFor="tier">
        <Select id="tier" name="tier" value={tier} onChange={(e) => setTier(e.target.value as MemberTier)}>
          <option value="Executive">Executive</option>
          <option value="Sub-Executive">Sub-Executive</option>
          <option value="General">General</option>
          <option value="Faculty Advisor">Faculty Advisor</option>
        </Select>
      </FormField>
      {staffRole && teams.length > 0 && (
        <FormField
          label={`${staffRole} of (optional)`}
          htmlFor="staffTeamIds"
          hint={`Shown on each selected team's roster as its ${staffRole}, above the players.`}
        >
          <div id="staffTeamIds" className="grid gap-2 sm:grid-cols-2">
            {teams.map((team) => (
              <label
                key={team.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  name="staffTeamIds"
                  value={team.id}
                  defaultChecked={staffTeamIds.includes(team.id)}
                  className="h-4 w-4 accent-blue-500"
                />
                {team.name}
              </label>
            ))}
          </div>
        </FormField>
      )}
      <p className="text-xs text-slate-500">
        Fill in whichever contact options are available — the member card only shows icons for the ones you provide.
        At least one is required.
      </p>
      <FormField label="Email (optional)" htmlFor="email">
        <Input id="email" name="email" type="email" defaultValue={member?.email ?? ""} />
      </FormField>
      <FormField label="Phone (optional)" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={member?.phone ?? ""} placeholder="+880 1XXX-XXXXXX" />
      </FormField>
      <FormField label="WhatsApp (optional)" htmlFor="whatsapp" hint="Only if it's different from the phone number.">
        <Input id="whatsapp" name="whatsapp" defaultValue={member?.whatsapp ?? ""} placeholder="+880 1XXX-XXXXXX" />
      </FormField>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <input type="checkbox" name="showPhonePublicly" defaultChecked={member?.showPhonePublicly ?? false} className="mt-0.5 h-4 w-4 accent-blue-500" />
        <span>
          Show phone publicly
          <span className="mt-0.5 block text-xs text-slate-400">Off by default. When on, the phone and WhatsApp appear on this member&rsquo;s card on the Members page.</span>
        </span>
      </label>
      <FormField label="Facebook (optional)" htmlFor="facebook">
        <Input
          id="facebook"
          name="facebook"
          type="url"
          defaultValue={member?.facebook ?? ""}
          placeholder="https://facebook.com/username"
        />
      </FormField>
      <FormField label="Instagram (optional)" htmlFor="instagram">
        <Input id="instagram" name="instagram" type="url" defaultValue={member?.instagram ?? ""} placeholder="https://instagram.com/username" />
      </FormField>
      <FormField label="LinkedIn (optional)" htmlFor="linkedin">
        <Input
          id="linkedin"
          name="linkedin"
          type="url"
          defaultValue={member?.linkedin ?? ""}
          placeholder="https://linkedin.com/in/username"
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Department (optional)" htmlFor="department">
          <Input id="department" name="department" defaultValue={member?.department ?? ""} placeholder="e.g. CSE" />
        </FormField>
        <FormField label="Batch (optional)" htmlFor="batch">
          <Input id="batch" name="batch" defaultValue={member?.batch ?? ""} placeholder="e.g. Spring 2023" />
        </FormField>
        <FormField label="Sport (optional)" htmlFor="sport">
          <Input id="sport" name="sport" defaultValue={member?.sport ?? ""} placeholder="e.g. Football" />
        </FormField>
      </div>
      <FormField label="Bio (optional)" htmlFor="additionalInfo" hint="Two or three lines for the back of their card.">
        <Textarea id="additionalInfo" name="additionalInfo" rows={3} defaultValue={member?.additionalInfo ?? ""} />
      </FormField>
      <ImageUploader name="photo" label="Photo (transparent cut-out)" existingUrl={member?.photo} aspectRatio={16 / 10} />

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.notice && <p className="text-sm text-amber-300">{state.notice}</p>}

      <SubmitButton>{member ? "Save Changes" : "Add Member"}</SubmitButton>
    </form>
  );
}
