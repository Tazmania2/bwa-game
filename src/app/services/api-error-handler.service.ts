import { Injectable } from '@angular/core';
import {
  DASHBOARD_PANEL_LOAD_ERROR_MESSAGE,
  getDashboardPanelLoadErrorMessage,
  getSnowflakeUnavailableMessage,
  isGameReportsPanelFailure,
  isSnowflakeUnavailable,
  toApiError
} from '@model/api-error.model';
import { ToastService } from './toast.service';

/**
 * Tratamento centralizado de erros HTTP da API Game4U.
 * 503 / timeouts (lake/Snowflake) → aviso amigável, sem logout; 401 → fluxo existente de sessão.
 * Nunca exibe texto técnico bruto do backend na UI.
 */
@Injectable({ providedIn: 'root' })
export class ApiErrorHandlerService {
  private static readonly SNOWFLAKE_TOAST_DEDUP_MS = 4000;
  private snowflakeToastShownAt = 0;

  constructor(private toast: ToastService) {}

  handleApiError(error: unknown): void {
    if (isSnowflakeUnavailable(error) || isGameReportsPanelFailure(error)) {
      this.showDashboardPanelUnavailableToast(error);
      return;
    }

    const apiError = toApiError(error);
    if (apiError.isUnauthorized) {
      return;
    }

    if (apiError.statusCode >= 400) {
      this.toast.error(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE, false);
      return;
    }

    this.toast.error(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE, false);
  }

  /** Toast de aviso (amarelo) com deduplicação — mensagem sempre genérica. */
  showSnowflakeUnavailableToast(error?: unknown): void {
    this.showDashboardPanelUnavailableToast(error);
  }

  /** Toast genérico para falhas dos endpoints que montam o painel. */
  showDashboardPanelUnavailableToast(_error?: unknown): void {
    const now = Date.now();
    if (now - this.snowflakeToastShownAt < ApiErrorHandlerService.SNOWFLAKE_TOAST_DEDUP_MS) {
      return;
    }

    this.snowflakeToastShownAt = now;
    // Mantém o tom de aviso do lake; texto sempre amigável (nunca body.message bruto).
    this.toast.warning(getSnowflakeUnavailableMessage(_error), 6000);
  }

  getPanelLoadErrorMessage(error?: unknown): string {
    return getDashboardPanelLoadErrorMessage(error);
  }
}
