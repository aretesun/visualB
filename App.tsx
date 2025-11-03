import React, { useState, useEffect, useCallback } from 'react';
import { Card, Position, Connection } from './types';
import VisionItem from './components/VisionItem';
import Toolbar from './components/Toolbar';
import AddCardButton from './components/AddCardButton';
import LinksMenu from './components/LinksMenu';
import Toast from './components/Toast';
import SettingsMenu from './components/SettingsMenu';
import ConnectionLines from './components/ConnectionLines';

const MAX_CARDS = 100;

// 자연, 풍경, 여행 테마의 배경 이미지들
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop', // 산 풍경
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop', // 해변
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop', // 산과 호수
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop', // 자연 풍경
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop', // 숲
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop', // 여행지
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop', // 산
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop', // 자연
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop', // 호수
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop', // 숲길
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

  // 연결선 상태 관리
  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const savedConnections = localStorage.getItem('visionBoardConnections');
      return savedConnections ? JSON.parse(savedConnections) : [];
    } catch (error) {
      console.error("Failed to load connections from localStorage", error);
      return [];
    }
  });

  const [connectionMode, setConnectionMode] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

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
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('visionBoardConnections', JSON.stringify(connections));
    } catch (error) {
      console.error("Failed to save connections to localStorage", error);
    }
  }, [connections]);

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

  const deleteItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    // 카드 삭제 시 관련 연결선도 삭제
    setConnections(prevConnections =>
      prevConnections.filter(conn => conn.fromCardId !== id && conn.toCardId !== id)
    );
  };

  // 연결선 관련 함수들
  const handleCardClick = (cardId: number) => {
    if (!connectionMode) return;

    if (selectedCard === null) {
      // 첫 번째 카드 선택
      setSelectedCard(cardId);
      setToastMessage('연결할 두 번째 카드를 선택하세요');
    } else if (selectedCard === cardId) {
      // 같은 카드를 다시 클릭하면 선택 취소
      setSelectedCard(null);
      setToastMessage('');
    } else {
      // 두 번째 카드 선택 - 연결 생성
      const newConnection: Connection = {
        id: `${selectedCard}-${cardId}-${Date.now()}`,
        fromCardId: selectedCard,
        toCardId: cardId,
        color: '#ef4444',
        style: 'solid'
      };
      setConnections(prev => [...prev, newConnection]);
      setSelectedCard(null);
      setToastMessage('연결 완료!');
    }
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(prevConnections =>
      prevConnections.filter(conn => conn.id !== connectionId)
    );
  };

  const toggleConnectionMode = () => {
    setConnectionMode(prev => !prev);
    setSelectedCard(null);
    if (!connectionMode) {
      setToastMessage('연결 모드: 카드를 클릭하여 연결하세요');
    } else {
      setToastMessage('');
    }
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
      <div className="absolute inset-0 z-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}></div>

      {/* 연결선 레이어 */}
      <ConnectionLines
        connections={connections}
        cards={items}
        onDeleteConnection={deleteConnection}
      />

      {items.map((item) => (
        <VisionItem
          key={item.id}
          item={item}
          onPositionChange={updateItemPosition}
          onTextChange={updateItemText}
          onImageChange={updateItemImage}
          onDelete={deleteItem}
          onBringToFront={bringToFront}
          onClick={() => handleCardClick(item.id)}
          isSelected={connectionMode && selectedCard === item.id}
          isConnectionMode={connectionMode}
        />
      ))}

      <Toolbar
        onRefreshBackground={refreshBackground}
        onToggleConnectionMode={toggleConnectionMode}
        isConnectionMode={connectionMode}
      />
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
    </div>
  );
};

export default App;
