import type { Band } from "./projects";

/**
 * Single source of truth for the whole portfolio: 28 board spaces.
 * Drives the classic sections and /project/[slug] now, and the 3D board at M2.
 * Corners are fixed at indices 0, 7, 14, 21.
 */

interface BaseSpace {
  index: number;
  slug: string;
  title: string;
}

export interface CornerSpace extends BaseSpace {
  kind: "corner";
  kicker: string;
  body: string;
  cta?: { label: string; href: string };
}

export interface ProjectSpace extends BaseSpace {
  kind: "project" | "client";
  projectSlug: string;
}

export interface StorySpace extends BaseSpace {
  kind: "story";
  band?: Band;
  kicker: string;
  body: string[];
}

export interface RailroadSpace extends BaseSpace {
  kind: "railroad" | "utility";
  items: string[];
}

export interface DeckSpace extends BaseSpace {
  kind: "deck";
  deck: "chest" | "chance";
  cards: { title: string; body: string }[];
}

export interface FlavorSpace extends BaseSpace {
  kind: "flavor";
  body: string;
}

export interface ActionSpace extends BaseSpace {
  kind: "action";
  body: string;
  cta: { label: string; href: string };
}

export interface ContactSpace extends BaseSpace {
  kind: "contact";
  body: string;
}

export type BoardSpace =
  | CornerSpace
  | ProjectSpace
  | StorySpace
  | RailroadSpace
  | DeckSpace
  | FlavorSpace
  | ActionSpace
  | ContactSpace;

export const board: BoardSpace[] = [
  {
    index: 0,
    kind: "corner",
    slug: "go",
    title: "GO",
    kicker: "Start here",
    body: "Welcome to the board. Every space is a real piece of how I became a software engineer: seven years running restaurant shifts, a self-funded CS degree, client sites in production, and full-stack apps with real test suites. Take a lap.",
  },
  {
    index: 1,
    kind: "story",
    slug: "minskys-pizza",
    title: "Minsky's Pizza — 7 Years",
    band: "brown",
    kicker: "Leadership",
    body: [
      "Since August 2019 I've managed shifts at Minsky's Pizza in Lenexa, Kansas — teams of 10 to 26 people serving 350+ customers on high-volume nights, hitting revenue and ticket-time targets while the rush is live.",
      "I started as a host and worked up to manager, training and onboarding 30+ new hires along the way. That's seven years of accountability, prioritization under pressure, and leading people — the parts of engineering jobs no bootcamp teaches.",
    ],
  },
  {
    index: 2,
    kind: "deck",
    slug: "community-chest-1",
    title: "Community Chest",
    deck: "chest",
    cards: [
      {
        title: "Advance from Host to Manager",
        body: "Seven years of continuous employment at one company, promoted from host to shift manager. Collect: a work ethic references will vouch for.",
      },
      {
        title: "Training Grant Awarded",
        body: "Onboarded and trained 30+ new hires across host, server, and kitchen roles. References available on request.",
      },
    ],
  },
  {
    index: 3,
    kind: "story",
    slug: "kansas-city",
    title: "Kansas City, MO",
    kicker: "Location",
    body: [
      "Based in Kansas City. Open to on-site or hybrid roles in the KC metro, and to fully remote roles anywhere in the US. US citizen — no sponsorship needed.",
    ],
  },
  {
    index: 4,
    kind: "story",
    slug: "wgu-computer-science",
    title: "WGU — B.S. Computer Science",
    kicker: "Education",
    body: [
      "Bachelor of Science in Computer Science from Western Governors University, awarded March 2026 — self-funded and completed while working full-time as a restaurant manager.",
      "Capstone: Telco Customer Churn ML — an end-to-end churn-prediction pipeline in Python with pandas and scikit-learn, from data cleaning and feature scaling through model tuning, cross-validation, and holdout testing.",
    ],
  },
  {
    index: 5,
    kind: "story",
    slug: "certifications",
    title: "Certifications",
    kicker: "Credentials",
    body: [
      "LPI Linux Essentials and ITIL 4 Foundation, plus WGU micro-credentials in Back-End Development, Java Development, and AI Optimization.",
    ],
  },
  {
    index: 6,
    kind: "railroad",
    slug: "frontend-line",
    title: "Frontend Line",
    items: [
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "React Native",
      "Vite",
      "TanStack Query",
    ],
  },
  {
    index: 7,
    kind: "corner",
    slug: "debugging-stories",
    title: "Just Visiting",
    kicker: "Debugging stories",
    body: "Every project on this board came with time in debugging jail: WebSocket connections that behaved differently in production, ORM transactions that weren't as atomic as they looked, an Expo SDK upgrade that broke device builds. I keep the war stories for interviews — ask me about the one with the two databases.",
  },
  {
    index: 8,
    kind: "client",
    slug: "shoe-express",
    title: "Shoe Express Repair",
    projectSlug: "shoe-express",
  },
  {
    index: 9,
    kind: "deck",
    slug: "chance-1",
    title: "Chance",
    deck: "chance",
    cards: [
      {
        title: "Friday Night Rush",
        body: "You have managed 350+ covers on a Friday night. A production incident no longer raises your heart rate. Advance directly to on-call rotation.",
      },
      {
        title: "Pay Tuition (Yourself)",
        body: "Self-funded an entire CS degree while working full-time. Do not pass GO until the capstone is graded.",
      },
    ],
  },
  {
    index: 10,
    kind: "client",
    slug: "eurocoons",
    title: "EuroCoons Cattery",
    projectSlug: "eurocoons",
  },
  {
    index: 11,
    kind: "project",
    slug: "cart-scout",
    title: "Cart-Scout",
    projectSlug: "cart-scout",
  },
  {
    index: 12,
    kind: "railroad",
    slug: "backend-line",
    title: "Backend Line",
    items: [
      "Node.js / Express",
      "FastAPI",
      "Spring Boot",
      "REST APIs",
      "WebSockets",
      "Python",
      "Java",
    ],
  },
  {
    index: 13,
    kind: "project",
    slug: "tandem",
    title: "Tandem",
    projectSlug: "tandem",
  },
  {
    index: 14,
    kind: "corner",
    slug: "off-the-clock",
    title: "Off the Clock",
    kicker: "Free parking",
    body: "When I'm not shipping: movies (enough of a film nerd to be building a watch-together app), good coffee, and the occasional shift slinging the best pizza in Kansas City. Yes, I still eat it.",
  },
  {
    index: 15,
    kind: "project",
    slug: "freightline",
    title: "Freightline",
    projectSlug: "freightline",
  },
  {
    index: 16,
    kind: "deck",
    slug: "chance-2",
    title: "Chance",
    deck: "chance",
    cards: [
      {
        title: "Bank Error in Your Favor",
        body: "Turns out seven years of drafting weekly food orders by intuition is a demand-forecasting dataset. Collect one AI flagship project (in development).",
      },
      {
        title: "Take a Ride on the Frontend Line",
        body: "This entire site is a working sample: Next.js, TypeScript, Tailwind, static-rendered, tested with Playwright. View source encouraged.",
      },
    ],
  },
  {
    index: 17,
    kind: "project",
    slug: "sentinel-ops",
    title: "Sentinel Ops",
    projectSlug: "sentinel-ops",
  },
  {
    index: 18,
    kind: "railroad",
    slug: "data-line",
    title: "Data Line",
    items: ["PostgreSQL", "MongoDB", "MySQL", "Supabase", "AWS S3", "SQL"],
  },
  {
    index: 19,
    kind: "utility",
    slug: "the-toolbox",
    title: "The Toolbox",
    items: [
      "Git",
      "Linux",
      "Docker",
      "Vercel",
      "CI/CD (GitHub Actions)",
      "Jest / Vitest / pytest / Playwright",
      "AI-assisted engineering (Claude Code)",
    ],
  },
  {
    index: 20,
    kind: "action",
    slug: "resume",
    title: "Resume",
    body: "One page, no fluff. View it in the browser or take the PDF with you.",
    cta: { label: "View resume", href: "/resume" },
  },
  {
    index: 21,
    kind: "corner",
    slug: "go-to-github",
    title: "GO TO GITHUB",
    kicker: "Go directly to the code",
    body: "Do not pass GO. Do not collect $200. Read the commit history instead — the repos back up every claim on this board.",
    cta: {
      label: "github.com/jordan-umpierre",
      href: "https://github.com/jordan-umpierre",
    },
  },
  {
    index: 22,
    kind: "railroad",
    slug: "cloud-ai-line",
    title: "Cloud & AI Line",
    items: [
      "Vercel",
      "AWS",
      "Docker",
      "OpenAI API",
      "Claude API",
      "MCP",
      "pandas / scikit-learn",
    ],
  },
  {
    index: 23,
    kind: "deck",
    slug: "community-chest-2",
    title: "Community Chest",
    deck: "chest",
    cards: [
      {
        title: "Client Work Matures",
        body: "Two real businesses trusted me with their websites — one live in production, one rebuild in delivery. Freelance invoices are the best code review.",
      },
      {
        title: "Second Prize in a Beauty Contest",
        body: "This board is an homage, not a clone — no trademarks were harmed. The engineering underneath it is the actual exhibit.",
      },
    ],
  },
  {
    index: 24,
    kind: "flavor",
    slug: "coffee-tax",
    title: "Coffee Tax",
    body: "Pay ☕ × 2. Non-negotiable before code review.",
  },
  {
    index: 25,
    kind: "story",
    slug: "what-im-looking-for",
    title: "What I'm Looking For",
    kicker: "The pitch",
    body: [
      "Early-career software engineering roles — full-stack, backend, or AI-integration — where shipping and ownership matter. Kansas City metro or remote (US). Available now.",
      "I build with modern AI tooling and I'm open about it: the leverage is real, and so is the engineering judgment it takes to use it well. Everything on this board is truthful — real deploys, real clients, real test counts.",
    ],
  },
  {
    index: 26,
    kind: "contact",
    slug: "lets-talk",
    title: "Let's Talk",
    body: "If you're hiring engineers who ship — or you just want to argue about pizza toppings — my inbox is open.",
  },
  {
    index: 27,
    kind: "project",
    slug: "minskys-ops-space",
    title: "Minsky's Ops",
    projectSlug: "minskys-ops",
  },
];
