import React, { useRef, useState } from 'react';
import { PlusIcon } from './Icons';
import { CONSTANTS } from '../utils/constants';
import type { TemplateId } from '../types';
import TemplatePicker from './TemplatePicker';

interface AddCardButtonProps {
  onAddCard: (templateId?: TemplateId) => void;
  lastTemplateId: TemplateId;
}

const LONG_PRESS_MS = 450;

const AddCardButton: React.FC<AddCardButtonProps> = ({ onAddCard, lastTemplateId }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const didLongPressRef = useRef(false);
  const pointerButtonRef = useRef<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const openPicker = () => {
    if (buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }
    setIsPickerOpen(true);
  };

  const closePicker = () => {
    setIsPickerOpen(false);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    pointerButtonRef.current = event.button;
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    didLongPressRef.current = false;
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = window.setTimeout(() => {
      didLongPressRef.current = true;
      openPicker();
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (pointerButtonRef.current !== 0) {
      pointerButtonRef.current = null;
      return;
    }
    pointerButtonRef.current = null;

    if (!didLongPressRef.current) {
      onAddCard(lastTemplateId);
    }
  };

  const handlePointerCancel = () => {
    pointerButtonRef.current = null;
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        onContextMenu={(event) => {
          event.preventDefault();
          openPicker();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onAddCard(lastTemplateId);
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openPicker();
          }
        }}
        className="group fixed bottom-6 right-6 sm:bottom-8 sm:right-8 p-4 bg-white/20 text-white rounded-full shadow-lg backdrop-blur-lg hover:bg-white/30 active:bg-white/40 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 hover:shadow-xl"
        style={{ touchAction: 'none', zIndex: CONSTANTS.Z_INDEX.UI_ELEMENTS }}
        aria-label="Add new card"
      >
        <PlusIcon className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        {/* Tooltip */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-black/80 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          카드 추가
        </span>
      </button>
      <TemplatePicker
        isOpen={isPickerOpen}
        anchorRect={anchorRect}
        lastTemplateId={lastTemplateId}
        onClose={closePicker}
        onSelect={(templateId) => {
          onAddCard(templateId);
          closePicker();
        }}
      />
    </>
  );
};

export default AddCardButton;
