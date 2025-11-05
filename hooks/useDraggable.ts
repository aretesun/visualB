
import { useState, useEffect, useRef, RefObject } from 'react';
import type { Position } from '../types';

interface DraggableOptions {
  ref: RefObject<HTMLElement>;
  handleRef?: RefObject<HTMLElement>;
  initialPosition?: Position;
  onDragEnd?: (position: Position) => void;
}

export const useDraggable = ({ ref, handleRef, initialPosition = { x: 0, y: 0 }, onDragEnd }: DraggableOptions) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // initialPosition이 변경되면 position도 업데이트 (드래그 중이 아닐 때만)
  useEffect(() => {
    if (!isDragging) {
      setPosition(initialPosition);
    }
  }, [initialPosition.x, initialPosition.y, isDragging]);

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const targetElement = e.target as HTMLElement;
    const dragHandle = handleRef?.current;

    if (dragHandle) {
        // If a specific handle is provided, only allow dragging from it.
        if (!dragHandle.contains(targetElement)) {
            return;
        }
    } else {
        // Otherwise, allow dragging from the whole element, except interactive parts.
        if (targetElement.closest('button, textarea, a, input, select, [data-resize-handle]')) {
            return;
        }
        // 이미지 위치 잠금 해제 상태면 카드 드래그 금지
        const imgElement = targetElement.closest('img[data-image-unlocked]');
        if (imgElement) {
            return;
        }
    }
    
    if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        offsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        setIsDragging(true);
        e.preventDefault();
        e.stopPropagation();
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    let newX = e.clientX - offsetRef.current.x;
    let newY = e.clientY - offsetRef.current.y;
    
    // Boundary checks
    newX = Math.max(0, Math.min(newX, window.innerWidth - (ref.current?.offsetWidth || 0)));
    newY = Math.max(0, Math.min(newY, window.innerHeight - (ref.current?.offsetHeight || 0)));

    setPosition({ x: newX, y: newY });
  };
  
  const onPointerUp = () => {
    if (!isDraggingRef.current) return;
    setIsDragging(false);
    
    let finalX = position.x;
    let finalY = position.y;
    
    finalX = Math.max(0, Math.min(finalX, window.innerWidth - (ref.current?.offsetWidth || 0)));
    finalY = Math.max(0, Math.min(finalY, window.innerHeight - (ref.current?.offsetHeight || 0)));
    
    const finalPosition = {x: finalX, y: finalY};
    setPosition(finalPosition);

    if (onDragEnd) {
      onDragEnd(finalPosition);
    }
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, onDragEnd, position]); // position is needed to update onDragEnd with the final value

  return { position, isDragging };
};
