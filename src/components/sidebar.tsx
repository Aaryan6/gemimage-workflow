"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Upload, Edit, Palette } from "lucide-react"

const nodeTypes = [
  {
    type: "imageUpload",
    label: "Image Upload",
    icon: Upload,
    description: "Upload images to start your workflow",
  },
  {
    type: "editImage",
    label: "Edit Image",
    icon: Edit,
    description: "Edit and combine multiple images with AI",
  },
  {
    type: "generateImage",
    label: "Generate Image",
    icon: Palette,
    description: "Generate new images from text prompts",
  },
]

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">Components</h2>
        <div className="text-sm text-sidebar-foreground/70 mb-4">
          <p className="font-medium mb-2">How to use:</p>
          <ol className="space-y-1 text-xs">
            <li>1. Drag components to canvas</li>
            <li>2. Click output ports (blue circles) then input ports to connect</li>
            <li>3. Process nodes to generate/edit images</li>
          </ol>
        </div>
      </div>

      <div className="space-y-3">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon
          return (
            <Card
              key={nodeType.type}
              className="p-3 cursor-grab active:cursor-grabbing hover:bg-sidebar-accent transition-colors"
              draggable
              onDragStart={(event) => onDragStart(event, nodeType.type)}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-sidebar-primary" />
                <div>
                  <div className="font-medium text-sidebar-foreground text-sm">{nodeType.label}</div>
                  <div className="text-xs text-sidebar-foreground/70">{nodeType.description}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
