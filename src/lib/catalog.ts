import movies from "@/data/movies.json";

export type VideoSource = {
  src: string;
  type: string; // e.g. "video/mp4", "video/webm"
  label?: string;
};

export type SubtitleTrack = {
  src: string;
  lang: string;
  label: string;
  default?: boolean;
};

export type Movie = {
  id: string;
  title: string;
  description?: string;
  poster?: string; // path in /public or external URL (use <img>)
  categories: string[];
  sources: VideoSource[];
  subtitles?: SubtitleTrack[];
  year?: number;
  runtime?: number; // seconds
};

export function getAllMovies(): Movie[] {
  return movies as Movie[];
}

export function getMovieById(id: string): Movie | undefined {
  return getAllMovies().find((m) => m.id === id);
}

export function getCategories(): string[] {
  const set = new Set<string>();
  getAllMovies().forEach((m) => m.categories?.forEach((c) => set.add(c)));
  return Array.from(set);
}

export function getByCategory(): Record<string, Movie[]> {
  const map: Record<string, Movie[]> = {};
  for (const m of getAllMovies()) {
    for (const c of m.categories || []) {
      map[c] = map[c] || [];
      map[c].push(m);
    }
  }
  return map;
}

