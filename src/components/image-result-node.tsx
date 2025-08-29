"use client"

import type React from "react"
import { Handle, Position } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Download, X } from "lucide-react"


interface ImageResultNodeData {
  label: string
  imageUrl: string
  prompt: string
  description?: string
  enhancedPrompt?: string
  styleAnalysis?: string
  generatedAt: string
  output?: string
}

export default function ImageResultNode({ id, data }: { id: string; data: unknown }) {
  const nodeData = data as ImageResultNodeData

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = nodeData.imageUrl
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
        <span className="text-xs text-muted-foreground ml-auto">{nodeData.generatedAt}</span>
      </div>

      {/* Generated Image Display */}
      <div className="mb-3">
        <div className="w-full h-48 bg-white border-2 border-green-200 rounded overflow-hidden">
          <img
            src={nodeData.imageUrl}
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
          &ldquo;{nodeData.prompt}&rdquo;
        </div>
      </div>

      {/* Enhanced Prompt if available */}
      {/* {nodeData.enhancedPrompt && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">Enhanced Prompt:</div>
          <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
            {nodeData.enhancedPrompt}
          </div>
        </div>
      )} */}

      {/* Style Analysis if available */}
      {/* {nodeData.styleAnalysis && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">Style Analysis:</div>
          <div className="text-xs bg-green-50 p-2 rounded border border-green-200 max-h-20 overflow-y-auto">
            <pre className="whitespace-pre-line text-xs">{nodeData.styleAnalysis}</pre>
          </div>
        </div>
      )} */}

      {/* Description if available */}
      {/* {nodeData.description && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">Description:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {nodeData.description}
          </div>
        </div>
      )} */}

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