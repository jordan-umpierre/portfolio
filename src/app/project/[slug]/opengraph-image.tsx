import { ImageResponse } from "next/og";
import { projectBySlug, projects } from "@/content/projects";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Project title deed card";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

const bandColor: Record<string, string> = {
  brown: "#6b4a36",
  ltblue: "#7fa6b8",
  pink: "#b06a82",
  orange: "#c87d4f",
  red: "#a5443a",
  yellow: "#d9b054",
  green: "#4e7a5a",
  dkblue: "#34506e",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug.get(slug);
  if (!project) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b2c24",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 880,
          height: 520,
          background: "#f3eddc",
          borderRadius: 16,
          border: "3px solid #23201a",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: bandColor[project.band],
            color: "#f3eddc",
            padding: "28px 44px",
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: 6, opacity: 0.85 }}>
            {`TITLE DEED · ${project.year}`}
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, marginTop: 4 }}>
            {project.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexGrow: 1,
            padding: "36px 44px",
            color: "#23201a",
          }}
        >
          <div style={{ fontSize: 30, lineHeight: 1.4 }}>{project.tagline}</div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 24,
              color: "#9c7a3c",
            }}
          >
            <div>{project.stack.slice(0, 4).join(" · ")}</div>
            <div>{site.name}</div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
