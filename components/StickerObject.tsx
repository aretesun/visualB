import React, { useRef } from 'react';
import { StickerInstance, Position, Size } from '../types';
import { useDraggable } from '../hooks/useDraggable';
import { TrashIcon } from './Icons';

interface StickerObjectProps {
  sticker: StickerInstance;
  onPositionChange: (id: string, position: Position, delta?: Position) => void;
  onSizeChange: (id: string, size: Size) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  isReadOnly?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, isCtrlPressed: boolean) => void;
}

const StickerObject: React.FC<StickerObjectProps> = ({
  sticker,
  onPositionChange,
  onSizeChange,
  onDelete,
  onBringToFront,
  isReadOnly = false,
  isSelected = false,
  onSelect
}) => {
  const stickerRef = useRef<HTMLDivElement>(null);

  const { position, isDragging } = useDraggable({
    ref: stickerRef,
    initialPosition: sticker.position,
    onDragMove: (newPosition, delta) => {
      // 드래그 중 실시간으로 다른 선택된 스티커들도 함께 이동
      if (onPositionChange) {
        onPositionChange(sticker.id, newPosition, delta);
      }
    },
    onDragEnd: (newPosition, delta) => {
      // 드래그 종료 시 최종 위치 업데이트 (delta 없이 호출하여 초기화)
      onPositionChange(sticker.id, newPosition);
    },
    disabled: isReadOnly,
  });

  const handleFocus = () => {
    onBringToFront(sticker.id);
  };

  // 리사이즈 핸들러 (모든 방향)
  const handleResizeStart = (e: React.MouseEvent | React.PointerEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    onBringToFront(sticker.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = sticker.size.width;
    const startHeight = sticker.size.height;
    const startPosX = position.x;
    const startPosY = position.y;

    // 종횡비 유지
    const aspectRatio = startWidth / startHeight;

    const element = stickerRef.current;
    if (!element) return;

    let rafId: number | null = null;
    // 최종 크기 및 위치 저장 (getBoundingClientRect 대신 사용)
    let finalWidth = startWidth;
    let finalHeight = startHeight;
    let finalPosX = startPosX;
    let finalPosY = startPosY;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newPosX = startPosX;
      let newPosY = startPosY;

      // 방향에 따라 크기 조절 (종횡비 유지)
      if (direction.includes('e')) {
        newWidth = Math.max(40, Math.min(400, startWidth + deltaX));
        newHeight = newWidth / aspectRatio;
      } else if (direction.includes('w')) {
        newWidth = Math.max(40, Math.min(400, startWidth - deltaX));
        newHeight = newWidth / aspectRatio;
        newPosX = startPosX + (startWidth - newWidth);
      } else if (direction.includes('s')) {
        newHeight = Math.max(40, Math.min(400, startHeight + deltaY));
        newWidth = newHeight * aspectRatio;
      } else if (direction.includes('n')) {
        newHeight = Math.max(40, Math.min(400, startHeight - deltaY));
        newWidth = newHeight * aspectRatio;
        newPosY = startPosY + (startHeight - newHeight);
      }

      // 대각선 방향 처리
      if (direction === 'se' || direction === 'nw' || direction === 'ne' || direction === 'sw') {
        const avgDelta = (Math.abs(deltaX) + Math.abs(deltaY)) / 2;
        const sign = (deltaX + deltaY) > 0 ? 1 : -1;

        if (direction === 'se') {
          newWidth = Math.max(40, Math.min(400, startWidth + avgDelta * sign));
        } else if (direction === 'nw') {
          newWidth = Math.max(40, Math.min(400, startWidth - avgDelta * sign));
          newPosX = startPosX + (startWidth - newWidth);
          newPosY = startPosY + (startHeight - newWidth / aspectRatio);
        } else if (direction === 'ne') {
          newWidth = Math.max(40, Math.min(400, startWidth + deltaX));
          newPosY = startPosY + (startHeight - newWidth / aspectRatio);
        } else if (direction === 'sw') {
          newWidth = Math.max(40, Math.min(400, startWidth - deltaX));
          newPosX = startPosX + (startWidth - newWidth);
        }
        newHeight = newWidth / aspectRatio;
      }

      // 최종 값 저장
      finalWidth = newWidth;
      finalHeight = newHeight;
      finalPosX = newPosX;
      finalPosY = newPosY;

      // 이전 RAF 취소
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // DOM 업데이트
      rafId = requestAnimationFrame(() => {
        element.style.cssText = `
          left: ${newPosX}px;
          top: ${newPosY}px;
          width: ${newWidth}px;
          height: ${newHeight}px;
          touch-action: none;
          position: absolute;
        `;
        rafId = null;
      });
    };

    const handlePointerUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);

      // 계산된 최종 값 사용 (getBoundingClientRect 대신)
      onSizeChange(sticker.id, {
        width: finalWidth,
        height: finalHeight,
      });
      onPositionChange(sticker.id, {
        x: finalPosX,
        y: finalPosY,
      });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      const isCtrlPressed = e.ctrlKey || e.metaKey;
      onSelect(sticker.id, isCtrlPressed);
    }
  };

  return (
    <div
      ref={stickerRef}
      data-object="sticker"
      onFocus={handleFocus}
      onMouseDown={(e) => {
        e.stopPropagation(); // 캔버스 선택 박스 방지
        handleFocus();
        handleClick(e);
      }}
      className={`absolute cursor-move group ${
        isDragging ? 'z-50' : ''
      } ${isSelected ? 'ring-2 ring-blue-400 rounded' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${sticker.size.width}px`,
        height: `${sticker.size.height}px`,
        zIndex: sticker.zIndex,
        touchAction: 'none',
      }}
      tabIndex={0}
    >
      {/* 스티커 이미지 */}
      <img
        src={sticker.imageUrl}
        alt="Sticker"
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable="false"
        style={{
          filter: isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' : 'none',
        }}
      />

      {/* 삭제 버튼 - 읽기 전용 모드에서 숨김 */}
      {!isReadOnly && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sticker.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-md shadow-lg"
            aria-label="Delete sticker"
          >
            <TrashIcon className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* 리사이즈 핸들 (모서리만) */}
      {!isReadOnly && (
        <>
          {/* 우하단 */}
          <div
            data-resize-handle
            onPointerDown={(e) => handleResizeStart(e, 'se')}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full"
            style={{ touchAction: 'none' }}
          />
          {/* 우상단 */}
          <div
            data-resize-handle
            onPointerDown={(e) => handleResizeStart(e, 'ne')}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full"
            style={{ touchAction: 'none' }}
          />
          {/* 좌하단 */}
          <div
            data-resize-handle
            onPointerDown={(e) => handleResizeStart(e, 'sw')}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full"
            style={{ touchAction: 'none' }}
          />
          {/* 좌상단 */}
          <div
            data-resize-handle
            onPointerDown={(e) => handleResizeStart(e, 'nw')}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full"
            style={{ touchAction: 'none' }}
          />
        </>
      )}
    </div>
  );
};

export default StickerObject;
