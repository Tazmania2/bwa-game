/**
 * Test Fixtures
 * Common test setup and configuration for Angular components and services
 */

import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

/**
 * Base test module configuration
 */
export const BASE_TEST_CONFIG: TestModuleMetadata = {
  imports: [
    HttpClientTestingModule,
    RouterTestingModule,
    BrowserAnimationsModule
  ]
};

/**
 * Configure test bed with common imports
 */
export function configureTestBed(config: TestModuleMetadata = {}): void {
  TestBed.configureTestingModule({
    ...BASE_TEST_CONFIG,
    ...config,
    imports: [
      ...(BASE_TEST_CONFIG.imports || []),
      ...(config.imports || [])
    ],
    declarations: [
      ...(config.declarations || [])
    ],
    providers: [
      ...(config.providers || [])
    ]
  });
}

/**
 * Mock Observable helpers
 */
export const MockObservables = {
  /**
   * Create a successful observable response
   */
  success<T>(data: T) {
    return of(data);
  },

  /**
   * Create an error observable
   */
  error(error: any) {
    return throwError(() => error);
  },

  /**
   * Create a delayed observable
   */
  delayed<T>(data: T, delay: number = 100) {
    return new Promise<T>(resolve => {
      setTimeout(() => resolve(data), delay);
    });
  }
};

/**
 * Mock HTTP Error Response
 */
export function createMockHttpError(status: number, message: string) {
  return {
    status,
    statusText: message,
    error: { message },
    message: `Http failure response: ${status} ${message}`
  };
}

/**
 * Common test scenarios
 */
export const TestScenarios = {
  /**
   * Network error scenario
   */
  networkError: createMockHttpError(0, 'Network Error'),

  /**
   * Unauthorized error scenario
   */
  unauthorizedError: createMockHttpError(401, 'Unauthorized'),

  /**
   * Forbidden error scenario
   */
  forbiddenError: createMockHttpError(403, 'Forbidden'),

  /**
   * Not found error scenario
   */
  notFoundError: createMockHttpError(404, 'Not Found'),

  /**
   * Server error scenario
   */
  serverError: createMockHttpError(500, 'Internal Server Error')
};

/**
 * Spy helper for services
 */
export function createServiceSpy<T>(
  serviceName: string,
  methods: string[]
): jasmine.SpyObj<T> {
  return jasmine.createSpyObj(serviceName, methods) as jasmine.SpyObj<T>;
}

/**
 * Wait for async operations in tests
 */
export async function flushMicrotasks(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Trigger component lifecycle hooks
 */
export function triggerLifecycleHooks(component: any): void {
  if (component.ngOnInit) {
    component.ngOnInit();
  }
  if (component.ngAfterViewInit) {
    component.ngAfterViewInit();
  }
}

/**
 * Mock localStorage for testing
 */
export function setupMockLocalStorage(): void {
  let store: { [key: string]: string } = {};

  const mockLocalStorage = {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };

  spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
  spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
  spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
  spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
}

/**
 * Mock Date for consistent testing
 */
export function mockDate(date: Date): void {
  jasmine.clock().install();
  jasmine.clock().mockDate(date);
}

/**
 * Restore real Date
 */
export function restoreDate(): void {
  jasmine.clock().uninstall();
}

/**
 * Property-based testing helpers using fast-check
 * Note: Import fc directly in your test files for better type safety
 */
export const PropertyTestHelpers = {
  /**
   * Common arbitraries for property testing
   * These are helper functions that return the appropriate fc arbitraries
   */
  arbitraries: {
    /**
     * Generate positive integers
     */
    positiveInt: (fc: any) => {
      return fc.integer({ min: 0, max: 10000 });
    },

    /**
     * Generate percentages (0-100)
     */
    percentage: (fc: any) => {
      return fc.integer({ min: 0, max: 100 });
    },

    /**
     * Generate dates within a range
     */
    dateRange: (fc: any, start: Date, end: Date) => {
      return fc.date({ min: start, max: end });
    },

    /**
     * Generate non-empty strings
     */
    nonEmptyString: (fc: any) => {
      return fc.string({ minLength: 1, maxLength: 100 });
    },

    /**
     * Generate email addresses
     */
    email: (fc: any) => {
      return fc.emailAddress();
    }
  }
};
