import * as THREE from "three";
import { board } from "@/content/board";
import { projectBySlug } from "@/content/projects";
import { BOARD_SIZE, spaceTransforms } from "./geometry";

const TEX = 2048;
const S = TEX / BOARD_SIZE; // world unit → px

const COLORS = {
  felt: "#0b2c24",
  feltDeep: "#071711",
  cream: "#f3eddc",
  ink: "#23201a",
  gold: "#c6a15b",
  goldDeep: "#9c7a3c",
  bands: {
    brown: "#6b4a36",
    ltblue: "#7fa6b8",
    pink: "#b06a82",
    orange: "#c87d4f",
    red: "#a5443a",
    yellow: "#d9b054",
    green: "#4e7a5a",
    dkblue: "#34506e",
  } as Record<string, string>,
};

function displayFont(): string {
  if (typeof document === "undefined") return "serif";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-fraunces")
    .trim();
  return v || "serif";
}

/** Short label for a space, wrapped to fit. */
function labelFor(index: number): string[] {
  const space = board[index];
  const title = space.title.split(" — ")[0].toUpperCase();
  const words = title.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > 10 && line) {
      lines.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function bandFor(index: number): string | null {
  const space = board[index];
  if (space.kind === "project" || space.kind === "client") {
    const p = projectBySlug.get(space.projectSlug);
    return p ? COLORS.bands[p.band] : null;
  }
  if (space.kind === "story" && space.band) return COLORS.bands[space.band];
  return null;
}

function glyphFor(index: number): string | null {
  const space = board[index];
  if (space.kind === "deck") return space.deck === "chance" ? "?" : "☰";
  if (space.kind === "railroad") return "🚂";
  if (space.kind === "utility") return "⚙";
  if (space.kind === "flavor") return "☕";
  if (space.kind === "action") return "📄";
  if (space.kind === "contact") return "✉";
  return null;
}

function grain(ctx: CanvasRenderingContext2D) {
  const n = 3000;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x = Math.random() * TEX;
    const y = Math.random() * TEX;
    ctx.fillStyle =
      Math.random() > 0.5 ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)";
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.restore();
}

export function createBoardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEX;
  const ctx = canvas.getContext("2d")!;
  const serif = displayFont();

  // Felt base with radial vignette
  const g = ctx.createRadialGradient(
    TEX / 2,
    TEX / 2,
    TEX * 0.1,
    TEX / 2,
    TEX / 2,
    TEX * 0.72,
  );
  g.addColorStop(0, COLORS.felt);
  g.addColorStop(1, COLORS.feltDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX, TEX);

  // world (x,z) → px. x → right, z → down (camera looks from +z).
  const px = (x: number) => (x + BOARD_SIZE / 2) * S;

  // Space tiles
  for (let i = 0; i < 28; i++) {
    const t = spaceTransforms[i];
    const x0 = px(t.x - t.w / 2);
    const y0 = px(t.z - t.d / 2);
    const w = t.w * S;
    const h = t.d * S;

    ctx.fillStyle = COLORS.cream;
    ctx.fillRect(x0, y0, w, h);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(x0, y0, w, h);

    ctx.save();
    // Rotate label space so "toward center" is up.
    ctx.translate(px(t.x), px(t.z));
    // side 0 (bottom): center is up → no rotation. left: center is right → -90°… (canvas y is down)
    const rot = [0, -Math.PI / 2, Math.PI, Math.PI / 2][t.side];
    ctx.rotate(rot);
    const lw = (t.side % 2 === 0 ? t.w : t.d) * S; // label-space width
    const lh = (t.side % 2 === 0 ? t.d : t.w) * S;

    const band = bandFor(i);
    const isCorner = i % 7 === 0;
    if (band) {
      ctx.fillStyle = band;
      ctx.fillRect(-lw / 2, -lh / 2, lw, lh * 0.24);
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(-lw / 2, -lh / 2, lw, lh * 0.24);
    }

    ctx.fillStyle = COLORS.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = labelFor(i);
    const fs = isCorner ? 40 : 30;
    ctx.font = `600 ${fs}px ${serif}`;
    const blockTop = band ? -lh / 2 + lh * 0.3 : -lh / 2 + lh * 0.16;
    lines.forEach((line, li) => {
      ctx.fillText(line, 0, blockTop + fs * 0.62 + li * fs * 1.12, lw * 0.92);
    });

    const glyph = glyphFor(i);
    if (glyph) {
      ctx.font = `${isCorner ? 88 : 64}px ${serif}`;
      ctx.fillStyle = COLORS.goldDeep;
      ctx.fillText(glyph, 0, lh * 0.2);
    }
    if (i === 0) {
      ctx.font = `700 30px ${serif}`;
      ctx.fillStyle = COLORS.bands.red;
      ctx.fillText("COLLECT A CAREER", 0, lh * 0.05, lw * 0.9);
      ctx.font = `900 100px ${serif}`;
      ctx.fillText("→", 0, lh * 0.28);
    }
    ctx.restore();
  }

  // Center art
  ctx.save();
  ctx.translate(TEX / 2, TEX / 2);
  ctx.rotate(-Math.PI / 12);
  ctx.fillStyle = COLORS.gold;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 150px ${serif}`;
  ctx.fillText("UMPIERRE", 0, -60);
  ctx.font = `500 44px ${serif}`;
  ctx.fillStyle = COLORS.cream;
  ctx.fillText("FULL-STACK SOFTWARE ENGINEER · KANSAS CITY", 0, 60, TEX * 0.55);
  ctx.font = `500 36px ${serif}`;
  ctx.fillStyle = "rgba(243,237,220,0.55)";
  ctx.fillText(
    "ROLL THE DICE · VISIT A SPACE · HIRE THE TOKEN",
    0,
    130,
    TEX * 0.5,
  );
  ctx.restore();

  grain(ctx);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
