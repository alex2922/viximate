"use client";

import type Matter from "matter-js";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* The footer's physics, for any stage: every .pit-body inside it falls in from
   above, can be pushed, grabbed and thrown, and tidies itself back to where
   the stylesheet laid it out. Without motion the layout is simply what shows. */

/** How long the pile may sit untouched before it tidies itself. */
const IDLE_MS = 9000;
const TIDY_STAGGER = 45;
const MAX_SPEED = 38;

type Piece = {
  el: HTMLElement;
  body: Matter.Body;
  homeX: number;
  homeY: number;
  /** The wordmark lands in order; the rest is thrown in. */
  word: boolean;
  halfHeight: number;
};

/** The box a glyph's ink fills, in the coordinates of its own element. */
function inkBox(el: HTMLElement) {
  const style = getComputedStyle(el);
  const size = Number.parseFloat(style.fontSize);
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return null;
  context.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
  const m = context.measureText(el.textContent ?? "");
  const baseline =
    (el.offsetHeight - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) /
      2 +
    m.fontBoundingBoxAscent;
  return {
    x: -m.actualBoundingBoxLeft,
    y: baseline - m.actualBoundingBoxAscent,
    width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
  };
}

/** Runs a stage's world, fresh on each page. Returns the ref for the stage. */
export function usePit() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: each page starts with a fresh drop
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    const begin = async () => {
      const [{ default: M }] = await Promise.all([
        import("matter-js"),
        document.fonts?.ready,
      ]);
      if (cancelled) return;
      teardown = build(M, stage);
    };
    begin();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [pathname]);

  return stageRef;
}

/** Build the world for one stage. Returns its teardown. */
function build(M: typeof Matter, stage: HTMLElement) {
  const { Bodies, Body, Composite, Constraint, Engine, Query } = M;
  const engine = Engine.create({ enableSleeping: false });
  engine.gravity.y = 1.15;
  const world = engine.world;

  let width = stage.clientWidth;
  let height = stage.clientHeight;
  const wall = { isStatic: true, friction: 0.7, restitution: 0.1 };
  const thick = 400;
  const pieces: Piece[] = [];
  const els = Array.from(stage.querySelectorAll<HTMLElement>(".pit-body"));
  let looseIndex = 0;
  let wordIndex = 0;
  for (const el of els) {
    el.style.transform = "none";
    const word = "word" in el.dataset;
    const round = el.dataset.shape === "round";
    const left = el.getBoundingClientRect().left;
    const top = el.getBoundingClientRect().top;
    const base = stage.getBoundingClientRect();
    const box = el.classList.contains("pit-letter") ? inkBox(el) : null;
    const w = box?.width ?? el.offsetWidth;
    const h = box?.height ?? el.offsetHeight;
    const ox = (box?.x ?? 0) + w / 2;
    const oy = (box?.y ?? 0) + h / 2;
    el.style.transformOrigin = `${ox}px ${oy}px`;
    const homeX = left - base.left + ox;
    const homeY = top - base.top + oy;

    // The wordmark falls straight down its own column, so it lands in order.
    const order = word ? wordIndex++ : looseIndex++;
    const startX = word ? homeX : width * (0.08 + Math.random() * 0.84);
    const startY = word
      ? -h - order * height * 0.16
      : -height * (1.7 + order * 0.2);
    const options = {
      friction: 0.55,
      frictionAir: 0.012,
      restitution: word ? 0.12 : 0.34,
      density: word ? 0.0022 : 0.0012,
      angle: word ? 0 : (Math.random() - 0.5) * 1.4,
    };
    const body = round
      ? Bodies.circle(startX, startY, w / 2, options)
      : Bodies.rectangle(startX, startY, w, h, {
          ...options,
          chamfer: { radius: el.classList.contains("pit-pill") ? h / 2.2 : 6 },
        });
    pieces.push({ el, body, homeX, homeY, word, halfHeight: h / 2 });
  }
  // The ground is the wordmark's own baseline, so it lands exactly in place.
  // With no wordmark it is simply the bottom of the stage.
  const lettered = pieces.filter((p) => p.word);
  const ground = lettered.length
    ? Math.max(...lettered.map((p) => p.homeY + p.halfHeight))
    : height;
  Composite.add(world, [
    Bodies.rectangle(width / 2, ground + thick / 2, width * 3, thick, wall),
    Bodies.rectangle(-thick / 2, 0, thick, height * 12, wall),
    Bodies.rectangle(width + thick / 2, 0, thick, height * 12, wall),
    ...pieces.map((p) => p.body),
  ]);

  // An invisible hand under the mouse, so the pile reacts to being brushed.
  const hand = Bodies.circle(-999, -999, 30, {
    isStatic: true,
    collisionFilter: { mask: 0 },
  });
  Composite.add(world, hand);

  const paint = () => {
    for (const { el, body, homeX, homeY } of pieces) {
      el.style.transform = `translate3d(${(body.position.x - homeX).toFixed(2)}px, ${(body.position.y - homeY).toFixed(2)}px, 0) rotate(${body.angle.toFixed(4)}rad)`;
    }
  };

  let lastTouch = performance.now();
  let homing = false;
  let homingSince = 0;

  const release = () => {
    homing = false;
    for (const p of pieces) {
      if (p.body.isStatic) Body.setStatic(p.body, false);
      p.body.collisionFilter.mask = 0xffffffff;
    }
  };

  const local = (event: PointerEvent) => {
    const rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  let grip: Matter.Constraint | null = null;

  const onDown = (event: PointerEvent) => {
    lastTouch = performance.now();
    release();
    const point = local(event);
    const [hit] = Query.point(
      pieces.map((p) => p.body),
      point,
    );
    if (!hit) return;
    grip = Constraint.create({
      pointA: point,
      bodyB: hit,
      pointB: {
        x: point.x - hit.position.x,
        y: point.y - hit.position.y,
      },
      stiffness: 0.16,
      damping: 0.12,
      length: 0,
    });
    Composite.add(world, grip);
    stage.setPointerCapture(event.pointerId);
    stage.dataset.grabbing = "true";
  };

  const onMove = (event: PointerEvent) => {
    lastTouch = performance.now();
    if (homing) release();
    const point = local(event);
    if (grip) {
      grip.pointA = point;
      return;
    }
    if (event.pointerType !== "mouse") return;
    hand.collisionFilter.mask = 0xffffffff;
    Body.setVelocity(hand, {
      x: point.x - hand.position.x,
      y: point.y - hand.position.y,
    });
    Body.setPosition(hand, point);
  };

  const onUp = () => {
    if (grip) Composite.remove(world, grip);
    grip = null;
    delete stage.dataset.grabbing;
  };

  const onLeave = () => {
    hand.collisionFilter.mask = 0;
    Body.setPosition(hand, { x: -999, y: -999 });
  };

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);
  stage.addEventListener("pointerleave", onLeave);

  // One piece after another, each easing the last of the way in.
  const goHome = (elapsed: number) => {
    pieces.forEach((p, i) => {
      if (p.body.isStatic || elapsed < i * TIDY_STAGGER) return;
      const { x, y } = p.body.position;
      const dx = p.homeX - x;
      const dy = p.homeY - y;
      if (Math.hypot(dx, dy) < 0.4 && Math.abs(p.body.angle) < 0.004) {
        Body.setPosition(p.body, { x: p.homeX, y: p.homeY });
        Body.setAngle(p.body, 0);
        Body.setStatic(p.body, true);
        p.body.collisionFilter.mask = 0xffffffff;
        return;
      }
      Body.setVelocity(p.body, { x: 0, y: 0 });
      Body.setAngularVelocity(p.body, 0);
      Body.setPosition(p.body, { x: x + dx * 0.11, y: y + dy * 0.11 });
      Body.setAngle(p.body, p.body.angle * 0.88);
    });
  };

  // A hard throw should arc back into the pit, not leave for good.
  const limit = () => {
    for (const { body } of pieces) {
      if (body.isStatic || body.speed <= MAX_SPEED) continue;
      const scale = MAX_SPEED / body.speed;
      Body.setVelocity(body, {
        x: body.velocity.x * scale,
        y: body.velocity.y * scale,
      });
    }
  };

  let frame = 0;
  let running = false;
  const tick = () => {
    if (!running) return;
    Engine.update(engine, 1000 / 60);
    limit();
    const now = performance.now();
    if (!homing && !grip && now - lastTouch > IDLE_MS) {
      homing = true;
      homingSince = now;
      for (const p of pieces) p.body.collisionFilter.mask = 0;
    }
    if (homing) goHome(now - homingSince);
    paint();
    frame = requestAnimationFrame(tick);
  };

  paint();

  // Only fall once it is on screen, and only run while it is.
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        lastTouch = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(frame);
      }
    },
    { threshold: 0.3 },
  );
  io.observe(stage);

  // A new width means new homes, so start over.
  const resize = new ResizeObserver(() => {
    if (Math.abs(stage.clientWidth - width) < 2) return;
    width = stage.clientWidth;
    height = stage.clientHeight;
    teardown();
    rebuilt = build(M, stage);
  });
  resize.observe(stage);

  let rebuilt: (() => void) | undefined;
  const teardown = () => {
    running = false;
    cancelAnimationFrame(frame);
    io.disconnect();
    resize.disconnect();
    stage.removeEventListener("pointerdown", onDown);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerup", onUp);
    stage.removeEventListener("pointercancel", onUp);
    stage.removeEventListener("pointerleave", onLeave);
    Engine.clear(engine);
    for (const el of els) el.style.transform = "";
  };

  return () => {
    teardown();
    rebuilt?.();
  };
}
