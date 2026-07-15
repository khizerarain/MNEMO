import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: memories } = await supabase
    .from("memories")
    .select("id, title")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-mnemo-background text-mnemo-text">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold mb-1">Chat with your brain</h1>
          <p className="text-mnemo-muted">Ask questions about anything you&apos;ve saved.</p>
        </div>

        {(memories || []).length === 0 ? (
          <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
            <CardContent className="p-10 text-center">
              <MessageSquare className="w-10 h-10 text-mnemo-muted mx-auto mb-4" />
              <CardTitle className="font-display text-lg mb-1">No memories yet</CardTitle>
              <CardDescription className="text-mnemo-muted">
                Capture your first idea to start chatting with your knowledge.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <ChatInterface />
        )}
      </main>
    </div>
  );
}
