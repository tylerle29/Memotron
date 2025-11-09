import { MemeUploader } from "@/components/meme-uploader"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <Header />
      <MemeUploader />
    </main>
  )
}
