# System Initialization Fix

## Problem
The application was failing to start with a `NullInjectorError` and showing errors about `/client/system-params` endpoint. This was because the app was still trying to initialize the old backend system that no longer exists after migrating to Funifier.

## Root Cause
- `SystemParamsService` was calling `/client/system-params` from the old backend
- `CampaignService` was calling `/campaign/current` from the old backend
- Both endpoints no longer exist since we migrated to Funifier as the sole backend

## Solution
Updated both services to work without the old backend by providing default values:

### 1. SystemParamsService (`src/app/services/system-params.service.ts`)
- Modified `fetchFromApi()` to return default system parameters instead of calling the old API
- Default values include:
  - Client name: "Game4U"
  - Theme settings (light theme, colors)
  - Feature flags (challenges, achievements, leaderboards enabled)
  - Language settings (pt-BR default)
  - Season dates (full year 2025)
  - Goals and levels configuration

### 2. CampaignService (`src/app/services/campaign.service.ts`)
- Modified `fetchCurrentCampaign()` to return a default campaign instead of calling the old API
- Default campaign uses the current year (January 1 - December 31)
- Campaign name: "Temporada {year}"

## Impact
- Application now starts successfully without requiring the old backend
- All dependent services (AliasService, GoalsConfigService, SeasonDatesService, FeaturesService) continue to work
- System initialization completes without errors
- Dashboard can now load and display Funifier data

## Testing
1. Start the application: `npm start`
2. Verify no errors in console about system-params or campaign
3. Verify the dashboard loads successfully
4. Verify Funifier data is displayed correctly

## Next Steps
If you need to customize any of the default values (client name, colors, goals, etc.), you can:
1. Update the default values in `SystemParamsService.fetchFromApi()`
2. Update the campaign period in `CampaignService.getDefaultCampaign()`
3. Consider creating a configuration file or admin panel for these settings in the future
