import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/Navbar";
import { MemoryCard } from "@/components/MemoryCard";
import { ConnectionCard } from "@/components/ConnectionCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Network, GraduationCap, MessageSquare, Brain, Link2, Zap, BookOpen } from "lucide-react";

interface MemoryWithConnections {
  id: string;
  title: string;
  raw_content: string;
  source_url?: string | null;
  ideas: Array<{ insight: string; question: string; answer: string }>;
  created_at: string;
  connection_count: number;
  connections: Array<{
    id: string;
    explanation: string;
    similarity_score: number;
    other_memory: {
      id: string;
      title: string;
    };
  }>;
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const uniqueDays = Array.from(
    new Set(dates.map((date) => new Date(date).toDateString()))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let expectedDay = today;
  for (const day of uniqueDays) {
    if (day === expectedDay || (streak === 0 && day === yesterday)) {
      streak++;
      expectedDay = new Date(new Date(expectedDay).getTime() - 86400000).toDateString();
    } else if (streak > 0) {
      break;
    }
  }
  return streak;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [memoriesResult, connectionsResult, quizResult] = await Promise.all([
    supabase
      .from("memories")
      .select("id, title, raw_content, source_url, ideas, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("connections")
      .select("id, explanation, similarity_score, memory_a_id, memory_b_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("quiz_cards")
      .select("id")
      .eq("user_id", user.id)
      .lte("next_review_at", new Date().toISOString()),
  ]);

  const memories = memoriesResult.data || [];
  const connections = connectionsResult.data || [];
  const dueCards = quizResult.data || [];

  const countMap = new Map<string, number>();
  for (const memory of memories) {
    countMap.set(memory.id, 0);
  }
  for (const connection of connections) {
    if (countMap.has(connection.memory_a_id)) {
      countMap.set(connection.memory_a_id, (countMap.get(connection.memory_a_id) || 0) + 1);
    }
    if (countMap.has(connection.memory_b_id)) {
      countMap.set(connection.memory_b_id, (countMap.get(connection.memory_b_id) || 0) + 1);
    }
  }

  const memoriesWithConnections: MemoryWithConnections[] = memories.map((memory) => {
    const memoryConnections = connections
      .filter((c) => c.memory_a_id === memory.id || c.memory_b_id === memory.id)
      .map((c) => ({
        id: c.id,
        explanation: c.explanation,
        similarity_score: c.similarity_score,
        other_memory: {
          id: c.memory_a_id === memory.id ? c.memory_b_id : c.memory_a_id,
          title: memories.find((m) => m.id === (c.memory_a_id === memory.id ? c.memory_b_id : c.memory_a_id))?.title || "Unknown",
        },
      }));
    return { ...memory, connection_count: countMap.get(memory.id) || 0, connections: memoryConnections };
  });

  const recentConnections = connections.slice(0, 3).map((connection) => ({
    ...connection,
    memory_a: {
      id: connection.memory_a_id,
      title: memories.find((m) => m.id === connection.memory_a_id)?.title || "Unknown",
    },
    memory_b: {
      id: connection.memory_b_id,
      title: memories.find((m) => m.id === connection.memory_b_id)?.title || "Unknown",
    },
  }));

  const allActivityDates = [...memories.map((m) => m.created_at), ...connections.map((c) => c.created_at)];
  const streak = calculateStreak(allActivityDates);
  const totalConnections = connections.length;

  const stats = [
    { label: "Memories", value: memories.length, icon: BookOpen },
    { label: "Connections", value: totalConnections, icon: Link2 },
    { label: "Due today", value: dueCards.length, icon: GraduationCap },
    { label: "Streak", value: streak, icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-mnemo-background text-mnemo-text">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold mb-2">Dashboard</h1>
          <p className="text-mnemo-muted">Overview of your knowledge and learning progress.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-mnemo-border bg-mnemo-surface shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-mnemo-muted" />
                    <span className="text-sm text-mnemo-muted">{stat.label}</span>
                  </div>
                  <div className="font-display text-2xl font-semibold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/capture">
            <Button className="bg-mnemo-primary hover:bg-mnemo-primary/90 text-white rounded-full px-5">
              <Plus className="w-4 h-4 mr-2" />
              Add memory
            </Button>
          </Link>
          <Link href="/quiz">
            <Button variant="outline" className="border-mnemo-border text-mnemo-text hover:bg-mnemo-surface rounded-full px-5">
              <GraduationCap className="w-4 h-4 mr-2" />
              Quiz
            </Button>
          </Link>
          <Link href="/graph">
            <Button variant="outline" className="border-mnemo-border text-mnemo-text hover:bg-mnemo-surface rounded-full px-5">
              <Network className="w-4 h-4 mr-2" />
              Graph
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" className="border-mnemo-border text-mnemo-text hover:bg-mnemo-surface rounded-full px-5">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-display text-lg font-semibold">Recent memories</h2>
            {memoriesWithConnections.length === 0 ? (
              <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
                <CardContent className="p-10 text-center">
                  <Brain className="w-10 h-10 text-mnemo-muted mx-auto mb-4" />
                  <CardTitle className="font-display text-lg mb-1">No memories yet</CardTitle>
                  <CardDescription className="text-mnemo-muted mb-4">
                    Capture your first idea to start building your knowledge graph.
                  </CardDescription>
                  <Link href="/capture">
                    <Button className="bg-mnemo-primary hover:bg-mnemo-primary/90 text-white rounded-full px-5">
                      <Plus className="w-4 h-4 mr-2" />
                      Add memory
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              memoriesWithConnections.slice(0, 6).map((memory) => (
                <MemoryCard key={memory.id} memory={memory} connections={memory.connections} />
              ))
            )}
          </div>

          <div className="space-y-6">
            <h2 className="font-display text-lg font-semibold">Recently connected</h2>
            {recentConnections.length === 0 ? (
              <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-mnemo-muted">No connections found yet.</p>
                </CardContent>
              </Card>
            ) : (
              recentConnections.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
