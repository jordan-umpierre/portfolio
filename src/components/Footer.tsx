import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-cream/10 border-t">
      <div className="text-cream/60 mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm">
        <p>
          © {new Date().getFullYear()} {site.name} · {site.location}
        </p>
        <ul className="flex items-center gap-4">
          <li>
            <a href={site.github} className="hover:text-gold">
              GitHub
            </a>
          </li>
          <li>
            <a href={site.linkedin} className="hover:text-gold">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-gold">
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
