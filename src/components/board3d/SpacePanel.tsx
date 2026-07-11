"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { board } from "@/content/board";
import type { BoardSpace } from "@/content/board";
import { projectBySlug } from "@/content/projects";
import { useBoardStore } from "./store";

function PanelBody({ space }: { space: BoardSpace }) {
  switch (space.kind) {
    case "project":
    case "client": {
      const p = projectBySlug.get(space.projectSlug);
      if (!p) return null;
      return (
        <div className="space-y-4">
          {p.statusLabel && (
            <span className="border-gold-deep text-gold-deep inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium">
              {p.statusLabel}
            </span>
          )}
          <p className="leading-relaxed">{p.tagline}</p>
          <ul className="flex flex-wrap gap-1.5 text-xs">
            {p.stack.map((tech) => (
              <li key={tech} className="bg-ink/8 rounded px-2 py-0.5">
                {tech}
              </li>
            ))}
          </ul>
          <ul className="space-y-1 text-sm">
            {p.metrics.map((m) => (
              <li key={m}>◆ {m}</li>
            ))}
          </ul>
          <p className="flex flex-wrap gap-4 text-sm font-medium">
            <Link
              href={`/project/${p.slug}`}
              className="text-gold-deep underline"
            >
              Full case study →
            </Link>
            {p.links.live && (
              <a href={p.links.live} className="text-gold-deep underline">
                Live site ↗
              </a>
            )}
            {p.links.github && (
              <a href={p.links.github} className="text-gold-deep underline">
                Code ↗
              </a>
            )}
          </p>
        </div>
      );
    }
    case "story":
      return (
        <div className="space-y-3">
          {space.body.map((para) => (
            <p key={para} className="leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      );
    case "railroad":
    case "utility":
      return (
        <ul className="flex flex-wrap gap-2 text-sm">
          {space.items.map((item) => (
            <li key={item} className="border-ink/20 rounded border px-2 py-0.5">
              {item}
            </li>
          ))}
        </ul>
      );
    case "deck":
      return (
        <div className="space-y-4">
          {space.cards.map((card) => (
            <figure
              key={card.title}
              className="border-ink/15 bg-ink/4 rounded border p-3"
            >
              <p className="font-display text-gold-deep">{card.title}</p>
              <p className="mt-1 text-sm leading-relaxed">{card.body}</p>
            </figure>
          ))}
        </div>
      );
    case "corner":
      return (
        <div className="space-y-3">
          <p className="leading-relaxed">{space.body}</p>
          {space.cta && (
            <a
              href={space.cta.href}
              className="bg-ink text-cream hover:bg-charcoal inline-block rounded px-4 py-2 text-sm font-medium"
            >
              {space.cta.label} ↗
            </a>
          )}
        </div>
      );
    case "action":
      return (
        <div className="space-y-3">
          <p className="leading-relaxed">{space.body}</p>
          <Link
            href={space.cta.href}
            className="bg-ink text-cream hover:bg-charcoal inline-block rounded px-4 py-2 text-sm font-medium"
          >
            {space.cta.label}
          </Link>
        </div>
      );
    case "contact":
      return (
        <div className="space-y-3">
          <p className="leading-relaxed">{space.body}</p>
          <a
            href="mailto:umpierrejordan@gmail.com"
            className="bg-ink text-cream hover:bg-charcoal inline-block rounded px-4 py-2 text-sm font-medium"
          >
            umpierrejordan@gmail.com
          </a>
        </div>
      );
    case "flavor":
      return <p className="leading-relaxed">{space.body}</p>;
  }
}

/** DOM sheet: right on desktop, bottom on mobile. Focus-trapped dialog. */
export function SpacePanel() {
  const openSlug = useBoardStore((s) => s.openSlug);
  const closePanel = useBoardStore((s) => s.closePanel);
  const ref = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const space = openSlug ? board.find((s) => s.slug === openSlug) : undefined;

  useEffect(() => {
    if (!space) return;
    previouslyFocused.current = document.activeElement;
    const dialog = ref.current!;
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePanel();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex="0"]',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("keydown", onKey);
      (previouslyFocused.current as HTMLElement | null)?.focus?.();
    };
  }, [space, closePanel]);

  if (!space) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-label={space.title}
      className="border-ink/20 bg-cream text-ink absolute inset-x-0 bottom-0 z-20 max-h-[55%] overflow-y-auto rounded-t-lg border shadow-2xl sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-4 sm:max-h-none sm:w-[380px] sm:rounded-lg"
    >
      <div className="border-ink/10 bg-cream sticky top-0 flex items-start justify-between gap-3 border-b px-5 py-4">
        <h3 className="font-display text-xl">{space.title}</h3>
        <button
          type="button"
          data-autofocus
          onClick={closePanel}
          aria-label="Close panel"
          className="hover:bg-ink/10 rounded px-2 py-0.5 text-lg leading-none"
        >
          ✕
        </button>
      </div>
      <div className="px-5 py-4">
        <PanelBody space={space} />
      </div>
    </div>
  );
}
