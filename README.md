# Portfolio — Jordan Umpierre

Personal portfolio, themed as a board-game homage: every section of the site is
a space on a 28-space board defined in a single content registry. Milestone 1
(this) is the fully static classic experience; milestone 2 mounts an
interactive 3D board above it as a progressive enhancement.

## Stack

Next.js 16 (App Router, fully static output) · React 19 · TypeScript ·
Tailwind CSS 4 · Playwright · Vercel

## Architecture notes

- **Content registry as single source of truth** — `src/content/board.ts`
  defines all 28 board spaces as a discriminated union;
  `src/content/projects.ts` holds the project case studies. The classic
  sections, `/project/[slug]` pages, OG images, and (later) the 3D board all
  render from the same registry.
- **Static-first, crawler-safe** — every route is prerendered
  (`force-static` / `generateStaticParams`). Scroll reveals are additive: CSS
  keeps all content visible for no-JS, reduced-motion, and crawler visitors,
  enforced by a Playwright test that browses with JavaScript disabled.
- **SEO plumbing** — per-project `generateMetadata`, generated
  title-deed-style OG images (`opengraph-image.tsx`), JSON-LD (`Person` +
  `SoftwareSourceCode`), `sitemap.ts`, `robots.ts`.

## Develop

```sh
pnpm install
pnpm dev              # local dev
pnpm validate-content # registry invariants (28 spaces, corners, link resolution)
pnpm typecheck && pnpm lint
pnpm build && pnpm test:e2e
```

Set `NEXT_PUBLIC_SITE_URL` in production for canonical URLs/sitemap.
