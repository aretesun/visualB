import React, { useState, useRef, useEffect } from 'react';
import type { Card, Position } from '../types';
import { useDraggable } from '../hooks/useDraggable';
import { TrashIcon, EditIcon, CheckIcon } from './Icons';
import ImageSourceDropdown from './ImageSourceDropdown';

interface VisionItemProps {
  item: Card;
  onPositionChange: (id: number, position: Position) => void;
  onTextChange: (id: number, text: string) => void;
  onImageChange: (id: number, imageUrl: string) => void;
  onDelete: (id: number) => void;
  onBringToFront: (id: number) => void;
  onRequestUrlInput: (id: number) => void;
  isUrlModalOpen?: boolean;
}

const VisionItem: React.FC<VisionItemProps> = ({
  item,
  onPositionChange,
  onTextChange,
  onImageChange,
  onDelete,
  onBringToFront,
  onRequestUrlInput,
  isUrlModalOpen = false
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const { position, isDragging } = useDraggable({
    ref: itemRef,
    initialPosition: item.position,
    onDragEnd: (newPosition) => onPositionChange(item.id, newPosition),
  });

  const [isEditingText, setIsEditingText] = useState(!item.text && !item.imageUrl);
  const [editText, setEditText] = useState(item.text || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false); // 파일 선택 중 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageAddButtonRef = useRef<HTMLDivElement>(null);

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
  };

  const handleAddByUrl = () => {
    onRequestUrlInput(item.id);
  };

  const isEmpty = !item.text && !item.imageUrl;

  return (
    <div
      ref={itemRef}
      onFocus={handleFocus}
      onMouseDown={handleFocus}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`absolute w-64 rounded-lg shadow-2xl transition-[transform,box-shadow] duration-200 ease-in-out cursor-grab flex flex-col group bg-white/10 backdrop-blur-xl border border-white/20 p-3 ${
        isDragging ? 'shadow-black/50 scale-105 z-50' : 'shadow-black/30'
      } ${isDragOver ? 'border-sky-400 border-2 bg-sky-500/20' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
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
              placeholder="무엇을 원하세요?"
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
        <div className="w-full relative">
          <img
            src={item.imageUrl}
            alt="Vision board item"
            className="w-full h-40 object-cover rounded-md"
            draggable="false"
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
          <span className="text-sm">이미지 추가</span>
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

      {/* 컨트롤 버튼 */}
      <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {item.text && !isEditingText && (
          <button
            onClick={() => setIsEditingText(true)}
            className="p-1 text-white/70 hover:text-white"
            aria-label="Edit text"
          >
            <EditIcon className="w-5 h-5" />
          </button>
        )}
        {isEditingText && (
          <button
            onClick={handleSave}
            className="p-1 text-green-300 hover:text-green-200"
            aria-label="Save changes"
          >
            <CheckIcon className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 text-red-400 hover:text-red-300"
          aria-label="Delete item"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};

export default VisionItem;
