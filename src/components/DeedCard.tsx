import Link from "next/link";
import type { Project } from "@/content/projects";

const bandClass: Record<Project["band"], string> = {
  brown: "bg-band-brown",
  ltblue: "bg-band-ltblue",
  pink: "bg-band-pink",
  orange: "bg-band-orange",
  red: "bg-band-red",
  yellow: "bg-band-yellow",
  green: "bg-band-green",
  dkblue: "bg-band-dkblue",
};

/* Vivid bands need per-color text: light bands take ink, dark take cream. */
const bandText: Record<Project["band"], string> = {
  brown: "text-cream",
  ltblue: "text-ink",
  pink: "text-cream",
  orange: "text-ink",
  red: "text-cream",
  yellow: "text-ink",
  green: "text-cream",
  dkblue: "text-cream",
};

/** Monopoly title-deed styled project card. */
export function DeedCard({ project }: { project: Project }) {
  return (
    <article
      data-reveal
      className="border-ink/15 bg-cream text-ink flex flex-col overflow-hidden rounded-md border shadow-lg"
    >
      <div
        className={`${bandClass[project.band]} ${bandText[project.band]} border-ink/20 border-b-2 px-5 py-3`}
      >
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase opacity-80">
          Title Deed · {project.year}
        </p>
        <h3 className="font-display text-xl">
          <Link href={`/project/${project.slug}`} className="hover:underline">
            {project.name}
          </Link>
        </h3>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        {project.statusLabel && (
          <span className="border-gold-deep text-gold-deep self-start rounded-full border px-2.5 py-0.5 text-xs font-medium">
            {project.statusLabel}
          </span>
        )}
        <p className="text-sm leading-relaxed">{project.tagline}</p>
        <ul className="flex flex-wrap gap-1.5 text-xs">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="bg-ink/8 text-charcoal rounded px-2 py-0.5"
            >
              {tech}
            </li>
          ))}
        </ul>
        <ul className="border-ink/10 text-charcoal/90 mt-auto space-y-1 border-t pt-3 text-xs">
          {project.metrics.map((m) => (
            <li key={m}>◆ {m}</li>
          ))}
        </ul>
        <p className="flex flex-wrap gap-4 text-sm font-medium">
          <Link
            href={`/project/${project.slug}`}
            className="text-gold-deep hover:underline"
          >
            Case study →
          </Link>
          {project.links.live && (
            <a
              href={project.links.live}
              className="text-gold-deep hover:underline"
            >
              Live site ↗
            </a>
          )}
          {project.links.github && (
            <a
              href={project.links.github}
              className="text-gold-deep hover:underline"
            >
              Code ↗
            </a>
          )}
        </p>
      </div>
    </article>
  );
}
