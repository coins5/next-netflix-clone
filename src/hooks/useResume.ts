"use client";

import { useEffect } from "react";

/**
 * Persist and restore playback position in localStorage.
 * - Stores JSON: { t: number, d?: number, u: number }
 * - Clears when near start or near end, or when ended
 */
export function useResume(
  video: HTMLVideoElement | null,
  key: string,
  enable: boolean
) {
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
        try {
          localStorage.removeItem(storageKey);
        } catch {}
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
      try {
        localStorage.removeItem(storageKey);
      } catch {}
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

