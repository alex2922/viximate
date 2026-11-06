import { Mark } from "@/components/ui/Logo";

/** Shown when WebGL is unavailable: the mark, flat and solid. */
export default function SceneFallback() {
  return (
    <div className="hero-fallback">
      <Mark className="hero-fallback-mark" />
    </div>
  );
}
