import { useEffect, useRef } from 'react';

const DEBUG_KEY = 'vb-debug-renders';

export const useRenderTracker = (label: string, id: string | number) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    if (localStorage.getItem(DEBUG_KEY) !== '1') return;
    console.debug(`[render] ${label}(${id}) #${renderCount.current}`);
  });
};
