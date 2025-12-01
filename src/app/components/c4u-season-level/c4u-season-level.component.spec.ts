import { ComponentFixture, TestBed } from '@angular/core/testing';
import { C4uSeasonLevelComponent } from './c4u-season-level.component';
import { PlayerMetadata } from '@model/gamification-dashboard.model';

describe('C4uSeasonLevelComponent', () => {
  let component: C4uSeasonLevelComponent;
  let fixture: ComponentFixture<C4uSeasonLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [C4uSeasonLevelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(C4uSeasonLevelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the season level number', () => {
    component.level = 5;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const levelNumber = compiled.querySelector('.level-number');
    expect(levelNumber?.textContent?.trim()).toBe('5');
  });

  it('should render the player name', () => {
    component.playerName = 'João Silva';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const playerName = compiled.querySelector('.player-name');
    expect(playerName?.textContent?.trim()).toBe('João Silva');
  });

  it('should render player metadata with all fields', () => {
    component.metadata = {
      area: 'Vendas',
      time: 'Time A',
      squad: 'Squad 1'
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const metadata = compiled.querySelector('.player-metadata');
    expect(metadata?.textContent).toContain('Vendas');
    expect(metadata?.textContent).toContain('Time A');
    expect(metadata?.textContent).toContain('Squad 1');
  });

  it('should render player metadata with only area', () => {
    component.metadata = {
      area: 'Marketing',
      time: '',
      squad: ''
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const metadata = compiled.querySelector('.player-metadata');
    expect(metadata?.textContent).toContain('Marketing');
  });

  it('should not render metadata paragraph when all fields are empty', () => {
    component.metadata = {
      area: '',
      time: '',
      squad: ''
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const metadata = compiled.querySelector('.player-metadata');
    expect(metadata).toBeNull();
  });

  it('should display default values when no inputs are provided', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const levelNumber = compiled.querySelector('.level-number');
    const playerName = compiled.querySelector('.player-name');

    expect(levelNumber?.textContent?.trim()).toBe('0');
    expect(playerName?.textContent?.trim()).toBe('');
  });

  it('should handle large level numbers', () => {
    component.level = 999;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const levelNumber = compiled.querySelector('.level-number');
    expect(levelNumber?.textContent?.trim()).toBe('999');
  });
});
