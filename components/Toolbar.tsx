
import React from 'react';
import { RefreshCwIcon, ShareIcon } from './Icons';

interface ToolbarProps {
  onRefreshBackground: () => void;
  onShareClick: () => void;
  isSharedView?: boolean; // 공유 보기 모드
}

const Toolbar: React.FC<ToolbarProps> = ({ onRefreshBackground, onShareClick, isSharedView = false }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full shadow-lg flex items-center space-x-2 z-10">
      <h1 className="text-white font-bold text-lg px-3 hidden sm:block">
        {isSharedView ? '👀 공유된 보드' : 'Visual Board'}
      </h1>
      {!isSharedView && (
        <>
          <button
            onClick={onRefreshBackground}
            className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-transform transform hover:rotate-90"
            aria-label="Refresh background"
          >
            <RefreshCwIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onShareClick}
            className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            aria-label="Share board"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default Toolbar;
