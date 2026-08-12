import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorHandlerService } from './api-error-handler.service';
import { ToastService } from './toast.service';
import {
  DASHBOARD_PANEL_LOAD_ERROR_MESSAGE,
  SNOWFLAKE_UNAVAILABLE_MESSAGE
} from '@model/api-error.model';

describe('ApiErrorHandlerService', () => {
  let service: ApiErrorHandlerService;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['warning', 'error']);

    TestBed.configureTestingModule({
      providers: [
        ApiErrorHandlerService,
        { provide: ToastService, useValue: toast }
      ]
    });

    service = TestBed.inject(ApiErrorHandlerService);
  });

  it('showSnowflakeUnavailableToast uses warning with generic message only', () => {
    const err = new HttpErrorResponse({
      status: 503,
      error: {
        statusCode: 503,
        message:
          'get_player_finished_deliveries_cache failed: canceling statement due to statement timeout [57014]'
      }
    });

    service.showSnowflakeUnavailableToast(err);
    service.showSnowflakeUnavailableToast(err);

    expect(toast.warning).toHaveBeenCalledTimes(1);
    expect(toast.warning).toHaveBeenCalledWith(SNOWFLAKE_UNAVAILABLE_MESSAGE, 6000);
  });

  it('showDashboardPanelUnavailableToast uses friendly copy for timeouts', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: {
        statusCode: 500,
        message:
          'get_player_finished_deliveries_cache failed: canceling statement due to statement timeout [57014]'
      }
    });

    service.showDashboardPanelUnavailableToast(err);

    expect(toast.warning).toHaveBeenCalledWith(SNOWFLAKE_UNAVAILABLE_MESSAGE, 6000);
  });

  it('handleApiError does not toast on 401', () => {
    const err = new HttpErrorResponse({
      status: 401,
      error: { statusCode: 401, message: 'Unauthorized' }
    });

    service.handleApiError(err);

    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('handleApiError shows generic error for unknown failures', () => {
    service.handleApiError(new Error('boom'));

    expect(toast.error).toHaveBeenCalledWith(DASHBOARD_PANEL_LOAD_ERROR_MESSAGE, false);
  });

  it('handleApiError never surfaces raw backend text', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: {
        statusCode: 500,
        message:
          'get_player_finished_deliveries_cache failed: canceling statement due to statement timeout [57014]'
      }
    });

    service.handleApiError(err);

    expect(toast.warning).toHaveBeenCalledWith(SNOWFLAKE_UNAVAILABLE_MESSAGE, 6000);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
