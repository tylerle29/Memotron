import { MemeUploader } from "@/components/meme-uploader"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-50">
      <Header />
      <MemeUploader />
    </main>
  )
}
