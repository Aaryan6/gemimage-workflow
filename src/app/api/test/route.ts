import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("Test API called")
    console.log("GOOGLE_API_KEY exists:", !!process.env.GOOGLE_API_KEY)
    console.log("GOOGLE_API_KEY preview:", process.env.GOOGLE_API_KEY?.substring(0, 10))
    
    // Try importing the new package
    const { GoogleGenAI } = await import("@google/genai")
    console.log("GoogleGenAI imported successfully")
    
    const ai = new GoogleGenAI({})
    console.log("GoogleGenAI instance created")
    
    return NextResponse.json({
      success: true,
      message: "Test API working",
      hasApiKey: !!process.env.GOOGLE_API_KEY,
      packageImported: true
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}