"use client"

import { supabase } from "./supabaseClient"

// STEP 1: Upload image to Supabase Storage
// This function converts the base64 image to a file and uploads it to the 'meme-images' bucket
export async function uploadMemeImageToStorage(base64Image: string, fileName: string): Promise<string> {
  try {
    const base64Data = base64Image.split(",")[1] // Remove data:image/png;base64, prefix
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "image/png" })

    // Upload to Supabase Storage bucket 'meme-images'
    const uniqueFileName = `${Date.now()}-${fileName}`
    const { data, error } = await supabase.storage
      .from("meme-images") // Bucket name (must be created in Supabase dashboard)
      .upload(uniqueFileName, blob, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("[v0] Storage upload error:", error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    const { data: publicUrlData } = supabase.storage.from("meme-images").getPublicUrl(uniqueFileName)

    console.log("[v0] Image uploaded successfully:", publicUrlData.publicUrl)
    return publicUrlData.publicUrl
  } catch (err) {
    console.error("[v0] Upload failed:", err)
    throw err
  }
}

// STEP 2: Save meme analysis to database
// This function inserts the analysis results along with image URL into the 'memes' table
export async function saveMemeAnalysisToDatabase(analysisData: {
  title: string
  template: string
  caption?: string
  meaning?: string
  confidence?: number
  category?: string
  imageUrl: string
  userPrompt?: string
  detectedPersons?: any[]
}): Promise<void> {
  try {
    const { error } = await supabase.from("memes").insert([
      {
        title: analysisData.title,
        template: analysisData.template,
        caption: analysisData.caption,
        meaning: analysisData.meaning,
        confidence: analysisData.confidence,
        category: analysisData.category,
        image_url: analysisData.imageUrl,
        user_prompt: analysisData.userPrompt,
        detected_persons: analysisData.detectedPersons,
      },
    ])

    if (error) {
      console.error("[v0] Database insert error:", error)
      throw new Error(`Failed to save analysis: ${error.message}`)
    }

    console.log("[v0] Analysis saved to database successfully")
  } catch (err) {
    console.error("[v0] Save failed:", err)
    throw err
  }
}

// STEP 3: Fetch all memes from database
// Returns array of all meme records with their analysis and image URLs
export async function fetchAllMemes(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from("memes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Fetch error:", error)
      throw new Error(`Failed to fetch memes: ${error.message}`)
    }

    console.log("[v0] Memes fetched successfully:", data?.length || 0)
    return data || []
  } catch (err) {
    console.error("[v0] Fetch failed:", err)
    return []
  }
}
