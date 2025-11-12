import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Position, Sticker, StickerInstance, Size } from './types';
import VisionItem from './components/VisionItem';
import Toolbar from './components/Toolbar';
import AddCardButton from './components/AddCardButton';
import LinksMenu from './components/LinksMenu';
import Toast from './components/Toast';
import SettingsMenu from './components/SettingsMenu';
import ImageUrlModal from './components/ImageUrlModal';
import ShareModal from './components/ShareModal';
import StickerPalette from './components/StickerPalette';
import StickerObject from './components/StickerObject';
import { useLanguage } from './contexts/LanguageContext';
import santaImage from './sticker/santa.png';
import treeImage from './sticker/tree.png';

const MAX_CARDS = 100;

// Cloudflare Worker API URL
const WORKER_URL = 'https://vision-board-api.yesisun.workers.dev';

// 자연, 풍경, 여행 테마의 배경 이미지들
const BACKGROUND_IMAGES = [
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
];

const App: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<Card[]>([]);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false); // 공유 보기 모드

  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [nextId, setNextId] = useState<number>(() => {
    const maxId = items.reduce((max, item) => Math.max(max, item.id), 0);
    return maxId + 1;
  });
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showUrlModal, setShowUrlModal] = useState<boolean>(false);
  const [urlInputItemId, setUrlInputItemId] = useState<number | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // 스티커 관련 상태
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [stickerInstances, setStickerInstances] = useState<StickerInstance[]>([]);
  const [isPaletteExpanded, setIsPaletteExpanded] = useState(false);
  const [draggingSticker, setDraggingSticker] = useState<Sticker | null>(null);
  const [dragGhostPosition, setDragGhostPosition] = useState<Position | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInitialLoadComplete = useRef(false);

  // 다중 선택 관련 상태
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [selectedStickers, setSelectedStickers] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Position | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Position | null>(null);

  // 드래그 시작 시 초기 위치 저장
  const dragStartPositionsRef = useRef<Map<number | string, Position>>(new Map());
  // 현재 드래그 중인 오브젝트 ID 저장
  const draggingObjectRef = useRef<number | string | null>(null);

  const refreshBackground = useCallback(() => {
    // 배경 이미지 배열에서 랜덤하게 선택
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex]);
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 1. URL 파라미터에서 공유된 ID 체크
        const urlParams = new URLSearchParams(window.location.search);
        const shareId = urlParams.get('id');
        const legacyData = urlParams.get('data'); // 기존 방식 호환

        if (shareId && WORKER_URL) {
          // Worker에서 데이터 로드 (새로운 방식)
          setIsLoadingShared(true);
          try {
            const response = await fetch(`${WORKER_URL}/load?id=${shareId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.items) {
                // 공유 모드 진입 전 현재 localStorage 백업 (덮어쓰기 방지)
                const currentLocal = localStorage.getItem('visionBoardItems');
                if (currentLocal) {
                  sessionStorage.setItem('backupLocalData', currentLocal);
                }

                setItems(data.items);
                setIsSharedView(true); // 공유 보기 모드 활성화
                setToastMessage(t.toast.sharedBoardLoaded);
                // URL 파라미터 제거 (깔끔하게)
                window.history.replaceState({}, '', window.location.pathname);
                return;
              }
            }
          } catch (error) {
            console.error('Failed to load shared data from Worker:', error);
            setToastMessage(t.toast.sharedBoardFailed);
          } finally {
            setIsLoadingShared(false);
          }
        } else if (legacyData) {
          // 기존 base64 방식 (호환성 유지)
          try {
            // 공유 모드 진입 전 현재 localStorage 백업
            const currentLocal = localStorage.getItem('visionBoardItems');
            if (currentLocal) {
              sessionStorage.setItem('backupLocalData', currentLocal);
            }

            const jsonData = decodeURIComponent(atob(legacyData));
            const sharedItems = JSON.parse(jsonData) as Card[];
            setItems(sharedItems);
            setIsSharedView(true); // 공유 보기 모드 활성화
            setToastMessage(t.toast.sharedBoardLoaded);
            window.history.replaceState({}, '', window.location.pathname);
            return;
          } catch (error) {
            console.error('Failed to load legacy shared data:', error);
          }
        }

        // 2. localStorage에서 로드
        const savedItems = localStorage.getItem('visionBoardItems');
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems);
          // 기존 데이터 마이그레이션
          const migratedItems = parsedItems.map((item: any) => {
            if (item.type === 'text') {
              return { id: item.id, position: item.position, text: item.text };
            } else if (item.type === 'image') {
              return { id: item.id, position: item.position, imageUrl: item.url };
            }
            return item;
          });
          setItems(migratedItems);
        }

        // 3. 스티커 데이터 로드
        const defaultStickers: Sticker[] = [
          {
            id: 'default_santa',
            imageUrl: santaImage,
            name: 'Santa',
            addedAt: Date.now() - 1000,
            isPremade: true,
          },
          {
            id: 'default_tree',
            imageUrl: treeImage,
            name: 'Christmas Tree',
            addedAt: Date.now(),
            isPremade: true,
          }
        ];

        const savedStickers = localStorage.getItem('stickerPalette');
        if (savedStickers) {
          try {
            const parsedStickers = JSON.parse(savedStickers);
            const defaultStickerIds = new Set(defaultStickers.map(ds => ds.id));

            // 중복 제거 (id 기준으로 unique한 스티커만 유지)
            const uniqueStickers: Sticker[] = [];
            const seenIds = new Set<string>();

            parsedStickers.forEach((s: Sticker) => {
              if (!seenIds.has(s.id)) {
                seenIds.add(s.id);
                // 기본 스티커 ID면 isPremade 속성 추가/업데이트
                if (defaultStickerIds.has(s.id)) {
                  uniqueStickers.push({ ...s, isPremade: true });
                } else {
                  uniqueStickers.push(s);
                }
              }
            });

            // 기본 스티커가 없으면 추가
            const missingDefaultStickers = defaultStickers.filter(ds => !seenIds.has(ds.id));

            // 중복 제거된 스티커 + 누락된 기본 스티커만 추가
            const finalStickers = [...uniqueStickers, ...missingDefaultStickers];
            setStickers(finalStickers);

            // 중복이 제거되었거나 isPremade가 추가되었으면 localStorage 업데이트
            localStorage.setItem('stickerPalette', JSON.stringify(finalStickers));
          } catch (e) {
            console.error('Failed to load stickers:', e);
            setStickers(defaultStickers);
          }
        } else {
          // 저장된 스티커가 없으면 기본 스티커만 설정
          setStickers(defaultStickers);
        }

        const savedStickerInstances = localStorage.getItem('stickerInstances');
        if (savedStickerInstances) {
          try {
            const parsedInstances = JSON.parse(savedStickerInstances);
            setStickerInstances(parsedInstances);
          } catch (e) {
            console.error('Failed to load sticker instances:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setToastMessage('⚠️ 데이터를 불러오는데 실패했습니다');
      }
    };

    loadInitialData().then(() => {
      // 초기 로드 완료 표시
      isInitialLoadComplete.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 초기 로드 시에만 배경 이미지 설정
    refreshBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 마운트 시에만 실행

  useEffect(() => {
    // 초기 로드가 완료되지 않았으면 저장하지 않음 (Strict Mode 이중 마운트 방지)
    if (!isInitialLoadComplete.current) {
      return;
    }

    // 공유 보기 모드에서는 sessionStorage에 저장 (탭 닫으면 사라짐)
    if (isSharedView) {
      try {
        sessionStorage.setItem('sharedBoardItems', JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save to sessionStorage", error);
      }
      return;
    }

    // 일반 모드: localStorage에 저장 (영구)
    try {
      localStorage.setItem('visionBoardItems', JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save items to localStorage", error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        setToastMessage('저장 공간이 부족합니다. 일부 카드를 삭제하거나 URL로 이미지를 추가해주세요.');
      }
    }
  }, [items, isSharedView]);

  // 스티커 저장
  useEffect(() => {
    if (!isInitialLoadComplete.current || isSharedView) {
      return;
    }
    try {
      localStorage.setItem('stickerPalette', JSON.stringify(stickers));
    } catch (error) {
      console.error("Failed to save stickers:", error);
    }
  }, [stickers, isSharedView]);

  useEffect(() => {
    if (!isInitialLoadComplete.current || isSharedView) {
      return;
    }
    try {
      localStorage.setItem('stickerInstances', JSON.stringify(stickerInstances));
    } catch (error) {
      console.error("Failed to save sticker instances:", error);
    }
  }, [stickerInstances, isSharedView]);

  // 브라우저 창 크기 변경 시 카드 위치 자동 조정 (공유 모드에서는 비활성화)
  useEffect(() => {
    // 공유 보기 모드에서는 위치 자동 조정 안 함
    if (isSharedView) {
      return;
    }

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // debounce: 리사이즈가 완료된 후 100ms 후에 실행
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        // 크기 변경이 거의 없으면 무시 (1px 미만)
        if (Math.abs(newWidth - viewportSize.width) < 1 && Math.abs(newHeight - viewportSize.height) < 1) {
          return;
        }

        // 크기 변경 비율 계산
        const widthRatio = newWidth / viewportSize.width;
        const heightRatio = newHeight / viewportSize.height;

        // 모든 카드의 위치를 비율에 맞게 조정
        setItems(prevItems =>
          prevItems.map(item => ({
            ...item,
            position: {
              x: Math.max(0, Math.min(item.position.x * widthRatio, newWidth - 100)),
              y: Math.max(0, Math.min(item.position.y * heightRatio, newHeight - 100)),
            },
          }))
        );

        // 새로운 viewport 크기 저장
        setViewportSize({ width: newWidth, height: newHeight });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [viewportSize, isSharedView]);

  // 빈 카드 생성
  const addCard = () => {
    if (items.length >= MAX_CARDS) {
      setToastMessage(t.toast.maxCards);
      return;
    }

    const newItem: Card = {
      id: nextId,
      position: { x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 },
    };
    setItems([...items, newItem]);
    setNextId(prevId => prevId + 1);
  };

  const updateItemPosition = (id: number, position: Position, delta?: Position) => {
    // delta가 있고 선택된 오브젝트가 여러 개인 경우, 모든 선택된 카드와 스티커를 함께 이동
    if (delta && selectedCards.has(id) && (selectedCards.size > 1 || selectedStickers.size > 0)) {
      // 드래그 시작 시 초기 위치 저장 (첫 호출에만)
      if (draggingObjectRef.current === null) {
        draggingObjectRef.current = id;
        items.forEach(item => {
          if (selectedCards.has(item.id)) {
            dragStartPositionsRef.current.set(item.id, { ...item.position });
          }
        });
        stickerInstances.forEach(si => {
          if (selectedStickers.has(si.id)) {
            dragStartPositionsRef.current.set(si.id, { ...si.position });
          }
        });
      }

      setItems(prevItems =>
        prevItems.map(item => {
          if (item.id === id) {
            // 드래그 중인 카드는 절대 위치 사용
            return { ...item, position };
          } else if (selectedCards.has(item.id)) {
            // 다른 선택된 카드는 초기 위치 + delta
            const startPos = dragStartPositionsRef.current.get(item.id);
            if (startPos) {
              const newPos = {
                x: startPos.x + delta.x,
                y: startPos.y + delta.y,
              };
              return {
                ...item,
                position: newPos,
              };
            }
          }
          return item;
        })
      );
      // 선택된 스티커도 함께 이동
      if (selectedStickers.size > 0) {
        setStickerInstances(prevInstances =>
          prevInstances.map(si => {
            if (selectedStickers.has(si.id)) {
              // 초기 위치 + delta
              const startPos = dragStartPositionsRef.current.get(si.id);
              if (startPos) {
                const newPos = {
                  x: startPos.x + delta.x,
                  y: startPos.y + delta.y,
                };
                return {
                  ...si,
                  position: newPos,
                };
              }
            }
            return si;
          })
        );
      }
    } else {
      // 단일 카드만 이동 또는 드래그 종료
      setItems(prevItems =>
        prevItems.map(item => (item.id === id ? { ...item, position } : item))
      );
      // 드래그 종료 시 초기화
      dragStartPositionsRef.current.clear();
      draggingObjectRef.current = null;
    }
  };

  const updateItemText = (id: number, text: string) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, text } : item))
    );
  };

  const updateItemImage = (id: number, imageUrl: string) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, imageUrl } : item))
    );
  };

  const updateItemImageSize = (id: number, width: number, height: number) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, imageWidth: width, imageHeight: height } : item))
    );
  };

  const updateItemImageOffset = useCallback((id: number, offset: Position) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, imageOffset: offset } : item))
    );
  }, []);

  const handleRequestUrlInput = (id: number) => {
    setUrlInputItemId(id);
    setShowUrlModal(true);
  };

  const handleUrlSubmit = (url: string) => {
    if (urlInputItemId !== null) {
      updateItemImage(urlInputItemId, url);
    }
    setShowUrlModal(false);
    setUrlInputItemId(null);
  };

  const deleteItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const bringToFront = (id: number) => {
    setItems(prevItems => {
      const itemToMove = prevItems.find(item => item.id === id);
      if (!itemToMove) return prevItems;
      const otherItems = prevItems.filter(item => item.id !== id);
      return [...otherItems, itemToMove];
    });
  };

  // 다중 선택 핸들러
  const handleCardClick = (id: number, isCtrlPressed: boolean) => {
    if (isCtrlPressed) {
      setSelectedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else {
      setSelectedCards(new Set([id]));
      setSelectedStickers(new Set());
    }
  };

  const handleStickerClick = (id: string, isCtrlPressed: boolean) => {
    if (isCtrlPressed) {
      setSelectedStickers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else {
      setSelectedStickers(new Set([id]));
      setSelectedCards(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedCards(new Set());
    setSelectedStickers(new Set());
  };

  const handleRestore = (restoredItems: Card[]) => {
    setItems(restoredItems);
    // nextId를 복원된 아이템들 중 최대 id + 1로 설정
    const maxId = restoredItems.reduce((max, item) => Math.max(max, item.id), 0);
    setNextId(maxId + 1);
  };

  // 공유 기능들
  const handleShareAsImage = async () => {
    try {
      setToastMessage(t.toast.imageGenerating);

      // html2canvas를 동적으로 로드
      const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');

      // 현재 화면을 캡처할 대상 요소
      const element = document.querySelector('.relative.w-screen.h-screen') as HTMLElement;
      if (!element) {
        setToastMessage(t.toast.captureError);
        return;
      }

      // 모든 이미지가 로드될 때까지 대기
      const images = element.querySelectorAll('img');

      const imagePromises = Array.from(images).map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null); // 에러나도 진행
          // 타임아웃 설정
          setTimeout(() => resolve(null), 3000);
        });
      });

      await Promise.all(imagePromises);

      // 배경 이미지 로딩 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // 캡처 실행
      const canvas = await html2canvas.default(element, {
        allowTaint: false,
        useCORS: true, // ✅ CORS 활성화
        backgroundColor: '#000000',
        scale: 1.5, // 해상도 약간 낮춤 (성능 개선)
        logging: false, // 콘솔 로그 숨기기
        width: window.innerWidth,
        height: window.innerHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // fixed 요소들과 hover 시에만 보이는 요소들 제외
          if (element.classList.contains('fixed')) return true;

          // opacity-0 요소들 (버튼, 리사이즈 핸들 등) 제외
          if (element.classList.contains('opacity-0')) return true;

          // group-hover:opacity-100 요소들도 제외
          const classList = Array.from(element.classList);
          if (classList.some(c => c.includes('group-hover'))) return true;

          return false;
        },
        onclone: (clonedDoc) => {
          // 복제된 DOM에서 최신 CSS 제거 및 단순화
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const classList = htmlEl.classList;

            if (classList) {
              const classesToRemove: string[] = [];

              // backdrop-blur 제거
              classList.forEach((className) => {
                if (className.includes('backdrop-blur')) {
                  classesToRemove.push(className);
                }
              });

              classesToRemove.forEach((className) => classList.remove(className));

              // Tailwind 색상 클래스를 인라인 스타일로 변환
              if (classList.contains('bg-white/10')) {
                htmlEl.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
              if (classList.contains('bg-white/20')) {
                htmlEl.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
              if (classList.contains('bg-white/30')) {
                htmlEl.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              }
              if (classList.contains('border-white/20')) {
                htmlEl.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }
              if (classList.contains('border-white/30')) {
                htmlEl.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }
              if (classList.contains('border-white/50')) {
                htmlEl.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }
              if (classList.contains('text-white/40')) {
                htmlEl.style.color = 'rgba(255, 255, 255, 0.4)';
              }
              if (classList.contains('text-white/50')) {
                htmlEl.style.color = 'rgba(255, 255, 255, 0.5)';
              }
              if (classList.contains('text-white/70')) {
                htmlEl.style.color = 'rgba(255, 255, 255, 0.7)';
              }
            }

            // 인라인 스타일에서 backdrop-filter 제거
            if (htmlEl.style) {
              if (htmlEl.style.backdropFilter) {
                htmlEl.style.backdropFilter = 'none';
              }
              // opacity가 0이거나 거의 0인 요소는 완전히 보이게
              const opacity = parseFloat(htmlEl.style.opacity || '1');
              if (opacity === 0) {
                htmlEl.style.display = 'none';
              }
            }
          });
        },
      });

      // Canvas를 Blob으로 변환
      canvas.toBlob((blob) => {
        if (!blob) {
          setToastMessage(t.toast.imageFailed);
          return;
        }

        // 다운로드 링크 생성
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `vision-board-${timestamp}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setToastMessage(t.toast.imageDownloaded);
      }, 'image/png');
    } catch (error) {
      console.error('Image capture failed:', error);
      setToastMessage(t.toast.imageFailed);
    }
  };

  const handleShareAsFile = () => {
    // 비활성화된 기능 (추후 병합 기능과 함께 구현)
    setToastMessage('파일 공유 기능은 추후 제공 예정입니다');
  };

  const handleShareAsLink = async () => {
    try {
      setToastMessage(t.toast.linkGenerating);

      // Worker URL이 설정되어 있으면 새로운 방식 사용
      if (WORKER_URL) {
        try {
          const response = await fetch(`${WORKER_URL}/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          if (data.success && data.id) {
            const shareUrl = `${window.location.origin}${window.location.pathname}?id=${data.id}`;

            await navigator.clipboard.writeText(shareUrl);

            setToastMessage(t.toast.linkCopied);
            return;
          }
        } catch (workerError) {
          console.error('Worker share failed, falling back to legacy method:', workerError);
          setToastMessage(t.toast.linkFailed);
          // 폴백: 기존 방식 계속 진행
        }
      }

      // 기존 방식 (Worker 미설정 또는 실패 시)
      const jsonData = JSON.stringify(items);
      const base64Data = btoa(encodeURIComponent(jsonData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${base64Data}`;

      if (shareUrl.length > 2000) {
        setToastMessage(t.toast.linkFailed);
      }

      await navigator.clipboard.writeText(shareUrl);
      setToastMessage(t.toast.linkCopied);
    } catch (error) {
      console.error('Link share failed:', error);
      setToastMessage(t.toast.linkFailed);
    }
  };

  // 스티커 팔레트 핸들러
  const handleAddSticker = (sticker: Sticker) => {
    setStickers([...stickers, sticker]);
  };

  const handleDeleteSticker = (id: string) => {
    setStickers(stickers.filter(s => s.id !== id));
    // 해당 스티커로 만든 인스턴스도 모두 삭제
    setStickerInstances(stickerInstances.filter(si => si.stickerId !== id));
  };

  const handleStickerDragStart = (sticker: Sticker, e: React.MouseEvent) => {
    setDraggingSticker(sticker);
    setDragGhostPosition({ x: e.clientX, y: e.clientY });
  };

  // 스티커 인스턴스 핸들러
  const handleStickerPositionChange = (id: string, position: Position, delta?: Position) => {
    // delta가 있고 선택된 오브젝트가 여러 개인 경우, 모든 선택된 스티커와 카드를 함께 이동
    if (delta && selectedStickers.has(id) && (selectedStickers.size > 1 || selectedCards.size > 0)) {
      // 드래그 시작 시 초기 위치 저장 (첫 호출에만)
      if (draggingObjectRef.current === null) {
        draggingObjectRef.current = id;
        stickerInstances.forEach(si => {
          if (selectedStickers.has(si.id)) {
            dragStartPositionsRef.current.set(si.id, { ...si.position });
          }
        });
        items.forEach(item => {
          if (selectedCards.has(item.id)) {
            dragStartPositionsRef.current.set(item.id, { ...item.position });
          }
        });
      }

      setStickerInstances(stickerInstances.map(si => {
        if (si.id === id) {
          // 드래그 중인 스티커는 절대 위치 사용
          return { ...si, position };
        } else if (selectedStickers.has(si.id)) {
          // 다른 선택된 스티커는 초기 위치 + delta
          const startPos = dragStartPositionsRef.current.get(si.id);
          if (startPos) {
            const newPos = {
              x: startPos.x + delta.x,
              y: startPos.y + delta.y,
            };
            return {
              ...si,
              position: newPos,
            };
          }
        }
        return si;
      }));
      // 선택된 카드도 함께 이동
      if (selectedCards.size > 0) {
        setItems(prevItems =>
          prevItems.map(item => {
            if (selectedCards.has(item.id)) {
              // 초기 위치 + delta
              const startPos = dragStartPositionsRef.current.get(item.id);
              if (startPos) {
                const newPos = {
                  x: startPos.x + delta.x,
                  y: startPos.y + delta.y,
                };
                return {
                  ...item,
                  position: newPos,
                };
              }
            }
            return item;
          })
        );
      }
    } else {
      // 단일 스티커만 이동 또는 드래그 종료
      setStickerInstances(stickerInstances.map(si =>
        si.id === id ? { ...si, position } : si
      ));
      // 드래그 종료 시 초기화
      dragStartPositionsRef.current.clear();
      draggingObjectRef.current = null;
    }
  };

  const handleStickerSizeChange = (id: string, size: Size) => {
    setStickerInstances(stickerInstances.map(si =>
      si.id === id ? { ...si, size } : si
    ));
  };

  const handleDeleteStickerInstance = (id: string) => {
    setStickerInstances(stickerInstances.filter(si => si.id !== id));
  };

  const handleBringStickerToFront = (id: string) => {
    const maxZIndex = Math.max(...stickerInstances.map(si => si.zIndex), 5);
    setStickerInstances(stickerInstances.map(si =>
      si.id === id ? { ...si, zIndex: maxZIndex + 1 } : si
    ));
  };

  // 드래그 앤 드롭 (팔레트에서 캔버스로)
  useEffect(() => {
    if (!draggingSticker) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragGhostPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!canvasRef.current || !draggingSticker) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dropX = e.clientX - canvasRect.left;
      const dropY = e.clientY - canvasRect.top;

      // 캔버스 영역 안인지 확인
      if (dropX >= 0 && dropX <= canvasRect.width && dropY >= 0 && dropY <= canvasRect.height) {
        // 새 스티커 인스턴스 생성
        const newInstance: StickerInstance = {
          id: `sticker_inst_${Date.now()}`,
          stickerId: draggingSticker.id,
          imageUrl: draggingSticker.imageUrl,
          position: { x: dropX - 40, y: dropY - 40 }, // 중앙 정렬
          size: { width: 80, height: 80 },
          zIndex: 5 + stickerInstances.length,
        };
        setStickerInstances([...stickerInstances, newInstance]);
      }

      setDraggingSticker(null);
      setDragGhostPosition(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingSticker, stickerInstances]);

  // 드래그 박스 선택
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // 팔레트나 다른 UI 요소 클릭 시 무시
    if ((e.target as HTMLElement).closest('.fixed')) {
      return;
    }

    // 카드나 스티커 클릭 시 무시
    if ((e.target as HTMLElement).closest('[data-object="card"]') ||
        (e.target as HTMLElement).closest('[data-object="sticker"]')) {
      return;
    }

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const startPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setSelectionStart(startPos);
    setSelectionEnd(startPos);
    setIsSelecting(true);

    // Ctrl/Cmd 키가 눌리지 않았으면 기존 선택 해제
    if (!e.ctrlKey && !e.metaKey) {
      clearSelection();
    }
  };

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !selectionStart) return;

      const rect = canvasRef.current.getBoundingClientRect();
      setSelectionEnd({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseUp = () => {
      if (!selectionStart || !selectionEnd || !canvasRef.current) {
        setIsSelecting(false);
        return;
      }

      // 선택 박스 계산
      const selectionBox = {
        left: Math.min(selectionStart.x, selectionEnd.x),
        top: Math.min(selectionStart.y, selectionEnd.y),
        right: Math.max(selectionStart.x, selectionEnd.x),
        bottom: Math.max(selectionStart.y, selectionEnd.y),
      };

      // 카드 선택
      const newSelectedCards = new Set(selectedCards);
      items.forEach(item => {
        const cardRight = item.position.x + 300; // 카드 너비
        const cardBottom = item.position.y + 200; // 카드 높이

        if (
          item.position.x < selectionBox.right &&
          cardRight > selectionBox.left &&
          item.position.y < selectionBox.bottom &&
          cardBottom > selectionBox.top
        ) {
          newSelectedCards.add(item.id);
        }
      });

      // 스티커 선택
      const newSelectedStickers = new Set(selectedStickers);
      stickerInstances.forEach(sticker => {
        const stickerRight = sticker.position.x + sticker.size.width;
        const stickerBottom = sticker.position.y + sticker.size.height;

        if (
          sticker.position.x < selectionBox.right &&
          stickerRight > selectionBox.left &&
          sticker.position.y < selectionBox.bottom &&
          stickerBottom > selectionBox.top
        ) {
          newSelectedStickers.add(sticker.id);
        }
      });

      setSelectedCards(newSelectedCards);
      setSelectedStickers(newSelectedStickers);
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionStart, selectionEnd, items, stickerInstances, selectedCards, selectedStickers]);

  return (
    <div
      ref={canvasRef}
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center transition-all duration-1000 bg-black"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      onMouseDown={handleCanvasMouseDown}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}></div>

      {/* 공유 보기 모드 알림 */}
      {isSharedView && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-blue-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-sm font-medium">{t.sharedView.notice}</span>
          {/* TODO: 백업/복원 로직 수정 필요 - 초기화 문제 해결 후 활성화 */}
          {/* <button
            onClick={() => {
              // 백업된 localStorage 복원
              const backup = sessionStorage.getItem('backupLocalData');
              if (backup) {
                localStorage.setItem('visionBoardItems', backup);
              }

              // sessionStorage 삭제
              sessionStorage.removeItem('sharedBoardItems');
              sessionStorage.removeItem('backupLocalData');

              // 페이지 새로고침하면 복원된 localStorage에서 로드됨
              window.location.reload();
            }}
            className="ml-2 text-xs underline hover:text-white/80"
          >
            내 보드로 돌아가기
          </button> */}
        </div>
      )}

      {/* 카드들 (z-index: 자연 순서) */}
      {items.map((item) => (
        <VisionItem
          key={item.id}
          item={item}
          onPositionChange={updateItemPosition}
          onTextChange={updateItemText}
          onImageChange={updateItemImage}
          onImageSizeChange={updateItemImageSize}
          onImageOffsetChange={updateItemImageOffset}
          onDelete={deleteItem}
          onBringToFront={bringToFront}
          onRequestUrlInput={handleRequestUrlInput}
          isUrlModalOpen={urlInputItemId === item.id && showUrlModal}
          isReadOnly={isSharedView}
          isSelected={selectedCards.has(item.id)}
          onSelect={handleCardClick}
        />
      ))}

      {/* 스티커들 (z-index: 5~9) - 카드보다 위, UI 요소들(z-10~)보다 아래 */}
      {stickerInstances.map((sticker) => (
        <StickerObject
          key={sticker.id}
          sticker={sticker}
          onPositionChange={handleStickerPositionChange}
          onSizeChange={handleStickerSizeChange}
          onDelete={handleDeleteStickerInstance}
          onBringToFront={handleBringStickerToFront}
          isReadOnly={isSharedView}
          isSelected={selectedStickers.has(sticker.id)}
          onSelect={handleStickerClick}
        />
      ))}

      {/* 선택 박스 */}
      {isSelecting && selectionStart && selectionEnd &&
        // 최소 5px 이상 드래그했을 때만 표시 (의도하지 않은 선택 박스 방지)
        (Math.abs(selectionEnd.x - selectionStart.x) > 5 ||
         Math.abs(selectionEnd.y - selectionStart.y) > 5) && (
        <div
          className="absolute border-2 border-blue-400 bg-blue-400/10 pointer-events-none"
          style={{
            left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
            top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
            width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
            height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
          }}
        />
      )}

      {/* 드래그 중인 고스트 이미지 */}
      {draggingSticker && dragGhostPosition && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${dragGhostPosition.x - 40}px`,
            top: `${dragGhostPosition.y - 40}px`,
            width: '80px',
            height: '80px',
            opacity: 0.6,
          }}
        >
          <img
            src={draggingSticker.imageUrl}
            alt="dragging"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* 스티커 팔레트 */}
      {!isSharedView && (
        <StickerPalette
          isExpanded={isPaletteExpanded}
          stickers={stickers}
          onToggle={() => setIsPaletteExpanded(!isPaletteExpanded)}
          onAddSticker={handleAddSticker}
          onDeleteSticker={handleDeleteSticker}
          onDragStart={handleStickerDragStart}
        />
      )}

      <Toolbar
        onRefreshBackground={refreshBackground}
        onShareClick={() => setShowShareModal(true)}
        isSharedView={isSharedView}
      />
      {!isSharedView && (
        <>
          <AddCardButton onAddCard={addCard} />
          <SettingsMenu
            items={items}
            onRestore={handleRestore}
            onShowToast={setToastMessage}
          />
        </>
      )}
      <LinksMenu />
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}
      {showUrlModal && (
        <ImageUrlModal
          onSubmit={handleUrlSubmit}
          onClose={() => setShowUrlModal(false)}
        />
      )}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onShareAsImage={handleShareAsImage}
          onShareAsFile={handleShareAsFile}
          onShareAsLink={handleShareAsLink}
        />
      )}
    </div>
  );
};

export default App;
