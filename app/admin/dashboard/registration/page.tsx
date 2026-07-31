import { createClient } from "@/lib/supabase/server";
import { mapRegistrationRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { RegistrationForm } from "@/components/admin/RegistrationForm";
import { updateRegistrationSettings } from "./actions";

export default async function AdminRegistrationPage() {
  const supabase = await createClient();
  const { data: row } = await supabase.from("registration_settings").select("*").eq("id", 1).single();
  const settings = mapRegistrationRow(row);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Registration Settings</h1>
      <GlassCard className="mt-6">
        <RegistrationForm settings={settings} action={updateRegistrationSettings} />
      </GlassCard>
    </div>
  );
}
