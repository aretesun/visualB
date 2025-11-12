import { useState, useCallback } from 'react';
import { ImageUtils } from '../utils/imageUtils';

/**
 * 이미지 편집 관련 로직을 담은 커스텀 훅
 */
export const useImageEditor = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  /**
   * 편집 모드 토글
   */
  const toggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  /**
   * 잠금 토글
   */
  const toggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
  }, []);

  /**
   * 편집 모드 종료
   */
  const endEdit = useCallback(() => {
    setIsEditing(false);
    setIsLocked(true); // 편집 종료 시 다시 잠금
  }, []);

  /**
   * 이미지 압축
   */
  const compressImage = useCallback(async (file: File) => {
    try {
      const compressed = await ImageUtils.compress(file);
      return { success: true, data: compressed };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  /**
   * 이미지 URL 유효성 검사
   */
  const validateUrl = useCallback((url: string) => {
    return ImageUtils.isValidUrl(url);
  }, []);

  /**
   * Base64 이미지인지 확인
   */
  const isBase64 = useCallback((str: string) => {
    return ImageUtils.isBase64(str);
  }, []);

  /**
   * 이미지 크기 가져오기
   */
  const getImageSize = useCallback(async (url: string) => {
    try {
      const size = await ImageUtils.getSize(url);
      return { success: true, size };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  return {
    isEditing,
    isLocked,
    toggleEdit,
    toggleLock,
    endEdit,
    compressImage,
    validateUrl,
    isBase64,
    getImageSize,
  };
};
