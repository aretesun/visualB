import React, { useState } from 'react';

interface LinkItem {
  title: string;
  url: string;
}

const links: LinkItem[] = [
  {
    title: '미루지마',
    url: 'https://aretesun.github.io/donotdelay/'
  },
  {
    title: '마음챙김',
    url: 'https://aretesun.github.io/buddha-quotes/'
  },
  {
    title: 'Gemini 여행 플래너',
    url: 'https://ai.studio/apps/drive/1KAUVZyUm0wSH9pWD_mC4Hdyyr6GO4WkP'
  },
  {
    title: 'Creative Studio',
    url: 'https://ai.studio/apps/drive/1VXWXVN1Ckz-6eRzMPbbSYvbnb-nfJTFo'
  }
];

const LinksMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* 웃는 이모지 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all backdrop-blur-md shadow-lg text-2xl"
        aria-label="Toggle links menu"
      >
        😊
      </button>

      {/* 링크 메뉴 */}
      {isOpen && (
        <div className="absolute top-16 right-0 bg-white/10 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 p-3 min-w-[200px]">
          <div className="flex flex-col space-y-2">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-sm font-medium">{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinksMenu;
