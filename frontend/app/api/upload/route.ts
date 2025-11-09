// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadBase64ToStorage, saveMemeUpload } from '@/lib/supabase-service'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Upload request received')
    
    const body = await request.json()
    const { image, filename, userId } = body

    if (!image) {
      console.error('[API] No image provided')
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Validate file size (check base64 string length - roughly 10MB)
    const base64String = image.replace(/^data:image\/\w+;base64,/, '')
    const estimatedSize = (base64String.length * 3) / 4
    const maxSize = 10 * 1024 * 1024 // 10MB

    console.log('[API] File size check:', { estimatedSize, maxSize })

    if (estimatedSize > maxSize) {
      console.error('[API] File too large')
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    console.log('[API] Uploading to storage...')
    const uploadResult = await uploadBase64ToStorage(
      image,
      filename || 'meme.png',
      userId
    )

    if (!uploadResult) {
      console.error('[API] Upload to storage failed')
      return NextResponse.json(
        { error: 'Upload to storage failed. Please check if the "meme-uploads" bucket exists in Supabase.' },
        { status: 500 }
      )
    }

    console.log('[API] Storage upload successful:', uploadResult)

    // Save metadata to database
    console.log('[API] Saving to database...')
    const upload = await saveMemeUpload({
      userId,
      storagePath: uploadResult.path,
      publicUrl: uploadResult.publicUrl,
      originalFilename: filename || 'meme.png',
      fileSize: Math.round(estimatedSize),
      contentType: getContentType(filename || 'meme.png'),
    })

    if (!upload) {
      console.error('[API] Failed to save upload record')
      return NextResponse.json(
        { error: 'Failed to save upload record. Please check if the "meme_uploads" table exists.' },
        { status: 500 }
      )
    }

    console.log('[API] Upload complete:', upload)

    return NextResponse.json({
      success: true,
      path: uploadResult.path,
      url: uploadResult.publicUrl,
      uploadId: upload.id,
    })
  } catch (error) {
    console.error('[API] Upload API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'No upload ID provided' },
        { status: 400 }
      )
    }

    const { deleteMemeUpload } = await import('@/lib/supabase-service')
    const success = await deleteMemeUpload(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Delete failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
  }
  return contentTypes[ext || ''] || 'image/png'
}