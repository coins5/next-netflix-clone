import Link from "next/link";
import type { Movie } from "@/lib/catalog";

type Props = {
  movie: Movie;
};

export default function MovieCard({ movie }: Props) {
  return (
    <Link
      href={`/watch/${movie.id}`}
      className="group relative block w-[180px] flex-shrink-0"
      title={movie.title}
    >
      <div className="aspect-[16/9] w-full overflow-hidden rounded-md bg-[#222] ring-1 ring-white/10">
        {movie.poster ? (
          // Use <img> to avoid remote domain config for now
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
            {movie.title}
          </div>
        )}
      </div>
      <div className="mt-2 line-clamp-1 text-sm text-white/90">{movie.title}</div>
    </Link>
  );
}

