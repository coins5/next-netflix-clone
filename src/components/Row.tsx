import type { Movie } from "@/lib/catalog";
import MovieCard from "./MovieCard";

type Props = {
  title: string;
  items: Movie[];
};

export default function Row({ title, items }: Props) {
  if (!items?.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {items.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </section>
  );
}

