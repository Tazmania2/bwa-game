import { HttpErrorResponse } from '@angular/common/http';
import {
  ApiError,
  DASHBOARD_PANEL_LOAD_ERROR_MESSAGE,
  SNOWFLAKE_UNAVAILABLE_MESSAGE,
  getDashboardPanelLoadErrorMessage,
  getSnowflakeUnavailableMessage,
  isGameReportsPanelFailure,
  isSnowflakeUnavailable,
  toApiError
} from './api-error.model';

describe('api-error.model', () => {
  it('isSnowflakeUnavailable detects HttpErrorResponse 503', () => {
    const err = new HttpErrorResponse({
      status: 503,
      error: {
        statusCode: 503,
        message: SNOWFLAKE_UNAVAILABLE_MESSAGE
      }
    });
    expect(isSnowflakeUnavailable(err)).toBe(true);
  });

  it('isSnowflakeUnavailable detects message constant without status', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: {
        statusCode: 500,
        message: SNOWFLAKE_UNAVAILABLE_MESSAGE
      }
    });
    expect(isSnowflakeUnavailable(err)).toBe(true);
  });

  it('isSnowflakeUnavailable is false for 401', () => {
    const err = new HttpErrorResponse({
      status: 401,
      error: { statusCode: 401, message: 'Unauthorized' }
    });
    expect(isSnowflakeUnavailable(err)).toBe(false);
  });

  it('toApiError wraps HttpErrorResponse', () => {
    const err = new HttpErrorResponse({
      status: 503,
      error: {
        statusCode: 503,
        message: SNOWFLAKE_UNAVAILABLE_MESSAGE,
        path: '/game/reports/user-actions'
      }
    });
    const apiError = toApiError(err);
    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.statusCode).toBe(503);
    expect(apiError.isSnowflakeUnavailable).toBe(true);
    expect(apiError.body?.path).toContain('user-actions');
    expect(apiError.message).toBe(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE);
  });

  it('getSnowflakeUnavailableMessage never returns raw backend text', () => {
    const err = new HttpErrorResponse({
      status: 503,
      error: {
        statusCode: 503,
        message:
          'get_player_finished_deliveries_cache failed: canceling statement due to statement timeout [57014]'
      }
    });
    expect(getSnowflakeUnavailableMessage(err)).toBe(SNOWFLAKE_UNAVAILABLE_MESSAGE);
  });

  it('getDashboardPanelLoadErrorMessage is always generic', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: {
        statusCode: 500,
        message:
          'get_player_finished_deliveries_cache failed: canceling statement due to statement timeout [57014]'
      }
    });
    expect(getDashboardPanelLoadErrorMessage(err)).toBe(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE);
  });

  it('isGameReportsPanelFailure detects statement timeout payload', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: {
        statusCode: 500,
        message:
          'get_player_finished_deliveries_cache failed: canceling statement due to statement timeout [57014]'
      }
    });
    expect(isGameReportsPanelFailure(err)).toBe(true);
  });

  it('toApiError sanitizes technical backend messages', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: {
        statusCode: 500,
        message:
          'get_player_finished_deliveries_cache failed: canceling statement due to statement timeout [57014]'
      }
    });
    expect(toApiError(err).message).toBe(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE);
  });
});
