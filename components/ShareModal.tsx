import React from 'react';

interface ShareModalProps {
  onClose: () => void;
  onShareAsImage: () => void;
  onShareAsFile: () => void;
  onShareAsLink: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  onClose,
  onShareAsImage,
  onShareAsFile,
  onShareAsLink,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-xl font-semibold text-white mb-4">공유하기</h2>
        <p className="text-sm text-white/70 mb-6">
          비전보드를 공유할 방법을 선택하세요
        </p>

        <div className="flex flex-col space-y-3">
          {/* 이미지로 저장 */}
          <button
            onClick={() => {
              onShareAsImage();
              onClose();
            }}
            className="flex items-center space-x-3 px-4 py-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left group"
          >
            <div className="text-3xl">📸</div>
            <div className="flex-1">
              <div className="text-white font-medium">이미지로 저장</div>
              <div className="text-sm text-white/60">
                현재 화면을 이미지로 다운로드
              </div>
            </div>
            <svg
              className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* 파일로 공유 (비활성화) */}
          <button
            onClick={onShareAsFile}
            disabled
            className="flex items-center space-x-3 px-4 py-4 bg-white/5 rounded-lg text-left opacity-50 cursor-not-allowed relative"
            title="추후 제공 예정 (데이터 병합 기능 추가 후)"
          >
            <div className="text-3xl">💾</div>
            <div className="flex-1">
              <div className="text-white font-medium flex items-center gap-2">
                파일로 공유
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                  준비중
                </span>
              </div>
              <div className="text-sm text-white/60">
                편집 가능한 파일로 내보내기
              </div>
            </div>
            <svg
              className="w-5 h-5 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </button>

          {/* 링크로 공유 */}
          <button
            onClick={() => {
              onShareAsLink();
              onClose();
            }}
            className="flex items-center space-x-3 px-4 py-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left group"
          >
            <div className="text-3xl">🔗</div>
            <div className="flex-1">
              <div className="text-white font-medium">링크로 공유</div>
              <div className="text-sm text-white/60">
                URL에 데이터를 담아 간편하게 공유
              </div>
            </div>
            <svg
              className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
