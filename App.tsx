import React, { useState, useEffect, useCallback } from 'react';
import { Card, Position } from './types';
import VisionItem from './components/VisionItem';
import Toolbar from './components/Toolbar';
import AddCardButton from './components/AddCardButton';
import LinksMenu from './components/LinksMenu';
import Toast from './components/Toast';
import SettingsMenu from './components/SettingsMenu';
import ImageUrlModal from './components/ImageUrlModal';
import ShareModal from './components/ShareModal';

const MAX_CARDS = 100;

// Cloudflare Worker API URL
// 배포 후 여기에 실제 Worker URL을 입력하세요
// 예: 'https://vision-board-api.your-username.workers.dev'
const WORKER_URL = import.meta.env.VITE_WORKER_URL || '';

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
                setItems(data.items);
                setIsSharedView(true); // 공유 보기 모드 활성화
                setToastMessage('🎉 공유된 비전보드를 불러왔습니다!');
                // URL 파라미터 제거 (깔끔하게)
                window.history.replaceState({}, '', window.location.pathname);
                return;
              }
            }
          } catch (error) {
            console.error('Failed to load shared data from Worker:', error);
            setToastMessage('⚠️ 공유된 비전보드를 불러오는데 실패했습니다');
          } finally {
            setIsLoadingShared(false);
          }
        } else if (legacyData) {
          // 기존 base64 방식 (호환성 유지)
          try {
            const jsonData = decodeURIComponent(atob(legacyData));
            const sharedItems = JSON.parse(jsonData) as Card[];
            setItems(sharedItems);
            setIsSharedView(true); // 공유 보기 모드 활성화
            setToastMessage('🎉 공유된 비전보드를 불러왔습니다!');
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
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setToastMessage('⚠️ 데이터를 불러오는데 실패했습니다');
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 초기 로드 시에만 배경 이미지 설정
    refreshBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 마운트 시에만 실행

  useEffect(() => {
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

  // 브라우저 창 크기 변경 시 카드 위치 자동 조정
  useEffect(() => {
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
  }, [viewportSize]);

  // 빈 카드 생성
  const addCard = () => {
    if (items.length >= MAX_CARDS) {
      setToastMessage('너무 꿈이 많아요. 오래된 기억은 지워주세요.');
      return;
    }

    const newItem: Card = {
      id: nextId,
      position: { x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 },
    };
    setItems([...items, newItem]);
    setNextId(prevId => prevId + 1);
  };

  const updateItemPosition = (id: number, position: Position) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, position } : item))
    );
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

  const handleRestore = (restoredItems: Card[]) => {
    setItems(restoredItems);
    // nextId를 복원된 아이템들 중 최대 id + 1로 설정
    const maxId = restoredItems.reduce((max, item) => Math.max(max, item.id), 0);
    setNextId(maxId + 1);
  };

  // 공유 기능들
  const handleShareAsImage = async () => {
    try {
      setToastMessage('이미지를 생성하는 중...');

      // html2canvas를 동적으로 로드
      const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');

      // 현재 화면을 캡처할 대상 요소
      const element = document.querySelector('.relative.w-screen.h-screen') as HTMLElement;
      if (!element) {
        setToastMessage('화면 캡처에 실패했습니다');
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
          setToastMessage('이미지 생성에 실패했습니다');
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

        setToastMessage('이미지가 다운로드되었습니다! 🎉');
      }, 'image/png');
    } catch (error) {
      console.error('Image capture failed:', error);
      setToastMessage('이미지 다운로드 중 오류가 발생했습니다');
    }
  };

  const handleShareAsFile = () => {
    // 비활성화된 기능 (추후 병합 기능과 함께 구현)
    setToastMessage('파일 공유 기능은 추후 제공 예정입니다');
  };

  const handleShareAsLink = async () => {
    try {
      setToastMessage('🔗 링크 생성 중...');

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

            setToastMessage(`✨ 링크 복사 완료! (${shareUrl.length}자, 3일간 유효)`);
            return;
          }
        } catch (workerError) {
          console.error('Worker share failed, falling back to legacy method:', workerError);
          setToastMessage('⚠️ 서버 연결 실패, 로컬 방식으로 전환합니다...');
          // 폴백: 기존 방식 계속 진행
        }
      }

      // 기존 방식 (Worker 미설정 또는 실패 시)
      const jsonData = JSON.stringify(items);
      const base64Data = btoa(encodeURIComponent(jsonData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${base64Data}`;

      if (shareUrl.length > 2000) {
        setToastMessage('⚠️ 카드가 너무 많아 링크가 너무 깁니다. Worker를 설정하면 해결됩니다.');
      }

      await navigator.clipboard.writeText(shareUrl);
      setToastMessage(`🔗 링크 복사 완료! (${shareUrl.length}자)`);
    } catch (error) {
      console.error('Link share failed:', error);
      setToastMessage('❌ 링크 생성 중 오류가 발생했습니다');
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center transition-all duration-1000 bg-black"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}></div>

      {/* 공유 보기 모드 알림 */}
      {isSharedView && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-sm font-medium">공유된 비전보드 보기 (읽기 전용)</span>
          <button
            onClick={() => {
              setIsSharedView(false);
              setItems([]);
              window.location.reload();
            }}
            className="ml-2 text-xs underline hover:text-white/80"
          >
            내 보드로 돌아가기
          </button>
        </div>
      )}

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
        />
      ))}

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
