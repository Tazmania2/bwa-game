import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { isGameReportsPanelFailure, isSnowflakeUnavailable } from '@model/api-error.model';
import { ApiErrorHandlerService } from '@services/api-error-handler.service';

/**
 * `GET /game/reports/**` — retry automático 1× em 503 (backend já tentou reconectar)
 * e toast amigável após falha definitiva (503/5xx/timeout). Não altera fluxo de 401 (sessão).
 */
@Injectable()
export class GameReportsInterceptor implements HttpInterceptor {
  private static readonly RETRY_DELAY_MS = 1500;

  constructor(private apiErrorHandler: ApiErrorHandlerService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.method !== 'GET' || !this.isGameReportsRequest(req.url)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      retry({
        count: 1,
        delay: (error: unknown) => {
          if (isSnowflakeUnavailable(error)) {
            return timer(GameReportsInterceptor.RETRY_DELAY_MS);
          }
          return throwError(() => error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (isSnowflakeUnavailable(error) || isGameReportsPanelFailure(error)) {
          this.apiErrorHandler.showDashboardPanelUnavailableToast(error);
        }
        return throwError(() => error);
      })
    );
  }

  private isGameReportsRequest(url: string): boolean {
    return /\/game\/reports(\/|$|\?)/.test(url);
  }
}
