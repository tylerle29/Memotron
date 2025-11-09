export function Header() {
  return (
    <header className="border-b border-border/40 bg-white/60 backdrop-blur-lg sticky top-0 z-50 professional-shadow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-primary text-center text-5xl md:text-6xl font-bold subtle-glow tracking-tight">
            MemoTron
          </h1>
          <p className="text-base text-center text-muted-foreground font-medium">
            Intelligent meme analysis powered by AI
          </p>
        </div>
      </div>
    </header>
  )
}
