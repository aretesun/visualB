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

  if (!isEditing && !text) {
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
      ) : (
        <p
          onClick={onEditStart}
          className="text-white text-base font-light break-words cursor-text"
        >
          {text}
        </p>
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
