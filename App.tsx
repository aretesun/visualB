import React, { useEffect, useCallback, useRef } from 'react';
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
import { useCanvasStore, useStickerStore, useSelectionStore, useUIStore } from './store/useStore';
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
  const dragStartPositionsRef = useRef<Map<number | string, Position>>(new Map());
  const draggingObjectRef = useRef<number | string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
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
                const currentLocal = localStorage.getItem(CONSTANTS.STORAGE_KEYS.CARDS);
                if (currentLocal) {
                  sessionStorage.setItem('backupLocalData', currentLocal);
                }

                setCards(data.items);
                setSharedView(true);
                showToast(t.toast.sharedBoardLoaded);
                window.history.replaceState({}, '', window.location.pathname);
                return;
              }
            }
          } catch (error) {
            console.error('Failed to load shared data from Worker:', error);
            showToast(t.toast.sharedBoardFailed);
          } finally {
            setLoadingShared(false);
          }
        } else if (legacyData) {
          try {
            const currentLocal = localStorage.getItem(CONSTANTS.STORAGE_KEYS.CARDS);
            if (currentLocal) {
              sessionStorage.setItem('backupLocalData', currentLocal);
            }

            const jsonData = decodeURIComponent(atob(legacyData));
            const sharedItems = JSON.parse(jsonData) as Card[];
            setCards(sharedItems);
            setSharedView(true);
            showToast(t.toast.sharedBoardLoaded);
            window.history.replaceState({}, '', window.location.pathname);
            return;
          } catch (error) {
            console.error('Failed to load legacy shared data:', error);
          }
        }

        // 2. 스티커 데이터 로드 (기본 스티커 포함)
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

        const savedStickers = localStorage.getItem(CONSTANTS.STORAGE_KEYS.STICKERS);
        if (savedStickers) {
          try {
            const parsedStickers = JSON.parse(savedStickers);
            const defaultStickerIds = new Set(defaultStickers.map(ds => ds.id));

            const uniqueStickers: Sticker[] = [];
            const seenIds = new Set<string>();

            parsedStickers.forEach((s: Sticker) => {
              if (!seenIds.has(s.id)) {
                seenIds.add(s.id);
                if (defaultStickerIds.has(s.id)) {
                  uniqueStickers.push({ ...s, isPremade: true });
                } else {
                  uniqueStickers.push(s);
                }
              }
            });

            const missingDefaultStickers = defaultStickers.filter(ds => !seenIds.has(ds.id));
            const finalStickers = [...uniqueStickers, ...missingDefaultStickers];
            setStickers(finalStickers);

            localStorage.setItem(CONSTANTS.STORAGE_KEYS.STICKERS, JSON.stringify(finalStickers));
          } catch (e) {
            console.error('Failed to load stickers:', e);
            setStickers(defaultStickers);
          }
        } else {
          setStickers(defaultStickers);
        }

        const savedStickerInstances = localStorage.getItem(CONSTANTS.STORAGE_KEYS.STICKER_INSTANCES);
        if (savedStickerInstances) {
          try {
            const parsedInstances = JSON.parse(savedStickerInstances);
            setInstances(parsedInstances);
          } catch (e) {
            console.error('Failed to load sticker instances:', e);
          }
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

  // 초기 배경 설정
  useEffect(() => {
    refreshBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // 카드 추가 핸들러
  const handleAddCard = useCallback(() => {
    if (!useCanvasStore.getState().canAddCard()) {
      showToast(t.toast.maxCards);
      return;
    }
    addCard();
  }, [addCard, showToast, t]);

  // 카드 위치 업데이트 (멀티 선택 지원)
  const updateItemPosition = useCallback((id: number, position: Position, delta?: Position) => {
    if (delta && selectedCards.has(id) && (selectedCards.size > 1 || selectedStickers.size > 0)) {
      if (draggingObjectRef.current === null) {
        draggingObjectRef.current = id;
        cards.forEach(item => {
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

      const updatedCards = cards.map(item => {
        if (item.id === id) {
          return { ...item, position };
        } else if (selectedCards.has(item.id)) {
          const startPos = dragStartPositionsRef.current.get(item.id);
          if (startPos) {
            return {
              ...item,
              position: PositionUtils.add(startPos, delta),
            };
          }
        }
        return item;
      });

      setCards(updatedCards);

      if (selectedStickers.size > 0) {
        const updatedInstances = stickerInstances.map(si => {
          if (selectedStickers.has(si.id)) {
            const startPos = dragStartPositionsRef.current.get(si.id);
            if (startPos) {
              return {
                ...si,
                position: PositionUtils.add(startPos, delta),
              };
            }
          }
          return si;
        });
        setInstances(updatedInstances);
      }
    } else {
      updateCard(id, { position });
      dragStartPositionsRef.current.clear();
      draggingObjectRef.current = null;
    }
  }, [cards, stickerInstances, selectedCards, selectedStickers, updateCard, setCards, setInstances]);

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
            body: JSON.stringify({ items: cards }),
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
      const jsonData = JSON.stringify(cards);
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
  }, [cards, showToast, t]);

  // 스티커 핸들러
  const handleStickerDragStart = useCallback((sticker: Sticker, e: React.MouseEvent) => {
    setDraggingSticker(sticker);
    setDragGhostPosition({ x: e.clientX, y: e.clientY });
  }, [setDraggingSticker, setDragGhostPosition]);

  const handleStickerPositionChange = useCallback((id: string, position: Position, delta?: Position) => {
    if (delta && selectedStickers.has(id) && (selectedStickers.size > 1 || selectedCards.size > 0)) {
      if (draggingObjectRef.current === null) {
        draggingObjectRef.current = id;
        stickerInstances.forEach(si => {
          if (selectedStickers.has(si.id)) {
            dragStartPositionsRef.current.set(si.id, { ...si.position });
          }
        });
        cards.forEach(item => {
          if (selectedCards.has(item.id)) {
            dragStartPositionsRef.current.set(item.id, { ...item.position });
          }
        });
      }

      const updatedInstances = stickerInstances.map(si => {
        if (si.id === id) {
          return { ...si, position };
        } else if (selectedStickers.has(si.id)) {
          const startPos = dragStartPositionsRef.current.get(si.id);
          if (startPos) {
            return { ...si, position: PositionUtils.add(startPos, delta) };
          }
        }
        return si;
      });

      setInstances(updatedInstances);

      if (selectedCards.size > 0) {
        const updatedCards = cards.map(item => {
          if (selectedCards.has(item.id)) {
            const startPos = dragStartPositionsRef.current.get(item.id);
            if (startPos) {
              return { ...item, position: PositionUtils.add(startPos, delta) };
            }
          }
          return item;
        });
        setCards(updatedCards);
      }
    } else {
      updateInstance(id, { position });
      dragStartPositionsRef.current.clear();
      draggingObjectRef.current = null;
    }
  }, [stickerInstances, cards, selectedStickers, selectedCards, updateInstance, setInstances, setCards]);

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

      if (dropX >= 0 && dropX <= canvasRect.width && dropY >= 0 && dropY <= canvasRect.height) {
        const newInstance: StickerInstance = {
          id: `sticker_inst_${Date.now()}`,
          stickerId: draggingSticker.id,
          imageUrl: draggingSticker.imageUrl,
          position: { x: dropX - 40, y: dropY - 40 },
          size: { width: 80, height: 80 },
          zIndex: 1000 + stickerInstances.length,
        };
        addInstance(newInstance);
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
  }, [draggingSticker, stickerInstances, addInstance, setDraggingSticker, setDragGhostPosition]);

  // 드래그 박스 선택
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.fixed')) {
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
  }, [setSelectionStart, setSelectionEnd, setSelecting, clearSelection]);

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
        </div>
      )}

      {/* 카드들 */}
      {cards.map((item) => (
        <VisionItem
          key={item.id}
          item={item}
          onPositionChange={updateItemPosition}
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
      {stickerInstances.map((sticker) => (
        <StickerObject
          key={sticker.id}
          sticker={sticker}
          onPositionChange={handleStickerPositionChange}
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
        onRefreshBackground={refreshBackground}
        onShareClick={openShareModal}
        isSharedView={isSharedView}
      />
      {!isSharedView && (
        <>
          <AddCardButton onAddCard={handleAddCard} />
          <SettingsMenu
            items={cards}
            onRestore={handleRestore}
            onShowToast={showToast}
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
    </div>
  );
};

export default App;
