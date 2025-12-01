import { ComponentFixture, TestBed } from '@angular/core/testing';
import { C4uProcessAccordionComponent } from './c4u-process-accordion.component';
import { C4uAccordionModule } from '../c4u-accordion/c4u-accordion.module';
import { C4uAccordionItemModule } from '../c4u-accordion-item/c4u-accordion-item.module';
import { SharedModule } from '@app/shared.module';
import { Process, Task } from '@model/gamification-dashboard.model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('C4uProcessAccordionComponent', () => {
  let component: C4uProcessAccordionComponent;
  let fixture: ComponentFixture<C4uProcessAccordionComponent>;

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Task 1',
      responsible: 'John Doe',
      status: 'pending'
    },
    {
      id: 'task-2',
      name: 'Task 2',
      responsible: 'Jane Smith',
      status: 'completed'
    }
  ];

  const mockProcesses: Process[] = [
    {
      id: 'process-1',
      name: 'Process 1',
      status: 'in-progress',
      tasks: mockTasks,
      expanded: false
    },
    {
      id: 'process-2',
      name: 'Process 2',
      status: 'completed',
      tasks: [],
      expanded: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [C4uProcessAccordionComponent],
      imports: [
        SharedModule,
        C4uAccordionModule,
        C4uAccordionItemModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(C4uProcessAccordionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Process Expansion Toggle', () => {
    it('should toggle process expansion state when toggleProcess is called', () => {
      const process: Process = {
        id: 'test-1',
        name: 'Test Process',
        status: 'pending',
        tasks: [],
        expanded: false
      };

      component.toggleProcess(process);
      expect(process.expanded).toBe(true);

      component.toggleProcess(process);
      expect(process.expanded).toBe(false);
    });

    it('should expand process when initially collapsed', () => {
      const process = { ...mockProcesses[0], expanded: false };
      
      expect(process.expanded).toBe(false);
      component.toggleProcess(process);
      expect(process.expanded).toBe(true);
    });

    it('should collapse process when initially expanded', () => {
      const process = { ...mockProcesses[0], expanded: true };
      
      expect(process.expanded).toBe(true);
      component.toggleProcess(process);
      expect(process.expanded).toBe(false);
    });
  });

  describe('Multiple Process Expansion', () => {
    it('should allow multiple processes to be expanded simultaneously', () => {
      const processes: Process[] = [
        { ...mockProcesses[0], expanded: false },
        { ...mockProcesses[1], expanded: false }
      ];

      component.toggleProcess(processes[0]);
      component.toggleProcess(processes[1]);

      expect(processes[0].expanded).toBe(true);
      expect(processes[1].expanded).toBe(true);
    });

    it('should not affect other processes when toggling one', () => {
      const processes: Process[] = [
        { ...mockProcesses[0], expanded: true },
        { ...mockProcesses[1], expanded: false }
      ];

      component.toggleProcess(processes[1]);

      expect(processes[0].expanded).toBe(true);
      expect(processes[1].expanded).toBe(true);
    });
  });

  describe('Task Display', () => {
    it('should display tasks when process is expanded', () => {
      component.processes = [{ ...mockProcesses[0], expanded: true }];
      fixture.detectChanges();

      const taskElements = fixture.debugElement.queryAll(By.css('.task-item'));
      expect(taskElements.length).toBe(mockTasks.length);
    });

    it('should hide tasks when process is collapsed', () => {
      component.processes = [{ ...mockProcesses[0], expanded: false }];
      fixture.detectChanges();

      const taskElements = fixture.debugElement.queryAll(By.css('.task-item'));
      expect(taskElements.length).toBe(0);
    });

    it('should display task name and responsible person', () => {
      component.processes = [{ ...mockProcesses[0], expanded: true }];
      fixture.detectChanges();

      const taskNameElement = fixture.debugElement.query(By.css('.task-name'));
      const taskResponsibleElement = fixture.debugElement.query(By.css('.task-responsible'));

      expect(taskNameElement.nativeElement.textContent).toContain('Task 1');
      expect(taskResponsibleElement.nativeElement.textContent).toContain('John Doe');
    });

    it('should display task status', () => {
      component.processes = [{ ...mockProcesses[0], expanded: true }];
      fixture.detectChanges();

      const taskStatusElements = fixture.debugElement.queryAll(By.css('.task-status'));
      expect(taskStatusElements.length).toBeGreaterThan(0);
      expect(taskStatusElements[0].nativeElement.textContent).toContain('Pendente');
    });

    it('should show "no tasks" message when process has no tasks', () => {
      component.processes = [{ ...mockProcesses[1], expanded: true }];
      fixture.detectChanges();

      const noTasksElement = fixture.debugElement.query(By.css('.no-tasks'));
      expect(noTasksElement).toBeTruthy();
      expect(noTasksElement.nativeElement.textContent).toContain('Nenhuma tarefa disponível');
    });
  });

  describe('Status Styling', () => {
    it('should return correct CSS class for pending status', () => {
      expect(component.getStatusClass('pending')).toBe('status-pending');
    });

    it('should return correct CSS class for in-progress status', () => {
      expect(component.getStatusClass('in-progress')).toBe('status-in-progress');
    });

    it('should return correct CSS class for completed status', () => {
      expect(component.getStatusClass('completed')).toBe('status-completed');
    });

    it('should return correct CSS class for blocked status', () => {
      expect(component.getStatusClass('blocked')).toBe('status-blocked');
    });

    it('should return empty string for unknown status', () => {
      expect(component.getStatusClass('unknown')).toBe('');
    });
  });

  describe('Status Labels', () => {
    it('should return correct label for pending status', () => {
      expect(component.getStatusLabel('pending')).toBe('Pendente');
    });

    it('should return correct label for in-progress status', () => {
      expect(component.getStatusLabel('in-progress')).toBe('Em Progresso');
    });

    it('should return correct label for completed status', () => {
      expect(component.getStatusLabel('completed')).toBe('Concluído');
    });

    it('should return correct label for blocked status', () => {
      expect(component.getStatusLabel('blocked')).toBe('Bloqueado');
    });

    it('should return original status for unknown status', () => {
      expect(component.getStatusLabel('unknown')).toBe('unknown');
    });
  });

  describe('Component Rendering', () => {
    it('should render all processes', () => {
      component.processes = mockProcesses;
      fixture.detectChanges();

      const accordionItems = fixture.debugElement.queryAll(By.css('c4u-accordion-item'));
      expect(accordionItems.length).toBe(mockProcesses.length);
    });

    it('should display process names', () => {
      component.processes = mockProcesses;
      fixture.detectChanges();

      const accordionItems = fixture.debugElement.queryAll(By.css('c4u-accordion-item'));
      expect(accordionItems.length).toBe(mockProcesses.length);
      
      // Verify the itemTitle is passed correctly
      const firstItem = accordionItems[0].componentInstance;
      expect(firstItem.itemTitle).toBe(mockProcesses[0].name);
    });

    it('should display process status badges', () => {
      component.processes = [{ ...mockProcesses[0], expanded: true }];
      fixture.detectChanges();

      const statusBadges = fixture.debugElement.queryAll(By.css('.process-status'));
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });
});
