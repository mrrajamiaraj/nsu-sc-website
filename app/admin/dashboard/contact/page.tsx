import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { ContactContentForm } from "@/components/admin/contact/ContactContentForm";
import { updateContactContent } from "./actions";

export default async function AdminContactPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("site_content")
    .select("page_key, content")
    .in("page_key", ["contact_address", "contact_phone", "contact_email", "contact_hours"]);

  const get = (key: string) => rows?.find((row) => row.page_key === key)?.content ?? "";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Contact Page</h1>
      <GlassCard className="mt-6">
        <ContactContentForm
          address={get("contact_address")}
          phone={get("contact_phone")}
          email={get("contact_email")}
          hours={get("contact_hours")}
          action={updateContactContent}
        />
      </GlassCard>
    </div>
  );
}
