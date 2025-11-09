"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface FlowchartProps {
  imageUrl: string
  template: string
  origin: string
  category: string
}

export function MemeFlowchart({ imageUrl, template, origin, category }: FlowchartProps) {
  const [animationState, setAnimationState] = useState("loading")

  useEffect(() => {
    setAnimationState("animate")
  }, [])

  // Mock data for similar memes
  const similarMemes = [
    { id: 1, name: "Drake Yes/No", match: "92%" },
    { id: 2, name: "Distracted Boyfriend", match: "88%" },
    { id: 3, name: "Success Kid", match: "85%" },
    { id: 4, name: "This is Fine", match: "80%" },
  ]

  // Mock data for detected subjects
  const detectedSubjects = [
    { id: 1, name: "Person A", type: "Human" },
    { id: 2, name: "Object B", type: "Item" },
  ]

  // Mock data for evolution timeline
  const evolutionTimeline = [
    { year: 2017, title: "Original Template", description: "First appearance online" },
    { year: 2019, title: "Popular Variation", description: "Peak meme usage" },
    { year: 2024, title: "Current Version", description: "Your uploaded meme" },
  ]

  return (
    <div className="space-y-8">
      {/* Main Flowchart Container */}
      <div className="relative bg-card border border-border rounded-lg p-8 glass-effect overflow-x-auto">
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
          {/* Right Branch Line - Similar Memes */}
          <line
            x1="50%"
            y1="15%"
            x2="85%"
            y2="15%"
            stroke="#76b900"
            strokeWidth="2"
            className={`${animationState === "animate" ? "animate-draw-line" : ""}`}
            style={{
              animation:
                animationState === "animate"
                  ? "drawLine 0.8s ease-out forwards 0.2s, float 2s ease-in-out infinite 1s"
                  : "none",
            }}
          />

          {/* Left Branch Line - Subjects */}
          <line
            x1="15%"
            y1="50%"
            x2="50%"
            y2="50%"
            stroke="#76b900"
            strokeWidth="2"
            className={`${animationState === "animate" ? "animate-draw-line" : ""}`}
            style={{
              animation:
                animationState === "animate"
                  ? "drawLine 0.8s ease-out forwards 0.4s, float 2s ease-in-out infinite 1.2s"
                  : "none",
            }}
          />

          {/* Down Branch Line - Evolution */}
          <line
            x1="50%"
            y1="15%"
            x2="50%"
            y2="85%"
            stroke="#76b900"
            strokeWidth="2"
            className={`${animationState === "animate" ? "animate-draw-line" : ""}`}
            style={{
              animation:
                animationState === "animate"
                  ? "drawLine 0.8s ease-out forwards 0.6s, float 2s ease-in-out infinite 1.4s"
                  : "none",
            }}
          />
        </svg>

        {/* Content Grid */}
        <div className="relative grid grid-cols-12 gap-4 h-96">
          {/* CENTER NODE - Your Meme */}
          <div className="col-span-12 md:col-span-4 flex items-center justify-center h-full">
            <div
              className={`w-48 h-48 border-4 border-primary rounded-lg overflow-hidden glass-effect cursor-pointer hover:scale-105 transition-transform ${
                animationState === "animate" ? "animate-fade-in" : "opacity-0"
              }`}
              style={{
                animation: animationState === "animate" ? "fadeIn 0.6s ease-out forwards" : "none",
              }}
            >
              <Image src={imageUrl || "/placeholder.svg"} alt="Your meme" fill className="object-cover" />
            </div>
          </div>

          {/* RIGHT BRANCH - Similar Memes */}
          <div className="col-span-12 md:col-span-4 space-y-4 flex flex-col justify-center">
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Similar Templates</div>
            {similarMemes.slice(0, 2).map((meme, idx) => (
              <div
                key={meme.id}
                className={`p-3 border border-primary/50 rounded bg-secondary/50 hover:bg-secondary hover:border-primary/80 hover:scale-105 transition-all cursor-pointer ${
                  animationState === "animate" ? "animate-fade-in" : "opacity-0"
                }`}
                style={{
                  animation:
                    animationState === "animate" ? `fadeIn 0.6s ease-out forwards ${0.8 + idx * 0.15}s` : "none",
                }}
              >
                <p className="text-sm font-medium text-foreground">{meme.name}</p>
                <p className="text-xs text-primary">{meme.match} match</p>
              </div>
            ))}
          </div>

          {/* LEFT BRANCH - Detected Subjects */}
          <div className="col-span-12 md:col-span-4 space-y-4 flex flex-col justify-center order-first md:order-none">
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Detected Subjects</div>
            {detectedSubjects.map((subject, idx) => (
              <div
                key={subject.id}
                className={`p-3 border border-primary/50 rounded bg-secondary/50 hover:bg-secondary hover:border-primary/80 hover:scale-105 transition-all cursor-pointer ${
                  animationState === "animate" ? "animate-fade-in" : "opacity-0"
                }`}
                style={{
                  animation:
                    animationState === "animate" ? `fadeIn 0.6s ease-out forwards ${1.0 + idx * 0.15}s` : "none",
                }}
              >
                <p className="text-sm font-medium text-foreground">{subject.name}</p>
                <p className="text-xs text-muted-foreground">{subject.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evolution Timeline */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-6">Meme Evolution</div>
          <div className="space-y-4">
            {evolutionTimeline.map((item, idx) => (
              <div
                key={item.year}
                className={`flex gap-4 items-start p-4 border-l-2 border-primary/50 pl-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all ${
                  animationState === "animate" ? "animate-fade-in" : "opacity-0"
                }`}
                style={{
                  animation:
                    animationState === "animate" ? `fadeIn 0.6s ease-out forwards ${1.2 + idx * 0.15}s` : "none",
                }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/50 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{item.year}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes drawLine {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-draw-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
