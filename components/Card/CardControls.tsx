import React from 'react';
import { TrashIcon, EditIcon, CheckIcon } from '../Icons';

interface CardControlsProps {
  hasImage: boolean;
  hasText: boolean;
  isEditingText: boolean;
  isEditingImage: boolean;
  isImageLocked: boolean;
  isReadOnly: boolean;
  onToggleLock: () => void;
  onEditText: () => void;
  onSaveText: () => void;
  onEditImage: () => void;
  onCloseEditImage: () => void;
  onDelete: () => void;
  editImageButtonRef?: React.RefObject<HTMLButtonElement>;
}

/**
 * 카드 컨트롤 버튼 컴포넌트
 * 삭제, 편집, 저장, 잠금 등의 버튼을 담당
 */
const CardControls: React.FC<CardControlsProps> = ({
  hasImage,
  hasText,
  isEditingText,
  isEditingImage,
  isImageLocked,
  isReadOnly,
  onToggleLock,
  onEditText,
  onSaveText,
  onEditImage,
  onCloseEditImage,
  onDelete,
  editImageButtonRef,
}) => {
  if (isReadOnly) return null;

  return (
    <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
      {/* 이미지 위치 잠금/해제 버튼 */}
      {hasImage && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
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
      {hasText && !isEditingText && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditText();
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
            onSaveText();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="p-1.5 bg-green-500/80 hover:bg-green-500 rounded-md shadow-lg"
          aria-label="Save changes"
        >
          <CheckIcon className="w-4 h-4 text-white" />
        </button>
      )}

      {/* 이미지 편집 버튼 */}
      {hasImage && !isEditingImage && (
        <button
          ref={editImageButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            onEditImage();
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
            onCloseEditImage();
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
          onDelete();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-md shadow-lg"
        aria-label="Delete item"
      >
        <TrashIcon className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

export default React.memo(CardControls);
