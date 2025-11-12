export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Card {
  id: number;
  position: Position;
  text?: string;      // 텍스트는 선택적
  imageUrl?: string;  // 이미지도 선택적
  imageWidth?: number;  // 이미지 너비 (선택적)
  imageHeight?: number; // 이미지 높이 (선택적)
  imageOffset?: Position; // 이미지 오프셋 (마스크 기능용)
}

// 레거시 타입 호환성을 위한 별칭
export type VisionItem = Card;

// 스티커 팔레트 관련 타입
export interface Sticker {
  id: string;
  imageUrl: string;          // URL 또는 base64
  name?: string;             // 스티커 이름
  category?: string;         // 미래: 'christmas', 'birthday', 'default'
  addedAt: number;           // 추가 시간
  isPremade?: boolean;       // 기본 제공 스티커 여부
}

export interface StickerInstance {
  id: string;                // 인스턴스 고유 ID
  stickerId: string;         // 원본 스티커 ID (palette에서)
  imageUrl: string;          // 이미지 (빠른 접근용)
  position: Position;        // { x, y }
  size: Size;                // { width, height }
  zIndex: number;            // 레이어 순서 (스티커는 1000+)
  rotation?: number;         // 미래: 회전 각도
}
