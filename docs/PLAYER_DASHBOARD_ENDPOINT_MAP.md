# Player Gamification Dashboard — Endpoint Map

Page: **`/dashboard`** (default dashboard).
Entry point: `src/app/pages/dashboard/gamification-dashboard/gamification-dashboard.component.ts` (+ `.html`).

Routing chain (verified):
`app-routing.module.ts:23-30` (`path: 'dashboard'` → `MainComponent` + `MainModule`) → `layout/main/main.routing.ts:5-12` → `pages/pages.routing.ts:5-10` (`path: ''` → `GamificationDashboardModule`, `canActivate: [DashboardRedirectGuard]`) → `gamification-dashboard.module.ts:33-36` (`path: ''` → `GamificationDashboardComponent`).
`guards/dashboard-redirect.guard.ts` issues **no HTTP** (session/profile only).

Every claim below is cited as `file:line`. `*.spec.ts` ignored.

---

## 1. Base URLs, headers, feature flag

| Base | Source | Notes |
|---|---|---|
| `environment.backend_url_base` (Game4U/Nest API) | `game4u-api.service.ts:149` (`baseUrl`), `player.service.ts:96-97,144`, `campaign.service.ts:62-75`, `backend-api.service.ts:33` | Path join via `environments/backend-url.ts:52-56` |
| `environment.gamificacaoApiUrl` (BWA hook) | `company-kpi.service.ts:523`; default `https://hook.bwa.global:3334/gamificacao` (`environment.ts:103-105`) | Full URL, no path building |
| Supabase (PostgREST) | `game4u-api.service.ts:162-168` | **Not used by this page**: `useSupabaseStandalone()` requires `!isConfigured()` (i.e. empty `backend_url_base`) **and** `useGame4uSupabaseFallback === true` |
| Funifier `/database/*` (legacy) | `backend-api.service.ts:116-120`, `cnpj-lookup.service.ts:28-30` | All `*/aggregate` calls hard-disabled — see §5 |

Headers:
* `client_id` on all `/game/*` requests — `game4u-api.service.ts:1602-1605`.
* `Bearer` session token injected by `providers/auth.interceptor.ts:127-174` for the `backend_url_base` origin; the gamificação hook is skipped and keeps only `x-api-token` (`auth.interceptor.ts:79-101`, token set in `company-kpi.service.ts:539`).
* `GET /game/reports/**` gets 1 automatic retry on Snowflake-unavailable 503 + toast — `providers/game-reports.interceptor.ts:25-46`.

Feature switch that selects the whole data path:
`playerService.usesGame4uWalletFromStats()` = `isGame4uDataEnabled() && game4uApi.isConfigured()` (`player.service.ts:41-44`), i.e. **`backend_url_base` non-empty** (`game4u-api.service.ts:153-155`, `model/game4u-api.model.ts:1848-1859`). Used at component lines 389-393, 476, 550, 1280, 1538, 1545, 1633.

---

## 2. Summary table — every distinct endpoint

Live = actually issued with the standard config (`backend_url_base` set).

| # | Method + path | Base URL | Issuing service:method | Component trigger | Status |
|---|---|---|---|---|---|
| 1 | `GET /campaign` | `backend_url_base` | `CampaignService.fetchCurrentCampaign` `campaign.service.ts:75-78` (via `SeasonDatesService.getSeasonDates`) | `ngOnInit → loadDashboardData` (`component:374`) | Live (1×/session) |
| 2 | `GET /game/reports/dashboard/cached` | `backend_url_base` | `Game4uApiService.getGameReportsDashboardCached` `game4u-api.service.ts:863-870`; wrapper `ActionLogService.fetchPlayerDashboardCached` `action-log.service.ts:645-676` | `ngOnInit` (sidebar `component:481`; KPI bundle `component:1370`), month change (`component:1538`), retry button (`component:1633`) | Live |
| 3 | `GET /game/reports/finished/deliveries/cached` | `backend_url_base` | `Game4uApiService.getGameReportsFinishedDeliveriesCached` `game4u-api.service.ts:586-600`; wrapper `ActionLogService.getPlayerFinishedDeliveriesParticipacaoPage` `action-log.service.ts:3766-3812` | `ngOnInit` / month change first page (`component:845`), "Carregar mais" (`component:789`), retry (`component:1638`) | Live |
| 4 | `GET /gamificacao` (whole URL from `gamificacaoApiUrl`) | BWA hook | `CompanyKpiService.getGamificacaoMaps$` `company-kpi.service.ts:522-552` | prefetch on load (`component:372`), prefetch on month change (`component:1536`), consumed by `enrichFromParticipacaoRowKeys` (`component:1111`) | Live |
| 5 | `GET /game/reports/user-actions` (status `PENDING`+`DOING`, `dt_prazo_*`) | `backend_url_base` | `Game4uApiService.getGameReportsUserActions` `game4u-api.service.ts:834-839`; slice builder `action-log.service.ts:1627-1670` | month change → insights panel (`component:1569`), progress modal "entregas pendentes" / insights alert click (`component:1703-1749`, `1752-1765`) | Live |
| 6 | `GET /game/reports/user-actions` (status `DONE`+`DELIVERED`, `finished_at_*`) | `backend_url_base` | same as #5, `action-log.service.ts:1663-1668` | month change → insights panel; progress modal "atividades finalizadas" | Live |
| 7 | `GET /game/reports/finished/actions-by-delivery` | `backend_url_base` | `Game4uApiService.getGameReportsFinishedActionsByDelivery` `game4u-api.service.ts:757-763`; wrapper `action-log.service.ts:2464-2487` | client row click → `modal-company-carteira-detail` (`component:1654-1659`, modal `:163-176`, `:275-317`) | Live |
| 8 | `GET /game/actions` | `backend_url_base` | `Game4uApiService.getGameActions` `game4u-api.service.ts:1652-1664` | progress modal "Pontos" card (`getActivityList` w/o status `action-log.service.ts:3281-3295`) and "processos-*" cards (`getProcessList` `action-log.service.ts:3422-3442`) | Live (modal only — **not** by the page itself) |
| 9 | `GET /auth/user` | `backend_url_base` | `PlayerService.getCurrentPlayerData` `player.service.ts:144` | `ngOnInit → getPlayerStatus` (`component:454`); `KPIService.getPlayerKPIs` only when `sessao.usuario.extra` is absent (`kpi.service.ts:79-86`) | Live (15-min cache) |
| 10 | `GET /player/{id}` | `backend_url_base` | `PlayerService.getRawPlayerData` `player.service.ts:96-99` | only when `?playerId=` ≠ session user (`component:267-285`, `player.service.ts:81-84`) | Conditional |
| 11 | `POST /database/empid_cnpj__c/aggregate?strict=true` | `backend_url_base` | `CnpjLookupService.fetchAllPaginatedCnpj` `cnpj-lookup.service.ts:61,107` | carteira enrich (`component:681`), participação legacy fallback (`component:902`), modals | **Dead** — `cnpj-lookup.service.ts:102-105` |
| 12 | `POST /v3/database/action_log/aggregate?strict=true` | `backend_url_base` | `action-log.service.ts:1860` (page fetch), `:2819` (process metrics), `:3507` (process list legacy), `:3730` (all-executor counts), `:4245` (activities by process) | legacy (non-Game4U) progress/pontos/participação; `c4u-seletor-mes` Jan-2026 probe (`c4u-seletor-mes.component.ts:157`) | **Dead** — `backend-api.service.ts:104-107` |
| 13 | `POST /v3/database/cnpj_performance__c/aggregate?strict=true` | `backend_url_base` | `KPIService.getCompanyKPIs` `kpi.service.ts:226-229` | client row click → `modal-company-carteira-detail:111` | **Dead** — `backend-api.service.ts:104-107` |
| 14 | `POST /v3/database/metric_targets__c/aggregate?strict=true` | `backend_url_base` | `KPIService.getMetricTargets` `kpi.service.ts:55-58` | **never called from this page** (`getPlayerKPIs` reads the profile, `kpi.service.ts:106-118`) | Dead + unreachable |
| 15 | `GET /game/reports/finished/summary` | `backend_url_base` | `game4u-api.service.ts:515-519` via `getSeasonProgressSidebarDetails` `action-log.service.ts:1965-1972` | **unreachable from this page**: that branch needs a `team_id` (`action-log.service.ts:1932-1951`) and the page never passes one (`component:614`, `1612`) | Unreachable |
| 16 | `GET /game/stats` | `backend_url_base` | `game4u-api.service.ts:1626-1637` | **unreachable from this page**: `getPlayerPoints`/`getPontosForMonth` are only called in the non-Game4U branch (`component:506,512`), where their Game4U path is disabled by definition | Unreachable (matches comment `component:360-364`) |

`player_company__c` produces **no request at all**: `PlayerService.getPlayerCompanyData` returns `of(new Map())` (`player.service.ts:250-252`), so `getPlayerCnpjResp` (`component:668`) resolves to `[]`.

---

## 3. Live endpoints — full detail

### 3.1 `GET {backend_url_base}/campaign`
* Issuer: `CampaignService.fetchCurrentCampaign` — `campaign.service.ts:75-78`. Headers `Content-Type`, `client_id` (`:70-73`).
* Query/body: none.
* Trigger: `loadDashboardData()` → `seasonDatesService.getSeasonDates()` (`component:374-382`); also prefetched at app start (`campaign.service.ts:33-35`).
* Response → UI: `starts_at` / `finishes_at` of the active campaign (`selectActiveCampaign` `:110-140`) become `seasonDates` (`component:376`), which (a) clamp the initial `selectedMonth` (`component:409-437`), (b) feed `c4u-seletor-mes` month list (`c4u-seletor-mes.component.ts:74-76`), (c) become the ISO range for every `/game/*` window (`game4u-api.service.ts:301-329`), (d) fill "Progresso da temporada" dates (`component:543`, `player.service.ts:237-240`).
* Caching: `CampaignService.currentCampaign` + in-flight promise (`campaign.service.ts:38-58`); second-level cache `SeasonDatesService.seasonBoundsCache` (`season-dates.service.ts:67-79`). `clearAllCaches()` clears the campaign cache but **not** `seasonBoundsCache` (`cache-manager.service.ts:84`, `season-dates.service.ts:271-275`), so this is effectively 1 request per app session.
* Fallback: any failure → synthetic Jan 1 – Dec 31 season (`campaign.service.ts:86-89`, `:126-139`); component-level fallback at `component:377-379`/`399-406`.

### 3.2 `GET {backend_url_base}/game/reports/dashboard/cached`
* Issuer: `Game4uApiService.getGameReportsDashboardCached` — `game4u-api.service.ts:863-870`.
* Query params: `email` (session email lowercased, `action-log.service.ts:601-615`), `month` = `YYYY-MM` (`action-log.service.ts:626-630`). No body. When the filter is "toda temporada" the current month is used as reference (`action-log.service.ts:633-640`).
* Wrappers / triggers:
  * `getMonthlyGame4uPlayerDashboardData` (`action-log.service.ts:2001-2049`) ← `component:478-484` (`loadPlayerData`, ngOnInit) → sidebar wallet + season stats.
  * `getGamificationDashboardCachedBundle` (`action-log.service.ts:1446-1471`) ← `component:1370` from `loadGamificationDashboardFromCache` (`component:1340`), called on ngOnInit (`component:389`), month change (`component:1538`) and the retry button (`component:1633`).
  * `getSeasonProgressSidebarDetails` (`action-log.service.ts:1934-1950`) and `getMonthlyPointsGoalTarget` (`action-log.service.ts:1723-1731`) also route here.
* Response fields (`model/game4u-api.model.ts:358-381`) → UI:
  | Field | UI element |
  |---|---|
  | `season_points_total` | point wallet `desbloqueados` (`c4u-point-wallet`) — `action-log.service.ts:2030-2032`, `component:485-492`, `.html:44-48` |
  | `season_tasks_finished_total` | "Tarefas finalizadas" in `c4u-season-progress` — `component:571-586`, `.html:55-59` |
  | `season_clients_total` | `seasonProgress.deliveryStatsTotal` in `c4u-season-progress` — `component:571-586`, `.html:55-59` |
  | `month_points_done_delivered`, `month_goal_points` | monthly points goal ring `c4u-monthly-points-goal-progress` (`activity.pontosDone` / `monthlyPointsGoalTarget`) — `action-log.service.ts:1401-1421`, `component:1385-1389`, `component:1971-1994` |
  | `month_pending_tasks_count`, `month_finished_tasks_count` | activity progress cards `c4u-activity-progress` — `action-log.service.ts:1408-1417` |
  | `month_clients_served` | `processMetrics.finalizadas` + "Clientes atendidos este mês (N)" counter — `action-log.service.ts:1416-1422`, `component:1390-1392`, `.html:302-306` |
  | `month_on_time_delivery_pct` | "Entregas no Prazo" circular ring (takes precedence over the list average) — `action-log.service.ts:234`, `component:1386-1387`, `component:1256-1265`, `component:1197-1235` |
  | `refreshed_at` | "Sincronizado com Acessórias em dd/MM/yyyy HH:mm" — `component:1394-1396`, `.html:179-185` |
  | `params.season_start/end` | overrides `seasonDates` after the response — `component:1397-1404` |
* Caching / dedupe: per-`(email, month)` HTTP dedupe map key `dashboard-cached|{email}|{month}` (`game4u-api.service.ts:861`), plus service cache key `g4u_dashboard_cached_{email}_{monthParam}` with `GAME4U_CACHE_DURATION` + `shareReplay` (`action-log.service.ts:655-675`). All four call sites therefore share **one** HTTP request per month.
* 404 / error handling: HTTP 404 → `null` (`action-log.service.ts:667-670`) → `playerDashboardCacheMissing = true` and the notice "Dados deste mês ainda não estão disponíveis…" (`component:1374-1382`, `.html:265-270`); other errors → same zeroed state (`component:1410-1424`).

### 3.3 `GET {backend_url_base}/game/reports/finished/deliveries/cached`
* Issuer: `Game4uApiService.getGameReportsFinishedDeliveriesCached` — `game4u-api.service.ts:586-600`.
* Query params: `month` (`YYYY-MM`), `offset`, `limit` (clamped 1…500, `:578`), `email` (player scope) or `team_id` (never set by this page). No body.
* Triggers: first page `offset=0, limit=30` on ngOnInit / month change — `component:843-846` (`participacaoPageLimit = 30`, `component:198`); "Carregar mais" button → `loadMoreParticipacao()` with `offset = participacaoNextOffset` — `component:771-800`, `.html:380-392`; retry button → `loadParticipacaoData()` (`component:1638`).
* Response (`model/game4u-api.model.ts:171-223`) → UI: each row's `delivery_title`, `delivery_id`, `emp_id`, `extra`, `on_time_pct`, `tasks_total`, `tasks_on_time`, `is_acessorias_g4|onboarding|risco_de_churn` are mapped to the "Clientes atendidos este mês" list rows (`component:1048-1069`, `.html:344-379`): row title (`getClienteAtendidoListTitle`, `component:2052-2072`), on-time % badge (`getListaEntregaPercent`, `component:2084-2098`), "cliente crítico" badge (`component:2117-2119`). `total` / `has_more` / `offset` drive the "Carregar mais" state (`component:794-807`, `hasMoreFinishedDeliveriesCachedPage`).
* Also used by `getPlayerCnpjListWithCount` with `offset: 0, limit: 500` (`action-log.service.ts:3591-3606`) — only reachable through the legacy fallback path (§4).
* Caching / dedupe: dedupe key `rpt-del-cached|{email}|{team_id}|{month}|{offset}|{limit}` (`game4u-api.service.ts:547-551`, `:580-587`).
* Fallbacks: HTTP 404 → empty page `{offset, limit, items: []}` (`game4u-api.service.ts:601-606`); other errors → empty page with `fromCachedDeliveries: true` (`action-log.service.ts:3806-3809`) → empty state + "Tentar carregar novamente" (`.html:394-403`). Because `fromCachedDeliveries` is set, an empty cached page does **not** fall back to the legacy list (`component:847-848`).

### 3.4 `GET {environment.gamificacaoApiUrl}` (BWA gamificação hook)
* Issuer: `CompanyKpiService.getGamificacaoMaps$` — `company-kpi.service.ts:522-552`. Header `x-api-token: environment.gamificacaoApiToken` (`:539`). No query params, no body.
* Triggers: fire-and-forget prefetch in `loadDashboardData()` (`component:372` → `company-kpi.service.ts:884-892`) and in `loadMonthDependentData()` (`component:1536`); consumed by `enrichFromParticipacaoRowKeys(rows, selectedMonth)` after the client list is rendered (`component:1104-1113`, `company-kpi.service.ts:679-757`); `fetchGamificacaoMapsAsync()` (`component:694`) belongs to the dead carteira flow (§5.3).
* Response → UI: rows are indexed by `EmpID`, normalized CNPJ and normalized title (`company-kpi.service.ts:470-508`); `porcEntregas` (mirrored as `entrega` / `deliveryKpi`) fills the per-row on-time % in "Clientes atendidos este mês" (`component:2084-2098`) and, when `month_on_time_delivery_pct` is absent, the **average** feeding the "Entregas no Prazo" ring (`component:1910-1925`, applied at `component:1197-1235` / `component:1889-1903`); `procFinalizados + procPendentes` fill `processCount`; `classificacao` and the `is_acessorias_*` flags drive the "cliente crítico" badge.
* Caching: 10-min snapshot cache with `shareReplay({refCount: false})` so the prefetch is not cancelled by `take(1)` (`company-kpi.service.ts:531-551`); cleared by `clearAllCaches()` (`cache-manager.service.ts:61-62`, `company-kpi.service.ts:875-877`) — i.e. one GET per dashboard load / month change.
* Fallbacks: missing URL or token → empty maps + console warning (`company-kpi.service.ts:526-529`); HTTP error → empty maps (`:542-545`); enrich error → rows without KPI (`:745-756`), list keeps names/counters and shows `n/a` (`.html:367-375`).

### 3.5 / 3.6 `GET {backend_url_base}/game/reports/user-actions` (two slices)
* Issuer: `Game4uApiService.getGameReportsUserActions` — `game4u-api.service.ts:834-839`. Requires `email` **or** `team_id` (`:776-780`) and exactly one date pair (`:795-824`).
* Slice "open": `email`, `status=PENDING`, `status=DOING` (repeated param, `:782-788`), `dt_prazo_start` / `dt_prazo_end` = first…last day of the month (`action-log.service.ts:1655-1659`, `game4u-api.service.ts:368-376`).
* Slice "finished": `email`, `status=DONE`, `status=DELIVERED`, `finished_at_start` / `finished_at_end` = campaign-clamped month ISO range (`action-log.service.ts:1661-1667`, `game4u-api.service.ts:301-329`).
* Triggers:
  * **Insights panel** — `loadDashboardInsights()` (`component:1553-1587`) → `DashboardInsightsService.getDashboardInsights` (`dashboard-insights.service.ts:662-679`) → `getTeamUserActionsForInsightsMonth` runs both slices in a `forkJoin` (`action-log.service.ts:1595-1624`). **Note:** this is only wired into `loadMonthDependentData()` (`component:1545-1550`) — `loadDashboardData()` (`component:383-394`) does **not** call it, so on first paint the panel stays `loading/null` until the first month change.
  * **Progress list modal** — `atividades-finalizadas` → finished slice, `atividades-pendentes` (card or insights alert) → open slice (`modal-progress-list.component.ts:451-457`, `:466-490`; `action-log.service.ts:3256-3272`, `:3379-3395`).
* Response → UI: aggregated client-side into `DashboardInsightsSnapshot` (`dashboard-insights.service.ts:629-648`) consumed by `c4u-dashboard-insights` (`.html:285-292`) — overdue pending, fine risk, due-soon, on-time vs late finished, justified, top activities, weekday distribution; alert clicks reopen the pending list filtered by focus (`component:1752-1765`). In the modal the same rows become the activity table + chart (`modal-progress-list.component.ts:492-511`).
* Caching: per-slice cache key `insights-ua-{open|finished}|{team}|{email}|{YYYY-MM}` and combined `insights-ua|…` with `shareReplay(1)` (`action-log.service.ts:1637-1645`, `:1607-1613`) — the insights panel and the modal share the same two requests per month.
* Fallbacks: request error → `of([])` (`action-log.service.ts:1536-1540`), snapshot error → `null` (`dashboard-insights.service.ts:673-677`) → empty insights panel; a generation counter drops stale responses (`component:1573-1585`).

### 3.7 `GET {backend_url_base}/game/reports/finished/actions-by-delivery`
* Issuer: `Game4uApiService.getGameReportsFinishedActionsByDelivery` — `game4u-api.service.ts:757-763`; params `finished_at_start`, `finished_at_end`, `email`, `delivery_title` (+ `status[]` when provided) via `appendReportParams` (`:480-496`, `:757`).
* Trigger: clicking a row in "Clientes atendidos este mês" → `openCompanyDetailModal()` (`component:1654-1659`) → `modal-company-carteira-detail` (`.html:425-431`) → `loadTasks` (`:163-167`) → `ActionLogService.getGame4uUserActionsForParticipationModal` (`action-log.service.ts:2436-2487`). Requires `delivery_title` + month + `loadTasksViaGameReports` (true for cached-delivery rows, `game4u-game-mapper.ts:2130`).
* Response → UI: task rows (title, `delivery_title`, `finished_at`, `dt_prazo`, status, points, `risco_multa`, `justificada`) mapped by `action-log.service.ts:1673-1723` into the modal task table; `total` drives its pagination slice (`modal-company-carteira-detail.component.ts:296-317`).
* Fallback: error → `{items: [], total: 0}` (`action-log.service.ts:2483-2486`).

### 3.8 `GET {backend_url_base}/game/actions`
* Issuer: `Game4uApiService.getGameActions` — `game4u-api.service.ts:1652-1664`; params `start`, `end`, `user`, optional `status` (`team_id` omitted for user-scoped calls, `:200-212`).
* Triggers (progress modal only, opened from the activity cards at `component:1703-1749`):
  * "Pontos" card → `getActivityList` without report statuses (`action-log.service.ts:3281-3295`).
  * "processos-pendentes" / "processos-finalizados" cards → `getProcessList` (`action-log.service.ts:3422-3442`).
* Response → UI: user actions mapped to the modal activity/process lists (`mapGame4uActionsToActivityList` / `mapGame4uActionsToProcessList`).
* Caching: dedupe key from `(user, start, end, status)` (`game4u-api.service.ts:255-257`).
* The dashboard page itself never calls `/game/actions` or `/game/stats` (comment at `component:360-364` verified — see #16 in §2).

### 3.9 `GET {backend_url_base}/auth/user`
* Issuer: `PlayerService.getCurrentPlayerData` — `player.service.ts:144`.
* Trigger: `loadPlayerData()` → `getPlayerStatus(playerId)` (`component:454`, `player.service.ts:174-186`); `refreshData()` clears the cache first (`component:1821`, `player.service.ts:263-266`).
* Response → UI: `PlayerMapper.toPlayerStatus` → `c4u-season-level` (name, team, season level, metadata) (`.html:18-38`). The same payload's `extra.companies`, `extra.client_goals`, `extra.entrega` build the initial KPI array (`numero-empresas`, `entregas-prazo`) in `KPIService.getPlayerKPIs` (`kpi.service.ts:106-186`) — normally read straight from `SessaoProvider.usuario` without a new request (`kpi.service.ts:79-86`).
* Caching: 15-min `shareReplay` + in-flight dedupe (`player.service.ts:25-26`, `:133-165`). 20 s client-side loading timeout in the component (`component:446-452`).
* Fallback: error → `isLoadingPlayer = false` and the session-name fallback header (`component:456-466`, `.html:29-38`).

### 3.10 `GET {backend_url_base}/player/{id}` (conditional)
* Issuer: `PlayerService.getRawPlayerData` — `player.service.ts:96-99`; only when `?playerId=` is present and differs from the session user (`component:267-285`, `player.service.ts:81-84`). 3-min cache (`:110-115`).

---

## 4. Non-Game4U (legacy) path — reachable only with empty `backend_url_base`

When `usesGame4uWalletFromStats()` is false the component takes these branches; **every** endpoint they need is an `aggregate` POST, so the UI renders zeros:

| Component trigger | Service call | Endpoint | Result |
|---|---|---|---|
| `loadPlayerData` else-branch `component:502-536` | `getPlayerPoints` (`player.service.ts:221-231`) + `getPontosForMonth` (`action-log.service.ts:2711-2722`) | `GET /auth/user` + `POST /v3/database/action_log/aggregate` | wallet from profile; `desbloqueados` = 0 (aggregate dead) |
| `loadSeasonProgressDetails` `component:603-614` | `getSeasonProgressSidebarDetails` → `getCompletedTasksCount` (`action-log.service.ts:1990-1992`) | `POST …/action_log/aggregate` | "Tarefas finalizadas" = 0 |
| `loadProgressData` `component:1427-1482` | `getProgressMetrics` (reportsOnly) → legacy `forkJoin` (`action-log.service.ts:3199-3208`) | `POST …/action_log/aggregate` ×3 | activity/process cards = 0, points ring target = null |
| `loadClientesAtendidosCountFromFinishedSummary` `component:1591-1612` | `getSeasonProgressSidebarDetails(playerId, month)` | `POST …/action_log/aggregate` | "Clientes atendidos este mês" counter = null |
| `loadParticipacaoFirstPageOrFallback` fallback `component:871-908` | `getPlayerCnpjListWithCount` legacy branch (`action-log.service.ts:3641-3667`) + `enrichCnpjListFull` | `POST …/action_log/aggregate`, `POST /database/empid_cnpj__c/aggregate` | empty client list |
| insights | not called (`component:1545-1550`) | — | panel hidden (`.html:285-286`) |

`getPlayerCnpjListWithCount` season branch (`action-log.service.ts:3620-3640`, `GET /game/actions` `status=DONE` + `status=DELIVERED`) needs `selectedMonth === undefined`, which requires the "Toda temporada" option — disabled on this page (`.html:174-178`, `showTodaTemporadaButton = false`).

---

## 5. Dead paths (verified)

### 5.1 Funifier `*/aggregate` hard-disabled client-side
* `BackendApiService.get` returns `of([])` when the endpoint contains `aggregate` — `backend-api.service.ts:87-91`; `post` likewise — `backend-api.service.ts:103-107`. This kills #12, #13, #14.
* `CnpjLookupService.fetchAllPaginatedCnpj` short-circuits any URL containing `/aggregate` — `cnpj-lookup.service.ts:102-105`. This kills #11, so `cnpjNameMap` / `cnpjStatusMap` / `cnpjNumberMap` stay empty and the list falls back to `delivery_title` / raw key (`component:2030-2039`, `component:2121-2123`).
* Consequences on this page: client rows have no "Ativa/Inativa" badge (`.html:348-354`), no CNPJ suffix (`component:2052-2072`), the carteira-detail modal shows no company KPI cards (`kpi.service.ts:226-243`) and no enriched company name (`modal-company-carteira-detail.component.ts:82`).

### 5.2 No-op service method
`PlayerService.getPlayerCompanyData` returns an empty map with **no HTTP** (`player.service.ts:248-252`), so `getPlayerCnpjResp` (`component:668`) always yields `[]`.

### 5.3 UI branches that cannot be reached from this page
| Dead branch | Evidence |
|---|---|
| "Carteira" list (`carteiraClientes`) incl. `enrichCnpjListFull` + `fetchGamificacaoMapsAsync` (`component:668-704`) | `cnpjRespIds` is always empty (§5.2) → `of([])` at `component:672-679`; the tabs that displayed it are commented out at `.html:320-336` |
| `companies` table + `modal-company-detail` (`GET`→`CompanyService.getCompanyDetails`) | `loadCompanyData()` sets `companies = []` (`component:644-648`); `c4u-company-table` / `onCompanySelected` do not appear in the template (grep of `gamification-dashboard.component.html`) |
| `modal-carteira` (`getPlayerCnpjListWithCount`, `enrichCompaniesWithKpis`, `getActionsByCnpj`) | `openCarteiraModal()` (`component:1770-1774`) has no caller in the template; only the `*ngIf="isCarteiraModalOpen"` host exists (`.html:434-439`) |
| Progress-modal "Carregar mais" → `getActivityListReportsPage` (`action-log.service.ts:3328`) | `useActivityReportsPagination` is initialised `false` (`modal-progress-list.component.ts:95`), reset to `false` on every load (`:463`) and never set to `true`; `loadMoreActivityReports()` returns early (`:597-607`) |
| Progress-modal daily-pending chart (`/game/reports/team/daily-pending-stats`) | `shouldUseDailyPendingStatsForChart` requires team scope (`modal-progress-list.component.ts:213`) and the page passes only `[playerId]` (`.html:415-422`) |
| `getActivitiesByProcess` (expand a process row) | `POST …/action_log/aggregate` `action-log.service.ts:4245` → disabled |

### 5.4 Sibling dashboard folders — reachability verdict
`pages/dashboard/dashboard-colaborador`, `dados-mes-atual`, `dados-mes-anterior`, `dados-metas-progresso-time`, `dados-produtividade-time` and `season/*` are declared/imported only by `DashboardModule` (`dashboard.module.ts:26-54`), which is imported **only** by `HomeModule` (`pages/home/home.module.ts:5,17`). `HomeModule` registers no route (`pages/home/home.module.ts:7-19`) and `PagesRoutes` has no `home` path (`pages/pages.routing.ts:5-52`). **Verdict: not reachable from `/dashboard` — dead code for this page.** Consequently `mes-atual.service.ts`, `mes-anterior.service.ts`, `goals-config.service.ts`, `temporada.service.ts` and `team-aggregate.service.ts` are **not** used by this page (only by those unreachable components / `cache-manager` / other dashboards — grep of `src/app`).
`company.service.ts` is used only by `modal-company-detail` (dead, §5.3). `company-kpi.service.ts`, `kpi.service.ts`, `action-log.service.ts`, `game4u-api.service.ts`, `player.service.ts`, `dashboard-insights.service.ts`, `campaign.service.ts` + `season-dates.service.ts` and `cnpj-lookup.service.ts` **are** used (constructor `component:243-258`).

---

## 6. "Cached endpoint first, legacy fallback" pairs

| Cached endpoint (preferred) | Legacy it replaced | Where the switch happens |
|---|---|---|
| `GET /game/reports/dashboard/cached` | `finished/summary` + `open/summary` + `goal/month/summary` | `action-log.service.ts:641-644` (doc), `:2868-2876` (doc), `getProgressMetrics` reportsOnly branch `:2929-2946`; `getMonthlyPointsGoalTarget` now reads the cache (`:1714-1731`) |
| `GET /game/reports/finished/deliveries/cached` | `GET /game/reports/finished/deliveries` (+ `/game/actions` for the season view) | `getPlayerFinishedDeliveriesParticipacaoPage` `action-log.service.ts:3789-3812` (no `team_id` → cached; with `team_id` → `finished/deliveries` page, not used here); `getPlayerCnpjListWithCount` `:3588-3606` |
| `dashboard/cached.month_on_time_delivery_pct` | average of `porcEntregas` from the gamificação hook | `component:1197-1235` (`syncEntregasPrazoKpiFromParticipacao`), `component:1256-1265`, `component:1889-1903` |
| `month_clients_served` (cache) | `getSeasonProgressSidebarDetails` → `finished/summary` count | `component:1538-1544`, `component:1591-1612` |

Fallback ladder for the client list: cached page → (legacy `getPlayerCnpjListWithCount`) → empty state + retry (`component:842-940`, `.html:394-403`).

---

## 7. Trigger → request matrix

| Trigger | Requests issued |
|---|---|
| `ngOnInit` / `route.queryParams` first emission (`component:287-312`) → `loadDashboardData` (`component:363`) | `clearAllCaches()` (`:367`); `GET /gamificacao` (prefetch `:372`); `GET /campaign` (`:374`, cached after first time); then `GET /auth/user` (`:454`), `GET /game/reports/dashboard/cached` (`:481` + `:1370`, deduped to 1), `GET /game/reports/finished/deliveries/cached` `offset=0&limit=30` (`:845`), `GET /gamificacao` reused from cache for `enrichFromParticipacaoRowKeys` (`:1111`). No insights request. |
| `?playerId=` change (`component:297-312`) | same set for the new id (plus `GET /player/{id}` if it is not the session user) |
| Month change via `c4u-seletor-mes` (`onMonthChange` `component:1489` → `loadMonthDependentData` `component:1513`) | cancels in-flight (`monthChange$`); `GET /gamificacao` (`:1536`); `GET /game/reports/dashboard/cached` for the new month (`:1538`); `GET /game/reports/finished/deliveries/cached` `offset=0` (`:1544` → `:845`); `GET /game/reports/user-actions` ×2 for insights (`:1546` → `:1569`) |
| KPI ring / card click | Activity cards open `modal-progress-list` (`component:1703-1749`): "atividades-finalizadas" → user-actions finished; "atividades-pendentes" → user-actions open; "pontos" → `GET /game/actions`; "processos-*" → `GET /game/actions`. The KPI circulars themselves are not clickable (`.html:243-254`). |
| Insights alert click (`component:1752-1765`) | opens the pending list → `GET /game/reports/user-actions` (open slice, usually served from cache) |
| Client row click (`component:1654-1659`) | `GET /game/reports/finished/actions-by-delivery`; plus the dead `empid_cnpj__c` / `cnpj_performance__c` aggregates |
| "Carregar mais" (`component:771`, `.html:380-392`) | `GET /game/reports/finished/deliveries/cached` with `offset = participacaoNextOffset`, `limit=30`; then `GET /gamificacao` (cache) for the merged rows |
| "Tentar carregar novamente" (`component:1632-1638`, `.html:396-402`) | `GET /game/reports/dashboard/cached` + `GET /game/reports/finished/deliveries/cached` (`offset=0`) |
| `refreshData()` (`component:1817-1823`) | clears player cache then re-runs the whole `loadDashboardData` set. **No template binding** — reachable only programmatically |
| Company row click in the legacy table / carteira modal / export | none — dead (§5.3). There is **no export action** on this page |
| `abrirModalFaq()` (`.html:65-73`) | none — `ModalSeasonFaqComponent` is static content (`component:1828-1830`) |
| Logout (`.html:186-195`) | handled by `SessaoProvider.logout()` (out of scope of this page's data loading) |

---

## 8. Caching / dedupe key reference

| Cache | Key | TTL / semantics | Source |
|---|---|---|---|
| `dashboard/cached` HTTP dedupe | `dashboard-cached|{email}|{month}` | `shareReplay refCount:true` while subscribed | `game4u-api.service.ts:861-870` |
| `dashboard/cached` service cache | `g4u_dashboard_cached_{email}_{YYYY-MM}` | `GAME4U_CACHE_DURATION` | `action-log.service.ts:655-675` |
| `finished/deliveries/cached` dedupe | `rpt-del-cached|{email}|{team}|{month}|{offset}|{limit}` | in-flight sharing | `game4u-api.service.ts:547-551` |
| user-actions insights | `insights-ua-open|…`, `insights-ua-finished|…`, `insights-ua|{team}|{email}|{YYYY-MM}` | `shareReplay(1)` + service TTL | `action-log.service.ts:1607-1613`, `:1637-1645` |
| gamificação snapshot | single slot, timestamped | `CACHE_DURATION` (~10 min), `refCount:false` | `company-kpi.service.ts:531-551` |
| `/auth/user` | `me` | 15 min + in-flight dedupe | `player.service.ts:25-26,133-165` |
| campaign / season bounds | single slot | until `clearCache()`; season bounds survive `clearAllCaches()` | `campaign.service.ts:38-58`, `season-dates.service.ts:67-79` |
| KPI list | `{playerId}_{year}-{month}` | 3 min | `kpi.service.ts:100-104` |
| participação KPI merge generation | `participacaoKpiLoadGen` / `dashboardInsightsLoadGen` | drops stale async merges on month change | `component:166,201,1113-1115,1573-1575` |
| month-scoped cancellation | `monthChange$` | `takeUntil` on every month-dependent request | `component:52,1515` |
