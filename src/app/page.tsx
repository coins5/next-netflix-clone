import Row from "@/components/Row";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { getByCategory } from "@/lib/catalog";

export default function Home() {
  const byCategory = getByCategory();
  const categories = Object.keys(byCategory);

  // Pick a hero movie from the first category (if any)
  const heroMovie = categories.length ? byCategory[categories[0]][0] : undefined;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-6">
        {heroMovie ? <Hero movie={heroMovie} /> : null}
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
      <footer className="mx-auto mt-10 max-w-6xl px-6 pb-10 text-center text-xs text-white/50">
        Demo educativa — Videos locales y URLs externas soportadas.
      </footer>
    </div>
  );
}
