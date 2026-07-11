/**
 * Board layout math. 10×10 world units, 28 spaces:
 * corners at 0/7/14/21, 6 spaces per side. Monopoly walk:
 * 0 = bottom-right (GO), counter-clockwise (bottom edge right→left,
 * up the left side, top edge left→right, down the right side).
 */

export const BOARD_SIZE = 10;
export const CORNER = 1.4;
export const CELL = 1.2;
export const BOARD_THICKNESS = 0.25;
/** Depth (toward center) of the edge ring. */
export const RING_DEPTH = CORNER;

const HALF = BOARD_SIZE / 2;
const ROW = HALF - CORNER / 2; // 4.3 — centerline of the edge ring

/** Centers of the 6 non-corner cells along one edge, from the "start" corner. */
const lane = [3.0, 1.8, 0.6, -0.6, -1.8, -3.0];

export interface SpaceTransform {
  /** Center of the space on the board top, world units. */
  x: number;
  z: number;
  /** Footprint. */
  w: number;
  d: number;
  /** Rotation around Y so "up" in label space points toward board center. */
  rotY: number;
  /** Which side: 0 bottom, 1 left, 2 top, 3 right (corners take the side they start). */
  side: number;
}

export function spaceTransform(index: number): SpaceTransform {
  if (index === 0)
    return { x: ROW, z: ROW, w: CORNER, d: CORNER, rotY: 0, side: 0 };
  if (index === 7)
    return { x: -ROW, z: ROW, w: CORNER, d: CORNER, rotY: 0, side: 1 };
  if (index === 14)
    return { x: -ROW, z: -ROW, w: CORNER, d: CORNER, rotY: 0, side: 2 };
  if (index === 21)
    return { x: ROW, z: -ROW, w: CORNER, d: CORNER, rotY: 0, side: 3 };
  // bottom edge, right→left: x +3.0 → -3.0
  if (index < 7)
    return {
      x: lane[index - 1],
      z: ROW,
      w: CELL,
      d: RING_DEPTH,
      rotY: 0,
      side: 0,
    };
  // left edge, bottom→top: z +3.0 → -3.0
  if (index < 14)
    return {
      x: -ROW,
      z: lane[index - 8],
      w: RING_DEPTH,
      d: CELL,
      rotY: -Math.PI / 2,
      side: 1,
    };
  // top edge, left→right: x -3.0 → +3.0
  if (index < 21)
    return {
      x: -lane[index - 15],
      z: -ROW,
      w: CELL,
      d: RING_DEPTH,
      rotY: Math.PI,
      side: 2,
    };
  // right edge, top→bottom: z -3.0 → +3.0
  return {
    x: ROW,
    z: -lane[index - 22],
    w: RING_DEPTH,
    d: CELL,
    rotY: Math.PI / 2,
    side: 3,
  };
}

export const spaceTransforms: SpaceTransform[] = Array.from(
  { length: 28 },
  (_, i) => spaceTransform(i),
);

/** Forward path from a to b (exclusive a, inclusive b), always travelling forward. */
export function forwardPath(from: number, to: number): number[] {
  const path: number[] = [];
  let i = from;
  do {
    i = (i + 1) % 28;
    path.push(i);
  } while (i !== to);
  return path;
}
