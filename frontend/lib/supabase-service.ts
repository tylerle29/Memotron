// lib/supabase-service.ts
import { createClient } from '@supabase/supabase-js'

// Use hardcoded values as fallback since env vars might not load properly in API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qfestqwayjkhsxzxtihr.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZXN0cXdheWpraHN4enh0aWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDgzMjcsImV4cCI6MjA3ODIyNDMyN30.zWUaYk3xs4rWDxiETQuyl2fRf4WbUdRl_b8_C8wjNr8'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface MemeUpload {
  id: string
  user_id: string | null
  storage_path: string
  public_url: string
  original_filename: string
  file_size?: number
  content_type?: string
  ocr_text?: string
  analysis_result?: any
  created_at: string
  updated_at: string
}

/**
 * Upload image from base64 string to Supabase Storage
 */
export async function uploadBase64ToStorage(
  base64Data: string,
  filename: string,
  userId?: string
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    console.log('[Upload] Starting base64 upload...', { filename, userId })
    
    // Convert base64 to blob
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const byteCharacters = atob(base64String)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const contentType = getContentType(filename)
    const blob = new Blob([byteArray], { type: contentType })
    
    console.log('[Upload] Blob created:', { size: blob.size, type: contentType })

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = userId 
      ? `${userId}/${timestamp}-${sanitizedName}`
      : `anonymous/${timestamp}-${sanitizedName}`

    console.log('[Upload] Uploading to Supabase:', fileName)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('meme-uploads')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType
      })

    if (error) {
      console.error('[Upload] Storage upload error:', error)
      return null
    }

    console.log('[Upload] Upload successful:', data)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('meme-uploads')
      .getPublicUrl(data.path)

    console.log('[Upload] Public URL generated:', publicUrl)

    return {
      path: data.path,
      publicUrl: publicUrl
    }
  } catch (error) {
    console.error('[Upload] Upload exception:', error)
    return null
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImageFromStorage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('meme-uploads')
      .remove([path])

    if (error) {
      console.error('Storage delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Save meme upload record to database
 */
export async function saveMemeUpload(data: {
  userId?: string
  storagePath: string
  publicUrl: string
  originalFilename: string
  fileSize?: number
  contentType?: string
}): Promise<MemeUpload | null> {
  try {
    console.log('[DB] Saving meme upload:', data)
    
    const { data: upload, error } = await supabase
      .from('meme_uploads')
      .insert({
        user_id: data.userId || null,
        storage_path: data.storagePath,
        public_url: data.publicUrl,
        original_filename: data.originalFilename,
        file_size: data.fileSize,
        content_type: data.contentType,
      })
      .select()
      .single()

    if (error) {
      console.error('[DB] Insert error:', error)
      throw error
    }
    
    console.log('[DB] Upload saved successfully:', upload)
    return upload
  } catch (error) {
    console.error('[DB] Error saving meme upload:', error)
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
 * Get all recent meme uploads (for anonymous users)
 */
export async function getRecentMemeUploads(
  limit: number = 10
): Promise<MemeUpload[]> {
  try {
    const { data, error } = await supabase
      .from('meme_uploads')
      .select('*')
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
 * Delete meme upload record and storage file
 */
export async function deleteMemeUpload(id: string): Promise<boolean> {
  try {
    // First get the upload to find storage path
    const { data: upload, error: fetchError } = await supabase
      .from('meme_uploads')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Delete from storage
    if (upload?.storage_path) {
      await deleteImageFromStorage(upload.storage_path)
    }

    // Delete database record
    const { error: deleteError } = await supabase
      .from('meme_uploads')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
    return true
  } catch (error) {
    console.error('Error deleting meme upload:', error)
    return false
  }
}

/**
 * Get content type from filename
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  }
  return contentTypes[ext || ''] || 'image/png'
}