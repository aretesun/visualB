export const CONSTANTS = {
  // 카드 관련
  MAX_CARDS: 100,
  DEFAULT_CARD_WIDTH: 300,
  DEFAULT_CARD_HEIGHT: 200,
  MIN_CARD_WIDTH: 150,
  MIN_CARD_HEIGHT: 100,
  MIN_CARD_MARGIN: 100,
  CARD_RESIZE_MIN_WIDTH: 200,
  CARD_RESIZE_MAX_WIDTH: 1000,
  CARD_RESIZE_MIN_HEIGHT: 100,
  CARD_RESIZE_MAX_HEIGHT: 800,

  // 이미지 관련
  IMAGE_COMPRESS_QUALITY: 0.7,
  IMAGE_MAX_WIDTH: 800,
  IMAGE_MAX_HEIGHT: 800,
  IMAGE_LOAD_TIMEOUT_MS: 3000,
  MAX_URL_LENGTH: 2000,

  // 스티커 관련
  MAX_STICKERS: 50,
  DEFAULT_STICKER_SIZE: 100,
  STICKER_MIN_SIZE: 20,
  STICKER_MAX_SIZE: 500,

  // UI 타이밍
  DEBOUNCE_MS: 100,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,

  // 터치 타겟 (모바일 최적화)
  MIN_TOUCH_TARGET: 44,

  // 리사이즈 핸들 방향
  RESIZE_HANDLES: {
    SOUTH_EAST: 'se',
    NORTH_EAST: 'ne',
    SOUTH_WEST: 'sw',
    NORTH_WEST: 'nw',
    EAST: 'e',
    WEST: 'w',
    SOUTH: 's',
    NORTH: 'n',
  } as const,

  // 로컬 스토리지 키
  STORAGE_KEYS: {
    CARDS: 'visionBoardItems',
    STICKERS: 'stickerPalette',
    STICKER_INSTANCES: 'stickerInstances',
    BACKGROUND: 'backgroundImage',
  },

  // API
  WORKER_URL: 'https://vision-board-api.yesisun.workers.dev',

  // 배경 이미지
  BACKGROUND_IMAGES: [
    // 자연 & 풍경
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop', // 산 풍경
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop', // 해변
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop', // 자연 풍경
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop', // 숲
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop', // 산
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop', // 호수
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop', // 숲길
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop', // 오로라
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=2074&auto=format&fit=crop', // 산 호수
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=2070&auto=format&fit=crop', // 숲 햇살
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2070&auto=format&fit=crop', // 열대 해변
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=2070&auto=format&fit=crop', // 사막 풍경

    // 여행지
    'https://images.unsplash.com/photo-1502602898657-3e91760c0341?q=80&w=2073&auto=format&fit=crop', // 파리
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1966&auto=format&fit=crop', // 베니스
    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=2070&auto=format&fit=crop', // 산토리니
    'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?q=80&w=1974&auto=format&fit=crop', // 바르셀로나
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop', // 런던
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop', // 도쿄
    'https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=2070&auto=format&fit=crop', // 뉴욕
    'https://images.unsplash.com/photo-1490806230066-428c82a441b8?q=80&w=2070&auto=format&fit=crop', // 바다 여행
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop', // 호수 여행
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2035&auto=format&fit=crop', // 기차 여행
    'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?q=80&w=2070&auto=format&fit=crop', // 아이슬란드
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2068&auto=format&fit=crop', // 북유럽
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071&auto=format&fit=crop', // 몰디브
    'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?q=80&w=2080&auto=format&fit=crop', // 중국 여행
    'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop', // 프라하
  ],

  // Z-인덱스 계층
  Z_INDEX: {
    CARDS: 10,
    STICKERS: 100,
    DRAGGING: 1000,
    UI: 1100,
  },
} as const;

export type Constants = typeof CONSTANTS;
