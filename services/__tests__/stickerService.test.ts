import { describe, it, expect } from 'vitest';
import { StickerService } from '../stickerService';
import { CONSTANTS } from '../../utils/constants';

describe('StickerService', () => {
  it('createInstance uses default size and zIndex base', () => {
    const instance = StickerService.createInstance('sticker_1', 'https://example.com/img.png', { x: 10, y: 20 }, 3);
    expect(instance.size.width).toBe(CONSTANTS.DEFAULT_STICKER_SIZE);
    expect(instance.size.height).toBe(CONSTANTS.DEFAULT_STICKER_SIZE);
    expect(instance.zIndex).toBe(CONSTANTS.Z_INDEX.STICKER_BASE + 3);
  });
});
