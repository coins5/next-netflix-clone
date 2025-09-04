// Utilities to handle subtitles, including SRT to WebVTT conversion.
// These run on the client side.

import type { SubtitleTrack } from "@/lib/catalog";

/** Returns true if the provided URL or path looks like an SRT file. */
export function isSrtUrl(url: string): boolean {
  return /\.srt(\?|#|$)/i.test(url);
}

/**
 * Convert SRT subtitle text to WebVTT format.
 * This is a best-effort converter that handles standard SRT timing lines
 * like "00:00:01,000 --> 00:00:02,000" and plain text payload.
 */
export function srtToVtt(srt: string): string {
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
    // Optional numeric index on first line
    if (/^\d+$/.test(lines[0].trim())) i = 1;
    if (!lines[i]) continue;
    // Replace comma decimal separators with dot for VTT
    const time = lines[i]
      .replace(/,/, ".")
      .replace(/ --> .*?,/g, (m) => m.replace(",", "."));
    const textLines = lines.slice(i + 1);
    out.push(time, ...textLines, "");
  }
  return out.join("\n");
}

/**
 * Given a list of subtitle tracks, fetch and convert any .srt to .vtt at runtime
 * returning a new list that points to Blob URLs for converted tracks.
 * Returns also a cleanup function to revoke Blob URLs.
 */
export async function processSubtitles(
  subs: SubtitleTrack[] | undefined
): Promise<{ processed: SubtitleTrack[] | undefined; revoke: () => void }> {
  if (!subs || subs.length === 0) return { processed: undefined, revoke: () => {} };

  const blobUrls: string[] = [];
  const processed = (
    await Promise.all(
      subs.map(async (t) => {
        if (!isSrtUrl(t.src)) return t;
        try {
          const res = await fetch(t.src);
          const srt = await res.text();
          const vtt = srtToVtt(srt);
          const blob = new Blob([vtt], { type: "text/vtt" });
          const url = URL.createObjectURL(blob);
          blobUrls.push(url);
          return { ...t, src: url } as SubtitleTrack;
        } catch {
          // If fetch fails (e.g., CORS), drop this track silently
          return undefined;
        }
      })
    )
  ).filter(Boolean) as SubtitleTrack[];

  return {
    processed: processed.length ? processed : undefined,
    revoke: () => blobUrls.forEach((u) => URL.revokeObjectURL(u)),
  };
}

