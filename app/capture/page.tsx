"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, Link2, Loader2 } from "lucide-react";

interface ExtractedIdea {
  insight: string;
  question: string;
  answer: string;
}

interface Memory {
  id: string;
  title: string;
  ideas: ExtractedIdea[];
  created_at: string;
}

export default function CapturePage() {
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMemory, setSavedMemory] = useState<Memory | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSavedMemory(null);

    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sourceUrl: sourceUrl || undefined }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save memory");

      setSavedMemory(data.memory);
      setContent("");
      setSourceUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mnemo-background text-mnemo-text">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold mb-1">Capture a memory</h1>
          <p className="text-mnemo-muted">Paste something you learned. MNEMO will extract the core ideas.</p>
        </div>

        <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste anything you've learned today..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={8}
                  className="bg-mnemo-background border-mnemo-border rounded-lg resize-none focus-visible:ring-mnemo-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrl" className="text-sm font-medium">Source URL (optional)</Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="bg-mnemo-background border-mnemo-border rounded-lg focus-visible:ring-mnemo-accent"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || content.trim().length === 0}
                className="w-full bg-mnemo-primary hover:bg-mnemo-primary/90 text-white rounded-lg h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save to memory"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {savedMemory && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Saved successfully</span>
            </div>

            <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
              <CardHeader>
                <CardTitle className="font-display text-lg font-medium">{savedMemory.title}</CardTitle>
                <CardDescription>{savedMemory.ideas.length} extracted ideas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedMemory.ideas.map((idea, index) => (
                  <div key={index} className="p-3 rounded-lg bg-mnemo-background border border-mnemo-border">
                    <Badge variant="outline" className="mb-2 border-mnemo-accent/30 text-mnemo-accent">
                      Idea {index + 1}
                    </Badge>
                    <p className="text-sm text-mnemo-text">{idea.insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full border-mnemo-border text-mnemo-text hover:bg-mnemo-surface rounded-lg">
                  <Link2 className="w-4 h-4 mr-2" />
                  View dashboard
                </Button>
              </Link>
              <Button
                onClick={() => setSavedMemory(null)}
                className="flex-1 bg-mnemo-primary hover:bg-mnemo-primary/90 text-white rounded-lg"
              >
                Capture another
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
