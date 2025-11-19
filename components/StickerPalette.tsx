import React, { useState, useRef } from 'react';
import { Sticker } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface StickerPaletteProps {
  isExpanded: boolean;
  stickers: Sticker[];
  onToggle: () => void;
  onAddSticker: (sticker: Sticker) => void;
  onDeleteSticker: (id: string) => void;
  onDragStart: (sticker: Sticker, e: React.MouseEvent) => void;
}

const StickerPalette: React.FC<StickerPaletteProps> = ({
  isExpanded,
  stickers,
  onToggle,
  onAddSticker,
  onDeleteSticker,
  onDragStart,
}) => {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [longPressStickerId, setLongPressStickerId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleAddByUrl = () => {
    if (urlInput.trim()) {
      const newSticker: Sticker = {
        id: `sticker_${Date.now()}`,
        imageUrl: urlInput.trim(),
        name: nameInput.trim() || 'Sticker',
        addedAt: Date.now(),
      };
      onAddSticker(newSticker);
      setUrlInput('');
      setNameInput('');
      setShowAddModal(false);
    }
  };

  const handleAddByFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSticker: Sticker = {
          id: `sticker_${Date.now()}`,
          imageUrl: reader.result as string,
          name: nameInput.trim() || file.name.replace(/\.[^/.]+$/, ''),
          addedAt: Date.now(),
        };
        onAddSticker(newSticker);
        setNameInput('');
        setShowAddModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (sticker: Sticker, e: React.TouchEvent) => {
    e.stopPropagation();

    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;

    // 롱 프레스 타이머 시작 (400ms)
    longPressTimerRef.current = window.setTimeout(() => {
      setLongPressStickerId(sticker.id);
      isDraggingRef.current = true;

      // 햅틱 피드백 (지원되는 경우)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // 마우스 이벤트로 변환하여 기존 드래그 로직 사용
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true,
      }) as any;
      onDragStart(sticker, mouseEvent);
    }, 400);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);
    const moveThreshold = 10; // 10px 이상 움직이면 롱 프레스 취소

    // 드래그 중이 아니고, 너무 많이 움직였으면 롱 프레스 취소
    if (!isDraggingRef.current && (deltaX > moveThreshold || deltaY > moveThreshold)) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 롱 프레스 타이머 정리
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setLongPressStickerId(null);
    isDraggingRef.current = false;
    touchStartPosRef.current = null;
  };

  const handleMouseDownSticker = (sticker: Sticker, e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart(sticker, e);
  };

  return (
    <>
      {/* 접힌 상태 - 스티커 아이콘만 */}
      {!isExpanded && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 p-3 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full transition-colors shadow-lg z-40 text-xl"
          aria-label="Open sticker palette"
          title={t.stickerPalette?.open || 'Open Stickers'}
        >
          🎨
        </button>
      )}

      {/* 펼쳐진 상태 - 사이드바 */}
      {isExpanded && (
        <div className="fixed left-0 top-0 h-[calc(100vh-6.25rem)] w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-xl z-40">
          <div className="h-full flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 select-none">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <span className="text-xl">🎨</span>
                <span>{t.stickerPalette?.title || 'Stickers'}</span>
              </h3>
              <button
                onClick={onToggle}
                className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded transition-colors"
                aria-label="Close palette"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 스티커 그리드 */}
            <div className="flex-1 overflow-y-auto p-3">
              {stickers.length === 0 ? (
                <div className="text-center text-white/60 text-sm py-8">
                  <p>{t.stickerPalette?.empty || 'No stickers yet'}</p>
                  <p className="text-xs mt-2">{t.stickerPalette?.addHint || 'Click + to add'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {stickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className={`relative group bg-white/5 hover:bg-white/10 rounded-lg p-2 cursor-move transition-all select-none ${longPressStickerId === sticker.id ? 'scale-110 bg-white/20 shadow-lg' : ''
                        }`}
                      onContextMenu={(e) => e.preventDefault()}
                      onMouseDown={(e) => handleMouseDownSticker(sticker, e)}
                      onTouchStart={(e) => handleTouchStart(sticker, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{ WebkitTouchCallout: 'none' }}
                    >
                      <div className="aspect-square flex items-center justify-center mb-1">
                        <img
                          src={sticker.imageUrl}
                          alt={sticker.name}
                          className="max-w-full max-h-full object-contain select-none pointer-events-none"
                          draggable="false"
                        />
                      </div>
                      {sticker.name && (
                        <p className="text-xs text-white text-center truncate select-none">
                          {sticker.name}
                        </p>
                      )}
                      {/* 삭제 버튼 - 기본 스티커는 삭제 불가 */}
                      {!sticker.isPremade && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSticker(sticker.id);
                          }}
                          className="absolute top-1 right-1 p-2 sm:p-1.5 bg-red-500/80 hover:bg-red-500 rounded opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity touch-manipulation"
                          aria-label="Delete sticker"
                        >
                          <svg className="w-4 h-4 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 추가 버튼 */}
            <div className="p-3 border-t border-white/20">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t.stickerPalette?.add || 'Add Sticker'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 추가 모달 */}
      {showAddModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-60"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              {t.stickerPalette?.addTitle || 'Add Sticker'}
            </h2>

            {/* 이름 입력 */}
            <div className="mb-4">
              <label className="block text-sm text-white/80 mb-2">
                {t.stickerPalette?.nameLabel || 'Name (optional)'}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t.stickerPalette?.namePlaceholder || 'Sticker name'}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* URL 입력 */}
            <div className="mb-4">
              <label className="block text-sm text-white/80 mb-2">
                {t.stickerPalette?.urlLabel || 'Image URL'}
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/sticker.png"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* 파일 업로드 */}
            <div className="mb-6">
              <label className="block text-sm text-white/80 mb-2">
                {t.stickerPalette?.fileLabel || 'Or upload file'}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAddByFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
              >
                📁 {t.stickerPalette?.chooseFile || 'Choose File'}
              </button>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {t.button?.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleAddByUrl}
                disabled={!urlInput.trim()}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.stickerPalette?.addButton || 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StickerPalette;
