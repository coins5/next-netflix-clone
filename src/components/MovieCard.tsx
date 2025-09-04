"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Movie } from "@/lib/catalog";

type Props = {
  movie: Movie;
};

export default function MovieCard({ movie }: Props) {
  const [progress, setProgress] = useState<number>(0);

  // Read resume progress from localStorage saved by the player
  useEffect(() => {
    try {
      const key = `vp:pos:movie:${movie.id}`;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const data = JSON.parse(raw) as { t?: number; d?: number };
      if (data?.t && data?.d && data.d > 0) {
        const pct = Math.max(0, Math.min(100, (data.t / data.d) * 100));
        setProgress(pct);
      }
    } catch {
      // ignore
    }
  }, [movie.id]);

  return (
    <Link
      href={`/watch/${movie.id}`}
      className="group relative block w-[180px] flex-shrink-0"
      title={movie.title}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-[#222] ring-1 ring-white/10">
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

        {/* Top gradient + play glyph on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          ▶ Play
        </div>

        {/* Progress bar (if any) */}
        {progress > 0 ? (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div className="h-full bg-red-500" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </div>
      <div className="mt-2 line-clamp-1 text-sm text-white/90">{movie.title}</div>
    </Link>
  );
}
