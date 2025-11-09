"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { MemeRecord } from "@/lib/mock-analyzer"

export function MemesGallery() {
  // State to store fetched memes and loading status
  const [memes, setMemes] = useState<MemeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMemes()
  }, [])

  // Fetch all memes from the 'memes' table in Supabase
  const fetchMemes = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching memes from Supabase...")

      // Query the 'memes' table and select all columns
      // Order by created_at in descending order (newest first)
      const { data, error: fetchError } = await supabase
        .from("memes")
        .select("*")
        .order("created_at", { ascending: false })

      // Handle fetch errors
      if (fetchError) {
        console.error("[v0] Supabase fetch error:", fetchError)
        setError(fetchError.message)
        return
      }

      // Store fetched data in state
      console.log("[v0] Memes fetched successfully:", data)
      setMemes(data || [])
    } catch (err) {
      console.error("[v0] Error fetching memes:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch memes")
    } finally {
      setLoading(false)
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <Card className="p-6 border-border bg-card glass-effect professional-shadow">
        <p className="text-muted-foreground">Loading memes...</p>
      </Card>
    )
  }

  // Handle error state
  if (error) {
    return (
      <Card className="p-6 border-border bg-card glass-effect professional-shadow">
        <p className="text-red-500">Error loading memes: {error}</p>
      </Card>
    )
  }

  // Handle empty state
  if (memes.length === 0) {
    return (
      <Card className="p-6 border-border bg-card glass-effect professional-shadow">
        <p className="text-muted-foreground">No memes found yet. Upload one to get started!</p>
      </Card>
    )
  }

  // Render the list of memes
  return (
    <Card className="p-6 border-border bg-card glass-effect professional-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">📚 Meme History</h3>
      <div className="space-y-3">
        {memes.map((meme) => (
          <div
            key={meme.id}
            className="p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{meme.title}</h4>
                <p className="text-sm text-muted-foreground">{meme.template}</p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">{meme.confidence}%</Badge>
                <Badge variant="secondary" className="bg-accent/15 text-accent border-accent/30 text-xs">
                  {meme.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
