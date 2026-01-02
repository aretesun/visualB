import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../storageService';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads data', () => {
    const key = 'test-key';
    const value = { foo: 'bar' };
    const saved = StorageService.save(key, value);
    expect(saved).toBe(true);
    const loaded = StorageService.load(key, null as any);
    expect(loaded).toEqual(value);
  });

  it('reports storage usage', () => {
    StorageService.save('usage-test', { data: 'x'.repeat(100) });
    const usage = StorageService.getUsage();
    expect(usage).toBeGreaterThan(0);
  });
});
