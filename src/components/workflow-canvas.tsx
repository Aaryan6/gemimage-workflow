"use client";

import type React from "react";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflowStore } from "@/stores/workflow-store";
import ImageUploadNode from "./image-upload-node";
import EditImageNode from "./edit-image-node";
import GenerateImageNode from "./generate-image-node";
import ImageResultNode from "./image-result-node";

const nodeTypes = {
  imageUpload: ImageUploadNode,
  editImage: EditImageNode,
  generateImage: GenerateImageNode,
  imageResult: ImageResultNode,
};

export default function WorkflowCanvas() {
  const { nodes, edges, addNode, setNodes, setEdges } = useWorkflowStore();

  const onNodesChange = useCallback((changes: unknown[]) => {
    const updatedNodes = changes.reduce((acc: Node[], change: unknown) => {
      const typedChange = change as { type: string; id: string; position?: { x: number; y: number } };
      if (typedChange.type === 'position') {
        return acc.map((node: Node) => 
          node.id === typedChange.id 
            ? { ...node, position: typedChange.position || node.position }
            : node
        );
      }
      return acc;
    }, nodes);
    
    setNodes(updatedNodes);
  }, [nodes, setNodes]);

  const onEdgesChange = useCallback(() => {
    // Handle edge changes if needed
    // For now, just update the store with current edges
    setEdges(edges);
  }, [edges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }

      // Responsive positioning - adjust based on screen size
      const sidebarWidth = window.innerWidth >= 768 ? 250 : 0; // Only desktop has visible sidebar
      const headerHeight = 100;
      const position = {
        x: event.clientX - sidebarWidth,
        y: event.clientY - headerHeight,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: `${type} node`,
          images: [],
          prompt: "",
          result: null,
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-muted/20"
        // Better mobile interaction
        panOnScroll
        panOnScrollSpeed={0.5}
        zoomOnScroll={false}
        zoomOnPinch
        panOnDrag
        // Handle connections better on mobile
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Controls 
          className="react-flow__controls"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          position="bottom-right"
        />
        {/* Only show MiniMap on larger screens */}
        <div className="hidden lg:block">
          <MiniMap 
            className="react-flow__minimap"
            zoomable
            pannable
          />
        </div>
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
