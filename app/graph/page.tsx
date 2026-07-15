import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/Navbar";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

export default async function GraphPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [memoriesResult, connectionsResult] = await Promise.all([
    supabase.from("memories").select("id, title").eq("user_id", user.id),
    supabase.from("connections").select("memory_a_id, memory_b_id, similarity_score").eq("user_id", user.id),
  ]);

  const memories = memoriesResult.data || [];
  const connections = connectionsResult.data || [];

  const nodes = memories.map((memory) => ({
    id: memory.id,
    title: memory.title,
  }));

  const links = connections.map((connection) => ({
    source: connection.memory_a_id,
    target: connection.memory_b_id,
    similarity: connection.similarity_score,
  }));

  return (
    <div className="min-h-screen bg-mnemo-background text-mnemo-text">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold mb-1">Knowledge graph</h1>
          <p className="text-mnemo-muted">Explore how your ideas connect to each other.</p>
        </div>

        {nodes.length === 0 ? (
          <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
            <CardContent className="p-10 text-center">
              <Network className="w-10 h-10 text-mnemo-muted mx-auto mb-4" />
              <CardTitle className="font-display text-lg mb-1">No memories yet</CardTitle>
              <CardDescription className="text-mnemo-muted">
                Capture your first idea to see your knowledge graph come to life.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-mnemo-border bg-mnemo-surface shadow-none overflow-hidden">
            <CardContent className="p-0">
              <KnowledgeGraph nodes={nodes} links={links} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
