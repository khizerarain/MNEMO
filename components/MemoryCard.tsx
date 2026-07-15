"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Link2, ExternalLink } from "lucide-react";

interface Idea {
  insight: string;
  question: string;
  answer: string;
}

interface Connection {
  id: string;
  explanation: string;
  similarity_score: number;
  other_memory: {
    id: string;
    title: string;
  };
}

interface MemoryCardProps {
  memory: {
    id: string;
    title: string;
    raw_content: string;
    source_url?: string | null;
    ideas: Idea[];
    created_at: string;
    connection_count: number;
  };
  connections?: Connection[];
}

export function MemoryCard({ memory, connections = [] }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(memory.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="border-mnemo-border bg-mnemo-surface shadow-none overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-base font-medium leading-snug">
              {memory.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 text-xs">
              <span>{formattedDate}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {memory.connection_count} connection
                {memory.connection_count === 1 ? "" : "s"}
              </span>
            </CardDescription>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-mnemo-muted hover:text-mnemo-text p-1 rounded-md hover:bg-mnemo-background transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 border-t border-mnemo-border pt-4">
          {memory.source_url && (
            <a
              href={memory.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-mnemo-accent hover:underline"
            >
              Source <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-mnemo-muted uppercase tracking-wider">
              Ideas
            </h4>
            {memory.ideas.map((idea, index) => (
              <div key={index} className="p-3 rounded-lg bg-mnemo-background border border-mnemo-border">
                <p className="text-sm text-mnemo-text">{idea.insight}</p>
              </div>
            ))}
          </div>

          {connections.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-mnemo-muted uppercase tracking-wider">
                Connected memories
              </h4>
              {connections.map((connection) => (
                <Link key={connection.id} href={`/dashboard?memory=${connection.other_memory.id}`}>
                  <div className="p-3 rounded-lg bg-mnemo-background border border-mnemo-border hover:border-mnemo-accent/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-mnemo-text">
                        {connection.other_memory.title}
                      </span>
                      <Badge variant="outline" className="text-xs border-mnemo-accent/30 text-mnemo-accent">
                        {Math.round(connection.similarity_score * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-mnemo-muted">{connection.explanation}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
