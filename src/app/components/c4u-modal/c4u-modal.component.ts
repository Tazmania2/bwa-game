import { Component, Input, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'c4u-modal',
  templateUrl: './c4u-modal.component.html',
  styleUrls: ['./c4u-modal.component.scss'],
})
export class C4uModalComponent implements OnInit, OnDestroy {
  @Input()
  modalTitle: string = '';

  @Input()
  icon = '';

  modalId: string = '';
  private focusableElements: HTMLElement[] = [];
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor(
    private modal: NgbActiveModal,
    private elementRef: ElementRef
  ) {
    // Generate unique modal ID
    this.modalId = 'modal-' + Math.random().toString(36).substr(2, 9);
  }

  ngOnInit(): void {
    this.setupAccessibility();
  }

  ngOnDestroy(): void {
    this.restoreFocus();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  close() {
    this.modal.close();
  }

  private setupAccessibility(): void {
    // Store the previously focused element
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // Set up focus management
    setTimeout(() => {
      this.setupFocusTrap();
      this.focusFirstElement();
    }, 100);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  private setupFocusTrap(): void {
    const modal = this.elementRef.nativeElement.querySelector('[role="dialog"]');
    if (modal) {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ');
      
      this.focusableElements = Array.from(
        modal.querySelectorAll(focusableSelectors)
      ) as HTMLElement[];
    }
  }

  private focusFirstElement(): void {
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: moving forwards
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private restoreFocus(): void {
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Restore focus to previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }
}
