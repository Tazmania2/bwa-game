import { Injectable, ComponentRef, ViewContainerRef, Injector, createComponent } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalLazyLoaderService {
  private loadedModals = new Map<string, ComponentRef<any>>();

  constructor(private injector: Injector) {}

  /**
   * Lazy load and display the company detail modal
   */
  async loadCompanyDetailModal(
    viewContainer: ViewContainerRef,
    company: any
  ): Promise<ComponentRef<any>> {
    const modalKey = `company-detail-${company.id}`;

    // Check if modal is already loaded
    if (this.loadedModals.has(modalKey)) {
      const existingModal = this.loadedModals.get(modalKey)!;
      existingModal.instance.company = company;
      existingModal.instance.isVisible = true;
      return existingModal;
    }

    // Lazy load the modal component
    const { ModalCompanyDetailComponent } = await import('../modals/modal-company-detail/modal-company-detail.component');

    // Create component dynamically
    const componentRef = viewContainer.createComponent(ModalCompanyDetailComponent);
    componentRef.instance.company = company;
    componentRef.instance.isVisible = true;

    // Store reference for reuse
    this.loadedModals.set(modalKey, componentRef);

    // Clean up when modal is closed
    componentRef.instance.close.subscribe(() => {
      componentRef.instance.isVisible = false;
      // Optionally destroy after animation
      setTimeout(() => {
        this.destroyModal(modalKey);
      }, 300);
    });

    return componentRef;
  }

  /**
   * Destroy a specific modal
   */
  destroyModal(modalKey: string): void {
    const modal = this.loadedModals.get(modalKey);
    if (modal) {
      modal.destroy();
      this.loadedModals.delete(modalKey);
    }
  }

  /**
   * Destroy all loaded modals
   */
  destroyAllModals(): void {
    this.loadedModals.forEach(modal => modal.destroy());
    this.loadedModals.clear();
  }
}
