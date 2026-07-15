import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AppShell } from "@/components/app/AppShell";
import { CollectionsView } from "@/components/app/CollectionsView";
import { deriveTopic } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("memories")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const memories = ((data || []) as { id: string; title: string; created_at: string }[]).map(
    (m) => ({ id: m.id, title: m.title, topic: deriveTopic(m.title), created_at: m.created_at })
  );

  return (
    <AppShell userEmail={user.email}>
      <CollectionsView memories={memories} />
    </AppShell>
  );
}
