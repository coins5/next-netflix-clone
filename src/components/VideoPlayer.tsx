"use client";

import { SubtitleTrack, VideoSource } from "@/lib/catalog";
import { useMemo, useState } from "react";
import { useSubtitles } from "@/hooks/useSubtitles";
import { useResume } from "@/hooks/useResume";
import { useAutoFullscreen } from "@/hooks/useAutoFullscreen";

type Props = {
  sources: VideoSource[];
  poster?: string;
  subtitles?: SubtitleTrack[];
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  storageKey?: string; // unique key to persist position
  resume?: boolean; // auto-resume from last position
  autoFullscreen?: boolean; // try entering fullscreen on start
};

export default function VideoPlayer({
  sources,
  poster,
  subtitles,
  autoPlay,
  controls = true,
  className,
  storageKey,
  resume = true,
  autoFullscreen,
}: Props) {
  // Stable id for storage; fallback to first source URL
  const videoId = useMemo(() => {
    const fallback = sources?.[0]?.src || "";
    return storageKey || fallback;
  }, [storageKey, sources]);

  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  // Prepare subtitles (convert SRT -> VTT at runtime when needed)
  const processedSubs: SubtitleTrack[] | undefined = useSubtitles(subtitles);

  // Persist and restore last playback position
  useResume(videoEl, videoId, !!resume);

  // Attempt to enter fullscreen when playback starts (best effort)
  useAutoFullscreen(videoEl, autoFullscreen);

  // Keep MP4 first for broad compatibility
  const ordered = useMemo(() => {
    return [...sources].sort((a, b) => {
      const pa = a.type.includes("mp4") ? 0 : 1;
      const pb = b.type.includes("mp4") ? 0 : 1;
      return pa - pb;
    });
  }, [sources]);

  return (
    <video
      ref={setVideoEl}
      className={className}
      controls={controls}
      preload="metadata"
      poster={poster}
      playsInline
      {...(autoPlay ? { autoPlay: true, muted: true } : {})}
    >
      {ordered.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
      {(processedSubs ?? subtitles)?.map((t) => (
        <track
          key={t.src}
          src={t.src}
          kind="subtitles"
          srcLang={t.lang}
          label={t.label}
          {...(t.default ? { default: true } : {})}
        />
      ))}
      {/* Fallback text for very old browsers */}
      Your browser does not support the video tag.
    </video>
  );
}

