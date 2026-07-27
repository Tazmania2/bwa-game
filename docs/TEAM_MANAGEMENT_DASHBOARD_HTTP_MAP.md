# Team Management Dashboard (`/dashboard/team-management`) — HTTP Endpoint Map

Evidence-based trace of every HTTP request the page can issue. Every claim is cited with `file:line`.
`*.spec.ts` files ignored.

Entry point: `src/app/pages/dashboard/team-management-dashboard/team-management-dashboard.component.ts` (244 KB)
Route + declarations: `src/app/pages/dashboard/team-management-dashboard/team-management-dashboard.module.ts:39-55`

---

## 1. Base URLs

| Token | Resolution | Evidence |
|---|---|---|
| `environment.backend_url_base` (a.k.a. "Game4U / BWA API") | `G4U_API_BASE` → `BACKEND_URL_BASE` env at build time | `src/environments/environment.ts:20`, `src/environments/backend-url.ts:30-40` |
| `environment.gamificacaoApiUrl` | `GAMIFICACAO_API_URL`, default `https://hook.bwa.global:3334/gamificacao` | `src/environments/environment.ts:104-106` |
| Supabase (PostgREST) | **Not reachable from this page.** `supabaseUrl` is hardcoded to `''` and the Supabase game fallback only activates when `backend_url_base` is empty **and** `GAME4U_SUPABASE_FALLBACK=true` | `src/environments/environment.ts:47`, `src/environments/environment.ts:129-133`, `game4u-api.service.ts:162-168` |
| Funifier (`/database/*/aggregate`) | **Dead** — every aggregate call is short-circuited client-side (see §6) | `backend-api.service.ts:88-91`, `backend-api.service.ts:105-108`, `cnpj-lookup.service.ts:100-103` |

All requests to `backend_url_base` get `Authorization: Bearer <session token>` + `client_id` from `AuthInterceptor`
(`src/app/providers/auth.interceptor.ts:63-77`, `:104-140`).
`Game4uApiService` additionally sets a `client_id` header itself (`game4u-api.service.ts:1602-1605`).
Every `GET /game/reports/**` is auto-retried once on a Snowflake-unavailable 503 by `GameReportsInterceptor`
(`src/app/providers/game-reports.interceptor.ts:25-46`).

Global gate for all `/game/*` traffic: `isGame4uDataEnabled() && Game4uApiService.isConfigured()`
(`src/app/model/game4u-api.model.ts:1848-1858`, `game4u-api.service.ts:153-155`).
The component's own switch for the same condition is `PlayerService.usesGame4uWalletFromStats()`
(`player.service.ts:41-43`).

---

## 2. Endpoint inventory (live requests)

| # | Method + path | Base | Issuing service:line |
|---|---|---|---|
| 1 | `GET /team` | backend_url_base | `bwa-team-api.service.ts:86` |
| 2 | `GET /team/{teamId}` | backend_url_base | `bwa-team-api.service.ts:129` |
| 3 | `GET /team/{teamId}/users` | backend_url_base | `bwa-team-api.service.ts:172` |
| 4 | `GET /campaign` | backend_url_base | `campaign.service.ts:75-78` |
| 5 | `GET /auth/user` | backend_url_base | `player.service.ts:181` |
| 6 | `GET /player/{playerId}` | backend_url_base | `backend-api.service.ts:97` via component `:6575` |
| 7 | `PUT /player/{playerId}` | backend_url_base | `backend-api.service.ts:135` via component `:6589` |
| 8 | `GET /game/reports/dashboard/cached` | backend_url_base | `game4u-api.service.ts:864-871` |
| 9 | `GET /game/reports/supervision/dashboard/cached` | backend_url_base | `game4u-api.service.ts:900-907` |
| 10 | `GET /game/reports/management/dashboard/cached/overview` | backend_url_base | `game4u-api.service.ts:1014-1021` |
| 11 | `GET /game/reports/management/dashboard/cached/list` | backend_url_base | `game4u-api.service.ts:975-982` |
| 12 | `GET /game/reports/finished/deliveries/cached` | backend_url_base | `game4u-api.service.ts:594-598` |
| 13 | `GET /game/reports/management/finished/deliveries/cached` | backend_url_base | `game4u-api.service.ts:652-656` |
| 14 | `GET /game/reports/finished/deliveries` (non-paged) | backend_url_base | `game4u-api.service.ts:691-695` |
| 15 | `GET /game/reports/finished/deliveries` (paged) | backend_url_base | `game4u-api.service.ts:726-730` |
| 16 | `GET /game/reports/user-actions` | backend_url_base | `game4u-api.service.ts:834-838` |
| 17 | `GET /game/reports/team/daily-finished-stats` | backend_url_base | `game4u-api.service.ts:1558-1564` |
| 18 | `GET /game/reports/team/daily-pending-stats` | backend_url_base | `game4u-api.service.ts:1592-1598` |
| 19 | `GET /game/reports/organization/hierarchy-report` | backend_url_base | `game4u-api.service.ts:1064-1071` |
| 20 | `GET /game/reports/finished/summary` | backend_url_base | `game4u-api.service.ts:516-519` |
| 21 | `GET /game/reports/open/summary` | backend_url_base | `game4u-api.service.ts:540-543` |
| 22 | `GET /game/stats` | backend_url_base | `game4u-api.service.ts:1633-1636` |
| 23 | `GET /game/actions` | backend_url_base | `game4u-api.service.ts:1661-1664` |
| 24 | `GET /game/team-stats` | backend_url_base | `game4u-api.service.ts:1708-1711` |
| 25 | `GET /game/team-actions` | backend_url_base | `game4u-api.service.ts:1738-1741` |
| 26 | `GET {gamificacaoApiUrl}` | gamificacaoApiUrl | `company-kpi.service.ts:540` |

Endpoints 20–25 are **legacy/fallback only** — they are reachable from this page only when
`usesGame4uWalletFromStats()` is false, i.e. when `backend_url_base` is unset (in which case they cannot be
called either) or `GAME4U_USE_API=false`. See §5.

---

## 3. Detail per endpoint

### 1. `GET {backend_url_base}/team`
* **Service** `BwaTeamApiService.fetchTeamList()` — `bwa-team-api.service.ts:70-101` (HTTP at `:86`)
* **Params / body** none.
* **Trigger** `ngOnInit` → `bootstrapDashboard` → `initializeDashboard` → `loadAvailableTeams`
  (`component:533-535`, `:539-545`, `:617-623`, `:1327`). Called on all three role branches:
  ADMIN `component:1349`, GESTOR `component:1354`, other `component:1390`.
* **Returns** array of BWA teams (`_id|id`, `name`, optional numeric `game4u_team_id`), normalized by
  `normalizeTeamListResponse` (accepts bare array or `{data:[…]}`) — `bwa-team-api.service.ts:31-45`.
* **UI** team dropdown `<c4u-team-selector>` (`component.html`), and the source of `selectedTeamId` /
  `game4uTeamId` used as `team_id` in every `/game/reports/*` call (`component:1249-1260`, `:816-843`).
* **Caching** 15-min in-memory cache + single-flight promise; **errors are swallowed** and an empty array is
  cached (`bwa-team-api.service.ts:17-21`, `:72-79`, `:90-97`).

### 2. `GET {backend_url_base}/team/{teamId}`
* **Service** `BwaTeamApiService.fetchTeamDetail(teamId)` — `bwa-team-api.service.ts:106-147` (HTTP at `:129`)
* **Params** path `teamId` (URL-encoded). No query.
* **Trigger** `loadAvailableTeams`:
  * GESTOR fallback when `GET /team` returned empty — one request **per accessible team id**, in parallel
    (`component:1376`).
  * Non-ADMIN/non-GESTOR — one request for the resolved team id (`component:1403`).
  * ADMIN never calls it (`component:1347-1351`).
* **Returns** single team payload; stored in `this.teamDetailApiResponse` and mined for the numeric Game4U team id
  (`component:1405-1409` → `getGame4uTeamHttpParam` `component:816-843`, `pickGame4uNumericTeamIdFromRaw` `:790-812`).
* **UI** indirect — supplies `team` query param for `/game/team-stats` / `/game/team-actions`.
* **Caching** per-id 15-min cache + per-id single-flight; failures cache `null` (`bwa-team-api.service.ts:22-23`, `:139-142`).

### 3. `GET {backend_url_base}/team/{teamId}/users`
* **Service** `BwaTeamApiService.fetchTeamUsers(teamId)` — `bwa-team-api.service.ts:152-190` (HTTP at `:172`)
* **Params** path `teamId`. No query.
* **Trigger** `loadCollaborators()` — `component:2469`. Reached from `loadTeamData` (`component:1859`) and
  `loadCollaboratorData` (`component:1909`), i.e. on initial load, team change, collaborator change, month change,
  and refresh.
* **Returns** team members. Normalizer accepts array / `{data}` / `{users}` (`bwa-team-api.service.ts:47-64`).
  Rows with a non-empty `deactivated_at` are dropped, list is sorted by name (`component:2431-2453`).
* **UI** `<c4u-collaborator-selector>` dropdown; also `progressModalTeamIds` / cell filtering in the productivity tab
  (`component:3216-3222`).
* **Caching** per-id 15-min cache + single-flight; failures cache `[]` (`bwa-team-api.service.ts:161-170`, `:180-185`).
* **Fallbacks when the list is empty** (`component:2475-2496`): `player_status` aggregate data already in memory →
  `TeamAggregateService.getTeamMembers()` (dead, §6) → plain `teamMemberIds`.

### 4. `GET {backend_url_base}/campaign`
* **Service** `CampaignService.fetchCurrentCampaign()` — `campaign.service.ts:60-86` (HTTP at `:75-78`)
* **Params** none. Headers `Content-Type: application/json` + `client_id` (`campaign.service.ts:70-73`).
* **Trigger** two independent paths:
  * `loadSeasonDates()` → `SeasonDatesService.getSeasonDates()` (`component:675`, `season-dates.service.ts:69-83`,
    `:22-29`), awaited in parallel with `loadAvailableTeams` at `component:623`.
  * `Game4uApiService` constructor prefetch: `void this.seasonDates.getSeasonDates()` (`game4u-api.service.ts:150`).
  * `<c4u-seletor-mes>` `ngOnInit` → `initializeMonths` (`c4u-seletor-mes.component.ts:56-57`, `:76`).
* **Returns** `Campaign[]` (or `{data:[…]}`); active campaign selected by `starts_at`/`finishes_at`
  (`campaign.service.ts:98-131`).
* **UI** month selector range (`c4u-seletor-mes.component.ts:77-105`) and the `start`/`end` ISO range for
  "toda temporada" queries (`game4u-api.service.ts:301-314`, `:336-346`).
* **Caching / fallback** module-level `currentCampaign` + `loadPromise` single-flight (`campaign.service.ts:40-58`);
  on any error a synthetic Jan 1 → Dec 31 campaign is returned (`campaign.service.ts:83-85`, `:133-147`).
  `SeasonDatesService` additionally memoizes the bounds (`season-dates.service.ts:70-82`).

### 5. `GET {backend_url_base}/auth/user`
* **Service** `PlayerService.getCurrentPlayerData()` — `player.service.ts:162-207` (HTTP at `:181`)
* **Params** none (Bearer token identifies the user).
* **Trigger** `loadTeamKPIs()` → `KPIService.getPlayerKPIs()` → `profileForKpiFromSessionOrApi()`
  (`component:6121` / `:6132`, `kpi.service.ts:115`, `kpi.service.ts:81-87`).
  **Only fires when the session user object has no `extra`** — otherwise the cached session object is used
  (`kpi.service.ts:82-85`).
* **Returns** the authenticated user's profile; `extra.companies`, `extra.client_goals`, `extra.entrega` are read.
* **UI** KPI cards `Clientes na Carteira` and `Entregas no Prazo` (`kpi.service.ts:118-165`) rendered through
  `<c4u-kpi-circular-progress>`.
* **Caching** 15-min observable cache keyed `'me'` + `inFlightCurrentPlayer$` dedupe, 15 s timeout
  (`player.service.ts:26-32`, `:138-146`, `:180-183`). `KPIService` layers its own cache keyed
  `playerId + month + team scope` (`kpi.service.ts:106-113`).

### 6/7. `GET` + `PUT {backend_url_base}/player/{playerId}`
* **Service** `BackendApiService.get` / `.put` (`backend-api.service.ts:86-100`, `:124-142`), called directly from
  `updatePlayerClientesTarget` (`component:6570-6597`).
* **Body (PUT)** `{ extra: { ...currentExtra, client_goals: <number> } }` (`component:6580-6586`).
* **Trigger** "save meta de clientes" action → `saveClientesMeta` → one GET+PUT pair **per collaborator**
  (all collaborators in parallel when `selectedCollaborator === 'all'`, `component:6516-6535`).
* **Returns** player payload / update ack.
* **UI** toast + `metaSaveMessage`; the new `client_goals` becomes the `target` of the
  `Clientes na Carteira` KPI on the next `getPlayerKPIs` (`kpi.service.ts:128-138`).
* **Caching / retry** no cache; `BackendApiService` retries GET 2× and PUT 3× with 1 s delay
  (`backend-api.service.ts:99`, `:140`). Failure throws a wrapped error (`component:6592-6595`).

### 8. `GET /game/reports/dashboard/cached`
* **Service** `Game4uApiService.getGameReportsDashboardCached` (`game4u-api.service.ts:845-876`) ←
  `ActionLogService.fetchPlayerDashboardCached` (`action-log.service.ts:645-676`, request at `:665`)
* **Query** `email` (required), `month` = `YYYY-MM` (required) — `game4u-api.service.ts:872-873`.
  `month` derived from `selectedMonth`, defaulting to the current month for "toda temporada"
  (`action-log.service.ts:626-640`).
* **Triggers (collaborator scope only)**
  * `getGamificationDashboardCachedBundle` → `loadCollaboratorSidebarData` (`component:2052`) — fires when a
    collaborator is selected, and again on month change / refresh.
  * `getPlayerDashboardMonthClientsServedCount` → `loadParticipacaoClientesList` (`component:3672`)
    (`action-log.service.ts:1754-1758`).
  * `getProgressMetrics(..., {gamificationDashboardReportsOnly:true})` → `loadCollaboratorGoalsData`
    (`component:2549`) and the non-Game4U branch of `loadCollaboratorSidebarData` (`component:2083`)
    (`action-log.service.ts:2925-2946`).
* **Returns** `month_pending_tasks_count`, `month_finished_tasks_count`, `month_points_done_delivered`,
  `month_goal_points`, `month_clients_served`, `season_points_total`, `season_tasks_finished_total`,
  `season_clients_total`, `month_on_time_delivery_pct`, `refreshed_at`, `params`, `refresh_error`
  (mapped at `action-log.service.ts:1402-1443`, `:1446-1476`).
* **UI** `<c4u-activity-progress>` cards, `<c4u-monthly-points-goal-progress>` circle,
  `<c4u-point-wallet>`, `<c4u-season-progress>`, "Clientes atendidos este mês" counter, and the
  `entregas-prazo` KPI value (`component:6152-6166`, `:2225-2246`).
* **Caching** 404 → `null` (month not cached yet) `action-log.service.ts:666-671`; `shareReplay` windowed by
  `GAME4U_CACHE_DURATION` + per-`email|month` cache map (`action-log.service.ts:673-675`);
  service-level dedupe key `dashboard-cached|{email}|{month}` (`game4u-api.service.ts:862`).

### 9. `GET /game/reports/supervision/dashboard/cached`
* **Service** `Game4uApiService.getGameReportsSupervisionDashboardCached` (`game4u-api.service.ts:877-912`) ←
  `ActionLogService.fetchSupervisionTeamDashboardCached` (`action-log.service.ts:683-715`, request at `:704`)
* **Query** `team_id` (required), `month` = `YYYY-MM` (required) — `game4u-api.service.ts:898-899`.
  `team_id` = `getGame4uTeamScopeId()` (the selected BWA team id; `undefined` for the management panel)
  (`component:746-752`, `:2242`).
* **Triggers** (team-aggregate scope, no collaborator selected)
  * `loadTeamDashboardFromCache` → `loadTeamSupervisionFromCache` (`component:2186-2193`, `:2258`), invoked from
    `loadTeamData` at `component:1841`. Fires on initial load, team change, month change, collaborator reset, refresh.
  * `getProgressMetrics({game4uTeamAggregate})` → `loadTeamActivityAndMacroData` (`component:1853` → `:3535-3567`,
    `action-log.service.ts:2899-2918`) — legacy branch only.
* **Returns** same shape as #8 plus `team_id`, `team_name`, `players_count`
  (`action-log.service.ts:722-755`).
* **UI** identical consumers to #8 but for the whole team; also `teamDashboardRefreshedAt` /
  `teamDashboardCachedParams` freshness badge (`component:2265-2272`).
* **Caching** 404 → `null` and sets `teamSupervisionCacheMissing` (`action-log.service.ts:705-710`,
  `component:2261-2269`); windowed `shareReplay` + `g4u_supervision_cached_{tid}_{month}` cache
  (`action-log.service.ts:712-714`); dedupe key `supervision-cached|{teamId}|{month}` (`game4u-api.service.ts:898`).

### 10. `GET /game/reports/management/dashboard/cached/overview`
* **Service** `Game4uApiService.getGameReportsManagementDashboardCachedOverview` (`game4u-api.service.ts:985-1024`) ←
  `ActionLogService.fetchManagementDashboardCachedOverview` (`action-log.service.ts:766-806`, request at `:789`)
* **Query** `month` (required), optional `user_id`, optional `role` (`GERENTE|DIRETOR|C_LEVEL`) —
  `game4u-api.service.ts:1008-1013`. `user_id` is only sent in ADMIN preview mode
  (`getManagementDashboardApiUserId`, `component:1157-1163`).
* **Triggers** (only when the synthetic "Painel do Gerente / Diretor / C-Level" team is selected)
  * `getManagementDashboardCachedBundle` → `loadManagementOverviewFromCache` (`component:2197-2238`, call at `:2212`),
    entered from `loadTeamDashboardFromCache` (`component:2186-2189`) and `loadManagementOverviewData`
    (`component:5265`).
  * `loadProductivityDataBySupervisoes` (`component:3155-3161`) to enumerate the supervision teams.
  * `getProgressMetrics` management branch (`action-log.service.ts:2869-2892`).
* **Returns** `{ manager: ManagerDashboardCached, teams: [{team_id, team_name}, …] }`; mapped to the same bundle shape
  (`action-log.service.ts:1377-1400`).
* **UI** sidebar/progress cards, monthly points goal circle, `entregas-prazo` KPI, and the supervision list used to
  build the productivity chart series.
* **Caching** 404 → `null` (`action-log.service.ts:790-795`); windowed `shareReplay` +
  `g4u_management_overview_{month}_{uid}_{role}` (`action-log.service.ts:798-800`); dedupe key
  `management-overview|{month}|{uid}|{role}` (`game4u-api.service.ts:1005`).

### 11. `GET /game/reports/management/dashboard/cached/list`
* **Service** `Game4uApiService.getGameReportsManagementDashboardCachedList` (`game4u-api.service.ts:948-984`) ←
  `ActionLogService.fetchManagementDashboardCachedListDirect` (`action-log.service.ts:1314-1331`, request at `:1320`)
* **Query** `month` (required), optional `role`, optional `user_id` (`game4u-api.service.ts:967-974`).
* **Triggers**
  * ADMIN preview of a management panel: `fetchManagementDashboardCachedListForAdminPreview` →
    `loadManagementPreviewManagers` (`component:1251`, `action-log.service.ts:1283-1312`). Fires on team change to a
    management panel and on `onManagementUserChange` (`component:1299-1313`).
    **Retry behaviour:** first request with `role`; if the filtered result is empty it re-requests **without** `role`
    and filters client-side (`action-log.service.ts:1296-1305`).
  * Productivity tab, C_LEVEL/DIRETOR segmentation: `fetchManagementDashboardCachedList(month, 'GERENTE')`
    (`component:3079`).
  * Executive insights, C_LEVEL directorate ranking: `fetchManagementDashboardCachedList(month, 'DIRETOR')`
    (`component:4773`).
* **Returns** managers list; normalizer accepts array / `{managers|items|data}`
  (`action-log.service.ts:1333-1345`).
* **UI** ADMIN "preview manager" dropdown (`component:1244-1285`), one chart series per gerência in the
  productivity tab (`component:3113-3128`), and the "Diretorias em destaque / atenção" panel in
  `<c4u-dashboard-insights>` (`component:4769-4788`).
* **Caching** 404 → `[]` (`action-log.service.ts:1325-1330`). `fetchManagementDashboardCachedList` caches
  (windowed `shareReplay`, key `g4u_management_list_{month}_{role}`, errors cached as `[]`)
  `action-log.service.ts:1258-1275`; the **admin-preview variant deliberately does not cache**
  (`action-log.service.ts:1279-1282`). Service dedupe key `management-list|{month}|{role}|{uid}`
  (`game4u-api.service.ts:969`).
* **Fallback** empty list → org-chart derivation via endpoint #19 (`component:1256-1259`, `:1201-1252`).

### 12. `GET /game/reports/finished/deliveries/cached`
* **Service** `Game4uApiService.getGameReportsFinishedDeliveriesCached` (`game4u-api.service.ts:557-608`, request at `:594`)
* **Query** `month` (required `YYYY-MM`), `offset`, `limit` (clamped `1..500`), plus **either** `email` **or**
  `team_id` (`game4u-api.service.ts:585-593`).
* **Triggers**
  | Caller | Scope | Params | Component trigger |
  |---|---|---|---|
  | `TeamAggregateService.getTeamFinishedDeliveriesParticipacaoPage` `team-aggregate.service.ts:1114-1155` (req `:1131`) | `team_id` | `offset=0, limit=30` | team view "Clientes atendidos" list — `component:3748` |
  | same, `offset=nextOffset` | `team_id` | `limit=30` | "Carregar mais" button — `component:4009-4014` |
  | `TeamAggregateService.getTeamFinishedDeliveriesParticipacaoAllPages` `team-aggregate.service.ts:1160-1204` | `team_id` | `limit=200`, paged | CSV export click — `component:4163-4166` |
  | `ActionLogService.getPlayerFinishedDeliveriesParticipacaoPage` `action-log.service.ts:3766-3831` (req `:3787`) | `email` | `offset=0, limit=30` | collaborator drill-down — `component:3799` |
  | same | `email` | `offset=nextOffset` | "Carregar mais" — `component:3993-3998` |
  | `getPlayerFinishedDeliveriesParticipacaoAllPages` `action-log.service.ts:3895-3986` | `email` | `limit=200`, paged | CSV export — `component:4154-4157` |
  | `ActionLogService.getExecutiveDeliveriesAllPages` `action-log.service.ts:3994-4074` (req `:4031`/`:4038`) | `team_id` or `email` | `limit=100`, paged | executive insights — `component:4536` |
  | `getPlayerCnpjListWithCount` (no `team_id`) `action-log.service.ts:3599-3607` | `email` | `offset=0, limit=500` | legacy participação path — `component:3848` |
  | `getTeamCnpjListWithCount` (with scope id) `team-aggregate.service.ts:1002-1009` | `team_id` | `offset=0, limit=500` | legacy participação path — `component:3842` |
* **Returns** `{offset, limit, total?, has_more?, items:[…]}` where each item carries `user_email`,
  `delivery_title`, `delivery_id`, `tasks_total`, `tasks_on_time`, `on_time_pct`, `extra.cnpj`, justification flags
  (normalized by `normalizeGameReportsFinishedDeliveriesCachedPagePayload`, `game4u-api.service.ts:599`).
* **UI** "Clientes atendidos este mês" table (`teamCarteiraClientes`), the `%` no prazo column, the
  `entregas-prazo` KPI average fallback (`component:6248+`), the exported CSV rows
  (`component:4177-4190`), and the executive insights panel (top processes / top performers / month health,
  `component:4552-4586`).
* **Pagination bookkeeping** `hasMoreFinishedDeliveriesCachedPage(received, limit, nextOffset, total, has_more)`
  drives `participacaoHasMore` (`component:3716-3722`, `:3757-3763`, `:4038-4046`); `MAX_DELIVERIES_CACHED_PAGES = 100`
  guards runaway loops (`action-log.service.ts:3833`, `team-aggregate.service.ts:98`).
* **Caching / fallback** 404 → empty page `{offset, limit, items:[]}` (`game4u-api.service.ts:600-606`);
  dedupe key `rpt-del-cached|{email}|{team_id}|{month}|{offset}|{limit}` (`game4u-api.service.ts:547-551`);
  errors mapped to empty page in every caller (e.g. `action-log.service.ts:3823-3826`).

### 13. `GET /game/reports/management/finished/deliveries/cached`
* **Service** `Game4uApiService.getGameReportsManagementFinishedDeliveriesCached` (`game4u-api.service.ts:616-669`,
  request at `:652`)
* **Query** `month` (required), `offset`, `limit` (`1..500`), optional `user_id`, optional `role`.
  **No `email`/`team_id`** — scope comes from the JWT (`game4u-api.service.ts:643-651`, doc `:610-614`).
* **Triggers** management panel only:
  * `getManagementFinishedDeliveriesParticipacaoPage(month, 0, 30, userId)` → `loadParticipacaoClientesList`
    (`component:3702-3709`, `action-log.service.ts:3846-3891`, request `:3862`).
  * same with `offset=participacaoNextOffset` → "Carregar mais" (`component:4000-4006`).
  * `getExecutiveDeliveriesAllPages({isManagement:true}, month, 100)` → executive insights (`component:4536`) and
    CSV export with `pageSize=200` (`component:4146`), request at `action-log.service.ts:4023`.
* **Returns / UI / pagination** identical to #12.
* **Caching / fallback** 404 → empty page (`game4u-api.service.ts:660-666`); dedupe key
  `rpt-mgmt-del-cached|{uid}|{role}|{month}|{offset}|{limit}` (`game4u-api.service.ts:641`).

### 14/15. `GET /game/reports/finished/deliveries`
* **Service** `getGameReportsFinishedDeliveries` (`game4u-api.service.ts:672-698`) and
  `getGameReportsFinishedDeliveriesPage` (`game4u-api.service.ts:704-733`).
* **Query** `finished_at_start` + `finished_at_end` (both mandatory — `assertFinishedAtRange`
  `game4u-api.service.ts:470-478`), `email` and/or `team_id`, repeated `status`, plus `offset`/`limit` on the paged
  variant (`game4u-api.service.ts:722-725`).
* **Triggers** only when a **collaborator email is combined with a `team_id`**:
  * non-paged: `getPlayerCnpjListWithCount` when `teamId` is present (`action-log.service.ts:3593-3598`) —
    legacy participação path `component:3848`.
  * paged: `getPlayerFinishedDeliveriesParticipacaoPage` when `teamId` is present
    (`action-log.service.ts:3813-3822`).
* **Returns** delivery rows with `delivery_title` / `delivery_id` (`EmpID-YYYY-MM-DD`).
* **UI** same "Clientes atendidos" list as #12.
* **Caching** dedupe key `rpt-del|…` for the non-paged variant; **the paged variant is intentionally not deduped**
  (`game4u-api.service.ts:702-703`).

### 16. `GET /game/reports/user-actions`
* **Service** `Game4uApiService.getGameReportsUserActions` (`game4u-api.service.ts:771-841`, request at `:834`)
* **Query** `email` and/or `team_id`, repeated `status[]`, and **exactly one** date pair —
  `finished_at_start/end`, `dt_prazo_start/end`, or `created_at_start/end`; incomplete or multiple pairs throw
  before any HTTP (`game4u-api.service.ts:791-826`).
* **Triggers** — always **two** requests per scope (open + finished), via
  `ActionLogService.fetchTeamUserActionsForInsightsSlice` (`action-log.service.ts:1627-1683`) →
  `fetchGameReportsUserActionsAllPages` (`action-log.service.ts:1531-1541`, request `:1534`):
  * open slice: `status=PENDING&status=DOING` + `dt_prazo_start/end` = first/last day of the month
    (`action-log.service.ts:1655-1660`, range at `game4u-api.service.ts:368-376`).
  * finished slice: `status=DONE&status=DELIVERED` + `finished_at_start/end` = month range
    (`action-log.service.ts:1661-1666`).
  Entry points:
  * `loadExecutiveScopeUserActions` → `loadExecutiveInsights` (`component:4700-4726`, `:4480-4541`) — one pair per
    team id in scope, or a single pair keyed by `email` when a collaborator is selected.
  * `warmProgressModalUserActionsCache` (prefetch, errors ignored) — `component:1876` / `:1927` → `:4688-4698`, `action-log.service.ts:1572-1593`.
  * `loadExecutiveTeamRankings` — one pair per team (`component:4816`).
  * Progress modal lists (`getActivityList` / `getActivityListReportsPage`) reuse the same cached observables
    (`action-log.service.ts:3379-3399`).
* **Returns** `{items: Game4uUserActionModel[]}` — `status`, `points`, `user_email`, `delivery_title`,
  `delivery_id`, `finished_at`, `extra.dt_prazo`, `risco_multa`, justification flags.
* **UI** `<c4u-dashboard-insights>` (alerts, weekday distribution, pending/finished counts —
  `dashboard-insights.service.ts` `buildDashboardInsightsSnapshotFromUserActions`, `component:4550-4553`),
  the executive top-processes / top-performers / attention rankings (`component:4556-4586`), and the
  `<modal-progress-list>` activity lists.
* **Caching** per-slice `shareReplay(1)` under `insights-ua-{slice}|{tid}|{email}|{month}`, plus a combined
  `insights-ua|…` entry (`action-log.service.ts:1608-1623`, `:1640-1650`); errors → `[]`
  (`action-log.service.ts:1535-1538`). No `offset`/`limit` is sent — pagination is client-side only
  (`action-log.service.ts:1528-1530`).

### 17. `GET /game/reports/team/daily-finished-stats`
* **Service** `Game4uApiService.getGameReportsTeamDailyFinishedStats` (`game4u-api.service.ts:1542-1567`,
  request at `:1558`) ← `ActionLogService.getReportTeamDailyFinishedStats`
  (`action-log.service.ts:2141-2181`, request at `:2168`)
* **Query** built by `appendTeamDailyFinishedStatsParams` (`game4u-api.service.ts:431-458`):
  `start`, `end` (ISO 8601, required), `team_id`, optional `email`, optional repeated `status[]`,
  optional `offset`, optional `limit` (clamped ≤ 500), optional `role`, optional `user_id`.
  `team_id=__management_overview__` is used for the management panel (`component:779-784`,
  `toManagementOverviewApiTeamId`).
* **Triggers** — **productivity tab only** (`activeTab === 'productivity'`):
  * tab click `switchTab('productivity')` → `loadProductivityData` (`component:5466-5474`, `:3290-3337`).
  * period-selector change → `onPeriodChange` (`component:5446-5459`) — `<c4u-time-period-selector>`.
  * month change while the tab is open (`component:1865`, `:1915`, `:5432-5440`).
  * `retryProductivityData` (`component:5667+`).
  Four segmentation modes (`resolveProductivitySegmentationMode`, `component:2816-2826`):
  | Mode | Calls | Site |
  |---|---|---|
  | `gerencias` (C_LEVEL/DIRETOR) | 1 per team of each GERENTE from #11 | `component:3124` |
  | `supervisoes` (GERENTE) | 1 per supervision team from #10 | `component:3186` |
  | `jogadores` / `celula` | 1 request for the selected team | `component:3202` |
  | collaborator selected | 1 request with `email=collaboratorId` | `component:2661-2668` |
* **Returns** either the nested `{stats:[{date, users:[{email,total_actions,total_points}]}]}` shape or a flat row
  array; both normalized to `{day, email?, tasksCount, pointsSum}`
  (`action-log.service.ts:2232-2242`, nested `:2245-2306`, flat `:2308+`).
* **UI** `<c4u-productivity-analysis-tab>` line charts (activities/day, points/day) and the by-collaborator bar
  charts + tables (`component:2668-2725`, `:2933-3023`, `:3334-3420`, `:3480+`).
* **Caching / fallback** empty `team_id` → `of([])` without HTTP (`action-log.service.ts:2151-2154`);
  windowed `shareReplay` keyed by every query param (`action-log.service.ts:2160-2166`, `:2179`);
  errors → `[]` (`action-log.service.ts:2170-2173`); service dedupe key `rpt-team-daily|…`
  (`game4u-api.service.ts:401-405`). The date range is normalized to whole days so tab toggling hits the cache
  (`component:5481-5486`). Fallbacks: gerência/supervisão segmentation with no data falls back to a single
  `team_id=__management_overview__` request (`component:3089-3095`, `:3133-3140`, `:3161-3166`, `:3196-3202`).

### 18. `GET /game/reports/team/daily-pending-stats`
* **Service** `Game4uApiService.getGameReportsTeamDailyPendingStats` (`game4u-api.service.ts:1576-1601`,
  request at `:1592`) ← `ActionLogService.getReportTeamDailyPendingStats` (`action-log.service.ts:2190-2224`,
  request at `:2214`)
* **Query** `start`, `end` (`YYYY-MM-DD` for the whole selected month — `modal-progress-list.component.ts:811-820`),
  `team_id`, optional `email`, optional repeated `status[]` (default `PENDING`+`DOING` server-side),
  optional `role` (`game4u-api.service.ts:415-429`).
* **Trigger** `<modal-progress-list>` opened as `atividades-pendentes` **and** the page passes
  `useDailyPendingStatsApi=true` — which the page sets for SUPERVISOR / LIDER_CELULA
  (`component:5891-5893`, `component.html:1307`); modal gate at `modal-progress-list.component.ts:803-809`,
  fetch at `:828-861` (one request per team scope id).
* **Returns** same row shape as #17 (same normalizer, `action-log.service.ts:2213`).
* **UI** the day-of-month bar chart inside the pending-tasks modal (`modal-progress-list.component.ts:864+`).
* **Caching** empty `team_id` → `of([])`; windowed `shareReplay` keyed
  `g4u_team_daily_pending_{tid}_{email}_{start}_{end}_{status}`; errors → `[]`
  (`action-log.service.ts:2200-2222`).

### 19. `GET /game/reports/organization/hierarchy-report`
* **Service** `Game4uApiService.getGameReportsOrganizationHierarchyReport` (`game4u-api.service.ts:1027-1075`,
  request at `:1064`) ← `ActionLogService.fetchOrganizationHierarchyReport`
  (`action-log.service.ts:811-853`, request at `:838`)
* **Query** `month` (required), `depth` (defaults to `7` from the caller — `action-log.service.ts:819`),
  optional `simulation_pot_brl`, optional `node_type`, optional `node_id` (`game4u-api.service.ts:1051-1063`).
* **Trigger** ADMIN management-panel preview **fallback only**: `loadManagementPreviewManagersFromOrgChart`
  (`component:1201-1252`, call at `:1209`), reached when #11 returned no managers (`component:1256-1259`).
* **Returns** `{root: <hierarchy tree>}`; nodes of the role's type are collected by
  `collectOrgHierarchyNodesByType` and turned into `Collaborator` rows (`component:1215-1230`).
* **UI** the ADMIN "preview manager" dropdown, with `managementPreviewManagersFromOrgChart = true` flagged in the UI
  (`component:1258`).
* **Caching** 404 → `null`; windowed `shareReplay` keyed
  `g4u_org_hierarchy_{month}_{sim}_{depth}_{nodeType}_{nodeId}` (`action-log.service.ts:840-851`);
  dedupe key `org-hierarchy|…` (`game4u-api.service.ts:1049`); errors swallowed to `null`
  (`component:1211-1213`).

### 20–25. Legacy `/game/*` endpoints (non-Game4U-wallet branch only)
Reachable only when `usesGame4uWalletFromStats()` is false. Kept for completeness:

| Endpoint | Query | Service | Component trigger |
|---|---|---|---|
| `GET /game/reports/finished/summary` | `finished_at_start`, `finished_at_end`, `email`?, `status[]`?, `team_id`? (`game4u-api.service.ts:480-497`) | `getProgressMetrics` (`action-log.service.ts:2988-3021`) | `loadCollaboratorSidebarData` `component:2083`, `loadCollaboratorGoalsData` `component:2549` |
| `GET /game/reports/open/summary` | `dt_prazo_start`, `dt_prazo_end`, `email`?, `team_id`? (`game4u-api.service.ts:461-468`) | `getProgressMetrics` (`action-log.service.ts:3022-3034`) | same as above |
| `GET /game/stats` | `start`, `end`, `user` **or** `team_id` (mutually exclusive — `game4u-api.service.ts:203-212`) | `getMonthlyPointsBreakdown` (`action-log.service.ts:2640`), `getProgressMetrics` (`:2983`), `PlayerService.getPlayerPoints` (`player.service.ts:215`) | `loadMonthlyPointsBreakdown(collaboratorId)` `component:5747` |
| `GET /game/actions` | `start`, `end`, `user`?, `status`?, `team_id`? | `getProgressMetrics` (`action-log.service.ts:3049`), `getPlayerCnpjListWithCount` season path (`:3628-3629`), `getProcessList` (`:3436`), `getActivityList` (`:3289`) | `loadCollaboratorSidebarData`, `loadParticipacaoClientesList` (season), `<modal-progress-list>` |
| `GET /game/team-stats` | `start`, `end`, `team` (numeric id) | `getTeamSeasonPoints` (`team-aggregate.service.ts:141`), `getTeamProgressMetrics` (`:189`), `getTeamMonthlyPointsBreakdown` (`:1229`) | `loadSidebarData` `component:2362`/`:2372`, `loadMonthlyPointsBreakdown` `component:5776` |
| `GET /game/team-actions` | `start`, `end`, `team`, `user`?, `status`? | `getTeamMemberActionLogCounts` (`team-aggregate.service.ts:906`), `getTeamCnpjListWithCount` (`:1025-1029`) | `loadTeamMembersData` `component:1651`, `loadParticipacaoClientesList` `component:3842` |

Note the `team` param **must be numeric** — the component logs a warning and degrades if it cannot resolve one
(`component:838-842`).

### 26. `GET {environment.gamificacaoApiUrl}`
* **Service** `CompanyKpiService.getGamificacaoMaps$()` — `company-kpi.service.ts:522-553` (request at `:540`)
* **Params** none. Header `x-api-token: environment.gamificacaoApiToken` (`company-kpi.service.ts:539`).
  The `AuthInterceptor` explicitly leaves this request untouched (no Bearer/`client_id`)
  (`auth.interceptor.ts:78-102`, `:106-108`).
* **Triggers**
  * **Prefetch** on every `loadTeamData()`: `companyKpiService.prefetchGamificacaoSnapshot()` (`component:1825`,
    `company-kpi.service.ts:884-893`) — no-op when URL or token is missing.
  * **On demand** `enrichFromParticipacaoRowKeys` → `applyParticipacaoPorcEntregasKpiAfterGamificacaoAsync`
    (`component:4348`, `company-kpi.service.ts:679-759`, maps at `:697`). Only runs when the participação page did
    **not** come from a `*/cached` endpoint (`skipGamificacaoKpi = page.fromCachedDeliveries`,
    `component:3728`, `:3773`, `:3830`, `:4045`).
  * `<modal-carteira>` `enrichCompaniesWithKpis` (`company-kpi.service.ts:761+`, `:608`).
* **Returns** company rows keyed by `EmpID` / CNPJ / normalized title; built into
  `{byEmpId, byCnpjNorm, byTitleNorm}` (`company-kpi.service.ts:441-503`), tolerating
  `data|result|items|empresas|rows` envelopes (`company-kpi.service.ts:510-520`).
* **UI** `classificacao`, `entrega`, `porcEntregas`, `processCount`, `cnpjNumber` columns of the
  "Clientes atendidos" table, and the `entregas-prazo` KPI average (`component:4353-4372`).
* **Caching** 10-min snapshot cache with `shareReplay({bufferSize:1, refCount:false})` — `refCount:false` is
  deliberate so the prefetch's `take(1)` does not cancel the in-flight GET (`company-kpi.service.ts:161-162`,
  `:531-551`). Errors resolve to empty maps (`company-kpi.service.ts:543-546`), and
  `enrichFromParticipacaoRowKeys` degrades to zero-KPI rows (`company-kpi.service.ts:744-757`).

---

## 4. Declared child components — HTTP contribution

| Component | Path | HTTP |
|---|---|---|
| `C4uTeamSidebarComponent` | `src/app/components/c4u-team-sidebar/c4u-team-sidebar.component.ts` | **None** — no constructor / no injected services. Also **not rendered** in `team-management-dashboard.component.html` (declared only, `module.ts:51`). |
| `C4uTeamSelectorComponent` | `src/app/components/c4u-team-selector/c4u-team-selector.component.ts` | **None.** Pure `@Input`/`@Output`; its `(teamChange)` fires `onTeamChange` (`component:5149-5238`), which triggers #2/#3/#8-#13. |
| `C4uCollaboratorSelectorComponent` | `src/app/components/c4u-collaborator-selector/c4u-collaborator-selector.component.ts` | **None.** `(collaboratorChange)` → `onCollaboratorChange` (`component:5317-5345`) → reload. |
| `C4uGoalsProgressTabComponent` | `src/app/components/c4u-goals-progress-tab/…` | **None.** Also not rendered in the template. |
| `C4uProductivityAnalysisTabComponent` | `src/app/components/c4u-productivity-analysis-tab/c4u-productivity-analysis-tab.component.ts:103` | Injects `GraphDataProcessorService` only — that service has **no `HttpClient`** (pure computation). Rendering it does not issue HTTP; the data arrives via #17. |
| `C4uTimePeriodSelectorComponent` | `src/app/components/c4u-time-period-selector/…` | **None.** `(periodChange)` → `onPeriodChange` (`component:5446-5459`) → #17. |

Other components rendered by the template that **do** cause traffic:

* `<c4u-seletor-mes>` — injects `SeasonDatesService` + `ActionLogService`
  (`c4u-seletor-mes.component.ts:50-54`); triggers #4 (`:76`) and, only in Feb-2026-or-later,
  `getPlayerActionLogForMonth` (`:157`) which is a **dead** Funifier aggregate (§6).
* `<modal-progress-list>` — #16 (activity/process lists) and #18 (pending chart);
  `getActivitiesByProcess` is **dead** (§6). `modal-progress-list.component.ts:110-114`, `:527`, `:535`, `:840`, `:1270`.
* `<modal-carteira>` — #23 `/game/actions` (season) or #12 via `getPlayerCnpjListWithCount`, plus #26.
  `modal-carteira.component.ts:29-34`.
* `<modal-company-carteira-detail>` — `KPIService.getCompanyKPIs` is a **dead** Funifier aggregate
  (`kpi.service.ts:226-228`); `CnpjLookupService` is dead too (§6).
* `<c4u-dashboard-insights>` injects only `FeaturesService` (no HTTP) — `c4u-dashboard-insights.component.ts:21`.
* `<c4u-game-rules-update-banner>` injects `GameRulesUpdateService`, which contains no `HttpClient`.
* `<c4u-dashboard-navigation>`, `<c4u-point-wallet>`, `<c4u-grafico-barras>` — no HTTP.

---

## 5. Trigger → endpoint matrix

| Trigger | Endpoints fired |
|---|---|
| `ngOnInit` (`component:533-535`) | #4 (campaign, ×1 shared), #1, then #2/#3 per role, then the `onTeamChange` set below |
| team selected / initial default (`onTeamChange` `component:5149`) | non-management: #3, #9, #12 (0/30), #26 prefetch, #16 ×2 per team, #5 (only if session lacks `extra`) — management panel: #11 (ADMIN preview, + #19 fallback), #10, #13, #26 prefetch, #16 |
| collaborator selected (`onCollaboratorChange` `component:5317`) | #8, #3, #12 (`email`, 0/30), #16 ×1, #26 prefetch |
| collaborator reset to team view | same as "team selected" |
| ADMIN management-preview user change (`onManagementUserChange` `component:1299`) | #11, #10, #13, #16 |
| month change (`onMonthChange` `component:5418`) | full `loadTeamData()` set again with the new `month`; if productivity tab is open, also #17 |
| tab switch → Produtividade (`switchTab` `component:5466`) | #17 (1 request, or N for gerência/supervisão segmentation, + #11 / #10 to enumerate groups) |
| period selector change (`onPeriodChange` `component:5446`) | #17 |
| "Carregar mais" clientes atendidos (`loadMoreParticipacao` `component:3973`) | #12 or #13 with `offset=participacaoNextOffset`, `limit=30`; then #26 if the page is not `fromCachedDeliveries` |
| Export CSV (`exportClientesAtendidosCsv` `component:4094`) | #13 (management, `limit=200`, all pages) **or** #12 (`email` / `team_id`, `limit=200`, all pages) |
| Refresh (`refreshData` `component:5575`) | clears `TeamAggregateService` cache only (`:5577`) then re-runs `loadTeamData()`; `ActionLogService` / `Game4uApiService` / `BwaTeamApiService` / `CompanyKpiService` caches are **not** cleared, so most requests are served from memory |
| Open activity/process modal (`onProgressCardClicked` `component:5679-5701`) | #16 (and #18 for SUPERVISOR/LIDER_CELULA pending modal) |
| Save "meta de clientes" (`component:6505`) | #6 + #7, one pair per collaborator |
| Retry buttons (`retrySidebarData` `:5651`, `retryGoalsData` `:5660`, `retryProductivityData` `:5669`, `retryClientesAtendidosThisMonth` `:4075`) | re-issue the corresponding subset |

---

## 6. Dead / short-circuited request paths (no HTTP leaves the browser)

`BackendApiService.get`/`post` refuse any endpoint whose path contains `aggregate`, returning `of([])` after a
`console.warn` (`backend-api.service.ts:88-91`, `:105-108`). Consequently **all Funifier `/database/*/aggregate`
calls reachable from this page issue no network request**:

| Call site | Endpoint string |
|---|---|
| `component:1551-1554` (team member counts in `loadAvailableTeams`) | `POST /database/player/aggregate?strict=true` |
| `component:1608-1612` → `fetchAllPaginatedData` `component:1742-1746` (`loadTeamMembersData`) | `POST /database/player_status/aggregate?strict=true` (with `Range: items=…`) |
| `team-aggregate.service.ts:437-453` (`getTeamSeasonPoints`, `getTeamProgressMetrics`, `getTeamMembers` legacy paths) | `POST /v3/database/{achievement\|action_log}/aggregate?strict=true` |
| `team-aggregate.service.ts:953-956`, `:1087-1090`, `:1270-1273`, `:1338-1341` | `POST /database/action_log/aggregate?strict=true`, `…/achievement/…` |
| `action-log.service.ts:1859-1862` (`fetchActionLogPage`, used by `<c4u-seletor-mes>`) | `POST /v3/database/action_log/aggregate?strict=true` |
| `action-log.service.ts:4244-4247` (`getActivitiesByProcess`, progress modal) | `POST /v3/database/action_log/aggregate?strict=true` |
| `action-log.service.ts:3729-3732` (`getCnpjListWithCountForAllExecutors`) | `POST /v3/database/action_log/aggregate?strict=true` |
| `kpi.service.ts:226-228` (`getCompanyKPIs`, carteira-detail modal) | `POST /v3/database/cnpj_performance__c/aggregate?strict=true` |

`CnpjLookupService` is likewise fully short-circuited: `fetchAllPaginatedCnpj` bails out before `http.post`
whenever the URL contains `/aggregate` (`cnpj-lookup.service.ts:100-103`), and both entry points
(`fetchCnpjByEmpids` `:60`, `fetchCnpjByFullCnpj` `:162`) build exactly that URL
(`{backend_url_base}/database/empid_cnpj__c/aggregate?strict=true`, `:28-31`). Therefore
`cnpjLookupService.enrichCnpjListFull(...)` at `component:3899` resolves to `empresa = cnpj` placeholders with
**zero HTTP** (`cnpj-lookup.service.ts:300-320`).

Other non-requests worth noting:
* `PlayerService.getPlayerCompanyData` returns an empty map by design (`player.service.ts:250-252`).
* `PlayerService.getSeasonProgress` is a pure shell, no HTTP (`player.service.ts:239-242`).
* Supabase / PostgREST fallback in `Game4uApiService` cannot activate while `backend_url_base` is set
  (`game4u-api.service.ts:162-168`) — and `environment.supabaseUrl` is hardcoded empty
  (`src/environments/environment.ts:47`).
* `AcessoService` (`acesso.service.ts:52`, `:83`) is **not injected** anywhere in this page's component tree.
* `TeamStatsCacheService`, `TeamCodeService`, `CompanyService`, `GoalsConfigService`, `GraficoService`,
  `DashboardInsightsService`, `GraphDataProcessorService` contain **no `HttpClient`** at all.
