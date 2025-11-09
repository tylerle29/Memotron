import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Brain, Laugh, Globe } from "lucide-react"

interface MemeAnalysisProps {
  analysis: {
    template: string
    caption: string
    meaning: string
    humor: string
    context: string
  }
}

export function MemeAnalysis({ analysis }: MemeAnalysisProps) {
  return (
    <div className="space-y-4">
      {/* Template Card */}
      <Card className="p-6 border-border bg-card glass-effect professional-shadow">
        <div className="flex items-start gap-3 mb-3">
          <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Meme Template</h3>
            <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/30">
              {analysis.template}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Caption Card */}
      <Card className="p-6 border-border bg-card glass-effect professional-shadow">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Extracted Text</h3>
            <p className="text-muted-foreground italic">"{analysis.caption}"</p>
          </div>
        </div>
      </Card>

      {/* Meaning Card */}
      <Card className="p-6 border-border bg-card glass-effect professional-shadow">
        <div className="flex items-start gap-3 mb-3">
          <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">What It Means</h3>
            <p className="text-muted-foreground leading-relaxed">{analysis.meaning}</p>
          </div>
        </div>
      </Card>

      {/* Humor Card */}
      <Card className="p-6 border-border bg-card glass-effect professional-shadow">
        <div className="flex items-start gap-3 mb-3">
          <Laugh className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">The Humor</h3>
            <p className="text-muted-foreground leading-relaxed">{analysis.humor}</p>
          </div>
        </div>
      </Card>

      {/* Context Card */}
      <Card className="p-6 border-border bg-card glass-effect professional-shadow">
        <div className="flex items-start gap-3 mb-3">
          <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Cultural Context</h3>
            <p className="text-muted-foreground leading-relaxed">{analysis.context}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
