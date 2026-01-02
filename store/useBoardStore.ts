import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { Card, Sticker, StickerInstance } from '../types';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { indexedDBStorage } from './indexedDBStorage';
import type { BackgroundSettings } from './useBackgroundStore';

export interface BoardData {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  cards: Card[];
  stickers: Sticker[];
  stickerInstances: StickerInstance[];
  background: BackgroundSettings;
}

interface BoardState {
  boards: BoardData[];
  activeBoardId: string | null;
  addBoard: (board: BoardData) => void;
  updateBoard: (id: string, updates: Partial<BoardData>) => void;
  removeBoard: (id: string) => void;
  renameBoard: (id: string, name: string) => void;
  setActiveBoard: (id: string) => void;
}

export const useBoardStore = create<BoardState>()(
  devtools(
    persist(
      (set, get) => ({
        boards: [],
        activeBoardId: null,

        addBoard: (board) => {
          set((state) => ({
            boards: [...state.boards, board],
            activeBoardId: state.activeBoardId || board.id,
          }));
        },

        updateBoard: (id, updates) => {
          set((state) => ({
            boards: state.boards.map((board) =>
              board.id === id
                ? { ...board, ...updates, updatedAt: Date.now() }
                : board
            ),
          }));
        },

        removeBoard: (id) => {
          set((state) => {
            const remaining = state.boards.filter((board) => board.id !== id);
            const nextActive =
              state.activeBoardId === id ? remaining[0]?.id || null : state.activeBoardId;
            return {
              boards: remaining,
              activeBoardId: nextActive,
            };
          });
        },

        renameBoard: (id, name) => {
          set((state) => ({
            boards: state.boards.map((board) =>
              board.id === id ? { ...board, name, updatedAt: Date.now() } : board
            ),
          }));
        },

        setActiveBoard: (id) => {
          set({ activeBoardId: id });
        },
      }),
      {
        name: STORAGE_KEYS.BOARDS,
        storage: createJSONStorage(() => indexedDBStorage),
        partialize: (state) => ({
          boards: state.boards,
          activeBoardId: state.activeBoardId,
        }),
      }
    )
  )
);
