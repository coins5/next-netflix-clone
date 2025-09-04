"use client";

import { SubtitleTrack, VideoSource } from "@/lib/catalog";
import { useEffect, useMemo, useState } from "react";

type Props = {
  sources: VideoSource[];
  poster?: string;
  subtitles?: SubtitleTrack[];
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  storageKey?: string; // unique key to persist position
  resume?: boolean; // auto-resume from last position
  autoFullscreen?: boolean; // try enter fullscreen on start
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
  const videoId = useMemo(() => {
    const fallback = sources?.[0]?.src || "";
    return storageKey || fallback;
  }, [storageKey, sources]);

  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [processedSubs, setProcessedSubs] = useState<SubtitleTrack[] | undefined>(
    undefined
  );

  // Enable resume feature
  useResume(videoEl, videoId, !!resume);

  // Attempt to enter fullscreen automatically when playback starts
  useEffect(() => {
    if (!videoEl || !autoFullscreen) return;
    let requested = false;

    const tryFs = async () => {
      if (requested) return;
      requested = true;
      try {
        const anyVideo = videoEl as any;
        if (document.fullscreenElement == null && anyVideo.requestFullscreen) {
          await anyVideo.requestFullscreen();
        } else if (anyVideo.webkitEnterFullscreen) {
          anyVideo.webkitEnterFullscreen();
        }
      } catch {
        // Some browsers require user gesture; ignore errors
      }
    };

    const onPlay = () => {
      tryFs();
    };

    videoEl.addEventListener("play", onPlay);

    // If autoplay has already started, request ASAP
    if (!videoEl.paused) {
      const id = setTimeout(tryFs, 0);
      return () => {
        clearTimeout(id);
        videoEl.removeEventListener("play", onPlay);
      };
    }

    return () => {
      videoEl.removeEventListener("play", onPlay);
    };
  }, [videoEl, autoFullscreen]);

  useEffect(() => {
    let cancelled = false;
    const blobUrls: string[] = [];

    async function toVtt(srt: string) {
      // Basic SRT -> VTT conversion
      const text = srt.replace(/^\uFEFF/, "");
      const blocks = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split(/\n\n+/);
      const out: string[] = ["WEBVTT", ""]; // header + blank line
      for (const block of blocks) {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        if (lines.length === 0) continue;
        let i = 0;
        // Optional numeric index
        if (/^\d+$/.test(lines[0].trim())) i = 1;
        if (!lines[i]) continue;
        const time = lines[i]
          .replace(/,/, ".")
          .replace(/ --> .*?,/g, (m) => m.replace(",", "."));
        const textLines = lines.slice(i + 1);
        out.push(time, ...textLines, "");
      }
      return out.join("\n");
    }

    async function process() {
      if (!subtitles || subtitles.length === 0) {
        setProcessedSubs(undefined);
        return;
      }
      const list = await Promise.all(
        subtitles.map(async (t) => {
          if (/\.srt(\?|#|$)/i.test(t.src)) {
            try {
              const res = await fetch(t.src);
              const srt = await res.text();
              const vtt = await toVtt(srt);
              const blob = new Blob([vtt], { type: "text/vtt" });
              const url = URL.createObjectURL(blob);
              blobUrls.push(url);
              return { ...t, src: url } as SubtitleTrack;
            } catch {
              // Fallback: drop this track if fetch fails
              return undefined;
            }
          }
          return t;
        })
      );
      if (!cancelled) setProcessedSubs(list.filter(Boolean) as SubtitleTrack[]);
    }

    process();
    return () => {
      cancelled = true;
      for (const url of blobUrls) URL.revokeObjectURL(url);
    };
  }, [subtitles]);

  const ordered = useMemo(() => {
    // Keep mp4 first for broad compatibility, then others
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
      {/* Fallback text */}
      Tu navegador no soporta el elemento video.
    </video>
  );
}

// Persist and restore playback position
// Stores JSON: { t: number, d?: number, u: number }
function useResume(video: HTMLVideoElement | null, key: string, enable: boolean) {
  useEffect(() => {
    if (!video || !enable || !key) return;

    const storageKey = `vp:pos:${key}`;
    let lastSaved = 0;

    const tryRestore = () => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { t: number; d?: number };
        const t = parsed?.t ?? 0;
        if (Number.isFinite(t) && t > 1 && video.duration && t < video.duration - 2) {
          video.currentTime = t;
        }
      } catch {
        // ignore
      }
    };

    const save = () => {
      if (!video.duration || video.duration < 20) return;
      const t = video.currentTime;
      if (!Number.isFinite(t)) return;
      const now = Date.now();
      if (now - lastSaved < 2000) return; // throttle ~2s
      lastSaved = now;
      if (t < 2 || t >= video.duration - 2) {
        // near start or near end: clear
        try { localStorage.removeItem(storageKey); } catch {}
        return;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify({ t, d: video.duration, u: now }));
      } catch {
        // ignore quota
      }
    };

    const onLoaded = () => tryRestore();
    const onTime = () => save();
    const onPause = () => save();
    const onEnded = () => {
      try { localStorage.removeItem(storageKey); } catch {}
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [video, key, enable]);
}
