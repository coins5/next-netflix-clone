"use client";

import { useRef } from "react";
import type { Movie } from "@/lib/catalog";
import MovieCard from "./MovieCard";

type Props = {
  title: string;
  items: Movie[];
};

export default function Row({ title, items }: Props) {
  const scroller = useRef<HTMLDivElement | null>(null);
  if (!items?.length) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: "smooth" });
  };

  return (
    <section className="group/row relative mb-8">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div
        ref={scroller}
        className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        {items.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>

      {/* Left/Right shadow + arrows */}
      <div className="pointer-events-none absolute inset-y-10 left-0 w-16 bg-gradient-to-r from-black to-transparent opacity-0 transition-opacity duration-200 group-hover/row:opacity-100" />
      <div className="pointer-events-none absolute inset-y-10 right-0 w-16 bg-gradient-to-l from-black to-transparent opacity-0 transition-opacity duration-200 group-hover/row:opacity-100" />

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="absolute left-2 top-[calc(50%+4px)] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 group-hover/row:flex"
      >
        ◀
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="absolute right-2 top-[calc(50%+4px)] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 group-hover/row:flex"
      >
        ▶
      </button>
    </section>
  );
}
