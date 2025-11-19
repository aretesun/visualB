import { create } from 'zustand';
import { devtools, persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Card, Position, Size, Sticker, StickerInstance } from '../types';
import { CONSTANTS } from '../utils/constants';

// ============================================
// IndexedDB Storage Adapter
// ============================================
const DB_NAME = 'vision-board-db';
const STORE_NAME = 'key-value-store';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

async function getFromDB(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function saveToDB(key: string, value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function removeFromDB(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      // 1. Try to get from IndexedDB
      const value = await getFromDB(name);

      if (value !== null) {
        return value;
      }

      // 2. If not in DB, check localStorage (Migration)
      const localValue = localStorage.getItem(name);
      if (localValue) {
        console.log(`📦 Migrating ${name} from localStorage to IndexedDB...`);
        // Async migration: save to DB and remove from localStorage
        await saveToDB(name, localValue);
        localStorage.removeItem(name);
        console.log(`✅ Migration complete for ${name}`);
        return localValue;
      }

      return null;
    } catch (error) {
      console.error('Error getting item from IndexedDB:', error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await saveToDB(name, value);
    } catch (error) {
      console.error('Error setting item to IndexedDB:', error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await removeFromDB(name);
    } catch (error) {
      console.error('Error removing item from IndexedDB:', error);
    }
  },
};

// ============================================
// Canvas Store (카드, 뷰포트, 배경)
// ============================================
interface CanvasState {
  // 상태
  cards: Card[];
  viewport: Size;
  backgroundImage: string;
  nextId: number;

  // 액션
  addCard: (card?: Partial<Card>) => void;
  updateCard: (id: number, updates: Partial<Card>) => void;
  deleteCard: (id: number) => void;
  setCards: (cards: Card[]) => void;
  bringCardToFront: (id: number) => void;
  setViewport: (size: Size) => void;
  setBackground: (url: string) => void;
  refreshBackground: () => void;

  // 유틸리티
  getNextId: () => number;
  canAddCard: () => boolean;
}



export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        cards: [],
        viewport: { width: window.innerWidth, height: window.innerHeight },
        backgroundImage: '',
        nextId: 1,

        addCard: (card) => {
          const state = get();
          if (!state.canAddCard()) {
            return;
          }

          const newCard: Card = {
            id: state.nextId,
            position: card?.position || {
              x: state.viewport.width / 2 - CONSTANTS.DEFAULT_CARD_WIDTH / 2,
              y: state.viewport.height / 2 - CONSTANTS.DEFAULT_CARD_HEIGHT / 2,
            },
            text: card?.text,
            imageUrl: card?.imageUrl,
            imageWidth: card?.imageWidth,
            imageHeight: card?.imageHeight,
            imageOffset: card?.imageOffset,
            isNew: card?.isNew !== undefined ? card.isNew : true, // 기본값: 새 카드
          };

          set({
            cards: [...state.cards, newCard],
            nextId: state.nextId + 1,
          });
        },

        updateCard: (id, updates) => {
          set((state) => ({
            cards: state.cards.map((card) =>
              card.id === id ? { ...card, ...updates } : card
            ),
          }));
        },

        deleteCard: (id) => {
          set((state) => ({
            cards: state.cards.filter((card) => card.id !== id),
          }));
        },

        setCards: (cards) => {
          const maxId = cards.reduce((max, item) => Math.max(max, item.id), 0);
          set({ cards, nextId: maxId + 1 });
        },

        bringCardToFront: (id) => {
          set((state) => {
            const card = state.cards.find((c) => c.id === id);
            if (!card) return state;

            return {
              cards: [...state.cards.filter((c) => c.id !== id), card],
            };
          });
        },

        setViewport: (size) => {
          set({ viewport: size });
        },

        setBackground: (url) => {
          set({ backgroundImage: url });
        },

        refreshBackground: () => {
          const randomIndex = Math.floor(
            Math.random() * CONSTANTS.BACKGROUND_IMAGES.length
          );
          set({ backgroundImage: CONSTANTS.BACKGROUND_IMAGES[randomIndex] });
        },

        getNextId: () => get().nextId,

        canAddCard: () => get().cards.length < CONSTANTS.MAX_CARDS,
      }),
      {
        name: 'canvas-storage',
        storage: createJSONStorage(() => indexedDBStorage),
        partialize: (state) => ({
          cards: state.cards,
          backgroundImage: state.backgroundImage,
          nextId: state.nextId,
        }),
      }
    )
  )
);

// ============================================
// Sticker Store (스티커 팔레트 & 인스턴스)
// ============================================
interface StickerState {
  // 상태
  palette: Sticker[];
  instances: StickerInstance[];
  isPaletteExpanded: boolean;
  draggingSticker: Sticker | null;
  dragGhostPosition: Position | null;

  // 액션 - 팔레트
  addSticker: (sticker: Sticker) => void;
  deleteSticker: (id: string) => void;
  setStickers: (stickers: Sticker[]) => void;

  // 액션 - 인스턴스
  addInstance: (instance: StickerInstance) => void;
  updateInstance: (id: string, updates: Partial<StickerInstance>) => void;
  deleteInstance: (id: string) => void;
  setInstances: (instances: StickerInstance[]) => void;
  bringInstanceToFront: (id: string) => void;

  // 액션 - UI
  togglePalette: () => void;
  setDraggingSticker: (sticker: Sticker | null) => void;
  setDragGhostPosition: (position: Position | null) => void;

  // 유틸리티
  canAddSticker: () => boolean;
}

export const useStickerStore = create<StickerState>()(
  devtools(
    persist(
      (set, get) => ({
        palette: [],
        instances: [],
        isPaletteExpanded: false,
        draggingSticker: null,
        dragGhostPosition: null,

        addSticker: (sticker) => {
          const state = get();
          if (!state.canAddSticker()) {
            return;
          }
          set({ palette: [...state.palette, sticker] });
        },

        deleteSticker: (id) => {
          set((state) => ({
            palette: state.palette.filter((s) => s.id !== id),
          }));
        },

        setStickers: (stickers) => {
          set({ palette: stickers });
        },

        addInstance: (instance) => {
          set((state) => ({
            instances: [...state.instances, instance],
          }));
        },

        updateInstance: (id, updates) => {
          set((state) => ({
            instances: state.instances.map((inst) =>
              inst.id === id ? { ...inst, ...updates } : inst
            ),
          }));
        },

        deleteInstance: (id) => {
          set((state) => ({
            instances: state.instances.filter((inst) => inst.id !== id),
          }));
        },

        setInstances: (instances) => {
          set({ instances });
        },

        bringInstanceToFront: (id) => {
          set((state) => {
            const instance = state.instances.find((i) => i.id === id);
            if (!instance) return state;

            // 20-29 범위 내에서 가장 높은 zIndex 찾기
            const maxZIndex = Math.max(
              ...state.instances.map((i) => i.zIndex),
              CONSTANTS.Z_INDEX.STICKER_BASE - 1
            );
            // 최대값이 STICKER_MAX 미만이면 +1, 아니면 STICKER_MAX 사용
            const newZIndex = Math.min(maxZIndex + 1, CONSTANTS.Z_INDEX.STICKER_MAX);

            return {
              instances: state.instances.map((inst) =>
                inst.id === id ? { ...inst, zIndex: newZIndex } : inst
              ),
            };
          });
        },

        togglePalette: () => {
          set((state) => ({ isPaletteExpanded: !state.isPaletteExpanded }));
        },

        setDraggingSticker: (sticker) => {
          set({ draggingSticker: sticker });
        },

        setDragGhostPosition: (position) => {
          set({ dragGhostPosition: position });
        },

        canAddSticker: () => get().palette.length < CONSTANTS.MAX_STICKERS,
      }),
      {
        name: 'sticker-storage',
        storage: createJSONStorage(() => indexedDBStorage),
        partialize: (state) => ({
          palette: state.palette,
          instances: state.instances,
        }),
      }
    )
  )
);

// ============================================
// Selection Store (선택 상태)
// ============================================
interface SelectionState {
  // 상태
  selectedCards: Set<number>;
  selectedStickers: Set<string>;
  isSelecting: boolean;
  selectionStart: Position | null;
  selectionEnd: Position | null;

  // 액션
  selectCard: (id: number, isCtrlPressed: boolean) => void;
  selectSticker: (id: string, isCtrlPressed: boolean) => void;
  clearSelection: () => void;
  setSelecting: (isSelecting: boolean) => void;
  setSelectionStart: (position: Position | null) => void;
  setSelectionEnd: (position: Position | null) => void;

  // 유틸리티
  isCardSelected: (id: number) => boolean;
  isStickerSelected: (id: string) => boolean;
  hasSelection: () => boolean;
  getSelectionCount: () => number;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedCards: new Set(),
  selectedStickers: new Set(),
  isSelecting: false,
  selectionStart: null,
  selectionEnd: null,

  selectCard: (id, isCtrlPressed) => {
    set((state) => {
      const newSet = new Set(state.selectedCards);

      if (isCtrlPressed) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        newSet.clear();
        newSet.add(id);
      }

      return {
        selectedCards: newSet,
        selectedStickers: new Set(),
      };
    });
  },

  selectSticker: (id, isCtrlPressed) => {
    set((state) => {
      const newSet = new Set(state.selectedStickers);

      if (isCtrlPressed) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        newSet.clear();
        newSet.add(id);
      }

      return {
        selectedStickers: newSet,
        selectedCards: new Set(),
      };
    });
  },

  clearSelection: () => {
    set({
      selectedCards: new Set(),
      selectedStickers: new Set(),
    });
  },

  setSelecting: (isSelecting) => {
    set({ isSelecting });
  },

  setSelectionStart: (position) => {
    set({ selectionStart: position });
  },

  setSelectionEnd: (position) => {
    set({ selectionEnd: position });
  },

  isCardSelected: (id) => get().selectedCards.has(id),

  isStickerSelected: (id) => get().selectedStickers.has(id),

  hasSelection: () => {
    const state = get();
    return state.selectedCards.size > 0 || state.selectedStickers.size > 0;
  },

  getSelectionCount: () => {
    const state = get();
    return state.selectedCards.size + state.selectedStickers.size;
  },
}));

// ============================================
// UI Store (토스트, 모달 등)
// ============================================
interface UIState {
  // 상태
  toastMessage: string;
  showUrlModal: boolean;
  urlInputItemId: number | null;
  showShareModal: boolean;
  isLoadingShared: boolean;
  isSharedView: boolean;

  // 액션
  showToast: (message: string) => void;
  hideToast: () => void;
  openUrlModal: (itemId: number) => void;
  closeUrlModal: () => void;
  openShareModal: () => void;
  closeShareModal: () => void;
  setLoadingShared: (loading: boolean) => void;
  setSharedView: (isShared: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toastMessage: '',
  showUrlModal: false,
  urlInputItemId: null,
  showShareModal: false,
  isLoadingShared: false,
  isSharedView: false,

  showToast: (message) => {
    set({ toastMessage: message });
  },

  hideToast: () => {
    set({ toastMessage: '' });
  },

  openUrlModal: (itemId) => {
    set({ showUrlModal: true, urlInputItemId: itemId });
  },

  closeUrlModal: () => {
    set({ showUrlModal: false, urlInputItemId: null });
  },

  openShareModal: () => {
    set({ showShareModal: true });
  },

  closeShareModal: () => {
    set({ showShareModal: false });
  },

  setLoadingShared: (loading) => {
    set({ isLoadingShared: loading });
  },

  setSharedView: (isShared) => {
    set({ isSharedView: isShared });
  },
}));
