import React, { useState, useRef, useEffect } from 'react';
import type { Card, Position } from '../types';
import { useDraggable } from '../hooks/useDraggable';
import { TrashIcon, EditIcon, CheckIcon } from './Icons';
import ImageSourceDropdown from './ImageSourceDropdown';
import { useLanguage } from '../contexts/LanguageContext';

interface VisionItemProps {
  item: Card;
  onPositionChange: (id: number, position: Position, delta?: Position) => void;
  onTextChange: (id: number, text: string) => void;
  onImageChange: (id: number, imageUrl: string) => void;
  onImageSizeChange: (id: number, width: number, height: number) => void;
  onImageOffsetChange: (id: number, offset: Position) => void;
  onDelete: (id: number) => void;
  onBringToFront: (id: number) => void;
  onRequestUrlInput: (id: number) => void;
  isUrlModalOpen?: boolean;
  isReadOnly?: boolean; // 읽기 전용 모드
  isSelected?: boolean; // 선택 여부
  onSelect?: (id: number, isCtrlPressed: boolean) => void; // 선택 핸들러
}

const VisionItem: React.FC<VisionItemProps> = ({
  item,
  onPositionChange,
  onTextChange,
  onImageChange,
  onImageSizeChange,
  onImageOffsetChange,
  onDelete,
  onBringToFront,
  onRequestUrlInput,
  isUrlModalOpen = false,
  isReadOnly = false,
  isSelected = false,
  onSelect
}) => {
  const { t } = useLanguage();
  const itemRef = useRef<HTMLDivElement>(null);

  const { position, isDragging } = useDraggable({
    ref: itemRef,
    initialPosition: item.position,
    onDragMove: (newPosition, delta) => {
      // 드래그 중 실시간으로 다른 선택된 카드들도 함께 이동
      if (onPositionChange) {
        onPositionChange(item.id, newPosition, delta);
      }
    },
    onDragEnd: (newPosition, delta) => {
      // 드래그 종료 시 최종 위치 업데이트 (delta 없이 호출하여 초기화)
      onPositionChange(item.id, newPosition);
    },
    disabled: false, // 드래그 항상 허용
  });

  const [isEditingText, setIsEditingText] = useState(!item.text && !item.imageUrl);
  const [editText, setEditText] = useState(item.text || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false); // 파일 선택 중 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false); // 이미지 편집 모드
  const [isDraggingImage, setIsDraggingImage] = useState(false); // 이미지 드래그 중
  const [isImageLocked, setIsImageLocked] = useState(true); // 이미지 위치 잠금 (기본: 잠금)
  const [showBoundaryWarning, setShowBoundaryWarning] = useState(false); // 경계 경고
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageAddButtonRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const editImageButtonRef = useRef<HTMLButtonElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isEditingText && textareaRef.current) {
      // 약간의 딜레이로 DOM 렌더링 후 포커스
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 100);
    }
  }, [isEditingText]);

  // 편집 모드를 벗어났을 때 텍스트도 이미지도 없으면 카드 삭제
  // 단, 파일 선택 중이거나 드롭다운이 열려있거나 URL 모달이 열려있을 때는 삭제하지 않음
  useEffect(() => {
    if (!isEditingText && !item.text && !item.imageUrl && !isSelectingFile && !showDropdown && !isUrlModalOpen) {
      onDelete(item.id);
    }
  }, [isEditingText, item.text, item.imageUrl, isSelectingFile, showDropdown, isUrlModalOpen, item.id, onDelete]);

  // 빈 카드가 처음 생성되었을 때 자동 포커스
  useEffect(() => {
    if (isEmpty && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, []);

  // 카드 크기 변경 시 이미지 오프셋 자동 보정
  useEffect(() => {
    if (!item.imageUrl || !imgElementRef.current) return;

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
      const cardWidth = item.imageWidth || 232;
      const cardHeight = item.imageHeight || 160;

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

      const currentOffsetX = item.imageOffset?.x || 0;
      const currentOffsetY = item.imageOffset?.y || 0;

      let needsCorrection = false;
      let correctedOffsetX = currentOffsetX;
      let correctedOffsetY = currentOffsetY;

      // X축 독립적 체크
      if (renderedWidth <= cardWidth) {
        // 렌더링된 이미지가 카드보다 작거나 같으면 offset은 0이어야 함
        if (currentOffsetX !== 0) {
          correctedOffsetX = 0;
          needsCorrection = true;
        }
      } else {
        // 렌더링된 이미지가 카드보다 크면 범위 체크
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
        // 렌더링된 이미지가 카드보다 작거나 같으면 offset은 0이어야 함
        if (currentOffsetY !== 0) {
          correctedOffsetY = 0;
          needsCorrection = true;
        }
      } else {
        // 렌더링된 이미지가 카드보다 크면 범위 체크
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
        onImageOffsetChange(item.id, { x: correctedOffsetX, y: correctedOffsetY });
      }
    }
  }, [item.imageWidth, item.imageHeight, item.imageUrl, item.imageOffset, item.id, onImageOffsetChange]);

  const handleSave = () => {
    // 텍스트 입력이 있으면 저장
    if (editText.trim()) {
      onTextChange(item.id, editText);
      setIsEditingText(false);
    } else if (!item.imageUrl) {
      // 텍스트도 없고 이미지도 없으면 나중에 삭제 (즉시 삭제 안 함)
      // 사용자가 이미지를 추가할 수도 있으므로 여기서는 삭제하지 않음
      setIsEditingText(false);
    } else {
      // 이미지는 있는데 텍스트가 없으면 그냥 편집 모드만 종료
      setIsEditingText(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      if (!item.text && !item.imageUrl) {
        onDelete(item.id);
      } else {
        setEditText(item.text || '');
        setIsEditingText(false);
      }
    }
  };

  const handleFocus = () => {
    onBringToFront(item.id);
  };

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

          // 최대 너비를 넘으면 비율에 맞게 축소
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
          // 압축 실패 시 원본 사용
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
        // 압축 실패 시 원본 사용
        const reader = new FileReader();
        reader.onloadend = () => {
          onImageChange(item.id, reader.result as string);
          setIsEditingText(false);
          setIsSelectingFile(false);
        };
        reader.readAsDataURL(file);
      }
    }
    // onChange가 호출되었지만 파일이 없으면 취소로 간주
    // 약간의 딜레이 후 상태 초기화 (이벤트 처리 완료 대기)
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
    setIsEditingImage(false); // 편집 모드 종료

    // input 요소에 cancel 이벤트 리스너 추가 (지원하는 브라우저)
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
    setIsEditingImage(false); // 편집 모드 종료
  };

  const handleAddByUrl = () => {
    onRequestUrlInput(item.id);
    setIsEditingImage(false); // 편집 모드 종료
  };

  const handleEditImage = () => {
    setIsEditingImage(true);
    // 편집 버튼 위치 기준으로 드롭다운 표시
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

    const cardWidth = item.imageWidth || 232;
    const cardHeight = item.imageHeight || 160;

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
    onBringToFront(item.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startOffsetX = item.imageOffset?.x || 0;
    const startOffsetY = item.imageOffset?.y || 0;

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

      onImageOffsetChange(item.id, { x: finalOffsetX, y: finalOffsetY });
    };

    const handlePointerUp = () => {
      setIsDraggingImage(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // 카드 리사이즈 핸들러 (모든 방향)
  const handleResizeStart = (e: React.MouseEvent | React.PointerEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    onBringToFront(item.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startCardWidth = cardWidth; // 현재 카드 너비
    const startImageHeight = item.imageHeight || 160; // 기본값 160px
    const startImageWidth = item.imageWidth || 232; // 현재 이미지 너비
    const startPosX = position.x;
    const startPosY = position.y;

    // 로컬 리사이즈 상태
    let resizeState = {
      cardWidth: startCardWidth,
      imageWidth: startImageWidth,
      imageHeight: startImageHeight,
      posX: startPosX,
      posY: startPosY,
    };

    // 실시간 DOM 업데이트를 위한 ref
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

      // 방향에 따라 크기 및 위치 조절
      if (direction.includes('e')) {
        newCardWidth = Math.max(200, Math.min(1000, startCardWidth + deltaX));
        newPosX = startPosX;
      }
      if (direction.includes('w')) {
        const proposedWidth = startCardWidth - deltaX;
        newCardWidth = Math.max(200, Math.min(1000, proposedWidth));
        newPosX = startPosX + (startCardWidth - newCardWidth);
      }
      if (direction.includes('s')) {
        newImageHeight = Math.max(100, Math.min(800, startImageHeight + deltaY));
        newPosY = startPosY;
      }
      if (direction.includes('n')) {
        const proposedHeight = startImageHeight - deltaY;
        newImageHeight = Math.max(100, Math.min(800, proposedHeight));
        newPosY = startPosY + (startImageHeight - newImageHeight);
      }

      const newImageWidth = newCardWidth - 24;

      // 로컬 상태 업데이트
      resizeState = {
        cardWidth: newCardWidth,
        imageWidth: newImageWidth,
        imageHeight: newImageHeight,
        posX: newPosX,
        posY: newPosY,
      };

      // 이전 requestAnimationFrame 취소
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // requestAnimationFrame으로 DOM 업데이트 배치 처리
      rafId = requestAnimationFrame(() => {
        // 한 번에 모든 스타일 업데이트 (리플로우 최소화)
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
      // 남아있는 RAF 취소
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      setIsResizing(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);

      // 최종 상태를 React에 반영
      onImageSizeChange(item.id, resizeState.imageWidth, resizeState.imageHeight);
      onPositionChange(item.id, { x: resizeState.posX, y: resizeState.posY });

      // 리사이즈 완료 후 이미지 offset 보정
      if (item.imageUrl && imgElementRef.current && item.imageOffset) {
        const imgElement = imgElementRef.current;
        const imageNaturalWidth = imgElement.naturalWidth;
        const imageNaturalHeight = imgElement.naturalHeight;
        const cardWidth = (item.imageWidth || 232);
        const cardHeight = (item.imageHeight || 160);

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

        let correctedOffsetX = item.imageOffset.x || 0;
        let correctedOffsetY = item.imageOffset.y || 0;

        // X축 보정
        if (renderedWidth > cardWidth) {
          const minOffsetX = cardWidth - renderedWidth;
          correctedOffsetX = Math.max(minOffsetX, Math.min(0, correctedOffsetX));
        } else {
          correctedOffsetX = 0;
        }

        // Y축 보정
        if (renderedHeight > cardHeight) {
          const minOffsetY = cardHeight - renderedHeight;
          correctedOffsetY = Math.max(minOffsetY, Math.min(0, correctedOffsetY));
        } else {
          correctedOffsetY = 0;
        }

        // 보정이 필요하면 업데이트
        if (correctedOffsetX !== (item.imageOffset.x || 0) || correctedOffsetY !== (item.imageOffset.y || 0)) {
          onImageOffsetChange(item.id, { x: correctedOffsetX, y: correctedOffsetY });
        }
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const isEmpty = !item.text && !item.imageUrl;

  // 카드 너비: 이미지가 있으면 이미지 너비 + 패딩(24px), 없으면 기본값
  const cardWidth = item.imageUrl
    ? (item.imageWidth || 232) + 24
    : 256;

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      const isCtrlPressed = e.ctrlKey || e.metaKey;
      onSelect(item.id, isCtrlPressed);
    }
  };

  return (
    <div
      ref={itemRef}
      data-object="card"
      onFocus={handleFocus}
      onMouseDown={(e) => {
        e.stopPropagation(); // 캔버스 선택 박스 방지
        handleFocus(e);
        handleClick(e);
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`absolute rounded-lg shadow-2xl transition-[transform,box-shadow] duration-200 ease-in-out cursor-grab flex flex-col group bg-white/10 backdrop-blur-xl border p-3 ${
        isDragging ? 'shadow-black/50 scale-105 z-50' : 'shadow-black/30'
      } ${isDragOver ? 'border-sky-400 border-2 bg-sky-500/20' : ''} ${
        isResizing ? 'cursor-nwse-resize' : ''
      } ${isSelected ? 'border-blue-400 border-2 ring-2 ring-blue-400/50' : 'border-white/20'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${cardWidth}px`,
        touchAction: 'none',
      }}
      tabIndex={0}
    >
      {/* 텍스트 */}
      {(isEditingText || item.text) && (
        <div className="flex-1 mb-3">
          {isEditingText ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={t.card.placeholder}
              maxLength={300}
              className="w-full h-24 bg-transparent text-white placeholder-white/40 focus:outline-none resize-none"
            />
          ) : (
            <p
              onClick={() => setIsEditingText(true)}
              className="text-white text-base font-light break-words cursor-text"
            >
              {item.text}
            </p>
          )}
        </div>
      )}

      {/* 이미지 */}
      {item.imageUrl ? (
        <div
          ref={imageRef}
          className={`relative group/image overflow-hidden rounded-md transition-all duration-200 ${
            showBoundaryWarning ? 'ring-2 ring-yellow-300/70' : ''
          }`}
          style={{
            width: item.imageWidth || 232,
            height: item.imageHeight || 160,
          }}
        >
          <img
            ref={imgElementRef}
            src={item.imageUrl}
            alt="Vision board item"
            className={`absolute object-cover ${isImageLocked ? 'cursor-default' : 'cursor-move'}`}
            style={{
              transform: `translate(${item.imageOffset?.x || 0}px, ${item.imageOffset?.y || 0}px)`,
              minWidth: '100%',
              minHeight: '100%',
            }}
            draggable="false"
            data-image-unlocked={!isImageLocked || undefined}
            onPointerDown={handleImageDragStart}
          />
        </div>
      ) : isEmpty && (
        <div
          ref={imageAddButtonRef}
          className="w-full h-24 border-2 border-dashed border-white/30 rounded-md flex flex-col items-center justify-center text-white/50 hover:border-white/50 hover:text-white/70 transition-colors cursor-pointer"
          onClick={handleImageAddClick}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">{t.card.addImage}</span>
        </div>
      )}

      {/* 이미지 소스 드롭다운 - Portal로 body에 렌더링 */}
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

      {/* 컨트롤 버튼 - 우측 하단 (읽기 전용 모드에서 숨김) */}
      {!isReadOnly && (
      <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        {/* 이미지 위치 잠금/해제 버튼 */}
        {item.imageUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsImageLocked(!isImageLocked);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded-md shadow-lg ${
              isImageLocked
                ? 'bg-gray-500/80 hover:bg-gray-500'
                : 'bg-yellow-500/80 hover:bg-yellow-500'
            }`}
            aria-label={isImageLocked ? "Unlock image position" : "Lock image position"}
            title={isImageLocked ? "이미지 위치 잠금 해제" : "이미지 위치 잠금"}
          >
            {isImageLocked ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
        {/* 텍스트 편집 버튼 */}
        {item.text && !isEditingText && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingText(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md shadow-lg"
            aria-label="Edit text"
          >
            <EditIcon className="w-4 h-4 text-white" />
          </button>
        )}
        {/* 텍스트 저장 버튼 */}
        {isEditingText && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1.5 bg-green-500/80 hover:bg-green-500 rounded-md shadow-lg"
            aria-label="Save changes"
          >
            <CheckIcon className="w-4 h-4 text-white" />
          </button>
        )}
        {/* 이미지 편집 버튼 */}
        {item.imageUrl && !isEditingImage && (
          <button
            ref={editImageButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              handleEditImage();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1.5 bg-blue-500/80 hover:bg-blue-500 rounded-md shadow-lg"
            aria-label="Edit image"
            title="이미지 변경"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}
        {/* 이미지 편집 완료 버튼 */}
        {isEditingImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCloseEditImage();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1.5 bg-green-500/80 hover:bg-green-500 rounded-md shadow-lg"
            aria-label="Close image edit"
          >
            <CheckIcon className="w-4 h-4 text-white" />
          </button>
        )}
        {/* 삭제 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-md shadow-lg"
          aria-label="Delete item"
        >
          <TrashIcon className="w-4 h-4 text-white" />
        </button>
      </div>
      )}

      {/* 리사이즈 핸들 - 모든 모서리와 변 (윈도우 스타일) */}
      <>
      {/* 모서리 */}
      {/* 우하단 */}
      <div
        data-resize-handle
        onPointerDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e as any, 'se');
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
      />
      {/* 우상단 */}
      <div
        data-resize-handle
        onPointerDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e as any, 'ne');
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
      />
      {/* 좌하단 */}
      <div
        data-resize-handle
        onPointerDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e as any, 'sw');
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
      />
      {/* 좌상단 */}
      <div
        data-resize-handle
        onPointerDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e as any, 'nw');
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
      />

      {/* 변 (테두리) */}
      {/* 오른쪽 */}
      <div
        data-resize-handle
        onPointerDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e as any, 'e');
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 right-0 bottom-3 w-1 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
      />
      {/* 왼쪽 */}
      <div
        data-resize-handle
        onPointerDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e as any, 'w');
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 left-0 bottom-3 w-1 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
      />
      {/* 아래 */}
      <div
        data-resize-handle
        onPointerDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e as any, 's');
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-3 right-3 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
      />
      {/* 위 */}
      <div
        data-resize-handle
        onPointerDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e as any, 'n');
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 left-3 right-3 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ touchAction: 'none' }}
      />
      </>

    </div>
  );
};

export default VisionItem;
