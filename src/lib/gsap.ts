"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Development only: lets the motion checks slow the whole timeline down.
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __gsap?: typeof gsap }).__gsap = gsap;
  }
}

export { gsap, ScrollTrigger, useGSAP };
