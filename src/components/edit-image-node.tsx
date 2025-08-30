"use client";

import type React from "react";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2 } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";

interface EditImageNodeData {
  label: string;
  prompt: string;
  result: string | null;
  isProcessing?: boolean;
  error?: string;
  generatedImage?: string;
  output?: string;
  enhancedPrompt?: string;
  styleAnalysis?: string;
}

export default function EditImageNode({
  id,
  data,
}: {
  id: string;
  data: unknown;
}) {
  const nodeData = data as EditImageNodeData;
  const [prompt, setPrompt] = useState(nodeData?.prompt || "");
  const [inputImages, setInputImages] = useState<string[]>([]);
  const { updateNode, nodes, edges, addNode } = useWorkflowStore();

  // Memoize the connected inputs calculation to prevent unnecessary recalculations
  const connectedInputs = useMemo(() => {
    return edges
      .filter((edge) => edge.target === id)
      .map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        return sourceNode?.data?.output as string;
      })
      .filter(Boolean) as string[];
  }, [edges, nodes, id]);

  // Only update input images if the connected inputs actually changed
  useEffect(() => {
    const hasChanged =
      JSON.stringify(connectedInputs) !== JSON.stringify(inputImages);
    if (hasChanged) {
      setInputImages(connectedInputs);
    }
  }, [connectedInputs, inputImages]);

  const handlePromptChange = useCallback(
    (value: string) => {
      setPrompt(value);
      updateNode(id, { prompt: value });
    },
    [id, updateNode]
  );

  const handleEdit = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!prompt.trim() || inputImages.length === 0) return;

      updateNode(id, { isProcessing: true, error: null });

      try {
        const response = await fetch("/api/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: inputImages,
            prompt: prompt,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Clear the processing state
          updateNode(id, {
            isProcessing: false,
            output: result.imageUrl,
            enhancedPrompt: result.enhancedPrompt,
            styleAnalysis: result.styleAnalysis,
          });

          // Find current node position
          const currentNode = nodes.find((n) => n.id === id);
          const baseX = currentNode?.position?.x || 0;
          const baseY = currentNode?.position?.y || 0;

          // Create a new result node
          const resultNodeId = `edited-result-${Date.now()}`;
          const newResultNode = {
            id: resultNodeId,
            type: "imageResult",
            position: {
              x: baseX + 400, // Position to the right of the edit node
              y: baseY,
            },
            data: {
              label: "Edited Image",
              imageUrl: result.imageUrl,
              prompt: prompt,
              description: result.description || `Edited: ${prompt}`,
              enhancedPrompt: result.enhancedPrompt,
              styleAnalysis: result.styleAnalysis,
              generatedAt: new Date().toLocaleTimeString(),
              output: result.imageUrl, // This allows connecting to other nodes
            },
          };

          addNode(newResultNode);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        updateNode(id, {
          isProcessing: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    [id, prompt, inputImages, updateNode, nodes, addNode]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      updateNode(id, { result: null, output: null, generatedImage: null });
    },
    [id, updateNode]
  );

  return (
    <Card className="w-80 p-4 bg-card border-2 border-border">
      <div className="flex items-center gap-2">
        <Edit className="w-4 h-4 text-orange-500" />
        <span className="font-medium text-sm">Edit Image</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Editing Prompt
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Enter editing prompt..."
            className="text-sm resize-none"
            rows={3}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
        </div>

        {inputImages.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-2 overflow-y-auto">
              {inputImages.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`Input ${index + 1}`}
                  className="w-full aspect-video object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=80&width=80&text=Error";
                  }}
                />
              ))}
              {inputImages.length > 4 && (
                <div className="w-full h-20 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                  +{inputImages.length - 4} more
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            Connect image nodes to edit
          </div>
        )}

        {nodeData?.error && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
            Error: {nodeData.error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={
              !prompt.trim() ||
              inputImages.length === 0 ||
              nodeData?.isProcessing
            }
            size="sm"
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            type="button"
          >
            {nodeData?.isProcessing ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Editing...
              </>
            ) : (
              "Edit"
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={!nodeData?.result && !nodeData?.generatedImage}
            type="button"
          >
            Delete
          </Button>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </Card>
  );
}
