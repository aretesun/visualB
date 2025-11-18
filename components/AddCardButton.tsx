import React from 'react';
import { PlusIcon } from './Icons';

interface AddCardButtonProps {
  onAddCard: () => void;
}

const AddCardButton: React.FC<AddCardButtonProps> = ({ onAddCard }) => {
  return (
    <button
      onClick={onAddCard}
      onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAddCard();
      }}
      className="group fixed bottom-6 right-6 sm:bottom-8 sm:right-8 p-4 bg-white/20 text-white rounded-full shadow-lg backdrop-blur-lg hover:bg-white/30 active:bg-white/40 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 hover:shadow-xl z-40"
      style={{ touchAction: 'none' }}
      aria-label="Add new card"
    >
      <PlusIcon className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-black/80 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        카드 추가
      </span>
    </button>
  );
};

export default AddCardButton;
