export interface Position {
  x: number;
  y: number;
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
