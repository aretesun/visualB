import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageUrlModalProps {
  onSubmit: (url: string) => void;
  onClose: () => void;
}

const ImageUrlModal: React.FC<ImageUrlModalProps> = ({ onSubmit, onClose }) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validateImageUrl = (url: string): boolean => {
    // Basic URL format validation
    try {
      const urlObj = new URL(url);
      // Check if it's http or https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setError('http 또는 https URL만 사용 가능합니다');
        return false;
      }
      return true;
    } catch {
      setError('올바른 URL 형식이 아닙니다');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('URL을 입력해주세요');
      return;
    }

    const isValid = validateImageUrl(url.trim());
    if (isValid) {
      onSubmit(url.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 60 }}
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-xl font-semibold text-white mb-4">{t.urlModal.title}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder={t.urlModal.placeholder}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {error && (
              <p className="mt-2 text-sm text-red-300">{error}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {t.urlModal.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              {t.urlModal.add}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/60">
            {t.urlModal.tip}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUrlModal;
