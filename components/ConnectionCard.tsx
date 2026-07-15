"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2 } from "lucide-react";

interface ConnectionCardProps {
  connection: {
    id: string;
    explanation: string;
    similarity_score: number;
    memory_a: { id: string; title: string };
    memory_b: { id: string; title: string };
    created_at: string;
  };
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const formattedDate = new Date(connection.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm mb-2">
          <Link href={`/dashboard?memory=${connection.memory_a.id}`} className="font-medium text-mnemo-accent hover:underline">
            {connection.memory_a.title}
          </Link>
          <Link2 className="w-4 h-4 text-mnemo-muted" />
          <Link href={`/dashboard?memory=${connection.memory_b.id}`} className="font-medium text-mnemo-accent hover:underline">
            {connection.memory_b.title}
          </Link>
        </div>
        <CardTitle className="font-display text-sm font-normal text-mnemo-text leading-relaxed">
          {connection.explanation}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 mt-2 text-xs">
          <span>{formattedDate}</span>
          <Badge variant="outline" className="text-xs border-mnemo-accent/30 text-mnemo-accent">
            {Math.round(connection.similarity_score * 100)}% match
          </Badge>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
