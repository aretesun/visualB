import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageSourceDropdownProps {
  onUploadFile: () => void;
  onGenerateImage: () => void;
  onAddByUrl: () => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const ImageSourceDropdown: React.FC<ImageSourceDropdownProps> = ({
  onUploadFile,
  onGenerateImage,
  onAddByUrl,
  onClose,
  position,
}) => {
  const { t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 약간의 딜레이를 두고 이벤트 리스너 등록 (드롭다운 열리는 클릭과 충돌 방지)
    const timer = setTimeout(() => {
      const handlePointerOutside = (event: PointerEvent | TouchEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('pointerdown', handlePointerOutside);
      document.addEventListener('touchstart', handlePointerOutside);
      document.addEventListener('keydown', handleEscape);

      // cleanup 함수를 위해 저장
      (dropdownRef.current as any)._cleanup = () => {
        document.removeEventListener('pointerdown', handlePointerOutside);
        document.removeEventListener('touchstart', handlePointerOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      if ((dropdownRef.current as any)?._cleanup) {
        (dropdownRef.current as any)._cleanup();
      }
    };
  }, [onClose]);

  const dropdown = (
    <div
      ref={dropdownRef}
      className="fixed bg-white/10 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden z-[9999]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        minWidth: '200px',
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onUploadFile();
          onClose();
        }}
        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>{t.imageSource.uploadFile}</span>
      </button>
      <div className="border-t border-white/10" />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onGenerateImage();
          onClose();
        }}
        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>{t.imageSource.generateAI}</span>
      </button>
      <div className="border-t border-white/10" />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddByUrl();
          onClose();
        }}
        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span>{t.imageSource.addByUrl}</span>
      </button>
    </div>
  );

  return createPortal(dropdown, document.body);
};

export default ImageSourceDropdown;
