import React, { useState, useEffect, useCallback } from 'react';
import { Card, Position } from './types';
import VisionItem from './components/VisionItem';
import Toolbar from './components/Toolbar';
import AddCardButton from './components/AddCardButton';
import LinksMenu from './components/LinksMenu';
import Toast from './components/Toast';
import SettingsMenu from './components/SettingsMenu';
import ImageUrlModal from './components/ImageUrlModal';

const MAX_CARDS = 100;

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
  const [items, setItems] = useState<Card[]>(() => {
    try {
      const savedItems = localStorage.getItem('visionBoardItems');
      const parsedItems = savedItems ? JSON.parse(savedItems) : [];
      // 기존 데이터 마이그레이션: type 기반 데이터를 새 구조로 변환
      return parsedItems.map((item: any) => {
        if (item.type === 'text') {
          return { id: item.id, position: item.position, text: item.text };
        } else if (item.type === 'image') {
          return { id: item.id, position: item.position, imageUrl: item.url };
        }
        return item;
      });
    } catch (error) {
      console.error("Failed to load items from localStorage", error);
      return [];
    }
  });

  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [nextId, setNextId] = useState<number>(() => {
    const maxId = items.reduce((max, item) => Math.max(max, item.id), 0);
    return maxId + 1;
  });
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showUrlModal, setShowUrlModal] = useState<boolean>(false);
  const [urlInputItemId, setUrlInputItemId] = useState<number | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const refreshBackground = useCallback(() => {
    // 배경 이미지 배열에서 랜덤하게 선택
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex]);
  }, []);

  useEffect(() => {
    // 초기 로드 시에만 배경 이미지 설정
    refreshBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 마운트 시에만 실행

  useEffect(() => {
    try {
      localStorage.setItem('visionBoardItems', JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save items to localStorage", error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        setToastMessage('저장 공간이 부족합니다. 일부 카드를 삭제하거나 URL로 이미지를 추가해주세요.');
      }
    }
  }, [items]);

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

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center transition-all duration-1000 bg-black"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}></div>

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
        />
      ))}

      <Toolbar onRefreshBackground={refreshBackground} />
      <AddCardButton onAddCard={addCard} />
      <LinksMenu />
      <SettingsMenu
        items={items}
        onRestore={handleRestore}
        onShowToast={setToastMessage}
      />
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}
      {showUrlModal && (
        <ImageUrlModal
          onSubmit={handleUrlSubmit}
          onClose={() => setShowUrlModal(false)}
        />
      )}
    </div>
  );
};

export default App;
