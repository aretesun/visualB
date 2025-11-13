import { Size } from '../types';

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * 이미지 처리 유틸리티 클래스
 */
export class ImageUtils {
  /**
   * 이미지 파일을 압축하여 base64로 반환
   */
  static async compress(
    file: File,
    options: CompressOptions = {}
  ): Promise<string> {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.7,
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // 비율 유지하며 리사이즈
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 이미지 URL의 크기 가져오기
   */
  static async getSize(url: string): Promise<Size> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  /**
   * 유효한 이미지 URL인지 확인
   */
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(urlObj.pathname);
    } catch {
      return false;
    }
  }

  /**
   * 이미지가 base64인지 확인
   */
  static isBase64(str: string): boolean {
    return str.startsWith('data:image/');
  }

  /**
   * 이미지를 로드하고 완료될 때까지 대기
   */
  static async waitForLoad(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        // 타임아웃 설정 (3초)
        setTimeout(() => reject(new Error('Image load timeout')), CONSTANTS.IMAGE_LOAD_TIMEOUT_MS);
      }
    });
  }
}
