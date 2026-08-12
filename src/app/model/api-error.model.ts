import { HttpErrorResponse } from '@angular/common/http';

/** Corpo JSON de erro exposto pelo backend (`HttpExceptionFilter`). */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  path?: string;
  timestamp?: string;
  errors?: string[];
}

/** Mensagem amigável quando o lake (Snowflake) ou o painel estão temporariamente indisponíveis. */
export const SNOWFLAKE_UNAVAILABLE_MESSAGE =
  'Não foi possível carregar os dados agora. Tente novamente em instantes.';

/** Mensagem genérica + CTA para falhas dos endpoints que montam o painel. */
export const DASHBOARD_PANEL_LOAD_ERROR_MESSAGE =
  'Não foi possível carregar os dados agora. Tente novamente mais tarde.';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly body?: ApiErrorBody
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isSnowflakeUnavailable(): boolean {
    return this.statusCode === 503;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }
}

export function parseApiErrorBody(error: unknown): ApiErrorBody | undefined {
  if (!(error instanceof HttpErrorResponse)) {
    return undefined;
  }

  const body = error.error;
  if (body && typeof body === 'object' && 'statusCode' in body) {
    return body as ApiErrorBody;
  }

  const message =
    body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string'
      ? (body as { message: string }).message
      : error.message;

  return {
    statusCode: error.status,
    message
  };
}

/** Identifica indisponibilidade temporária do lake (preferir `statusCode === 503`). */
export function isSnowflakeUnavailable(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isSnowflakeUnavailable;
  }

  if (error instanceof HttpErrorResponse && error.status === 503) {
    return true;
  }

  const body = parseApiErrorBody(error);
  if (body?.statusCode === 503) {
    return true;
  }

  return body?.message === SNOWFLAKE_UNAVAILABLE_MESSAGE;
}

/**
 * Falha transitória dos endpoints `/game/reports/**` que montam o painel
 * (503/504/500, timeout de statement, etc.).
 */
export function isGameReportsPanelFailure(error: unknown): boolean {
  if (isSnowflakeUnavailable(error)) {
    return true;
  }

  if (error instanceof HttpErrorResponse) {
    if (error.status === 500 || error.status === 502 || error.status === 504 || error.status === 0) {
      return true;
    }
  }

  const message = (
    parseApiErrorBody(error)?.message ||
    (error instanceof Error ? error.message : '') ||
    ''
  ).toLowerCase();

  return (
    message.includes('statement timeout') ||
    message.includes('canceling statement') ||
    message.includes('_cache failed') ||
    message.includes('57014')
  );
}

/**
 * Mensagem segura para UI: nunca devolve texto técnico do backend
 * (ex.: `get_player_finished_deliveries_cache failed: … [57014]`).
 */
export function getSnowflakeUnavailableMessage(_error?: unknown): string {
  return SNOWFLAKE_UNAVAILABLE_MESSAGE;
}

/** Mensagem genérica para falhas ao montar o painel (com CTA implícito). */
export function getDashboardPanelLoadErrorMessage(_error?: unknown): string {
  return DASHBOARD_PANEL_LOAD_ERROR_MESSAGE;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof HttpErrorResponse) {
    const body = parseApiErrorBody(error);
    const statusCode = body?.statusCode ?? error.status;
    if (isGameReportsPanelFailure(error) || isSnowflakeUnavailable(error)) {
      return new ApiError(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE, statusCode, body);
    }
    const message = body?.message ?? error.message ?? `HTTP ${error.status}`;
    // Evita vazar mensagens técnicas do backend na UI.
    if (looksLikeTechnicalBackendMessage(message)) {
      return new ApiError(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE, statusCode, body);
    }
    return new ApiError(message, statusCode, body);
  }

  if (error instanceof Error) {
    if (looksLikeTechnicalBackendMessage(error.message)) {
      return new ApiError(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE, 0);
    }
    return new ApiError(error.message, 0);
  }

  return new ApiError(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE, 0);
}

function looksLikeTechnicalBackendMessage(message: string): boolean {
  const m = (message || '').toLowerCase();
  return (
    m.includes('statement timeout') ||
    m.includes('canceling statement') ||
    m.includes('_cache failed') ||
    m.includes('57014') ||
    m.includes('sqlstate') ||
    m.includes('exception') ||
    (/\[?\d{5}\]?/.test(m) && m.includes('failed'))
  );
}
