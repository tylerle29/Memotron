"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { MemeAnalysis } from "./meme-analysis"
import { ResultsPage } from "./results-page"
import { PromptScreen } from "./prompt-screen"
import { Upload, Sparkles } from "lucide-react"
import { ProcessingModal } from "./processing-modal"
import { generateMockAnalysis } from "@/lib/mock-analyzer"
import type { AnalysisResult } from "@/lib/mock-analyzer"

export function MemeUploader() {
  const [image, setImage] = useState<string | null>(null)
  const [uploadData, setUploadData] = useState<{ path: string; url: string; uploadId: string } | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProcessing, setShowProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [userPrompt, setUserPrompt] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target?.result as string
      
      // Upload to Supabase Storage
      try {
        console.log('[Frontend] Starting upload...')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageData,
            filename: file.name,
            // Optional: add userId if you have authentication
            // userId: user?.id
          })
        })

        console.log('[Frontend] Upload response status:', uploadResponse.status)
        
        const uploadResult = await uploadResponse.json()
        console.log('[Frontend] Upload result:', uploadResult)

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.error || `Upload failed with status ${uploadResponse.status}`)
        }

        console.log('[Frontend] Uploaded to Supabase Storage:', uploadResult.path)
        console.log('[Frontend] Public URL:', uploadResult.url)
        
        // Store both local preview and upload data
        setImage(imageData) // For local preview
        setUploadData({
          path: uploadResult.path,
          url: uploadResult.url,
          uploadId: uploadResult.uploadId
        })
        
        setError(null)
        setShowPrompt(true)
      } catch (err) {
        console.error('[Frontend] Upload error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload image. Please try again.'
        setError(errorMessage)
        setImage(null)
        setUploadData(null)
      }
    }
    
    reader.onerror = () => {
      console.error('[Frontend] FileReader error')
      setError('Failed to read file. Please try again.')
    }
    
    reader.readAsDataURL(file)
  }

  const handlePromptSubmit = (prompt: string) => {
    setUserPrompt(prompt)
    setShowPrompt(false)
    setShowProcessing(true)
    analyzeMeme()
  }

  const analyzeMeme = async () => {
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockAnalysis = generateMockAnalysis()
      setAnalysis(mockAnalysis)
      setShowResults(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setImage(null)
      setUploadData(null)
    } finally {
      setLoading(false)
      setShowProcessing(false)
    }
  }

  const handleBackToUpload = () => {
    setShowResults(false)
    setImage(null)
    setUploadData(null)
    setAnalysis(null)
    setError(null)
    setUserPrompt(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-primary", "bg-primary/5")
    }
  }

  const handleDragLeave = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-primary", "bg-primary/5")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleDragLeave()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  if (showResults && image) {
    return <ResultsPage imageUrl={image} analysis={analysis} onBack={handleBackToUpload} userPrompt={userPrompt} />
  }

  return (
    <>
      {showPrompt && image && (
        <PromptScreen
          imageUrl={image}
          onAnalyze={handlePromptSubmit}
          onClose={() => {
            setShowPrompt(false)
            setImage(null)
            setUploadData(null)
          }}
        />
      )}

      <ProcessingModal
        isOpen={showProcessing}
        onClose={() => {
          setShowProcessing(false)
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!image ? (
          <div className="space-y-8">
            {/* Upload Area */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-primary/40 rounded-lg p-12 text-center cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5 bg-card professional-shadow-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  <Upload className="w-10 h-10 text-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Drop your meme here</h2>
                  <p className="text-muted-foreground text-lg">or click to browse from your device</p>
                </div>
                <Button className="mt-4 bg-primary hover:bg-accent text-foreground font-semibold">Choose Image</Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFile(e.target.files[0])
                  }
                }}
              />
            </div>

            {/* Description */}
            <div className="glass-effect rounded-lg p-8 space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">What our AI does:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✨ Automatically detect the meme's template</li>
                    <li>✨ Extract captions using advanced OCR</li>
                    <li>✨ Explain the joke or cultural meaning</li>
                    <li>✨ Analyze context—even for obscure or brand new memes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
                <p className="text-destructive font-medium">{error}</p>
                <p className="text-destructive/70 text-sm mt-2">
                  Check the browser console for more details.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Display */}
            <div className="flex flex-col gap-4">
              <div className="border border-border rounded-lg overflow-hidden bg-card professional-shadow-lg">
                <img src={image || "/placeholder.svg"} alt="Uploaded meme" className="w-full h-auto object-contain" />
              </div>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                Upload Different Meme
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFile(e.target.files[0])
                  }
                }}
              />
            </div>

            {/* Analysis Results */}
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="glass-effect rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                  <div className="flex flex-col items-center gap-4">
                    <Spinner className="w-8 h-8" />
                    <p className="text-muted-foreground">Analyzing your meme...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
                  <p className="text-destructive font-medium">{error}</p>
                </div>
              ) : analysis ? (
                <MemeAnalysis analysis={analysis} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  )
}