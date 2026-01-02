import { Sticker, StickerInstance, Position, Size } from '../types';
import { CONSTANTS } from '../utils/constants';
import { PositionUtils } from '../utils/positionUtils';

/**
 * 스티커 관련 비즈니스 로직을 담당하는 서비스
 */
export class StickerService {
  /**
   * 새 스티커 생성 (팔레트용)
   */
  static createSticker(imageUrl: string, name?: string): Sticker {
    return {
      id: `sticker_${Date.now()}`,
      imageUrl,
      name: name || 'Sticker',
      addedAt: Date.now(),
    };
  }

  /**
   * 스티커 인스턴스 생성 (캔버스에 배치)
   */
  static createInstance(
    stickerId: string,
    imageUrl: string,
    position: Position,
    currentInstanceCount: number = 0
  ): StickerInstance {
    return {
      id: `sticker_inst_${Date.now()}`,
      stickerId,
      imageUrl,
      position,
      size: {
        width: CONSTANTS.DEFAULT_STICKER_SIZE,
        height: CONSTANTS.DEFAULT_STICKER_SIZE,
      },
      zIndex: CONSTANTS.Z_INDEX.STICKER_BASE + currentInstanceCount,
    };
  }

  /**
   * 스티커 추가 가능 여부 (팔레트)
   */
  static canAddSticker(currentCount: number): boolean {
    return currentCount < CONSTANTS.MAX_STICKERS;
  }

  /**
   * 기본 스티커 필터링
   */
  static filterPremade(stickers: Sticker[]): Sticker[] {
    return stickers.filter(s => s.isPremade);
  }

  /**
   * 사용자 추가 스티커 필터링
   */
  static filterCustom(stickers: Sticker[]): Sticker[] {
    return stickers.filter(s => !s.isPremade);
  }

  /**
   * 스티커를 맨 앞으로 가져오기
   */
  static bringInstanceToFront(instances: StickerInstance[], id: string): StickerInstance[] {
    const maxZIndex = Math.max(...instances.map(i => i.zIndex), 999);

    return instances.map(inst =>
      inst.id === id ? { ...inst, zIndex: maxZIndex + 1 } : inst
    );
  }

  /**
   * 스티커 인스턴스 위치 업데이트
   */
  static updateInstancePosition(
    instance: StickerInstance,
    newPosition: Position,
    viewport?: Size
  ): StickerInstance {
    const vp = viewport || { width: window.innerWidth, height: window.innerHeight };

    return {
      ...instance,
      position: PositionUtils.clamp(newPosition, vp, instance.size),
    };
  }

  /**
   * 여러 스티커 인스턴스를 함께 이동
   */
  static moveMultiple(
    instances: StickerInstance[],
    selectedIds: Set<string>,
    delta: Position,
    viewport?: Size
  ): StickerInstance[] {
    const vp = viewport || { width: window.innerWidth, height: window.innerHeight };

    return instances.map(inst => {
      if (selectedIds.has(inst.id)) {
        const newPosition = PositionUtils.add(inst.position, delta);
        return {
          ...inst,
          position: PositionUtils.clamp(newPosition, vp, inst.size),
        };
      }
      return inst;
    });
  }

  /**
   * 특정 스티커 ID로 생성된 모든 인스턴스 찾기
   */
  static findInstancesByStickerId(
    instances: StickerInstance[],
    stickerId: string
  ): StickerInstance[] {
    return instances.filter(inst => inst.stickerId === stickerId);
  }

  /**
   * 스티커 인스턴스 크기 조정
   */
  static resizeInstance(
    instance: StickerInstance,
    newSize: Size
  ): StickerInstance {
    return {
      ...instance,
      size: {
        width: Math.max(CONSTANTS.STICKER_MIN_SIZE, Math.min(newSize.width, CONSTANTS.STICKER_MAX_SIZE)),
        height: Math.max(CONSTANTS.STICKER_MIN_SIZE, Math.min(newSize.height, CONSTANTS.STICKER_MAX_SIZE)),
      },
    };
  }

  /**
   * 스티커 인스턴스 복제
   */
  static cloneInstance(
    instance: StickerInstance,
    offset: Position = { x: 20, y: 20 }
  ): Omit<StickerInstance, 'id'> {
    return {
      stickerId: instance.stickerId,
      imageUrl: instance.imageUrl,
      position: PositionUtils.add(instance.position, offset),
      size: { ...instance.size },
      zIndex: instance.zIndex + 1,
    };
  }
}
