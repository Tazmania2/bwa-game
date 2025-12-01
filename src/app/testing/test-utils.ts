/**
 * Test Utilities
 * Common utilities for testing across the application
 */

import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Query helper to find elements in component fixture
 */
export class QueryHelper {
  static findByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
    return fixture.debugElement.query(By.css(selector));
  }

  static findAllByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(selector));
  }

  static findByDirective<T, D>(fixture: ComponentFixture<T>, directive: any): DebugElement {
    return fixture.debugElement.query(By.directive(directive));
  }

  static findAllByDirective<T, D>(fixture: ComponentFixture<T>, directive: any): DebugElement[] {
    return fixture.debugElement.queryAll(By.directive(directive));
  }
}

/**
 * Click helper for testing button clicks
 */
export function click(element: DebugElement | HTMLElement): void {
  if (element instanceof DebugElement) {
    element.nativeElement.click();
  } else {
    element.click();
  }
}

/**
 * Set input value helper
 */
export function setInputValue(element: DebugElement | HTMLElement, value: string): void {
  const inputElement = element instanceof DebugElement ? element.nativeElement : element;
  inputElement.value = value;
  inputElement.dispatchEvent(new Event('input'));
  inputElement.dispatchEvent(new Event('blur'));
}

/**
 * Trigger change detection and wait for async operations
 */
export async function detectChangesAsync<T>(fixture: ComponentFixture<T>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

/**
 * Create a spy object with methods
 */
export function createSpyObj<T>(baseName: string, methodNames: string[]): jasmine.SpyObj<T> {
  return jasmine.createSpyObj<T>(baseName, methodNames as any);
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

/**
 * Create a mock localStorage instance
 */
export function createMockLocalStorage(): Storage {
  return new MockLocalStorage() as Storage;
}
