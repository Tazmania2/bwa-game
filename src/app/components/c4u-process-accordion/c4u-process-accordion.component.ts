import { Component, Input } from '@angular/core';
import { Process } from '@model/gamification-dashboard.model';

@Component({
  selector: 'c4u-process-accordion',
  templateUrl: './c4u-process-accordion.component.html',
  styleUrls: ['./c4u-process-accordion.component.scss']
})
export class C4uProcessAccordionComponent {
  @Input()
  processes: Process[] = [];

  /**
   * Toggle process expansion by index
   */
  toggleProcess(index: number): void {
    if (this.processes[index]) {
      this.processes[index].expanded = !this.processes[index].expanded;
    }
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed',
      'blocked': 'status-blocked'
    };
    return statusMap.hasOwnProperty(status) ? statusMap[status] : '';
  }

  getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'in-progress': 'Em Progresso',
      'completed': 'Concluído',
      'blocked': 'Bloqueado'
    };
    return labelMap.hasOwnProperty(status) ? labelMap[status] : status;
  }
}
