/**
 * The Viximate mark, traced from public/logo.png (98.8% pixel overlap).
 * Two pieces share one 815 x 733 viewBox: the rounded inverted triangle (top)
 * and the chevron below it. Every rendering of the logo (nav, loader, footer,
 * the WebGL hero) reads these paths so the mark stays identical everywhere.
 */
export const MARK_VIEWBOX = { width: 815, height: 733 } as const;

export const MARK_TOP =
  "M56 0 H759 C790 0 815 25 815 58 Q815 87.6 799 98 L485 301.4 Q407.5 351.7 330 301.4 L16 98 Q0 87.6 0 58 C0 25 25 0 56 0 Z";

export const MARK_CHEVRON =
  "M107.5 281 L343.8 679 Q407.5 786 471.2 679 L707.5 281 L471.2 434.3 Q407.5 475.7 343.8 434.3 Z";
