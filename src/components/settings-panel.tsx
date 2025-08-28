"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, X } from "lucide-react"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState("")
  const apiProvider = "google"
  const model = "gemini-2.5-flash-image-preview"

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem(
      "ai-workflow-settings",
      JSON.stringify({
        apiProvider,
        apiKey,
        model,
      }),
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Gemini API Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>AI Provider</Label>
            <div className="p-2 bg-muted rounded-md text-sm">Google Gemini (gemini-2.5-flash-image-preview)</div>
          </div>

          <div>
            <Label htmlFor="api-key">Gemini API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">Model Capabilities:</p>
            <ul className="text-xs space-y-1">
              <li>• Image generation from text prompts</li>
              <li>• Multi-image editing and combining</li>
              <li>• Advanced vision understanding</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
