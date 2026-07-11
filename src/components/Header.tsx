import Link from "next/link";
import { site } from "@/content/site";

const nav = [
  { href: "/#featured-projects", label: "Projects" },
  { href: "/#client-work", label: "Client Work" },
  { href: "/#skills", label: "Skills" },
  { href: "/#experience", label: "Experience" },
  { href: "/resume", label: "Resume" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream/10 bg-felt-deep/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3">
        <Link
          href="/"
          className="font-display text-lg tracking-wide text-cream hover:text-gold"
        >
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cream/80">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
