import { Position, Size } from '../types';

/**
 * 위치 계산 유틸리티 클래스
 */
export class PositionUtils {
  /**
   * 위치를 viewport 경계 내로 제한
   */
  static clamp(
    position: Position,
    viewport: Size,
    itemSize: Size = { width: 100, height: 100 }
  ): Position {
    return {
      x: Math.max(0, Math.min(position.x, viewport.width - itemSize.width)),
      y: Math.max(0, Math.min(position.y, viewport.height - itemSize.height)),
    };
  }

  /**
   * viewport 중앙 위치 계산
   */
  static centerInViewport(viewport: Size, itemSize: Size): Position {
    return {
      x: (viewport.width - itemSize.width) / 2,
      y: (viewport.height - itemSize.height) / 2,
    };
  }

  /**
   * 두 위치 사이의 거리 계산
   */
  static distance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 위치가 사각형 영역 안에 있는지 확인
   */
  static isInRect(
    position: Position,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      position.x >= rect.x &&
      position.x <= rect.x + rect.width &&
      position.y >= rect.y &&
      position.y <= rect.y + rect.height
    );
  }

  /**
   * 두 사각형이 겹치는지 확인
   */
  static isRectOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * 위치에 delta를 더하기
   */
  static add(position: Position, delta: Position): Position {
    return {
      x: position.x + delta.x,
      y: position.y + delta.y,
    };
  }

  /**
   * 두 위치의 차이 계산
   */
  static subtract(pos1: Position, pos2: Position): Position {
    return {
      x: pos1.x - pos2.x,
      y: pos1.y - pos2.y,
    };
  }

  /**
   * 위치를 특정 배율로 스케일링
   */
  static scale(position: Position, ratio: { x: number; y: number }): Position {
    return {
      x: position.x * ratio.x,
      y: position.y * ratio.y,
    };
  }
}
