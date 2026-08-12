import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameReportsInterceptor } from './game-reports.interceptor';
import { ApiErrorHandlerService } from '@services/api-error-handler.service';
import { SNOWFLAKE_UNAVAILABLE_MESSAGE } from '@model/api-error.model';

describe('GameReportsInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let apiErrorHandler: jasmine.SpyObj<ApiErrorHandlerService>;

  beforeEach(() => {
    apiErrorHandler = jasmine.createSpyObj('ApiErrorHandlerService', [
      'showSnowflakeUnavailableToast',
      'showDashboardPanelUnavailableToast'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: GameReportsInterceptor,
          multi: true
        },
        { provide: ApiErrorHandlerService, useValue: apiErrorHandler }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('retries once on 503 then shows snowflake toast', fakeAsync(() => {
    let finalError: HttpErrorResponse | undefined;

    http.get('/api/game/reports/user-actions?month=2026-06').subscribe({
      next: () => fail('should error'),
      error: err => {
        finalError = err;
      }
    });

    const req1 = httpMock.expectOne('/api/game/reports/user-actions?month=2026-06');
    req1.flush(
      { statusCode: 503, message: SNOWFLAKE_UNAVAILABLE_MESSAGE },
      { status: 503, statusText: 'Service Unavailable' }
    );

    tick(1500);

    const req2 = httpMock.expectOne('/api/game/reports/user-actions?month=2026-06');
    req2.flush(
      { statusCode: 503, message: SNOWFLAKE_UNAVAILABLE_MESSAGE },
      { status: 503, statusText: 'Service Unavailable' }
    );

    expect(finalError?.status).toBe(503);
    expect(apiErrorHandler.showDashboardPanelUnavailableToast).toHaveBeenCalledTimes(1);
  }));

  it('shows friendly toast on statement timeout without retry', done => {
    http.get('/api/game/reports/finished/deliveries/cached?month=2026-08').subscribe({
      next: () => fail('should error'),
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
        expect(apiErrorHandler.showDashboardPanelUnavailableToast).toHaveBeenCalledTimes(1);
        done();
      }
    });

    const req = httpMock.expectOne('/api/game/reports/finished/deliveries/cached?month=2026-08');
    req.flush(
      {
        statusCode: 500,
        message:
          'get_player_finished_deliveries_cache failed: canceling statement due to statement timeout [57014]'
      },
      { status: 500, statusText: 'Internal Server Error' }
    );
  });

  it('does not retry non-report endpoints', done => {
    http.get('/api/game/stats').subscribe({
      next: () => fail('should error'),
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(503);
        expect(apiErrorHandler.showSnowflakeUnavailableToast).not.toHaveBeenCalled();
        expect(apiErrorHandler.showDashboardPanelUnavailableToast).not.toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne('/api/game/stats');
    req.flush({}, { status: 503, statusText: 'Service Unavailable' });
  });

  it('succeeds on retry after first 503', fakeAsync(() => {
    let response: unknown;

    http.get('/api/game/reports/dashboard/cached').subscribe({
      next: body => {
        response = body;
      },
      error: () => fail('should succeed')
    });

    const req1 = httpMock.expectOne('/api/game/reports/dashboard/cached');
    req1.flush(
      { statusCode: 503, message: SNOWFLAKE_UNAVAILABLE_MESSAGE },
      { status: 503, statusText: 'Service Unavailable' }
    );

    tick(1500);

    const req2 = httpMock.expectOne('/api/game/reports/dashboard/cached');
    req2.flush({ ok: true });

    expect(response).toEqual({ ok: true });
    expect(apiErrorHandler.showSnowflakeUnavailableToast).not.toHaveBeenCalled();
  }));
});
