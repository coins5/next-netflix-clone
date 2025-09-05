import Link from "next/link";
import type { Movie } from "@/lib/catalog";

type Props = {
  movie: Movie;
};

export default function Hero({ movie }: Props) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg">
      {/* Background image */}
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-[50vh] w-full object-cover sm:h-[60vh]"
        />
      ) : (
        <div className="h-[50vh] w-full bg-[#151515] sm:h-[60vh]" />
      )}

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto mb-8 w-full max-w-6xl px-6">
          <h1 className="mb-3 text-3xl font-bold sm:text-5xl">{movie.title}</h1>
          {movie.description ? (
            <p className="mb-4 max-w-2xl text-sm text-white/80 sm:text-base line-clamp-3">
              {movie.description}
            </p>
          ) : null}
          <div className="flex gap-3">
            <Link
              href={`/watch/${movie.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 font-medium text-black hover:bg-white/90"
            >
              ▶ Play
            </Link>
            <Link
              href={`/watch/${movie.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20"
            >
              ⓘ More info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

