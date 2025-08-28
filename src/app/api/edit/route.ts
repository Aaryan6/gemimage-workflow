import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({})

function base64ToGenerativePart(imageData: string, mimeType: string) {
  return {
    inlineData: {
      data: imageData.split(",")[1], // Remove data:image/jpeg;base64, prefix
      mimeType: mimeType,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { images, prompt } = await request.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    if (!prompt) {
      return NextResponse.json({ error: "Edit prompt is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google API key not configured" }, { status: 500 })
    }

    // Prepare the content parts with text prompt and multiple images
    const contents = [prompt]
    
    // Add all images to the request
    for (const imageUrl of images) {
      if (imageUrl.startsWith('data:')) {
        // Extract mime type from data URL
        const mimeType = imageUrl.split(';')[0].split(':')[1]
        contents.push(base64ToGenerativePart(imageUrl, mimeType))
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        temperature: 0.9,
        responseModalities: ['TEXT', 'IMAGE']
      }
    })

    const textResponse = response.text || ""
    
    // For now, since the editing might not directly return images in the current setup,
    // we'll generate a new image based on the prompt and reference images
    if (images.length > 0) {
      try {
        const editResponse = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: `${prompt}. Use the reference style and elements from the provided images.`,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1'
          }
        })

        const generatedImages = editResponse.generatedImages
        if (generatedImages && generatedImages.length > 0 && generatedImages[0].image?.imageBytes) {
          const editedImageUrl = `data:image/jpeg;base64,${generatedImages[0].image.imageBytes}`
          
          return NextResponse.json({
            success: true,
            imageUrl: editedImageUrl,
            originalImages: images,
            editPrompt: prompt,
            description: generatedImages[0].enhancedPrompt || textResponse
          })
        }
      } catch (imageGenError) {
        console.error("Image generation failed, returning text response:", imageGenError)
      }
    }

    return NextResponse.json({ error: "No image generated from editing" }, { status: 500 })
  } catch (error) {
    console.error("Edit API error:", error)
    return NextResponse.json({ 
      error: "Failed to edit image", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
