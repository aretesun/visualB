import React, { useState, useRef, useEffect } from 'react';
import type { Card as CardType, Position, ResizeHandle } from '../../types';
import { CONSTANTS } from '../../utils/constants';
import { useDraggable } from '../../hooks/useDraggable';
import ImageSourceDropdown from '../ImageSourceDropdown';
import CardText from './CardText';
import CardImage from './CardImage';
import CardControls from './CardControls';

interface CardProps {
  item: CardType;
  index: number; // 렌더링 순서를 위한 인덱스
  onPositionChange: (id: number, position: Position, delta?: Position) => void;
  onTextChange: (id: number, text: string) => void;
  onImageChange: (id: number, imageUrl: string) => void;
  onImageSizeChange: (id: number, width: number, height: number) => void;
  onImageOffsetChange: (id: number, offset: Position) => void;
  onDelete: (id: number) => void;
  onBringToFront: (id: number) => void;
  onRequestUrlInput: (id: number) => void;
  onUpdate?: (id: number, updates: Partial<CardType>) => void;
  isUrlModalOpen?: boolean;
  isReadOnly?: boolean;
  isSelected?: boolean;
  onSelect?: (id: number, isCtrlPressed: boolean) => void;
}

/**
 * 비전보드 카드 컴포넌트
 * 텍스트와 이미지를 포함하는 드래그 가능한 카드
 */
const Card: React.FC<CardProps> = ({
  item,
  index,
  onPositionChange,
  onTextChange,
  onImageChange,
  onImageSizeChange,
  onImageOffsetChange,
  onDelete,
  onBringToFront,
  onRequestUrlInput,
  onUpdate,
  isUrlModalOpen = false,
  isReadOnly = false,
  isSelected = false,
  onSelect,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageAddButtonRef = useRef<HTMLDivElement>(null);
  const editImageButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);

  const { position, isDragging } = useDraggable({
    ref: itemRef,
    initialPosition: item.position,
    onDragMove: (newPosition, delta) => {
      if (onPositionChange) {
        onPositionChange(item.id, newPosition, delta);
      }
    },
    onDragEnd: (newPosition, delta) => {
      onPositionChange(item.id, newPosition);
    },
    disabled: false,
  });

  const [isEditingText, setIsEditingText] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isImageLocked, setIsImageLocked] = useState(true);

  const isEmpty = !item.text && !item.imageUrl;

  // 모바일 감지 (터치 디바이스)
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 새 카드 생성 시 데스크톱에서는 자동으로 텍스트 편집 모드 진입
  useEffect(() => {
    if (item.isNew && !isMobile && isEmpty) {
      setIsEditingText(true);
    }
  }, [item.isNew, isMobile, isEmpty]);

  // 텍스트나 이미지가 추가되면 isNew 플래그 해제
  useEffect(() => {
    if (item.isNew && onUpdate && !isEmpty) {
      onUpdate(item.id, { isNew: false });
    }
  }, [item.isNew, isEmpty, onUpdate, item.id]);

  // 편집 모드 종료 시 빈 카드면 isNew 플래그 해제하여 삭제 준비
  useEffect(() => {
    if (item.isNew && !isEditingText && isEmpty && onUpdate) {
      console.log('🔄 Card', item.id, ': Edit mode ended, clearing isNew flag');
      onUpdate(item.id, { isNew: false });
    }
  }, [item.isNew, isEditingText, isEmpty, onUpdate, item.id]);

  // 편집 모드를 벗어났을 때 텍스트도 이미지도 없으면 카드 삭제
  // 단, isNew 플래그가 true이면 삭제하지 않음 (새로 생성된 카드 보호)
  useEffect(() => {
    console.log('🧐 Card', item.id, 'delete check:', {
      isNew: item.isNew,
      isEditingText,
      hasText: !!item.text,
      hasImage: !!item.imageUrl,
      isSelectingFile,
      showDropdown,
      isUrlModalOpen
    });
    if (!item.isNew && !isEditingText && !item.text && !item.imageUrl && !isSelectingFile && !showDropdown && !isUrlModalOpen) {
      console.log('❌ Deleting card:', item.id);
      onDelete(item.id);
    }
  }, [item.isNew, isEditingText, item.text, item.imageUrl, isSelectingFile, showDropdown, isUrlModalOpen, item.id, onDelete]);

  const handleFocus = () => {
    onBringToFront(item.id);
  };

  const handleBlur = () => {
    // 포커스를 잃을 때 isNew 플래그 해제
    // (빈 카드면 자동 삭제 로직에 의해 삭제됨)
    if (item.isNew && onUpdate) {
      onUpdate(item.id, { isNew: false });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      const isCtrlPressed = e.ctrlKey || e.metaKey;
      onSelect(item.id, isCtrlPressed);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            reject(new Error('Canvas context not available'));
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
          const compressedImage = await compressImage(file);
          onImageChange(item.id, compressedImage);
          setIsEditingText(false);
        } catch (error) {
          console.error('이미지 압축 실패:', error);
          const reader = new FileReader();
          reader.onloadend = () => {
            onImageChange(item.id, reader.result as string);
            setIsEditingText(false);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        onImageChange(item.id, compressedImage);
        setIsEditingText(false);
        setIsSelectingFile(false);
      } catch (error) {
        console.error('이미지 압축 실패:', error);
        const reader = new FileReader();
        reader.onloadend = () => {
          onImageChange(item.id, reader.result as string);
          setIsEditingText(false);
          setIsSelectingFile(false);
        };
        reader.readAsDataURL(file);
      }
    }
    setTimeout(() => {
      setIsSelectingFile(false);
    }, 300);
  };

  const handleImageAddClick = () => {
    if (imageAddButtonRef.current) {
      const rect = imageAddButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        x: rect.left,
        y: rect.bottom + 8,
      });
    }
    setShowDropdown(true);
  };

  const handleUploadFile = () => {
    setIsSelectingFile(true);
    setIsEditingImage(false);

    const input = fileInputRef.current;
    if (input) {
      const handleCancel = () => {
        setIsSelectingFile(false);
        input.removeEventListener('cancel', handleCancel);
      };
      input.addEventListener('cancel', handleCancel, { once: true });
    }

    fileInputRef.current?.click();
  };

  const handleGenerateImage = () => {
    const imageGenerationUrl = 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221aXi6YoflGlRUunosVM7ZBJ7zlxxEiX_s%22%5D,%22action%22:%22open%22,%22userId%22:%22107412687269922622473%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing';
    window.open(imageGenerationUrl, '_blank');
    setIsEditingImage(false);
  };

  const handleAddByUrl = () => {
    onRequestUrlInput(item.id);
    setIsEditingImage(false);
  };

  const handleEditImage = () => {
    setIsEditingImage(true);
    if (editImageButtonRef.current) {
      const rect = editImageButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        x: rect.left,
        y: rect.bottom + 8,
      });
    }
    setShowDropdown(true);
  };

  const handleCloseEditImage = () => {
    setIsEditingImage(false);
    setShowDropdown(false);
  };

  // 카드 리사이즈 핸들러
  const handleResizeStart = (e: React.MouseEvent | React.PointerEvent, direction: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    onBringToFront(item.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startCardWidth = cardWidth;
    const startImageHeight = item.imageHeight || 160;
    const startImageWidth = item.imageWidth || 232;
    const startPosX = position.x;
    const startPosY = position.y;

    let resizeState = {
      cardWidth: startCardWidth,
      imageWidth: startImageWidth,
      imageHeight: startImageHeight,
      posX: startPosX,
      posY: startPosY,
    };

    const element = itemRef.current;
    if (!element) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newCardWidth = resizeState.cardWidth;
      let newImageHeight = resizeState.imageHeight;
      let newPosX = resizeState.posX;
      let newPosY = resizeState.posY;

      if (direction.includes('e')) {
        newCardWidth = Math.max(CONSTANTS.CARD_RESIZE_MIN_WIDTH, Math.min(CONSTANTS.CARD_RESIZE_MAX_WIDTH, startCardWidth + deltaX));
        newPosX = startPosX;
      }
      if (direction.includes('w')) {
        const proposedWidth = startCardWidth - deltaX;
        newCardWidth = Math.max(CONSTANTS.CARD_RESIZE_MIN_WIDTH, Math.min(CONSTANTS.CARD_RESIZE_MAX_WIDTH, proposedWidth));
        newPosX = startPosX + (startCardWidth - newCardWidth);
      }
      if (direction.includes('s')) {
        newImageHeight = Math.max(CONSTANTS.CARD_RESIZE_MIN_HEIGHT, Math.min(CONSTANTS.CARD_RESIZE_MAX_HEIGHT, startImageHeight + deltaY));
        newPosY = startPosY;
      }
      if (direction.includes('n')) {
        const proposedHeight = startImageHeight - deltaY;
        newImageHeight = Math.max(CONSTANTS.CARD_RESIZE_MIN_HEIGHT, Math.min(CONSTANTS.CARD_RESIZE_MAX_HEIGHT, proposedHeight));
        newPosY = startPosY + (startImageHeight - newImageHeight);
      }

      const newImageWidth = newCardWidth - 24;

      resizeState = {
        cardWidth: newCardWidth,
        imageWidth: newImageWidth,
        imageHeight: newImageHeight,
        posX: newPosX,
        posY: newPosY,
      };

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        element.style.cssText = `
          left: ${newPosX}px;
          top: ${newPosY}px;
          width: ${newCardWidth}px;
          touch-action: none;
          position: absolute;
        `;

        const imageElement = imageRef.current;
        if (imageElement) {
          imageElement.style.cssText = `
            width: ${newImageWidth}px;
            height: ${newImageHeight}px;
            position: relative;
            overflow: hidden;
            border-radius: 0.375rem;
            transition: none;
          `;
        }

        rafId = null;
      });
    };

    const handlePointerUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      setIsResizing(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);

      onImageSizeChange(item.id, resizeState.imageWidth, resizeState.imageHeight);
      onPositionChange(item.id, { x: resizeState.posX, y: resizeState.posY });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const cardWidth = item.imageUrl ? (item.imageWidth || 232) + 24 : 256;

  return (
    <div
      ref={itemRef}
      data-object="card"
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={(e) => {
        e.stopPropagation();
        handleFocus();
        handleClick(e);
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`absolute rounded-lg shadow-2xl transition-[transform,box-shadow] duration-200 ease-in-out cursor-grab flex flex-col group bg-white/10 backdrop-blur-xl border p-3 ${
        isDragging ? 'shadow-black/50 scale-105' : 'shadow-black/30'
      } ${isDragOver ? 'border-sky-400 border-2 bg-sky-500/20' : ''} ${
        isResizing ? 'cursor-nwse-resize' : ''
      } ${isSelected ? 'border-blue-400 border-2 ring-2 ring-blue-400/50' : 'border-white/20'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${cardWidth}px`,
        zIndex: isDragging ? CONSTANTS.Z_INDEX.CARD_DRAGGING : Math.min(CONSTANTS.Z_INDEX.CARD_BASE + index, CONSTANTS.Z_INDEX.CARD_BASE + 9),
        touchAction: 'none',
      }}
      tabIndex={0}
    >
      {/* 텍스트 컴포넌트 */}
      <CardText
        text={item.text}
        isEditing={isEditingText}
        hasImage={!!item.imageUrl}
        onTextChange={(text) => onTextChange(item.id, text)}
        onEditStart={() => {
          setIsEditingText(true);
          setShowDropdown(false); // 텍스트 편집 시작 시 이미지 옵션창 닫기
        }}
        onEditEnd={() => setIsEditingText(false)}
        onDelete={() => onDelete(item.id)}
      />

      {/* 이미지 컴포넌트 */}
      <CardImage
        imageUrl={item.imageUrl}
        imageWidth={item.imageWidth}
        imageHeight={item.imageHeight}
        imageOffset={item.imageOffset}
        isImageLocked={isImageLocked}
        isEmpty={isEmpty}
        onImageOffsetChange={(offset) => onImageOffsetChange(item.id, offset)}
        onBringToFront={() => onBringToFront(item.id)}
        onAddImageClick={handleImageAddClick}
        imageAddButtonRef={imageAddButtonRef}
        imageRef={imageRef}
      />

      {/* 이미지 소스 드롭다운 */}
      {showDropdown && (
        <ImageSourceDropdown
          onUploadFile={handleUploadFile}
          onGenerateImage={handleGenerateImage}
          onAddByUrl={handleAddByUrl}
          onClose={() => setShowDropdown(false)}
          position={dropdownPosition}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 컨트롤 버튼 */}
      <CardControls
        hasImage={!!item.imageUrl}
        hasText={!!item.text}
        isEditingText={isEditingText}
        isEditingImage={isEditingImage}
        isImageLocked={isImageLocked}
        isReadOnly={isReadOnly}
        onToggleLock={() => setIsImageLocked(!isImageLocked)}
        onEditText={() => setIsEditingText(true)}
        onSaveText={() => setIsEditingText(false)}
        onEditImage={handleEditImage}
        onCloseEditImage={handleCloseEditImage}
        onDelete={() => onDelete(item.id)}
        editImageButtonRef={editImageButtonRef}
      />

      {/* 리사이즈 핸들 */}
      <>
        {/* 모서리 */}
        <div
          data-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, CONSTANTS.RESIZE_HANDLES.SOUTH_EAST);
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ touchAction: 'none' }}
        />
        <div
          data-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, CONSTANTS.RESIZE_HANDLES.NORTH_EAST);
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ touchAction: 'none' }}
        />
        <div
          data-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, CONSTANTS.RESIZE_HANDLES.SOUTH_WEST);
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ touchAction: 'none' }}
        />
        <div
          data-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, CONSTANTS.RESIZE_HANDLES.NORTH_WEST);
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ touchAction: 'none' }}
        />

        {/* 변 */}
        <div
          data-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, CONSTANTS.RESIZE_HANDLES.EAST);
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-0 bottom-3 w-1 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ touchAction: 'none' }}
        />
        <div
          data-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, CONSTANTS.RESIZE_HANDLES.WEST);
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 left-0 bottom-3 w-1 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ touchAction: 'none' }}
        />
        <div
          data-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, CONSTANTS.RESIZE_HANDLES.SOUTH);
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-3 right-3 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ touchAction: 'none' }}
        />
        <div
          data-resize-handle
          onPointerDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, CONSTANTS.RESIZE_HANDLES.NORTH);
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 left-3 right-3 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ touchAction: 'none' }}
        />
      </>
    </div>
  );
};

// React.memo로 최적화
export default React.memo(Card, (prev, next) => {
  if (prev.item.id !== next.item.id) return false;
  if (
    prev.item.position.x !== next.item.position.x ||
    prev.item.position.y !== next.item.position.y
  ) {
    return false;
  }
  if (prev.item.text !== next.item.text) return false;
  if (prev.item.imageUrl !== next.item.imageUrl) return false;
  if (prev.item.imageWidth !== next.item.imageWidth) return false;
  if (prev.item.imageHeight !== next.item.imageHeight) return false;
  if (
    prev.item.imageOffset?.x !== next.item.imageOffset?.x ||
    prev.item.imageOffset?.y !== next.item.imageOffset?.y
  ) {
    return false;
  }
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.isReadOnly !== next.isReadOnly) return false;
  if (prev.isUrlModalOpen !== next.isUrlModalOpen) return false;
  return true;
});
