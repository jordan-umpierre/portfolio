export const site = {
  name: "Jordan Umpierre",
  tagline: "Full-stack software engineer",
  location: "Kansas City, MO",
  email: "umpierrejordan@gmail.com",
  github: "https://github.com/jordan-umpierre",
  linkedin: "https://www.linkedin.com/in/jordan-umpierre",
  /** Set NEXT_PUBLIC_SITE_URL on Vercel; falls back for local dev. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Full-stack software engineer in Kansas City — React, TypeScript, Node, Python, and AI integration. Real deployed projects and real client work.",
} as const;
