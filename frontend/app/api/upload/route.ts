// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3, validateFileSize, base64ToBuffer } from '@/lib/s3-upload'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, filename, userId } = body

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert base64 to buffer
    const imageBuffer = base64ToBuffer(image)

    // Validate file size (10MB max)
    if (!validateFileSize(imageBuffer, 10)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Upload to S3
    const result = await uploadToS3(
      imageBuffer,
      filename || 'meme.png',
      userId
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }

    // Save to Supabase
    const { saveMemeUpload } = await import('@/lib/supabase-service')
    const upload = await saveMemeUpload({
      userId,
      s3Key: result.key!,
      s3Url: result.url!,
      originalFilename: filename || 'meme.png',
      fileSize: imageBuffer.length,
      contentType: filename ? getContentType(filename) : 'image/png',
    })

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      uploadId: upload?.id,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'No key provided' },
        { status: 400 }
      )
    }

    const { deleteFromS3 } = await import('@/lib/s3-upload')
    const success = await deleteFromS3(key)

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