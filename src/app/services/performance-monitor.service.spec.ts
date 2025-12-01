import { TestBed } from '@angular/core/testing';
import { PerformanceMonitorService } from './performance-monitor.service';

describe('PerformanceMonitorService', () => {
  let service: PerformanceMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformanceMonitorService]
    });
    service = TestBed.inject(PerformanceMonitorService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('measureRenderTime', () => {
    it('should measure component render time', (done) => {
      const componentName = 'TestComponent';
      const endMeasurement = service.measureRenderTime(componentName);

      // Simulate some work
      setTimeout(() => {
        endMeasurement();

        const metrics = service.getMetrics(componentName);
        expect(metrics).toBeDefined();
        expect(metrics!.componentRenderTime).toBeGreaterThan(0);
        done();
      }, 10);
    });

    it('should warn for slow renders', (done) => {
      spyOn(console, 'warn');
      const componentName = 'SlowComponent';
      const endMeasurement = service.measureRenderTime(componentName);

      // Simulate slow render (> 16ms)
      setTimeout(() => {
        endMeasurement();
        expect(console.warn).toHaveBeenCalled();
        done();
      }, 20);
    });

    it('should not warn for fast renders', (done) => {
      spyOn(console, 'warn');
      const componentName = 'FastComponent';
      const endMeasurement = service.measureRenderTime(componentName);

      // Simulate fast render (< 16ms)
      setTimeout(() => {
        endMeasurement();
        expect(console.warn).not.toHaveBeenCalled();
        done();
      }, 5);
    });

    it('should update existing metrics', () => {
      const componentName = 'TestComponent';
      
      const endMeasurement1 = service.measureRenderTime(componentName);
      endMeasurement1();

      const metrics1 = service.getMetrics(componentName);
      const firstRenderTime = metrics1!.componentRenderTime;

      const endMeasurement2 = service.measureRenderTime(componentName);
      endMeasurement2();

      const metrics2 = service.getMetrics(componentName);
      expect(metrics2!.componentRenderTime).not.toBe(firstRenderTime);
    });
  });

  describe('trackChangeDetection', () => {
    it('should track change detection cycles', () => {
      const componentName = 'TestComponent';
      
      service.trackChangeDetection(componentName);
      service.trackChangeDetection(componentName);
      service.trackChangeDetection(componentName);

      const metrics = service.getMetrics(componentName);
      expect(metrics).toBeDefined();
      expect(metrics!.changeDetectionCycles).toBe(3);
    });

    it('should increment global change detection count', () => {
      service.trackChangeDetection('Component1');
      service.trackChangeDetection('Component2');
      service.trackChangeDetection('Component1');

      const metrics1 = service.getMetrics('Component1');
      const metrics2 = service.getMetrics('Component2');

      expect(metrics1!.changeDetectionCycles).toBeGreaterThan(0);
      expect(metrics2!.changeDetectionCycles).toBeGreaterThan(0);
    });
  });

  describe('measureMemoryUsage', () => {
    it('should measure memory usage if available', () => {
      // Mock performance.memory
      const mockMemory = {
        usedJSHeapSize: 50 * 1024 * 1024, // 50 MB
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
      };

      (performance as any).memory = mockMemory;

      const memoryUsage = service.measureMemoryUsage();
      expect(memoryUsage).toBeCloseTo(50, 1);

      delete (performance as any).memory;
    });

    it('should return 0 if memory API is not available', () => {
      delete (performance as any).memory;
      
      const memoryUsage = service.measureMemoryUsage();
      expect(memoryUsage).toBe(0);
    });
  });

  describe('getMetrics', () => {
    it('should return undefined for non-existent component', () => {
      const metrics = service.getMetrics('NonExistentComponent');
      expect(metrics).toBeUndefined();
    });

    it('should return metrics for tracked component', () => {
      const componentName = 'TestComponent';
      service.trackChangeDetection(componentName);

      const metrics = service.getMetrics(componentName);
      expect(metrics).toBeDefined();
      expect(metrics!.changeDetectionCycles).toBeGreaterThan(0);
    });
  });

  describe('getAllMetrics', () => {
    it('should return empty map initially', () => {
      const allMetrics = service.getAllMetrics();
      expect(allMetrics.size).toBe(0);
    });

    it('should return all tracked metrics', () => {
      service.trackChangeDetection('Component1');
      service.trackChangeDetection('Component2');
      service.trackChangeDetection('Component3');

      const allMetrics = service.getAllMetrics();
      expect(allMetrics.size).toBe(3);
      expect(allMetrics.has('Component1')).toBe(true);
      expect(allMetrics.has('Component2')).toBe(true);
      expect(allMetrics.has('Component3')).toBe(true);
    });
  });

  describe('logPerformanceReport', () => {
    it('should log performance report to console', () => {
      spyOn(console, 'group');
      spyOn(console, 'log');
      spyOn(console, 'groupEnd');

      service.trackChangeDetection('TestComponent');
      service.logPerformanceReport();

      expect(console.group).toHaveBeenCalledWith('Performance Report');
      expect(console.log).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should include all component metrics in report', () => {
      spyOn(console, 'log');

      service.trackChangeDetection('Component1');
      service.trackChangeDetection('Component2');
      service.logPerformanceReport();

      const logCalls = (console.log as jasmine.Spy).calls.all();
      const logMessages = logCalls.map(call => call.args.join(' '));
      
      expect(logMessages.some(msg => msg.includes('Component1'))).toBe(true);
      expect(logMessages.some(msg => msg.includes('Component2'))).toBe(true);
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      service.trackChangeDetection('Component1');
      service.trackChangeDetection('Component2');

      expect(service.getAllMetrics().size).toBe(2);

      service.reset();

      expect(service.getAllMetrics().size).toBe(0);
    });

    it('should reset change detection count', () => {
      service.trackChangeDetection('Component1');
      service.trackChangeDetection('Component1');
      service.trackChangeDetection('Component1');

      service.reset();

      service.trackChangeDetection('Component2');
      const metrics = service.getMetrics('Component2');
      
      // After reset, count should start from 1
      expect(metrics!.changeDetectionCycles).toBe(1);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should track metrics efficiently', () => {
      const iterations = 1000;
      
      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        service.trackChangeDetection(`Component${i % 10}`);
      }
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;
      
      // Should average less than 0.1ms per tracking call
      expect(avgTime).toBeLessThan(0.1);
    });

    it('should measure render time with minimal overhead', () => {
      const iterations = 100;
      
      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        const end = service.measureRenderTime(`Component${i}`);
        end();
      }
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;
      
      // Should average less than 1ms per measurement
      expect(avgTime).toBeLessThan(1);
    });
  });
});
