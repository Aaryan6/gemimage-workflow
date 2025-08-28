"use client"

import type React from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Download, X } from "lucide-react"
import { useWorkflowStore } from "@/stores/workflow-store"

interface ImageResultNodeData {
  label: string
  imageUrl: string
  prompt: string
  description?: string
  generatedAt: string
  output?: string
}

export default function ImageResultNode({ id, data }: NodeProps<ImageResultNodeData>) {
  const { updateNode } = useWorkflowStore()

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = data.imageUrl
    link.download = `generated-image-${Date.now()}.jpg`
    link.click()
  }

  const handleDelete = () => {
    // You can implement node deletion here
    console.log("Delete result node:", id)
  }

  return (
    <Card className="w-80 p-4 bg-card border-2 border-green-500">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-4 h-4 text-green-500" />
        <span className="font-medium text-sm">Generated Image</span>
        <span className="text-xs text-muted-foreground ml-auto">{data.generatedAt}</span>
      </div>

      {/* Generated Image Display */}
      <div className="mb-3">
        <div className="w-full h-48 bg-white border-2 border-green-200 rounded overflow-hidden">
          <img
            src={data.imageUrl}
            alt="Generated result"
            className="w-full h-full object-contain"
            onLoad={() => console.log("✅ Result image displayed successfully")}
            onError={() => console.error("❌ Failed to display result image")}
          />
        </div>
      </div>

      {/* Prompt Info */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-1">Prompt:</div>
        <div className="text-xs bg-gray-50 p-2 rounded">
          "{data.prompt}"
        </div>
      </div>

      {/* Description if available */}
      {data.description && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">Description:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {data.description}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700"
          type="button"
        >
          <Download className="w-3 h-3 mr-1" />
          Download
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          type="button"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Output Handle for connecting to other nodes */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500 border-2 border-white" />
    </Card>
  )
}