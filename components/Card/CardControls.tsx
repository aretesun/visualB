import React from 'react';
import { TrashIcon, EditIcon, CheckIcon } from '../Icons';

interface CardControlsProps {
  hasImage: boolean;
  isEditing: boolean;
  isImageLocked: boolean;
  isReadOnly: boolean;
  onToggleLock: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onChangeImage?: () => void;
  onDelete: () => void;
  onLayerUp: () => void;
  onLayerDown: () => void;
  onToggleColorPicker: () => void;
}

/**
 * 카드 컨트롤 버튼 컴포넌트
 * 삭제, 편집, 저장, 잠금 등의 버튼을 담당
 */
const CardControls: React.FC<CardControlsProps> = ({
  hasImage,
  isEditing,
  isImageLocked,
  isReadOnly,
  onToggleLock,
  onStartEdit,
  onSaveEdit,
  onChangeImage,
  onDelete,
  onLayerUp,
  onLayerDown,
  onToggleColorPicker,
}) => {
  if (isReadOnly) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <div className="absolute top-2 -right-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:touch-none transition-opacity duration-200 pointer-events-auto">
        {/* 레이어 올리기 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLayerUp();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        className="min-w-[30px] min-h-[30px] p-1.5 sm:p-1 bg-white/15 hover:bg-white/25 rounded-md shadow-lg touch-manipulation text-center"
          aria-label="Bring forward"
          title="레이어 올리기"
        >
          <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0-12l-4 4m4-4l4 4M5 19h14" />
          </svg>
        </button>

        {/* 레이어 내리기 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLayerDown();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        className="min-w-[30px] min-h-[30px] p-1.5 sm:p-1 bg-white/15 hover:bg-white/25 rounded-md shadow-lg touch-manipulation text-center"
          aria-label="Send backward"
          title="레이어 내리기"
        >
          <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21V9m0 12l-4-4m4 4l4-4M5 5h14" />
          </svg>
        </button>

        {/* 색상 팔레트 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleColorPicker();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        className="min-w-[30px] min-h-[30px] p-1.5 sm:p-1 bg-white/15 hover:bg-white/25 rounded-md shadow-lg touch-manipulation text-center"
          aria-label="Change card color"
          title="카드 색상"
        >
          <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 019 9 3 3 0 01-3 3h-1.5a1.5 1.5 0 000 3H18a3 3 0 01-3 3 9 9 0 110-18z" />
            <circle cx="8.5" cy="10.5" r="1" />
            <circle cx="15.5" cy="8.5" r="1" />
            <circle cx="15.5" cy="13.5" r="1" />
          </svg>
        </button>
      </div>

      <div className="absolute top-full right-0 mt-2 flex space-x-2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:touch-none transition-opacity duration-200 pointer-events-auto">
        {/* 이미지 위치 잠금/해제 버튼 */}
        {hasImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`min-w-[30px] min-h-[30px] p-1.5 sm:p-1 rounded-md shadow-lg touch-manipulation text-center ${
              isImageLocked
                ? 'bg-gray-500/80 hover:bg-gray-500'
                : 'bg-yellow-500/80 hover:bg-yellow-500'
            }`}
            aria-label={isImageLocked ? "Unlock image position" : "Lock image position"}
            title={isImageLocked ? "이미지 위치 잠금 해제" : "이미지 위치 잠금"}
          >
            {isImageLocked ? (
              <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}

        {/* 편집 버튼 */}
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="min-w-[30px] min-h-[30px] p-1.5 sm:p-1 bg-white/20 hover:bg-white/30 rounded-md shadow-lg touch-manipulation text-center"
            aria-label="Edit"
          >
            <EditIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
          </button>
        )}

        {/* 편집 완료 버튼 */}
        {isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveEdit();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="min-w-[30px] min-h-[30px] p-1.5 sm:p-1 bg-green-500/80 hover:bg-green-500 rounded-md shadow-lg touch-manipulation text-center"
            aria-label="Save changes"
          >
            <CheckIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
          </button>
        )}

        {/* 이미지 변경 (편집 모드) */}
        {isEditing && hasImage && onChangeImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChangeImage();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="min-w-[30px] min-h-[30px] p-1.5 sm:p-1 bg-blue-500/80 hover:bg-blue-500 rounded-md shadow-lg touch-manipulation text-center"
            aria-label="Change image"
            title="이미지 변경"
          >
            <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}

        {/* 삭제 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="min-w-[30px] min-h-[30px] p-1.5 sm:p-1 bg-red-500/80 hover:bg-red-500 rounded-md shadow-lg touch-manipulation text-center"
          aria-label="Delete item"
        >
          <TrashIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(CardControls);
