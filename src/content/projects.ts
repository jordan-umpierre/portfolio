export type Band =
  | "brown"
  | "ltblue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "dkblue";

export type ProjectStatus = "live" | "in-progress" | "in-development";

export interface Project {
  slug: string;
  name: string;
  role: "flagship" | "client" | "supporting";
  band: Band;
  status: ProjectStatus;
  /** Short badge text; only for non-live statuses. */
  statusLabel?: string;
  tagline: string;
  problem: string;
  build: string[];
  stack: string[];
  metrics: string[];
  links: { live?: string; github?: string };
  year: string;
}

export const projects: Project[] = [
  {
    slug: "freightline",
    name: "Freightline",
    role: "flagship",
    band: "red",
    status: "live",
    tagline:
      "Real-time freight operations platform — live GPS tracking, role-based dispatch, and transaction-safe load management.",
    problem:
      "Freight dispatch runs on state that changes by the minute: loads get assigned, drivers move, statuses flip. Freightline models that world end-to-end — dispatchers manage loads while drivers report position and status in real time, with the data layer split to match the workload.",
    build: [
      "Full-stack app with role-based access separating driver and dispatcher capabilities, and transaction-safe load status transitions so a load can never end up in an inconsistent state.",
      "Polyglot persistence by design: PostgreSQL handles transactional load and user data; MongoDB absorbs high-volume, append-only GPS telemetry without contending with the relational workload.",
      "Live map tracking over WebSockets, with document uploads (BOLs, PODs) stored on AWS S3.",
      "65 automated tests — 46 Jest/Supertest on the backend, 19 Vitest on the frontend — run in CI before every deploy.",
    ],
    stack: [
      "React",
      "Node/Express",
      "PostgreSQL",
      "MongoDB",
      "WebSockets",
      "AWS S3",
    ],
    metrics: [
      "65 automated tests (46 backend, 19 frontend)",
      "Live deploy with demo accounts (Vercel + Railway)",
      "Dual-database architecture split by workload",
    ],
    links: {
      live: "https://freightline-app.vercel.app",
      github: "https://github.com/jordan-umpierre/Freightline-App",
    },
    year: "2025",
  },
  {
    slug: "sentinel-ops",
    name: "Sentinel Ops",
    role: "flagship",
    band: "red",
    status: "live",
    tagline:
      "Real-time operations console with strict incident workflows, RBAC, and an AI triage assistant — 93 tests in CI.",
    problem:
      "Operations dashboards fail when incident state gets sloppy — tickets skip steps, stale data misleads responders. Sentinel Ops enforces incident lifecycle as a finite-state machine and keeps the map, feed, and metrics live over WebSockets.",
    build: [
      "React + TypeScript frontend over a FastAPI backend, with role-based access control gating who can acknowledge, escalate, and resolve incidents.",
      "Incident workflows modeled as a finite-state machine so invalid transitions are impossible at the API layer, not just hidden in the UI.",
      "OpenAI GPT-4o-mini triage assistant that summarizes active incidents, built behind a swappable provider interface with TTL database caching to keep API costs bounded.",
      "GitHub Actions CI/CD running a 93-test suite against a live database on every push — breaking changes never reach production.",
    ],
    stack: [
      "React",
      "TypeScript",
      "FastAPI",
      "PostgreSQL",
      "WebSockets",
      "Docker",
      "OpenAI API",
    ],
    metrics: [
      "93-test CI suite run against a live database",
      "LLM integration with provider abstraction + response caching",
      "Live deploy (Vercel + Render)",
    ],
    links: {
      live: "https://sentinel-ops-flame.vercel.app",
      github: "https://github.com/jordan-umpierre/sentinel-ops-dashboard",
    },
    year: "2025",
  },
  {
    slug: "minskys-ops",
    name: "Minsky's Ops",
    role: "flagship",
    band: "dkblue",
    status: "in-development",
    statusLabel: "In Development 2026",
    tagline:
      "Demand forecasting + an agentic ops copilot for pizza-restaurant operations — built by the person who placed those orders for seven years.",
    problem:
      "Every week for seven years I managed the ordering, staffing, and rushes of a high-volume pizza restaurant. This project turns that domain knowledge into software: forecast demand from order history, then let an AI copilot draft the weekly truck order, explain its reasoning, and flag anomalies.",
    build: [
      "Demand forecasting service in Python (FastAPI + statsforecast/scikit-learn) trained on domain-grounded order data — day-of-week mix, seasonality, weather effects I managed by hand for years.",
      "Agentic copilot using Claude API tool use and an MCP server, with RAG over order history — it drafts orders, cites the data behind them, and surfaces anomalies.",
      "React dashboard, Docker, GitHub Actions CI, and a deployed demo.",
    ],
    stack: [
      "Python",
      "FastAPI",
      "scikit-learn",
      "Claude API",
      "MCP",
      "RAG",
      "React",
      "Docker",
    ],
    metrics: [
      "Grounded in 7 years of real restaurant operations experience",
      "LLM agent + tool use + MCP server architecture",
    ],
    links: {},
    year: "2026",
  },
  {
    slug: "cart-scout",
    name: "Cart-Scout",
    role: "supporting",
    band: "green",
    status: "live",
    tagline:
      "Price-tracking web app that watches product listings and surfaces deals.",
    problem:
      "Manually re-checking product pages for price drops is a chore computers should do. Cart-Scout tracks listings, records price history, and makes the trend visible at a glance.",
    build: [
      "Full-stack price tracker with scheduled checks, price history, and a clean dashboard for watched items.",
      "Deployed and documented end-to-end — the repo emphasizes setup, architecture, and honest limitations.",
    ],
    stack: ["React", "Node", "PostgreSQL", "Vercel"],
    metrics: ["Live deploy", "Documentation-first repo"],
    links: {
      live: "https://cart-scout.vercel.app",
    },
    year: "2025",
  },
  {
    slug: "tandem",
    name: "Tandem",
    role: "supporting",
    band: "green",
    status: "in-progress",
    statusLabel: "In Progress",
    tagline:
      "Mobile app for deciding what to watch together — React Native + Supabase, powered by TMDB.",
    problem:
      "Picking a movie with someone else is a negotiation. Tandem is a mobile app where two people swipe and match on what to watch — my React Native and mobile-platform story.",
    build: [
      "Expo/React Native app with Supabase for auth and data, and the TMDB API for film metadata.",
      "In active development — the honest current state, not a padded claim.",
    ],
    stack: ["React Native", "Expo", "Supabase", "TypeScript", "TMDB API"],
    metrics: ["Mobile + BaaS architecture"],
    links: {},
    year: "2026",
  },
  {
    slug: "shoe-express",
    name: "Shoe Express Repair",
    role: "client",
    band: "pink",
    status: "live",
    tagline:
      "Production website for a Kansas City shoe-repair shop — six pages, per-page SEO, live at shoeexpressrepair.com.",
    problem:
      "A local repair shop needed a real web presence customers could find. I built and shipped their production site as freelance client work — requirements, revisions, launch, and all.",
    build: [
      "Six-page single-page application in React 18 + TypeScript + Tailwind CSS, deployed to production on the client's own domain.",
      "Per-page SEO with structured data: React Helmet metadata and JSON-LD LocalBusiness schema.",
      "Netlify Forms contact pipeline and an environment-variable-driven Google Maps integration for store hours and directions.",
    ],
    stack: ["React 18", "TypeScript", "Tailwind CSS", "Netlify"],
    metrics: [
      "Live production client site",
      "JSON-LD LocalBusiness structured data",
    ],
    links: {
      live: "https://shoeexpressrepair.com",
    },
    year: "2026",
  },
  {
    slug: "eurocoons",
    name: "EuroCoons Cattery",
    role: "client",
    band: "pink",
    status: "in-progress",
    statusLabel: "Delivery In Progress",
    tagline:
      "Consolidating a luxury cattery's three aging websites (144 pages) into one fast, SEO-preserving Next.js site.",
    problem:
      "A boutique European Maine Coon cattery had its online presence split across three template builders — a 86-page Jimdo site, a 52-page WordPress site, and a Wix site — dividing search authority three ways and undercutting a premium brand. I'm rebuilding it as one editorial-quality Next.js site that keeps the earned SEO.",
    build: [
      "Content migration at scale: scraped and inventoried all 144 legacy pages into structured data, built a media manifest, and curated production assets from it.",
      "SEO-preserving architecture: route registry, canonical metadata, sitemap/robots generation, security headers, and a verified 301 redirect map so decades of search standing transfer instead of evaporating.",
      "Luxury editorial design system — Cormorant Garamond/Manrope type, film-grain texture, numbered sections, staggered spreads — with scroll reveals that never hide content from crawlers, no-JS, or reduced-motion visitors.",
      "Truthful content policy: every public claim traces to the client's own source material; no invented ratings, prices, or schema.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS v4", "Vercel", "Playwright"],
    metrics: [
      "144 legacy pages consolidated into 28 static routes",
      "Verified-only 301 redirect promotion workflow",
      "Client delivery in progress",
    ],
    links: {},
    year: "2026",
  },
];

export const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
