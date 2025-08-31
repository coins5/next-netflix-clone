import Row from "@/components/Row";
import { getByCategory } from "@/lib/catalog";

export default function Home() {
  const byCategory = getByCategory();
  const categories = Object.keys(byCategory);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Netflix Clone</h1>
        <nav className="text-sm text-white/70">Demo</nav>
      </header>
      <main>
        {categories.length === 0 ? (
          <p className="text-white/70">
            No hay contenido aún. Sube tus videos a <code>/public/videos</code> y
            edita <code>src/data/movies.json</code> para agregarlos.
          </p>
        ) : (
          categories.map((c) => (
            <Row key={c} title={c} items={byCategory[c]} />
          ))
        )}
      </main>
      <footer className="mt-10 text-center text-xs text-white/50">
        Demo educativa — Videos locales y URLs externas soportadas.
      </footer>
    </div>
  );
}
