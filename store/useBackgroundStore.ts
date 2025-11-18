import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

const DEFAULT_UNSPLASH_URL = 'https://source.unsplash.com/random/1920x1080';

export const useBackgroundStore = create<BackgroundStore>()(
  persist(
    (set, get) => ({
      // Initial state
      source: 'system',
      customBackgrounds: [],
      customMode: 'single',
      selectedSingleId: null,
      randomBackgroundIds: [],
      randomInterval: 'refresh',
      timedIntervalMinutes: 30,

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
          return DEFAULT_UNSPLASH_URL;
        }

        // Custom background
        if (state.customMode === 'single' && state.selectedSingleId) {
          const bg = state.customBackgrounds.find((bg) => bg.id === state.selectedSingleId);
          return bg?.imageUrl || DEFAULT_UNSPLASH_URL;
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
        return DEFAULT_UNSPLASH_URL;
      },
    }),
    {
      name: 'background-storage',
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
