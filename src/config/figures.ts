import type { ServiceId } from "@/config/site";

/** What a block settles into: the page's tone, white, black, grey or a discipline. */
export type Ink = "t" | "w" | "d" | "m" | ServiceId;

/** x, y, width, height, corner, ink, on a 240 by 160 stage. */
export type Bit = [number, number, number, number, number, Ink];

export type FigureId = ServiceId | "system" | "notes" | "talk";

export const FIGURE_STAGE = { width: 240, height: 160 } as const;

/**
 * Every shape the blocks can build, drawn only in rounded blocks. One list
 * feeds both the flat art in the tiles and the 3D figures at the top of the
 * pages, so the two can never drift apart. Later bits sit in front.
 */
export const FIGURES: Record<FigureId, Bit[]> = {
  web: [
    [20, 14, 200, 22, 7, "t"],
    [30, 21, 8, 8, 4, "d"],
    [44, 21, 8, 8, 4, "d"],
    [20, 44, 124, 102, 9, "t"],
    [152, 44, 68, 47, 9, "w"],
    [152, 99, 68, 47, 9, "t"],
    [34, 60, 74, 11, 5, "d"],
    [34, 79, 50, 11, 5, "d"],
    [34, 110, 44, 20, 10, "w"],
  ],
  app: [
    [82, 6, 78, 148, 15, "t"],
    [90, 24, 62, 72, 7, "d"],
    [90, 104, 62, 16, 8, "w"],
    [90, 126, 62, 16, 8, "d"],
    [168, 34, 54, 104, 12, "w"],
    [176, 48, 38, 42, 6, "d"],
    [18, 34, 54, 104, 12, "w"],
    [26, 48, 38, 42, 19, "t"],
    [26, 100, 38, 12, 6, "d"],
  ],
  ai: [
    [62, 33, 62, 6, 3, "m"],
    [117, 33, 6, 26, 3, "m"],
    [120, 33, 60, 6, 3, "m"],
    [62, 121, 62, 6, 3, "m"],
    [117, 102, 6, 25, 3, "m"],
    [120, 121, 60, 6, 3, "m"],
    [20, 14, 44, 44, 11, "w"],
    [176, 14, 44, 44, 11, "t"],
    [20, 102, 44, 44, 11, "t"],
    [176, 102, 44, 44, 11, "w"],
    [88, 48, 64, 64, 32, "t"],
    [108, 68, 24, 24, 12, "d"],
  ],
  growth: [
    [16, 146, 208, 7, 3, "w"],
    [26, 104, 38, 38, 7, "w"],
    [74, 80, 38, 62, 7, "t"],
    [122, 52, 38, 90, 7, "t"],
    [170, 20, 38, 122, 7, "t"],
    [178, 30, 22, 8, 4, "d"],
    [130, 62, 22, 8, 4, "d"],
    [82, 90, 22, 8, 4, "d"],
  ],
  // Four quarters held together by one piece in the middle.
  system: [
    [46, 6, 72, 72, 13, "web"],
    [122, 6, 72, 72, 13, "app"],
    [46, 82, 72, 72, 13, "ai"],
    [122, 82, 72, 72, 13, "growth"],
    [92, 52, 56, 56, 28, "d"],
    [100, 60, 40, 40, 20, "w"],
  ],
  // A page on top of two others.
  notes: [
    [112, 6, 106, 124, 11, "app"],
    [76, 16, 106, 130, 11, "web"],
    [30, 26, 118, 130, 11, "w"],
    [46, 44, 86, 13, 6, "d"],
    [46, 68, 58, 8, 4, "d"],
    [46, 84, 74, 8, 4, "d"],
    [46, 100, 66, 8, 4, "d"],
    [46, 122, 44, 18, 9, "ai"],
  ],
  // A message and the reply.
  talk: [
    [20, 8, 176, 104, 24, "growth"],
    [20, 84, 44, 58, 8, "growth"],
    [52, 48, 26, 26, 13, "d"],
    [95, 48, 26, 26, 13, "d"],
    [138, 48, 26, 26, 13, "d"],
    [128, 96, 96, 54, 18, "w"],
    [146, 112, 60, 8, 4, "d"],
    [146, 127, 38, 8, 4, "d"],
  ],
};
