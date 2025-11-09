"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import Image from "next/image"
import type { AnalysisResult } from "@/lib/mock-analyzer"
import { InteractivePersonFlowchart } from "./interactive-person-flowchart"
import { Chatbot } from "./chatbot"

interface ResultsPageProps {
  imageUrl: string
  analysis: AnalysisResult | null
  onBack: () => void
  userPrompt?: string | null
}

export function ResultsPage({ imageUrl, analysis, onBack, userPrompt }: ResultsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b border-border glass-effect">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-primary hover:text-accent hover:bg-primary/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>

            <h1 className="text-2xl font-bold text-foreground">Meme Analysis Results</h1>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" className="bg-primary hover:bg-accent text-foreground">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image + Chatbot */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="overflow-hidden border-border bg-card glass-effect professional-shadow">
              <div className="relative w-full aspect-square bg-secondary">
                <Image src={imageUrl || "/placeholder.svg"} alt="Uploaded meme" fill className="object-cover" />
              </div>
            </Card>
            <p className="text-center text-sm text-muted-foreground">Uploaded Image</p>

            {/* Chatbot */}
            <Chatbot />
          </div>


          {/* Right Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {userPrompt && (
              <Card className="p-6 border-border bg-card glass-effect professional-shadow border-l-4 border-l-primary">
                <div className="flex gap-4 items-start">
                  <div className="text-2xl flex-shrink-0">🎯</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">You asked:</h3>
                    <p className="text-foreground leading-relaxed italic break-words">"{userPrompt}"</p>
                  </div>
                </div>
              </Card>
            )}

            {userPrompt && <p className="text-center text-muted-foreground font-medium">Here's what we found:</p>}

            {/* Detection Card */}
            <Card className="p-6 border-border bg-card glass-effect professional-shadow">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <span className="text-primary">✓</span> Meme Detected
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Template:</span>
                  <Badge className="bg-primary/15 text-primary border-primary/30">
                    {analysis?.template || "Loading..."}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="text-foreground font-medium">{analysis?.confidence || 0}%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-muted-foreground">Origin:</span>
                  <span className="text-foreground font-medium">{analysis?.origin || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary" className="bg-accent/15 text-accent border-accent/30">
                    {analysis?.category || "Unknown"}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Extracted Text Card */}
            <Card className="p-6 border-border bg-card glass-effect professional-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">📝 Extracted Text</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <span className="text-primary font-medium">Top text:</span> {analysis?.topText || "N/A"}
                </p>
                <p>
                  <span className="text-primary font-medium">Bottom text:</span> {analysis?.bottomText || "N/A"}
                </p>
              </div>
            </Card>

            {/* AI Explanation Card */}
            <Card className="p-6 border-border bg-card glass-effect professional-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">🤖 AI Explanation</h3>
              <p className="text-muted-foreground leading-relaxed">{analysis?.meaning || "Loading..."}</p>
            </Card>

            <InteractivePersonFlowchart
              imageUrl={imageUrl || "/placeholder.svg"}
              detectedPersons={analysis?.detectedPersons}
            />

            {/* Meme DNA Card */}
            <Card className="p-6 border-border bg-card glass-effect professional-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">📊 Meme DNA</h3>
              <div className="space-y-3">
                {[
                  { label: "Relatable", value: analysis?.relatable || 0 },
                  { label: "Humorous", value: analysis?.humorous || 0 },
                  { label: "Sarcastic", value: analysis?.sarcastic || 0 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-primary font-medium">{item.value}%</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Similar Memes Section */}
            <Card className="p-6 border-border bg-card glass-effect professional-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">🎭 Similar Memes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-secondary/50 border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-center">[Similar Meme {i}]</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
