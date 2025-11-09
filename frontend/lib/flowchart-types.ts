/**
 * FLOWCHART DATA SCHEMA
 *
 * This file defines the complete structure for dynamic flowchart rendering.
 * Backends should generate data matching these interfaces.
 *
 * KEY PRINCIPLES:
 * - No hardcoded data or mock objects in component
 * - All nodes and connections defined by flowchartData prop
 * - Smooth zoom/pan with no snapping behavior
 * - All state managed via React hooks, not module scope
 */

/** Central node representing the meme */
export interface CentralNode {
  id: string
  label: string
  imageUrl: string
  subLabel?: string
}

/** Data for each person/entity branch node */
export interface BranchNode {
  id: string
  name: string
  confidence: number
  thumbnail: string
  memeAppearances: string[]
  relatedMemes: { title: string; link: string }[]
  timeline: { year: number; event: string }[]
}

/** Complete flowchart data structure */
export interface FlowchartData {
  central: CentralNode
  branches: BranchNode[]
  /** Optional metadata for custom layouts or behaviors */
  metadata?: {
    radiusX?: number
    radiusY?: number
    maxZoom?: number
    minZoom?: number
  }
}

/**
 * PARSER HELPER (For backend integration)
 *
 * When backend provides structured text, parse it like this:
 *
 * Example input:
 * ```
 * CENTRAL: Drake Meme | /drake.jpg | Original Upload
 * BRANCH: Drake | 98% | /drake-thumb.jpg | Hotline Bling,Confused | Link1,Link2 | 2015:First appearance,2016:Popular
 * BRANCH: Woman | 92% | /woman-thumb.jpg | Real Housewives,Yelling | Link3,Link4 | 2018:Origin,2019:Viral
 * ```
 *
 * Parser function to convert this to FlowchartData:
 */
export function parseFlowchartText(textInput: string): FlowchartData | null {
  const lines = textInput.trim().split("\n")
  let centralNode: CentralNode | null = null
  const branches: BranchNode[] = []

  for (const line of lines) {
    if (line.startsWith("CENTRAL:")) {
      const parts = line
        .replace("CENTRAL:", "")
        .split("|")
        .map((p) => p.trim())
      if (parts.length >= 2) {
        centralNode = {
          id: "central",
          label: parts[0],
          imageUrl: parts[1],
          subLabel: parts[2],
        }
      }
    } else if (line.startsWith("BRANCH:")) {
      const parts = line
        .replace("BRANCH:", "")
        .split("|")
        .map((p) => p.trim())
      if (parts.length >= 4) {
        const appearances = parts[3]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        const relatedStrings =
          parts[4]
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || []
        const timelineStrings =
          parts[5]
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || []

        branches.push({
          id: `branch-${branches.length}`,
          name: parts[0],
          confidence: Number.parseInt(parts[1]) || 0,
          thumbnail: parts[2],
          memeAppearances: appearances,
          relatedMemes: relatedStrings.map((r) => ({ title: r, link: "#" })),
          timeline: timelineStrings.map((t) => {
            const [year, event] = t.split(":")
            return { year: Number.parseInt(year) || 0, event: event || "" }
          }),
        })
      }
    }
  }

  return centralNode ? { central: centralNode, branches, metadata: {} } : null
}
