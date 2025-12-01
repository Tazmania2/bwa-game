import { TestBed } from '@angular/core/testing';
import { KPIService } from './kpi.service';
import { FunifierApiService } from './funifier-api.service';
import { KPIMapper } from './kpi-mapper.service';
import * as fc from 'fast-check';
import { of } from 'rxjs';

describe('KPIService', () => {
  let service: KPIService;
  let funifierApiSpy: jasmine.SpyObj<FunifierApiService>;
  let mapperSpy: jasmine.SpyObj<KPIMapper>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('FunifierApiService', ['get']);
    const kpiMapperSpy = jasmine.createSpyObj('KPIMapper', ['toKPIDataArray']);

    TestBed.configureTestingModule({
      providers: [
        KPIService,
        { provide: FunifierApiService, useValue: apiSpy },
        { provide: KPIMapper, useValue: kpiMapperSpy }
      ]
    });

    service = TestBed.inject(KPIService);
    funifierApiSpy = TestBed.inject(FunifierApiService) as jasmine.SpyObj<FunifierApiService>;
    mapperSpy = TestBed.inject(KPIMapper) as jasmine.SpyObj<KPIMapper>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Feature: gamification-dashboard, Property 4: KPI Progress Calculation
   * Validates: Requirements 5.2, 5.3
   */
  describe('Property 4: KPI Progress Calculation', () => {
    it('should calculate KPI percentage correctly for all valid inputs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // current
          fc.integer({ min: 1, max: 10000 }), // target (non-zero)
          (current, target) => {
            const percentage = service.calculateKPIProgress(current, target);
            const expected = Math.round((current / target) * 100);
            
            expect(percentage).toBe(expected);
            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(percentage)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for zero target', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // current
          (current) => {
            const percentage = service.calculateKPIProgress(current, 0);
            expect(percentage).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle current value exceeding target', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }), // target
          fc.integer({ min: 0, max: 5000 }), // excess amount
          (target, excess) => {
            const current = target + excess;
            const percentage = service.calculateKPIProgress(current, target);
            
            expect(percentage).toBeGreaterThanOrEqual(100);
            expect(Number.isInteger(percentage)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should determine color correctly based on percentage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // target
          fc.integer({ min: 0, max: 150 }), // current (can exceed target)
          (target, current) => {
            const color = service.getKPIColor(current, target);
            const percentage = (current / target) * 100;
            
            if (percentage >= 80) {
              expect(color).toBe('green');
            } else if (percentage >= 50) {
              expect(color).toBe('yellow');
            } else {
              expect(color).toBe('red');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistency between calculateKPIProgress and getKPIColor', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // current
          fc.integer({ min: 1, max: 10000 }), // target
          (current, target) => {
            const percentage = service.calculateKPIProgress(current, target);
            const color = service.getKPIColor(current, target);
            
            // Verify color matches percentage thresholds
            if (percentage >= 80) {
              expect(color).toBe('green');
            } else if (percentage >= 50) {
              expect(color).toBe('yellow');
            } else {
              expect(color).toBe('red');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should calculate 50% progress correctly', () => {
      const result = service.calculateKPIProgress(50, 100);
      expect(result).toBe(50);
    });

    it('should calculate 100% progress correctly', () => {
      const result = service.calculateKPIProgress(100, 100);
      expect(result).toBe(100);
    });

    it('should calculate 0% progress correctly', () => {
      const result = service.calculateKPIProgress(0, 100);
      expect(result).toBe(0);
    });

    it('should calculate over 100% progress correctly', () => {
      const result = service.calculateKPIProgress(150, 100);
      expect(result).toBe(150);
    });

    it('should round percentage to nearest integer', () => {
      const result = service.calculateKPIProgress(33, 100);
      expect(result).toBe(33);
    });

    it('should return green color for 80%+ completion', () => {
      expect(service.getKPIColor(80, 100)).toBe('green');
      expect(service.getKPIColor(90, 100)).toBe('green');
      expect(service.getKPIColor(100, 100)).toBe('green');
    });

    it('should return yellow color for 50-79% completion', () => {
      expect(service.getKPIColor(50, 100)).toBe('yellow');
      expect(service.getKPIColor(60, 100)).toBe('yellow');
      expect(service.getKPIColor(79, 100)).toBe('yellow');
    });

    it('should return red color for <50% completion', () => {
      expect(service.getKPIColor(0, 100)).toBe('red');
      expect(service.getKPIColor(25, 100)).toBe('red');
      expect(service.getKPIColor(49, 100)).toBe('red');
    });

    it('should handle zero target by returning red', () => {
      const color = service.getKPIColor(50, 0);
      expect(color).toBe('red');
    });
  });

  describe('API Integration Tests', () => {
    it('should fetch and cache player KPIs', (done) => {
      const mockResponse = [
        { id: '1', label: 'KPI 1', current: 50, target: 100 }
      ];
      const mockMappedData = [
        { id: '1', label: 'KPI 1', current: 50, target: 100 }
      ];

      funifierApiSpy.get.and.returnValue(of(mockResponse));
      mapperSpy.toKPIDataArray.and.returnValue(mockMappedData);

      service.getPlayerKPIs('player123').subscribe(result => {
        expect(result).toEqual(mockMappedData);
        expect(funifierApiSpy.get).toHaveBeenCalledWith('/v3/player/player123/kpis');
        expect(mapperSpy.toKPIDataArray).toHaveBeenCalledWith(mockResponse);
        done();
      });
    });

    it('should use cached data on subsequent calls', (done) => {
      const mockResponse = [
        { id: '1', label: 'KPI 1', current: 50, target: 100 }
      ];
      const mockMappedData = [
        { id: '1', label: 'KPI 1', current: 50, target: 100 }
      ];

      funifierApiSpy.get.and.returnValue(of(mockResponse));
      mapperSpy.toKPIDataArray.and.returnValue(mockMappedData);

      // First call
      service.getPlayerKPIs('player123').subscribe(() => {
        // Second call should use cache
        service.getPlayerKPIs('player123').subscribe(result => {
          expect(result).toEqual(mockMappedData);
          expect(funifierApiSpy.get).toHaveBeenCalledTimes(1); // Only called once
          done();
        });
      });
    });
  });
});
