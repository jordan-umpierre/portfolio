"use client";

import { useEffect, useRef, useState } from "react";
import { board } from "@/content/board";
import { useBoardStore } from "./store";

/**
 * Roving-tabindex listbox of all 28 spaces — the keyboard/screen-reader
 * path onto the board. Arrows move, Enter travels, R rolls, Esc closes.
 */
export function SpaceNavigator() {
  const travelTo = useBoardStore((s) => s.travelTo);
  const roll = useBoardStore((s) => s.roll);
  const closePanel = useBoardStore((s) => s.closePanel);
  const setHover = useBoardStore((s) => s.setHover);
  const tokenIndex = useBoardStore((s) => s.tokenIndex);
  const announcement = useBoardStore((s) => s.announcement);
  const [focusIndex, setFocusIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "r" || e.key === "R") roll();
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roll, closePanel]);

  // ?space=slug deep link: travel there once the board is up.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("space");
    if (!slug) return;
    const index = board.findIndex((s) => s.slug === slug);
    if (index >= 0) travelTo(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onListKey = (e: React.KeyboardEvent) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = (focusIndex + 1) % 28;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (focusIndex + 27) % 28;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = 27;
    if (next !== null) {
      e.preventDefault();
      setFocusIndex(next);
      setHover(next);
      listRef.current
        ?.querySelector<HTMLElement>(`[data-index="${next}"]`)
        ?.focus();
    }
  };

  return (
    <nav aria-label="Board spaces" className="mx-auto max-w-5xl px-5 py-4">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <ul
        ref={listRef}
        role="listbox"
        aria-label="All 28 board spaces"
        aria-activedescendant={`space-opt-${focusIndex}`}
        onKeyDown={onListKey}
        className="flex flex-wrap justify-center gap-1.5"
      >
        {board.map((space, i) => (
          <li key={space.slug} role="presentation">
            <button
              type="button"
              id={`space-opt-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === tokenIndex}
              tabIndex={i === focusIndex ? 0 : -1}
              onFocus={() => {
                setFocusIndex(i);
                setHover(i);
              }}
              onBlur={() => setHover(null)}
              onClick={() => travelTo(i)}
              className={`rounded border px-2 py-1 text-xs transition-colors ${
                i === tokenIndex
                  ? "border-gold bg-gold text-felt-deep"
                  : "border-cream/20 text-cream/70 hover:border-gold hover:text-gold"
              }`}
            >
              {space.title}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-cream/50 mt-2 text-center text-xs">
        Arrow keys to browse · Enter to travel · R to roll · Esc closes the
        panel
      </p>
    </nav>
  );
}
