"use client";

import { useEffect, useMemo, useState } from "react";
import Row from "@/components/Row";
import { getAllMovies, type Movie } from "@/lib/catalog";

type Entry = { id: string; t: number; d?: number; u?: number };

function readEntries(): Entry[] {
  const prefix = "vp:pos:movie:";
  const out: Entry[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const id = key.slice(prefix.length);
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { t?: number; d?: number; u?: number };
      if (typeof parsed.t === "number") out.push({ id, t: parsed.t, d: parsed.d, u: parsed.u });
    }
  } catch {
    // ignore
  }
  return out;
}

export default function ContinueWatching() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const movies = getAllMovies();

  useEffect(() => {
    setEntries(readEntries());
    const onStorage = () => setEntries(readEntries());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const items: Movie[] = useMemo(() => {
    const byId = new Map(movies.map((m) => [m.id, m] as const));
    const filtered = entries
      .filter((e) => byId.has(e.id))
      .filter((e) => {
        const d = e.d ?? 0;
        if (!d || d <= 0) return true;
        const pct = e.t / d;
        return pct > 0.02 && pct < 0.98; // avoid near-start/end
      })
      .sort((a, b) => (b.u ?? 0) - (a.u ?? 0));
    return filtered.map((e) => byId.get(e.id)!).slice(0, 12);
  }, [entries, movies]);

  if (!items.length) return null;
  return <Row title="Seguir viendo" items={items} />;
}

