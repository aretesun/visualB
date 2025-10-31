import React, { useState, useRef } from 'react';
import { Card } from '../types';

interface SettingsMenuProps {
  items: Card[];
  onRestore: (items: Card[]) => void;
  onShowToast: (message: string) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ items, onRestore, onShowToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify(items, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vision-board-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('백업 파일이 다운로드되었습니다.');
      setIsOpen(false);
    } catch (error) {
      onShowToast('백업에 실패했습니다.');
      console.error('Backup failed:', error);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const restoredItems = JSON.parse(content) as Card[];

        // 데이터 유효성 검증
        if (!Array.isArray(restoredItems)) {
          throw new Error('Invalid backup file format');
        }

        onRestore(restoredItems);
        onShowToast('백업이 복원되었습니다.');
        setIsOpen(false);
      } catch (error) {
        onShowToast('복원에 실패했습니다. 올바른 백업 파일인지 확인해주세요.');
        console.error('Restore failed:', error);
      }
    };
    reader.readAsText(file);

    // input 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = '';
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* 설정 이모지 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all backdrop-blur-md shadow-lg text-2xl"
        aria-label="Toggle settings menu"
      >
        ⚙️
      </button>

      {/* 설정 메뉴 */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-white/10 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 p-3 min-w-[160px]">
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleBackup}
              className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-sm font-medium">백업하기</span>
            </button>
            <button
              onClick={handleRestoreClick}
              className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-sm font-medium">복원하기</span>
            </button>
          </div>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default SettingsMenu;
