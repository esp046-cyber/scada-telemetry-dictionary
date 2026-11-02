// Optional haptics and quiet sound accents.
let ctx: AudioContext | null = null;
export function tick(soundOn: boolean, pitch = 520): void {
  navigator.vibrate?.(8);
  if (!soundOn) return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = pitch; g.gain.value = 0.03; o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.05);
  } catch { /* audio unavailable */ }
}
