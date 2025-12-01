import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Company } from '@model/gamification-dashboard.model';

@Component({
  selector: 'c4u-company-table',
  templateUrl: './c4u-company-table.component.html',
  styleUrls: ['./c4u-company-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class C4uCompanyTableComponent {
  @Input() companies: Company[] = [];
  @Output() companySelected = new EventEmitter<Company>();

  // Virtual scrolling configuration
  readonly ITEM_SIZE = 60; // Height of each row in pixels
  readonly VIRTUAL_SCROLL_THRESHOLD = 50; // Enable virtual scrolling for more than 50 items

  get useVirtualScrolling(): boolean {
    return this.companies.length > this.VIRTUAL_SCROLL_THRESHOLD;
  }

  onRowClick(company: Company): void {
    this.companySelected.emit(company);
  }

  getHealthColor(healthScore: number): string {
    if (healthScore >= 80) return 'success';
    if (healthScore >= 50) return 'warning';
    return 'danger';
  }

  getKPIPercentage(kpi: { current: number; target: number }): number {
    if (kpi.target === 0) return 0;
    return Math.round((kpi.current / kpi.target) * 100);
  }

  getKPIColor(percentage: number): string {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  }

  trackByCompanyId(index: number, company: Company): string {
    return company.id;
  }
}
