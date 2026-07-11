import { RevealObserver } from "@/components/RevealObserver";
import {
  ClientWork,
  Contact,
  Education,
  Experience,
  FeaturedProjects,
  Hero,
  Personal,
  Skills,
} from "@/components/sections";
import { site } from "@/content/site";

export const dynamic = "force-static";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Software Engineer",
  email: `mailto:${site.email}`,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kansas City",
    addressRegion: "MO",
    addressCountry: "US",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Western Governors University",
  },
  sameAs: [site.github, site.linkedin],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Hero />
      <FeaturedProjects />
      <ClientWork />
      <Skills />
      <Experience />
      <Education />
      <Personal />
      <Contact />
      <RevealObserver />
    </>
  );
}
