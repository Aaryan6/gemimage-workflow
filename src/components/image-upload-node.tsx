"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Handle, Position } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useWorkflowStore } from "@/stores/workflow-store"

interface ImageUploadNodeData {
  label: string
  images?: string[]
  uploadedImage?: string
  fileName?: string
  output?: string
}

export default function ImageUploadNode({ id, data }: { id: string; data: unknown }) {
  const nodeData = data as ImageUploadNodeData
  const [isDragOver, setIsDragOver] = useState(false)
  const [localImages, setLocalImages] = useState<string[]>([])
  const { updateNode } = useWorkflowStore()
  
  // Debug what data is actually being passed to the component
  console.log(`🔄 ImageUploadNode render - ID: ${id}`, {
    dataImages: nodeData.images?.length || 0,
    localImages: localImages.length,
    hasUploadedImage: !!nodeData.uploadedImage,
    hasOutput: !!nodeData.output
  })

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        console.log("No files selected")
        return
      }

      console.log(`📁 Processing ${files.length} files`)
      const file = files[0] // Just handle one file for now
      const reader = new FileReader()

      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) {
          console.log("📸 File read successfully:", file.name)
          console.log("📸 Image data preview:", result.substring(0, 100))
          
          // Update both local state and node data
          setLocalImages([result])
          updateNode(id, {
            images: [result],
            uploadedImage: result,
            fileName: file.name,
            output: result,
          })
          console.log("📸 Node updated with image data")
          console.log("📸 Local state updated")
        }
      }

      reader.onerror = (error) => {
        console.error("❌ File read error:", error)
      }

      reader.readAsDataURL(file)
    },
    [id, updateNode],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  

  return (
    <Card className="w-80 p-4 bg-card border-2 border-border">
      <div className="flex items-center gap-2 mb-3">
        <Upload className="w-4 h-4 text-blue-500" />
        <span className="font-medium text-sm">Image Upload</span>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-muted-foreground/25"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id={`file-input-${id}`}
        />
        <div>
          <div className="text-sm text-muted-foreground mb-2">Drop images here or click to browse</div>
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              console.log("🔘 Choose Files button clicked")
              const fileInput = document.getElementById(`file-input-${id}`) as HTMLInputElement
              if (fileInput) {
                fileInput.click()
              }
            }}
          >
            Choose Files
          </Button>
        </div>
      </div>

      <div className="mt-3">
        {/* Debug info */}
        <div className="text-xs bg-blue-50 p-2 rounded mb-2">
          🔍 Images in data: {nodeData.images?.length || 0}
          <br />
          🔍 Local images: {localImages.length}
          <br />
          🔍 Has uploadedImage: {nodeData.uploadedImage ? 'Yes' : 'No'}
          <br />
          🔍 Output set: {nodeData.output ? 'Yes' : 'No'}
        </div>
        
        {/* Use local state as primary source, fallback to data */}
        {((nodeData.images && nodeData.images.length > 0) || localImages.length > 0) && (
          <div className="bg-green-50 border-2 border-green-300 p-3 rounded">
            <div className="text-sm font-medium text-green-800 mb-2">✅ Image Uploaded!</div>
            <div className="w-full h-24 bg-white border-2 border-green-200 rounded overflow-hidden">
              <img
                src={localImages[0] || nodeData.images?.[0]}
                alt="Uploaded image"
                className="w-full h-full object-contain"
                style={{ display: 'block' }}
                onLoad={() => console.log("✅ IMAGE DISPLAYED SUCCESSFULLY")}
                onError={(e) => {
                  console.error("❌ IMAGE FAILED TO DISPLAY")
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Show if no image */}
        {(!nodeData.images || nodeData.images.length === 0) && localImages.length === 0 && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            No images uploaded yet
          </div>
        )}
      </div>

      {nodeData.output && (
        <div className="mt-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded">
          ✓ Ready to connect ({nodeData.fileName || "image"})
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </Card>
  )
}
