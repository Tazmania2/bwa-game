# HTTP endpoint map — SUPERVISOR vs SUPERVISOR TÉCNICO dashboards

Evidence-based trace of every HTTP request reachable from the two pages. Every claim carries a `file:line` citation. `*.spec.ts` ignored. **No endpoint in this document was inferred — each one is a literal string in the source.**

---

## 0. Base URLs, headers, and two global "kill switches" you must read first

### 0.1 Base URLs in play

| Base | Value | Source |
|---|---|---|
| `API_BASE` (Game4U/BWA backend) | `environment.backend_url_base` = `readBackendUrlBaseFromProcessEnv()` → `G4U_API_BASE` \|\| `g4u_api_base` \|\| `BACKEND_URL_BASE` \|\| `backend_url_base` (build-time env) | `src/environments/environment.ts:20`, `src/environments/backend-url.ts:32-51` |
| `GAMIFICACAO_API` | `environment.gamificacaoApiUrl`, default `https://hook.bwa.global:3334/gamificacao` | `src/environments/environment.ts:103-106` |
| `SUPABASE` (PostgREST) | `environment.supabaseUrl` — **hardcoded to `''`** (deliberately not read from env) | `src/environments/environment.ts:50` |
| static asset | `assets/help-texts.json` (same-origin) | `src/app/services/help-texts.service.ts:55` |

Path joining: `joinApiPath(base, path)` → `${base}${path}` (`src/environments/backend-url.ts:53-57`).

### 0.2 Headers added automatically

* `Game4uApiService` adds `client_id: <environment.client_id>` on every `/game/*` request — `src/app/services/game4u-api.service.ts:1602-1605`.
* `AuthInterceptor` adds `client_id` + `Authorization: Bearer <session token>` to every request whose origin equals `backend_url_base`; refreshes via `POST {API_BASE}/auth/refresh` when the JWT is <5 min from expiry — `src/app/providers/auth.interceptor.ts:161-197`, `:225-245`.
* `/campaign` is whitelisted (no session required, but Bearer still attached if present) — `src/app/providers/auth.interceptor.ts:22-32`.
* `GameReportsInterceptor` retries **any** `GET …/game/reports/**` **once** after 1500 ms on a Snowflake-unavailable 503, then raises a toast — `src/app/providers/game-reports.interceptor.ts:26-46`.
* `BackendApiService` adds `retry({count:2})` on GET and `retry({count:3})` on POST — `src/app/services/backend-api.service.ts:97`, `:120`.
* Requests carrying `x-api-token` to the gamificação origin bypass the auth interceptor entirely — `src/app/providers/auth.interceptor.ts:79-102`, `:109-111`.

### 0.3 KILL SWITCH #1 — every Funifier `aggregate` call is disabled client-side

`BackendApiService.get()` and `.post()` **short-circuit and return `of([])` without any network I/O** whenever the endpoint string contains `aggregate` (case-insensitive):

```
src/app/services/backend-api.service.ts:88-91   // GET  → console.warn('[Backend API] GET aggregate desativado', …); return of([])
src/app/services/backend-api.service.ts:104-107 // POST → console.warn('[Backend API] POST aggregate desativado', …); return of([])
```

**Consequence:** *all* of the following, which both pages call, produce **zero HTTP requests** and resolve to `[]`:

| Would-be request | Caller | Cite |
|---|---|---|
| `POST {API_BASE}/database/player_status/aggregate?strict=true` | `DashboardSupervisorComponent.fetchTeamMembers` | `dashboard-supervisor.component.ts:310-320` |
| `POST {API_BASE}/database/player_status/aggregate?strict=true` | `DashboardSupervisorComponent.loadParticipacaoEquipe` | `dashboard-supervisor.component.ts:588-592` |
| `POST {API_BASE}/database/player_status/aggregate?strict=true` | `…TecnicoComponent.loadTeamMembersData` | `dashboard-supervisor-tecnico.component.ts:328-332` |
| `POST {API_BASE}/database/player_status/aggregate?strict=true` (cnpj_goal projection) | `…TecnicoComponent.loadTeamKPIs` | `dashboard-supervisor-tecnico.component.ts:603-606` |
| `POST {API_BASE}/database/player_status/aggregate?strict=true` (entrega projection) | `…TecnicoComponent.loadTeamKPIs` | `dashboard-supervisor-tecnico.component.ts:652-655` |
| `POST {API_BASE}/database/acl__c/aggregate?strict=true` | `ACLService.getAclMetadata` | `src/app/services/acl.service.ts:135-138` |
| `POST {API_BASE}/database/action_log/aggregate?strict=true` | `TeamAggregateService.getTeamMembers` → `executeAggregateQuery` | `team-aggregate.service.ts:229-231`, `:437-441`, `:453` |
| `POST {API_BASE}/database/cnpj_performance__c/aggregate?strict=true` | `CompanyService.getCompanyDetails` (modal-company-detail) | `src/app/services/company.service.ts:41-44` |
| `POST {API_BASE}/database/cnpj_performance__c/aggregate?strict=true` | `KPIService.getCompanyKPIs` (modal-company-carteira-detail) | `src/app/services/kpi.service.ts:226-229` |
| `POST {API_BASE}/database/action_log/aggregate?strict=true` (`Range: items=N-100`) | `ActionLogService.fetchActionLogPage` | `action-log.service.ts:1859-1862` |

`CnpjLookupService` has its **own** identical guard: `fetchAllPaginatedCnpj` returns early when the URL contains `/aggregate`, so `POST {API_BASE}/database/empid_cnpj__c/aggregate?strict=true` also never fires — `src/app/services/cnpj-lookup.service.ts:102-105` (URL built at `:28-32`; aggregate URL at `:61` and `:162`).

`PlayerService.getPlayerCompanyData` is stubbed to `of(new Map())` — so `getPlayerCnpj()` / `getPlayerCnpjResp()` are **no-op, no HTTP** — `src/app/services/player.service.ts:242-245`, `:259-273`.

### 0.4 KILL SWITCH #2 — Supabase is mock-only

`environment.supabaseUrl` is `''` (`src/environments/environment.ts:50`) and `supabaseUseMock` defaults to `true` (`:92-96`).
`SupabaseCompaniesService.getCompaniesForEmails` therefore returns in-memory mock rows (`supabase-companies.service.ts:32-40`) and, if mock were disabled, returns `of([])` with a console warning because URL/key are empty (`:42-49`). The PostgREST branch (`@supabase/supabase-js` → `GET {SUPABASE}/rest/v1/{supabaseCompaniesTable}?select=*&responsaveis=cs.[{"email":…}]`) is only reachable if a build injects `supabaseUrl` — `supabase-companies.service.ts:196-215`.

### 0.5 `isGame4uDataEnabled()` — the gate for all `/game/*` traffic

`true` when `useGame4uApi !== false` **and** `backend_url_base` is non-empty — `src/app/model/game4u-api.model.ts:1848-1859`; `useGame4uApi` defaults `true` (`src/environments/environment.ts:113-116`). `Game4uApiService.isConfigured()` = `baseUrl.length > 0` (`game4u-api.service.ts:152-154`).

**Net effect: with a configured `API_BASE`, the only live traffic from these two pages is `GET /auth/user`, `GET /campaign`, `GET /v3→/player/{id}/status`, `GET /player/{id}`, `GET /game/*`, and the gamificação hook.**

---

## 1. SUPERVISOR — `/dashboard/supervisor`

Route: `src/app/pages/pages.routing.ts:28-33` (guard `DashboardRedirectGuard`, session-only, **no HTTP** — `src/app/guards/dashboard-redirect.guard.ts:30-107`).

`ngOnInit` (`dashboard-supervisor.component.ts:131-138`) calls `cacheManagerService.clearAllCaches()` **first** — this wipes ~17 service caches (action-log, player, companyKpi, company, kpi, teamStats, teamAggregate, ACL, acesso, campaign, bwaTeamApi, alias, goalsConfig, ranking, helpTexts, features) so **every dashboard load re-fetches everything** — `src/app/services/cache-manager.service.ts:51-104`. Then it fans out to `loadSupervisorInfoCard()`, `loadTeamPlayers()`, `loadCarteiraSupervisor()`.

### S-1 · `GET {API_BASE}/auth/user`

| | |
|---|---|
| **Method + URL** | `GET {API_BASE}/auth/user` |
| **Query / body** | none |
| **Service + method** | `PlayerService.getCurrentPlayerData()` — `src/app/services/player.service.ts:144`; reached through `getRawPlayerData(playerId)` because `getPlayerId()` always resolves to the session user, and `isCurrentSessionPlayerId()` short-circuits to the `/auth/user` branch — `player.service.ts:81-85`, `:59-74` |
| **Component trigger** | `loadSupervisorInfoCard()` at `dashboard-supervisor.component.ts:158`; called on `ngOnInit` (`:135`) and on every month change (`:687`) |
| **Returns** | Session player profile: `name`, `extra.cnpj_resp`, `extra.entrega_sup`, `extra.cnpj_goal` |
| **UI consumer** | Left info card: supervisor name, "Volume de clientes" count (= items in `extra.cnpj_resp`), `entrega_sup` %, and the two goal rows — `dashboard-supervisor.component.ts:161-181`; template `dashboard-supervisor.component.html:12-70` |
| **Caching / dedupe** | 15-min TTL cache keyed `'me'` + `inFlightCurrentPlayer$` single-flight + `shareReplay({bufferSize:1, refCount:true, windowTime:15min})` — `player.service.ts:26`, `:31-32`, `:135-141`, `:150`. `timeout(15000)` at `:146`. On month change `playerService.clearCache()` forces a refetch — `dashboard-supervisor.component.ts:685` |
| **Fallback** | On error: `console.error`, cache entry deleted, `supervisorInfo` stays `null`, loading flags cleared — `player.service.ts:151-157`; `dashboard-supervisor.component.ts:183-188` |

> Note: `getRawPlayerData` also has a branch issuing `GET {API_BASE}/player/{encodeURIComponent(id)}` for a *non-session* id (`player.service.ts:95-99`). On this page it is **unreachable** because the id always comes from the session.

### S-2 · `GET {API_BASE}/player/{playerId}/status`

| | |
|---|---|
| **Method + URL** | `GET {API_BASE}/player/{playerId}/status` — the literal is `/v3/player/{id}/status`, and `BackendApiService` strips the `/v3/` prefix before joining (`backend-api.service.ts:93-95`) |
| **Query / body** | none |
| **Service + method** | `ACLService.getPlayerCatalogItems()` — `src/app/services/acl.service.ts:87` |
| **Component trigger** | `loadTeamPlayers()` → `forkJoin({ teamIds: aclService.getAccessibleTeamIds(playerId), metadata: aclService.getAclMetadata() })` — `dashboard-supervisor.component.ts:206-209`; on `ngOnInit` (`:136`) and month change (`:689`) |
| **Returns** | Player status; only `catalog_items` is used. Team IDs = keys with `quantity > 0` (case-sensitive; zero-mapping `team_id === virtual_good_id`) — `acl.service.ts:105-109`, `:207-219` |
| **UI consumer** | Feeds the accessible-team list which drives the (disabled) member aggregates. In the current build the team-member aggregate is short-circuited, so the cards/table render the empty state "Nenhum jogador encontrado nas equipes acessíveis." — `dashboard-supervisor.component.html:120-122`, `:186-188` |
| **Caching / dedupe** | 5-min per-player in-memory cache — `acl.service.ts:60-63`, `:79-84`. Cleared at `ngOnInit` by `clearAllCaches()` |
| **Fallback** | Any failure → `of({})` → `[]` accessible teams → `switchMap` returns `of([])` and the whole team pipeline is skipped — `acl.service.ts:94-98`; `dashboard-supervisor.component.ts:216-218` |

### S-3 · `GET {GAMIFICACAO_API}` (BWA gamificação hook)

| | |
|---|---|
| **Method + URL** | `GET https://hook.bwa.global:3334/gamificacao` (or `GAMIFICACAO_API_URL`) |
| **Query / body** | none. Header `x-api-token: <environment.gamificacaoApiToken>` |
| **Service + method** | `CompanyKpiService.getGamificacaoMaps$()` — `src/app/services/company-kpi.service.ts:522-551` (http.get at `:539-540`) — invoked from `enrichFromCnpjResp()` (`:632`) and `enrichCompaniesWithKpis()` (`:780`) |
| **Component trigger** | Three call sites, all convergent on the same snapshot: `loadCarteiraSupervisor()` `:498`, `loadCarteiraEquipe()` `:550`, `loadParticipacaoEquipe()` `:623`. Fired on `ngOnInit`, on month change (`:695`), and lazily on `switchClientesTab()` (`:671-677`) |
| **Returns** | Flat list of company rows (`EmpID`, `CNPJ`, `porcEntregas`/`percEntregas`, `procFinalizados`, `procPendentes`, `regime`, plus name fields). Normalised into three lookup maps: `byEmpId`, `byCnpjNorm`, `byTitleNorm` — `company-kpi.service.ts:470-508` |
| **UI consumer** | All three **Clientes** tables: "Entregas" % column (`item.deliveryKpi.current`) and "Classificação" column (`item.classificacao`) — `dashboard-supervisor.component.html:307-330` (Carteira equipe), `:357-380` (Participação equipe), `:407-430` (Carteira supervisor) |
| **Caching / dedupe** | **10-min TTL** + `shareReplay({bufferSize:1, refCount:false})` → the three tabs share **one** network request — `company-kpi.service.ts:161`, `:522-551`. `refCount:false` is deliberate so an unsubscribe does not cancel the in-flight GET (`:547`) |
| **Fallback** | Missing url/token → `of({empty maps})` + warning, **no request** (`:526-530`). HTTP error → `of({empty maps})` (`:542-545`); the per-list `catchError` degrades each row to `{cnpj, cnpjId, actionCount:0, processCount:0}` (`:656-668`) |

### S-4 · (conditional) `GET {SUPABASE}/rest/v1/companies?select=*&responsaveis=cs.…`

Only when a build injects `supabaseUrl` **and** `SUPABASE_USE_MOCK=false`. One PostgREST request **per e-mail** via `forkJoin`, merged and deduped by `id` — `src/app/services/supabase-companies.service.ts:206-215`, `:217-231`.
Triggers: `loadCarteiraSupervisor()` → `getCompaniesForPlayer(playerId)` (`dashboard-supervisor.component.ts:484`); `loadCarteiraEquipe()` → `getCompaniesForEmails(emails, true)` (`:536`). Feeds `cnpjNameMap` / `cnpjStatusMap` / `cnpjNumberMap` (`supabase-companies.service.ts:76-91`) → the **Empresa** and **CNPJ** columns of the Clientes tables. Failure → `of([])`, never mock (`:227-231`).
In the default build this is mock data and issues **no HTTP**.

### S-5 · `GET {API_BASE}/campaign` (via `c4u-seletor-mes`)

| | |
|---|---|
| **Method + URL** | `GET {API_BASE}/campaign` |
| **Query / body** | none. Headers `Content-Type: application/json` + `client_id` |
| **Service + method** | `CampaignService.fetchCurrentCampaign()` — `src/app/services/campaign.service.ts:75-78` — through `SeasonDatesService.getSeasonDates()` (`season-dates.service.ts:68-82`) |
| **Component trigger** | `<c4u-seletor-mes>` `ngOnInit` → `initializeMonths()` → `getSeasonDates()` — `src/app/components/c4u-seletor-mes/c4u-seletor-mes.component.ts:56-58`, `:77`; template `dashboard-supervisor.component.html:80-83` |
| **Returns** | Campaign array; the active one is picked by `starts_at`/`finishes_at` window — `campaign.service.ts:99-129` |
| **UI consumer** | The month dropdown options / "Toda temporada" toggle |
| **Caching / dedupe** | Single-flight `loadPromise` + permanent `currentCampaign` memo — `campaign.service.ts:38-58`; `SeasonDatesService.seasonBoundsCache` (`season-dates.service.ts:12`, `:69-81`). Note `clearAllCaches()` clears `campaignService` at `ngOnInit` (`cache-manager.service.ts:82`) |
| **Fallback** | Any failure → synthetic `Temporada <year>` spanning Jan 1 → Dec 31 — `campaign.service.ts:84-86`, `:131-146` |

### S-6 · `GET assets/help-texts.json`

Same-origin static fetch by `HelpTextsService.getHelpTexts()` (`src/app/services/help-texts.service.ts:55`), used by `<c4u-info-button>` (`src/app/components/c4u-info-button/c4u-info-button.component.ts:57`, `:70`). **The SUPERVISOR template contains no `c4u-info-button`**, so this does not fire here — it does on SUPERVISOR TÉCNICO (see T-9). `shareReplay(1)`; 404 → built-in default texts (`help-texts.service.ts:56-61`).

### S-7 · Player Detail modal (row / card click)

`openPlayerDetail(player)` (`dashboard-supervisor.component.ts:406-410`) renders `<modal-player-detail>` with `[cnpjRespFromAggregate]="selectedPlayerForDetail.cnpjRespRaw"` and `[monthsAgo]="selectedMonthsAgo"` — `dashboard-supervisor.component.html:448-456`.

Because `cnpjRespFromAggregate` is always supplied, the modal **skips** `getRawPlayerData` and uses `of(cnpjResp)` — `src/app/modals/modal-player-detail/modal-player-detail.component.ts:124-130`.

#### S-7a · `GET {API_BASE}/game/reports/finished/deliveries/cached` — *month selected*

| | |
|---|---|
| **Method + URL** | `GET {API_BASE}/game/reports/finished/deliveries/cached` |
| **Query params** | `month=<YYYY-MM>`, `offset=0`, `limit=500`, `email=<player email>`. Clamps: `offset = max(0, floor(offset))`, `limit = min(max(floor(limit),1),500)` — `game4u-api.service.ts:576-577`, `:587-594` |
| **Service + method** | `ActionLogService.getPlayerCnpjListWithCount()` → `Game4uApiService.getGameReportsFinishedDeliveriesCached()` — `action-log.service.ts:3599-3606`; `game4u-api.service.ts:557-608` |
| **Component trigger** | `modal-player-detail.ngOnInit` → `loadCnpjData()` → `forkJoin({ nameMap, countList })` — `modal-player-detail.component.ts:83`, `:141-144` |
| **Returns** | `{refreshed_at, params, offset, limit, items[], total?, has_more?}`; each item `{delivery_title, delivery_id?, emp_id?, on_time_pct?, tasks_total?, tasks_on_time?, is_acessorias_*}` — `game4u-api.model.ts:214-224` (row shape `:171-190`), normaliser `:621-676` |
| **UI consumer** | Per-CNPJ `actionCount` in modal Tab 1 ("CNPJs") — `modal-player-detail.component.ts:145-149`, `:158-163` |
| **Caching / dedupe** | Two layers: `ActionLogService` TTL cache keyed `${playerId}_cnpj_list_count_${monthKey}_${tid}_ad` (`action-log.service.ts:3576-3582`, `:3617`) and `Game4uApiService.shareGame4uDedupe` keyed `rpt-del-cached\|email\|team_id\|month\|offset\|limit` with `shareReplay({bufferSize:1, refCount:false})` (`:547-552`, `:175-191`, `:578-586`) |
| **Fallback** | HTTP **404 → `of({offset, limit, items: []})`** (mês sem cache) — `game4u-api.service.ts:600-606`. Other errors → `of([])` (`action-log.service.ts:3611-3614`). Missing `email`+`team_id` or missing `month` → `throwError` **before** any request (`:559-575`) |

#### S-7b · `GET {API_BASE}/game/actions` ×2 — *"Toda temporada"* (`selectedMonthsAgo === -1`)

`getMonthDate()` returns `undefined` (`modal-player-detail.component.ts:96-100`), so `getPlayerCnpjListWithCount` takes the `month == null` branch and issues a `forkJoin` of two requests — `action-log.service.ts:3627-3632`:

* `GET {API_BASE}/game/actions?start=<ISO>&end=<ISO>&user=<email>&status=DONE`
* `GET {API_BASE}/game/actions?start=<ISO>&end=<ISO>&user=<email>&status=DELIVERED`

Definition `game4u-api.service.ts:1640-1666`. Range = campaign bounds, or `2000-01-01`…`2099-12-31` if campaign is unknown — `game4u-api.service.ts:301-334`. `team_id` is deliberately **not** sent when `user` is present (API rejects it) — `:196-206`. Dedupe key `actions|user:…|start|end|status` (`:255-257`).

#### S-7c · Tab 2 "Ações" — **no HTTP**

`actionLogService.getPlayerActionLogForMonth()` → `fetchActionLogPage` → disabled aggregate ⇒ `[]` — `modal-player-detail.component.ts:174`; `action-log.service.ts:1787`, `:1859-1862`; §0.3. `cnpjLookupService.enrichCnpjList()` likewise makes no request (§0.3), so company names fall back to the raw CNPJ string — `modal-player-detail.component.ts:159`.

### S-8 · Company Detail modal (CNPJ row click) — **no HTTP**

`onCnpjSelectedFromPlayerDetail` / `onCompanyDisplayClick` (`dashboard-supervisor.component.ts:419-423`, `:632-641`) open `<modal-company-detail>` (`dashboard-supervisor.component.html:459-463`), whose `ngOnInit` calls `CompanyService.getCompanyDetails()` → disabled `cnpj_performance__c` aggregate → `of([])` → the mapper throws "not found" → modal error path — `src/app/modals/modal-company-detail/modal-company-detail.component.ts:36-58`; `src/app/services/company.service.ts:41-58`.

### S-9 · Logout — **no HTTP**

`logout()` → `sessaoProvider.logout()` → `cacheManager.fullCleanup()` + `sessionStorage` clear + router navigate — `dashboard-supervisor.component.ts:761-777`; `src/app/providers/sessao/sessao.provider.ts:185-200`.

---

## 2. SUPERVISOR TÉCNICO — `/dashboard/supervisor-tecnico`

Route: `src/app/pages/pages.routing.ts:34-39`. This page does **not** call `clearAllCaches()`; `ngOnInit` → `initializeDashboard()` → `loadSeasonDates()` **then** `loadAvailableTeams()` → auto-selects `teams[0]` → `loadTeamData()` — `dashboard-supervisor-tecnico.component.ts:169-171`, `:177-197`, `:216-256`.

`loadTeamData()` orchestration (`:261-306`): `loadTeamMembersData` → `loadTeamActivityAndMacroData` → `Promise.all([loadSidebarData, loadCollaborators])` → `loadTeamCarteiraData` → `loadTeamKPIs` → `loadMonthlyPointsBreakdown`.

Date range: month start/end for `selectedMonthsAgo >= 0`; full season bounds when `-1` ("Toda temporada") — `:309-322`.

### T-1 · `GET {API_BASE}/campaign`

Same endpoint/behaviour as **S-5**, but here it is on the **critical path**: `initializeDashboard()` awaits `loadSeasonDates()` → `seasonDatesService.getSeasonDates()` → `CampaignService` → `GET /campaign` — `dashboard-supervisor-tecnico.component.ts:205-214`; `season-dates.service.ts:68-82`; `campaign.service.ts:75-78`. It also fires a second time conceptually from `<c4u-seletor-mes>` (`dashboard-supervisor-tecnico.component.html:82-85`) but the `loadPromise`/`currentCampaign` memo collapses it to one request (`campaign.service.ts:38-58`).
Used for `this.seasonDates`, the season-progress card date range (`c4u-season-progress`, `dashboard-supervisor-tecnico.component.html:44-48`), and the "Toda temporada" range (`:309-313`). Failure → `seasonDates = {now, now}` (`:210-212`) on top of the synthetic-campaign fallback.

### T-2 · `GET {API_BASE}/player/{playerId}/status` (ACL)

Identical to **S-2** (`acl.service.ts:87`), but here it is awaited via `Promise.all([getAccessibleTeamIds, getAclMetadata])` in `loadAvailableTeams()` — `dashboard-supervisor-tecnico.component.ts:223-226`.
**Returns** `catalog_items`; **UI consumer** is different from SUPERVISOR: it populates the **"Equipe / Departamento" `<select>`** and auto-selects the first team — `:229-247`; `dashboard-supervisor-tecnico.component.html:8-18`. Because `acl__c` metadata is unavailable (§0.3), option labels fall back to the raw team id (`:232-237`, `:924-927`). Empty result → `teams = []`, selector hidden, `isLoadingPlayers = false` (`:242-248`).

### T-3 · `GET {API_BASE}/game/team-actions` — member point counts

| | |
|---|---|
| **Method + URL** | `GET {API_BASE}/game/team-actions` |
| **Query params** | `start=<ISO>`, `end=<ISO>`, `team=<selectedTeamId>`. `user`/`status` omitted here. **`team_id` is never sent** on this endpoint — `game4u-api.service.ts:1729-1742` |
| **Service + method** | `TeamAggregateService.getTeamMemberActionLogCounts()` → `Game4uApiService.getGameTeamActions()` — `team-aggregate.service.ts:892-921`; `game4u-api.service.ts:1715-1743` |
| **Component trigger** | `loadTeamMembersData()` at `dashboard-supervisor-tecnico.component.ts:357-361`; runs on `ngOnInit`→`loadTeamData`, on team change (`:952-957`), on collaborator change (`:960-963`), on month change (`:1039-1043`) |
| **Returns** | Array of user actions; reduced to `Map<user_email, count>` (`team-aggregate.service.ts:906-917`) |
| **UI consumer** | `points = floor(count × PONTOS_POR_ATIVIDADE_FINALIZADA_ACTION_LOG)` per member → **Pontos** column of the player table, `teamTotalPoints`, `teamAveragePoints`, `averagePoints`, and `c4u-point-wallet.desbloqueados` — `:366-383`, `:500-520`; `dashboard-supervisor-tecnico.component.html:36-40`, `:139-142`, `:207-212` |
| **Caching / dedupe** | `TeamAggregateService` 5-min TTL keyed `team_member_action_counts_{teamId}_{startMs}_{endMs}` (`team-aggregate.service.ts:897-901`) + `Game4uApiService` dedupe key `team-actions\|team\|start\|end\|status\|user` (`:263-266`, `:1729`) |
| **Fallback** | `.catch(() => new Map())` in the component (`:362`) ⇒ every member scores 0 points |

### T-4 · `GET {API_BASE}/game/team-stats` (+ conditional 2nd `GET /game/team-actions`) — activity & process metrics

| | |
|---|---|
| **Method + URL** | `GET {API_BASE}/game/team-stats` |
| **Query params** | `start=<ISO>`, `end=<ISO>`, `team=<selectedTeamId>` — `game4u-api.service.ts:1707-1711` |
| **Companion request** | When `start`/`end` fall in the **same calendar month**, a parallel `GET {API_BASE}/game/team-actions?start=<Jan 1 of that year ISO>&end=<range end ISO>&team=<id>` is issued to compute the `dt_prazo` meta boost and competence filtering — `team-aggregate.service.ts:774-777`, `:779-784` |
| **Service + method** | `TeamAggregateService.getTeamActivityMetrics()` — `team-aggregate.service.ts:725-889` |
| **Component trigger** | `loadTeamActivityAndMacroData(dateRange)` at `dashboard-supervisor-tecnico.component.ts:544-550` (skipped when `teamMemberIds.length === 0`, `:542`) |
| **Returns** | `{finalizadas, pontos, processosFinalizados, processosIncompletos, pontosDone?, pontosTodosStatus?}` derived from `action_stats` / `delivery_stats` |
| **UI consumer** | `<c4u-activity-progress [activities] [processos]>` cards and `progressMetrics` — `:552-566`, `:514-518`; `dashboard-supervisor-tecnico.component.html:118-124`. Also `teamSeasonProgress.tarefasFinalizadas` (`:510`) |
| **Caching / dedupe** | 5-min TTL keyed `team_activity_{teamId}_{startMs}_{endMs}` (`team-aggregate.service.ts:737-741`, `:818`) + Game4U dedupe `team-stats\|team\|start\|end` (`:259-261`) |
| **Fallback** | Two layers of `of({finalizadas:0, pontos:0, processosFinalizados:0, processosIncompletos:0})` (`team-aggregate.service.ts:819-822`, `:881-884`) plus the component `.catch()` (`:550`) |
| **Non-month ranges** | For "Toda temporada" (`monthAnchor === null`) only `GET /game/team-stats` is issued — no companion `team-actions` — `team-aggregate.service.ts:747-773` |

### T-5 · `GET {API_BASE}/game/team-stats` — monthly points breakdown (deduped with T-4)

| | |
|---|---|
| **Method + URL** | `GET {API_BASE}/game/team-stats?start=<ISO>&end=<ISO>&team=<selectedTeamId>` |
| **Service + method** | `TeamAggregateService.getTeamMonthlyPointsBreakdown()` — `team-aggregate.service.ts:1211-1241` |
| **Component trigger** | `loadMonthlyPointsBreakdown(dateRange)`, last step of `loadTeamData` — `dashboard-supervisor-tecnico.component.ts:888-895`, `:302` |
| **Returns** | Point wallet split → `{bloqueados, desbloqueados}`; the component then forces `bloqueados: 0` — `:897` |
| **UI consumer** | `<c4u-activity-progress [monthlyPointsBreakdown]>` — `dashboard-supervisor-tecnico.component.html:118-124` |
| **Caching / dedupe** | Own TTL key `team_points_breakdown_v2_…` (`team-aggregate.service.ts:1217-1222`). **Crucially**, the range it builds (`startOf('day')` of `dateRange.start` … `endOf('day')` of `dateRange.end`, `:885-886`) equals T-4's range, so `Game4uApiService`'s `team-stats\|team\|start\|end` dedupe cache returns the **same shared observable → 1 network request** for T-4 + T-5 — `game4u-api.service.ts:175-191`, `:259-261`, `:1706` |
| **Fallback** | `of({bloqueados:0, desbloqueados:0})` at `team-aggregate.service.ts:1237-1240`, plus component `.catch()` (`:896`) and `monthlyPointsBreakdown = null` on throw (`:901-903`) |

### T-6 · `GET {GAMIFICACAO_API}` (carteira da equipe)

| | |
|---|---|
| **Method + URL** | `GET {GAMIFICACAO_API}`, header `x-api-token` |
| **Service + method** | `CompanyKpiService.enrichCompaniesWithKpis()` → `getGamificacaoMaps$()` — `company-kpi.service.ts:761-808`, `:522-551` |
| **Component trigger** | `loadTeamCarteiraData(dateRange)` at `dashboard-supervisor-tecnico.component.ts:739-741`. Input rows come from Supabase mock e-mail lookup (`:717-721`) with `actionCount` hardcoded to **0** (`:737` — explicitly documented as a temporary phase at `:701-704`) |
| **Returns / UI** | `entrega` %, `classificacao`, `cnpjNumber` per company → **Carteira** tab rows: `deliveryKpi` badge + `"{{cliente.actionCount}} tarefas"` (always `0 tarefas`) — `dashboard-supervisor-tecnico.component.html:262-296`. Also drives `teamKPIs['numero-empresas'].current` (`:592`) and `teamSeasonProgress.clientes` (`:508`, `:1213-1217`) |
| **Caching / dedupe** | Same 10-min snapshot + `shareReplay(refCount:false)` shared with T-7/T-8 — `company-kpi.service.ts:161`, `:522-551` |
| **Fallback** | Enrichment failure → rows degraded to `{cnpj, actionCount}` (`dashboard-supervisor-tecnico.component.ts:741`); snapshot failure → empty maps (`company-kpi.service.ts:542-545`) |

### T-7 · `GET {GAMIFICACAO_API}` (Participação tab — lazy)

`switchClientesTab('participacao')` → `loadParticipacaoData()` — `dashboard-supervisor-tecnico.component.ts:1071-1081`, `:1094-1150`.
`playerService.getPlayerCnpj(playerId)` is a **stub returning `[]`** (§0.3, `player.service.ts:242-273`), so the method returns early at `:1106-1113` and **no gamificação request is made** in the current build. If a CNPJ list existed, it would call `companyKpiService.enrichFromCnpjResp(cnpjList)` (`:1117`) and then `cnpjLookupService.enrichCnpjList(unknownCnpjs)` (`:1124`, also disabled per §0.3).
UI: **Participação** tab (`dashboard-supervisor-tecnico.component.html:333-361`) always renders "Nenhum CNPJ de participação encontrado". `teamParticipacaoCount` therefore comes only from the (disabled) `player_status` aggregate — `:337`, `:1197-1205`.

### T-8 · `GET {GAMIFICACAO_API}` (Carteira Individual tab — lazy)

`switchClientesTab('carteira-individual')` → `loadCarteiraIndividualData()` — `dashboard-supervisor-tecnico.component.ts:1074-1077`, `:1153-1187`.
`supabaseCompaniesService.getCompaniesForPlayer(playerId)` (mock, §0.4) → `companyKpiService.enrichFromCnpjResp(cnpjs)` at `:1173` → the shared 10-min gamificação snapshot. Renders the **Carteira Individual** tab (`dashboard-supervisor-tecnico.component.html:298-330`). Fallbacks: `.catch(() => [])` on rows (`:1159`) and `.catch(() => cnpjs.map(cnpj => ({cnpj})))` on enrichment (`:1174`).

### T-9 · `GET assets/help-texts.json`

Fires on this page (unlike SUPERVISOR) because the Clientes tab bar renders three `<c4u-info-button>` elements — `dashboard-supervisor-tecnico.component.html:240`, `:248`, `:256`; `c4u-info-button.component.ts:57`, `:70`; `help-texts.service.ts:55`. `shareReplay(1)` → one request; 404 → hardcoded default texts (`:56-61`).

### T-10 · Collaborator selected — `GET {API_BASE}/player/{collaboratorId}/status`

| | |
|---|---|
| **Method + URL** | `GET {API_BASE}/player/{collaboratorId}/status` (literal `/v3/player/{id}/status`, `/v3/` stripped) |
| **Service + method** | `BackendApiService.get()` called **directly** by the component — `dashboard-supervisor-tecnico.component.ts:774-776` |
| **Component trigger** | `onCollaboratorChange(userId)` → `loadTeamData()` → `loadCollaboratorData(collaboratorId, dateRange)` — `:959-963`, `:274-276`, `:771` |
| **Returns** | `point_categories.points`, `extra.cnpj_resp`, `extra.cnpj`, `extra.entrega`, `extra.cnpj_goal`, `name` |
| **UI consumer** | Replaces the player table with a single row; sets `teamTotalPoints`/`teamAveragePoints`, `teamParticipacaoCount`, and the row's Clientes/Entregas/Pontos cells — `:777-828`; `dashboard-supervisor-tecnico.component.html:181-217` |
| **Caching / dedupe** | **None** (no cache layer on this direct call). `retry({count:2, delay:1000})` from `BackendApiService` — `backend-api.service.ts:97` |
| **Fallback** | `.catch(() => null)` → `playerRows = []` — `:776`, `:830-832` |
| **Note** | The **collaborator `<select>` is unreachable in this build**: `collaborators` is filled by `TeamAggregateService.getTeamMembers()`, which runs a disabled `action_log` aggregate and returns `[]` (§0.3), and the `<select>` is `*ngIf="collaborators.length > 0"` — `:757-761`; `dashboard-supervisor-tecnico.component.html:20-32` |

### T-11 · Collaborator selected — `ActionLogService.getProgressMetrics(collaboratorId, month)` → up to 4 requests

Trigger: `loadCollaboratorData` at `dashboard-supervisor-tecnico.component.ts:836-838`. Called **without** `opts`, so it skips both the `supervision/dashboard/cached` team-aggregate branch and the `reports-only` branch, landing on the mixed `forkJoin` — `action-log.service.ts:2868-2872`, `:2924-2947`, `:3001-3032`:

| # | Request | Query params | Cite |
|---|---|---|---|
| a | `GET {API_BASE}/game/reports/finished/summary` | `finished_at_start`, `finished_at_end` (month range), `email` | `action-log.service.ts:3003-3012`; def. `game4u-api.service.ts:502-521` |
| b | `GET {API_BASE}/game/reports/open/summary` | `dt_prazo_start`=`YYYY-MM-01`, `dt_prazo_end`=first day of next month, `email` | `action-log.service.ts:2966-2972`, `:3019-3028`; range `game4u-api.service.ts:355-366`; def. `:526-545` |
| c | `GET {API_BASE}/game/stats` | `start`, `end` (month range), `user=<email>` | `action-log.service.ts:2981-2983`; def. `game4u-api.service.ts:1617-1638` |
| d | `GET {API_BASE}/game/actions` | `start`=campaign start, `end`=month end, `user=<email>` | `action-log.service.ts:3049-3051` (query built at `:2955-2956`), range builder `game4u-api.service.ts:336-350`; def. `:1640-1666` |

For `selectedMonthsAgo === -1`, `monthForMetrics` is `undefined` (`:836`), so (a) is replaced by a static `of({tasks_count:0,…})` and only (b)+(c)+(d) fire, all over the season range — `action-log.service.ts:3001-3018`, `:2964-2977`.

**Returns / UI:** `{activity, processo}` → `teamActivityMetrics`, `teamProcessMetrics`, `teamPointWallet`, `teamSeasonProgress`, `progressMetrics` (`:842-864`).
**Caching:** each Game4U call is deduped by its own key (`rpt-sum|…`, `rpt-open-sum|…`, `stats|…`, `actions|…`) with `shareReplay(refCount:false)` — `game4u-api.service.ts:175-191`, `:251-257`.
**Fallback:** per-request `catchError` → zeroed summaries (`action-log.service.ts:3013-3017`, `:3024-3028`) plus a component-level `.catch()` returning all-zero metrics (`:838-841`).

### T-12 · Collaborator selected — `GET {API_BASE}/auth/user` (KPI service)

`loadTeamKPIs(collaboratorId)` → `kpiService.getPlayerKPIs(collaboratorId, month, actionLogService)` — `dashboard-supervisor-tecnico.component.ts:577-580`.
`getPlayerKPIs` resolves its profile from `profileForKpiFromSessionOrApi()`: session `usuario` if it carries `extra`, otherwise `PlayerService.getCurrentPlayerData()` → `GET {API_BASE}/auth/user` — `src/app/services/kpi.service.ts:81-87`, `:115`; `player.service.ts:144`.
**Important semantics:** despite receiving `collaboratorId`, the KPI values always describe the **authenticated user** (`extra.companies`, `extra.client_goals`, `extra.entrega`) — documented at `kpi.service.ts:89-99`. `collaboratorId` only participates in the cache key (`:107-109`).
**UI:** `teamKPIs` → `c4u-kpi-circular-progress` grid, with `numero-empresas` filtered out in the template — `dashboard-supervisor-tecnico.component.html:93-107`.
**Caching:** KPI cache keyed `${playerId}${monthKey}${scope}` + `shareReplay(windowTime: CACHE_DURATION)` (`kpi.service.ts:110-113`, `:190-194`); `/auth/user` itself is 15-min cached & single-flighted (`player.service.ts:135-141`). **Fallback:** `of([])` (`kpi.service.ts:186-189`).

### T-13 · Company Carteira Detail modal (carteira row click)

`openCompanyDetailModal(cliente)` (`dashboard-supervisor-tecnico.component.ts:987-991`) renders `<modal-company-carteira-detail [company] [month]="selectedMonth" [actionLogUserId]="selectedCollaborator" [actionLogTeamId]="selectedCollaborator ? null : selectedTeamId">` — `dashboard-supervisor-tecnico.component.html:388-395`.

* `enrichCompanyName()` → `cnpjLookupService.enrichCnpjListFull([cnpj])` → **no HTTP** (§0.3) — `src/app/modals/modal-company-carteira-detail/modal-company-carteira-detail.component.ts:81-84`.
* `kpiService.getCompanyKPIs(cnpjId)` → disabled `cnpj_performance__c` aggregate → `of([])` → falls back to `company.deliveryKpi` from the gamificação snapshot — `modal-company-carteira-detail.component.ts:111-133`; `kpi.service.ts:226-229`.
* `loadTasks()`: `actionLogTeamId` is set (no collaborator, since T-10's selector is unreachable), so with `isGame4uDataEnabled()` it calls `actionLogService.getGame4uUserActionsForParticipationModal('me', {…}, month, undefined, tid)` — `modal-company-carteira-detail.component.ts:200-218`. That resolves to `GET {API_BASE}/game/actions?start&end&team_id=<tid>` (range = campaign start → month end when a month is set) — `action-log.service.ts:2436-2499`. When `company.loadTasksViaGameReports` is true it instead paginates `GET {API_BASE}/game/reports/finished/actions-by-delivery` (`fetchParticipationModalTasksPage`, `modal-company-carteira-detail.component.ts:165-169`; def. `game4u-api.service.ts:737-762`) — but `loadTeamCarteiraData` never sets that flag (`dashboard-supervisor-tecnico.component.ts:737`), so this branch is not reached from this page.
* Errors → `tasks = []`, `tasksTotal = 0` (`modal-company-carteira-detail.component.ts:220-226`).

### T-14 · Progress List modal (activity/process card click)

`onProgressCardClicked(type)` (`dashboard-supervisor-tecnico.component.ts:994-1017`) renders `<modal-progress-list [playerId]="teamPlayerIdsForModal" [listType] [month]="selectedMonth">` — `dashboard-supervisor-tecnico.component.html:398-404`. `teamPlayerIdsForModal` is `teamMemberIds.join(',')` (`:1057-1060`).

Because **no `[teamId]`/`[teamIds]` is bound**, `getTeamScopeIds()` returns `[]` and `getPlayerIds()` splits the comma list — `src/app/modals/modal-progress-list/modal-progress-list.component.ts:395-418`. The modal then issues **one request per team member** via `forkJoin`:

| listType | Call | Resulting HTTP | Cite |
|---|---|---|---|
| `atividades` (DONE/DELIVERED) | `getActivityList(playerId, month, undefined, ['DONE','DELIVERED'])` | `GET {API_BASE}/game/reports/user-actions` with `email`, `status=DONE`&`status=DELIVERED`, `finished_at_start`, `finished_at_end` | modal `:451-457`, `:482-484`; `action-log.service.ts:3251-3270`, `:3393-3395`, `:1662-1667`; def. `game4u-api.service.ts:771-840` |
| `atividades-pendentes` (PENDING/DOING) | same, statuses `['PENDING','DOING']` | `GET {API_BASE}/game/reports/user-actions` with `email`, `status=PENDING`&`status=DOING`, `dt_prazo_start=YYYY-MM-01`, `dt_prazo_end=YYYY-MM-<last day>` | modal `:451-455`; `action-log.service.ts:3390-3392`, `:1657-1662`; range `game4u-api.service.ts:368-376` |
| `pontos` | maps to `'pontos'`; treated as an activity list | same as `atividades` | `dashboard-supervisor-tecnico.component.ts:1000-1002` |
| `processos-pendentes` / `processos-finalizados` | `getProcessList(playerId, month)` | `GET {API_BASE}/game/actions?start&end&user=<email>` | modal `:527-536`; `action-log.service.ts:3422-3442` |

`getGameReportsUserActions` **validates the date pairs before issuing**: an incomplete pair, or more than one of `finished_at_*` / `dt_prazo_*` / `created_at_*`, throws without a request — `game4u-api.service.ts:796-823`. Statuses are `append`ed (repeated query params), not CSV — `:786-788`. `offset`/`limit` are appended when present (`normalizeGameReportsUserActionsResponse` supplies defaults `offset:0, limit:500`) — `game4u-api.model.ts:719-747`.
**Caching:** per-slice TTL cache keyed `insights-ua-{open|finished}|{tid}|{email}|{YYYY-MM}` + `shareReplay(1)` — `action-log.service.ts:1640-1671`.
**Fallback:** every request wrapped in `catchError → of([])` both in the modal (`:471-478`, `:530-533`) and in the service (`:3260-3265`, `:3438-3442`).
**Drilldown:** clicking a process row calls `getActivitiesByProcess(deliveryIdNum, playerId, month)` — `modal-progress-list.component.ts:1270`; `action-log.service.ts:4225`. Company-name enrichment (`cnpjLookupService.enrichCnpjList`, `:1323-1324`) makes **no HTTP** (§0.3).

### T-15 · Player Detail modal

Identical to **S-7** (same component, same `[cnpjRespFromAggregate]` binding) — `dashboard-supervisor-tecnico.component.html:370-378`.

### T-16 · Company Detail modal

Identical to **S-8** — `dashboard-supervisor-tecnico.component.html:381-385`.

---

## 3. The supervision **cached** endpoints — exact contract

Both endpoints live in `Game4uApiService`. **Neither is reached from either supervisor page.**

### 3.1 `GET {API_BASE}/game/reports/supervision/dashboard/cached`

Definition: `src/app/services/game4u-api.service.ts:874-907`.

| Aspect | Detail |
|---|---|
| **Query params** | Exactly two, both **required**: `team_id=<string>` and `month=<YYYY-MM \| YYYY-MM-DD>` — `game4u-api.service.ts:899-900`; query type `Game4uReportsSupervisionCachedQuery { team_id: string; month: string }` — `game4u-api.model.ts:466-469` |
| **Pagination** | **None.** No `offset`/`limit`/`Range`. It returns a single aggregated object per team-month |
| **Headers** | `client_id` (`:1602-1605`) + `Authorization: Bearer` (interceptor) |
| **Pre-flight validation** | `throwError` *without a request* when `backend_url_base` is empty (`:880-884`), `team_id` is blank (`:888-891`), or `month` is blank (`:892-896`) |
| **Returns** | `SupervisionTeamDashboardCached` — `refreshed_at`, `team_id:number`, `team_name`, `players_count`, `params{cache_month, season_start, season_end, month_start, month_end}`, `season_points_total`, `season_clients_total`, `season_tasks_finished_total`, `month_points_done_delivered`, `month_goal_points`, `month_pending_tasks_count`, `month_finished_tasks_count`, `month_clients_served`, `month_on_time_delivery_pct?`, `refresh_error?` — `game4u-api.model.ts:386-403` |
| **Dedupe** | Key `supervision-cached\|{teamId}\|{month}` in `reportsSupervisionDashboardCachedCache`, `shareReplay({bufferSize:1, refCount:false})`, entry evicted on error — `:897-898`, `:175-191`. Cleared by `clearStatsActionsDedupeCache()` (`:263`) |
| **Second cache layer** | `ActionLogService.fetchSupervisionTeamDashboardCached(bwaTeamScopeId, month)` adds a TTL cache keyed `g4u_supervision_cached_{tid}_{monthParam}` + `shareReplay({windowTime: GAME4U_CACHE_DURATION})` — `action-log.service.ts:683-716` |
| **Fallback** | **HTTP 404 → `of(null)`** (month not yet cached); any other error → `console.error` + `of(null)` — `action-log.service.ts:706-712`. Callers then substitute all-zero metric objects (e.g. `:2911-2917`) |
| **Reachable callers** | `ActionLogService.getSupervisionTeamDashboardCachedBundle()` (`:722-753`) — consumed **only** by `team-management-dashboard.component.ts:2258`. Also `action-log.service.ts:1742`, `:2078`, `:2115`, and the `getProgressMetrics` team-aggregate branch at `:2900`, which requires `opts.game4uTeamAggregate` — an option **neither supervisor page passes** (`dashboard-supervisor-tecnico.component.ts:837` passes no `opts`) |

### 3.2 `GET {API_BASE}/game/reports/supervision/dashboard/cached/list`

Definition: `src/app/services/game4u-api.service.ts:910-940`.

| Aspect | Detail |
|---|---|
| **Query params** | Exactly one, **required**: `month=<YYYY-MM \| YYYY-MM-DD>` — `:930`; query type `Game4uReportsSupervisionCachedListQuery { month: string }` — `game4u-api.model.ts:471-473`. **No `team_id`** — scope comes from the JWT |
| **Pagination** | **None.** Returns the whole grid in one payload |
| **Pre-flight validation** | `throwError` without a request when `backend_url_base` is empty (`:915-921`) or `month` is blank (`:923-928`) |
| **Returns** | `SupervisionDashboardCachedListResponse { teams: SupervisionTeamDashboardCached[] }` — `game4u-api.model.ts:405-407` |
| **Dedupe** | Key `supervision-cached-list\|{month}` in `reportsSupervisionDashboardListCache`, `shareReplay({refCount:false})` — `:929`, `:175-191`; cleared by `clearStatsActionsDedupeCache()` (`:264`) |
| **Fallback** | None inside the service — errors propagate (the dedupe entry is dropped, `:180-183`) |
| **Callers** | **Zero.** `grep -rn "getGameReportsSupervisionDashboardCachedList" src --include=*.ts` matches only the definition at `game4u-api.service.ts:913`. It is currently dead code |

---

## 4. What differs between the two pages

### 4.1 Endpoints unique to **SUPERVISOR**

| Endpoint | Why | Cite |
|---|---|---|
| `GET {API_BASE}/auth/user` **as primary page data** | Only this page reads the supervisor's own profile for its info card. On TÉCNICO, `/auth/user` appears only indirectly via `KPIService`, and only when a collaborator is selected (T-12). | `dashboard-supervisor.component.ts:158` vs `kpi.service.ts:81-87` |
| `GET {GAMIFICACAO_API}` triggered eagerly on `ngOnInit` for **three** client lists | `loadCarteiraSupervisor()` runs in `ngOnInit`; `loadCarteiraEquipe()`/`loadParticipacaoEquipe()` chain off the team-player load | `dashboard-supervisor.component.ts:135-137`, `:239-240` |
| `GET {API_BASE}/game/actions` ×2 (`status=DONE` + `status=DELIVERED`) | Only reachable here in practice, via the Player Detail modal under "Toda temporada". TÉCNICO's month selector reaches the same modal, but TÉCNICO additionally has its own `/game/actions` paths (T-14/T-13). | `action-log.service.ts:3627-3632` |

### 4.2 Endpoints unique to **SUPERVISOR TÉCNICO**

| Endpoint | Why | Cite |
|---|---|---|
| `GET {API_BASE}/game/team-stats` | Team activity metrics + monthly points breakdown. **Absent from SUPERVISOR entirely.** | `game4u-api.service.ts:1707-1711`; `dashboard-supervisor-tecnico.component.ts:544-550`, `:888-895` |
| `GET {API_BASE}/game/team-actions` | Per-member action counts → points; plus the companion competence-range call inside `getTeamActivityMetrics`. **Absent from SUPERVISOR.** | `game4u-api.service.ts:1729-1742`; `dashboard-supervisor-tecnico.component.ts:357-361`; `team-aggregate.service.ts:779-784` |
| `GET {API_BASE}/campaign` on the **critical path** | `initializeDashboard()` awaits season dates before anything else; SUPERVISOR only gets it as a side effect of `<c4u-seletor-mes>`. | `dashboard-supervisor-tecnico.component.ts:191`, `:205-214` |
| `GET assets/help-texts.json` | Only this template renders `<c4u-info-button>`. | `dashboard-supervisor-tecnico.component.html:240`, `:248`, `:256` |
| `GET {API_BASE}/player/{collaboratorId}/status` (**direct**, uncached) | Collaborator drill-down. SUPERVISOR never calls `/player/{id}/status` outside `ACLService`. | `dashboard-supervisor-tecnico.component.ts:774-776` |
| `GET {API_BASE}/game/reports/finished/summary` | `getProgressMetrics` collaborator path. | `action-log.service.ts:3003-3012` |
| `GET {API_BASE}/game/reports/open/summary` | idem. | `action-log.service.ts:3019-3028` |
| `GET {API_BASE}/game/stats` | idem. | `action-log.service.ts:2981-2983` |
| `GET {API_BASE}/game/actions` (user- and team-scoped) | `getProgressMetrics`, `getProcessList`, and the carteira-detail task list. | `action-log.service.ts:3049-3051`, `:3436-3443`, `:2490-2499` |
| `GET {API_BASE}/game/reports/user-actions` | Progress List modal (activities & pending). **No equivalent on SUPERVISOR** — that page has no progress modal. | `game4u-api.service.ts:833-840`; `modal-progress-list.component.ts:482-484` |
| `GET {API_BASE}/game/reports/finished/actions-by-delivery` | Carteira-detail task pagination path (flag not set from this page, so latent). | `game4u-api.service.ts:737-762` |

### 4.3 Shared endpoints

| Endpoint | SUPERVISOR trigger | TÉCNICO trigger |
|---|---|---|
| `GET {API_BASE}/player/{playerId}/status` (ACL `catalog_items`) | `loadTeamPlayers()` `:206-209` — feeds team-member fan-out | `loadAvailableTeams()` `:223-226` — feeds the team `<select>` |
| `GET {GAMIFICACAO_API}` | 3 Clientes tabs `:498`, `:550`, `:623` | 3 Clientes tabs `:739-741`, `:1117`, `:1173` |
| `GET {API_BASE}/campaign` | `<c4u-seletor-mes>` only | awaited in `initializeDashboard()` **and** `<c4u-seletor-mes>` |
| `GET {API_BASE}/game/reports/finished/deliveries/cached` | Player Detail modal (`month != null`) | Player Detail modal (`month != null`) |
| `GET assets/help-texts.json` | not rendered | 3× `c4u-info-button` (1 request, shared) |

### 4.4 Behavioural differences worth flagging

* **Cache policy:** SUPERVISOR calls `cacheManagerService.clearAllCaches()` on **every** `ngOnInit` (`dashboard-supervisor.component.ts:133`) — a full 17-service cache wipe. TÉCNICO never does; it only calls `playerService.clearCache()` on month change (`:1041`).
* **Points semantics:** SUPERVISOR reads `point_categories.points` straight off the (disabled) `player_status` aggregate — no network call for points (`:334-336`). TÉCNICO derives points from `GET /game/team-actions` counts × a constant (`:365-367`).
* **Month change:** SUPERVISOR re-runs 3 loaders and resets all three Clientes tabs to `carteira-equipe` (`:684-696`). TÉCNICO re-runs the whole `loadTeamData()` cascade (`:1039-1043`).
* **Season/"Toda temporada" (`-1`)**: SUPERVISOR only shifts the delivery-goal constant (`:733-735`) — same requests. TÉCNICO swaps the entire date range to campaign bounds (`:309-313`), which changes the `start`/`end` of every `/game/*` call and drops `finished/summary` from `getProgressMetrics`.

---

## 5. Services named in the brief that issue **nothing** from these pages

| Service | Status |
|---|---|
| `game4u-api.service.ts` | Never injected by either component; reached only transitively through `ActionLogService`, `TeamAggregateService`, `PlayerService`, `SeasonDatesService`. |
| `action-log.service.ts` | **Not injected by SUPERVISOR at all.** On TÉCNICO it is injected (`:158`) but only used in the collaborator branch (`:837`) and passed as an unused argument to `getPlayerKPIs` (`:578`, documented unused at `kpi.service.ts:98`). |
| `team-aggregate.service.ts` | **TÉCNICO only** (`:155`). `getTeamMembers()` yields no HTTP (§0.3); `getTeamActivityMetrics` / `getTeamMemberActionLogCounts` / `getTeamMonthlyPointsBreakdown` hit `/game/team-stats` + `/game/team-actions`. |
| `company-kpi.service.ts` | Both pages — sole consumer of `GET {GAMIFICACAO_API}`. |
| `player.service.ts` | SUPERVISOR: `GET /auth/user`. TÉCNICO: only `clearCache()` (`:1041`) and the stubbed `getPlayerCnpj()` (`:1103`). |
| `acesso.service.ts` | **Not injected by either component.** Only cleared transitively by `clearAllCaches()` (`cache-manager.service.ts:78`). |
| `kpi.service.ts` | SUPERVISOR: only the pure helper `getKPIColorByGoals()` — **no HTTP** (def. `kpi.service.ts:267`; call sites `dashboard-supervisor.component.ts:290`, `:300`, `:394`, `:404`). TÉCNICO: `getPlayerKPIs()` → `/auth/user` when a collaborator is selected (`:578`). |
| `campaign.service.ts` | Not injected directly; reached via `SeasonDatesService` → `GET /campaign`. |
| `dashboard-insights.service.ts` | **Not injected by either component.** No requests. |
| `cnpj-lookup.service.ts` | Injected by both (`dashboard-supervisor.component.ts:117`, `dashboard-supervisor-tecnico.component.ts:160`) but **structurally incapable of issuing HTTP** — every path goes through the `/aggregate` guard (`cnpj-lookup.service.ts:102-105`). |
| `supabase-companies.service.ts` | Mock-only in the default build (§0.4). |
| `bwa-team-api.service.ts`, `goals-config.service.ts`, `ranking.service.ts`, `features.service.ts`, `alias.service.ts`, `team-stats-cache.service.ts` | Only touched by `clearAllCaches()` on SUPERVISOR (`cache-manager.service.ts:56-101`) — no requests. |

---

## 6. Consolidated request inventory

### SUPERVISOR — `/dashboard/supervisor`

| # | Method | Endpoint | Params | Trigger |
|---|---|---|---|---|
| S-1 | GET | `{API_BASE}/auth/user` | — | ngOnInit; month change |
| S-2 | GET | `{API_BASE}/player/{playerId}/status` | — | ngOnInit; month change (ACL) |
| S-3 | GET | `{GAMIFICACAO_API}` | header `x-api-token` | ngOnInit; month change; tab switch |
| S-4 | GET | `{SUPABASE}/rest/v1/companies` *(conditional)* | `select=*`, `responsaveis=cs.[{"email":…}]` | ngOnInit; tab switch |
| S-5 | GET | `{API_BASE}/campaign` | — | `c4u-seletor-mes` init |
| S-7a | GET | `{API_BASE}/game/reports/finished/deliveries/cached` | `email`, `month`, `offset=0`, `limit=500` | player card/row click (month) |
| S-7b | GET | `{API_BASE}/game/actions` ×2 | `start`, `end`, `user`, `status=DONE` / `status=DELIVERED` | player card/row click ("Toda temporada") |

### SUPERVISOR TÉCNICO — `/dashboard/supervisor-tecnico`

| # | Method | Endpoint | Params | Trigger |
|---|---|---|---|---|
| T-1 | GET | `{API_BASE}/campaign` | — | ngOnInit (awaited) |
| T-2 | GET | `{API_BASE}/player/{playerId}/status` | — | ngOnInit (ACL → team selector) |
| T-3 | GET | `{API_BASE}/game/team-actions` | `start`, `end`, `team` | loadTeamMembersData |
| T-4 | GET | `{API_BASE}/game/team-stats` | `start`, `end`, `team` | loadTeamActivityAndMacroData |
| T-4b | GET | `{API_BASE}/game/team-actions` | `start`=Jan 1, `end`=range end, `team` | same (single-calendar-month ranges only) |
| T-5 | GET | `{API_BASE}/game/team-stats` | `start`, `end`, `team` | loadMonthlyPointsBreakdown (deduped with T-4) |
| T-6 | GET | `{GAMIFICACAO_API}` | header `x-api-token` | loadTeamCarteiraData |
| T-8 | GET | `{GAMIFICACAO_API}` | header `x-api-token` | Carteira Individual tab (shared snapshot) |
| T-9 | GET | `assets/help-texts.json` | — | `c4u-info-button` hover/focus |
| T-10 | GET | `{API_BASE}/player/{collaboratorId}/status` | — | collaborator select |
| T-11a | GET | `{API_BASE}/game/reports/finished/summary` | `email`, `finished_at_start`, `finished_at_end` | collaborator select (month set) |
| T-11b | GET | `{API_BASE}/game/reports/open/summary` | `email`, `dt_prazo_start`, `dt_prazo_end` | collaborator select |
| T-11c | GET | `{API_BASE}/game/stats` | `user`, `start`, `end` | collaborator select |
| T-11d | GET | `{API_BASE}/game/actions` | `user`, `start`, `end` | collaborator select |
| T-12 | GET | `{API_BASE}/auth/user` | — | collaborator select (KPI) |
| T-13 | GET | `{API_BASE}/game/actions` | `start`, `end`, `team_id` | carteira row click |
| T-14a | GET | `{API_BASE}/game/reports/user-actions` | `email`, `status=DONE`&`status=DELIVERED`, `finished_at_start`, `finished_at_end` | activities card click (×N members) |
| T-14b | GET | `{API_BASE}/game/reports/user-actions` | `email`, `status=PENDING`&`status=DOING`, `dt_prazo_start`, `dt_prazo_end` | pending-activities card click (×N members) |
| T-14c | GET | `{API_BASE}/game/actions` | `user`, `start`, `end` | process card click (×N members) |
| T-15a | GET | `{API_BASE}/game/reports/finished/deliveries/cached` | `email`, `month`, `offset=0`, `limit=500` | player row click |
