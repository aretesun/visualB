export interface Position {
  x: number;
  y: number;
}

export interface Card {
  id: number;
  position: Position;
  text?: string;      // 텍스트는 선택적
  imageUrl?: string;  // 이미지도 선택적
}

// 레거시 타입 호환성을 위한 별칭
export type VisionItem = Card;
