// lib/s3-upload.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export interface UploadResult {
  success: boolean
  key?: string
  url?: string
  error?: string
}

/**
 * Upload a file to S3
 * @param file - File buffer or base64 string
 * @param filename - Original filename
 * @param userId - Optional user ID for organizing files
 */
export async function uploadToS3(
  file: Buffer | string,
  filename: string,
  userId?: string
): Promise<UploadResult> {
  try {
    // Generate unique key with timestamp
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = userId 
      ? `uploads/${userId}/${timestamp}-${sanitizedFilename}`
      : `uploads/${timestamp}-${sanitizedFilename}`

    // Convert base64 to buffer if needed
    let fileBuffer: Buffer
    if (typeof file === 'string') {
      // Remove data:image/xxx;base64, prefix if present
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
    } else {
      fileBuffer = file
    }

    // Determine content type from filename
    const contentType = getContentType(filename)

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Optional: Add metadata
      Metadata: {
        uploadedAt: new Date().toISOString(),
        originalName: filename,
      },
    })

    await s3Client.send(command)

    // Generate a signed URL valid for 1 hour
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 3600 } // 1 hour
    )

    return {
      success: true,
      key,
      url,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('S3 delete error:', error)
    return false
  }
}

/**
 * Get a signed URL for an existing S3 object
 */
export async function getSignedS3Url(key: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
      { expiresIn }
    )
    return url
  } catch (error) {
    console.error('S3 signed URL error:', error)
    return null
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
  return contentTypes[ext || ''] || 'application/octet-stream'
}

/**
 * Convert base64 image to buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

/**
 * Validate file size (max 10MB for memes)
 */
export function validateFileSize(buffer: Buffer, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return buffer.length <= maxSizeBytes
}