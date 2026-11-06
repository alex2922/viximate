import type { ComponentType } from "react";
import type { ServiceId } from "@/config/site";
import AIVisual from "./AIVisual";
import AppVisual from "./AppVisual";
import GrowthVisual from "./GrowthVisual";
import WebVisual from "./WebVisual";

/** The interface each discipline is shown building. */
export const VISUALS: Record<ServiceId, ComponentType> = {
  web: WebVisual,
  app: AppVisual,
  ai: AIVisual,
  growth: GrowthVisual,
};
