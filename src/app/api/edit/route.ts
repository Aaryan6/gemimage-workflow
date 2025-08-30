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

    // Analyze ALL uploaded images to extract style and content information
    const allStyleAnalyses = []
    const allContentDescriptions = []
    let combinedStyleAnalysis = ""
    let combinedContentDescription = ""
    
    try {
      // Analyze each image to understand its style and content
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        if (image.startsWith('data:')) {
          const mimeType = image.split(';')[0].split(':')[1]
          
          const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Analyze this image (Image ${i + 1} of ${images.length}) in detail and provide specific information about:

1. Visual Style: Describe the artistic style, color palette (be specific about colors), lighting conditions, composition, and overall visual aesthetic
2. Content Elements: List all objects, subjects, people, backgrounds, textures, patterns, and the overall mood/atmosphere
3. Technical Quality: Resolution, image quality, format, and any notable technical characteristics

Please format your response exactly as follows:
STYLE: [detailed style description with specific colors, lighting, composition]
CONTENT: [detailed content description with all visible elements, subjects, background details]
TECHNICAL: [technical aspects like resolution, quality, format]

Be very specific and descriptive. Include exact colors, textures, and visual elements you can see.`
                  },
                  base64ToGenerativePart(image, mimeType)
                ]
              }
            ],
            config: {
              temperature: 0.1,
              responseModalities: ['TEXT']
            }
          })

          const analysisText = analysisResponse.text || ""
          allStyleAnalyses.push(analysisText)
          allContentDescriptions.push(analysisText)
          
          
          // Validate that we got a proper analysis
          if (!analysisText.includes('STYLE:') || !analysisText.includes('CONTENT:')) {
          }
        }
      }
      
      // Combine all style analyses into a comprehensive analysis
      if (allStyleAnalyses.length > 0) {
        const styleParts = []
        const contentParts = []
        
        for (let i = 0; i < allStyleAnalyses.length; i++) {
          const analysis = allStyleAnalyses[i]
          const styleMatch = analysis.match(/STYLE:\s*([\s\S]*?)(?=\nCONTENT:|$)/i)
          const contentMatch = analysis.match(/CONTENT:\s*([\s\S]*?)(?=\nTECHNICAL:|$)/i)
          
          if (styleMatch) {
            styleParts.push(`Image ${i + 1}: ${styleMatch[1].trim()}`)
          }
          if (contentMatch) {
            contentParts.push(`Image ${i + 1}: ${contentMatch[1].trim()}`)
          }
        }
        
        combinedStyleAnalysis = styleParts.join('\n\n')
        combinedContentDescription = contentParts.join('\n\n')
      }
      
    } catch {
      combinedStyleAnalysis = "STYLE: Unable to analyze style automatically\nCONTENT: Reference images provided for style guidance\nTECHNICAL: Standard image format"
      combinedContentDescription = "CONTENT: Reference images provided for content guidance"
    }

    // Construct an enhanced prompt that incorporates ALL images' style information and user's specific request
    let enhancedPrompt = prompt
    
    // Validate style analysis
    if (!combinedStyleAnalysis || (!combinedStyleAnalysis.includes('STYLE:') && !combinedStyleAnalysis.includes('CONTENT:'))) {
      combinedStyleAnalysis = "STYLE: Reference image style to be preserved\nCONTENT: Visual elements from reference images\nTECHNICAL: Standard image format"
    }
    
    if (combinedStyleAnalysis) {
      // Create a comprehensive prompt that addresses the user's specific request
      enhancedPrompt = `${prompt}

User Request: ${prompt}

Reference Images Analysis:
${images.length > 1 ? `You have ${images.length} reference images to work with.` : 'You have 1 reference image to work with.'}

Style Reference: Apply these specific style characteristics from the reference images:
${combinedStyleAnalysis}

Content Reference: Incorporate these visual elements and composition details:
${combinedContentDescription}

Instructions: 
1. Focus on the user's specific request: "${prompt}"
2. Use the reference images as style and content guides
3. Maintain the visual quality and aesthetic from the reference images
4. Ensure the final result addresses what the user specifically asked for
5. If merging images, combine elements naturally while preserving style consistency
6. If editing specific elements, maintain the overall style and composition

Create a new image that fulfills the user's request while maintaining the exact color palette, lighting, artistic style, and visual aesthetic from the reference images.`
    } else {
      enhancedPrompt = `${prompt}

Important Instructions:
- User Request: ${prompt}
- Use the provided reference images as exact style guides
- Maintain the same color palette, lighting, artistic style, and visual composition from the reference images
- The result should be consistent with the visual style of the input images
- Focus on what the user specifically requested: "${prompt}"`
    }
    

    // Generate a new image based on the enhanced prompt using gemini-2.5-flash-image-preview
    try {
      // Prepare content for the new model
      const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: enhancedPrompt }]
      
      // Supported MIME types for Gemini models
      const supportedMimeTypes = [
        'image/png',
        'image/jpeg', 
        'image/jpg',
        'image/webp',
        'image/heic',
        'image/heif'
      ]

      // Add all reference images for multi-image generation
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        if (image && image.startsWith('data:')) {
          const [header, base64Data] = image.split(',')
          const mimeType = header.split(':')[1].split(';')[0]
          
          // Check if MIME type is supported
          if (!supportedMimeTypes.includes(mimeType)) {
            continue
          }
          
          contentParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          })
        }
      }


      const editResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: contentParts
      })

      // Extract image from response
      let imageData = null
      for (const part of editResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageData = part.inlineData.data
          break
        }
      }

      if (imageData) {
        const editedImageUrl = `data:image/png;base64,${imageData}`
        
        return NextResponse.json({
          success: true,
          imageUrl: editedImageUrl,
          originalImages: images,
          editPrompt: prompt,
          enhancedPrompt: enhancedPrompt,
          styleAnalysis: combinedStyleAnalysis,
          contentDescription: combinedContentDescription,
          numberOfImagesAnalyzed: images.length,
          description: enhancedPrompt
        })
      } else {
        throw new Error("No image data received from generation")
      }
    } catch (imageGenError) {
      throw new Error(`Image generation failed: ${imageGenError instanceof Error ? imageGenError.message : 'Unknown error'}`)
    }

  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to edit image", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}