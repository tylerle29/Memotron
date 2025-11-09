// lib/supabase-service.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface MemeUpload {
  id: string
  user_id: string | null
  storage_path: string  // Path in Supabase Storage
  public_url: string    // Public URL to access the image
  original_filename: string
  file_size?: number
  content_type?: string
  ocr_text?: string
  analysis_result?: any
  created_at: string
  updated_at: string
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImageToStorage(
  file: File,
  userId?: string
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = userId 
      ? `${userId}/${timestamp}-${sanitizedName}`
      : `anonymous/${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('meme-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('meme-uploads')
      .getPublicUrl(data.path)

    return {
      path: data.path,
      publicUrl: publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
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
    // Convert base64 to blob
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const byteCharacters = atob(base64String)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: getContentType(filename) })

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = userId 
      ? `${userId}/${timestamp}-${sanitizedName}`
      : `anonymous/${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('meme-uploads')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: getContentType(filename)
      })

    if (error) {
      console.error('Storage upload error:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('meme-uploads')
      .getPublicUrl(data.path)

    return {
      path: data.path,
      publicUrl: publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
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