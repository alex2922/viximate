import type { PilePalette } from "./pileScene";

/** The block colours, read from the tokens so the 3D matches the stylesheet. */
export function readPalette(): PilePalette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    accent: v("--cs-accent"),
    accent2: v("--cs-accent-2"),
    background: v("--cs-background"),
    foreground: v("--cs-foreground"),
    quiet: v("--cs-surface-3"),
    disciplines: [
      v("--cs-disc-web"),
      v("--cs-disc-app"),
      v("--cs-disc-ai"),
      v("--cs-disc-growth"),
    ],
  };
}

export function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
