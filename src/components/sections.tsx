import Link from "next/link";
import { board } from "@/content/board";
import type {
  ActionSpace,
  ContactSpace,
  CornerSpace,
  DeckSpace,
  FlavorSpace,
  RailroadSpace,
  StorySpace,
} from "@/content/board";
import { projectBySlug, projects } from "@/content/projects";
import { site } from "@/content/site";
import { DeedCard } from "./DeedCard";

function space<T>(slug: string): T {
  const s = board.find((s) => s.slug === slug);
  if (!s) throw new Error(`unknown board space: ${slug}`);
  return s as T;
}

function SectionHeading({
  kicker,
  title,
  id,
}: {
  kicker: string;
  title: string;
  id?: string;
}) {
  return (
    <header data-reveal className="mb-8" id={id}>
      <p className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
        {kicker}
      </p>
      <h2 className="font-display text-cream mt-1 text-3xl sm:text-4xl">
        {title}
      </h2>
    </header>
  );
}

export function Hero() {
  const go = space<CornerSpace>("go");
  const pitch = space<StorySpace>("what-im-looking-for");
  return (
    <section id="go" className="felt-surface">
      <div className="mx-auto max-w-5xl px-5 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <p className="text-gold text-sm font-semibold tracking-[0.3em] uppercase">
          {site.location} · Remote (US)
        </p>
        <h1 className="font-display text-cream mt-4 max-w-3xl text-4xl leading-tight sm:text-6xl">
          {site.name} builds software that ships — and stays up.
        </h1>
        <p className="text-cream/85 mt-6 max-w-2xl text-lg leading-relaxed">
          Full-stack engineer with real deployed apps, real client work, and
          seven years of leading teams under pressure. {pitch.body[0]}
        </p>
        <p className="mt-8 flex flex-wrap gap-4">
          <Link
            href="#featured-projects"
            className="bg-gold text-felt-deep hover:bg-gold-deep hover:text-cream rounded px-5 py-2.5 font-medium"
          >
            See the work
          </Link>
          <Link
            href="/resume"
            className="border-gold text-gold hover:bg-gold hover:text-felt-deep rounded border px-5 py-2.5 font-medium"
          >
            Resume
          </Link>
          <a
            href={site.github}
            className="border-cream/30 text-cream/90 hover:border-cream rounded border px-5 py-2.5 font-medium"
          >
            GitHub ↗
          </a>
        </p>
        <p className="text-cream/60 mt-10 max-w-2xl text-sm">{go.body}</p>
      </div>
    </section>
  );
}

export function FeaturedProjects() {
  const featured = [
    "freightline",
    "sentinel-ops",
    "minskys-ops",
    "cart-scout",
    "tandem",
  ];
  return (
    <section id="featured-projects" className="mx-auto max-w-5xl px-5 py-16">
      <SectionHeading kicker="Properties" title="Featured Projects" />
      <div className="grid gap-6 sm:grid-cols-2">
        {featured.map((slug) => {
          const p = projectBySlug.get(slug);
          return p ? <DeedCard key={slug} project={p} /> : null;
        })}
      </div>
    </section>
  );
}

export function ClientWork() {
  const clients = projects.filter((p) => p.role === "client");
  return (
    <section id="client-work" className="mx-auto max-w-5xl px-5 py-16">
      <SectionHeading
        kicker="Real businesses, real stakes"
        title="Client Work"
      />
      <div className="grid gap-6 sm:grid-cols-2">
        {clients.map((p) => (
          <DeedCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}

export function Skills() {
  const lines = [
    space<RailroadSpace>("frontend-line"),
    space<RailroadSpace>("backend-line"),
    space<RailroadSpace>("data-line"),
    space<RailroadSpace>("cloud-ai-line"),
    space<RailroadSpace>("the-toolbox"),
  ];
  return (
    <section id="skills" className="mx-auto max-w-5xl px-5 py-16">
      <SectionHeading kicker="Ride all four lines" title="Skills" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lines.map((line) => (
          <div
            key={line.slug}
            data-reveal
            id={line.slug}
            className="border-cream/15 bg-felt rounded-md border p-5"
          >
            <h3 className="font-display text-gold text-lg">
              {line.kind === "utility" ? "⚙ " : "🚂 "}
              {line.title}
            </h3>
            <ul className="text-cream/85 mt-3 flex flex-wrap gap-1.5 text-sm">
              {line.items.map((item) => (
                <li
                  key={item}
                  className="border-cream/15 rounded border px-2 py-0.5"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Experience() {
  const minskys = space<StorySpace>("minskys-pizza");
  const kc = space<StorySpace>("kansas-city");
  return (
    <section id="experience" className="mx-auto max-w-5xl px-5 py-16">
      <SectionHeading
        kicker="The operator story"
        title="Experience & Leadership"
      />
      <div className="grid gap-8 sm:grid-cols-[2fr_1fr]">
        <div data-reveal id={minskys.slug} className="space-y-4">
          <h3 className="font-display text-cream text-xl">{minskys.title}</h3>
          {minskys.body.map((para) => (
            <p key={para} className="text-cream/85 leading-relaxed">
              {para}
            </p>
          ))}
          <p className="text-cream/85 leading-relaxed">
            Alongside the day job: freelance web development for two real
            clients — a production site live at shoeexpressrepair.com and a full
            SEO-preserving rebuild for an international cattery (delivery in
            progress).
          </p>
        </div>
        <div
          data-reveal
          id={kc.slug}
          className="border-cream/15 bg-felt text-cream/80 h-fit rounded-md border p-5 text-sm leading-relaxed"
        >
          <h3 className="font-display text-gold text-lg">{kc.title}</h3>
          <p className="mt-2">{kc.body[0]}</p>
        </div>
      </div>
    </section>
  );
}

export function Education() {
  const wgu = space<StorySpace>("wgu-computer-science");
  const certs = space<StorySpace>("certifications");
  return (
    <section id="education" className="mx-auto max-w-5xl px-5 py-16">
      <SectionHeading
        kicker="Self-funded, full-time"
        title="Education & Certifications"
      />
      <div className="grid gap-8 sm:grid-cols-[2fr_1fr]">
        <div data-reveal id={wgu.slug} className="space-y-4">
          <h3 className="font-display text-cream text-xl">{wgu.title}</h3>
          {wgu.body.map((para) => (
            <p key={para} className="text-cream/85 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
        <div
          data-reveal
          id={certs.slug}
          className="border-cream/15 bg-felt text-cream/80 h-fit rounded-md border p-5 text-sm leading-relaxed"
        >
          <h3 className="font-display text-gold text-lg">{certs.title}</h3>
          <p className="mt-2">{certs.body[0]}</p>
        </div>
      </div>
    </section>
  );
}

export function Personal() {
  const offClock = space<CornerSpace>("off-the-clock");
  const decks = board.filter((s): s is DeckSpace => s.kind === "deck");
  const debugging = space<CornerSpace>("debugging-stories");
  const coffee = space<FlavorSpace>("coffee-tax");
  return (
    <section id="off-the-clock" className="mx-auto max-w-5xl px-5 py-16">
      <SectionHeading kicker="Free parking" title={offClock.title} />
      <p data-reveal className="text-cream/85 max-w-2xl leading-relaxed">
        {offClock.body}
      </p>
      <p
        data-reveal
        id={debugging.slug}
        className="text-cream/85 mt-4 max-w-2xl leading-relaxed"
      >
        <span className="font-display text-gold">{debugging.kicker}: </span>
        {debugging.body}
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {decks
          .flatMap((deck) =>
            deck.cards.map((card) => ({ deck: deck.deck, card })),
          )
          .map(({ deck, card }) => (
            <figure
              key={card.title}
              data-reveal
              className={`rounded-md border p-4 text-sm ${
                deck === "chance"
                  ? "border-band-orange/60 bg-band-orange/10"
                  : "border-band-yellow/60 bg-band-yellow/10"
              }`}
            >
              <figcaption className="text-cream/60 text-[0.65rem] font-semibold tracking-[0.2em] uppercase">
                {deck === "chance" ? "Chance" : "Community Chest"}
              </figcaption>
              <p className="font-display text-gold mt-1 text-base">
                {card.title}
              </p>
              <p className="text-cream/80 mt-2 leading-relaxed">{card.body}</p>
            </figure>
          ))}
      </div>
      <p data-reveal id={coffee.slug} className="text-cream/50 mt-8 text-sm">
        {coffee.title}: {coffee.body}
      </p>
    </section>
  );
}

export function Contact() {
  const talk = space<ContactSpace>("lets-talk");
  const pitch = space<StorySpace>("what-im-looking-for");
  const resume = space<ActionSpace>("resume");
  const github = space<CornerSpace>("go-to-github");
  return (
    <section id="contact" className="felt-surface">
      <div className="mx-auto max-w-5xl px-5 py-20">
        <SectionHeading
          kicker="Advance to GO"
          title={talk.title}
          id="what-im-looking-for"
        />
        <p data-reveal className="text-cream/85 max-w-2xl leading-relaxed">
          {pitch.body[1]}
        </p>
        <p data-reveal className="text-cream/85 mt-4 max-w-2xl leading-relaxed">
          {talk.body}
        </p>
        <p data-reveal className="mt-8 flex flex-wrap gap-4">
          <a
            href={`mailto:${site.email}`}
            className="bg-gold text-felt-deep hover:bg-gold-deep hover:text-cream rounded px-5 py-2.5 font-medium"
          >
            {site.email}
          </a>
          <a
            href={site.linkedin}
            className="border-gold text-gold hover:bg-gold hover:text-felt-deep rounded border px-5 py-2.5 font-medium"
          >
            LinkedIn ↗
          </a>
          <a
            href={github.cta!.href}
            id={github.slug}
            className="border-cream/30 text-cream/90 hover:border-cream rounded border px-5 py-2.5 font-medium"
          >
            {github.cta!.label} ↗
          </a>
          <Link
            href={resume.cta.href}
            id={resume.slug}
            className="border-cream/30 text-cream/90 hover:border-cream rounded border px-5 py-2.5 font-medium"
          >
            {resume.cta.label}
          </Link>
        </p>
      </div>
    </section>
  );
}
