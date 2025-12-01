import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Utility functions for accessibility testing
 */
export class AccessibilityTestUtils {
  /**
   * Check if element has proper ARIA label
   */
  static hasAriaLabel(element: DebugElement): boolean {
    const nativeElement = element.nativeElement;
    return !!(nativeElement.getAttribute('aria-label') || 
             nativeElement.getAttribute('aria-labelledby') ||
             nativeElement.getAttribute('aria-describedby'));
  }

  /**
   * Check if interactive element is keyboard accessible
   */
  static isKeyboardAccessible(element: DebugElement): boolean {
    const nativeElement = element.nativeElement;
    const tagName = nativeElement.tagName.toLowerCase();
    
    // Naturally focusable elements
    const naturallyFocusable = ['button', 'input', 'select', 'textarea', 'a'];
    if (naturallyFocusable.includes(tagName)) {
      return !nativeElement.disabled && nativeElement.tabIndex !== -1;
    }
    
    // Elements with tabindex
    return nativeElement.tabIndex >= 0;
  }

  /**
   * Get all interactive elements in a component
   */
  static getInteractiveElements(fixture: ComponentFixture<any>): DebugElement[] {
    const selectors = [
      'button',
      'input',
      'select', 
      'textarea',
      'a[href]',
      '[tabindex]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]'
    ];
    
    return selectors.flatMap(selector => 
      fixture.debugElement.queryAll(By.css(selector))
    );
  }

  /**
   * Check color contrast ratio (simplified check)
   */
  static hasGoodContrast(element: DebugElement): boolean {
    const computedStyle = window.getComputedStyle(element.nativeElement);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    
    // This is a simplified check - in real scenarios you'd use a proper contrast calculator
    return color !== backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)';
  }

  /**
   * Check if images have alt text
   */
  static imagesHaveAltText(fixture: ComponentFixture<any>): boolean {
    const images = fixture.debugElement.queryAll(By.css('img'));
    return images.every(img => {
      const alt = img.nativeElement.getAttribute('alt');
      return alt !== null && alt !== undefined;
    });
  }

  /**
   * Simulate keyboard navigation
   */
  static simulateKeyPress(element: DebugElement, key: string): void {
    const event = new KeyboardEvent('keydown', { key });
    element.nativeElement.dispatchEvent(event);
  }

  /**
   * Check if element has proper role
   */
  static hasProperRole(element: DebugElement, expectedRole?: string): boolean {
    const role = element.nativeElement.getAttribute('role');
    if (expectedRole) {
      return role === expectedRole;
    }
    return role !== null;
  }

  /**
   * Check if modal has proper focus management
   */
  static checkModalFocusManagement(fixture: ComponentFixture<any>): {
    hasFocusTrap: boolean;
    hasInitialFocus: boolean;
    hasCloseButton: boolean;
  } {
    const modal = fixture.debugElement.query(By.css('[role="dialog"]'));
    if (!modal) {
      return { hasFocusTrap: false, hasInitialFocus: false, hasCloseButton: false };
    }

    const focusableElements = AccessibilityTestUtils.getInteractiveElements(fixture);
    const closeButton = fixture.debugElement.query(By.css('[aria-label*="close"], [aria-label*="Close"], [aria-label*="Fechar"]'));
    
    return {
      hasFocusTrap: focusableElements.length > 0,
      hasInitialFocus: document.activeElement !== null,
      hasCloseButton: !!closeButton
    };
  }
}
