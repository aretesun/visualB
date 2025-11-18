import { useState, useRef, useCallback, useEffect } from 'react';

interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
}

interface UseZoomPanOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

export const useZoomPan = (options: UseZoomPanOptions = {}) => {
  const {
    minScale = 0.5,
    maxScale = 3,
    initialScale = 1,
  } = options;

  const [transform, setTransform] = useState<ZoomPanState>({
    scale: initialScale,
    translateX: 0,
    translateY: 0,
  });

  const [isPanning, setIsPanning] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);

  // 줌 함수
  const zoom = useCallback((delta: number, centerX: number, centerY: number) => {
    setTransform((prev) => {
      const newScale = Math.min(maxScale, Math.max(minScale, prev.scale + delta));

      if (newScale === prev.scale) return prev;

      // 줌 중심점을 기준으로 조정
      const scaleDiff = newScale - prev.scale;
      const newTranslateX = prev.translateX - (centerX - prev.translateX) * (scaleDiff / prev.scale);
      const newTranslateY = prev.translateY - (centerY - prev.translateY) * (scaleDiff / prev.scale);

      return {
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      };
    });
  }, [minScale, maxScale]);

  // 팬 함수
  const pan = useCallback((deltaX: number, deltaY: number) => {
    setTransform((prev) => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
    }));
  }, []);

  // 휠 이벤트 핸들러
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      zoom(delta, e.clientX, e.clientY);
    }
  }, [zoom]);

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      // 핀치 시작
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistanceRef.current = distance;
    } else if (e.touches.length === 1) {
      // 팬 시작
      const touch = e.touches[0];
      lastPosRef.current = { x: touch.clientX, y: touch.clientY };
      setIsPanning(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      // 핀치 줌
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      const delta = (distance - lastTouchDistanceRef.current) * 0.01;
      zoom(delta, centerX, centerY);

      lastTouchDistanceRef.current = distance;
    } else if (e.touches.length === 1 && isPanning) {
      // 팬
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPosRef.current.x;
      const deltaY = touch.clientY - lastPosRef.current.y;

      pan(deltaX, deltaY);

      lastPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [isPanning, zoom, pan]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistanceRef.current = null;
    setIsPanning(false);
  }, []);

  // 리셋 함수
  const reset = useCallback(() => {
    setTransform({
      scale: initialScale,
      translateX: 0,
      translateY: 0,
    });
  }, [initialScale]);

  return {
    transform,
    isPanning,
    zoom,
    pan,
    reset,
    handlers: {
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
