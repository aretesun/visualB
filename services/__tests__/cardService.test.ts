import { describe, it, expect } from 'vitest';
import { CardService } from '../cardService';
import { CONSTANTS } from '../../utils/constants';
import type { Card } from '../../types';

describe('CardService', () => {
  it('canAdd respects max cards', () => {
    expect(CardService.canAdd(CONSTANTS.MAX_CARDS - 1)).toBe(true);
    expect(CardService.canAdd(CONSTANTS.MAX_CARDS)).toBe(false);
  });

  it('updatePosition clamps to viewport', () => {
    const card: Card = {
      id: 1,
      position: { x: 0, y: 0 },
      zIndex: CONSTANTS.Z_INDEX.CARD_BASE,
    };
    const viewport = { width: 300, height: 200 };
    const updated = CardService.updatePosition(card, { x: 999, y: 999 }, viewport);
    expect(updated.position.x).toBe(300 - CONSTANTS.DEFAULT_CARD_WIDTH);
    expect(updated.position.y).toBe(200 - CONSTANTS.DEFAULT_CARD_HEIGHT);
  });

  it('clone preserves zIndex and color', () => {
    const card: Card = {
      id: 7,
      position: { x: 10, y: 20 },
      zIndex: 42,
      color: 'peach',
      text: 'hello',
    };
    const cloned = CardService.clone(card);
    expect(cloned.zIndex).toBe(42);
    expect(cloned.color).toBe('peach');
    expect(cloned.text).toBe('hello');
  });
});
