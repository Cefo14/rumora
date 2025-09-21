import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { generateId } from './generateId';
import { 
  isValidUUIDFormat, 
  hasValidUUIDStructure, 
  hasValidUUIDVersion, 
  hasValidUUIDVariant 
} from '@/test-utils/helpers/uuidHelpers';

describe('generateId', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('when crypto.randomUUID is available', () => {
    beforeEach(() => {
      // Given: Modern browser with crypto.randomUUID support
      const mockRandomUUID = vi.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
      vi.stubGlobal('crypto', {
        randomUUID: mockRandomUUID
      });
    });

    it('should use crypto.randomUUID when available', () => {
      // Given
      const expectedUUID = '123e4567-e89b-12d3-a456-426614174000';

      // When
      const result = generateId();

      // Then
      expect(result).toBe(expectedUUID);
      expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
      expect(crypto.randomUUID).toHaveBeenCalledWith();
    });

    it('should return valid UUID format from crypto.randomUUID', () => {
      // Given
      const realUUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      vi.mocked(crypto.randomUUID).mockReturnValue(realUUID);

      // When
      const result = generateId();

      // Then
      expect(isValidUUIDFormat(result)).toBe(true);
      expect(hasValidUUIDStructure(result)).toBe(true);
    });
  });

  describe('when crypto.randomUUID is not available', () => {
    beforeEach(() => {
      // Given: Older browser without crypto.randomUUID
      vi.stubGlobal('crypto', undefined);
    });

    it('should generate fallback UUID when crypto is undefined', () => {
      // Given
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      // When
      const result = generateId();

      // Then
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(hasValidUUIDStructure(result)).toBe(true);
      expect(Math.random).toHaveBeenCalled();
    });

    it('should generate fallback UUID when crypto.randomUUID is undefined', () => {
      // Given: crypto exists but randomUUID doesn't
      vi.stubGlobal('crypto', {});

      // When
      const result = generateId();

      // Then
      expect(result).toBeDefined();
      expect(hasValidUUIDStructure(result)).toBe(true);
    });

    it('should generate valid UUID v4 format in fallback mode', () => {
      // Given
      // Math.random sequence to create predictable pattern
      const randomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5];
      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => randomValues[callCount++ % randomValues.length]);

      // When
      const result = generateId();

      // Then
      expect(hasValidUUIDStructure(result)).toBe(true);
      expect(hasValidUUIDVersion(result)).toBe(true); // Version should be 4
      expect(hasValidUUIDVariant(result)).toBe(true); // Variant should be valid
    });

    it('should generate different IDs on multiple calls in fallback mode', () => {
      // Given
      const ids = new Set<string>();
      const numberOfIds = 10;

      // When
      for (let i = 0; i < numberOfIds; i++) {
        ids.add(generateId());
      }

      // Then
      expect(ids.size).toBe(numberOfIds); // All IDs should be unique
      ids.forEach(id => {
        expect(hasValidUUIDStructure(id)).toBe(true);
      });
    });
  });

  describe('UUID format validation', () => {
    it('should always return string with correct UUID structure regardless of method', () => {
      // Given: Test both crypto and fallback paths
      const cryptoId = generateId();
      
      vi.stubGlobal('crypto', undefined);
      const fallbackId = generateId();

      // When & Then
      expect(typeof cryptoId).toBe('string');
      expect(typeof fallbackId).toBe('string');
      expect(hasValidUUIDStructure(cryptoId)).toBe(true);
      expect(hasValidUUIDStructure(fallbackId)).toBe(true);
    });

    it('should always include hyphens in correct positions', () => {
      // Given
      vi.stubGlobal('crypto', undefined);

      // When
      const result = generateId();

      // Then
      expect(result.charAt(8)).toBe('-');
      expect(result.charAt(13)).toBe('-');
      expect(result.charAt(18)).toBe('-');
      expect(result.charAt(23)).toBe('-');
      expect(result.length).toBe(36);
    });
  });

  describe('uniqueness validation', () => {
    it('should generate unique IDs across multiple calls with crypto', () => {
      // Given
      const realUUIDs = [
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
      ];
      let callCount = 0;
      const mockRandomUUID = vi.fn().mockImplementation(() => realUUIDs[callCount++]);
      vi.stubGlobal('crypto', { randomUUID: mockRandomUUID });

      // When
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      // Then
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
      expect(mockRandomUUID).toHaveBeenCalledTimes(3);
    });

    it('should generate unique IDs in fallback mode with high probability', () => {
      // Given
      vi.stubGlobal('crypto', undefined);
      const ids = new Set<string>();
      const numberOfIds = 100;

      // When
      for (let i = 0; i < numberOfIds; i++) {
        ids.add(generateId());
      }

      // Then
      expect(ids.size).toBe(numberOfIds); // Statistical uniqueness
    });
  });

  describe('error handling', () => {
    it('should handle crypto.randomUUID throwing error gracefully', () => {
      // Given
      const mockRandomUUID = vi.fn().mockImplementation(() => {
        throw new Error('Crypto error');
      });
      vi.stubGlobal('crypto', { randomUUID: mockRandomUUID });

      // When & Then
      expect(() => generateId()).toThrow('Crypto error');
    });

    it('should not throw when Math.random is available in fallback', () => {
      // Given
      vi.stubGlobal('crypto', undefined);
      vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

      // When & Then
      expect(() => generateId()).not.toThrow();
      
      const result = generateId();
      expect(result).toBeDefined();
      expect(hasValidUUIDStructure(result)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle Math.random returning 0', () => {
      // Given
      vi.stubGlobal('crypto', undefined);
      vi.spyOn(Math, 'random').mockReturnValue(0);

      // When
      const result = generateId();

      // Then
      expect(hasValidUUIDStructure(result)).toBe(true);
      expect(isValidUUIDFormat(result)).toBe(true);
    });

    it('should handle Math.random returning values close to 1', () => {
      // Given
      vi.stubGlobal('crypto', undefined);
      vi.spyOn(Math, 'random').mockReturnValue(0.9999999);

      // When
      const result = generateId();

      // Then
      expect(hasValidUUIDStructure(result)).toBe(true);
      expect(hasValidUUIDVersion(result)).toBe(true);
    });
  });
});