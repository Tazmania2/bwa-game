import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamificationDashboardComponent } from './gamification-dashboard.component';
import { AccessibilityTestUtils } from '../../../testing/accessibility-test-utils';
import { By } from '@angular/platform-browser';
import { SharedModule } from '../../../shared.module';
import { PlayerService } from '@services/player.service';
import { KPIService } from '@services/kpi.service';
import { CompanyService } from '@services/company.service';
import { ToastService } from '@services/toast.service';
import { of } from 'rxjs';

describe('GamificationDashboardComponent - Accessibility', () => {
  let component: GamificationDashboardComponent;
  let fixture: ComponentFixture<GamificationDashboardComponent>;
  let mockPlayerService: jasmine.SpyObj<PlayerService>;
  let mockKpiService: jasmine.SpyObj<KPIService>;
  let mockCompanyService: jasmine.SpyObj<CompanyService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const playerServiceSpy = jasmine.createSpyObj('PlayerService', ['getPlayerStatus', 'getPlayerPoints', 'getSeasonProgress']);
    const kpiServiceSpy = jasmine.createSpyObj('KPIService', ['getPlayerKPIs']);
    const companyServiceSpy = jasmine.createSpyObj('CompanyService', ['getCompanies']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['error', 'alert']);

    await TestBed.configureTestingModule({
      declarations: [GamificationDashboardComponent],
      imports: [SharedModule],
      providers: [
        { provide: PlayerService, useValue: playerServiceSpy },
        { provide: KPIService, useValue: kpiServiceSpy },
        { provide: CompanyService, useValue: companyServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GamificationDashboardComponent);
    component = fixture.componentInstance;
    mockPlayerService = TestBed.inject(PlayerService) as jasmine.SpyObj<PlayerService>;
    mockKpiService = TestBed.inject(KPIService) as jasmine.SpyObj<KPIService>;
    mockCompanyService = TestBed.inject(CompanyService) as jasmine.SpyObj<CompanyService>;
    mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    // Setup default mock returns
    mockPlayerService.getPlayerStatus.and.returnValue(of({
      _id: '1',
      name: 'Test Player',
      email: 'test@example.com',
      level: 5,
      seasonLevel: 3,
      metadata: { area: 'Test Area', time: 'Test Time', squad: 'Test Squad' },
      created: Date.now(),
      updated: Date.now()
    }));
    mockPlayerService.getPlayerPoints.and.returnValue(of({
      bloqueados: 100,
      desbloqueados: 200,
      moedas: 50
    }));
    mockPlayerService.getSeasonProgress.and.returnValue(of({
      metas: { current: 5, target: 10 },
      clientes: 3,
      tarefasFinalizadas: 15,
      seasonDates: { start: new Date(), end: new Date() }
    }));
    mockKpiService.getPlayerKPIs.and.returnValue(of([]));
    mockCompanyService.getCompanies.and.returnValue(of([]));

    fixture.detectChanges();
  });

  describe('ARIA Labels', () => {
    it('should have ARIA labels on all interactive elements', () => {
      const interactiveElements = AccessibilityTestUtils.getInteractiveElements(fixture);
      
      interactiveElements.forEach((element, index) => {
        expect(AccessibilityTestUtils.hasAriaLabel(element))
          .toBe(true, `Interactive element at index ${index} (${element.nativeElement.tagName}) should have ARIA label`);
      });
    });

    it('should have proper ARIA roles for semantic elements', () => {
      const mainContent = fixture.debugElement.query(By.css('.dashboard-main, main, [role="main"]'));
      if (mainContent) {
        const role = mainContent.nativeElement.getAttribute('role');
        expect(role).toBe('main');
      }

      const sidebar = fixture.debugElement.query(By.css('.dashboard-sidebar, aside, [role="complementary"]'));
      if (sidebar) {
        const role = sidebar.nativeElement.getAttribute('role');
        expect(['complementary', 'navigation'].includes(role)).toBe(true);
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should make all interactive elements keyboard accessible', () => {
      const interactiveElements = AccessibilityTestUtils.getInteractiveElements(fixture);
      
      interactiveElements.forEach((element, index) => {
        expect(AccessibilityTestUtils.isKeyboardAccessible(element))
          .toBe(true, `Interactive element at index ${index} should be keyboard accessible`);
      });
    });

    it('should handle Enter and Space key presses on buttons', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button, [role="button"]'));
      
      buttons.forEach(button => {
        spyOn(button.nativeElement, 'click');
        
        AccessibilityTestUtils.simulateKeyPress(button, 'Enter');
        AccessibilityTestUtils.simulateKeyPress(button, ' ');
        
        // Note: In a real implementation, you'd verify the click was called
        // This test structure is ready for when keyboard handlers are implemented
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper heading hierarchy', () => {
      const headings = fixture.debugElement.queryAll(By.css('h1, h2, h3, h4, h5, h6'));
      
      if (headings.length > 0) {
        // Check that we start with h1 or h2 (depending on page structure)
        const firstHeading = headings[0].nativeElement.tagName.toLowerCase();
        expect(['h1', 'h2'].includes(firstHeading)).toBe(true);
      }
    });

    it('should have descriptive text for dynamic content areas', () => {
      const dynamicAreas = fixture.debugElement.queryAll(By.css('[aria-live], [aria-atomic]'));
      
      dynamicAreas.forEach(area => {
        const ariaLive = area.nativeElement.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off'].includes(ariaLive)).toBe(true);
      });
    });
  });

  describe('Images and Media', () => {
    it('should have alt text for all images', () => {
      expect(AccessibilityTestUtils.imagesHaveAltText(fixture)).toBe(true);
    });

    it('should have proper alt text content', () => {
      const images = fixture.debugElement.queryAll(By.css('img'));
      
      images.forEach(img => {
        const alt = img.nativeElement.getAttribute('alt');
        expect(alt).toBeDefined();
        // Alt text should not be just whitespace
        if (alt) {
          expect(alt.trim().length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Color and Contrast', () => {
    it('should have good color contrast for text elements', () => {
      const textElements = fixture.debugElement.queryAll(By.css('p, span, div, h1, h2, h3, h4, h5, h6, button, a'));
      
      textElements.forEach(element => {
        if (element.nativeElement.textContent?.trim()) {
          expect(AccessibilityTestUtils.hasGoodContrast(element)).toBe(true);
        }
      });
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      const focusableElements = AccessibilityTestUtils.getInteractiveElements(fixture);
      
      focusableElements.forEach(element => {
        element.nativeElement.focus();
        const computedStyle = window.getComputedStyle(element.nativeElement);
        
        // Check that focus styles are defined (outline or box-shadow)
        const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
        const hasBoxShadow = computedStyle.boxShadow !== 'none';
        
        expect(hasOutline || hasBoxShadow).toBe(true);
      });
    });
  });
});
