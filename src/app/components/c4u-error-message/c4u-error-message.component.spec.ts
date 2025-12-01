import { ComponentFixture, TestBed } from '@angular/core/testing';
import { C4uErrorMessageComponent } from './c4u-error-message.component';

describe('C4uErrorMessageComponent', () => {
  let component: C4uErrorMessageComponent;
  let fixture: ComponentFixture<C4uErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [C4uErrorMessageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(C4uErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default error message', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.error-message').textContent).toContain('Ocorreu um erro');
  });

  it('should display custom error message', () => {
    component.message = 'Custom error message';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.error-message').textContent).toContain('Custom error message');
  });

  it('should show retry button when showRetry is true and callback is provided', () => {
    component.showRetry = true;
    component.retryCallback = () => {};
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.retry-button')).toBeTruthy();
  });

  it('should hide retry button when showRetry is false', () => {
    component.showRetry = false;
    component.retryCallback = () => {};
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.retry-button')).toBeFalsy();
  });

  it('should call retry callback when retry button is clicked', () => {
    const mockCallback = jasmine.createSpy('retryCallback');
    component.showRetry = true;
    component.retryCallback = mockCallback;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.retry-button');
    button.click();
    
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should return correct icon for network error', () => {
    component.type = 'network';
    expect(component.errorIcon).toBe('ri-wifi-off-line');
  });

  it('should return correct icon for auth error', () => {
    component.type = 'auth';
    expect(component.errorIcon).toBe('ri-lock-line');
  });

  it('should return correct title for server error', () => {
    component.type = 'server';
    expect(component.errorTitle).toBe('Erro no Servidor');
  });
});
