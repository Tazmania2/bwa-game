import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { RankingComponent } from './ranking.component';
import { SharedModule } from '../../shared.module';
import { RankingService, RankingType, RankingPeriod, RankingParticipant, DateRange } from '../../services/ranking.service';

describe('RankingComponent', () => {
  let component: RankingComponent;
  let fixture: ComponentFixture<RankingComponent>;
  let rankingService: jasmine.SpyObj<RankingService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RankingService', [
      'getRankingsList', 
      'getRankingDetails', 
      'isLoadingRankingsList', 
      'clearCache', 
      'reloadRankings'
    ]);

    await TestBed.configureTestingModule({
      declarations: [ RankingComponent ],
      imports: [
        FormsModule,
        NgSelectModule,
        TranslateModule.forRoot(),
        SharedModule
      ],
      providers: [
        { provide: RankingService, useValue: spy }
      ]
    })
    .compileComponents();

    rankingService = TestBed.inject(RankingService) as jasmine.SpyObj<RankingService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RankingComponent);
    component = fixture.componentInstance;
    
    // Mock das respostas do serviço
    rankingService.getRankingsList.and.returnValue(Promise.resolve({
      rankings: [
        { id: 'productivity', name: 'Produtividade', description: 'Test', category: 'performance', isActive: true }
      ],
      periods: [
        { id: 'current', name: 'Mês Atual', startDate: '2024-01-01', endDate: '2024-01-31', isCurrent: true }
      ],
      totalCount: 1
    }));

    rankingService.getRankingDetails.and.returnValue(Promise.resolve({
      ranking: {
        id: 'productivity',
        type: { id: 'productivity', name: 'Produtividade', description: 'Test', category: 'performance', isActive: true },
        period: { id: 'current', name: 'Mês Atual', startDate: '2024-01-01', endDate: '2024-01-31', isCurrent: true },
        participants: [],
        totalParticipants: 0,
        lastUpdated: new Date().toISOString()
      },
      success: true
    }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedRankingType).toBeNull();
    expect(component.selectedDateRange).toBeTruthy();
    expect(component.isLoading).toBeFalsy();
    expect(component.filteredParticipants).toEqual([]);
    expect(component.hasGeneratedRanking).toBeFalse();
  });

  it('should load initial data on init', async () => {
    spyOn(component, 'loadInitialData');
    component.ngOnInit();
    expect(component.loadInitialData).toHaveBeenCalled();
  });

  it('should change ranking type', async () => {
    const newType: RankingType = { 
      id: 'sales', 
      name: 'Vendas', 
      description: 'Test', 
      category: 'revenue', 
      isActive: true 
    };
    
    spyOn(component, 'clearRankingData');
    await component.onRankingTypeChange(newType);
    expect(component.selectedRankingType).toBe(newType);
    expect(component.hasGeneratedRanking).toBeFalse();
    expect(component.clearRankingData).toHaveBeenCalled();
  });

  it('should change date range', async () => {
    const newDateRange: DateRange = { 
      startDate: '2024-01-01', 
      endDate: '2024-01-31'
    };
    
    spyOn(component, 'clearRankingData');
    await component.onDateRangeChange(newDateRange);
    expect(component.selectedDateRange).toBe(newDateRange);
    expect(component.hasGeneratedRanking).toBeFalse();
    expect(component.clearRankingData).toHaveBeenCalled();
  });

  it('should return correct position class', () => {
    expect(component.getPositionClass(1)).toBe('position-gold');
    expect(component.getPositionClass(2)).toBe('position-silver');
    expect(component.getPositionClass(3)).toBe('position-bronze');
    expect(component.getPositionClass(4)).toBe('position-regular');
  });

  it('should return correct position icon', () => {
    expect(component.getPositionIcon(1)).toBe('🥇');
    expect(component.getPositionIcon(2)).toBe('🥈');
    expect(component.getPositionIcon(3)).toBe('🥉');
    expect(component.getPositionIcon(4)).toBe('4');
  });

  it('should track participants by id', () => {
    const participant: RankingParticipant = { 
      id: 1, 
      name: 'Test', 
      teamName: 'Test Team', 
      position: 1, 
      points: 1000, 
      level: 5, 
      achievements: 2,
      progress: 75,
      lastUpdated: new Date().toISOString(),
      movement: 'up',
      previousPosition: 2,
      previousPoints: 800
    };
    expect(component.trackByParticipant(0, participant)).toBe(1);
  });

  it('should return correct movement text', () => {
    expect(component.getMovementText('up')).toBe('Subiu');
    expect(component.getMovementText('down')).toBe('Desceu');
    expect(component.getMovementText('stop')).toBe('Manteve');
    expect(component.getMovementText('new')).toBe('Novo');
    expect(component.getMovementText(undefined)).toBe('');
  });

  it('should generate ranking when called', async () => {
    component.selectedRankingType = { 
      id: 'productivity', 
      name: 'Produtividade', 
      description: 'Test', 
      category: 'performance', 
      isActive: true 
    };
    
    await component.generateRanking();
    
    expect(component.hasGeneratedRanking).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });

  it('should clear ranking data', () => {
    component.participants = [{ 
      id: 1, 
      name: 'Test', 
      teamName: 'Test Team', 
      position: 1, 
      points: 1000, 
      level: 5, 
      achievements: 2,
      progress: 75,
      lastUpdated: new Date().toISOString()
    }];
    component.filteredParticipants = [...component.participants];
    component.currentRankingData = {} as any;
    component.hasGeneratedRanking = true;
    
    component.clearRankingData();
    
    expect(component.participants).toEqual([]);
    expect(component.filteredParticipants).toEqual([]);
    expect(component.currentRankingData).toBeNull();
    expect(component.hasGeneratedRanking).toBeFalse();
  });
});
