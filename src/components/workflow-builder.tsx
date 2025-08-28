"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import WorkflowCanvas from "./workflow-canvas"
import Sidebar from "./sidebar"
import SettingsPanel from "./settings-panel"
import { useWorkflowStore } from "@/stores/workflow-store"
import { Settings } from "lucide-react"

export default function WorkflowBuilder() {
  const { clearWorkflow } = useWorkflowStore()
  const [showSettings, setShowSettings] = useState(false)

  const handleClearWorkflow = () => {
    clearWorkflow()
  }

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-2xl font-semibold text-foreground">AI Image Workflow Builder</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={handleClearWorkflow}>
              Clear Workflow
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas />
        </div>
      </div>

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
