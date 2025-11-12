import React from 'react';
import { PlusIcon } from './Icons';

interface AddCardButtonProps {
  onAddCard: () => void;
}

const AddCardButton: React.FC<AddCardButtonProps> = ({ onAddCard }) => {
  return (
    <button
      onClick={onAddCard}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 p-4 bg-white/20 text-white rounded-full shadow-lg backdrop-blur-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-transform transform hover:scale-110 z-40"
      aria-label="Add new card"
    >
      <PlusIcon className="w-8 h-8" />
    </button>
  );
};

export default AddCardButton;
