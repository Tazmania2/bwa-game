import { NumberFormatPipe } from './number-format.pipe';
import * as fc from 'fast-check';

describe('NumberFormatPipe', () => {
  let pipe: NumberFormatPipe;

  beforeEach(() => {
    pipe = new NumberFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Unit Tests', () => {
    it('should format zero correctly', () => {
      expect(pipe.transform(0)).toBe('0');
    });

    it('should format small numbers without separators', () => {
      expect(pipe.transform(123)).toBe('123');
    });

    it('should format thousands with separator', () => {
      expect(pipe.transform(1000)).toBe('1.000');
    });

    it('should format large numbers with multiple separators', () => {
      expect(pipe.transform(1234567)).toBe('1.234.567');
    });

    it('should handle null values', () => {
      expect(pipe.transform(null)).toBe('0');
    });

    it('should handle undefined values', () => {
      expect(pipe.transform(undefined)).toBe('0');
    });

    it('should handle NaN values', () => {
      expect(pipe.transform(NaN)).toBe('0');
    });

    it('should format negative numbers', () => {
      expect(pipe.transform(-1000)).toBe('-1.000');
    });

    it('should format decimal numbers', () => {
      const result = pipe.transform(1234.56);
      // pt-BR locale uses comma for decimals
      expect(result).toBe('1.234,56');
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: gamification-dashboard, Property 10: Point Value Formatting Consistency
     * Validates: Requirements 2.3
     */
    it('should format all numeric values with thousand separators consistently', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999999 }),
          (value) => {
            const formatted = pipe.transform(value);
            const expected = value.toLocaleString('pt-BR');
            expect(formatted).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return a string for valid numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -999999, max: 999999 }),
          (value) => {
            const result = pipe.transform(value);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle all edge cases gracefully', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(NaN),
            fc.integer()
          ),
          (value) => {
            const result = pipe.transform(value as any);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format numbers consistently regardless of magnitude', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
          (value) => {
            const formatted = pipe.transform(value);
            // Should contain only digits, dots (thousand separator), and optionally minus sign
            expect(formatted).toMatch(/^-?[\d.]+$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
