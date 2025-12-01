import { DateFormatPipe } from './date-format.pipe';
import * as fc from 'fast-check';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Unit Tests', () => {
    describe('Short format (DD/MM/YY)', () => {
      it('should format date in short format', () => {
        const date = new Date(2023, 3, 11); // April 11, 2023
        expect(pipe.transform(date, 'short')).toBe('11/04/23');
      });

      it('should pad single digit days and months', () => {
        const date = new Date(2023, 0, 5); // January 5, 2023
        expect(pipe.transform(date, 'short')).toBe('05/01/23');
      });
    });

    describe('Medium format (DD/MM/YYYY)', () => {
      it('should format date in medium format', () => {
        const date = new Date(2023, 3, 11); // April 11, 2023
        expect(pipe.transform(date, 'medium')).toBe('11/04/2023');
      });
    });

    describe('Long format (DD de MMM de YYYY)', () => {
      it('should format date in long format', () => {
        const date = new Date(2023, 3, 11); // April 11, 2023
        expect(pipe.transform(date, 'long')).toBe('11 de abril de 2023');
      });
    });

    describe('Month/Year format (MMM/YY)', () => {
      it('should format date in monthYear format', () => {
        const date = new Date(2023, 4, 15); // May 15, 2023
        expect(pipe.transform(date, 'monthYear')).toBe('MAI/23');
      });

      it('should format all months correctly', () => {
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        months.forEach((month, index) => {
          const date = new Date(2023, index, 1);
          expect(pipe.transform(date, 'monthYear')).toBe(`${month}/23`);
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle null values', () => {
        expect(pipe.transform(null)).toBe('');
      });

      it('should handle undefined values', () => {
        expect(pipe.transform(undefined)).toBe('');
      });

      it('should handle invalid date strings', () => {
        expect(pipe.transform('invalid')).toBe('');
      });

      it('should handle string dates', () => {
        // Using ISO string to avoid timezone issues
        const date = new Date('2023-04-11T00:00:00');
        const result = pipe.transform(date, 'short');
        expect(result).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
      });

      it('should handle timestamp numbers', () => {
        const timestamp = new Date(2023, 3, 11).getTime();
        expect(pipe.transform(timestamp, 'short')).toBe('11/04/23');
      });
    });

    describe('Date range formatting', () => {
      it('should format date range correctly', () => {
        const startDate = new Date(2023, 3, 1); // April 1, 2023
        const endDate = new Date(2023, 8, 30); // September 30, 2023
        expect(DateFormatPipe.formatDateRange(startDate, endDate)).toBe('1/4/23 a 30/9/23');
      });

      it('should not pad single digits in date range', () => {
        const startDate = new Date(2023, 0, 5); // January 5, 2023
        const endDate = new Date(2023, 11, 9); // December 9, 2023
        expect(DateFormatPipe.formatDateRange(startDate, endDate)).toBe('5/1/23 a 9/12/23');
      });
    });
  });

  describe('Property-Based Tests', () => {
    it('should always return a string for valid dates', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(2000, 0, 1), max: new Date(2050, 11, 31) }),
          fc.constantFrom('short', 'medium', 'long', 'monthYear'),
          (date, format) => {
            const result = pipe.transform(date, format as any);
            expect(typeof result).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format short dates consistently', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(2000, 0, 1), max: new Date(2050, 11, 31) }),
          (date) => {
            // Skip invalid dates
            if (isNaN(date.getTime())) {
              return true;
            }
            const result = pipe.transform(date, 'short');
            // Should match DD/MM/YY pattern
            expect(result).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format medium dates consistently', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(2000, 0, 1), max: new Date(2050, 11, 31) }),
          (date) => {
            const result = pipe.transform(date, 'medium');
            // Should match DD/MM/YYYY pattern
            expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format monthYear consistently', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(2000, 0, 1), max: new Date(2050, 11, 31) }),
          (date) => {
            const result = pipe.transform(date, 'monthYear');
            // Should match MMM/YY pattern
            expect(result).toMatch(/^[A-Z]{3}\/\d{2}$/);
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
            fc.constant('invalid'),
            fc.date()
          ),
          (value) => {
            const result = pipe.transform(value as any);
            expect(typeof result).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format date ranges consistently', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(2000, 0, 1), max: new Date(2050, 11, 31) }),
          fc.date({ min: new Date(2000, 0, 1), max: new Date(2050, 11, 31) }),
          (date1, date2) => {
            // Skip invalid dates
            if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
              return true;
            }
            const startDate = date1 < date2 ? date1 : date2;
            const endDate = date1 < date2 ? date2 : date1;
            const result = DateFormatPipe.formatDateRange(startDate, endDate);
            // Should match D/M/YY a D/M/YY pattern
            expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{2} a \d{1,2}\/\d{1,2}\/\d{2}$/);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
