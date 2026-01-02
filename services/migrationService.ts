import { Card, LegacyCard, Sticker, StickerInstance } from '../types';
import { LEGACY_STORAGE_KEYS } from '../utils/storageKeys';
import { CONSTANTS } from '../utils/constants';

interface LegacyMigrationResult {
  cards?: Card[];
  stickers?: Sticker[];
  stickerInstances?: StickerInstance[];
}

export const migrateLegacyStorage = (): LegacyMigrationResult => {
  const result: LegacyMigrationResult = {};

  const oldCards = localStorage.getItem(LEGACY_STORAGE_KEYS.CARDS);
  if (oldCards) {
    try {
      const parsedOldCards: LegacyCard[] = JSON.parse(oldCards);
      const migratedCards: Card[] = parsedOldCards.map((item) => {
        if (item.type === 'text') {
            return {
              id: item.id,
              position: item.position,
              text: item.text,
              zIndex: CONSTANTS.Z_INDEX.CARD_BASE,
            };
          }
          if (item.type === 'image') {
            return {
              id: item.id,
              position: item.position,
              imageUrl: item.url || item.imageUrl,
              zIndex: CONSTANTS.Z_INDEX.CARD_BASE,
            };
          }
          return {
            id: item.id,
            position: item.position,
            text: item.text,
            imageUrl: item.imageUrl,
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight,
            imageOffset: item.imageOffset,
            zIndex: CONSTANTS.Z_INDEX.CARD_BASE,
          };
        });
      result.cards = migratedCards;
      localStorage.removeItem(LEGACY_STORAGE_KEYS.CARDS);
    } catch (error) {
      console.error('Failed to migrate legacy cards:', error);
    }
  }

  const oldStickers = localStorage.getItem(LEGACY_STORAGE_KEYS.STICKER_PALETTE);
  if (oldStickers) {
    try {
      result.stickers = JSON.parse(oldStickers) as Sticker[];
      localStorage.removeItem(LEGACY_STORAGE_KEYS.STICKER_PALETTE);
    } catch (error) {
      console.error('Failed to migrate legacy stickers:', error);
    }
  }

  const oldStickerInstances = localStorage.getItem(LEGACY_STORAGE_KEYS.STICKER_INSTANCES);
  if (oldStickerInstances) {
    try {
      result.stickerInstances = JSON.parse(oldStickerInstances) as StickerInstance[];
      localStorage.removeItem(LEGACY_STORAGE_KEYS.STICKER_INSTANCES);
    } catch (error) {
      console.error('Failed to migrate legacy sticker instances:', error);
    }
  }

  return result;
};
