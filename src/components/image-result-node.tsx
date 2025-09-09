"use client";

import type React from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Download, X } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useCallback } from "react";

interface ImageResultNodeData {
  label: string;
  imageUrl: string;
  prompt: string;
  description?: string;
  enhancedPrompt?: string;
  styleAnalysis?: string;
  generatedAt: string;
  output?: string;
}

export default function ImageResultNode({
  id,
  data,
}: {
  id: string;
  data: unknown;
}) {
  const nodeData = data as ImageResultNodeData;
  const { removeNode } = useWorkflowStore();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = nodeData.imageUrl;
    link.download = `generated-image-${Date.now()}.jpg`;
    link.click();
  };

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      removeNode(id);
    },
    [id, removeNode]
  );

  return (
    <Card className="w-80 md:w-80 sm:w-72 p-3 md:p-4 bg-card border-2 border-green-500 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-sm z-10"
        type="button"
      >
        <X className="w-3 h-3" />
      </Button>
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-4 h-4 text-green-500" />
        <span className="font-medium text-sm">Generated Image</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {nodeData.generatedAt}
        </span>
      </div>

      {/* Generated Image Display */}
      <div className="mb-3">
        <div className="w-full h-56 bg-white border-2 border-green-200 rounded overflow-hidden">
          <img
            src={nodeData.imageUrl}
            alt="Generated result"
            className="w-full h-full object-contain"
            onLoad={() => {}}
            onError={() => {}}
          />
        </div>
      </div>

      {/* Prompt Info */}
      <div className="">
        <div className="text-xs text-muted-foreground mb-1">Prompt:</div>
        <div className="text-xs bg-gray-50 p-2 rounded">
          &ldquo;{nodeData.prompt}&rdquo;
        </div>
      </div>

      <Button
        onClick={handleDownload}
        size="sm"
        className="w-full bg-green-600 hover:bg-green-700 touch-manipulation"
        type="button"
      >
        <Download className="w-3 h-3 mr-1" />
        <span className="hidden sm:inline">Download</span>
        <span className="sm:hidden">Save</span>
      </Button>

      {/* Output Handle for connecting to other nodes */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </Card>
  );
}
