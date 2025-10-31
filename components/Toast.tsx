import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 마운트 직후 표시
    setTimeout(() => setIsVisible(true), 10);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 페이드 아웃 후 제거
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-xl text-white px-6 py-4 rounded-lg shadow-2xl border border-white/30 z-[100] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{ transform: `translate(-50%, ${isVisible ? '0' : '-0.5rem'})` }}
    >
      <p className="text-center font-medium">{message}</p>
    </div>
  );
};

export default Toast;
