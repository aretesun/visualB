import { Card, Position, Size } from '../types';
import { CONSTANTS } from '../utils/constants';
import { PositionUtils } from '../utils/positionUtils';

/**
 * 카드 관련 비즈니스 로직을 담당하는 서비스
 * 컴포넌트와 분리되어 테스트 가능
 */
export class CardService {
  /**
   * 새 카드 생성
   */
  static create(position: Position, id: number, viewport?: Size): Card {
    const vp = viewport || { width: window.innerWidth, height: window.innerHeight };

    return {
      id,
      position: PositionUtils.clamp(
        position,
        vp,
        { width: CONSTANTS.DEFAULT_CARD_WIDTH, height: CONSTANTS.DEFAULT_CARD_HEIGHT }
      ),
      zIndex: CONSTANTS.Z_INDEX.CARD_BASE,
    };
  }

  /**
   * 카드 추가 가능 여부 확인
   */
  static canAdd(currentCount: number): boolean {
    return currentCount < CONSTANTS.MAX_CARDS;
  }

  /**
   * 카드 위치 업데이트 (경계 체크 포함)
   */
  static updatePosition(
    card: Card,
    newPosition: Position,
    viewport?: Size
  ): Card {
    const vp = viewport || { width: window.innerWidth, height: window.innerHeight };

    return {
      ...card,
      position: PositionUtils.clamp(
        newPosition,
        vp,
        { width: CONSTANTS.DEFAULT_CARD_WIDTH, height: CONSTANTS.DEFAULT_CARD_HEIGHT }
      ),
    };
  }

  /**
   * 여러 카드를 함께 이동
   */
  static moveMultiple(
    cards: Card[],
    selectedIds: Set<number>,
    delta: Position,
    viewport?: Size
  ): Card[] {
    const vp = viewport || { width: window.innerWidth, height: window.innerHeight };

    return cards.map(card => {
      if (selectedIds.has(card.id)) {
        const newPosition = PositionUtils.add(card.position, delta);
        return {
          ...card,
          position: PositionUtils.clamp(
            newPosition,
            vp,
            { width: CONSTANTS.DEFAULT_CARD_WIDTH, height: CONSTANTS.DEFAULT_CARD_HEIGHT }
          ),
        };
      }
      return card;
    });
  }

  /**
   * 카드를 맨 앞으로 가져오기
   */
  static bringToFront(cards: Card[], id: number): Card[] {
    const card = cards.find(c => c.id === id);
    if (!card) return cards;

    const maxZIndex = Math.max(
      ...cards.map(c => c.zIndex || CONSTANTS.Z_INDEX.CARD_BASE),
      CONSTANTS.Z_INDEX.CARD_BASE - 1
    );

    return cards.map(c =>
      c.id === id ? { ...c, zIndex: Math.min(maxZIndex + 1, CONSTANTS.Z_INDEX.CARD_MAX) } : c
    );
  }

  /**
   * 카드 유효성 검증
   */
  static validate(card: Partial<Card>): boolean {
    // 텍스트나 이미지 중 하나는 있어야 함
    return !!(card.text?.trim() || card.imageUrl);
  }

  /**
   * 빈 카드인지 확인
   */
  static isEmpty(card: Card): boolean {
    return !card.text && !card.imageUrl;
  }

  /**
   * 카드 정렬 (위치 기준)
   */
  static sortByPosition(cards: Card[]): Card[] {
    return [...cards].sort((a, b) => {
      if (a.position.y === b.position.y) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });
  }

  /**
   * 카드 복제
   */
  static clone(card: Card, offset: Position = { x: 20, y: 20 }): Omit<Card, 'id'> {
    return {
      position: PositionUtils.add(card.position, offset),
      text: card.text,
      imageUrl: card.imageUrl,
      imageWidth: card.imageWidth,
      imageHeight: card.imageHeight,
      imageOffset: card.imageOffset,
      zIndex: card.zIndex,
      color: card.color,
      templateId: card.templateId,
    };
  }

  /**
   * 카드 크기 조정 시 위치 재계산 (viewport 변경 시)
   */
  static scalePosition(
    card: Card,
    oldViewport: Size,
    newViewport: Size
  ): Card {
    const widthRatio = newViewport.width / oldViewport.width;
    const heightRatio = newViewport.height / oldViewport.height;

    return {
      ...card,
      position: {
        x: Math.max(0, Math.min(card.position.x * widthRatio, newViewport.width - 100)),
        y: Math.max(0, Math.min(card.position.y * heightRatio, newViewport.height - 100)),
      },
    };
  }

  /**
   * 여러 카드의 위치를 viewport 변경에 맞게 스케일링
   */
  static scaleMultiple(
    cards: Card[],
    oldViewport: Size,
    newViewport: Size
  ): Card[] {
    return cards.map(card => this.scalePosition(card, oldViewport, newViewport));
  }
}
