// lib/supabase-service.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface MemeUpload {
  id: string
  user_id: string | null
  s3_key: string
  s3_url: string
  original_filename: string
  file_size?: number
  content_type?: string
  ocr_text?: string
  analysis_result?: any
  created_at: string
  updated_at: string
}

/**
 * Save meme upload record to Supabase
 */
export async function saveMemeUpload(data: {
  userId?: string
  s3Key: string
  s3Url: string
  originalFilename: string
  fileSize?: number
  contentType?: string
}): Promise<MemeUpload | null> {
  try {
    const { data: upload, error } = await supabase
      .from('meme_uploads')
      .insert({
        user_id: data.userId || null,
        s3_key: data.s3Key,
        s3_url: data.s3Url,
        original_filename: data.originalFilename,
        file_size: data.fileSize,
        content_type: data.contentType,
      })
      .select()
      .single()

    if (error) throw error
    return upload
  } catch (error) {
    console.error('Error saving meme upload:', error)
    return null
  }
}

/**
 * Update meme upload with OCR and analysis results
 */
export async function updateMemeAnalysis(
  id: string,
  ocrText: string,
  analysisResult: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('meme_uploads')
      .update({
        ocr_text: ocrText,
        analysis_result: analysisResult,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating meme analysis:', error)
    return false
  }
}

/**
 * Get user's meme uploads
 */
export async function getUserMemeUploads(
  userId: string,
  limit: number = 10
): Promise<MemeUpload[]> {
  try {
    const { data, error } = await supabase
      .from('meme_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching meme uploads:', error)
    return []
  }
}

/**
 * Delete meme upload record
 */
export async function deleteMemeUpload(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('meme_uploads')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting meme upload:', error)
    return false
  }
}