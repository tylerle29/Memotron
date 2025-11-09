"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { MemeAnalysis } from "./meme-analysis"
import { ResultsPage } from "./results-page"
import { PromptScreen } from "./prompt-screen"
import { Upload, Sparkles, Brain, Zap, Eye } from "lucide-react"
import { ProcessingModal } from "./processing-modal"
import { generateMockAnalysis } from "@/lib/mock-analyzer"
import type { AnalysisResult } from "@/lib/mock-analyzer"
import { uploadMemeImageToStorage, saveMemeAnalysisToDatabase } from "@/lib/storage-helper"

export function MemeUploader() {
  const [image, setImage] = useState<string | null>(null)
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
      setImage(imageData)
      setError(null)
      setShowPrompt(true)
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

      if (image) {
        try {
          console.log("[v0] Starting image upload and analysis save...")

          // Upload image to storage
          const imageUrl = await uploadMemeImageToStorage(image, `meme-${Date.now()}.png`)

          // Save analysis with image URL to database
          await saveMemeAnalysisToDatabase({
            title: mockAnalysis.template,
            template: mockAnalysis.template,
            caption: mockAnalysis.topText || mockAnalysis.caption,
            meaning: mockAnalysis.meaning,
            confidence: mockAnalysis.confidence,
            category: mockAnalysis.category,
            imageUrl: imageUrl,
            userPrompt: userPrompt || undefined,
            detectedPersons: mockAnalysis.detectedPersons,
          })

          console.log("[v0] Image and analysis saved successfully")
        } catch (storageError) {
          console.error("[v0] Storage/Database error:", storageError)
          // Don't throw - allow results to display even if save fails
          setError("Analysis complete but failed to save to database. Results still displayed locally.")
        }
      }

      setShowResults(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setImage(null)
    } finally {
      setLoading(false)
      setShowProcessing(false)
    }
  }

  const handleBackToUpload = () => {
    setShowResults(false)
    setImage(null)
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
          }}
        />
      )}

      <ProcessingModal
        isOpen={showProcessing}
        onClose={() => {
          setShowProcessing(false)
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!image ? (
          <div className="space-y-12">
            {/* Hero Section with Features Grid */}
            <section className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Analyze Any Meme in Seconds</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload a meme and our AI will instantly detect templates, extract captions, explain meanings, and
                analyze context with incredible accuracy.
              </p>
            </section>

            {/* Upload Area - Prominent Card */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="glass-light rounded-2xl p-12 text-center cursor-pointer transition-smooth hover:shadow-lg border-2 border-dashed border-primary/30 hover:border-primary/60"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center glow-shadow">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Drop your meme here</h3>
                  <p className="text-muted-foreground text-base">or click to browse from your device</p>
                </div>
                <Button className="mt-2 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 transition-smooth">
                  Choose Image
                </Button>
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

            {/* Feature Cards Grid */}
            <section className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "Template Detection",
                  description: "Automatically identify the meme template with AI precision",
                },
                {
                  icon: Eye,
                  title: "Caption Extraction",
                  description: "Extract and analyze text using advanced OCR technology",
                },
                {
                  icon: Zap,
                  title: "Meaning Analysis",
                  description: "Understand jokes, context, and cultural significance instantly",
                },
              ].map((feature, idx) => {
                const IconComponent = feature.icon
                return (
                  <div
                    key={idx}
                    className="glass-light rounded-xl p-6 border border-primary/10 transition-smooth hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>

            {/* Description - Enhanced Glass Card */}
            <div className="glass-light rounded-xl p-8 border border-primary/10">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">What our AI does:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Automatically detect the meme's template
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Extract captions using advanced OCR
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Explain the joke or cultural meaning
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Analyze context—even for obscure or brand new memes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Display */}
            <div className="flex flex-col gap-4">
              <div className="border border-border/60 rounded-xl overflow-hidden bg-white professional-shadow-lg">
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
                <div className="glass-light rounded-xl p-8 flex items-center justify-center min-h-[400px] border border-primary/10">
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
