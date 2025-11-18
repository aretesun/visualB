import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CardTextProps {
  text?: string;
  isEditing: boolean;
  hasImage: boolean;
  onTextChange: (text: string) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  onDelete: () => void;
}

/**
 * 카드 텍스트 편집 컴포넌트
 * 텍스트 입력, 편집, 저장 기능을 담당
 */
const CardText: React.FC<CardTextProps> = ({
  text,
  isEditing,
  hasImage,
  onTextChange,
  onEditStart,
  onEditEnd,
  onDelete,
}) => {
  const { t } = useLanguage();
  const [editText, setEditText] = useState(text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 모바일 감지 (터치 디바이스)
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 편집 모드 진입 시 포커스
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 100);
    }
  }, [isEditing]);

  // text prop이 변경되면 editText도 업데이트
  useEffect(() => {
    setEditText(text || '');
  }, [text]);

  const handleSave = () => {
    if (editText.trim()) {
      onTextChange(editText);
      onEditEnd();
    } else if (!hasImage) {
      // 텍스트도 없고 이미지도 없으면 편집 모드만 종료
      onEditEnd();
    } else {
      // 이미지는 있는데 텍스트가 없으면 그냥 편집 모드만 종료
      onEditEnd();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      if (!text && !hasImage) {
        onDelete();
      } else {
        setEditText(text || '');
        onEditEnd();
      }
    }
  };

  // 편집 중이 아니고 텍스트도 없으면 null 반환 (이미지가 있는 경우 제외)
  if (!isEditing && !text && hasImage) {
    return null;
  }

  return (
    <div className="flex-1 mb-3">
      {isEditing ? (
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
      ) : text ? (
        <p
          onClick={onEditStart}
          className="text-white text-base font-light break-words cursor-text"
        >
          {text}
        </p>
      ) : isMobile ? (
        // 모바일: "텍스트 추가" 버튼 표시
        <button
          onClick={onEditStart}
          className="w-full h-12 border-2 border-dashed border-white/30 rounded-md flex items-center justify-center text-white/50 hover:border-white/50 hover:text-white/70 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">{t.card.addText || '텍스트 추가'}</span>
        </button>
      ) : (
        // 데스크톱: 빈 영역 클릭 시 편집 모드
        <div
          onClick={onEditStart}
          className="w-full h-12 flex items-center justify-center text-white/30 hover:text-white/50 cursor-text transition-colors"
        >
          <span className="text-sm">{t.card.placeholder || '텍스트를 입력하세요...'}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(CardText, (prev, next) => {
  return (
    prev.text === next.text &&
    prev.isEditing === next.isEditing &&
    prev.hasImage === next.hasImage
  );
});
