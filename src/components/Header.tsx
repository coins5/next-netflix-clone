export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-b from-black/70 to-transparent px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="text-xl font-bold tracking-wide">
          <span className="text-red-500">N</span>etflix Clone
        </div>
        <nav className="hidden gap-6 text-sm text-white/80 sm:flex">
          <span className="hover:text-white">Home</span>
          <span className="hover:text-white">Series</span>
          <span className="hover:text-white">Movies</span>
        </nav>
      </div>
    </header>
  );
}

