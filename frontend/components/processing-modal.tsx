"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface ProcessingModalProps {
  isOpen: boolean
  onClose: () => void
}

type StepStatus = "completed" | "current" | "pending"

interface Step {
  name: string
  status: StepStatus
}

export function ProcessingModal({ isOpen, onClose }: ProcessingModalProps) {
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<Step[]>([
    { name: "Image uploaded", status: "completed" },
    { name: "Extracting text with OCR", status: "current" },
    { name: "Pattern matching templates", status: "pending" },
    { name: "AI reasoning (Nemotron)", status: "pending" },
    { name: "Generating explanation", status: "pending" },
  ])
  const [timeRemaining, setTimeRemaining] = useState(2)

  useEffect(() => {
    if (!isOpen) return

    const progressIntervals = [
      { start: 0, end: 10, duration: 1000, stepIndex: 0 },
      { start: 10, end: 30, duration: 1000, stepIndex: 1 },
      { start: 30, end: 60, duration: 1500, stepIndex: 2 },
      { start: 60, end: 85, duration: 1000, stepIndex: 3 },
      { start: 85, end: 100, duration: 500, stepIndex: 4 },
    ]

    const currentInterval = 0
    const startTime = Date.now()
    const totalDuration = 5000

    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const ratio = elapsed / totalDuration

      if (ratio >= 1) {
        setProgress(100)
        setTimeout(() => {
          onClose()
        }, 500)
        return
      }

      for (let i = 0; i < progressIntervals.length; i++) {
        const interval = progressIntervals[i]
        const intervalStart = interval.start / 100
        const intervalEnd = interval.end / 100

        if (ratio >= intervalStart && ratio < intervalEnd) {
          const intervalRatio = (ratio - intervalStart) / (intervalEnd - intervalStart)
          const currentProgress = interval.start + (interval.end - interval.start) * intervalRatio

          setProgress(Math.round(currentProgress))

          // Update steps
          setSteps((prev) =>
            prev.map((step, idx) => {
              if (idx < interval.stepIndex) return { ...step, status: "completed" as const }
              if (idx === interval.stepIndex) return { ...step, status: "current" as const }
              return { ...step, status: "pending" as const }
            }),
          )

          const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000))
          setTimeRemaining(remaining)
          break
        }
      }

      requestAnimationFrame(animateProgress)
    }

    animateProgress()
  }, [isOpen, onClose])

  if (!isOpen) return null

  const currentStep = steps.find((s) => s.status === "current")
  const stepName = currentStep?.name || "Processing"

  const circumference = 2 * Math.PI * 72 // radius is 72px for 160px diameter
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background/80 backdrop-blur-xl border border-border rounded-lg w-[90%] max-w-[400px] p-8 shadow-2xl shadow-black/40 relative">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <h2 className="text-2xl font-semibold text-foreground text-center mb-8">Analyzing Your Meme</h2>

        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
              {/* Background ring */}
              <circle cx="80" cy="80" r="72" fill="none" stroke="#333333" strokeWidth="8" />
              <circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke="#76B900"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-primary">{progress}%</span>
              <span className="text-sm text-muted-foreground mt-2">{stepName}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              {step.status === "completed" && (
                /* Checkmark now uses NVIDIA green */
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-foreground text-sm font-bold">✓</span>
                </div>
              )}
              {step.status === "current" && (
                /* Current step indicator uses NVIDIA green border */
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0 animate-spin">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                </div>
              )}
              {step.status === "pending" && (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  step.status === "completed"
                    ? "text-muted-foreground"
                    : step.status === "current"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                }`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">~{timeRemaining} seconds remaining</p>
      </div>
    </div>
  )
}
