
import React from 'react';
import { RefreshCwIcon } from './Icons';

interface ToolbarProps {
  onRefreshBackground: () => void;
  onToggleConnectionMode?: () => void;
  isConnectionMode?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onRefreshBackground,
  onToggleConnectionMode,
  isConnectionMode = false
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full shadow-lg flex items-center space-x-2 z-10">
      <h1 className="text-white font-bold text-lg px-3 hidden sm:block">Visual Board</h1>

      {/* 배경 새로고침 버튼 */}
      <button
        onClick={onRefreshBackground}
        className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-transform transform hover:rotate-90"
        aria-label="Refresh background"
      >
        <RefreshCwIcon className="w-5 h-5" />
      </button>

      {/* 연결 모드 토글 버튼 */}
      {onToggleConnectionMode && (
        <button
          onClick={onToggleConnectionMode}
          className={`p-3 rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all ${
            isConnectionMode ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
          }`}
          aria-label="Toggle connection mode"
          title={isConnectionMode ? '연결 모드 OFF' : '연결 모드 ON'}
        >
          {/* 연결 아이콘 (두 점과 선) */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="12" r="2" />
            <circle cx="18" cy="12" r="2" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toolbar;
