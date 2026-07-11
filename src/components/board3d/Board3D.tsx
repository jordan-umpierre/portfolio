"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, RoundedBox } from "@react-three/drei";
import { board } from "@/content/board";
import { createBoardTexture } from "./boardTexture";
import { BOARD_SIZE, BOARD_THICKNESS, spaceTransforms } from "./geometry";
import { useBoardStore } from "./store";

const GOLD = new THREE.Color("#c6a15b");
const HOP_SECS = 0.17;

function BoardMesh() {
  const texture = useMemo(() => createBoardTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group>
      <mesh position={[0, -BOARD_THICKNESS / 2, 0]}>
        <boxGeometry args={[BOARD_SIZE, BOARD_THICKNESS, BOARD_SIZE]} />
        <meshStandardMaterial color="#2e2b26" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[BOARD_SIZE, BOARD_SIZE]} />
        <meshStandardMaterial map={texture} roughness={0.92} />
      </mesh>
    </group>
  );
}

/** 28 invisible hitboxes + gold hover/selection quads. */
function Hitboxes() {
  const setHover = useBoardStore((s) => s.setHover);
  const travelTo = useBoardStore((s) => s.travelTo);
  const hoverIndex = useBoardStore((s) => s.hoverIndex);

  return (
    <group>
      {spaceTransforms.map((t, i) => (
        <mesh
          key={i}
          position={[t.x, 0.05, t.z]}
          visible={false}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(i);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(null);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            travelTo(i);
          }}
        >
          <boxGeometry args={[t.w, 0.1, t.d]} />
        </mesh>
      ))}
      {hoverIndex !== null && <GoldQuad index={hoverIndex} opacity={0.28} />}
    </group>
  );
}

function GoldQuad({ index, opacity }: { index: number; opacity: number }) {
  const t = spaceTransforms[index];
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[t.x, 0.005, t.z]}>
      <planeGeometry args={[t.w * 0.96, t.d * 0.96]} />
      <meshBasicMaterial color={GOLD} transparent opacity={opacity} />
    </mesh>
  );
}

function spaceIndexBySlug(slug: string): number | null {
  const i = board.findIndex((s) => s.slug === slug);
  return i === -1 ? null : i;
}

/** Selection highlight driven by the open panel. */
function SelectionQuad() {
  const index = useBoardStore((s) =>
    s.openSlug ? spaceIndexBySlug(s.openSlug) : null,
  );
  if (index === null) return null;
  return <GoldQuad index={index} opacity={0.4} />;
}

/** Top-hat token with parabolic hop + squash-stretch. */
function Token() {
  const group = useRef<THREE.Group>(null!);
  const hop = useRef<{ from: number; to: number; t: number } | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  useFrame((_, delta) => {
    const { tokenIndex, path, hopDone } = useBoardStore.getState();
    if (!hop.current && path.length) {
      hop.current = { from: tokenIndex, to: path[0], t: 0 };
    }
    const g = group.current;
    if (hop.current) {
      const h = hop.current;
      h.t = Math.min(1, h.t + delta / HOP_SECS);
      const a = spaceTransforms[h.from];
      const b = spaceTransforms[h.to];
      const e = h.t;
      g.position.x = THREE.MathUtils.lerp(a.x, b.x, e);
      g.position.z = THREE.MathUtils.lerp(a.z, b.z, e);
      g.position.y = Math.sin(e * Math.PI) * 0.45;
      // squash-stretch: stretch mid-air, squash on landing
      const stretch = 1 + Math.sin(e * Math.PI) * 0.25;
      g.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
      if (h.t >= 1) {
        hop.current = null;
        g.position.y = 0;
        g.scale.set(1, 1, 1);
        hopDone();
      }
      invalidate();
    } else {
      const t = spaceTransforms[tokenIndex];
      g.position.set(t.x, 0, t.z);
    }
  });

  return (
    <group ref={group}>
      {/* blob shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[0.34, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} />
      </mesh>
      {/* brim */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.34, 0.36, 0.06, 32]} />
        <meshStandardMaterial
          color="#2e2b26"
          metalness={0.35}
          roughness={0.35}
        />
      </mesh>
      {/* crown */}
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.21, 0.24, 0.52, 32]} />
        <meshStandardMaterial
          color="#2e2b26"
          metalness={0.35}
          roughness={0.35}
        />
      </mesh>
      {/* gold band */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.245, 0.25, 0.07, 32]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** One die face material set, canvas pips. */
function makeDieMaterials(): THREE.MeshStandardMaterial[] {
  const pipLayouts: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [
      [0.28, 0.28],
      [0.72, 0.72],
    ],
    3: [
      [0.25, 0.25],
      [0.5, 0.5],
      [0.75, 0.75],
    ],
    4: [
      [0.3, 0.3],
      [0.7, 0.3],
      [0.3, 0.7],
      [0.7, 0.7],
    ],
    5: [
      [0.28, 0.28],
      [0.72, 0.28],
      [0.5, 0.5],
      [0.28, 0.72],
      [0.72, 0.72],
    ],
    6: [
      [0.3, 0.25],
      [0.7, 0.25],
      [0.3, 0.5],
      [0.7, 0.5],
      [0.3, 0.75],
      [0.7, 0.75],
    ],
  };
  // three.js box material order: +x, -x, +y, -y, +z, -z
  // faces: +x=3, -x=4, +y=1, -y=6, +z=2, -z=5 (opposite faces sum to 7)
  const faceValues = [3, 4, 1, 6, 2, 5];
  return faceValues.map((v) => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f3eddc";
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = "#23201a";
    for (const [x, y] of pipLayouts[v]) {
      ctx.beginPath();
      ctx.arc(x * 128, y * 128, 11, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
  });
}

/** Quaternion that puts face `value` up (+y). */
function faceUpQuaternion(value: number): THREE.Quaternion {
  const q = new THREE.Quaternion();
  const E = (x: number, y: number, z: number) =>
    q.setFromEuler(new THREE.Euler(x, y, z));
  switch (value) {
    case 1:
      return E(0, 0, 0).clone(); // +y up
    case 6:
      return E(Math.PI, 0, 0).clone(); // -y up
    case 3:
      return E(0, 0, Math.PI / 2).clone(); // +x → up
    case 4:
      return E(0, 0, -Math.PI / 2).clone(); // -x → up
    case 2:
      return E(-Math.PI / 2, 0, 0).clone(); // +z → up
    case 5:
      return E(Math.PI / 2, 0, 0).clone(); // -z → up
    default:
      return q.identity().clone();
  }
}

const ROLL_SECS = 0.9;

function Dice() {
  const materials = useMemo(() => makeDieMaterials(), []);
  const refs = [useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!)];
  const anim = useRef<{ t: number } | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  const rolling = useBoardStore((s) => s.rolling);

  useEffect(() => {
    // rest on the current values before the first roll
    refs.forEach((r, i) => {
      r.current?.quaternion.copy(
        faceUpQuaternion(useBoardStore.getState().dice[i]),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rolling) anim.current = { t: 0 };
  }, [rolling]);

  useFrame((_, delta) => {
    if (!anim.current) return;
    const { dice, diceSettled } = useBoardStore.getState();
    anim.current.t = Math.min(1, anim.current.t + delta / ROLL_SECS);
    const t = anim.current.t;
    refs.forEach((r, i) => {
      const m = r.current;
      const target = faceUpQuaternion(dice[i]);
      if (t < 0.65) {
        // choreographed tumble: fixed angular velocities per die
        const speed = (i === 0 ? 11 : 13) * (1 - t * 0.6);
        m.rotation.x += delta * speed;
        m.rotation.z += delta * speed * 0.8;
        m.position.y = 0.6 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.5;
      } else {
        const k = (t - 0.65) / 0.35;
        m.quaternion.slerp(target, Math.min(1, k * 0.35 + 0.12));
        m.position.y = THREE.MathUtils.lerp(m.position.y, 0.26, 0.25);
      }
    });
    invalidate();
    if (t >= 1) {
      refs.forEach((r, i) => {
        r.current.quaternion.copy(
          faceUpQuaternion(useBoardStore.getState().dice[i]),
        );
        r.current.position.y = 0.26;
      });
      anim.current = null;
      diceSettled();
    }
  });

  return (
    <group position={[0, 0, 2.1]}>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={refs[i]}
          position={[i === 0 ? -0.45 : 0.45, 0.26, 0]}
          material={materials}
        >
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </mesh>
      ))}
    </group>
  );
}

/** Houses/hotels on developed properties. */
function Buildings() {
  const hotels = [15, 17, 27];
  const houses = [11, 13];
  return (
    <group>
      {hotels.map((i) => {
        const t = spaceTransforms[i];
        // sit at the inner (band) edge of the space
        const inward = 0.32;
        const pos: [number, number, number] =
          t.side === 0
            ? [t.x, 0.14, t.z - t.d / 2 + inward]
            : t.side === 1
              ? [t.x + t.w / 2 - inward, 0.14, t.z]
              : t.side === 2
                ? [t.x, 0.14, t.z + t.d / 2 - inward]
                : [t.x - t.w / 2 + inward, 0.14, t.z];
        return (
          <mesh key={i} position={pos} rotation={[0, t.rotY, 0]}>
            <boxGeometry args={[0.42, 0.28, 0.24]} />
            <meshStandardMaterial color="#a5443a" roughness={0.6} />
          </mesh>
        );
      })}
      {houses.map((i) => {
        const t = spaceTransforms[i];
        const inward = 0.28;
        const pos: [number, number, number] =
          t.side === 0
            ? [t.x, 0.1, t.z - t.d / 2 + inward]
            : t.side === 1
              ? [t.x + t.w / 2 - inward, 0.1, t.z]
              : t.side === 2
                ? [t.x, 0.1, t.z + t.d / 2 - inward]
                : [t.x - t.w / 2 + inward, 0.1, t.z];
        return (
          <mesh key={i} position={pos} rotation={[0, t.rotY, 0]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#4e7a5a" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function DeckStacks() {
  return (
    <group>
      <group position={[-1.9, 0.06, -1.6]} rotation={[0, Math.PI / 4, 0]}>
        <RoundedBox args={[1.5, 0.12, 0.95]} radius={0.04}>
          <meshStandardMaterial color="#c87d4f" roughness={0.7} />
        </RoundedBox>
      </group>
      <group position={[1.9, 0.06, 1.0]} rotation={[0, Math.PI / 4, 0]}>
        <RoundedBox args={[1.5, 0.12, 0.95]} radius={0.04}>
          <meshStandardMaterial color="#d9b054" roughness={0.7} />
        </RoundedBox>
      </group>
    </group>
  );
}

/** Gold shimmer over GO when a lap completes. */
function GoShimmer() {
  const goFlash = useBoardStore((s) => s.goFlash);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const anim = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (goFlash > 0) anim.current = 1;
  }, [goFlash]);
  useFrame((_, delta) => {
    if (anim.current <= 0) return;
    anim.current = Math.max(0, anim.current - delta / 1.1);
    mat.current.opacity = Math.sin(anim.current * Math.PI) * 0.55;
    invalidate();
  });
  const t = spaceTransforms[0];
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[t.x, 0.006, t.z]}>
      <planeGeometry args={[t.w * 1.05, t.d * 1.05]} />
      <meshBasicMaterial ref={mat} color={GOLD} transparent opacity={0} />
    </mesh>
  );
}

/** Intro sweep + pointer parallax + drift toward the token/selection. */
/* eslint-disable react-hooks/immutability -- useFrame callbacks run per-frame outside render; mutating the camera and refs there is the react-three-fiber model */
function CameraRig() {
  const { camera, invalidate } = useThree();
  const intro = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [invalidate]);

  useFrame((_, delta) => {
    const s = useBoardStore.getState();
    if (intro.current < 1) {
      intro.current = reduced ? 1 : Math.min(1, intro.current + delta / 1.8);
      invalidate();
    }
    const e = 1 - Math.pow(1 - intro.current, 3);
    // travel focus: lean toward the token while moving
    const focusT = spaceTransforms[s.tokenIndex];
    const lean = s.path.length ? 0.14 : 0.06;
    const par = 2 * (Math.PI / 180); // ±2°
    const baseX = focusT.x * lean + Math.sin(pointer.current.x * par) * 10;
    const baseY = THREE.MathUtils.lerp(16.5, 13.2, e) - pointer.current.y * 0.4;
    const baseZ = THREE.MathUtils.lerp(2.5, 7.2, e) + focusT.z * lean;
    const k = 1 - Math.exp(-4 * delta);
    camera.position.x += (baseX - camera.position.x) * k;
    camera.position.y += (baseY - camera.position.y) * k;
    camera.position.z += (baseZ - camera.position.z) * k;
    camera.lookAt(focusT.x * lean * 0.6, 0, focusT.z * lean * 0.6);
    if (s.path.length || intro.current < 1) invalidate();
  });
  return null;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 9, 5]} intensity={1.6} />
      <BoardMesh />
      <Hitboxes />
      <SelectionQuad />
      <Buildings />
      <DeckStacks />
      <GoShimmer />
      <Dice />
      <Token />
      <CameraRig />
    </>
  );
}

export default function Board3D() {
  const [dpr, setDpr] = useState<number>(1.75);
  const roll = useBoardStore((s) => s.roll);
  const rolling = useBoardStore((s) => s.rolling);
  const traveling = useBoardStore((s) => s.path.length > 0);
  const laps = useBoardStore((s) => s.laps);

  return (
    <div className="h-full w-full">
      <div className="h-full w-full" aria-hidden>
        <Canvas
          frameloop="demand"
          dpr={[1, dpr]}
          camera={{ fov: 35, position: [0, 16, 2.5], near: 0.1, far: 60 }}
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        >
          <PerformanceMonitor onDecline={() => setDpr(1.25)}>
            <Scene />
          </PerformanceMonitor>
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <div className="border-cream/20 bg-felt-deep/85 pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-2 backdrop-blur">
          <button
            type="button"
            onClick={roll}
            disabled={rolling || traveling}
            className="bg-gold text-felt-deep hover:bg-gold-deep hover:text-cream rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
          >
            🎲 Roll the dice
          </button>
          <span className="text-cream/70 text-xs">
            Laps: {laps} · or tap any space
          </span>
        </div>
      </div>
    </div>
  );
}
