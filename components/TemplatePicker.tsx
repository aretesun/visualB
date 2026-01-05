import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { TemplateId } from '../types';
import { CARD_TEMPLATE_IDS } from '../utils/cardTemplates';
import { useLanguage } from '../contexts/LanguageContext';

interface TemplatePickerProps {
  isOpen: boolean;
  anchorRect?: DOMRect | null;
  lastTemplateId: TemplateId;
  onClose: () => void;
  onSelect: (templateId: TemplateId) => void;
}

const TemplatePicker: React.FC<TemplatePickerProps> = ({
  isOpen,
  anchorRect,
  lastTemplateId,
  onClose,
  onSelect,
}) => {
  const { t } = useLanguage();
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const desktopPosition = useMemo(() => {
    if (!anchorRect) {
      return { right: 24, bottom: 96 };
    }

    const right = Math.max(12, window.innerWidth - anchorRect.right);
    const bottom = Math.max(12, window.innerHeight - anchorRect.top + 12);
    return { right, bottom };
  }, [anchorRect]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        className={`fixed bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl ${
          isMobile ? 'left-0 right-0 bottom-0 rounded-t-2xl' : 'rounded-xl'
        }`}
        style={isMobile ? undefined : desktopPosition}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-sm font-semibold text-white/90">{t.templates.title}</span>
          <button
            className="text-xs text-white/60 hover:text-white/90"
            onClick={onClose}
          >
            {t.button.close}
          </button>
        </div>
        <div className={`p-3 ${isMobile ? 'max-h-[50vh]' : 'max-h-[320px]'} overflow-y-auto`}>
          {CARD_TEMPLATE_IDS.map((templateId) => {
            const template = t.templates.items[templateId];
            return (
              <button
                key={templateId}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => onSelect(templateId)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{template.label}</span>
                  {templateId === lastTemplateId && (
                    <span className="text-xs text-white/60">{t.templates.recent}</span>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1">{template.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default TemplatePicker;
