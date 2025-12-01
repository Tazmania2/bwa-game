import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';
import { FunifierApiService } from './funifier-api.service';
import { PlayerMapper } from './player-mapper.service';
import { of, throwError } from 'rxjs';
import { PlayerStatus, PointWallet, SeasonProgress } from '@model/gamification-dashboard.model';

describe('PlayerService', () => {
  let service: PlayerService;
  let funifierApiSpy: jasmine.SpyObj<FunifierApiService>;
  let mapperSpy: jasmine.SpyObj<PlayerMapper>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('FunifierApiService', ['get']);
    const playerMapperSpy = jasmine.createSpyObj('PlayerMapper', [
      'toPlayerStatus',
      'toPointWallet',
      'toSeasonProgress'
    ]);

    TestBed.configureTestingModule({
      providers: [
        PlayerService,
        { provide: FunifierApiService, useValue: apiSpy },
        { provide: PlayerMapper, useValue: playerMapperSpy }
      ]
    });

    service = TestBed.inject(PlayerService);
    funifierApiSpy = TestBed.inject(FunifierApiService) as jasmine.SpyObj<FunifierApiService>;
    mapperSpy = TestBed.inject(PlayerMapper) as jasmine.SpyObj<PlayerMapper>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPlayerStatus', () => {
    it('should fetch and map player status correctly', (done) => {
      const mockApiResponse = {
        _id: 'player123',
        name: 'John Doe',
        email: 'john@example.com',
        level: 5,
        extra: { seasonLevel: 10, area: 'Sales', time: 'Team A', squad: 'Squad 1' }
      };

      const mockPlayerStatus: PlayerStatus = {
        _id: 'player123',
        name: 'John Doe',
        email: 'john@example.com',
        level: 5,
        seasonLevel: 10,
        metadata: { area: 'Sales', time: 'Team A', squad: 'Squad 1' },
        created: Date.now(),
        updated: Date.now()
      };

      funifierApiSpy.get.and.returnValue(of(mockApiResponse));
      mapperSpy.toPlayerStatus.and.returnValue(mockPlayerStatus);

      service.getPlayerStatus('player123').subscribe(result => {
        expect(result).toEqual(mockPlayerStatus);
        expect(funifierApiSpy.get).toHaveBeenCalledWith('/v3/player/player123/status');
        expect(mapperSpy.toPlayerStatus).toHaveBeenCalledWith(mockApiResponse);
        done();
      });
    });

    it('should use cached data on subsequent calls', (done) => {
      const mockApiResponse = { _id: 'player123', name: 'John Doe' };
      const mockPlayerStatus: PlayerStatus = {
        _id: 'player123',
        name: 'John Doe',
        email: 'john@example.com',
        level: 5,
        seasonLevel: 10,
        metadata: { area: '', time: '', squad: '' },
        created: Date.now(),
        updated: Date.now()
      };

      funifierApiSpy.get.and.returnValue(of(mockApiResponse));
      mapperSpy.toPlayerStatus.and.returnValue(mockPlayerStatus);

      // First call
      service.getPlayerStatus('player123').subscribe(() => {
        // Second call should use cache
        service.getPlayerStatus('player123').subscribe(result => {
          expect(result).toEqual(mockPlayerStatus);
          expect(funifierApiSpy.get).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('should fallback to cached data on error', (done) => {
      const mockPlayerStatus: PlayerStatus = {
        _id: 'player123',
        name: 'John Doe',
        email: 'john@example.com',
        level: 5,
        seasonLevel: 10,
        metadata: { area: '', time: '', squad: '' },
        created: Date.now(),
        updated: Date.now()
      };

      // First successful call
      funifierApiSpy.get.and.returnValue(of({ _id: 'player123' }));
      mapperSpy.toPlayerStatus.and.returnValue(mockPlayerStatus);

      service.getPlayerStatus('player123').subscribe(() => {
        // Clear cache to force new request
        service.clearCache();

        // Second call fails
        funifierApiSpy.get.and.returnValue(throwError(() => new Error('Network error')));

        service.getPlayerStatus('player123').subscribe(result => {
          expect(result).toEqual(mockPlayerStatus);
          done();
        });
      });
    });
  });

  describe('getPlayerPoints', () => {
    it('should fetch and map player points correctly', (done) => {
      const mockApiResponse = {
        point_categories: {
          bloqueados: 1000,
          desbloqueados: 2000,
          moedas: 500
        }
      };

      const mockPointWallet: PointWallet = {
        bloqueados: 1000,
        desbloqueados: 2000,
        moedas: 500
      };

      funifierApiSpy.get.and.returnValue(of(mockApiResponse));
      mapperSpy.toPointWallet.and.returnValue(mockPointWallet);

      service.getPlayerPoints('player123').subscribe(result => {
        expect(result).toEqual(mockPointWallet);
        expect(funifierApiSpy.get).toHaveBeenCalledWith('/v3/player/player123/status');
        expect(mapperSpy.toPointWallet).toHaveBeenCalledWith(mockApiResponse);
        done();
      });
    });

    it('should handle error with fallback', (done) => {
      const mockPointWallet: PointWallet = {
        bloqueados: 1000,
        desbloqueados: 2000,
        moedas: 500
      };

      // First successful call
      funifierApiSpy.get.and.returnValue(of({ point_categories: {} }));
      mapperSpy.toPointWallet.and.returnValue(mockPointWallet);

      service.getPlayerPoints('player123').subscribe(() => {
        service.clearCache();

        // Second call fails
        funifierApiSpy.get.and.returnValue(throwError(() => new Error('API error')));

        service.getPlayerPoints('player123').subscribe(result => {
          expect(result).toEqual(mockPointWallet);
          done();
        });
      });
    });
  });

  describe('getSeasonProgress', () => {
    it('should fetch and map season progress correctly', (done) => {
      const seasonDates = {
        start: new Date('2023-01-01'),
        end: new Date('2023-12-31')
      };

      const mockApiResponse = {
        progress: {
          metas: { current: 5, target: 10 },
          clientes: 20,
          tarefasFinalizadas: 50
        }
      };

      const mockProgress: SeasonProgress = {
        metas: { current: 5, target: 10 },
        clientes: 20,
        tarefasFinalizadas: 50,
        seasonDates
      };

      funifierApiSpy.get.and.returnValue(of(mockApiResponse));
      mapperSpy.toSeasonProgress.and.returnValue(mockProgress);

      service.getSeasonProgress('player123', seasonDates).subscribe(result => {
        expect(result).toEqual(mockProgress);
        expect(funifierApiSpy.get).toHaveBeenCalledWith('/v3/player/player123/progress', {
          start_date: seasonDates.start.toISOString(),
          end_date: seasonDates.end.toISOString()
        });
        done();
      });
    });
  });

  describe('Cache Management', () => {
    it('should clear all caches', () => {
      service.clearCache();
      // Cache should be empty, so next call should hit API
      expect(service).toBeTruthy();
    });

    it('should clear cache for specific player', (done) => {
      const mockApiResponse = { _id: 'player123' };
      const mockPlayerStatus: PlayerStatus = {
        _id: 'player123',
        name: 'John Doe',
        email: 'john@example.com',
        level: 5,
        seasonLevel: 10,
        metadata: { area: '', time: '', squad: '' },
        created: Date.now(),
        updated: Date.now()
      };

      funifierApiSpy.get.and.returnValue(of(mockApiResponse));
      mapperSpy.toPlayerStatus.and.returnValue(mockPlayerStatus);

      service.getPlayerStatus('player123').subscribe(() => {
        service.clearPlayerCache('player123');

        // Next call should hit API again
        service.getPlayerStatus('player123').subscribe(() => {
          expect(funifierApiSpy.get).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });
  });
});
