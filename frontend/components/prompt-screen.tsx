"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PromptScreenProps {
  imageUrl: string
  onAnalyze: (prompt: string) => void
  onClose: () => void
}

const QUICK_SUGGESTIONS = [
  "Explain the humor",
  "Find the origin",
  "Detect the template",
  "Cultural context",
  "Find similar memes",
  "Analyze sentiment",
]

export function PromptScreen({ imageUrl, onAnalyze, onClose }: PromptScreenProps) {
  const [prompt, setPrompt] = useState("is this the input text")
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
  }

  const handleAnalyze = async () => {
    if (!prompt.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch("https://nonrealistic-ungrimed-luvenia.ngrok-free.dev/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: prompt })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("AI Output:", data.output)
      
      // Pass the AI response to the parent component
      onAnalyze(data.output || prompt)
    } catch (error) {
      console.error("Error calling AI API:", error)
      // Fallback to just using the prompt
      onAnalyze(prompt)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    onAnalyze(
      "Provide a comprehensive analysis of this meme including the template, extracted text, humor explanation, and cultural context.",
    )
    handleAnalyze()
  }


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[90%] max-w-[600px] p-8 shadow-2xl shadow-black/40 relative glass-effect">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Image Preview Section */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0">
            <img src={imageUrl || "/placeholder.svg"} alt="Uploaded meme" className="w-full h-full object-cover" />
          </div>
          <p className="text-sm text-muted-foreground">Uploaded Image</p>
        </div>

        {/* Main Heading */}
        <h2 className="text-2xl font-semibold text-foreground text-center mb-8">What would you like to analyze?</h2>

        {/* Text Input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell the AI what to focus on... (e.g., 'Explain the humor and cultural context' or 'Identify the meme template and find similar ones')"
          className="w-full h-32 bg-secondary border border-border text-foreground placeholder-muted-foreground rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          disabled={isLoading}
        />

        {/* Quick Suggestions */}
        <div className="mt-6">
          <label className="text-sm text-muted-foreground mb-3 block">Quick suggestions:</label>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleQuickSuggestion(suggestion)}
                disabled={isLoading}
                className="px-4 py-2 bg-secondary border border-border text-muted-foreground rounded-full text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-8">
          <Button
            onClick={handleAnalyze}
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analyzing..." : "Analyze with AI →"}
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            disabled={isLoading}
            className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip and analyze everything
          </Button>
        </div>
      </div>
    </div>
  )
}