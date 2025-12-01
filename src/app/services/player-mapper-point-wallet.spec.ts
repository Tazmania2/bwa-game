import { TestBed } from '@angular/core/testing';
import { PlayerMapper } from './player-mapper.service';
import * as fc from 'fast-check';

describe('PlayerMapper - Point Wallet', () => {
  let mapper: PlayerMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    mapper = TestBed.inject(PlayerMapper);
  });

  /**
   * Feature: gamification-dashboard, Property 2: Point Wallet Data Integrity
   * Validates: Requirements 2.1, 2.2
   */
  describe('Property 2: Point Wallet Data Integrity', () => {
    it('should preserve total points when mapping from object structure', () => {
      fc.assert(
        fc.property(
          fc.record({
            point_categories: fc.record({
              bloqueados: fc.integer({ min: 0, max: 100000 }),
              desbloqueados: fc.integer({ min: 0, max: 100000 }),
              moedas: fc.integer({ min: 0, max: 100000 })
            })
          }),
          (apiResponse) => {
            const pointWallet = mapper.toPointWallet(apiResponse);
            
            // The sum of displayed categories should equal the sum from API
            const apiTotal = apiResponse.point_categories.bloqueados + 
                           apiResponse.point_categories.desbloqueados + 
                           apiResponse.point_categories.moedas;
            
            const mappedTotal = pointWallet.bloqueados + 
                              pointWallet.desbloqueados + 
                              pointWallet.moedas;
            
            expect(mappedTotal).toBe(apiTotal);
            expect(pointWallet.bloqueados).toBe(apiResponse.point_categories.bloqueados);
            expect(pointWallet.desbloqueados).toBe(apiResponse.point_categories.desbloqueados);
            expect(pointWallet.moedas).toBe(apiResponse.point_categories.moedas);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve total points when mapping from array structure', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 0, max: 100000 }), // bloqueados value
            fc.integer({ min: 0, max: 100000 }), // desbloqueados value
            fc.integer({ min: 0, max: 100000 })  // moedas value
          ),
          ([bloqueadosVal, desbloqueadosVal, moedasVal]) => {
            // Create array with exactly one of each category
            const apiResponse = {
              point_categories: [
                { category: 'bloqueados', value: bloqueadosVal },
                { category: 'desbloqueados', value: desbloqueadosVal },
                { category: 'moedas', value: moedasVal }
              ]
            };
            
            const pointWallet = mapper.toPointWallet(apiResponse);
            
            // Calculate expected totals from array
            const apiTotal = bloqueadosVal + desbloqueadosVal + moedasVal;
            const mappedTotal = pointWallet.bloqueados + pointWallet.desbloqueados + pointWallet.moedas;
            
            expect(mappedTotal).toBe(apiTotal);
            expect(pointWallet.bloqueados).toBe(bloqueadosVal);
            expect(pointWallet.desbloqueados).toBe(desbloqueadosVal);
            expect(pointWallet.moedas).toBe(moedasVal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle capitalized category names', () => {
      fc.assert(
        fc.property(
          fc.record({
            point_categories: fc.record({
              Bloqueados: fc.integer({ min: 0, max: 100000 }),
              Desbloqueados: fc.integer({ min: 0, max: 100000 }),
              Moedas: fc.integer({ min: 0, max: 100000 })
            })
          }),
          (apiResponse) => {
            const pointWallet = mapper.toPointWallet(apiResponse);
            
            // Should handle capitalized names
            const apiTotal = apiResponse.point_categories.Bloqueados + 
                           apiResponse.point_categories.Desbloqueados + 
                           apiResponse.point_categories.Moedas;
            
            const mappedTotal = pointWallet.bloqueados + 
                              pointWallet.desbloqueados + 
                              pointWallet.moedas;
            
            expect(mappedTotal).toBe(apiTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero totals for empty or missing point categories', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            {},
            { point_categories: {} },
            { point_categories: [] }
          ),
          (apiResponse) => {
            const pointWallet = mapper.toPointWallet(apiResponse);
            
            // All values should be zero
            expect(pointWallet.bloqueados).toBe(0);
            expect(pointWallet.desbloqueados).toBe(0);
            expect(pointWallet.moedas).toBe(0);
            
            const total = pointWallet.bloqueados + pointWallet.desbloqueados + pointWallet.moedas;
            expect(total).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should map point wallet from object structure', () => {
      const apiResponse = {
        point_categories: {
          bloqueados: 1000,
          desbloqueados: 2000,
          moedas: 500
        }
      };

      const result = mapper.toPointWallet(apiResponse);

      expect(result.bloqueados).toBe(1000);
      expect(result.desbloqueados).toBe(2000);
      expect(result.moedas).toBe(500);
    });

    it('should map point wallet from array structure', () => {
      const apiResponse = {
        point_categories: [
          { category: 'bloqueados', value: 1500 },
          { category: 'desbloqueados', value: 2500 },
          { category: 'moedas', value: 750 }
        ]
      };

      const result = mapper.toPointWallet(apiResponse);

      expect(result.bloqueados).toBe(1500);
      expect(result.desbloqueados).toBe(2500);
      expect(result.moedas).toBe(750);
    });

    it('should handle array with shortName property', () => {
      const apiResponse = {
        point_categories: [
          { shortName: 'bloqueados', value: 100 },
          { shortName: 'desbloqueados', value: 200 },
          { shortName: 'moedas', value: 50 }
        ]
      };

      const result = mapper.toPointWallet(apiResponse);

      expect(result.bloqueados).toBe(100);
      expect(result.desbloqueados).toBe(200);
      expect(result.moedas).toBe(50);
    });

    it('should return zeros for missing categories', () => {
      const apiResponse = {};

      const result = mapper.toPointWallet(apiResponse);

      expect(result.bloqueados).toBe(0);
      expect(result.desbloqueados).toBe(0);
      expect(result.moedas).toBe(0);
    });
  });
});
