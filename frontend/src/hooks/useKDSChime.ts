import { useCallback, useRef } from "react";

/**
 * Synthesises a premium double-tone chime using the Web Audio API.
 * The first note (higher pitch) fades in and holds briefly;
 * the second note (lower pitch) follows with a smooth decay.
 * Both use a sine-wave oscillator for a clear, pleasant bell sound.
 */
export function useKDSChime() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = (): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const playTone = useCallback(
    (ctx: AudioContext, frequency: number, startAt: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);

      // Smooth fade-in → hold → fade-out envelope
      gainNode.gain.setValueAtTime(0, startAt);
      gainNode.gain.linearRampToValueAtTime(0.55, startAt + 0.04);
      gainNode.gain.setValueAtTime(0.55, startAt + duration - 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

      oscillator.start(startAt);
      oscillator.stop(startAt + duration);
    },
    []
  );

  const chime = useCallback(() => {
    try {
      const ctx = getCtx();
      // Resume if suspended (browser autoplay policy)
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      // First tone: E5 (659 Hz) — bright alert
      playTone(ctx, 659, now, 0.55);
      // Second tone: C5 (523 Hz) — warm resolution, starts slightly overlapping
      playTone(ctx, 523, now + 0.35, 0.65);
    } catch (err) {
      console.warn("KDS chime error:", err);
    }
  }, [playTone]);

  return { chime };
}
