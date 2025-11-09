"use client"

import type React from "react"
import type { Person } from "@/lib/mock-analyzer"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Zap } from "lucide-react"

interface InteractivePersonFlowchartProps {
  imageUrl: string
  detectedPersons?: Person[]
}

export function InteractivePersonFlowchart({ imageUrl, detectedPersons = [] }: InteractivePersonFlowchartProps) {
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.5, Math.min(3, zoom * delta))
    setZoom(newZoom)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-pan]")) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPanX(e.clientX - dragStart.x)
    setPanY(e.clientY - dragStart.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    handleFlowCreate()
  }

  const handleFlowCreate = async () => {
      const response = await fetch("https://nonfraudulently-photoemissive-syreeta.ngrok-free.dev/api/flowreate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: "" })
      })
      const data = await response.json()
      console.log(data.output)
  }

  // Calculate positions for person nodes in a circle around the center
  const anglePerPerson = (2 * Math.PI) / detectedPersons.length
  const radiusX = 250
  const radiusY = 180

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden glass-effect professional-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-secondary/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Detected Persons in Meme
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground" data-no-pan>
            <span>Detected: {detectedPersons.length} persons</span>
            <span>|</span>
            <span>Scroll to zoom</span>
            <span>|</span>
            <span>Drag to pan</span>
          </div>
        </div>
      </div>

      {/* Flowchart Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-96 bg-background overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 transition-transform"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
            {detectedPersons.map((person, idx) => {
              const angle = anglePerPerson * idx
              const personX = 50 + (radiusX * Math.cos(angle)) / 5.12
              const personY = 50 + (radiusY * Math.sin(angle)) / 1.92

              return (
                <line
                  key={`line-${person.id}`}
                  x1="50%"
                  y1="50%"
                  x2={`${personX}%`}
                  y2={`${personY}%`}
                  stroke="#76B900"
                  strokeWidth="2"
                  opacity="0.5"
                  className="animate-pulse"
                />
              )
            })}
          </svg>

          {/* Central Meme Image Node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-32 h-32 rounded-lg border-2 border-primary overflow-hidden glass-effect shadow-lg hover:border-accent transition-colors">
              <Image src={imageUrl || "/placeholder.svg"} alt="Uploaded meme" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">Original Meme</p>
          </div>

          {/* Person Nodes in Circle */}
          {detectedPersons.map((person, idx) => {
            const angle = anglePerPerson * idx
            const x = 50 + (radiusX * Math.cos(angle)) / 5.12
            const y = 50 + (radiusY * Math.sin(angle)) / 1.92
            const isExpanded = expandedPersonId === person.id

            return (
              <div
                key={person.id}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  data-no-pan
                  className="bg-card border-2 border-primary/50 rounded-lg p-3 w-40 cursor-pointer hover:border-primary transition-colors glass-effect shadow-lg group"
                  onClick={() => setExpandedPersonId(isExpanded ? null : person.id)}
                >
                  {/* Collapsed View */}
                  {!isExpanded && (
                    <div className="space-y-2">
                      <div className="relative w-full h-20 rounded bg-secondary overflow-hidden">
                        <Image
                          src={person.thumbnail || "/placeholder.svg"}
                          alt={person.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground truncate">{person.name}</h4>
                        <p className="text-xs text-primary">{person.confidence}% confidence</p>
                      </div>
                      <button className="w-full text-xs py-1 px-2 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors flex items-center justify-center gap-1">
                        <ChevronDown className="w-3 h-3" />
                        Expand
                      </button>
                    </div>
                  )}

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">{person.name}</h4>
                        <button className="text-xs py-1 px-2 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors flex items-center justify-center gap-1">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Thumbnail */}
                      <div className="relative w-full h-24 rounded bg-secondary overflow-hidden">
                        <Image
                          src={person.thumbnail || "/placeholder.svg"}
                          alt={person.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Meme Appearances */}
                      <div>
                        <p className="text-xs font-semibold text-primary mb-1">Meme Appearances:</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {person.memeAppearances.map((appearance, i) => (
                            <li key={i} className="truncate">
                              • {appearance}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Related Memes */}
                      <div>
                        <p className="text-xs font-semibold text-primary mb-1">Related Memes:</p>
                        <div className="space-y-1">
                          {person.relatedMemes.map((meme, i) => (
                            <a
                              key={i}
                              href={meme.link}
                              className="text-xs text-accent hover:underline block truncate"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {meme.title}
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <p className="text-xs font-semibold text-primary mb-1">Timeline:</p>
                        <div className="space-y-1">
                          {person.timeline.map((event, i) => (
                            <p key={i} className="text-xs text-muted-foreground">
                              <span className="text-primary font-semibold">{event.year}:</span> {event.event}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls Footer */}
      <div
        className="p-3 border-t border-border/50 bg-secondary/30 flex items-center justify-between text-xs text-muted-foreground"
        data-no-pan
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            className="px-2 py-1 hover:bg-primary/10 rounded text-primary font-medium"
          >
            − Zoom
          </button>
          <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium min-w-12 text-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.2))}
            className="px-2 py-1 hover:bg-primary/10 rounded text-primary font-medium"
          >
            + Zoom
          </button>
        </div>
        <button
          onClick={() => {
            setZoom(1)
            setPanX(0)
            setPanY(0)
          }}
          className="px-3 py-1 hover:bg-primary/10 rounded text-primary font-medium"
        >
          Reset View
        </button>
      </div>
    </div>
  )
}
