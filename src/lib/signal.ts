"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

export type Signal<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: Listener) => () => void;
  initial: T;
};

/** Minimal external store shared between client islands. */
export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;
  const listeners = new Set<Listener>();
  return {
    initial,
    get: () => value,
    set: (next) => {
      if (Object.is(next, value)) return;
      value = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useSignal<T>(signal: Signal<T>): T {
  return useSyncExternalStore(
    signal.subscribe,
    signal.get,
    () => signal.initial,
  );
}

/** Flips to true once the intro loader has finished. */
export const loadedSignal = createSignal(false);

/** Flips to true when the hero WebGL scene has rendered its first frame (or failed). */
export const sceneReadySignal = createSignal(false);
