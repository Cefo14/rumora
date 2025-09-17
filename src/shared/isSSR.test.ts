import { describe, it, expect, vi, afterEach } from 'vitest';
import { isSSR } from './isSSR';

describe('isSSR', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('when window is available', () => {
    it('should return false when running in browser environment', () => {
      // Given: Browser environment
      vi.stubGlobal('window', {});

      // When
      const result = isSSR();

      // Then
      expect(result).toBe(false);
    });
  });

  describe('when window is not available', () => {
    it('should return true when running in server environment', () => {
      // Given: Server environment
      vi.stubGlobal('window', undefined);

      // When
      const result = isSSR();

      // Then
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return false when window is null', () => {
      // Given
      vi.stubGlobal('window', null);

      // When
      const result = isSSR();

      // Then
      expect(result).toBe(false); // null !== undefined
    });

    it('should return false when window is false', () => {
      // Given
      vi.stubGlobal('window', false);

      // When
      const result = isSSR();

      // Then
      expect(result).toBe(false); // false !== undefined
    });
  });
});
