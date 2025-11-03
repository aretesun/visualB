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

export interface Connection {
  id: string;
  fromCardId: number;
  toCardId: number;
  color?: string;     // 선 색상 (기본: 빨강)
  style?: 'solid' | 'dashed'; // 선 스타일
}

// 레거시 타입 호환성을 위한 별칭
export type VisionItem = Card;
