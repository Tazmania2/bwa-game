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
  readonly ITEM_SIZE = 72; // Height of each row in pixels (updated for new design)
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

  /**
   * Format KPI value for display (e.g., 8.0, 9.2, 10.0)
   * Shows the score as a decimal value based on current/target ratio
   */
  formatKPIValue(current: number, target: number): string {
    if (target === 0) return '0.0';
    const score = (current / target) * 10;
    return score.toFixed(1);
  }

  trackByCompanyId(index: number, company: Company): string {
    return company.id;
  }
}
