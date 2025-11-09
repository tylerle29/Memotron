"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, input])
    setInput("")
    // Add your API call for LLM responses here
    const handleConverse = async () => {
        const response = await fetch("https://nonfraudulently-photoemissive-syreeta.ngrok-free.dev/api/converse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: input })
        })
        const data = await response.json()
        setMessages((prev) => [...prev, data.output])
    }
    handleConverse()

  }

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 transition-all`}
      style={{ pointerEvents: "auto" }}
    >
      <Card
        className={`bg-card/95 backdrop-blur-md shadow-lg flex flex-col transition-all overflow-hidden ${
          open ? "w-80 h-96" : "w-32 h-12"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-border cursor-pointer" style = {{marginTop: -25}} onClick={() => setOpen(!open)}>
          <h3 className="text-sm font-semibold text-foreground">💬 Chatbot</h3>
          <Button size="sm" variant="ghost">
            {open ? "−" : "+"}
          </Button>
        </div>

        {/* Chat content */}
        {open && (
          <>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className="text-sm text-foreground bg-muted/20 p-2 rounded">
                  {msg}
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-border flex gap-2">
              <input
                className="flex-1 p-2 rounded border border-border bg-background text-foreground text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button size="sm" onClick={sendMessage}>
                Send
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
