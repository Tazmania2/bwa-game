import { Injectable } from '@angular/core';
import { Observable, of, throwError, ReplaySubject } from 'rxjs';
import { map, catchError, tap, timeout, take } from 'rxjs/operators';
import { FunifierApiService } from './funifier-api.service';
import { PlayerMapper } from './player-mapper.service';
import { PlayerStatus, PointWallet, SeasonProgress } from '@model/gamification-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds timeout
  
  // Cache the raw response data
  private cachedRawData: { [playerId: string]: { data: any; timestamp: number } } = {};
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  constructor(
    private funifierApi: FunifierApiService,
    private mapper: PlayerMapper
  ) {}

  /**
   * Get raw player data - fetches fresh or returns cached
   */
  private fetchPlayerData(playerId: string): Observable<any> {
    // Check cache first
    const cached = this.cachedRawData[playerId];
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('📊 Using cached data for:', playerId);
      return of(cached.data);
    }

    console.log('📊 Fetching fresh player data for:', playerId);
    
    return this.funifierApi.get<any>(`/v3/player/${playerId}/status`).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(response => {
        console.log('📊 Raw player data received:', response);
        // Cache the response
        this.cachedRawData[playerId] = {
          data: response,
          timestamp: Date.now()
        };
      }),
      catchError(error => {
        console.error('📊 Error fetching player data:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get player status
   */
  getPlayerStatus(playerId: string): Observable<PlayerStatus> {
    return this.fetchPlayerData(playerId).pipe(
      map(response => {
        const status = this.mapper.toPlayerStatus(response);
        console.log('📊 Mapped player status:', status);
        return status;
      }),
      catchError(error => {
        console.error('Error mapping player status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get player points
   */
  getPlayerPoints(playerId: string): Observable<PointWallet> {
    return this.fetchPlayerData(playerId).pipe(
      map(response => {
        const points = this.mapper.toPointWallet(response);
        console.log('📊 Mapped point wallet:', points);
        return points;
      }),
      catchError(error => {
        console.error('Error mapping point wallet:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get season progress
   */
  getSeasonProgress(playerId: string, seasonDates: { start: Date; end: Date }): Observable<SeasonProgress> {
    return this.fetchPlayerData(playerId).pipe(
      map(response => {
        const progress = this.mapper.toSeasonProgress(response, seasonDates);
        console.log('📊 Mapped season progress:', progress);
        return progress;
      }),
      catchError(error => {
        console.error('Error mapping season progress:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedRawData = {};
  }

  /**
   * Clear cache for specific player
   */
  clearPlayerCache(playerId: string): void {
    delete this.cachedRawData[playerId];
  }
}
