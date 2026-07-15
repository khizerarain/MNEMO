import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AppShell } from "@/components/app/AppShell";
import { ChatWorkspace } from "@/components/app/ChatWorkspace";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { count } = await supabase
    .from("memories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <AppShell userEmail={user.email}>
      <ChatWorkspace hasMemories={(count || 0) > 0} />
    </AppShell>
  );
}
