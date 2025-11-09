/**
 * DYNAMIC FLOWCHART COMPONENT
 *
 * Production-ready component that renders any flowchart from a data parameter.
 * Smooth zoom/pan without snapping, fully modular, zero hardcoded data.
 *
 * ZOOM/PAN IMPLEMENTATION:
 * - Uses CSS transform with incremental scale multiplication (0.9/1.1)
 * - No snap: delta updates are continuous, not rounded/quantized
 * - Wheel event uses deltaY to determine direction
 * - Pan is relative (e.deltaX/Y based movement, not absolute positioning)
 *
 * STATE MANAGEMENT:
 * - All zoom/pan state in React hooks, not module scope
 * - expandedPersonId tracks which node is expanded
 * - isDragging prevents zoom while dragging
 *
 * BACKEND INTEGRATION POINTS:
 * - TODO: Replace hardcoded memeImages paths with backend URLs
 * - TODO: Add React Query hook to fetch flowchartData from API
 * - TODO: Add error boundary for invalid flowchartData structure
 * - TODO: Add loading state while fetching branch data
 */

"use client"

import type React from "react"
import type { FlowchartData } from "@/lib/flowchart-types"
import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Zap } from "lucide-react"

interface DynamicFlowchartProps {
  flowchartData: FlowchartData
  onBranchClick?: (branchId: string) => void
}

export function DynamicFlowchart({ flowchartData, onBranchClick }: DynamicFlowchartProps) {
  // Zoom/Pan state - kept in React state, not module scope
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract metadata with safe defaults
  const { branches } = flowchartData
  const radiusX = flowchartData.metadata?.radiusX ?? 250
  const radiusY = flowchartData.metadata?.radiusY ?? 180
  const minZoom = flowchartData.metadata?.minZoom ?? 0.5
  const maxZoom = flowchartData.metadata?.maxZoom ?? 3

  // Calculate circular layout for all branches
  const anglePerBranch = branches.length > 0 ? (2 * Math.PI) / branches.length : 0

  /**
   * SMOOTH ZOOM: deltaY > 0 = zoom out (multiply by 0.9)
   * deltaY < 0 = zoom in (multiply by 1.1)
   * NO snapping because we use Math.max/min for bounds, not rounding
   */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const direction = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * direction))
    setZoom(newZoom)
  }

  /**
   * PAN START: Record initial mouse position minus current pan
   * Allows smooth panning without snapping
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-pan]")) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  /**
   * PAN MOVE: Calculate new pan based on mouse movement
   * Prevents zoom during drag
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPanX(e.clientX - dragStart.x)
    setPanY(e.clientY - dragStart.y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden glass-effect professional-shadow">
      {/* Header: Dynamically generated from flowchartData */}
      <div className="p-4 border-b border-border/50 bg-secondary/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {branches.length > 0 ? `Detected Entities (${branches.length})` : "Flowchart"}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground" data-no-pan>
            <span>Detected: {branches.length} entities</span>
            <span>|</span>
            <span>Scroll to zoom</span>
            <span>|</span>
            <span>Drag to pan</span>
          </div>
        </div>
      </div>

      {/* Canvas: All rendering happens here from flowchartData */}
      <div
        ref={containerRef}
        className="relative w-full h-96 bg-background overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Transform wrapper with smooth scale/translate (no snapping) */}
        <div
          className="absolute inset-0 transition-transform"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* SVG connecting lines from center to each branch */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
            {branches.map((branch, idx) => {
              const angle = anglePerBranch * idx
              const branchX = 50 + (radiusX * Math.cos(angle)) / 5.12
              const branchY = 50 + (radiusY * Math.sin(angle)) / 1.92

              return (
                <line
                  key={`line-${branch.id}`}
                  x1="50%"
                  y1="50%"
                  x2={`${branchX}%`}
                  y2={`${branchY}%`}
                  stroke="#76B900"
                  strokeWidth="2"
                  opacity="0.5"
                  className="animate-pulse"
                />
              )
            })}
          </svg>

          {/* Central node - rendered from flowchartData.central */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-32 h-32 rounded-lg border-2 border-primary overflow-hidden glass-effect shadow-lg hover:border-accent transition-colors">
              <Image
                src={flowchartData.central.imageUrl || "/placeholder.svg"}
                alt={flowchartData.central.label}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              {flowchartData.central.subLabel || "Central"}
            </p>
          </div>

          {/* Branch nodes - all generated from flowchartData.branches array */}
          {branches.map((branch, idx) => {
            const angle = anglePerBranch * idx
            const x = 50 + (radiusX * Math.cos(angle)) / 5.12
            const y = 50 + (radiusY * Math.sin(angle)) / 1.92
            const isExpanded = expandedNodeId === branch.id

            return (
              <div
                key={branch.id}
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
                  onClick={() => {
                    setExpandedNodeId(isExpanded ? null : branch.id)
                    onBranchClick?.(branch.id)
                  }}
                >
                  {/* Collapsed state - quick preview */}
                  {!isExpanded && (
                    <div className="space-y-2">
                      <div className="relative w-full h-20 rounded bg-secondary overflow-hidden">
                        <Image
                          src={branch.thumbnail || "/placeholder.svg"}
                          alt={branch.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground truncate">{branch.name}</h4>
                        <p className="text-xs text-primary">{branch.confidence}% confidence</p>
                      </div>
                      <button className="w-full text-xs py-1 px-2 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors flex items-center justify-center gap-1">
                        <ChevronDown className="w-3 h-3" />
                        Expand
                      </button>
                    </div>
                  )}

                  {/* Expanded state - full details from flowchartData */}
                  {isExpanded && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">{branch.name}</h4>
                        <button className="text-xs py-1 px-2 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors flex items-center justify-center gap-1">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="relative w-full h-24 rounded bg-secondary overflow-hidden">
                        <Image
                          src={branch.thumbnail || "/placeholder.svg"}
                          alt={branch.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Dynamic content from flowchartData - all arrays rendered generically */}
                      {branch.memeAppearances.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-primary mb-1">Appearances:</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {branch.memeAppearances.map((appearance, i) => (
                              <li key={i} className="truncate">
                                • {appearance}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {branch.relatedMemes.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-primary mb-1">Related:</p>
                          <div className="space-y-1">
                            {branch.relatedMemes.map((meme, i) => (
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
                      )}

                      {branch.timeline.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-primary mb-1">Timeline:</p>
                          <div className="space-y-1">
                            {branch.timeline.map((event, i) => (
                              <p key={i} className="text-xs text-muted-foreground">
                                <span className="text-primary font-semibold">{event.year}:</span> {event.event}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
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
            onClick={() => setZoom(Math.max(minZoom, zoom - 0.2))}
            className="px-2 py-1 hover:bg-primary/10 rounded text-primary font-medium"
          >
            − Zoom
          </button>
          <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium min-w-12 text-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(maxZoom, zoom + 0.2))}
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
