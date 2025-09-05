"use client";

import { useEffect } from "react";

/** Try to enter fullscreen when playback starts (best effort). */
export function useAutoFullscreen(videoEl: HTMLVideoElement | null, enable?: boolean) {
  useEffect(() => {
    if (!videoEl || !enable) return;
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

    const onPlay = () => tryFs();
    videoEl.addEventListener("play", onPlay);

    // If autoplay already started, try immediately
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
  }, [videoEl, enable]);
}

