"use client";

import type React from "react";
import { Upload, Edit, Palette } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { type Node } from "@xyflow/react";

const nodeTypes = [
  {
    type: "imageUpload",
    label: "Upload",
    icon: Upload,
    color: "text-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
  },
  {
    type: "editImage",
    label: "Edit",
    icon: Edit,
    color: "text-orange-500",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200",
  },
  {
    type: "generateImage",
    label: "Generate",
    icon: Palette,
    color: "text-purple-500",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
  },
];

export default function MobileNodeTabs() {
  const { addNode } = useWorkflowStore();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (nodeType: string) => {
    // Generate random position for mobile clicks
    const x = Math.random() * 300 + 100;
    const y = Math.random() * 200 + 100;

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x, y },
      data: {
        label: `${nodeType} node`,
        images: [],
        prompt: "",
        result: null,
      },
    };

    addNode(newNode);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 z-30">
      <div className="flex gap-2 justify-center">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <div
              key={nodeType.type}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer active:scale-95 transition-all touch-manipulation min-w-20 ${nodeType.bgColor} ${nodeType.borderColor}`}
              draggable
              onDragStart={(event) => onDragStart(event, nodeType.type)}
              onClick={() => handleClick(nodeType.type)}
            >
              <Icon className={`w-5 h-5 mb-1 ${nodeType.color}`} />
              <span className="text-xs font-medium text-foreground">
                {nodeType.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}