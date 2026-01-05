export interface Position {
  x: number;
  y: number;
}

export type TemplateId = 'note' | 'checklist' | 'goal' | 'retro' | 'project';

export interface Size {
  width: number;
  height: number;
}

export interface CanvasObjectBase {
  id: string | number;
  position: Position;
  zIndex: number;
}

export interface Card extends CanvasObjectBase {
  id: number;
  text?: string;      // 텍스트는 선택적
  imageUrl?: string;  // 이미지도 선택적
  imageWidth?: number;  // 이미지 너비 (선택적)
  imageHeight?: number; // 이미지 높이 (선택적)
  imageOffset?: Position; // 이미지 오프셋 (마스크 기능용)
  isNew?: boolean;    // 새로 생성된 카드 (자동 삭제 방지용)
  color?: string;     // 카드 배경 색상 (테마)
  templateId?: TemplateId;
}

// 레거시 타입 호환성을 위한 별칭
export type VisionItem = Card;

/**
 * 레거시 카드 인터페이스 (마이그레이션용)
 * 이전 버전에서 사용하던 type 필드를 포함
 */
export interface LegacyCard {
  id: number;
  type?: 'text' | 'image';
  position: Position;
  text?: string;
  url?: string; // 구버전에서는 imageUrl 대신 url 사용
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageOffset?: Position;
}

/**
 * 리사이즈 핸들 방향 타입
 */
export type ResizeHandle = 'se' | 'ne' | 'sw' | 'nw' | 'e' | 'w' | 's' | 'n';

// 스티커 팔레트 관련 타입
export interface Sticker {
  id: string;
  imageUrl: string;          // URL 또는 base64
  name?: string;             // 스티커 이름
  category?: string;         // 미래: 'christmas', 'birthday', 'default'
  addedAt: number;           // 추가 시간
  isPremade?: boolean;       // 기본 제공 스티커 여부
}

export interface StickerInstance extends CanvasObjectBase {
  id: string;                // 인스턴스 고유 ID
  stickerId: string;         // 원본 스티커 ID (palette에서)
  imageUrl: string;          // 이미지 (빠른 접근용)
  size: Size;                // { width, height }
  rotation?: number;         // 미래: 회전 각도
}
