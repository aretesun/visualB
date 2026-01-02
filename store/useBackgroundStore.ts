import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/storageKeys';

export interface CustomBackground {
  id: string;
  imageUrl: string;
  name: string;
  addedAt: number;
}

export interface BackgroundSettings {
  source: 'system' | 'custom';
  customBackgrounds: CustomBackground[];
  customMode: 'single' | 'random';
  selectedSingleId: string | null;
  randomBackgroundIds: string[]; // max 5
  randomInterval: 'refresh' | 'timed';
  timedIntervalMinutes: number;
}

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  source: 'system',
  customBackgrounds: [],
  customMode: 'single',
  selectedSingleId: null,
  randomBackgroundIds: [],
  randomInterval: 'refresh',
  timedIntervalMinutes: 30,
};

interface BackgroundStore extends BackgroundSettings {
  // Actions
  setSource: (source: 'system' | 'custom') => void;
  addCustomBackground: (background: CustomBackground) => void;
  deleteCustomBackground: (id: string) => void;
  setCustomMode: (mode: 'single' | 'random') => void;
  setSelectedSingle: (id: string | null) => void;
  toggleRandomBackground: (id: string) => void;
  setRandomInterval: (interval: 'refresh' | 'timed') => void;
  setTimedIntervalMinutes: (minutes: number) => void;
  getCurrentBackground: () => string | null;
}

// Picsum Photos - 무료 랜덤 이미지 서비스 (Unsplash Source API는 deprecated됨)
const DEFAULT_BACKGROUND_URL = 'https://picsum.photos/1920/1080';

export const useBackgroundStore = create<BackgroundStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_BACKGROUND_SETTINGS,

      // Actions
      setSource: (source) => set({ source }),

      addCustomBackground: (background) =>
        set((state) => ({
          customBackgrounds: [...state.customBackgrounds, background],
          // Auto-select first image as single if no selection
          selectedSingleId: state.selectedSingleId || background.id,
        })),

      deleteCustomBackground: (id) =>
        set((state) => {
          const newBackgrounds = state.customBackgrounds.filter((bg) => bg.id !== id);
          const newRandomIds = state.randomBackgroundIds.filter((bgId) => bgId !== id);

          return {
            customBackgrounds: newBackgrounds,
            randomBackgroundIds: newRandomIds,
            // Reset selectedSingleId if deleted
            selectedSingleId: state.selectedSingleId === id
              ? (newBackgrounds[0]?.id || null)
              : state.selectedSingleId,
          };
        }),

      setCustomMode: (mode) => set({ customMode: mode }),

      setSelectedSingle: (id) => set({ selectedSingleId: id }),

      toggleRandomBackground: (id) =>
        set((state) => {
          const isSelected = state.randomBackgroundIds.includes(id);
          let newIds: string[];

          if (isSelected) {
            // Remove from selection
            newIds = state.randomBackgroundIds.filter((bgId) => bgId !== id);
          } else {
            // Add to selection (max 5)
            if (state.randomBackgroundIds.length >= 5) {
              return state; // Don't add if already 5
            }
            newIds = [...state.randomBackgroundIds, id];
          }

          return { randomBackgroundIds: newIds };
        }),

      setRandomInterval: (interval) => set({ randomInterval: interval }),

      setTimedIntervalMinutes: (minutes) => set({ timedIntervalMinutes: minutes }),

      getCurrentBackground: () => {
        const state = get();

        // System background
        if (state.source === 'system') {
          // 타임스탬프를 추가하여 매번 다른 이미지가 로드되도록 함
          return `${DEFAULT_BACKGROUND_URL}?random=${Date.now()}`;
        }

        // Custom background
        if (state.customMode === 'single' && state.selectedSingleId) {
          const bg = state.customBackgrounds.find((bg) => bg.id === state.selectedSingleId);
          return bg?.imageUrl || `${DEFAULT_BACKGROUND_URL}?random=${Date.now()}`;
        }

        // Random mode
        if (state.customMode === 'random' && state.randomBackgroundIds.length > 0) {
          const randomBgs = state.customBackgrounds.filter((bg) =>
            state.randomBackgroundIds.includes(bg.id)
          );
          if (randomBgs.length > 0) {
            const randomIndex = Math.floor(Math.random() * randomBgs.length);
            return randomBgs[randomIndex].imageUrl;
          }
        }

        // Fallback
        return `${DEFAULT_BACKGROUND_URL}?random=${Date.now()}`;
      },
    }),
    {
      name: STORAGE_KEYS.BACKGROUND,
      partialize: (state) => ({
        source: state.source,
        customBackgrounds: state.customBackgrounds,
        customMode: state.customMode,
        selectedSingleId: state.selectedSingleId,
        randomBackgroundIds: state.randomBackgroundIds,
        randomInterval: state.randomInterval,
        timedIntervalMinutes: state.timedIntervalMinutes,
      }),
    }
  )
);
