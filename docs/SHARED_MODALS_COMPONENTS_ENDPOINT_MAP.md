# Shared Modals & Shared Components — HTTP Endpoint Map

Evidence-based inventory of every HTTP request issued by code under `src/app/modals/` and by the
shared components under `src/app/components/`, plus the CNPJ / company-name lookup path.
All `*.spec.ts` files ignored. Every claim carries a `file:line` citation.

---

## 0. Base URLs, transports and cross-cutting behavior

| Symbol | Value / resolution | Citation |
|---|---|---|
| `environment.backend_url_base` | `G4U_API_BASE` → `g4u_api_base` → `BACKEND_URL_BASE` → `backend_url_base` (trailing slashes stripped); empty string when unset | `src/environments/environment.ts:20`, `src/environments/backend-url.ts:32-50` |
| `environment.gamificacaoApiUrl` | `GAMIFICACAO_API_URL` / `gamificacao_api_url`, default `https://hook.bwa.global:3334/gamificacao` | `src/environments/environment.ts:103-105` |
| `environment.gamificacaoApiToken` | `GAMIFICACAO_API_TOKEN` / `gamificacao_api_token` — sent as `x-api-token` | `src/environments/environment.ts:106-111`, `src/app/services/company-kpi.service.ts:539` |
| `environment.supabaseUrl` | **Hard-coded empty string** — "URL não vem de variável de ambiente (evita chamadas PostgREST acidentais no bundle)" | `src/environments/environment.ts:49-50` |
| `environment.supabaseUseMock` | Defaults to **true** unless `SUPABASE_USE_MOCK` is explicitly false/0/no/off | `src/environments/environment.ts:91-95`, `src/app/services/supabase-companies.service.ts:24-26` |

### Transports

1. **`Game4uApiService`** — raw `HttpClient` against `${backend_url_base}/game/...`; base computed in the
   constructor (`src/app/services/game4u-api.service.ts:149`), `isConfigured()` returns false when the base
   is empty (`:153-155`). Only header added is `client_id` (`:1602-1605`).
2. **`BackendApiService`** — used for Funifier-style `/v3/database/<collection>/aggregate` paths. Strips the
   `/v3/` prefix before joining (`src/app/services/backend-api.service.ts:98-100`, `:117-119`).
   **⚠ Aggregate calls are hard-disabled**: any endpoint containing `aggregate` short-circuits to
   `of([])` with a console warning — `GET` at `src/app/services/backend-api.service.ts:87-91`,
   `POST` at `:103-107`. `PUT`/`PATCH` are not gated (`:126`, `:145`). Non-aggregate GET retries 2×/1 s
   (`:98`), POST/PUT/PATCH retry 3×/1 s (`:121`, `:140`, `:159`).
3. **`ApiProvider`** — `${backend_url_base}${path}` (or the path verbatim when it starts with `https`);
   `encodeURI` applied; forces `Content-Type: application/json`; **logs the user out on 401/403**
   (`src/app/providers/api.provider.ts:8-10`, `:21`, `:35-37`). Used by `PontosAvulsosService`, `MesAtualService`,
   `MesAnteriorService`.
4. **Direct `HttpClient`** — `CnpjLookupService`, `CompanyKpiService`, `HelpService`, `HelpTextsService`,
   `PlayerService.getRawPlayerData`, `CampaignService`, `PontosAvulsosService` (multipart upload + download URL).
5. **Supabase JS client (PostgREST)** — `SupabaseCompaniesService` via `createClient`
   (`src/app/services/supabase-companies.service.ts:174-188`, `createClient` at `:182`).

### Interceptors (apply to every request above)

- `AuthInterceptor` (`src/app/providers/auth.interceptor.ts`)
  - Requests carrying `x-api-token` whose origin/path match `gamificacaoApiUrl` are passed through untouched
    (`:109-111`, predicate `:79-102`) — no `Authorization`, no `client_id`.
  - Whitelist (no session required): `/auth/login`, `/auth/refresh`, `/auth/change-password*`,
    `/client/system-params`, `/campaign/current`, `/campaign`, `integrador-n8n.grupo4u.com.br` (`:22-32`).
  - Everything else: injects `client_id` + `Authorization: Bearer <session token>`; redirects to `/login`
    when no token (`:176-186`); refreshes via `POST ${backend_url_base}/auth/refresh` when the JWT expires
    in <5 min (`:189-190`, `:225-247`, URL at `:228`).
- `GameReportsInterceptor` (`src/app/providers/game-reports.interceptor.ts`) — only `GET /game/reports/**`
  (`:25`, predicate `:48-50`): retries **once** after 1500 ms (`:20`) when the error is "Snowflake unavailable"
  (`:30-38`) and raises a toast on definitive failure (`:39-44`).

---

## 1. `src/app/modals/` directory listing

```
modal-carteira/
modal-company-carteira-detail/
modal-company-detail/
modal-gerenciar-pontos-avulsos/            (+ components/, services/, 8 confirm sub-modals)
modal-organization-hierarchy-critical-clients/
modal-organization-hierarchy-kpi-detail/
modal-pending-quests/
modal-player-detail/
modal-progress-list/
modal-season-faq/
modal-team-management-faq/
```

`modal-details-painel-info` is **not** a modal folder — it is a provider,
`src/app/providers/modal-details-painel-info.provider.ts`, which opens `ModalPendingQuestsComponent`
(`:26-29`).

---

## 2. `modal-carteira` — "Carteira / Clientes atendidos" list

Injected: `ActionLogService`, `CompanyKpiService`, `CnpjLookupService`
(`src/app/modals/modal-carteira/modal-carteira.component.ts:29-34`).

**Used by pages:** `gamification-dashboard` and `team-management-dashboard`
(`src/app/pages/dashboard/gamification-dashboard/gamification-dashboard.component.html:435-437`;
`.../team-management-dashboard.component.html`). Opened by `openCarteiraModal()`
(`gamification-dashboard.component.ts:1770-1774`; `team-management-dashboard.component.ts:5722`).

### 2.1 On modal open → `ngOnInit` → `loadClientes()` (`modal-carteira.component.ts:36-38`, `:45-50`)

`ActionLogService.getPlayerCnpjListWithCount(playerId, month)` (`action-log.service.ts:3558`). Branches:

| Condition | Method | Endpoint | Query params |
|---|---|---|---|
| Game4U on + `month` set + `teamId` given | `getGameReportsFinishedDeliveries` (`action-log.service.ts:3592-3597`) | `GET {backend_url_base}/game/reports/finished/deliveries` (`game4u-api.service.ts:672-694`) | `finished_at_start`, `finished_at_end` (ISO, mandatory pair — assert at `:470-478`, called `:684`), `email`, `team_id` (`appendReportParams` `:480-497`) |
| Game4U on + `month` set, no `teamId` | `getGameReportsFinishedDeliveriesCached` (`action-log.service.ts:3599-3605`) | `GET {backend_url_base}/game/reports/finished/deliveries/cached` (`game4u-api.service.ts:557-609`) | `month=YYYY-MM`, `offset=0`, `limit=500` (clamped 1..500 at `:576`), plus `email` **or** `team_id` |
| Game4U on, **no** `month` (whole season) | 2 × `getGameActions` (`action-log.service.ts:3628-3631`) | `GET {backend_url_base}/game/actions` ×2 (`game4u-api.service.ts:1640-1666`) | `start`, `end` (ISO), `status=DONE` then `status=DELIVERED`, `user` (email), `team_id` — `team_id` is **dropped when `user` is present** (`:203-212`) |
| Game4U off | `getPlayerActionLogForMonth` (`action-log.service.ts:3644`, method at `:1778`) | `POST {backend_url_base}/database/action_log/aggregate?strict=true` (`action-log.service.ts:1859-1862`; page fetcher `:1851`) — **returns `of([])`, disabled** (`backend-api.service.ts:103-107`) | body `[{$match:{userId}},{$sort:{time:-1}}]`; header `Range: items=<offset>-100` (`action-log.service.ts:1851-1862`) |

**Returns:** rows `{ cnpj, actionCount, delivery_title?, deliveryId?, delivery_extra_cnpj?, fromGameReportsDeliveries?, loadTasksViaGameReports? }`
(`action-log.service.ts:3565-3575`).
**Consumed by:** the client list rows in the modal (`clientes`), title via `getClienteCarteiraDisplayName`
(`modal-carteira.component.ts:157-163`).
**Caching:** in-memory `cnpjListWithCountCache` keyed `${playerId}_cnpj_list_count_${monthKey}_${teamId}_ad`
+ `shareReplay({bufferSize:1, refCount:true, windowTime: CACHE_DURATION})` (`:3578-3584`, `:3615`, `:3640`).
Failures degrade to `of([])` (`:3610-3613`, `:3636-3639`).

### 2.2 Same open, in parallel `forkJoin` (`modal-carteira.component.ts:59-62`)

**(a) `CompanyKpiService.enrichCompaniesWithKpis(clientes)`** (`company-kpi.service.ts:761`) →
`getGamificacaoMaps$()` (`:522`):

- **`GET {environment.gamificacaoApiUrl}`** (default `https://hook.bwa.global:3334/gamificacao`),
  header `x-api-token: {gamificacaoApiToken}`, **no query params, no body**
  (`company-kpi.service.ts:539-540`).
- **Returns:** flat array (or `{data|result|items|empresas|rows}` wrapper — `:506-520`) of
  `{ CNPJ, EmpID, porcEntregas|percEntregas, procFinalizados, procPendentes, regime, ... }` (`:26-42`),
  normalized into `byEmpId` / `byCnpjNorm` / `byTitleNorm` maps (`:470-504`).
- **UI consumers:** per-row `% Entregas no prazo` (`entrega`/`porcEntregas`/`deliveryKpi` — `:815-838`),
  client classification (`classificacao`, `:823`), `processCount = procFinalizados + procPendentes` (`:787`).
- **Caching / dedupe:** single-slot TTL cache `gamificacaoSnapshotCache` at **10 min**
  (`:161`, `:531-537`, `:550`) + `shareReplay({bufferSize:1, refCount:false})` so an unsubscribe after
  `take(1)` does not cancel the in-flight GET (`:547-548`). `prefetchGamificacaoSnapshot()` warms it
  (`:884-892`); `clearCache()` clears it (`:876-878`).
- **Fallback:** if `url` or `token` is empty → warns and returns empty maps, **no request** (`:526-529`);
  on HTTP error → empty maps (`:542-545`); `enrichCompaniesWithKpis` catch returns un-enriched rows (`:798-812`).

**(b) `CnpjLookupService.enrichCnpjListFull(cnpjList)`** (`cnpj-lookup.service.ts:263`) — see §9.
Intended request is `POST {backend_url_base}/database/empid_cnpj__c/aggregate?strict=true`;
**currently short-circuited off** (`:102-105`).

### 2.3 Row click → `selectCliente(cnpj)` (`modal-carteira.component.ts:92`, request at `:108`)

`ActionLogService.getActionsByCnpj(cnpj, month, { userId })` (`action-log.service.ts:4075`):

- **`POST {backend_url_base}/database/action_log/aggregate?strict=true`** (`action-log.service.ts:4132-4135`)
  — **disabled**, resolves to `of([])` (`backend-api.service.ts:103-107`).
- **Body** (pipeline chosen by scope, `action-log.service.ts:4104-4128`):
  - `userId` given → `[{$match:{$and:[companyOr,{userId}]}},{$sort:{time:-1}},{$limit:1000}]`
  - `teamId` given → `$lookup` on `player` + `$unwind` + `$match {playerData.teams, companyOr}` + sort + limit 1000
  - neither → `[{$match: companyOr},{$sort:{time:-1}},{$limit:1000}]`
  - `companyOr = { $or: [ {'attributes.cnpj': {$in: variants}}, {'attributes.deal': {$in: variants}} ] }` (`:4093-4098`)
- **Returns:** `ClienteActionItem[] = { id, title, player, created, processTitle }` (`:4141-4147`).
- **Consumed by:** the expanded action list under the clicked row (`selectedClienteActions`).
- **Caching:** `actionsByCnpjCache` keyed `${companyKey}_actions_company_${monthKey}_u_${user|all}_t_${team|all}`
  + `shareReplay` window (`:4084-4088`, `:4155`). Clicking the already-selected row collapses without a request
  (`modal-carteira.component.ts:93-99`). Month filtering happens client-side (`filterByMonth`, `:4138`).

---

## 3. `modal-company-carteira-detail` — per-client drill-down

Injected: `ActionLogService`, `CompanyKpiService`, `KPIService`, `CnpjLookupService`
(`modal-company-carteira-detail.component.ts:53-59`).
**Used by pages:** `gamification-dashboard` (`.component.html:426-429`, opened by
`openCompanyDetailModal()` at `.component.ts:1654-1661`), `team-management-dashboard`
(`.component.ts:6070`), `dashboard-supervisor-tecnico`.

| # | Trigger | Service call | HTTP |
|---|---|---|---|
| 3.1 | `ngOnInit` → `enrichCompanyName()` (`:61-64`, method at `:74`) — skipped when `loadTasksViaGameReports` or key starts with `g4u-rpt:` (`:75-77`) | `CnpjLookupService.enrichCnpjListFull([company.cnpj])` (`:80-83`) | `POST {backend_url_base}/database/empid_cnpj__c/aggregate?strict=true` — **disabled** (§9). Feeds company display name + `companyStatus` ("Ativa") badge (`:85-92`, `:396-398`) |
| 3.2 | `ngOnInit` → `loadCompanyData()` when `company.cnpjId` set (`:99`, `:110-111`) | `KPIService.getCompanyKPIs(cnpjId)` (`kpi.service.ts:214`) | `POST {backend_url_base}/database/cnpj_performance__c/aggregate?strict=true`, body `[{$match:{_id: companyId}},{$limit:1}]` (`kpi.service.ts:220-229`) — **disabled**. Returns KPI array via `KPIMapper.toKPIDataArray`; feeds the KPI cards. Cache `companyKPICache` + `shareReplay` (`:246-249`). Fallback: `company.deliveryKpi` (from the gamificação hook) on empty/error (`modal-…component.ts:117-118`, `:126-129`, `:136-140`) |
| 3.3 | `loadTasks()` — team **or** user scope, Game4U on, `loadTasksViaGameReports` true (`:150`, `:159-164`) → `fetchParticipationModalTasksPage(true)` (`:165`, method `:279`) | `getGame4uUserActionsForParticipationModal` (`action-log.service.ts:2436`) → `getGameReportsFinishedActionsByDelivery` (`:2467-2474`) | `GET {backend_url_base}/game/reports/finished/actions-by-delivery` (`game4u-api.service.ts:737-769`). Params: `delivery_title` (row title), `finished_at_start`/`finished_at_end` (ISO pair, mandatory — assert at `:470-478`, called `:751`), `email` (omitted when team scope + `playerId === 'me'` — `action-log.service.ts:2461-2463`), `team_id` |
| 3.4 | Collaborator scope, Game4U on, not reports-based (`:170-172`) | same method, `getGameActions` branch (`action-log.service.ts:2521`) | `GET {backend_url_base}/game/actions` — `start`,`end`,`user`,`status`? |
| 3.5 | Team scope (no collaborator), Game4U on (`:203-205`) | same, with `team_id` | `GET {backend_url_base}/game/actions` |
| 3.6 | Collaborator scope, Game4U **off** (`:238-239`) | `getUserActionsForCompanyUsingPlayerActionLog` (`action-log.service.ts:4163`) | reuses `POST …/database/action_log/aggregate?strict=true` from `getPlayerActionLogForMonth` (`:1778`, request at `:1859`) — **disabled**; matching + month filter done client-side (`:4168-4177`) |
| 3.7 | Fallback (no scope) (`:259-260`) | `getActionsByCnpj(cnpj, month, {userId, teamId})` | `POST …/database/action_log/aggregate?strict=true` — see §2.3 |
| 3.8 | Pagination `goTasksPrevPage()` / `goTasksNextPage()` (`:357-368`) | **no HTTP** — pure client-side slice of `allParticipationTasks`, page size 25 (`:48`, `:331-334`) | — |

**Returns / consumers:** `ClienteActionItem[]` (`{id, title, player, created, finished_at, dt_prazo, processTitle, status, points, risco_multa, justificada}` — mapper `action-log.service.ts:1673-1706`) → task table, `tasksTotal` counter, `tasksPaginationLabel` (`:337`), and derived insights (`companyInsights`, `:450`).
**Dedupe:** `getGameReportsFinishedActionsByDelivery` shares by key
`rpt-act|identity|finished_at_start|finished_at_end|delivery_title|status|team_id`
(`game4u-api.service.ts:388-391`, request built `:759-766`) with `shareReplay({bufferSize:1, refCount:false})`, key evicted on error (`:175-190`).
**Fallbacks:** every branch catches to `{items: [], total: 0}` (`action-log.service.ts:2489-2492`, `:2540-2543`).

---

## 4. `modal-company-detail` — Funifier `cnpj_performance__c` detail

Injected: `CompanyService` (`modal-company-detail.component.ts:31-34`).
**Used by pages:** `gamification-dashboard` (`.component.html:409-410`, trigger `onCompanySelected()`
`.component.ts:1644-1649`), `dashboard-supervisor`, `dashboard-supervisor-tecnico`.

- **Trigger:** modal open → `ngOnInit` → `loadCompanyDetails()` (`:36-39`, method `:42`).
- **Request:** `CompanyService.getCompanyDetails(company.id)` →
  **`POST {backend_url_base}/database/cnpj_performance__c/aggregate?strict=true`**
  (`company.service.ts:41-44`), body `[{ $match: { _id: companyId } }, { $limit: 1 }]` (`:36-39`).
  `companyId` is the CNPJ (`:29-31`). **Disabled** by the aggregate guard (`backend-api.service.ts:103-107`),
  so the mapper throws `Company with CNPJ … not found` (`company.service.ts:49-51`).
- **Returns:** `CompanyDetails` = company + `processes` / `activities` / `processos`
  (`company-mapper.service.ts:53-63`). `mapProcesses`/`mapActivities`/`mapMacros` read
  `apiResponse.processes|activities|macros` (`:59-61`).
- **UI:** tab list (`Macros incompletas` / `Atividades finalizadas` / `Macros finalizadas`) filtered locally
  via `currentTabProcesses` (`modal-company-detail.component.ts:68-92`); KPI cards from the `@Input() company`
  (`getCompanyKPIs()`, `:96-111`) — no extra request.
- **Caching:** `companyDetailsCache` keyed by `companyId`, TTL **10 min** (`company.service.ts:19`, `:26-33`,
  `:59-61`) + `shareReplay({bufferSize:1, refCount:true, windowTime: 10 min})` (`:57`).
  Tab switching (`selectTab()`, `:60`) issues no request; `getCompanyProcesses` reuses the cached detail (`company.service.ts:73-100`).

---

## 5. `modal-progress-list` — activities / processes drill-down

Injected: `ActionLogService`, `CnpjLookupService` (`modal-progress-list.component.ts:110-114`).
**Used by pages:** `gamification-dashboard` (`.component.html:416-419`), `team-management-dashboard`,
`dashboard-supervisor-tecnico`.
**Triggers:** progress-card click `onProgressCardClicked()` (`gamification-dashboard.component.ts:1704-1735`),
insight-alert click `onInsightsAlertClicked()` (`:1752-1766`), team dashboard equivalents
(`team-management-dashboard.component.ts:5700`, `:5714`).
`listType ∈ {atividades, atividades-pendentes, pontos, processos-pendentes, processos-finalizados}`
(`:177-182`, `:246-248`).

### 5.1 Activity lists (`loadData()` (`:429`) → `isActivityList` (`:447`))

`getActivityList(playerId|'' , month, undefined, reportStatuses, teamScopeId)` — one call per team id or per
comma-separated player id, combined with `forkJoin` (`:466-492`, `forkJoin` at `:492`). Statuses: `['PENDING','DOING']` for
`atividades-pendentes`, `['DONE','DELIVERED']` for `atividades`, `undefined` for `pontos` (`:452-457`).

In `ActionLogService.getActivityList` (`action-log.service.ts:3233`):

| Sub-branch | Endpoint | Params |
|---|---|---|
| `reportUserActionsStatuses` set (pending/finished lists) → `fetchReportsUserActionsForActivityList` (`:3250`, `:3374`) → open slice | `GET {backend_url_base}/game/reports/user-actions` (`game4u-api.service.ts:771-830`) | `status=PENDING&status=DOING` (appended repeatedly, `:786-788`), `dt_prazo_start`/`dt_prazo_end` = 1st…last day of month (`action-log.service.ts:1651-1653`; range builder `game4u-api.service.ts:368-376`), `email` **or** `team_id` |
| … finished slice (`action-log.service.ts:1656-1660`) | same endpoint | `status=DONE&status=DELIVERED`, `finished_at_start`/`finished_at_end` (`toQueryRange`, `game4u-api.service.ts:301-335`) |
| `game4uActionStatus === 'DONE'` (`:3271`) | same endpoint (finished slice) | as above |
| otherwise (`pontos`) (`:3280-3293`) | `GET {backend_url_base}/game/actions` | `start`, `end`, `user`, optional `status`, optional `team_id` |
| Game4U off (`:3297`) | `POST …/database/action_log/aggregate?strict=true` (via `getPlayerActionLogForMonth`, `:1778`) — **disabled** | body `[{$match:{userId}},{$sort:{time:-1}}]`, `Range` header |

**Returns:** `ActivityListItem[]` — `{id, title, delivery_title, points, created, player, cnpj, dt_prazo, …}`
(`action-log.service.ts:3301-3310`; Game4U mapping via `mapGame4uActionsToActivityList`).
**Consumers:** the activity table (`displayedActivityItems`, `:250-259`), the per-day bar chart
(`applyChartFromActivityItems`, `:708`), the executor column when team-scoped (`:210-213`).
**Note — exactly one range pair allowed:** `getGameReportsUserActions` rejects incomplete or multiple
`finished_at_*` / `dt_prazo_* `/ `created_at_*` pairs (`game4u-api.service.ts:789-826`).
**Caching:** insight slices cached in `game4uTeamUserActionsInsightsCache` keyed
`insights-ua-{open|finished}|{teamId}|{email}|{YYYY-MM}` + `shareReplay(1)`
(`action-log.service.ts:1627-1670`) — shared with `DashboardInsightsService`, and warmed ahead of time by
`warmTeamUserActionsCacheForProgressModal` (`:1572-1593`).

### 5.2 Pending-activities chart for supervisor / management scope

`fetchDailyPendingStatsForChart()` runs when `useDailyPendingStatsApi` + pending modal + team scope
(`:803-809`, method at `:828`).

- `ActionLogService.getReportTeamDailyPendingStats({team_id, start, end})` (`action-log.service.ts:2189`)
  → **`GET {backend_url_base}/game/reports/team/daily-pending-stats`** (`game4u-api.service.ts:1576-1600`).
- **Params:** `start`, `end` as `YYYY-MM-DD` for the visible month (`modal-progress-list.component.ts:811-821`),
  `team_id`; optional `email`, repeated `status`, `role` (`game4u-api.service.ts:413-429`).
- **Returns:** rows normalized to `{day|date, email?, tasks_count?, points_sum?}`
  (`action-log.service.ts:2214`, `:2231-2245`) → drives the "Entregas por dia de prazo no mês" chart
  (`applyChartFromDailyPendingStatsRows`, `:865`), filtered locally by the selected collaborator's email (`:878-882`).
- **Caching:** `game4uTeamDailyPendingStatsCache` keyed
  `g4u_team_daily_pending_{team}_{email}_{start}_{end}_{status}` with `GAME4U_CACHE_DURATION`
  + `shareReplay` (`:2203-2222`); errors degrade to `of([])` (`:2216-2219`).

### 5.3 Process lists (`isProcessList`, `:523`)

`getProcessList(playerId|'', month, teamScopeId)` per scope, `forkJoin` (`:525-543`).
In `action-log.service.ts:3417`:
- Game4U on → `GET {backend_url_base}/game/actions` with `start`/`end`/`user`/`team_id` (`:3437`), mapped by
  `mapGame4uActionsToProcessList`.
- Game4U off → `getPlayerActionLogForMonth` (`:1778`; `POST …/action_log/aggregate?strict=true`, disabled) then a second
  `POST {backend_url_base}/database/action_log/aggregate?strict=true` with body
  `[{$match:{actionId:'desbloquear','attributes.delivery':{$in: deliveryIds}}},{$group:{_id:'$attributes.delivery'}}]`
  to flag finalized processes (`:3491-3510`). Cached in `processListCache` (`:3446-3454`).

**Returns:** `ProcessListItem[] = {deliveryId, title, actionCount, isFinalized, cnpj}` (`:3513-3521`) →
process rows, split by `isFinalized` for `processos-finalizados` vs `processos-pendentes` (`:571-576`).

### 5.4 Process row expand → activities of one delivery (`:1269-1278`)

`getActivitiesByProcess(deliveryIdNum, playerId, month)` (`action-log.service.ts:4225`) →
**`POST {backend_url_base}/database/action_log/aggregate?strict=true`** (`:4244-4247`),
body `[{$match:{userId, 'attributes.delivery_id': deliveryId}},{$sort:{time:-1}}]` (`:4234-4241`) — **disabled**.
Returns `ActivityListItem[]` with derived `status ∈ {finalizado, pendente, dispensado}` (`:4255-4266`) →
the nested activity list. Cached as `${playerId}_${deliveryId}_all_activities_by_process` (`:4227-4231`);
one request per player id, aggregated with `forkJoin` (`:1278`).

### 5.5 CNPJ name enrichment (after every list load)

`enrichCnpjNames()` → `CnpjLookupService.enrichCnpjList(validCnpjs)`
(`:1317-1330`, called at `:503-505`, `:582`, `:682`) — see §9; currently a no-op request-wise.
Results merged into `cnpjNameMap`, consumed by `getCompanyDisplayName()` (`:1336+`).

### 5.6 Dead pagination path (documented for accuracy)

`fetchActivityReportPage()` calls `getActivityListReportsPage()` (`action-log.service.ts:3328`) which reuses the
same `GET /game/reports/user-actions` slices and paginates **client-side** (`:3452-3462`).
It is only reachable through `loadMoreActivityReports()` (`:604-606`), which is gated on
`useActivityReportsPagination` — a flag initialized `false` (`:95`) and only ever re-assigned `false` (`:463`).
So no extra network call happens today.

---

## 6. `modal-player-detail`

Injected: `ActionLogService`, `CnpjLookupService`, `PlayerService`, `KPIService`
(`modal-player-detail.component.ts:74-80`).
**Used by pages:** `dashboard-supervisor`, `dashboard-supervisor-tecnico` (`*.component.html`).
`KPIService` is injected but no KPI request is issued from this component (header uses `playerKPIs`, never populated here).

| # | Trigger | Request |
|---|---|---|
| 6.1 | `ngOnInit` → `loadCnpjData()` (`:82-85`, method `:119`) when `cnpjRespFromAggregate` is **undefined** (`:127-132`) | `PlayerService.getRawPlayerData(playerId)` → **`GET {backend_url_base}/player/{encodeURIComponent(playerId)}`** (`player.service.ts:81`, URL built at `:95-97`, GET at `:99`). Returns the player profile; only `extra.cnpj_resp` is read (`:131`). Cache `profile_{pid}` with TTL + `shareReplay` (`:87-93`, `:103`, `:111-114`); request timeout applied (`:100`). For `me` / current session id it delegates to `getCurrentPlayerData()` instead (`:83-85`) |
| 6.2 | same, `forkJoin` (`:146-149`) | `CnpjLookupService.enrichCnpjList(cnpjList)` → §9 (disabled) → company names for Tab 1 rows |
| 6.3 | same, `forkJoin` (`:147`) | `ActionLogService.getPlayerCnpjListWithCount(playerId, month)` → see §2.1. Provides `actionCount` per CNPJ row |
| 6.4 | `ngOnInit` → `loadActionData()` (`:85`, method `:174`) | `ActionLogService.getPlayerActionLogForMonth(playerId, month)` → `POST {backend_url_base}/database/action_log/aggregate?strict=true`, body `[{$match:{userId}},{$sort:{time:-1}}]`, header `Range: items=<offset>-100`, paginated recursively until a page < 100 (`action-log.service.ts:1778`, `:1807-1846`, `:1851-1862`) — **disabled**. Feeds Tab 2 rows `{actionName, companyCnpj, companyName, date, points}` (`:207-222`) |
| 6.5 | same, chained (`:193`) | `CnpjLookupService.enrichCnpjList(uniqueCnpjs)` for the unique `attributes.cnpj` values → §9 |
| 6.6 | Tab switch `selectTab()` (`:102-104`) | **no HTTP** — both tabs load on open |
| 6.7 | CNPJ row click `onCnpjRowClick()` (`:232-242`) | **no HTTP** — emits a `Company` upward so the parent opens `modal-company-detail` (§4) |

`month` derives from `monthsAgo`; `-1` ("Toda temporada") means `undefined` (`:95-99`).

---

## 7. `modal-season-faq` / `modal-team-management-faq` — **zero HTTP**

- `ModalSeasonFaqComponent` has no constructor and no injected services; content is static arrays
  (`modal-season-faq.component.ts:36-38`, `:41-59`, `:61-152`).
  Two anchors point at Supabase Storage public objects under
  `https://zarptqqopvuwognexpon.supabase.co/storage/v1/object/public/rulebook/bwa-pdf` (`:29-30`, `:45`, `:53`)
  — browser navigations, not app-issued XHR.
- `ModalTeamManagementFaqComponent` likewise static (`modal-team-management-faq.component.ts:26-135`).
- Opened via `NgbModal` from `gamification-dashboard.component.ts:1829`, `season.component.ts:211`
  (season FAQ) and `team-management-dashboard.component.ts:5911` (team FAQ).

---

## 8. `modal-gerenciar-pontos-avulsos` (+ sub-components) — `PontosAvulsosService`

Opened by `ModalGerenciarPontosAvulsosProvider` (`src/app/providers/modal-gerenciar-pontos-avulsos.provider.ts:28`),
used by `src/app/pages/dashboard/season/season.component.ts:116`.
All calls go through `ApiProvider` (base `backend_url_base`, JSON, auto-logout on 401/403) except the two
noted below. `SeasonDatesService` supplies the ISO season window (`pontos-avulsos.service.ts:310-311`).

| Method | HTTP | Params / body | Trigger |
|---|---|---|---|
| `getActionTemplates()` (`:172-176`) | `GET /action` | — | Modal init: activity-type dropdown (`modal-gerenciar-pontos-avulsos.component.ts`, `…-refatorado.component.ts`) |
| `getUsers(timeId)` (`:1430-1432`) | `GET /team/{timeId}/users` | — | Executor selector |
| `getAtividadesPendentesModal` / `FinalizadasModal` / `AprovadasModal` / `CanceladasModal` (`:293`, `:390`, `:550`, `:768`) → `getUserActions` (`:1135`) | `GET /user-action/search` (`:1154`, `:1222`) | `created_at_start`, `created_at_end` (season ISO), `dismissed`, `page`, `limit`, repeated `status` (e.g. `status=PENDING&status=DOING`), plus `team_id` **or** `user_email`; optional `executor_email`, `created_at_start/end`, `finished_at_start/end` overrides (`:1157-1206`). Text search is applied on the frontend, **not** sent (`:1182`) | Tab switch, pagination, filter apply |
| `getProcessosPendentes/Incompletos/Entregues/Cancelados` (`:844`, `:870`, `:896`, `:922`) → `getGameDeliveries` (`:1017`) | `GET /game/team-deliveries` (team) or `GET /game/deliveries` (user) (`:1026-1028`) | `status`, `start`, `end`, + `team` or `user` (`:1030-1042`) | "Processos" tab |
| `getGameActions` (private, `:951`) | `GET /game/team-actions` or `GET /game/actions` (`:960-962`) | `status`, `start`, `end`, + `team` or `user` | internal activity fetch |
| `getTeamActions` (`:1064`) | `GET /game/team-actions` (`:1081`) | `status`, `team`, `start`, `end` | team activity fetch |
| `processAction(payload)` (`:1373-1384`) | `POST /game/action/process` | body `ProcessActionPayload` = `{status, user_email, action_id, delivery_id, delivery_title, created_at, integration_id, comments: [], approved, approved_by, dismissed, finished_at?, comment?}`; `updated_by` is stripped before send (`:1377-1381`, builder `:1460-1497`) | Assign / finish / approve / reject flows, incl. `detalhe-atividade` and `formulario-atribuicao` |
| `aprovarAtividade(...)` (`:1514`) | same `POST /game/action/process` | `status:'DONE'`, `approved:true`, `approved_by: currentUserEmail` (`:1528-1541`) | `modal-confirmar-aprovacao` |
| `finalizarAtividade(...)` (`:1568`) | same | `status:'DONE'`, `approved:false`, `approved_by:null`, `dismissed:false` (`:1575-1588`) | `modal-confirmar-finalizacao` |
| `cancelarAtividadeComComentario` / `bloquearAtividadeComComentario` / `reprovarAtividadeComComentario` (`:1658`, `:1724`, `:1771`) | `POST /game/action/process` (+ `POST /user-action/{id}/comment`) | status change + comment | `modal-motivo-cancelamento`, `modal-confirmar-bloqueio`, `modal-motivo-reprovacao` |
| `atualizarStatusAtividade(...)` (`:1400-1415`) | `PUT /game/action/status` | `{id, status, user_email, updated_at}` (`:1408-1413`) | status toggles |
| `desbloquearAtividade(deliveryId, finishedAt)` (`:1610-1618`) | `POST /game/delivery/{deliveryId}/complete` | `{finished_at}` | unlock |
| `cancelarDelivery(id)` (`:1812-1815`) | `POST /game/delivery/{id}/cancel` | `{}` | `modal-confirmar-cancelar-delivery` |
| `completarDelivery(id)` (`:1829-1832`) | `POST /game/delivery/{id}/complete` | `{}` | `modal-confirmar-completar-delivery` |
| `desfazerDelivery(id)` (`:1846-1849`) | `POST /game/delivery/{id}/undeliver` | `{}` | `modal-confirmar-desfazer-delivery` |
| `restaurarDelivery(id)` (`:1863-1866`) | `POST /game/delivery/{id}/restore` | `{}` | `modal-confirmar-restaurar-delivery` |
| `adicionarComentario(...)` (`:2045-2060`) | `POST /user-action/{userActionId}/comment` | `{message, created_by, type ∈ CANCEL/BLOCK/FINISH/DENY/APPROVE}` (`:2052-2056`) | `comentarios` sub-component (`comentarios.component.ts`) |
| `uploadAnexos(...)` (`:2076-2095`) | `PUT {backend_url_base}/user-action/{userActionId}/attachment` — **raw `HttpClient`** to avoid the JSON `Content-Type` (`:2090-2095`) | `FormData` with repeated `files` key (`:2083-2086`); typed errors `FILE_TOO_LARGE`, `INVALID_CONTENT_TYPE`, `UNAUTHORIZED` (`:2100-2120`) | `upload-anexos` sub-component |
| `buscarAnexos(id)` (`:2133-2139`) | `GET /user-action/{id}/attachment` | — | `upload-anexos` load |
| `getDownloadUrl(attachmentId)` (`:2172-2182`) | `GET {backend_url_base}/user-action/download-attachment/{attachmentId}` — **raw `HttpClient`** (`:2178-2182`) | returns `{download_url}` (`:2185-2190`) | attachment download click |
| `getCurrentUserEmail()` (`:1299`) | `GET /auth/user` via `AuthProvider.userInfo()` (`:1340`) | — | prerequisite for approve / update flows; memoized in `cachedUserEmail` + in-flight `userEmailPromise` (`:1345-1364`), cleared by `clearUserEmailCache()` (`:162-166`) |

`comentarios.component.ts:87` shows a `buscarComentarios(...)` call **commented out**; no such method exists
in the service — comments arrive embedded in `/user-action/search` items.

---

## 9. CNPJ / company-name lookup path

### 9.1 `CnpjLookupService` (`src/app/services/cnpj-lookup.service.ts`)

- **Target URL:** `joinApiPath(backend_url_base, '/database/empid_cnpj__c')` + `/aggregate?strict=true`
  (`:28-31`, `:61`, `:162`).
- **`fetchCnpjByEmpids(empids)`** (`:40`) — body `[{ $match: { _id: { $in: empidStrings } } }]` with ids coerced
  to **strings** (`:52-58`); header `Content-Type: application/json` (`:45-47`); batch size 100.
- **`fetchCnpjByFullCnpj(fullCnpjs)`** (`:149`) — body `[{ $match: { cnpj: { $in: fullCnpjs } } }]` (`:158-160`),
  used for masked 14-digit CNPJs detected by `isFullCnpj` (`:139-143`).
- **Pagination:** `fetchAllPaginatedCnpj` sets `Range: items={startIndex}-{batchSize}` and recurses while a page
  is full (`:88-131`).
- **⚠ Currently disabled:** before any request, if the URL contains `/aggregate` the method logs
  `[CnpjLookup] POST aggregate Funifier desativado; sem enriquecimento empid→CNPJ.` and returns the accumulated
  (empty) list (`:102-105`). Since both entry points always append `/aggregate?strict=true`, **no HTTP request
  is issued today** and `this.http.post` at `:107` is unreachable.
- **Public API & degradation:** `getCompanyName` (`:224`), `enrichCnpjList` (`:248`), `enrichCnpjListFull`
  (`:263`), `getFullEntries` (`:341`). With the guard active, every key maps to `{ empresa: <original cnpj> }`
  (`:293-320`), i.e. raw CNPJ/empid strings are shown instead of clean names. `clearCache()` is a no-op (`:375-377`).
- **`extractEmpid`** (`:195`): ≤8 digits → the value itself; otherwise the number captured by `\[(\d+)\|`
  (`:207-212`).
- **Consumers:** `modal-carteira` (§2.2b), `modal-company-carteira-detail` (§3.1), `modal-player-detail`
  (§6.2, §6.5), `modal-progress-list` (§5.5).

### 9.2 `CompanyMapper` (`src/app/services/company-mapper.service.ts`) — **no HTTP**

Pure mapper (`toCompany` `:19`, `toCompanyDetails` `:53`, status normalizers `:113`, `:130`); depends on
`KPIMapper` (`:9`). Consumed by `CompanyService` (§4).

### 9.3 `SupabaseCompaniesService` (`src/app/services/supabase-companies.service.ts`) — PostgREST

- **Transport:** `createClient(url, anonKey, { db: { schema: environment.supabaseDbSchema } })` (`:174-188`).
- **Request:** `from(table).select('*').contains('responsaveis', JSON.stringify([{ email }]))`, i.e.
  `GET {supabaseUrl}/rest/v1/{supabaseCompaniesTable}?select=*&responsaveis=cs.[{"email":"…"}]`, **one request
  per e-mail**, merged with `forkJoin` (`:197`, `:212-218`, `:220-235`). The `contains` (`@>`) operator replaced an earlier ILIKE
  that produced Postgres error 42883 on the `jsonb` column (`:204-211`). Table from
  `environment.supabaseCompaniesTable` (default `companies`, `environment.ts:84-86`).
- **Returns:** `SupabaseCompanyRow` — `{id, cnpj, emp_id, razao_social, fantasia, status, client_type_id, synced_at, created_at, responsaveis}`
  normalized at `:245-264`; CNPJ coerced back to 14 digits with leading zeros (`:266-284`).
- **Public API:** `getCompaniesForEmails` (`:32`), `getCompaniesForPlayer` (`:56`), `getCnpjListForPlayer`
  (`:65`), `getCnpjListForEmails` (`:71`), `applyRowsToCnpjMaps` (`:77`), `parseResponsaveis` (`:94`), `usesMock` (`:24`).
- **Mock / guard chain** (in order, `:33-54`):
  1. empty e-mail list → `of([])`;
  2. `usesMock()` (default **true**) → `SUPABASE_COMPANIES_MOCK` rows, all rows when
     `supabaseMockFeedAllUsers` (`:138-161`) — **no network**;
  3. mock off but URL/anon key empty → console warning + `of([])` (`:42-49`). Because
     `environment.supabaseUrl` is hard-coded `''` (`environment.ts:50`) this branch is what triggers when the
     mock is disabled — **PostgREST is effectively unreachable from the default bundle**;
  4. otherwise the real query, with `catchError` → `of([])` and an explicit "não vamos devolver dados mock"
     note (`:236-241`).
- **Dedupe:** `dedupeById` on `companies.id` when `dedupe` is true (`:163-172`).
- **KPI join:** `CompanyKpiService.enrichCarteiraFromSupabase(rows)` crosses `companies.id ↔ EmpID`, then the
  `emp_id` column, then CNPJ (`company-kpi.service.ts:603-625`, resolvers `:266-305`, `:564-601`).

### 9.4 `CompanyKpiService` — the BWA gamificação hook

Single endpoint, described fully in §2.2a:
**`GET {environment.gamificacaoApiUrl}`** with header `x-api-token`
(`company-kpi.service.ts:522-551`; default host `https://hook.bwa.global:3334/gamificacao`,
`environment.ts:103-105`).
No query params, no body, no pagination. 10-minute single-slot cache; `shareReplay(refCount:false)`;
empty-maps fallback on missing config or HTTP error.
Public enrichment entry points, all reading the same snapshot:
`getKpiData` (`:178`), `enrichCarteiraRowsWithMaps` (`:564`), `enrichCarteiraFromSupabase` (`:603`),
`enrichFromCnpjResp` (`:627`), `enrichFromParticipacaoRowKeys` (`:679`), `enrichCompaniesWithKpis` (`:761`),
`fetchGamificacaoMapsAsync` (`:557`), `prefetchGamificacaoSnapshot` (`:884`).
Percentages arrive as BR-formatted strings and are parsed by `parsePorcEntregas` (`:398-414`); the KPI target
comes from `getOnTimeDeliveryGoalForMonth` inside `mapToKpiData` (`:840-841`).

### 9.5 `HelpService` (`src/app/services/help.service.ts`)

- **`POST https://integrador-n8n.grupo4u.com.br/webhook/c43002e5-a4de-4e52-9b93-1ae39e0d38b6`**
  (`:15-17`, `:20-24`), header `Content-Type: application/json`.
- **Body:** `{ nome, email, descricao, pagina: window.location.href, timestamp: new Date().toISOString() }`
  (`:5-11`, `:26-32`).
- **Trigger:** `c4u-help-button` form submit (`c4u-help-button.component.ts:70-72`).
- The host is whitelisted in `AuthInterceptor`, so **no `Authorization` / `client_id`** is attached
  (`auth.interceptor.ts:31`).

### 9.6 `HelpTextsService` (`src/app/services/help-texts.service.ts`)

- **`GET assets/help-texts.json`** — relative static asset, not an API call (`:55`).
- **Returns:** `{ [key]: string }` help-text dictionary; consumed by `c4u-info-button` tooltips.
- **Caching:** one request per app lifetime via `shareReplay(1)` on the memoized `helpTexts$` (`:53-63`);
  `clearCache()` resets it (`:79-81`).
- **Fallback:** on any error, the hard-coded `defaultTexts` map (`:31-48`, `:56-60`), and `getHelpText`
  returns `''` for unknown keys (`:70-75`).
- Also exports non-HTTP helpers `ENTREGAS_JUSTIFICADAS_META_DISCLAIMER` (`:14-15`) and
  `buildEntregasNoPrazoHelpText` (`:18-25`), reused by `modal-company-carteira-detail`
  (`modal-company-carteira-detail.component.ts:21`, `:48`).

---

## 10. Organization-hierarchy modals

Both live under `src/app/modals/` and are used only by
`src/app/pages/dashboard/organization-hierarchy-report/organization-hierarchy-report.component.html`.

### 10.1 `modal-organization-hierarchy-kpi-detail`

Injected: `ActionLogService`, `OrgHierarchyExportJobService`, `ToastService`
(`modal-organization-hierarchy-kpi-detail.component.ts:129-134`).

| Trigger | Service call | Endpoint | Params |
|---|---|---|---|
| Modal open, KPI is a deliveries drill-down (`:632-639`) | `fetchOrganizationHierarchyDeliveries` (`action-log.service.ts:1077`) | `GET {backend_url_base}/game/reports/organization/hierarchy-report/deliveries` (`game4u-api.service.ts:1329-1385`) | `month=YYYY-MM`, `drilldown`, optional `node_type`, `node_id`, `company_serve_key`, `issue`, `dedupe_deliveries`, `include_hierarchy` (`:1345-1377`) |
| Modal open, generic KPI (`:663-670`) | `fetchOrganizationHierarchyKpiDetail` (`action-log.service.ts:862`) | `GET …/hierarchy-report/kpi-detail` (`game4u-api.service.ts:1077-1109`) | `month`, `kpi`, `months` (default 4), optional `node_type`, `node_id` (`:1095-1103`). 404 → `of(null)` (`action-log.service.ts:899-902`) |
| Critical-client drill-down (`:687-700`) | same deliveries endpoint with `drilldown:'critical_client'`, `company_serve_key`, `issue:'all'` | as above | HTTP 400 surfaces the toast "Lista muito grande; use visão resumida…" (`:716-722`) |
| "Exportar clientes atendidos" (`:907`) | `OrgHierarchyExportJobService.startClientsServedExport` (`org-hierarchy-export-job.service.ts:85`) | async: `POST …/hierarchy-report/exports` (`game4u-api.service.ts:1250-1274`, body `Game4uReportsOrganizationHierarchyExportJobBody` incl. `month`) → poll `GET …/hierarchy-report/exports/{jobId}` every **2000 ms** (`org-hierarchy-export-job.service.ts:32`, `:222`, `game4u-api.service.ts:1277-1296`) → `GET …/hierarchy-report/exports/{jobId}/download` as `Blob` with `observe:'response'` (`game4u-api.service.ts:1301-1323`). Legacy sync fallback when the async endpoint is unavailable or `ORG_HIERARCHY_ASYNC_EXPORT=false`: `GET …/hierarchy-report/clients-served/export/xlsx` (`:1157-1194`) or `GET …/hierarchy-report/critical-clients/deliveries/export` (`:1197-1240`) (`org-hierarchy-export-job.service.ts:126-160`, `:176-182`; flag at `environment.ts:35-38`) | export params `month`, `node_type`, `node_id`, `issue`, `company_serve_key`, `dedupe_deliveries` |

Dedupe for all read endpoints: `shareGame4uDedupe` keyed by month + kpi/drilldown + node
(`game4u-api.service.ts:1090`, `:1341`) with `shareReplay({bufferSize:1, refCount:false})` and key eviction on
error (`:175-190`); plus `ActionLogService` TTL caches (`action-log.service.ts:889`, `:1049`).
The `c4u-org-hierarchy-export-jobs` component only renders `exportJobService.jobs$` and issues **no HTTP itself**
(`c4u-org-hierarchy-export-jobs.component.ts:21-31`).

### 10.2 `modal-organization-hierarchy-critical-clients` — **no HTTP**

Injected: `ToastService` only (`modal-organization-hierarchy-critical-clients.component.ts:41-44`). Data arrives via
`@Input() summary` (`:31-33`); export is a local XLSX build that toasts success/failure (`:118`, `:135`, `:139`);
row clicks emit `clientDrillDown` (`:36`) so the parent opens §10.1.

---

## 11. `modal-pending-quests` + `modal-details-painel-info.provider`

- `ModalPendingQuestsComponent` injects `SessaoProvider` and `AliasService`
  (`modal-pending-quests.component.ts:14`) and issues **no HTTP of its own**. It renders whatever the
  `dataApi(page, pageSize)` callback returns.
- `ModalDetailsPainelInfoProvider` (`src/app/providers/modal-details-painel-info.provider.ts`) injects only
  `NgbModal` + `LOCALE_ID` (`:23-24`) — **no HTTP**. `abreModal` opens the modal (`:26-29`); `infoToTypes`
  wraps each `PainelInfoModel.extras.dataApi` into a tab (`:31-59`); `getDetailsQuests` / `getDetailsMacros`
  format rows (`:61`, `:85`).
- The actual requests come from the callers, `dados-mes-atual` / `dados-mes-anterior`:
  - `MesAtualService.getGameActions(status, page, pageSize, id, tipo)` →
    `GET {backend_url_base}/game/team-actions` (team) or `GET {backend_url_base}/game/actions` (user)
    with `status`, `start`, `end` (first/last day of the month, UTC) and `team` **or** `user`
    (`mes-atual.service.ts:80-104`). Triggered by the "pending"/"completed activities" tabs
    (`dados-mes-atual.component.ts:83-88`, `:146-151`).
  - `MesAtualService.getGameDeliveries(...)` → `GET …/game/team-deliveries` or `GET …/game/deliveries`
    with the same shape (`mes-atual.service.ts:106-131`), for `PENDING` / `INCOMPLETE` / `DELIVERED` process
    tabs (`dados-mes-atual.component.ts:192-193`, `:211-212`, `:230-231`).
  - `MesAnteriorService` mirrors both (`mes-anterior.service.ts:92-107`, `:123-138`).
  - Panel totals use `GET /game/stats` / `GET /game/team-stats` (`mes-atual.service.ts:14`, `:43-49`;
    `mes-anterior.service.ts:14`, `:45-51`).
  - `page` / `pageSize` are accepted but **never sent** — the provider notes
    `TODO Paginar consultas do game action` (`modal-details-painel-info.provider.ts:44-46`).

---

## 12. Shared components under `src/app/components/`

Grep for injected services across `src/app/components` and `src/app/modals` (constructor parameter types
matching `*Service|*Provider|Api|Client|HttpClient`) produced the full list; the components below are the only
ones with a service dependency that can reach the network.

### 12.1 Components that **do** trigger HTTP (indirectly)

| Component | Injected | HTTP reached | Trigger | Consumer / caching |
|---|---|---|---|---|
| `c4u-seletor-mes` | `SessaoProvider`, `SeasonDatesService`, `ActionLogService` (`c4u-seletor-mes.component.ts:50-54`) | (a) `SeasonDatesService.getSeasonDates()` → `CampaignService` → **`GET {backend_url_base}/campaign`** with `Content-Type` + `client_id` headers (`campaign.service.ts:61-78`). (b) `ActionLogService.getPlayerActionLogForMonth(playerId, 2026-01-01)` → `POST …/database/action_log/aggregate?strict=true` (disabled) | (a) `ngOnInit` → `initializeMonths()` (`:56-57`, method `:73`, season fetch at `:77`). (b) `checkAndIncludeJanuary()` (`:137`, called from `:108` / `:188`), **only when the clock is Feb-2026 or later** (`:150-157`) | (a) season bounds for the month list; single-flight `loadPromise` + `currentCampaign` memo (`campaign.service.ts:24`, `:38-58`), falls back to `getDefaultCampaign()` on failure (`:83-87`, `:134`). (b) decides whether January is appended to `PREV_MONTHS` (`:161-180`); errors swallowed (`:182-184`) |
| `c4u-help-button` | `HelpService` (`c4u-help-button.component.ts:26`) | `POST https://integrador-n8n.grupo4u.com.br/webhook/c43002e5-…` (§9.5) | Form submit → `onSubmit()` (`:70-72`) | n8n webhook response only drives the success/error state; no caching |
| `c4u-info-button` | `HelpTextsService` (`c4u-info-button.component.ts:31`) | `GET assets/help-texts.json` (§9.6) | `ngOnInit` (`:33-34`) and on `infoKey`/`customText` change (`:37-41`); request in `updateHelpText()` (`:53`, `:57`, `:70`) | tooltip text; app-lifetime `shareReplay(1)` cache, so only the first info button triggers the fetch |
| `c4u-dashboard-insights` | `FeaturesService` (`:21`) — reaches `SystemParamsService` → `GET {backend_url_base}/client/system-params` (`system-params.service.ts:162-177`) | feature-flag read, not a per-render request | component render | Insight data itself arrives via `@Input() insights` (`:28`), produced by `DashboardInsightsService` → `ActionLogService.getTeamUserActionsForInsightsMonth` → 2 × `GET /game/reports/user-actions` per scope (`dashboard-insights.service.ts:663-680`, `action-log.service.ts:1595`, `:1616-1618`) — the **same cached slices** as §5.1 |
| `c4u-dashboard-navigation` | `SessaoProvider`, `UserProfileService` (`:63-68`) | **none** — `UserProfileService` only reads session + `TeamCodeService` (`user-profile.service.ts:29-32`) | role check on `ngOnInit` (`:70-75`) | filters the visible dashboards |
| `c4u-game-rules-update-banner` | `GameRulesUpdateService` (`:17-20`) | **none** — no `HttpClient` in the service | `ngOnChanges` → `refreshAnnouncements()` (`:22-24`, method `:35`) | local announcements + `localStorage` dismissal |
| `c4u-org-hierarchy-export-jobs` | `OrgHierarchyExportJobService` (`:21-24`) | **none directly** — subscribes to `jobs$` (`:26-31`); the HTTP is issued by §10.1 | job list render | progress/toast UI |
| `c4u-productivity-analysis-tab` | `GraphDataProcessorService` (`:103`) | **none** — pure transformation service | `ngOnInit` + debounced (300 ms) `chartDataUpdate$` (`:105-115`) | chart datasets from `@Input()` data |

### 12.2 Components with **no service dependency at all** (no constructor → no HTTP)

Verified by inspecting each file for a `constructor(...)`:

`c4u-company-table`, `c4u-point-wallet`, `c4u-season-progress`, `c4u-season-level`,
`c4u-activity-progress`, `c4u-kpi-circular-progress`, `c4u-monthly-points-goal-progress`,
`c4u-grafico-barras`, `c4u-goals-progress-tab`, `c4u-team-selector`, `c4u-painel-info`,
`c4u-time-period-selector`. (`c4u-collaborator-selector` only injects `ChangeDetectorRef` —
`c4u-collaborator-selector.component.ts:24`.)

All of these are pure `@Input()`/`@Output()` presentational components. Their data is fetched by the parent
dashboard pages and passed down; their clicks emit events that open the modals documented above — e.g.
`c4u-activity-progress` card clicks open `modal-progress-list` via `onProgressCardClicked()`
(`gamification-dashboard.component.ts:1704-1735`), `c4u-company-table` row selection opens
`modal-company-detail` via `onCompanySelected()` (`:1644-1649`), and `c4u-dashboard-insights` alert clicks open
`modal-progress-list` filtered by focus via `onInsightsAlertClicked()` (`:1752-1766`).
`c4u-kpi-circular-progress`, `c4u-point-wallet`, `c4u-season-level` and `c4u-season-progress` embed
`c4u-info-button` in their templates, which is how they indirectly cause the `assets/help-texts.json` read.

---

## 13. Endpoint index

### `{environment.backend_url_base}` — Game4U REST

`GET /game/reports/finished/deliveries` · `GET /game/reports/finished/deliveries/cached` ·
`GET /game/reports/finished/actions-by-delivery` · `GET /game/reports/user-actions` ·
`GET /game/reports/team/daily-pending-stats` ·
`GET /game/reports/organization/hierarchy-report/kpi-detail` ·
`GET /game/reports/organization/hierarchy-report/deliveries` ·
`POST /game/reports/organization/hierarchy-report/exports` ·
`GET /game/reports/organization/hierarchy-report/exports/{jobId}` ·
`GET /game/reports/organization/hierarchy-report/exports/{jobId}/download` ·
`GET /game/reports/organization/hierarchy-report/clients-served/export/xlsx` ·
`GET /game/reports/organization/hierarchy-report/critical-clients/deliveries/export` ·
`GET /game/actions` · `GET /game/team-actions` · `GET /game/deliveries` · `GET /game/team-deliveries` ·
`GET /game/stats` · `GET /game/team-stats` ·
`POST /game/action/process` · `PUT /game/action/status` ·
`POST /game/delivery/{id}/complete` · `/cancel` · `/undeliver` · `/restore` ·
`GET /user-action/search` · `POST /user-action/{id}/comment` ·
`PUT /user-action/{id}/attachment` · `GET /user-action/{id}/attachment` ·
`GET /user-action/download-attachment/{id}` ·
`GET /action` · `GET /team/{timeId}/users` · `GET /player/{playerId}` ·
`GET /campaign` · `GET /client/system-params` · `GET /auth/user` · `POST /auth/refresh`

### `{environment.backend_url_base}` — Funifier-style aggregate (**all disabled by the `aggregate` guard**)

`POST /database/action_log/aggregate?strict=true` ·
`POST /database/cnpj_performance__c/aggregate?strict=true` ·
`POST /database/metric_targets__c/aggregate?strict=true` ·
`POST /database/empid_cnpj__c/aggregate?strict=true`

### `{environment.gamificacaoApiUrl}`

`GET /` (the configured hook URL itself), header `x-api-token`

### Supabase PostgREST (`{environment.supabaseUrl}` — empty in the default bundle)

`GET /rest/v1/{supabaseCompaniesTable}?select=*&responsaveis=cs.[{"email":"…"}]` (via `@supabase/supabase-js`)

### External / static

`POST https://integrador-n8n.grupo4u.com.br/webhook/c43002e5-a4de-4e52-9b93-1ae39e0d38b6` ·
`GET assets/help-texts.json` ·
`https://zarptqqopvuwognexpon.supabase.co/storage/v1/object/public/rulebook/bwa-pdf/*.pdf` (anchor hrefs, not XHR)
