import React, { useState, useRef } from 'react';
import { useBackgroundStore, CustomBackground } from '../store/useBackgroundStore';
import { useLanguage } from '../contexts/LanguageContext';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    source,
    customBackgrounds,
    customMode,
    selectedSingleId,
    randomBackgroundIds,
    randomInterval,
    timedIntervalMinutes,
    setSource,
    addCustomBackground,
    deleteCustomBackground,
    setCustomMode,
    setSelectedSingle,
    toggleRandomBackground,
    setRandomInterval,
    setTimedIntervalMinutes,
  } = useBackgroundStore();

  if (!isOpen) return null;

  const handleAddByUrl = () => {
    if (urlInput.trim()) {
      const newBackground: CustomBackground = {
        id: `bg_${Date.now()}`,
        imageUrl: urlInput.trim(),
        name: nameInput.trim() || 'Background',
        addedAt: Date.now(),
      };
      addCustomBackground(newBackground);
      setUrlInput('');
      setNameInput('');
      setShowAddForm(false);
    }
  };

  const handleAddByFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newBackground: CustomBackground = {
          id: `bg_${Date.now()}`,
          imageUrl: reader.result as string,
          name: nameInput.trim() || file.name.replace(/\.[^/.]+$/, ''),
          addedAt: Date.now(),
        };
        addCustomBackground(newBackground);
        setNameInput('');
        setShowAddForm(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const isRandomModeEnabled = source === 'custom' && customMode === 'random';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-60"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            🖼️ {t.backgroundSettings?.title || '배경 설정'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Background Source Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/90 mb-3">
            {t.backgroundSettings?.sourceLabel || '배경 소스'}
          </h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                name="backgroundSource"
                checked={source === 'system'}
                onChange={() => setSource('system')}
                className="w-4 h-4 text-blue-500"
              />
              <span className="text-white">
                {t.backgroundSettings?.systemLabel || '시스템 이미지 (Unsplash)'}
              </span>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                name="backgroundSource"
                checked={source === 'custom'}
                onChange={() => setSource('custom')}
                className="w-4 h-4 text-blue-500"
              />
              <span className="text-white">
                {t.backgroundSettings?.customLabel || '내 이미지 사용'}
              </span>
            </label>
          </div>
        </div>

        {/* Custom Background Options */}
        {source === 'custom' && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            {/* Single vs Random Mode */}
            <div className="mb-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customMode === 'random'}
                  onChange={(e) => setCustomMode(e.target.checked ? 'random' : 'single')}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-white/90">
                  {t.backgroundSettings?.randomModeLabel || '여러 개 랜덤 순환'}
                </span>
              </label>
            </div>

            {/* Single Mode - Radio Selection */}
            {customMode === 'single' && customBackgrounds.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm text-white/80 mb-2">
                  {t.backgroundSettings?.selectSingleLabel || '배경 선택'}
                </h4>
                {customBackgrounds.map((bg) => (
                  <div
                    key={bg.id}
                    className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 transition-colors"
                  >
                    <label className="flex items-center space-x-3 flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="singleBackground"
                        checked={selectedSingleId === bg.id}
                        onChange={() => setSelectedSingle(bg.id)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <img
                        src={bg.imageUrl}
                        alt={bg.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="text-white text-sm truncate">{bg.name}</span>
                    </label>
                    <button
                      onClick={() => deleteCustomBackground(bg.id)}
                      className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded ml-2 touch-manipulation"
                      aria-label="Delete background"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Random Mode - Checkbox Selection (Accordion) */}
            {isRandomModeEnabled && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-sm text-white/80 mb-3">
                  {t.backgroundSettings?.randomSelectionLabel || '순환할 배경 선택 (최대 5개)'}
                </h4>

                {customBackgrounds.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {customBackgrounds.map((bg) => {
                      const isSelected = randomBackgroundIds.includes(bg.id);
                      const canSelect = randomBackgroundIds.length < 5 || isSelected;

                      return (
                        <div
                          key={bg.id}
                          className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 transition-colors"
                        >
                          <label
                            className={`flex items-center space-x-3 flex-1 ${
                              canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRandomBackground(bg.id)}
                              disabled={!canSelect}
                              className="w-4 h-4 text-blue-500 rounded"
                            />
                            <img
                              src={bg.imageUrl}
                              alt={bg.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span className="text-white text-sm truncate">{bg.name}</span>
                          </label>
                          <button
                            onClick={() => deleteCustomBackground(bg.id)}
                            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded ml-2 touch-manipulation"
                            aria-label="Delete background"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-white/60 text-sm mb-4">
                    {t.backgroundSettings?.noBackgrounds || '등록된 배경이 없습니다'}
                  </p>
                )}

                {/* Rotation Interval Settings */}
                {randomBackgroundIds.length > 0 && (
                  <div className="mt-4 p-3 bg-white/5 rounded">
                    <h5 className="text-sm text-white/80 mb-2">
                      {t.backgroundSettings?.rotationLabel || '배경 전환 시점'}
                    </h5>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="rotationInterval"
                          checked={randomInterval === 'refresh'}
                          onChange={() => setRandomInterval('refresh')}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-white/90 text-sm">
                          {t.backgroundSettings?.refreshLabel || '페이지 새로고침 시'}
                        </span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="rotationInterval"
                          checked={randomInterval === 'timed'}
                          onChange={() => setRandomInterval('timed')}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-white/90 text-sm">
                          {t.backgroundSettings?.timedLabel || '일정 시간마다'}
                        </span>
                      </label>
                      {randomInterval === 'timed' && (
                        <div className="ml-7 mt-2">
                          <input
                            type="number"
                            min="1"
                            max="1440"
                            value={timedIntervalMinutes}
                            onChange={(e) => setTimedIntervalMinutes(Number(e.target.value))}
                            className="w-20 px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                          />
                          <span className="text-white/80 text-sm ml-2">
                            {t.backgroundSettings?.minutesLabel || '분'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Background Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 mt-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t.backgroundSettings?.addButton || '배경 추가'}</span>
            </button>

            {/* Add Form */}
            {showAddForm && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="mb-3">
                  <label className="block text-sm text-white/80 mb-2">
                    {t.backgroundSettings?.nameLabel || '이름 (선택사항)'}
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={t.backgroundSettings?.namePlaceholder || '배경 이름'}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-white/80 mb-2">
                    {t.backgroundSettings?.urlLabel || '이미지 URL'}
                  </label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/background.jpg"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-white/80 mb-2">
                    {t.backgroundSettings?.fileLabel || '또는 파일 업로드'}
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
                    📁 {t.backgroundSettings?.chooseFile || '파일 선택'}
                  </button>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {t.button?.cancel || '취소'}
                  </button>
                  <button
                    onClick={handleAddByUrl}
                    disabled={!urlInput.trim()}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.backgroundSettings?.addConfirm || '추가'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State for Custom */}
        {source === 'custom' && customBackgrounds.length === 0 && !showAddForm && (
          <div className="text-center text-white/60 text-sm py-6">
            <p>{t.backgroundSettings?.emptyHint || '배경을 추가해주세요'}</p>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            {t.button?.close || '닫기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettingsModal;
