
import React from 'react';
import { RefreshCwIcon } from './Icons';

interface ToolbarProps {
  onRefreshBackground: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onRefreshBackground }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full shadow-lg flex items-center space-x-2 z-10">
      <h1 className="text-white font-bold text-lg px-3 hidden sm:block">Visual Board</h1>
      <button
        onClick={onRefreshBackground}
        className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-transform transform hover:rotate-90"
        aria-label="Refresh background"
      >
        <RefreshCwIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toolbar;
