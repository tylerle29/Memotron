export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50 professional-shadow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-primary text-center text-8xl font-extrabold subtle-glow">MemoTron</h1>
          <p className="text-lg text-center font-mono text-muted-foreground font-semibold">
            Intelligent meme analysis for the modern era
          </p>
        </div>
      </div>
    </header>
  )
}
