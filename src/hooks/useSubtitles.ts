"use client";

import { useEffect, useState } from "react";
import type { SubtitleTrack } from "@/lib/catalog";
import { processSubtitles } from "@/lib/subtitles";

/** Fetch and convert SRT subtitles to VTT at runtime. */
export function useSubtitles(subtitles?: SubtitleTrack[]) {
  const [processed, setProcessed] = useState<SubtitleTrack[] | undefined>();

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { processed, revoke } = await processSubtitles(subtitles);
      if (!cancelled) setProcessed(processed);
      cleanup = revoke;
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [subtitles]);

  return processed ?? subtitles;
}

