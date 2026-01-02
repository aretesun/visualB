import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CONSTANTS } from '../utils/constants';

interface DeveloperNotesProps {
  onClose: () => void;
}

const DeveloperNotes: React.FC<DeveloperNotesProps> = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ zIndex: CONSTANTS.Z_INDEX.MODAL }}
    >
      <div className="bg-white/10 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{t.developerNotes.title}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 업데이트 내용 */}
        <div className="space-y-6 text-white">
          {/* 최신 업데이트 */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-semibold">✨ v1.5.0</span>
              <span className="text-sm text-white/60">2025-11-13</span>
            </div>
            <ul className="space-y-2 text-sm text-white/80 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>카드/스티커 레이어 정교화 (올리기/내리기)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>카드 색상 팔레트 추가</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>공간(보드) 생성/전환 기능</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>편집 UX 개선: 편집 모드 토글, 이미지 변경 버튼</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>모바일 스냅/버튼 정렬 및 사이즈 최적화</span>
              </li>
            </ul>
          </div>

          {/* 이전 업데이트 */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-semibold">🚀 v1.4.0</span>
              <span className="text-sm text-white/60">2025-11-11</span>
            </div>
            <ul className="space-y-2 text-sm text-white/80 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>짧은 링크 공유 기능 (Cloudflare Workers 연동)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>이미지 캡처 CORS 문제 완전 해결</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>공유 링크 1일 자동 만료 (용량 최적화)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>공유 모달 UI 개선</span>
              </li>
            </ul>
          </div>

          {/* 이전 업데이트 */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-semibold">✨ v1.3.0</span>
              <span className="text-sm text-white/60">2025-11-05</span>
            </div>
            <ul className="space-y-2 text-sm text-white/80 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>브라우저 창 크기 변경 시 카드 위치 자동 조정</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>이미지 드래그 경계 제한 개선 (빈 공간 방지)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">•</span>
                <span>이미지 위치 조정 시 실제 렌더링 크기 기반 계산</span>
              </li>
            </ul>
          </div>

          {/* 이전 업데이트 */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-semibold">🎨 v1.2.0</span>
              <span className="text-sm text-white/60">2025-11-04</span>
            </div>
            <ul className="space-y-2 text-sm text-white/80 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>URL 입력으로 이미지 추가 기능</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>25개의 다양한 여행 테마 배경 이미지 추가</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>이미지 소스 선택 드롭다운 메뉴 개선</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-semibold">🔧 v1.1.0</span>
              <span className="text-sm text-white/60">2025-11-03</span>
            </div>
            <ul className="space-y-2 text-sm text-white/80 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>카드 크기 조절 기능 (모든 모서리 및 변)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>이미지 위치 잠금/해제 기능</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>이미지 마스킹 (크롭) 기능</span>
              </li>
            </ul>
          </div>

          {/* 기능 안내 */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-400/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t.developerNotes.features}</span>
            </h3>
            <ul className="space-y-2 text-sm text-white/80 ml-4">
              <li className="flex items-start space-x-2">
                <span className="mt-1">💡</span>
                <span>{t.developerNotes.cardMove}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="mt-1">📐</span>
                <span>{t.developerNotes.cardResize}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="mt-1">🖼️</span>
                <span>{t.developerNotes.imageAdjust}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="mt-1">🔄</span>
                <span>{t.developerNotes.backgroundChange}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 후원 버튼 */}
        <div className="mt-6">
          <a
            href="https://buymeacoffee.com/aretesun"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>{t.developerNotes.buyMeCoffee}</span>
          </a>
        </div>

        {/* 푸터 */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-white/60">
          {t.developerNotes.madeWith}
        </div>
      </div>
    </div>
  );
};

export default DeveloperNotes;
