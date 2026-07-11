import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectBySlug, projects } from "@/content/projects";
import { site } from "@/content/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug.get(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.tagline,
    alternates: { canonical: `/project/${project.slug}` },
    openGraph: {
      title: `${project.name} — ${site.name}`,
      description: project.tagline,
      type: "article",
    },
  };
}

const statusText: Record<string, string> = {
  live: "Live",
  "in-progress": "In Progress",
  "in-development": "In Development",
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projectBySlug.get(slug);
  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.tagline,
    programmingLanguage: project.stack,
    author: { "@type": "Person", name: site.name, url: site.url },
    ...(project.links.github && { codeRepository: project.links.github }),
    ...(project.links.live && { url: project.links.live }),
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
        Title Deed · {project.year} ·{" "}
        {project.statusLabel ?? statusText[project.status]}
      </p>
      <h1 className="font-display text-cream mt-2 text-4xl sm:text-5xl">
        {project.name}
      </h1>
      <p className="text-cream/85 mt-4 text-lg leading-relaxed">
        {project.tagline}
      </p>

      <p className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
        {project.links.live && (
          <a href={project.links.live} className="text-gold hover:underline">
            Live site ↗
          </a>
        )}
        {project.links.github && (
          <a href={project.links.github} className="text-gold hover:underline">
            Source code ↗
          </a>
        )}
      </p>

      <h2 className="font-display text-cream mt-12 text-2xl">The problem</h2>
      <p className="text-cream/85 mt-3 leading-relaxed">{project.problem}</p>

      <h2 className="font-display text-cream mt-10 text-2xl">What I built</h2>
      <ul className="mt-3 space-y-3">
        {project.build.map((item) => (
          <li key={item} className="text-cream/85 flex gap-3 leading-relaxed">
            <span aria-hidden className="text-gold">
              ◆
            </span>
            {item}
          </li>
        ))}
      </ul>

      <h2 className="font-display text-cream mt-10 text-2xl">Stack</h2>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="border-cream/20 text-cream/85 rounded border px-2.5 py-1"
          >
            {tech}
          </li>
        ))}
      </ul>

      <h2 className="font-display text-cream mt-10 text-2xl">Proof points</h2>
      <ul className="mt-3 space-y-2">
        {project.metrics.map((m) => (
          <li key={m} className="text-cream/85 flex gap-3 leading-relaxed">
            <span aria-hidden className="text-gold">
              ◆
            </span>
            {m}
          </li>
        ))}
      </ul>

      <p className="border-cream/10 mt-14 border-t pt-6 text-sm">
        <Link href="/#featured-projects" className="text-gold hover:underline">
          ← Back to the board
        </Link>
      </p>
    </article>
  );
}
