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
};

export default function VideoPlayer({
  sources,
  poster,
  subtitles,
  autoPlay,
  controls = true,
  className,
}: Props) {
  const [processedSubs, setProcessedSubs] = useState<SubtitleTrack[] | undefined>(
    undefined
  );

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
