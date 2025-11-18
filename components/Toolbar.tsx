
import React, { useState } from 'react';
import { RefreshCwIcon, ShareIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ToolbarProps {
  onRefreshBackground: () => void;
  onShareClick: () => void;
  isSharedView?: boolean; // 공유 보기 모드
}

const Toolbar: React.FC<ToolbarProps> = ({ onRefreshBackground, onShareClick, isSharedView = false }) => {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return; // 중복 클릭 방지

    setIsRefreshing(true);
    onRefreshBackground();

    // 애니메이션이 보이도록 최소 시간 보장
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full shadow-lg flex items-center space-x-2 z-20">
      <h1 className="text-white font-bold text-lg px-3 hidden sm:block">
        {isSharedView ? `👀 ${t.toolbar.sharedTitle}` : t.toolbar.title}
      </h1>
      {!isSharedView && (
        <>
          <button
            onClick={handleRefresh}
            onTouchEnd={(e) => {
              if (isRefreshing) return;
              e.preventDefault();
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isRefreshing}
            className="group relative p-3 bg-white/20 text-white rounded-full hover:bg-white/30 active:bg-white/40 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ touchAction: 'none' }}
            aria-label="Refresh background"
          >
            <RefreshCwIcon
              className={`w-5 h-5 transition-transform duration-500 ${
                isRefreshing ? 'animate-spin' : 'group-hover:rotate-90'
              }`}
            />
            {/* Tooltip */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {t.toolbar?.refreshBackground || '배경 새로고침'}
            </span>
          </button>
          <button
            onClick={onShareClick}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShareClick();
            }}
            className="group relative p-3 bg-white/20 text-white rounded-full hover:bg-white/30 active:bg-white/40 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
            style={{ touchAction: 'none' }}
            aria-label="Share board"
          >
            <ShareIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {/* Tooltip */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {t.toolbar?.share || '공유하기'}
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default Toolbar;
