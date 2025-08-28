import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google API key not configured" }, { status: 500 })
    }

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1'
      }
    })

    const generatedImages = response.generatedImages
    if (!generatedImages || generatedImages.length === 0) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 })
    }

    const firstImage = generatedImages[0]
    if (!firstImage.image?.imageBytes) {
      return NextResponse.json({ error: "No image data received" }, { status: 500 })
    }

    // Convert base64 to data URL
    const imageUrl = `data:image/jpeg;base64,${firstImage.image.imageBytes}`

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      description: firstImage.enhancedPrompt || prompt
    })
  } catch (error) {
    console.error("Generate API error:", error)
    return NextResponse.json({ 
      error: "Failed to generate image", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
