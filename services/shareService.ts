import { Card } from '../types';
import { CONSTANTS } from '../utils/constants';

export interface ShareResponse {
  success: boolean;
  shareId?: string;
  shareUrl?: string;
  error?: string;
}

export interface LoadResponse {
  success: boolean;
  items?: Card[];
  error?: string;
}

/**
 * 공유 기능 관련 API 통신을 담당하는 서비스
 */
export class ShareService {
  /**
   * 보드를 서버에 저장하고 공유 링크 생성
   */
  static async save(items: Card[]): Promise<ShareResponse> {
    try {
      const response = await fetch(`${CONSTANTS.WORKER_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.id) {
        return {
          success: true,
          shareId: data.id,
          shareUrl: `${window.location.origin}${window.location.pathname}?id=${data.id}`,
        };
      }

      return { success: false, error: 'Invalid response' };
    } catch (error) {
      console.error('Share failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 공유된 보드 로드
   */
  static async load(shareId: string): Promise<LoadResponse> {
    try {
      const response = await fetch(`${CONSTANTS.WORKER_URL}/load?id=${shareId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.items) {
        return {
          success: true,
          items: data.items,
        };
      }

      return { success: false, error: 'Invalid response' };
    } catch (error) {
      console.error('Load failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 레거시 base64 방식으로 공유 링크 생성 (호환성)
   */
  static createLegacyShareLink(items: Card[]): string {
    try {
      const jsonData = JSON.stringify(items);
      const base64 = btoa(encodeURIComponent(jsonData));
      return `${window.location.origin}${window.location.pathname}?data=${base64}`;
    } catch (error) {
      throw new Error('Failed to create share link');
    }
  }

  /**
   * 레거시 링크에서 데이터 파싱
   */
  static parseLegacyShareLink(base64Data: string): Card[] {
    try {
      const jsonData = decodeURIComponent(atob(base64Data));
      return JSON.parse(jsonData) as Card[];
    } catch (error) {
      throw new Error('Failed to parse share link');
    }
  }

  /**
   * URL이 너무 긴지 확인 (브라우저 제한)
   */
  static isUrlTooLong(url: string): boolean {
    // 대부분의 브라우저는 2000자 이상의 URL을 지원하지 않음
    return url.length > 2000;
  }

  /**
   * 공유 링크를 클립보드에 복사
   */
  static async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}
