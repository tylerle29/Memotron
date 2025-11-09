import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })

export const metadata: Metadata = {
  title: "MemeOTron - Intelligent Meme Analysis",
  description: "AI-powered meme analysis and detection",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
