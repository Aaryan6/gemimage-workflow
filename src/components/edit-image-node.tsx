"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Loader2 } from "lucide-react"
import { useWorkflowStore } from "@/stores/workflow-store"

interface EditImageNodeData {
  label: string
  prompt: string
  result: string | null
  isProcessing?: boolean
  error?: string
  generatedImage?: string
  output?: string
}

export default function EditImageNode({ id, data }: NodeProps<EditImageNodeData>) {
  const [prompt, setPrompt] = useState(data.prompt || "")
  const [inputImages, setInputImages] = useState<string[]>([])
  const { updateNode, nodes, edges, addNode } = useWorkflowStore()

  useEffect(() => {
    const connectedInputs = edges
      .filter((edge) => edge.target === id)
      .map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        return sourceNode?.data.output
      })
      .filter(Boolean) as string[]

    setInputImages(connectedInputs)
  }, [id, edges, nodes])

  const handlePromptChange = useCallback(
    (value: string) => {
      setPrompt(value)
      updateNode(id, { prompt: value })
    },
    [id, updateNode],
  )

  const handleEdit = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (!prompt.trim() || inputImages.length === 0) return

      updateNode(id, { isProcessing: true, error: null })

      try {
        const response = await fetch("/api/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: inputImages,
            prompt: prompt,
          }),
        })

        const result = await response.json()

        if (result.success) {
          // Clear the processing state
          updateNode(id, {
            isProcessing: false,
            output: result.imageUrl,
          })

          // Find current node position
          const currentNode = nodes.find(n => n.id === id)
          const baseX = currentNode?.position?.x || 0
          const baseY = currentNode?.position?.y || 0

          // Create a new result node
          const resultNodeId = `edited-result-${Date.now()}`
          const newResultNode = {
            id: resultNodeId,
            type: 'imageResult',
            position: {
              x: baseX + 400, // Position to the right of the edit node
              y: baseY
            },
            data: {
              label: 'Edited Image',
              imageUrl: result.imageUrl,
              prompt: prompt,
              description: result.description || `Edited: ${prompt}`,
              generatedAt: new Date().toLocaleTimeString(),
              output: result.imageUrl // This allows connecting to other nodes
            }
          }

          addNode(newResultNode)
          console.log("✅ Created new edited result node:", resultNodeId)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error("Error editing image:", error)
        updateNode(id, {
          isProcessing: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    },
    [id, prompt, inputImages, updateNode],
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      updateNode(id, { result: null, output: null, generatedImage: null })
    },
    [id, updateNode],
  )

  return (
    <Card className="w-80 p-4 bg-card border-2 border-border">
      <div className="flex items-center gap-2 mb-3">
        <Edit className="w-4 h-4 text-orange-500" />
        <span className="font-medium text-sm">Edit Image</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Editing Prompt</label>
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
            <div className="text-xs text-muted-foreground mb-2">Input Images: {inputImages.length}</div>
            <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto">
              {inputImages.slice(0, 6).map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`Input ${index + 1}`}
                  className="w-full h-12 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=48&width=48&text=Error"
                  }}
                />
              ))}
              {inputImages.length > 6 && (
                <div className="w-full h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                  +{inputImages.length - 6}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">Waiting for source images...</div>
        )}

        {data.error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded">Error: {data.error}</div>}

        {data.isProcessing && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            ✏️ Editing image... A new result node will appear when complete!
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={!prompt.trim() || inputImages.length === 0 || data.isProcessing}
            size="sm"
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            type="button"
          >
            {data.isProcessing ? (
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
            disabled={!data.result && !data.generatedImage}
            type="button"
          >
            Delete
          </Button>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500 border-2 border-white" />
    </Card>
  )
}
