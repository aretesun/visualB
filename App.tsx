import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Card, Position, Sticker, StickerInstance, Size, LegacyCard } from './types';
import CardComponent from './components/Card';
import Toolbar from './components/Toolbar';
import AddCardButton from './components/AddCardButton';
import LinksMenu from './components/LinksMenu';
import Toast from './components/Toast';
import SettingsMenu from './components/SettingsMenu';
import ImageUrlModal from './components/ImageUrlModal';
import ShareModal from './components/ShareModal';
import StickerPalette from './components/StickerPalette';
import StickerObject from './components/StickerObject';
import BackgroundSettingsModal from './components/BackgroundSettingsModal';
import { useLanguage } from './contexts/LanguageContext';
import { useCanvasStore, useStickerStore, useSelectionStore, useUIStore } from './store/useStore';
import { useBackgroundStore } from './store/useBackgroundStore';
import { useZoomPan } from './hooks/useZoomPan';
import { CONSTANTS } from './utils/constants';
import { PositionUtils } from './utils/positionUtils';
import santaImage from './sticker/santa.png';
import treeImage from './sticker/tree.png';

const App: React.FC = () => {
  const { t } = useLanguage();

  // Store 가져오기
  const cards = useCanvasStore(state => state.cards);
  const viewport = useCanvasStore(state => state.viewport);
  const backgroundImage = useCanvasStore(state => state.backgroundImage);
  const addCard = useCanvasStore(state => state.addCard);
  const updateCard = useCanvasStore(state => state.updateCard);
  const deleteCard = useCanvasStore(state => state.deleteCard);
  const setCards = useCanvasStore(state => state.setCards);
  const bringCardToFront = useCanvasStore(state => state.bringCardToFront);
  const setViewport = useCanvasStore(state => state.setViewport);
  const refreshBackground = useCanvasStore(state => state.refreshBackground);

  const stickers = useStickerStore(state => state.palette);
  const stickerInstances = useStickerStore(state => state.instances);
  const isPaletteExpanded = useStickerStore(state => state.isPaletteExpanded);
  const draggingSticker = useStickerStore(state => state.draggingSticker);
  const dragGhostPosition = useStickerStore(state => state.dragGhostPosition);
  const addSticker = useStickerStore(state => state.addSticker);
  const deleteSticker = useStickerStore(state => state.deleteSticker);
  const setStickers = useStickerStore(state => state.setStickers);
  const addInstance = useStickerStore(state => state.addInstance);
  const updateInstance = useStickerStore(state => state.updateInstance);
  const deleteInstance = useStickerStore(state => state.deleteInstance);
  const setInstances = useStickerStore(state => state.setInstances);
  const bringInstanceToFront = useStickerStore(state => state.bringInstanceToFront);
  const togglePalette = useStickerStore(state => state.togglePalette);
  const setDraggingSticker = useStickerStore(state => state.setDraggingSticker);
  const setDragGhostPosition = useStickerStore(state => state.setDragGhostPosition);

  const selectedCards = useSelectionStore(state => state.selectedCards);
  const selectedStickers = useSelectionStore(state => state.selectedStickers);
  const isSelecting = useSelectionStore(state => state.isSelecting);
  const selectionStart = useSelectionStore(state => state.selectionStart);
  const selectionEnd = useSelectionStore(state => state.selectionEnd);
  const selectCard = useSelectionStore(state => state.selectCard);
  const selectSticker = useSelectionStore(state => state.selectSticker);
  const clearSelection = useSelectionStore(state => state.clearSelection);
  const setSelecting = useSelectionStore(state => state.setSelecting);
  const setSelectionStart = useSelectionStore(state => state.setSelectionStart);
  const setSelectionEnd = useSelectionStore(state => state.setSelectionEnd);

  const toastMessage = useUIStore(state => state.toastMessage);
  const showUrlModal = useUIStore(state => state.showUrlModal);
  const urlInputItemId = useUIStore(state => state.urlInputItemId);
  const showShareModal = useUIStore(state => state.showShareModal);
  const isLoadingShared = useUIStore(state => state.isLoadingShared);
  const isSharedView = useUIStore(state => state.isSharedView);
  const showToast = useUIStore(state => state.showToast);
  const hideToast = useUIStore(state => state.hideToast);
  const openUrlModal = useUIStore(state => state.openUrlModal);
  const closeUrlModal = useUIStore(state => state.closeUrlModal);
  const openShareModal = useUIStore(state => state.openShareModal);
  const closeShareModal = useUIStore(state => state.closeShareModal);
  const setLoadingShared = useUIStore(state => state.setLoadingShared);
  const setSharedView = useUIStore(state => state.setSharedView);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isInitialLoadComplete = useRef(false);
  const dragStartPositionsRef = useRef<Map<string, Position>>(new Map());
  const draggingObjectRef = useRef<{ id: string; type: 'card' | 'sticker' } | null>(null);
  const lastDragDeltaRef = useRef<Position | null>(null);
  const stickerDroppedRef = useRef<boolean>(false); // 스티커 드롭 플래그
  const rafIdRef = useRef<number | null>(null); // RAF ID를 컴포넌트 레벨로 이동

  // 배경 설정 store
  const getCurrentBackground = useBackgroundStore(state => state.getCurrentBackground);
  const randomInterval = useBackgroundStore(state => state.randomInterval);
  const timedIntervalMinutes = useBackgroundStore(state => state.timedIntervalMinutes);
  const customMode = useBackgroundStore(state => state.customMode);
  const source = useBackgroundStore(state => state.source);
  const selectedSingleId = useBackgroundStore(state => state.selectedSingleId);
  const randomBackgroundIds = useBackgroundStore(state => state.randomBackgroundIds);
  const customBackgrounds = useBackgroundStore(state => state.customBackgrounds);

  // 설정 메뉴 상태 (외부에서 제어)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<string>('');

  // 공유 보기 전용 state (localStorage에 저장하지 않음)
  const [sharedCards, setSharedCards] = useState<Card[]>([]);

  // 줌/팬 기능 (모바일 뷰포트 대응)
  const { transform, isPanning, reset: resetZoom, handlers: zoomHandlers } = useZoomPan({
    minScale: 0.3,
    maxScale: 3,
    initialScale: 1,
  });

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 0. 이전 버전 데이터 마이그레이션 (한 번만 실행)
        const oldCards = localStorage.getItem('visionBoardItems');
        const newCards = localStorage.getItem('canvas-storage');

        // 새 키에 데이터가 없고, 이전 키에 데이터가 있으면 마이그레이션
        if (!newCards && oldCards) {
          try {
            const parsedOldCards: LegacyCard[] = JSON.parse(oldCards);
            // 기존 데이터 마이그레이션 (type 필드 제거)
            const migratedCards: Card[] = parsedOldCards.map((item) => {
              if (item.type === 'text') {
                return { id: item.id, position: item.position, text: item.text };
              } else if (item.type === 'image') {
                return { id: item.id, position: item.position, imageUrl: item.url || item.imageUrl };
              }
              // 이미 새 형식인 경우
              return {
                id: item.id,
                position: item.position,
                text: item.text,
                imageUrl: item.imageUrl,
                imageWidth: item.imageWidth,
                imageHeight: item.imageHeight,
                imageOffset: item.imageOffset,
              };
            });
            setCards(migratedCards);
            console.log('✅ 카드 데이터 마이그레이션 완료:', migratedCards.length, '개');

            // 마이그레이션 완료 후 구버전 키 삭제 (충돌 방지)
            localStorage.removeItem('visionBoardItems');
            console.log('✅ 구버전 카드 키 삭제 완료');
          } catch (e) {
            console.error('카드 마이그레이션 실패:', e);
          }
        }

        // 스티커 마이그레이션
        const oldStickers = localStorage.getItem('stickerPalette');
        const oldStickerInstances = localStorage.getItem('stickerInstances');
        const newStickers = localStorage.getItem('sticker-storage');

        if (!newStickers && (oldStickers || oldStickerInstances)) {
          try {
            if (oldStickers) {
              const parsedOldStickers = JSON.parse(oldStickers);
              setStickers(parsedOldStickers);
              console.log('✅ 스티커 팔레트 마이그레이션 완료:', parsedOldStickers.length, '개');
            }

            if (oldStickerInstances) {
              const parsedOldInstances = JSON.parse(oldStickerInstances);
              setInstances(parsedOldInstances);
              console.log('✅ 스티커 인스턴스 마이그레이션 완료:', parsedOldInstances.length, '개');
            }

            // 마이그레이션 완료 후 구버전 키 삭제 (충돌 방지)
            localStorage.removeItem('stickerPalette');
            localStorage.removeItem('stickerInstances');
            console.log('✅ 구버전 스티커 키 삭제 완료');
          } catch (e) {
            console.error('스티커 마이그레이션 실패:', e);
          }
        }

        // 1. URL 파라미터에서 공유된 ID 체크
        const urlParams = new URLSearchParams(window.location.search);
        const shareId = urlParams.get('id');
        const legacyData = urlParams.get('data');

        if (shareId && CONSTANTS.WORKER_URL) {
          setLoadingShared(true);
          try {
            const response = await fetch(`${CONSTANTS.WORKER_URL}/load?id=${shareId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.items) {
                // 만료 시간 체크
                if (data.expiresAt) {
                  const now = Date.now();
                  if (now > data.expiresAt) {
                    showToast('⏰ 공유 링크가 만료되었습니다');
                    window.history.replaceState({}, '', window.location.pathname);
                    return;
                  }
                }

                // 공유 보기용 state에만 저장 (localStorage 덮어쓰지 않음)
                setSharedCards(data.items);
                setSharedView(true);
                showToast(t.toast.sharedBoardLoaded);
                window.history.replaceState({}, '', window.location.pathname);
                return;
              }
            } else if (response.status === 404) {
              showToast('🔍 공유 링크를 찾을 수 없습니다 (만료되었거나 삭제됨)');
              window.history.replaceState({}, '', window.location.pathname);
              return;
            }
          } catch (error) {
            console.error('Failed to load shared data from Worker:', error);
            showToast(t.toast.sharedBoardFailed);
          } finally {
            setLoadingShared(false);
          }
        } else if (legacyData) {
          try {
            const jsonData = decodeURIComponent(atob(legacyData));
            const sharedItems = JSON.parse(jsonData) as Card[];
            // 공유 보기용 state에만 저장 (localStorage 덮어쓰지 않음)
            setSharedCards(sharedItems);
            setSharedView(true);
            showToast(t.toast.sharedBoardLoaded);
            window.history.replaceState({}, '', window.location.pathname);
            return;
          } catch (error) {
            console.error('Failed to load legacy shared data:', error);
          }
        }

        // 2. 스티커 데이터 로드 (기본 스티커 포함)
        // Zustand persist가 이미 데이터를 로드했는지 확인
        const currentStickers = useStickerStore.getState().palette;
        const currentInstances = useStickerStore.getState().instances;

        // Zustand에 데이터가 없을 때만 기본 스티커를 추가
        if (currentStickers.length === 0) {
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

          setStickers(defaultStickers);
          console.log('✅ 기본 스티커 로드 완료');
        } else {
          console.log('✅ Zustand에서 스티커 데이터 로드 완료:', currentStickers.length, '개');
        }

        if (currentInstances.length > 0) {
          console.log('✅ Zustand에서 스티커 인스턴스 로드 완료:', currentInstances.length, '개');
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('⚠️ 데이터를 불러오는데 실패했습니다');
      }
    };

    loadInitialData().then(() => {
      isInitialLoadComplete.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 배경 이미지 관리
  useEffect(() => {
    // 배경 설정이 변경될 때만 업데이트
    const newBackground = getCurrentBackground();
    setCurrentBackground(newBackground || '');
    // getCurrentBackground는 Zustand selector이므로 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, customMode, selectedSingleId, randomBackgroundIds, customBackgrounds]);

  // 타이머 기반 배경 랜덤 순환
  useEffect(() => {
    if (
      source === 'custom' &&
      customMode === 'random' &&
      randomInterval === 'timed' &&
      timedIntervalMinutes > 0
    ) {
      const intervalMs = timedIntervalMinutes * 60 * 1000;
      const timer = setInterval(() => {
        const newBackground = getCurrentBackground();
        if (newBackground) {
          setCurrentBackground(newBackground);
        }
      }, intervalMs);

      return () => clearInterval(timer);
    }
  }, [source, customMode, randomInterval, timedIntervalMinutes, getCurrentBackground]);

  // 브라우저 창 크기 변경 시 카드 위치 자동 조정
  useEffect(() => {
    if (isSharedView) {
      return;
    }

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        if (Math.abs(newWidth - viewport.width) < 1 && Math.abs(newHeight - viewport.height) < 1) {
          return;
        }

        const widthRatio = newWidth / viewport.width;
        const heightRatio = newHeight / viewport.height;

        const scaledCards = cards.map(item => ({
          ...item,
          position: {
            x: Math.max(0, Math.min(item.position.x * widthRatio, newWidth - 100)),
            y: Math.max(0, Math.min(item.position.y * heightRatio, newHeight - 100)),
          },
        }));

        setCards(scaledCards);
        setViewport({ width: newWidth, height: newHeight });
      }, CONSTANTS.DEBOUNCE_MS);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [viewport, isSharedView, cards, setCards, setViewport]);

  // 표시할 카드 결정 (공유 보기 vs 일반 모드)
  const displayCards = isSharedView ? sharedCards : cards;

  // 배경 새로고침 핸들러
  const handleRefreshBackground = useCallback(() => {
    if (source === 'system') {
      // 시스템 배경: getCurrentBackground()가 타임스탬프를 추가하므로 호출만 하면 됨
      const newBackground = getCurrentBackground();
      if (newBackground) {
        setCurrentBackground(newBackground);
      }
    } else if (source === 'custom' && customMode === 'random' && randomBackgroundIds.length > 0) {
      // 커스텀 배경 랜덤 모드: 새로운 랜덤 이미지 선택
      const newBackground = getCurrentBackground();
      if (newBackground) {
        setCurrentBackground(newBackground);
      }
    }
    // 커스텀 단일 모드는 새로고침 불필요 (동일한 이미지가 계속 표시됨)
  }, [source, customMode, randomBackgroundIds, getCurrentBackground]);

  // 카드 추가 핸들러
  const handleAddCard = useCallback(() => {
    if (!useCanvasStore.getState().canAddCard()) {
      showToast(t.toast.maxCards);
      return;
    }
    addCard();
  }, [addCard, showToast, t]);

  // 카드 및 스티커 위치 업데이트 (통합 핸들러)
  const handleObjectPositionChange = useCallback((
    id: string,
    type: 'card' | 'sticker',
    position: Position,
    delta?: Position
  ) => {
    const isMultiSelect = selectedCards.size > 1 || selectedStickers.size > 1 || (selectedCards.size > 0 && selectedStickers.size > 0);

    // 드래그 시작: 다중 선택 상태일 때, 시작 위치 저장
    if (delta && isMultiSelect && !draggingObjectRef.current) {
      draggingObjectRef.current = { id, type };
      dragStartPositionsRef.current.clear();
      cards.forEach(item => {
        if (selectedCards.has(item.id)) {
          dragStartPositionsRef.current.set(`card-${item.id}`, { ...item.position });
        }
      });
      stickerInstances.forEach(si => {
        if (selectedStickers.has(si.id)) {
          dragStartPositionsRef.current.set(`sticker-${si.id}`, { ...si.position });
        }
      });
    }

    // 드래그 중: 실시간 위치 업데이트
    if (delta) {
      lastDragDeltaRef.current = delta; // 마지막 델타 저장
      if (isMultiSelect) {
        // 다중 선택 드래그
        const updatedCards = cards.map(item => {
          const startPos = dragStartPositionsRef.current.get(`card-${item.id}`);
          if (startPos) {
            return { ...item, position: PositionUtils.add(startPos, delta) };
          }
          return item;
        });
        setCards(updatedCards);

        const updatedInstances = stickerInstances.map(si => {
          const startPos = dragStartPositionsRef.current.get(`sticker-${si.id}`);
          if (startPos) {
            return { ...si, position: PositionUtils.add(startPos, delta) };
          }
          return si;
        });
        setInstances(updatedInstances);
      } else {
        // 단일 선택 드래그
        if (type === 'card') {
          updateCard(Number(id), { position });
        } else {
          updateInstance(id, { position });
        }
      }
    }
    // 드래그 종료
    else {
      // 다중 드래그 세션이었는지 확인
      if (draggingObjectRef.current) {
        const finalDelta = lastDragDeltaRef.current;
        if (finalDelta) {
          const updatedCards = cards.map(item => {
            const startPos = dragStartPositionsRef.current.get(`card-${item.id}`);
            if (startPos) {
              return { ...item, position: PositionUtils.add(startPos, finalDelta) };
            }
            return item;
          });
          setCards(updatedCards);

          const updatedInstances = stickerInstances.map(si => {
            const startPos = dragStartPositionsRef.current.get(`sticker-${si.id}`);
            if (startPos) {
              return { ...si, position: PositionUtils.add(startPos, finalDelta) };
            }
            return si;
          });
          setInstances(updatedInstances);
        }
      } else {
        // 단일 드래그 종료
        if (type === 'card') {
          updateCard(Number(id), { position });
        } else {
          updateInstance(id, { position });
        }
      }

      // 드래그 상태 초기화
      draggingObjectRef.current = null;
      dragStartPositionsRef.current.clear();
      lastDragDeltaRef.current = null;
    }
  }, [cards, stickerInstances, selectedCards, selectedStickers, updateCard, setCards, updateInstance, setInstances]);


  // URL 입력 핸들러
  const handleRequestUrlInput = useCallback((id: number) => {
    openUrlModal(id);
  }, [openUrlModal]);

  const handleUrlSubmit = useCallback((url: string) => {
    if (urlInputItemId !== null) {
      updateCard(urlInputItemId, { imageUrl: url });
    }
    closeUrlModal();
  }, [urlInputItemId, updateCard, closeUrlModal]);

  // 복원 핸들러
  const handleRestore = useCallback((restoredItems: Card[]) => {
    setCards(restoredItems);
  }, [setCards]);

  // 공유 기능들
  const handleShareAsImage = useCallback(async () => {
    try {
      showToast(t.toast.imageGenerating);

      const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
      const element = document.querySelector('.relative.w-screen.h-screen') as HTMLElement;
      if (!element) {
        showToast(t.toast.captureError);
        return;
      }

      const images = element.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
          setTimeout(() => resolve(null), 3000);
        });
      });

      await Promise.all(imagePromises);
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas.default(element, {
        allowTaint: false,
        useCORS: true,
        backgroundColor: '#000000',
        scale: 1.5,
        logging: false,
        width: window.innerWidth,
        height: window.innerHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          if (element.classList.contains('fixed')) return true;
          if (element.classList.contains('opacity-0')) return true;
          const classList = Array.from(element.classList);
          if (classList.some(c => c.includes('group-hover'))) return true;
          return false;
        },
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          showToast(t.toast.imageFailed);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `vision-board-${timestamp}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(t.toast.imageDownloaded);
      }, 'image/png');
    } catch (error) {
      console.error('Image capture failed:', error);
      showToast(t.toast.imageFailed);
    }
  }, [showToast, t]);

  const handleShareAsLink = useCallback(async () => {
    try {
      showToast(t.toast.linkGenerating);

      if (CONSTANTS.WORKER_URL) {
        try {
          const response = await fetch(`${CONSTANTS.WORKER_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: displayCards }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          if (data.success && data.id) {
            const shareUrl = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
            await navigator.clipboard.writeText(shareUrl);
            showToast(t.toast.linkCopied);
            return;
          }
        } catch (workerError) {
          console.error('Worker share failed, falling back to legacy method:', workerError);
        }
      }

      // 레거시 방식
      const jsonData = JSON.stringify(displayCards);
      const base64Data = btoa(encodeURIComponent(jsonData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${base64Data}`;

      if (shareUrl.length > 2000) {
        showToast(t.toast.linkFailed);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      showToast(t.toast.linkCopied);
    } catch (error) {
      console.error('Link share failed:', error);
      showToast(t.toast.linkFailed);
    }
  }, [displayCards, showToast, t]);

  // 스티커 핸들러
  const handleStickerDragStart = useCallback((sticker: Sticker, e: React.MouseEvent) => {
    console.log('🟡 Drag start for', sticker.id, '- resetting dropped flag to false');
    stickerDroppedRef.current = false; // 드래그 시작 시 플래그 초기화

    setDraggingSticker(sticker);
    setDragGhostPosition({ x: e.clientX, y: e.clientY });

    // 이전 리스너가 있다면 제거 (안전장치)
    const handleMouseMove = (e: MouseEvent) => {
      // requestAnimationFrame으로 성능 최적화 및 호출 빈도 제한
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        setDragGhostPosition({ x: e.clientX, y: e.clientY });
        rafIdRef.current = null;
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      console.log('🔵 mouseup fired, dropped flag:', stickerDroppedRef.current);

      // RAF 클린업
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // 리스너 즉시 제거 (중복 실행 방지)
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // 최신 상태 확인 (클로저 문제 방지)
      const currentDraggingSticker = useStickerStore.getState().draggingSticker;

      // 중복 실행 방지
      if (stickerDroppedRef.current || !currentDraggingSticker || !canvasRef.current) {
        console.log('🔴 Early return - dropped:', stickerDroppedRef.current, 'dragging:', !!currentDraggingSticker, 'canvas:', !!canvasRef.current);
        setDraggingSticker(null);
        setDragGhostPosition(null);
        return;
      }

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dropX = e.clientX - canvasRect.left;
      const dropY = e.clientY - canvasRect.top;

      if (dropX >= 0 && dropX <= canvasRect.width && dropY >= 0 && dropY <= canvasRect.height) {
        stickerDroppedRef.current = true; // 드롭 완료 표시
        console.log('✅ Creating sticker instance, setting dropped flag to true');
        const newInstance: StickerInstance = {
          id: `sticker_inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          stickerId: currentDraggingSticker.id,
          imageUrl: currentDraggingSticker.imageUrl,
          position: { x: dropX - 40, y: dropY - 40 },
          size: { width: 80, height: 80 },
          zIndex: CONSTANTS.Z_INDEX.STICKER_BASE,
        };
        addInstance(newInstance);
      } else {
        console.log('❌ Drop outside canvas');
      }

      setDraggingSticker(null);
      setDragGhostPosition(null);
    };

    // 리스너 등록
    console.log('🟢 Registering event listeners for', sticker.id);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setDraggingSticker, setDragGhostPosition, addInstance]);

  // 줌/팬 이벤트 리스너 등록
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { onWheel, onTouchStart, onTouchMove, onTouchEnd } = zoomHandlers;

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [zoomHandlers]);

  // 드래그 박스 선택
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // 스티커 팔레트에서 드래그 중이면 선택 박스 비활성화
    if (draggingSticker) {
      return;
    }

    // .fixed 요소 클릭 체크 (팔레트, 설정 메뉴 등)
    const clickedFixed = (e.target as HTMLElement).closest('.fixed');

    // 팔레트나 설정 메뉴를 클릭한 경우 그대로 두기
    if (clickedFixed) {
      return;
    }

    // 캔버스 영역 클릭 시 팔레트나 설정 메뉴가 열려있으면 닫기
    if (isPaletteExpanded) {
      togglePalette();
      return;
    }
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }

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
    setSelecting(true);

    if (!e.ctrlKey && !e.metaKey) {
      clearSelection();
    }
  }, [draggingSticker, isPaletteExpanded, togglePalette, isSettingsOpen, setSelectionStart, setSelectionEnd, setSelecting, clearSelection]);

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
        setSelecting(false);
        return;
      }

      const selectionBox = {
        left: Math.min(selectionStart.x, selectionEnd.x),
        top: Math.min(selectionStart.y, selectionEnd.y),
        right: Math.max(selectionStart.x, selectionEnd.x),
        bottom: Math.max(selectionStart.y, selectionEnd.y),
      };

      const newSelectedCards = new Set(selectedCards);
      cards.forEach(item => {
        const cardRight = item.position.x + CONSTANTS.DEFAULT_CARD_WIDTH;
        const cardBottom = item.position.y + CONSTANTS.DEFAULT_CARD_HEIGHT;

        if (PositionUtils.isRectOverlap(
          { x: item.position.x, y: item.position.y, width: CONSTANTS.DEFAULT_CARD_WIDTH, height: CONSTANTS.DEFAULT_CARD_HEIGHT },
          { x: selectionBox.left, y: selectionBox.top, width: selectionBox.right - selectionBox.left, height: selectionBox.bottom - selectionBox.top }
        )) {
          newSelectedCards.add(item.id);
        }
      });

      const newSelectedStickers = new Set(selectedStickers);
      stickerInstances.forEach(sticker => {
        if (PositionUtils.isRectOverlap(
          { x: sticker.position.x, y: sticker.position.y, width: sticker.size.width, height: sticker.size.height },
          { x: selectionBox.left, y: selectionBox.top, width: selectionBox.right - selectionBox.left, height: selectionBox.bottom - selectionBox.top }
        )) {
          newSelectedStickers.add(sticker.id);
        }
      });

      useSelectionStore.setState({ selectedCards: newSelectedCards, selectedStickers: newSelectedStickers });
      setSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionStart, selectionEnd, cards, stickerInstances, selectedCards, selectedStickers, setSelecting, setSelectionStart, setSelectionEnd]);

  return (
    <div
      ref={canvasRef}
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center transition-all duration-1000 bg-black"
      style={{ backgroundImage: `url(${currentBackground})` }}
      onMouseDown={handleCanvasMouseDown}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}></div>

      {/* 공유 보기 모드 알림 */}
      {isSharedView && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
          style={{ zIndex: CONSTANTS.Z_INDEX.NOTIFICATION }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-sm font-medium">{t.sharedView.notice}</span>
        </div>
      )}

      {/* 줌 리셋 버튼 */}
      {(transform.scale !== 1 || transform.translateX !== 0 || transform.translateY !== 0) && (
        <button
          onClick={resetZoom}
          className="group fixed bottom-6 left-6 sm:bottom-8 sm:left-8 p-3 bg-white/20 text-white rounded-full shadow-lg backdrop-blur-lg hover:bg-white/30 active:bg-white/40 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 hover:shadow-xl"
          style={{ zIndex: CONSTANTS.Z_INDEX.UI_ELEMENTS }}
          aria-label="Reset zoom"
        >
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          {/* Tooltip */}
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-black/80 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            줌 리셋
          </span>
        </button>
      )}

      {/* 줌/팬 가능한 캔버스 래퍼 */}
      <div
        style={{
          transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: isPanning ? 'none' : 'transform 0.2s ease-out',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* 카드들 */}
        {displayCards.map((item, index) => (
        <CardComponent
          key={item.id}
          item={item}
          index={index}
          onPositionChange={(id, pos, delta) => handleObjectPositionChange(String(id), 'card', pos, delta)}
          onTextChange={(id, text) => updateCard(id, { text })}
          onImageChange={(id, imageUrl) => updateCard(id, { imageUrl })}
          onImageSizeChange={(id, width, height) => updateCard(id, { imageWidth: width, imageHeight: height })}
          onImageOffsetChange={(id, offset) => updateCard(id, { imageOffset: offset })}
          onDelete={deleteCard}
          onBringToFront={bringCardToFront}
          onRequestUrlInput={handleRequestUrlInput}
          isUrlModalOpen={urlInputItemId === item.id && showUrlModal}
          isReadOnly={isSharedView}
          isSelected={selectedCards.has(item.id)}
          onSelect={selectCard}
        />
      ))}

      {/* 스티커들 */}
      {stickerInstances.map((sticker, index) => (
        <StickerObject
          key={sticker.id}
          sticker={sticker}
          index={index}
          onPositionChange={(id, pos, delta) => handleObjectPositionChange(id, 'sticker', pos, delta)}
          onSizeChange={(id, size) => updateInstance(id, { size })}
          onDelete={deleteInstance}
          onBringToFront={bringInstanceToFront}
          isReadOnly={isSharedView}
          isSelected={selectedStickers.has(sticker.id)}
          onSelect={selectSticker}
        />
      ))}

        {/* 선택 박스 */}
        {isSelecting && selectionStart && selectionEnd &&
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
      </div>

      {/* 드래그 중인 고스트 이미지 */}
      {draggingSticker && dragGhostPosition && (
        <div
          className="fixed pointer-events-none animate-pulse"
          style={{
            left: `${dragGhostPosition.x - 40}px`,
            top: `${dragGhostPosition.y - 40}px`,
            width: '80px',
            height: '80px',
            opacity: 0.8,
            transform: 'scale(1.1)',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
            zIndex: CONSTANTS.Z_INDEX.DRAG_GHOST,
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
          onToggle={togglePalette}
          onAddSticker={addSticker}
          onDeleteSticker={(id) => {
            deleteSticker(id);
            // 해당 스티커로 만든 인스턴스도 모두 삭제
            const instancesToDelete = stickerInstances.filter(si => si.stickerId === id);
            instancesToDelete.forEach(si => deleteInstance(si.id));
          }}
          onDragStart={handleStickerDragStart}
        />
      )}

      <Toolbar
        onRefreshBackground={handleRefreshBackground}
        onShareClick={openShareModal}
        isSharedView={isSharedView}
      />
      {!isSharedView && (
        <>
          <AddCardButton onAddCard={handleAddCard} />
          <SettingsMenu
            items={displayCards}
            onRestore={handleRestore}
            onShowToast={showToast}
            isOpen={isSettingsOpen}
            onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
            onOpenBackgroundSettings={() => setIsBackgroundSettingsOpen(true)}
          />
        </>
      )}
      <LinksMenu />
      {toastMessage && (
        <Toast message={toastMessage} onClose={hideToast} />
      )}
      {showUrlModal && (
        <ImageUrlModal
          onSubmit={handleUrlSubmit}
          onClose={closeUrlModal}
        />
      )}
      {showShareModal && (
        <ShareModal
          onClose={closeShareModal}
          onShareAsImage={handleShareAsImage}
          onShareAsFile={() => showToast('파일 공유 기능은 추후 제공 예정입니다')}
          onShareAsLink={handleShareAsLink}
        />
      )}
      {isBackgroundSettingsOpen && (
        <BackgroundSettingsModal
          isOpen={isBackgroundSettingsOpen}
          onClose={() => setIsBackgroundSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
