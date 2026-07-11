"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SpaceNavigator } from "./SpaceNavigator";
import { SpacePanel } from "./SpacePanel";

const Board3D = dynamic(() => import("./Board3D"), { ssr: false });

const PREF_KEY = "board-mode"; // "3d" | "classic"
/** Idle-load waits this long so chunk parse + texture gen land well after LCP/TBT windows. */
const ENGAGE_DELAY_MS = 3500;

type Gate = "unknown" | "ok" | "blocked";

function deviceQualifies(): boolean {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return false;
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return false;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
      return false;
    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl2")) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * The 3D island's mount point, rendered above the classic content.
 * SSR ships the poster shell (hidden until the `js` class exists); the
 * capability gate + saved preference decide what actually mounts.
 * The poster and the canvas swap inside a fixed-height box, and the
 * navigator/panel are always present, so engaging causes no layout shift.
 */
export function BoardStage() {
  const [gate, setGate] = useState<Gate>("unknown");
  const [mode, setMode] = useState<"3d" | "classic">("3d");
  const [engaged, setEngaged] = useState(false); // load the 3D chunk

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saved =
      params.get("mode") === "classic"
        ? "classic"
        : (localStorage.getItem(PREF_KEY) as "3d" | "classic" | null);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mode/capability detection must run after mount
    if (saved === "classic") setMode("classic");
    const qualifies = deviceQualifies();
    setGate(qualifies ? "ok" : "blocked");
    // ?space deep link in classic contexts: scroll to the matching section
    const space = params.get("space");
    if (space && (saved === "classic" || !qualifies)) {
      document.getElementById(space)?.scrollIntoView();
    }
  }, []);

  const toggle = () => {
    setMode((m) => {
      const next = m === "3d" ? "classic" : "3d";
      localStorage.setItem(PREF_KEY, next);
      return next;
    });
  };

  useEffect(() => {
    if (gate !== "ok" || mode !== "3d" || engaged) return;
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        // timeout: rIC can starve on frame-less static pages
        window.requestIdleCallback(() => setEngaged(true), { timeout: 1500 });
      } else {
        setEngaged(true);
      }
    }, ENGAGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [gate, mode, engaged]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "m" && e.key !== "M") return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Gate failed: classic content only, with an opt-in escape hatch.
  if (gate === "blocked") {
    return (
      <p className="text-cream/50 mx-auto max-w-5xl px-5 pt-4 text-xs">
        This site has a 3D board mode.{" "}
        <button
          type="button"
          className="hover:text-gold underline"
          onClick={() => {
            setGate("ok");
            setMode("3d");
            setEngaged(true);
          }}
        >
          Try the 3D board anyway
        </button>
      </p>
    );
  }

  // Classic mode: just the way back in.
  if (gate === "ok" && mode === "classic") {
    return (
      <div className="mx-auto max-w-5xl px-5 pt-4">
        <button
          type="button"
          onClick={toggle}
          data-testid="board-toggle"
          className="border-gold/60 text-gold hover:bg-gold hover:text-felt-deep rounded border px-3 py-1.5 text-xs font-medium"
        >
          🎩 View as the 3D board
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label="Interactive 3D board"
      className="hidden motion-reduce:hidden! [.js_&]:block"
      data-testid="board-stage"
    >
      <div className="felt-surface border-cream/10 border-b">
        <div className="mx-auto max-w-6xl px-3 pt-4 pb-2">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
              The Board
            </p>
            <button
              type="button"
              onClick={toggle}
              data-testid="board-toggle"
              className="border-cream/25 text-cream/80 hover:border-gold hover:text-gold rounded border px-3 py-1.5 text-xs font-medium"
            >
              Recruiter mode (classic)
            </button>
          </div>
          <div className="relative h-[70vh] min-h-[420px] w-full sm:h-[78vh]">
            {engaged ? (
              <Board3D />
            ) : (
              <button
                type="button"
                onClick={() => setEngaged(true)}
                className="group border-cream/10 relative block h-full w-full overflow-hidden rounded-md border"
              >
                <Image
                  src="/board-poster.jpg"
                  alt="Top-down view of the portfolio as a Monopoly-style board"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <span className="bg-felt-deep/30 group-hover:bg-felt-deep/10 absolute inset-0 flex items-center justify-center transition-colors">
                  <span className="bg-gold text-felt-deep rounded-full px-6 py-3 font-semibold shadow-lg">
                    🎲 Enter the Board
                  </span>
                </span>
              </button>
            )}
            <SpacePanel />
          </div>
          {/* Interacting with the space list is also an engage signal. */}
          <div onFocusCapture={() => setEngaged(true)}>
            <SpaceNavigator />
          </div>
        </div>
      </div>
    </section>
  );
}
