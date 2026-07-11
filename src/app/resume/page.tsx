import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume for ${site.name} — full-stack software engineer in Kansas City.`,
  alternates: { canonical: "/resume" },
};

export const dynamic = "force-static";

function Entry({
  title,
  meta,
  bullets,
}: {
  title: string;
  meta: string;
  bullets: string[];
}) {
  return (
    <div className="mt-5">
      <h3 className="text-ink font-semibold">{title}</h3>
      <p className="text-charcoal/80 text-sm">{meta}</p>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span aria-hidden>–</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-ink/20 font-display text-ink mt-8 border-b pb-1 text-lg tracking-wide uppercase">
      {children}
    </h2>
  );
}

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="mb-6 flex flex-wrap items-center gap-4">
        <a
          href="/resume.pdf"
          className="bg-gold text-felt-deep hover:bg-gold-deep hover:text-cream rounded px-5 py-2.5 font-medium"
        >
          Download PDF
        </a>
        <span className="text-cream/60 text-sm">
          One page. The HTML below matches it.
        </span>
      </p>

      <article className="border-ink/15 bg-cream text-ink rounded-md border px-8 py-10 shadow-lg">
        <header>
          <h1 className="font-display text-3xl">{site.name}</h1>
          <p className="text-charcoal/85 mt-1 text-sm">
            {site.location} · US Citizen · umpierrejordan@gmail.com ·
            linkedin.com/in/jordan-umpierre · github.com/jordan-umpierre
          </p>
        </header>

        <H2>Experience</H2>
        <Entry
          title="Freelance Web Developer — Shoe Express Shoe Repair & EuroCoons Cattery"
          meta="Overland Park, KS · 2026 – Present"
          bullets={[
            "Shipped a custom six-page SPA with React 18, TypeScript, and Tailwind CSS for a local business (shoeexpressrepair.com), implementing per-page SEO with React Helmet and JSON-LD LocalBusiness schema.",
            "Built a Netlify Forms contact pipeline and an environment-variable-driven Google Maps integration for store hours and routing.",
            "Performing a full SEO audit and site rebuild for an international Maine Coon cattery, including a 301 redirect map and structured data (in progress).",
          ]}
        />
        <Entry
          title="Manager — Minsky's Pizza"
          meta="Lenexa, KS · August 2019 – Present"
          bullets={[
            "Lead shift teams of 10–26 staff serving 350+ customers on high-volume nights, consistently meeting revenue and ticket-time targets.",
            "Trained and onboarded 30+ new hires across host, server, and kitchen roles, advancing from host to manager over seven years of continuous employment.",
          ]}
        />

        <H2>Projects</H2>
        <Entry
          title="Freightline App — React, Node/Express, PostgreSQL, MongoDB, AWS S3, WebSockets"
          meta="freightline-app.vercel.app"
          bullets={[
            "Built a full-stack freight-operations web app with transaction-safe load status changes and role-based access for drivers versus dispatchers.",
            "Split database workloads for performance — PostgreSQL for reliable transaction processing, MongoDB for high-volume append-only GPS telemetry.",
            "Implemented live tracking over WebSockets and ensured production reliability with 65 automated tests (46 Jest/Supertest backend, 19 Vitest frontend).",
          ]}
        />
        <Entry
          title="Sentinel Ops Dashboard — React, TypeScript, FastAPI, PostgreSQL, WebSockets, Docker"
          meta="sentinel-ops-flame.vercel.app"
          bullets={[
            "Built a CI/CD pipeline with GitHub Actions running a 93-test validation suite against a live database, preventing breaking changes from reaching production.",
            "Developed a real-time operations console for map-based asset monitoring, enforcing strict incident workflows via finite-state-machine logic.",
            "Integrated an OpenAI GPT-4o-mini triage assistant behind a swappable provider interface to summarize active incidents, with TTL database caching to reduce API costs.",
          ]}
        />
        <Entry
          title="Telco Customer Churn ML (WGU Capstone) — Python, pandas, scikit-learn"
          meta="End-to-end ML pipeline"
          bullets={[
            "Built an end-to-end churn-prediction pipeline — data cleaning, encoding, feature scaling, stratified splitting, and model tuning.",
            "Evaluated performance with cross-validation and holdout testing to produce a reproducible ML workflow for business-focused decision support.",
          ]}
        />

        <H2>Skills</H2>
        <ul className="mt-3 space-y-1 text-sm leading-relaxed">
          <li>
            <strong>Languages:</strong> JavaScript, TypeScript, Java, Python,
            SQL, C++, HTML, CSS
          </li>
          <li>
            <strong>Frontend:</strong> React, Vite, Tailwind CSS, TanStack
            Query, Leaflet
          </li>
          <li>
            <strong>Backend:</strong> Node.js, Express, FastAPI, Spring Boot,
            REST APIs, WebSockets
          </li>
          <li>
            <strong>Data & Cloud:</strong> PostgreSQL, MongoDB, MySQL, AWS S3,
            Docker, Vercel, Render, Neon, Linux
          </li>
          <li>
            <strong>DevOps & Testing:</strong> CI/CD (GitHub Actions), Agile,
            Jest, Vitest, pytest, Git
          </li>
        </ul>

        <H2>Education & Certifications</H2>
        <div className="mt-3 text-sm leading-relaxed">
          <p>
            <strong>
              Western Governors University — B.S. Computer Science
            </strong>{" "}
            · Graduated March 2026
          </p>
          <p className="mt-1">
            Capstone: Telco Customer Churn ML — end-to-end churn-prediction
            pipeline (Python, pandas, scikit-learn)
          </p>
          <p className="mt-1">
            LPI Linux Essentials · ITIL 4 Foundation · WGU Micro-Credentials:
            Back-End Development, Java Development, AI Optimization
          </p>
        </div>
      </article>
    </div>
  );
}
