import Link from "next/link";
import { notFound } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { getMovieById } from "@/lib/catalog";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20">
            ← Back
          </Link>
          <div className="text-sm text-white/60">Demo</div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-semibold sm:text-3xl">{movie.title}</h1>
        </div>

        <div className="mb-6">
          <VideoPlayer
            sources={movie.sources}
            subtitles={movie.subtitles}
            poster={movie.poster}
            className="aspect-video w-full rounded-lg bg-black shadow-2xl"
            storageKey={`movie:${movie.id}`}
            resume
            autoPlay
            autoFullscreen
            controls
          />
        </div>

        {movie.description ? (
          <p className="max-w-3xl text-white/75">{movie.description}</p>
        ) : null}
      </div>
    </div>
  );
}
