import React, { useState, useRef, useEffect } from 'react';
import type { Position } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface CardImageProps {
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageOffset?: Position;
  isEditing: boolean;
  isImageLocked: boolean;
  isEmpty: boolean;
  onImageOffsetChange: (offset: Position) => void;
  onBringToFront: () => void;
  onAddImageClick: () => void;
  onEditImageClick: () => void;
  imageAddButtonRef: React.RefObject<HTMLDivElement>;
  imageRef: React.RefObject<HTMLDivElement>;
}

/**
 * 카드 이미지 표시 및 편집 컴포넌트
 * 이미지 표시, 드래그로 위치 조정, 이미지 추가 버튼 등을 담당
 */
const CardImage: React.FC<CardImageProps> = ({
  imageUrl,
  imageWidth = 232,
  imageHeight = 160,
  imageOffset,
  isEditing,
  isImageLocked,
  isEmpty,
  onImageOffsetChange,
  onBringToFront,
  onAddImageClick,
  onEditImageClick,
  imageAddButtonRef,
  imageRef,
}) => {
  const { t } = useLanguage();
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [showBoundaryWarning, setShowBoundaryWarning] = useState(false);
  const imgElementRef = useRef<HTMLImageElement>(null);

  // 카드 크기 변경 시 이미지 오프셋 자동 보정
  useEffect(() => {
    if (!imageUrl || !imgElementRef.current) return;

    const imgElement = imgElementRef.current;

    // 이미지가 로드되지 않았으면 대기
    if (!imgElement.complete) {
      const handleLoad = () => {
        correctImageOffset();
      };
      imgElement.addEventListener('load', handleLoad);
      return () => imgElement.removeEventListener('load', handleLoad);
    }

    correctImageOffset();

    function correctImageOffset() {
      if (!imgElementRef.current) return;

      const imageNaturalWidth = imgElementRef.current.naturalWidth;
      const imageNaturalHeight = imgElementRef.current.naturalHeight;
      const cardWidth = imageWidth;
      const cardHeight = imageHeight;

      // object-fit: cover 사용 시 실제 렌더링되는 이미지 크기 계산
      const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
      const cardAspectRatio = cardWidth / cardHeight;

      let renderedWidth, renderedHeight;

      if (imageAspectRatio > cardAspectRatio) {
        // 이미지가 더 넓음 -> 높이에 맞춤
        renderedHeight = cardHeight;
        renderedWidth = renderedHeight * imageAspectRatio;
      } else {
        // 이미지가 더 높음 -> 너비에 맞춤
        renderedWidth = cardWidth;
        renderedHeight = renderedWidth / imageAspectRatio;
      }

      const currentOffsetX = imageOffset?.x || 0;
      const currentOffsetY = imageOffset?.y || 0;

      let needsCorrection = false;
      let correctedOffsetX = currentOffsetX;
      let correctedOffsetY = currentOffsetY;

      // X축 독립적 체크
      if (renderedWidth <= cardWidth) {
        if (currentOffsetX !== 0) {
          correctedOffsetX = 0;
          needsCorrection = true;
        }
      } else {
        const minOffsetX = cardWidth - renderedWidth;
        const maxOffsetX = 0;
        if (currentOffsetX < minOffsetX) {
          correctedOffsetX = minOffsetX;
          needsCorrection = true;
        } else if (currentOffsetX > maxOffsetX) {
          correctedOffsetX = maxOffsetX;
          needsCorrection = true;
        }
      }

      // Y축 독립적 체크
      if (renderedHeight <= cardHeight) {
        if (currentOffsetY !== 0) {
          correctedOffsetY = 0;
          needsCorrection = true;
        }
      } else {
        const minOffsetY = cardHeight - renderedHeight;
        const maxOffsetY = 0;
        if (currentOffsetY < minOffsetY) {
          correctedOffsetY = minOffsetY;
          needsCorrection = true;
        } else if (currentOffsetY > maxOffsetY) {
          correctedOffsetY = maxOffsetY;
          needsCorrection = true;
        }
      }

      // 보정이 필요하면 업데이트
      if (needsCorrection) {
        onImageOffsetChange({ x: correctedOffsetX, y: correctedOffsetY });
      }
    }
  }, [imageWidth, imageHeight, imageUrl, imageOffset, onImageOffsetChange]);

  // 이미지 드래그 핸들러 (마스크 기능)
  const handleImageDragStart = (e: React.PointerEvent) => {
    // 잠금 상태면 카드 드래그가 작동하도록 아무것도 안 함
    if (isImageLocked) {
      return;
    }

    // 잠금 해제 상태: 이미지 드래그만 허용, 카드 드래그 차단
    e.preventDefault();
    e.stopPropagation();

    // 이미지 실제 크기 가져오기
    const imgElement = e.currentTarget as HTMLImageElement;
    const imageNaturalWidth = imgElement.naturalWidth;
    const imageNaturalHeight = imgElement.naturalHeight;

    const cardWidth = imageWidth;
    const cardHeight = imageHeight;

    // object-fit: cover 사용 시 실제 렌더링되는 이미지 크기 계산
    const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
    const cardAspectRatio = cardWidth / cardHeight;

    let renderedWidth, renderedHeight;

    if (imageAspectRatio > cardAspectRatio) {
      // 이미지가 더 넓음 -> 높이에 맞춤
      renderedHeight = cardHeight;
      renderedWidth = renderedHeight * imageAspectRatio;
    } else {
      // 이미지가 더 높음 -> 너비에 맞춤
      renderedWidth = cardWidth;
      renderedHeight = renderedWidth / imageAspectRatio;
    }

    // X축과 Y축 모두 렌더링된 이미지가 카드보다 작거나 같으면 이동 불가
    const canMoveX = renderedWidth > cardWidth;
    const canMoveY = renderedHeight > cardHeight;

    if (!canMoveX && !canMoveY) {
      setShowBoundaryWarning(true);
      setTimeout(() => setShowBoundaryWarning(false), 800);
      return;
    }

    setIsDraggingImage(true);
    onBringToFront();

    const startX = e.clientX;
    const startY = e.clientY;
    const startOffsetX = imageOffset?.x || 0;
    const startOffsetY = imageOffset?.y || 0;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let finalOffsetX = startOffsetX;
      let finalOffsetY = startOffsetY;
      let hitBoundary = false;

      // X축: 렌더링된 이미지가 카드보다 클 때만 이동 가능
      if (renderedWidth > cardWidth) {
        const desiredOffsetX = startOffsetX + deltaX;
        const minOffsetX = cardWidth - renderedWidth;
        const maxOffsetX = 0;
        const clampedOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, desiredOffsetX));

        if (desiredOffsetX !== clampedOffsetX) {
          hitBoundary = true;
        }
        finalOffsetX = clampedOffsetX;
      }

      // Y축: 렌더링된 이미지가 카드보다 클 때만 이동 가능
      if (renderedHeight > cardHeight) {
        const desiredOffsetY = startOffsetY + deltaY;
        const minOffsetY = cardHeight - renderedHeight;
        const maxOffsetY = 0;
        const clampedOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, desiredOffsetY));

        if (desiredOffsetY !== clampedOffsetY) {
          hitBoundary = true;
        }
        finalOffsetY = clampedOffsetY;
      }

      if (hitBoundary) {
        setShowBoundaryWarning(true);
        setTimeout(() => setShowBoundaryWarning(false), 800);
      }

      onImageOffsetChange({ x: finalOffsetX, y: finalOffsetY });
    };

    const handlePointerUp = () => {
      setIsDraggingImage(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // 이미지가 있는 경우
  if (imageUrl) {
    return (
      <div
        ref={imageRef}
        className={`relative group/image overflow-hidden rounded-md transition-all duration-200 ${
          showBoundaryWarning ? 'ring-2 ring-yellow-300/70' : ''
        }`}
        style={{
          width: imageWidth,
          height: imageHeight,
        }}
      >
        {isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditImageClick();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 px-2 py-1 text-xs bg-black/60 text-white rounded shadow hover:bg-black/75"
            aria-label="Change image"
          >
            {t.card.changeImage || '이미지 변경'}
          </button>
        )}
        <img
          ref={imgElementRef}
          src={imageUrl}
          alt="Vision board item"
          className={`absolute object-cover ${isImageLocked ? 'cursor-default' : 'cursor-move'}`}
          style={{
            transform: `translate(${imageOffset?.x || 0}px, ${imageOffset?.y || 0}px)`,
            minWidth: '100%',
            minHeight: '100%',
          }}
          draggable="false"
          data-image-unlocked={!isImageLocked || undefined}
          onPointerDown={handleImageDragStart}
        />
      </div>
    );
  }

  // 이미지가 없을 때는 편집 모드에서만 추가 버튼 표시
  if (!imageUrl) {
    if (!isEditing) {
      return null;
    }
    return (
      <div
        ref={imageAddButtonRef}
        className="w-full h-24 border-2 border-dashed border-white/30 rounded-md flex flex-col items-center justify-center text-white/50 hover:border-white/50 hover:text-white/70 transition-colors cursor-pointer"
        onClick={onAddImageClick}
      >
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm">{t.card.addImage}</span>
      </div>
    );
  }

  return null;
};

export default React.memo(CardImage, (prev, next) => {
  return (
    prev.imageUrl === next.imageUrl &&
    prev.imageWidth === next.imageWidth &&
    prev.imageHeight === next.imageHeight &&
    prev.imageOffset?.x === next.imageOffset?.x &&
    prev.imageOffset?.y === next.imageOffset?.y &&
    prev.isImageLocked === next.isImageLocked &&
    prev.isEmpty === next.isEmpty &&
    prev.isEditing === next.isEditing
  );
});
