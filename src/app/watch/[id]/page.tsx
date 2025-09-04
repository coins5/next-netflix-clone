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
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold">{movie.title}</h1>
        {movie.description ? (
          <p className="mb-4 text-white/70">{movie.description}</p>
        ) : null}
        <VideoPlayer
          sources={movie.sources}
          subtitles={movie.subtitles}
          poster={movie.poster}
          className="aspect-video w-full rounded-md bg-black"
          storageKey={`movie:${movie.id}`}
          resume
          autoPlay
          autoFullscreen
          controls
        />
      </div>
    </div>
  );
}
