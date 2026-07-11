import { create } from "zustand";
import { board } from "@/content/board";
import { forwardPath } from "./geometry";

interface BoardState {
  /** Space the token currently occupies (or is departing). */
  tokenIndex: number;
  /** Remaining hop path; head is the next space. Empty = at rest. */
  path: number[];
  laps: number;
  /** Slug of the space whose panel is open, or null. */
  openSlug: string | null;
  /** Space index under pointer hover / keyboard focus. */
  hoverIndex: number | null;
  dice: [number, number];
  rolling: boolean;
  /** aria-live message. */
  announcement: string;
  /** Gold shimmer trigger; increments each GO pass. */
  goFlash: number;

  roll: () => void;
  travelTo: (index: number) => void;
  /** Called by the token animation as each hop completes. */
  hopDone: () => void;
  diceSettled: () => void;
  setHover: (index: number | null) => void;
  openPanel: (index: number) => void;
  closePanel: () => void;
  announce: (msg: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  tokenIndex: 0,
  path: [],
  laps: 0,
  openSlug: null,
  hoverIndex: null,
  dice: [3, 4],
  rolling: false,
  announcement: "",
  goFlash: 0,

  roll: () => {
    const { rolling, path } = get();
    if (rolling || path.length) return;
    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    set({
      rolling: true,
      dice: [d1, d2],
      openSlug: null,
      announcement: `Rolling…`,
    });
  },

  diceSettled: () => {
    const { dice, tokenIndex } = get();
    const total = dice[0] + dice[1];
    const dest = (tokenIndex + total) % 28;
    set({
      rolling: false,
      path: forwardPath(tokenIndex, dest),
      announcement: `Rolled ${total}.`,
    });
  },

  travelTo: (index: number) => {
    const { tokenIndex, rolling, path } = get();
    if (rolling || path.length) return;
    if (index === tokenIndex) {
      get().openPanel(index);
      return;
    }
    set({ openSlug: null, path: forwardPath(tokenIndex, index) });
  },

  hopDone: () => {
    const { path, laps } = get();
    const [arrived, ...rest] = path;
    const passedGo = arrived === 0;
    set({
      tokenIndex: arrived,
      path: rest,
      laps: passedGo ? laps + 1 : laps,
      ...(passedGo ? { goFlash: get().goFlash + 1 } : {}),
    });
    if (rest.length === 0) {
      get().openPanel(arrived);
      const title = board[arrived].title;
      set((s) => ({
        announcement: `${s.announcement} Landed on ${title}.`.trim(),
      }));
    }
  },

  setHover: (hoverIndex) => set({ hoverIndex }),

  openPanel: (index: number) => set({ openSlug: board[index].slug }),

  closePanel: () => set({ openSlug: null }),

  announce: (announcement) => set({ announcement }),
}));
