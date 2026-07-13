import * as THREE from "three";
import { board } from "@/content/board";
import { projectBySlug } from "@/content/projects";
import { BOARD_SIZE, spaceTransforms } from "./geometry";

const TEX = 2048;
const S = TEX / BOARD_SIZE; // world unit → px

const COLORS = {
  board: "#b0d19c", // monopoly-green field
  tile: "#efeeda", // light tile face so the ring pops off the field
  ink: "#1d1a15",
  cream: "#f6f1e2",
  mred: "#d6202f",
  mredDeep: "#a6192e",
  gold: "#c6a15b",
  bands: {
    brown: "#955436",
    ltblue: "#a5ddf5",
    pink: "#d93a96",
    orange: "#f7941d",
    red: "#ed1b24",
    yellow: "#ffd900",
    green: "#1fb25a",
    dkblue: "#0072bb",
  } as Record<string, string>,
};

function cssFont(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

/** Wrap a space title to short uppercase lines. */
function labelFor(index: number): string[] {
  const space = board[index];
  const title = space.title.split(" — ")[0].toUpperCase();
  const words = title.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > 11 && line) {
      lines.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/**
 * Every non-corner tile gets a header band — one geometry, color by kind —
 * so the ring reads as a single uniform system.
 */
function bandFor(index: number): string {
  const space = board[index];
  if (space.kind === "project" || space.kind === "client") {
    const p = projectBySlug.get(space.projectSlug);
    return p ? COLORS.bands[p.band] : COLORS.ink;
  }
  if (space.kind === "story") return COLORS.bands[space.band ?? "green"];
  if (space.kind === "railroad") return COLORS.ink;
  if (space.kind === "utility") return "#2e2b26";
  if (space.kind === "deck")
    return space.deck === "chance" ? COLORS.bands.orange : COLORS.bands.ltblue;
  if (space.kind === "flavor") return COLORS.gold;
  if (space.kind === "action") return COLORS.bands.green;
  if (space.kind === "contact") return COLORS.bands.dkblue;
  return COLORS.ink;
}

/** Light bands take ink text, dark bands take cream. */
function bandTextColor(band: string): string {
  const light = new Set([
    COLORS.bands.ltblue,
    COLORS.bands.yellow,
    COLORS.bands.orange,
    COLORS.gold,
  ]);
  return light.has(band) ? COLORS.ink : COLORS.cream;
}

/** Mono bottom caption — the "price line", programmer edition. */
function captionFor(index: number): string {
  const space = board[index];
  switch (space.kind) {
    case "project":
    case "client": {
      const p = projectBySlug.get(space.projectSlug);
      return p ? `M ${p.year}` : "M ///";
    }
    case "railroad":
      return "$ ride --all";
    case "utility":
      return "$ make tools";
    case "deck":
      return "DRAW A CARD";
    case "flavor":
      return "PAY ☕ × 2";
    case "action":
      return "$ open resume";
    case "contact":
      return "$ say hello";
    case "story": {
      const k = (space as { kicker?: string }).kicker;
      return (k ?? "").toUpperCase();
    }
    default:
      return "";
  }
}

/* ---------- tiny drawn icons (uniform ink linework, no emoji) ---------- */

type Ctx = CanvasRenderingContext2D;

function iconCodeTag(ctx: Ctx, s: number, mono: string, color: string) {
  ctx.fillStyle = color;
  ctx.font = `700 ${s}px ${mono}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("</>", 0, 0);
}

function iconBraces(ctx: Ctx, s: number, mono: string, color: string) {
  ctx.fillStyle = color;
  ctx.font = `700 ${s}px ${mono}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("{ }", 0, 0);
}

function iconDatabase(ctx: Ctx, s: number, color: string) {
  const w = s * 1.1;
  const h = s * 1.05;
  const ry = s * 0.22;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.11;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(0, -h / 2 + ry, w / 2, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2 + ry);
  ctx.lineTo(-w / 2, h / 2 - ry);
  ctx.moveTo(w / 2, -h / 2 + ry);
  ctx.lineTo(w / 2, h / 2 - ry);
  ctx.stroke();
  for (const yy of [0, h / 2 - ry]) {
    ctx.beginPath();
    ctx.ellipse(0, yy, w / 2, ry, 0, 0, Math.PI);
    ctx.stroke();
  }
}

function iconCloud(ctx: Ctx, s: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.12;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(-s * 0.32, s * 0.1, s * 0.3, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(-s * 0.05, -s * 0.22, s * 0.36, Math.PI * 0.95, Math.PI * 1.9);
  ctx.arc(s * 0.38, s * 0.02, s * 0.32, Math.PI * 1.35, Math.PI * 0.5);
  ctx.closePath();
  ctx.stroke();
}

function iconPrompt(ctx: Ctx, s: number, mono: string, color: string) {
  ctx.fillStyle = color;
  ctx.font = `700 ${s}px ${mono}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(">_", 0, 0);
}

function iconQuestion(ctx: Ctx, s: number, display: string, color: string) {
  ctx.fillStyle = color;
  ctx.font = `900 ${s * 1.5}px ${display}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", 0, 0);
}

function iconChest(ctx: Ctx, s: number, color: string) {
  const w = s * 1.15;
  const h = s * 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.11;
  ctx.lineJoin = "round";
  // lid
  ctx.strokeRect(-w / 2, -h / 2, w, h * 0.42);
  // body
  ctx.strokeRect(-w / 2, -h / 2 + h * 0.42, w, h * 0.58);
  // clasp
  ctx.fillStyle = color;
  ctx.fillRect(-s * 0.09, -h * 0.12, s * 0.18, h * 0.3);
}

function iconCup(ctx: Ctx, s: number, color: string) {
  const w = s * 0.8;
  const h = s * 0.75;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.11;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(-w / 2 + w * 0.12, h / 2);
  ctx.lineTo(w / 2 - w * 0.12, h / 2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.closePath();
  ctx.stroke();
  // handle
  ctx.beginPath();
  ctx.arc(w / 2 + s * 0.1, -s * 0.05, s * 0.22, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // steam
  ctx.beginPath();
  ctx.moveTo(-s * 0.12, -h / 2 - s * 0.32);
  ctx.quadraticCurveTo(-s * 0.24, -h / 2 - s * 0.16, -s * 0.12, -h / 2 - s * 0.05);
  ctx.moveTo(s * 0.12, -h / 2 - s * 0.32);
  ctx.quadraticCurveTo(0, -h / 2 - s * 0.16, s * 0.12, -h / 2 - s * 0.05);
  ctx.stroke();
}

function iconDoc(ctx: Ctx, s: number, color: string) {
  const w = s * 0.78;
  const h = s * 1.0;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.1;
  ctx.lineJoin = "round";
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.lineCap = "round";
  for (const yy of [-h * 0.22, 0, h * 0.22]) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.28, yy);
    ctx.lineTo(w * 0.28, yy);
    ctx.stroke();
  }
}

function iconEnvelope(ctx: Ctx, s: number, color: string) {
  const w = s * 1.15;
  const h = s * 0.78;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.11;
  ctx.lineJoin = "round";
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(0, h * 0.08);
  ctx.lineTo(w / 2, -h / 2);
  ctx.stroke();
}

function iconGitBranch(ctx: Ctx, s: number, color: string) {
  const r = s * 0.14;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.11;
  ctx.lineCap = "round";
  // main line
  ctx.beginPath();
  ctx.moveTo(-s * 0.28, -s * 0.42);
  ctx.lineTo(-s * 0.28, s * 0.42);
  ctx.stroke();
  // branch curve
  ctx.beginPath();
  ctx.moveTo(s * 0.32, -s * 0.28);
  ctx.quadraticCurveTo(s * 0.32, s * 0.05, -s * 0.28, s * 0.1);
  ctx.stroke();
  for (const [cx, cy] of [
    [-s * 0.28, -s * 0.42],
    [-s * 0.28, s * 0.42],
    [s * 0.32, -s * 0.28],
  ]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function iconTrain(ctx: Ctx, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.09;
  ctx.lineJoin = "round";
  // body
  ctx.fillRect(-s * 0.55, -s * 0.32, s * 0.7, s * 0.5);
  // cab
  ctx.fillRect(s * 0.15, -s * 0.52, s * 0.42, s * 0.7);
  // stack
  ctx.fillRect(-s * 0.45, -s * 0.52, s * 0.16, s * 0.22);
  // wheels
  for (const cx of [-s * 0.38, -s * 0.08, s * 0.36]) {
    ctx.beginPath();
    ctx.arc(cx, s * 0.32, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  // cowcatcher
  ctx.beginPath();
  ctx.moveTo(s * 0.57, s * 0.18);
  ctx.lineTo(s * 0.72, s * 0.42);
  ctx.lineTo(s * 0.45, s * 0.42);
  ctx.closePath();
  ctx.fill();
}

/** Icon dispatcher: uniform ink linework per space. */
function drawIcon(
  ctx: Ctx,
  index: number,
  s: number,
  fonts: { mono: string; display: string },
) {
  const space = board[index];
  const ink = COLORS.ink;
  switch (space.slug) {
    case "frontend-line":
      return iconCodeTag(ctx, s * 0.72, fonts.mono, ink);
    case "backend-line":
      return iconBraces(ctx, s * 0.72, fonts.mono, ink);
    case "data-line":
      return iconDatabase(ctx, s * 0.8, ink);
    case "cloud-ai-line":
      return iconCloud(ctx, s * 0.85, ink);
    case "the-toolbox":
      return iconPrompt(ctx, s * 0.72, fonts.mono, ink);
  }
  switch (space.kind) {
    case "deck":
      return space.deck === "chance"
        ? iconQuestion(ctx, s, fonts.display, COLORS.bands.orange)
        : iconChest(ctx, s * 0.9, COLORS.bands.dkblue);
    case "flavor":
      return iconCup(ctx, s * 0.85, ink);
    case "action":
      return iconDoc(ctx, s * 0.85, ink);
    case "contact":
      return iconEnvelope(ctx, s * 0.85, ink);
    case "railroad":
      return iconTrain(ctx, s * 0.85, ink);
    case "utility":
      return iconPrompt(ctx, s * 0.72, fonts.mono, ink);
  }
  return null;
}

/* ---------- corners: KC-red full tiles ---------- */

function drawCorner(
  ctx: Ctx,
  index: number,
  lw: number,
  lh: number,
  fonts: { sans: string; mono: string; display: string },
) {
  // red field with a darker inner frame
  ctx.fillStyle = COLORS.mredDeep;
  ctx.fillRect(-lw / 2, -lh / 2, lw, lh);
  ctx.fillStyle = COLORS.mred;
  const inset = lw * 0.045;
  ctx.fillRect(-lw / 2 + inset, -lh / 2 + inset, lw - inset * 2, lh - inset * 2);
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(-lw / 2, -lh / 2, lw, lh);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cream = COLORS.cream;

  if (index === 0) {
    // GO
    ctx.fillStyle = cream;
    ctx.font = `700 ${lh * 0.1}px ${fonts.sans}`;
    ctx.fillText("COLLECT A CAREER", 0, -lh * 0.3, lw * 0.85);
    ctx.fillText("AS YOU PASS", 0, -lh * 0.19, lw * 0.85);
    ctx.font = `900 ${lh * 0.4}px ${fonts.display}`;
    ctx.fillText("GO", 0, lh * 0.06);
    // long arrow
    ctx.strokeStyle = cream;
    ctx.fillStyle = cream;
    ctx.lineWidth = lh * 0.045;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lw * 0.3, lh * 0.33);
    ctx.lineTo(-lw * 0.22, lh * 0.33);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-lw * 0.22, lh * 0.24);
    ctx.lineTo(-lw * 0.4, lh * 0.33);
    ctx.lineTo(-lw * 0.22, lh * 0.42);
    ctx.closePath();
    ctx.fill();
  } else if (index === 7) {
    // Debugging jail
    ctx.fillStyle = cream;
    ctx.font = `700 ${lh * 0.09}px ${fonts.sans}`;
    ctx.fillText("JUST VISITING", 0, lh * 0.38, lw * 0.85);
    // cell
    const cw = lw * 0.52;
    ctx.fillStyle = COLORS.cream;
    ctx.fillRect(-cw / 2, -lh * 0.36, cw, cw);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(-cw / 2, -lh * 0.36, cw, cw);
    // bars
    ctx.lineWidth = lh * 0.028;
    for (const fx of [-0.3, 0, 0.3]) {
      ctx.beginPath();
      ctx.moveTo(cw * fx, -lh * 0.36);
      ctx.lineTo(cw * fx, -lh * 0.36 + cw);
      ctx.stroke();
    }
    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 ${lh * 0.075}px ${fonts.mono}`;
    ctx.fillText("DEBUGGING", 0, -lh * 0.36 + cw + lh * 0.07);
  } else if (index === 14) {
    // Off the clock (free parking)
    ctx.fillStyle = cream;
    ctx.font = `700 ${lh * 0.1}px ${fonts.sans}`;
    ctx.fillText("OFF THE", 0, -lh * 0.32, lw * 0.85);
    ctx.fillText("CLOCK", 0, -lh * 0.21, lw * 0.85);
    ctx.save();
    ctx.translate(0, lh * 0.12);
    iconCup(ctx, lh * 0.42, cream);
    ctx.restore();
  } else {
    // GO TO GITHUB
    ctx.fillStyle = cream;
    ctx.font = `700 ${lh * 0.1}px ${fonts.sans}`;
    ctx.fillText("GO TO", 0, -lh * 0.34, lw * 0.85);
    ctx.fillText("GITHUB", 0, -lh * 0.23, lw * 0.85);
    ctx.save();
    ctx.translate(0, lh * 0.12);
    iconGitBranch(ctx, lh * 0.5, cream);
    ctx.restore();
    ctx.font = `600 ${lh * 0.068}px ${fonts.mono}`;
    ctx.fillText("read the commits", 0, lh * 0.4, lw * 0.85);
  }
}

/* ---------- center art ---------- */

function drawSkyline(ctx: Ctx, w: number, y: number) {
  // KC silhouette: simple towers + Liberty Memorial spire, low-contrast ink
  ctx.save();
  ctx.fillStyle = "rgba(29,26,21,0.16)";
  const base = y;
  const towers: [number, number, number][] = [
    // [x, width, height] fractions of w
    [-0.46, 0.05, 0.1],
    [-0.39, 0.045, 0.16],
    [-0.32, 0.06, 0.12],
    [-0.24, 0.05, 0.2], // One KC Place-ish
    [-0.17, 0.055, 0.14],
    [-0.1, 0.045, 0.11],
    [0.05, 0.05, 0.13],
    [0.12, 0.06, 0.17],
    [0.2, 0.045, 0.11],
    [0.27, 0.05, 0.145],
    [0.35, 0.055, 0.1],
    [0.42, 0.045, 0.13],
  ];
  for (const [fx, fw, fh] of towers) {
    ctx.fillRect(fx * w, base - fh * w, fw * w, fh * w);
  }
  // Liberty Memorial spire at center
  ctx.fillRect(-0.012 * w, base - 0.26 * w, 0.024 * w, 0.26 * w);
  ctx.fillRect(-0.03 * w, base - 0.06 * w, 0.06 * w, 0.06 * w);
  ctx.restore();
}

function drawCenter(
  ctx: Ctx,
  fonts: { sans: string; mono: string; display: string },
) {
  const cx = TEX / 2;
  const cy = TEX / 2;

  // diagonal deck callouts, like the real board
  ctx.save();
  ctx.translate(cx - TEX * 0.19, cy - TEX * 0.19);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = COLORS.bands.orange;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${TEX * 0.11}px ${fonts.display}`;
  ctx.fillText("?", 0, 0);
  ctx.font = `700 ${TEX * 0.016}px ${fonts.sans}`;
  ctx.fillStyle = COLORS.ink;
  ctx.fillText("CHANCE", 0, TEX * 0.075);
  ctx.restore();

  ctx.save();
  ctx.translate(cx + TEX * 0.19, cy + TEX * 0.19);
  ctx.rotate(-Math.PI / 4);
  iconChest(ctx, TEX * 0.1, COLORS.bands.dkblue);
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = "center";
  ctx.font = `700 ${TEX * 0.016}px ${fonts.sans}`;
  ctx.fillText("COMMUNITY CHEST", 0, TEX * 0.075);
  ctx.restore();

  // skyline behind the logo
  ctx.save();
  ctx.translate(cx, cy);
  drawSkyline(ctx, TEX * 0.62, TEX * 0.155);
  ctx.restore();

  // the red logo bar
  const bw = TEX * 0.46;
  const bh = TEX * 0.088;
  ctx.save();
  ctx.translate(cx, cy - TEX * 0.02);
  ctx.rotate(-Math.PI / 40);
  // drop shadow
  ctx.fillStyle = "rgba(29,26,21,0.28)";
  ctx.fillRect(-bw / 2 + 10, -bh / 2 + 12, bw, bh);
  ctx.fillStyle = COLORS.mred;
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.strokeStyle = COLORS.cream;
  ctx.lineWidth = 5;
  ctx.strokeRect(-bw / 2 + 8, -bh / 2 + 8, bw - 16, bh - 16);
  ctx.fillStyle = COLORS.cream;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${bh * 0.62}px ${fonts.display}`;
  ctx.fillText("UMPIERRE", 0, 2, bw * 0.9);
  // small edition ribbon
  ctx.fillStyle = COLORS.bands.yellow;
  const rw = bw * 0.52;
  const rh = bh * 0.34;
  ctx.fillRect(-rw / 2, bh / 2 + 6, rw, rh);
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(-rw / 2, bh / 2 + 6, rw, rh);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 ${rh * 0.55}px ${fonts.sans}`;
  ctx.fillText("KANSAS CITY EDITION", 0, bh / 2 + 6 + rh / 2 + 1, rw * 0.92);
  ctx.restore();

  // subtitle + hint
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.ink;
  ctx.font = `600 ${TEX * 0.019}px ${fonts.sans}`;
  ctx.fillText(
    "FULL-STACK SOFTWARE ENGINEER",
    cx,
    cy + TEX * 0.115,
    TEX * 0.5,
  );
  ctx.fillStyle = "rgba(29,26,21,0.62)";
  ctx.font = `500 ${TEX * 0.015}px ${fonts.mono}`;
  ctx.fillText(
    "$ roll --dice · tap any space · hire the token",
    cx,
    cy + TEX * 0.15,
    TEX * 0.5,
  );
}

/* ---------- main ---------- */

export function createBoardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEX;
  const ctx = canvas.getContext("2d")!;
  const fonts = {
    display: cssFont("--font-fraunces", "serif"),
    sans: cssFont("--font-geist-sans", "sans-serif"),
    mono: cssFont("--font-geist-mono", "monospace"),
  };

  // pale-green board face with a soft vignette
  const g = ctx.createRadialGradient(
    TEX / 2,
    TEX / 2,
    TEX * 0.1,
    TEX / 2,
    TEX / 2,
    TEX * 0.75,
  );
  g.addColorStop(0, COLORS.board);
  g.addColorStop(1, "#93ba7d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX, TEX);

  // world (x,z) → px. x → right, z → down (camera looks from +z).
  const px = (x: number) => (x + BOARD_SIZE / 2) * S;

  // inner frame line around the center field
  {
    const ring = 1.4 * S; // RING_DEPTH
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 6;
    ctx.strokeRect(ring, ring, TEX - ring * 2, TEX - ring * 2);
    ctx.lineWidth = 2;
    ctx.strokeRect(ring + 12, ring + 12, TEX - ring * 2 - 24, TEX - ring * 2 - 24);
  }

  // outer edge frame
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 10;
  ctx.strokeRect(3, 3, TEX - 6, TEX - 6);

  // center art under the tiles (tiles overdraw edges cleanly)
  drawCenter(ctx, fonts);

  // Space tiles
  for (let i = 0; i < 28; i++) {
    const t = spaceTransforms[i];
    const x0 = px(t.x - t.w / 2);
    const y0 = px(t.z - t.d / 2);
    const w = t.w * S;
    const h = t.d * S;

    const isCorner = i % 7 === 0;

    if (!isCorner) {
      ctx.fillStyle = COLORS.tile;
      ctx.fillRect(x0, y0, w, h);
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 4;
      ctx.strokeRect(x0, y0, w, h);
    }

    ctx.save();
    // Rotate label space so "toward center" is up.
    ctx.translate(px(t.x), px(t.z));
    const rot = [0, -Math.PI / 2, Math.PI, Math.PI / 2][t.side];
    ctx.rotate(rot);
    const lw = (t.side % 2 === 0 ? t.w : t.d) * S; // label-space width
    const lh = (t.side % 2 === 0 ? t.d : t.w) * S;

    if (isCorner) {
      drawCorner(ctx, i, lw, lh, fonts);
      ctx.restore();
      continue;
    }

    // uniform header band on every tile
    const bandH = lh * 0.24;
    const band = bandFor(i);
    ctx.fillStyle = band;
    ctx.fillRect(-lw / 2, -lh / 2, lw, bandH);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(-lw / 2, -lh / 2, lw, bandH);

    // property-band houses hint: two thin pips on the band for projects
    const space = board[i];
    if (space.kind === "project" || space.kind === "client") {
      ctx.fillStyle = "rgba(246,241,226,0.5)";
      ctx.fillRect(-lw / 2 + 8, -lh / 2 + 8, lw * 0.1, 6);
      ctx.fillRect(lw / 2 - 8 - lw * 0.1, -lh / 2 + 8, lw * 0.1, 6);
    }

    // deck bands carry their name in the band itself
    if (space.kind === "deck") {
      ctx.fillStyle = bandTextColor(band);
      ctx.font = `700 ${bandH * 0.34}px ${fonts.sans}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        space.deck === "chance" ? "CHANCE" : "CHEST",
        0,
        -lh / 2 + bandH / 2 + 1,
        lw * 0.9,
      );
    }

    // title block, uniform baseline (deck tiles: the band already names them)
    ctx.fillStyle = COLORS.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = space.kind === "deck" ? [] : labelFor(i);
    const fs = 30;
    ctx.font = `700 ${fs}px ${fonts.sans}`;
    const blockTop = -lh / 2 + bandH + lh * 0.05;
    lines.forEach((line, li) => {
      ctx.fillText(line, 0, blockTop + fs * 0.62 + li * fs * 1.1, lw * 0.92);
    });

    // icon zone, uniform center
    ctx.save();
    ctx.translate(0, lh * 0.16);
    drawIcon(ctx, i, lh * 0.3, fonts);
    ctx.restore();

    // mono caption, uniform bottom line
    const caption = captionFor(i);
    if (caption) {
      ctx.fillStyle = "rgba(29,26,21,0.72)";
      ctx.font = `500 ${lh * 0.075}px ${fonts.mono}`;
      ctx.fillText(caption, 0, lh / 2 - lh * 0.09, lw * 0.9);
    }
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
