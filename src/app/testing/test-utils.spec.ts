/**
 * Test for testing utilities
 */

import { QueryHelper, click, setInputValue, createMockLocalStorage } from './test-utils';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <div class="test-container">
      <button class="test-button">Click Me</button>
      <input class="test-input" type="text" />
    </div>
  `
})
class TestComponent {}

describe('Test Utilities', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('QueryHelper', () => {
    it('should find element by CSS selector', () => {
      const element = QueryHelper.findByCss(fixture, '.test-button');
      expect(element).toBeTruthy();
      expect(element.nativeElement.textContent).toContain('Click Me');
    });

    it('should find all elements by CSS selector', () => {
      const elements = QueryHelper.findAllByCss(fixture, 'button');
      expect(elements.length).toBe(1);
    });
  });

  describe('click helper', () => {
    it('should trigger click on DebugElement', () => {
      const button = QueryHelper.findByCss(fixture, '.test-button');
      spyOn(button.nativeElement, 'click');
      click(button);
      expect(button.nativeElement.click).toHaveBeenCalled();
    });

    it('should trigger click on HTMLElement', () => {
      const button = QueryHelper.findByCss(fixture, '.test-button').nativeElement;
      spyOn(button, 'click');
      click(button);
      expect(button.click).toHaveBeenCalled();
    });
  });

  describe('setInputValue helper', () => {
    it('should set input value', () => {
      const input = QueryHelper.findByCss(fixture, '.test-input');
      setInputValue(input, 'test value');
      expect(input.nativeElement.value).toBe('test value');
    });
  });

  describe('MockLocalStorage', () => {
    it('should store and retrieve items', () => {
      const storage = createMockLocalStorage();
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
    });

    it('should remove items', () => {
      const storage = createMockLocalStorage();
      storage.setItem('key', 'value');
      storage.removeItem('key');
      expect(storage.getItem('key')).toBeNull();
    });

    it('should clear all items', () => {
      const storage = createMockLocalStorage();
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.length).toBe(0);
    });
  });
});
