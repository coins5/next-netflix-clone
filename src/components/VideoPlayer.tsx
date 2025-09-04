"use client";

import { SubtitleTrack, VideoSource } from "@/lib/catalog";
import { useEffect, useMemo, useRef, useState } from "react";
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

  // Keep a wrapper to handle overlay and fullscreen toggling
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [showUnmute, setShowUnmute] = useState<boolean>(false);

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

  // Manage unmute overlay visibility
  useEffect(() => {
    if (!videoEl) return;
    const sync = () => setShowUnmute(videoEl.muted === true);
    sync();
    videoEl.addEventListener("volumechange", sync);
    videoEl.addEventListener("play", sync);
    return () => {
      videoEl.removeEventListener("volumechange", sync);
      videoEl.removeEventListener("play", sync);
    };
  }, [videoEl]);

  // Keyboard shortcuts: Space/K toggle play, arrows seek, M mute, F fullscreen
  useEffect(() => {
    if (!videoEl) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          if (videoEl.paused) {
            void videoEl.play();
          } else {
            videoEl.pause();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          videoEl.currentTime = Math.max(0, videoEl.currentTime - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          videoEl.currentTime = Math.min(videoEl.duration || Infinity, videoEl.currentTime + 5);
          break;
        case "m":
        case "M":
          e.preventDefault();
          videoEl.muted = !videoEl.muted;
          break;
        case "f":
        case "F":
          e.preventDefault();
          const wrapper = wrapperRef.current as any;
          if (document.fullscreenElement) {
            void document.exitFullscreen?.();
          } else if (wrapper?.requestFullscreen) {
            void wrapper.requestFullscreen();
          } else if ((videoEl as any).webkitEnterFullscreen) {
            (videoEl as any).webkitEnterFullscreen();
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [videoEl]);

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <video
        ref={setVideoEl}
        className="h-full w-full rounded-md"
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

      {showUnmute && (
        <button
          type="button"
          onClick={() => {
            if (!videoEl) return;
            videoEl.muted = false;
            void videoEl.play();
          }}
          className="absolute inset-x-0 top-1/2 z-10 mx-auto w-max -translate-y-1/2 rounded-full bg-white/15 px-4 py-2 text-white backdrop-blur transition hover:bg-white/25"
        >
          Tap to unmute
        </button>
      )}
    </div>
  );
}
