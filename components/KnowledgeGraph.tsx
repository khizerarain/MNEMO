/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface Node {
  id: string;
  title: string;
}

interface Link {
  source: string;
  target: string;
  similarity: number;
}

interface KnowledgeGraphProps {
  nodes: Node[];
  links: Link[];
}

export function KnowledgeGraph({ nodes, links }: KnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  const graphData = {
    nodes: nodes.map((node) => ({ ...node, val: 8 })),
    links: links.map((link) => ({ ...link, color: "#d1d5db" })),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
      <div className="lg:col-span-3 h-[600px] relative">
        <ForceGraph2D
          graphData={graphData}
          nodeAutoColorBy="id"
          nodeLabel="title"
          nodeRelSize={8}
          linkWidth={1.5}
          onNodeClick={handleNodeClick as any}
          backgroundColor="#ffffff"
          linkColor={() => "#d1d5db"}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.title;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillText(label, (node.x || 0) + 10, (node.y || 0) + 4);
          }}
        />
      </div>

      <div className="border-l border-mnemo-border bg-mnemo-background p-5 lg:col-span-1">
        {selectedNode ? (
          <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
            <CardHeader>
              <CardTitle className="font-display text-base font-medium">{selectedNode.title}</CardTitle>
              <CardDescription className="text-xs text-mnemo-muted">
                {links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id).length} connection
                {links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id).length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="text-sm text-mnemo-muted">
            Click a node to see details.
          </div>
        )}
      </div>
    </div>
  );
}
