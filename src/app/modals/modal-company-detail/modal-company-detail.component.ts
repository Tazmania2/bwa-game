import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { C4uModalComponent } from '@components/c4u-modal/c4u-modal.component';
import { Company, CompanyDetails, Process, Task } from '@model/gamification-dashboard.model';
import { TabBarItemModel } from '@components/c4u-tabbar/c4u-tabbar.component';
import { CompanyService } from '@services/company.service';

@Component({
  selector: 'modal-company-detail',
  templateUrl: './modal-company-detail.component.html',
  styleUrls: ['./modal-company-detail.component.scss']
})
export class ModalCompanyDetailComponent implements OnInit {
  @ViewChild(C4uModalComponent)
  private modal: C4uModalComponent | null = null;

  @Input()
  company: Company | undefined;

  companyDetails: CompanyDetails | undefined;
  selectedTab: number = 0;
  isLoading: boolean = false;

  tabs: TabBarItemModel[] = [
    { name: 'Macros incompletas', icon: '' },
    { name: 'Atividades finalizadas', icon: '' },
    { name: 'Macros finalizadas', icon: '' }
  ];

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    if (this.company) {
      this.loadCompanyDetails();
    }
  }

  loadCompanyDetails(): void {
    if (!this.company) return;

    this.isLoading = true;
    this.companyService.getCompanyDetails(this.company.id).subscribe({
      next: (details) => {
        this.companyDetails = details;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading company details:', error);
        this.isLoading = false;
      }
    });
  }

  selectTab(tabIndex: number): void {
    this.selectedTab = tabIndex;
  }

  get currentTabProcesses(): Process[] {
    if (!this.companyDetails) return [];

    switch (this.selectedTab) {
      case 0: // Macros incompletas
        return this.companyDetails.processes.filter(
          p => p.status === 'pending' || p.status === 'in-progress'
        );
      case 1: // Atividades finalizadas
        // For activities, we'll show completed processes with their completed tasks
        return this.companyDetails.processes.filter(
          p => p.tasks.some(t => t.status === 'completed')
        ).map(p => ({
          ...p,
          tasks: p.tasks.filter(t => t.status === 'completed')
        }));
      case 2: // Macros finalizadas
        return this.companyDetails.processes.filter(
          p => p.status === 'completed'
        );
      default:
        return [];
    }
  }

  close(): void {
    if (this.modal) {
      this.modal.close();
    }
  }
}
