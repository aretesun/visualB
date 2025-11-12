import { CONSTANTS } from '../utils/constants';

/**
 * localStorage/sessionStorage 관리를 담당하는 서비스
 */
export class StorageService {
  /**
   * localStorage에 안전하게 저장
   */
  static save<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
      } else {
        console.error('Failed to save to storage:', error);
      }
      return false;
    }
  }

  /**
   * localStorage에서 로드
   */
  static load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return defaultValue;
    }
  }

  /**
   * localStorage에서 삭제
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  }

  /**
   * sessionStorage에 안전하게 저장
   */
  static saveSession<T>(key: string, data: T): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to session storage:', error);
      return false;
    }
  }

  /**
   * sessionStorage에서 로드
   */
  static loadSession<T>(key: string, defaultValue: T): T {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from session storage:', error);
      return defaultValue;
    }
  }

  /**
   * 전체 데이터 크기 계산 (MB)
   */
  static getUsage(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total / (1024 * 1024); // MB로 변환
  }

  /**
   * 저장 공간이 충분한지 확인
   */
  static hasSpace(requiredMB: number = 5): boolean {
    const usage = this.getUsage();
    // 대부분의 브라우저는 5-10MB 제공
    return usage < requiredMB;
  }

  /**
   * 저장 공간 정리
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * 특정 패턴의 키를 모두 삭제
   */
  static clearByPattern(pattern: string): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(pattern)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear by pattern:', error);
    }
  }

  /**
   * 데이터 백업
   */
  static backup(keys: string[]): Record<string, any> {
    const backup: Record<string, any> = {};
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          backup[key] = JSON.parse(value);
        } catch {
          backup[key] = value;
        }
      }
    });
    return backup;
  }

  /**
   * 데이터 복원
   */
  static restore(backup: Record<string, any>): boolean {
    try {
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }

  /**
   * 모든 키 목록 가져오기
   */
  static getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  /**
   * 특정 키가 존재하는지 확인
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
