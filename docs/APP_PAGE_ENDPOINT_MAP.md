# Page → Endpoint Map (whole app)

Master index of every route in the app, the HTTP endpoints each one requests, and what information
each request provides. Compiled from source, `*.spec.ts` ignored.

Per-page deep dives (params, response fields, cache keys, fallbacks, `file:line` citations):

| Page(s) | Deep-dive document |
|---|---|
| Player dashboard | [`PLAYER_DASHBOARD_ENDPOINT_MAP.md`](./PLAYER_DASHBOARD_ENDPOINT_MAP.md) |
| Team management | [`TEAM_MANAGEMENT_DASHBOARD_HTTP_MAP.md`](./TEAM_MANAGEMENT_DASHBOARD_HTTP_MAP.md) |
| Supervisor + Supervisor Técnico | [`SUPERVISOR_DASHBOARDS_ENDPOINT_MAP.md`](./SUPERVISOR_DASHBOARDS_ENDPOINT_MAP.md) |
| Org hierarchy + Admin pipeline | [`ORG_HIERARCHY_ADMIN_PIPELINE_ENDPOINT_MAP.md`](./ORG_HIERARCHY_ADMIN_PIPELINE_ENDPOINT_MAP.md) |
| Rewards / Thermometer / Ranking / Home / Season | [`ENDPOINT_MAP_REWARDS_THERMOMETER_RANKING_HOME_SEASON.md`](./ENDPOINT_MAP_REWARDS_THERMOMETER_RANKING_HOME_SEASON.md) |
| Shared modals + shared components | [`SHARED_MODALS_COMPONENTS_ENDPOINT_MAP.md`](./SHARED_MODALS_COMPONENTS_ENDPOINT_MAP.md) |

---

## 1. Route inventory

| Route | Component | Guard |
|---|---|---|
| `/` | `RootRedirectComponent` (`app-routing.module.ts:11-16`) | — |
| `/login` | `LoginComponent` (`layout/login/login.module.ts:10`) | — |
| `/dashboard` | `GamificationDashboardComponent` — player panel (`pages/pages.routing.ts:5-10`) | `DashboardRedirectGuard` |
| `/dashboard/team-management` | `TeamManagementDashboardComponent` (`pages.routing.ts:11-14`) | `TeamRoleGuard` |
| `/dashboard/organization-hierarchy` | `OrganizationHierarchyReportComponent` (`pages.routing.ts:15-21`) | `OrgHierarchyReportGuard` |
| `/dashboard/admin/pipeline-integration-changes` | `PipelineIntegrationChangesComponent` (`pages.routing.ts:22-28`) | `AdminGuard` |
| `/dashboard/supervisor` | `DashboardSupervisorComponent` (`pages.routing.ts:29-33`) | `DashboardRedirectGuard` |
| `/dashboard/supervisor-tecnico` | `DashboardSupervisorTecnicoComponent` (`pages.routing.ts:34-39`) | `DashboardRedirectGuard` |
| `/dashboard/rewards/rewards` | `RewardsComponent` (`recompensas/rewards.module.ts:20`) | — |
| `/dashboard/thermometer/thermometer` | `ThermometerComponent` (`thermometer/thermometer.module.ts:14`) | — |
| `/dashboard/ranking` | `RankingComponent` (`ranking/ranking.module.ts:13`) | — |
| `/sem-permissao` | `SemPermissaoComponent` (`app-routing.module.ts:34-36`) | — |
| `/breve` | `BreveComponent` (`app-routing.module.ts:37-39`) | — |

All `/dashboard/**` routes sit under `canActivateChild: [PermissaoAcessoGeral]` (`app-routing.module.ts:29-32`).
`pages/home/*` has **no route** and a 0-byte template — dead code, along with `dashboard-colaborador`,
`dados-mes-atual`, `dados-mes-anterior`, `dados-metas-progresso-time`, `dados-produtividade-time`
(reachable only through the unrouted `HomeModule`).

Only `PermissaoAcessoGeral` issues HTTP (`GET /auth/user`, and only on refresh/deep-link when a token exists
but no user is in memory). `AdminGuard`, `TeamRoleGuard`, `DashboardRedirectGuard` and
`OrgHierarchyReportGuard` read in-memory session roles only.

---

## 2. Base URLs

| Symbol | Value | Notes |
|---|---|---|
| `environment.backend_url_base` | `G4U_API_BASE` → `g4u_api_base` → `BACKEND_URL_BASE` → `backend_url_base` (`environment.ts:20`, `backend-url.ts:32-50`) | The Game4U/BWA REST API. Everything below unless stated otherwise. |
| `environment.gamificacaoApiUrl` | default `https://hook.bwa.global:3334/gamificacao` (`environment.ts:103-105`) | Company KPI hook. Header `x-api-token`, no params, no body. |
| `environment.supabaseUrl` | hard-coded `''` (`environment.ts:49-50`) | PostgREST is unreachable in the default bundle; `supabaseUseMock` defaults **true**. |
| n8n webhook | `https://integrador-n8n.grupo4u.com.br/webhook/c43002e5-…` | Help-button form only. |

**Interceptors.** `AuthInterceptor` adds `client_id` + `Authorization: Bearer`, whitelists `/auth/login`,
`/auth/refresh`, `/auth/change-password*`, `/client/system-params`, `/campaign/current`, `/campaign`, and the
n8n host; it refreshes via `POST /auth/refresh` when the JWT is <5 min from expiry, and passes `x-api-token`
requests to the gamificação origin through untouched (`auth.interceptor.ts:22-33, 79-111, 161-197, 225-247`).
`GameReportsInterceptor` retries any `GET /game/reports/**` once after 1500 ms on a Snowflake-unavailable 503
(`game-reports.interceptor.ts:25-46`).

**Two client-side kill switches** — read these before treating any `aggregate` row as live:

1. `BackendApiService.get`/`post` short-circuit to `of([])` for any endpoint containing `aggregate`
   (`backend-api.service.ts:87-91`, `:103-107`). Every Funifier `POST /database/*/aggregate?strict=true`
   in the app is therefore dead: `action_log`, `player`, `player_status`, `achievement`, `acl__c`,
   `cnpj_performance__c`, `metric_targets__c`.
2. `CnpjLookupService.fetchAllPaginatedCnpj` has the same guard (`cnpj-lookup.service.ts:102-105`), and both
   its entry points always build `/database/empid_cnpj__c/aggregate?strict=true` — so company-name enrichment
   never issues a request and every CNPJ renders as its raw key.

`PlayerService.getPlayerCompanyData` is also a stub returning an empty map with no HTTP
(`player.service.ts:250-252`).

---

## 3. Bootstrap / login / session

App bootstrap issues **zero** API calls: there is no `APP_INITIALIZER`, i18n uses dynamic `import()` of
`assets/i18n/*.json`, and `AppComponent.initializeSystem()` deliberately skips system init
(`app.module.ts:60-81`, `layout/app/app.component.ts:65-79`).

| Method + path | Info returned | When |
|---|---|---|
| `GET /client/system-params` | Tenant branding (`client_name`, `client_dark_logo_url`, colors), aliases (`points_alias`, `coins_alias`, `delivery_alias`, `action_alias`), feature flags `enable_*`, `free_challenges_*`, `team_redirect_urls` | Login page `ngOnInit`; later served from a 24 h in-memory + `localStorage` cache. Fanned out to 5+ consumers as one request. |
| `POST /auth/login` | `{access_token, refresh_token, token_type, expires_in}` → `sessionStorage['g4utkn']` | Login submit. Body `{email, password}` |
| `GET /auth/user` | Session profile: `_id`, `email`, `name`/`full_name`, `roles`, `teams`, `extra` (`companies`, `client_goals`, `entrega`, `cnpj_resp`, `cnpj_goal`, `entrega_sup`). Sole source of roles/teams for every guard | Right after login; on guard activation after refresh; `PlayerService.getCurrentPlayerData()` (15-min cache) |
| `GET /campaign` | Active campaign `starts_at`/`finishes_at` → season bounds, month-selector range, and the `start`/`end` of every `/game/*` call | Prefetched after login; `SeasonDatesService` on dashboard init; `c4u-seletor-mes` init |
| `POST /auth/refresh` | New token pair; body `{refresh_token}` | Interceptor, when the JWT expires in <5 min. Single in-flight chain; failure ⇒ logout |
| `POST /auth/change-password-request` | Password-reset e-mail; body `{email}` | "Esqueci minha senha" |
| `POST /auth/change-password-recovery` | Body `{password, access_token}` (token from the URL `#fragment`) | Reset link from e-mail |
| `POST /auth/change-password` | Legacy reset; body `{user, token, password}` | Legacy `?token=&user=` links |

Not HTTP: `LoginLogService` emits a Vercel analytics event; `SessionTimeoutService` is a local 60 s timer
(12 h max session) that redirects to `/login?reason=session_expired`.

---

## 4. `/dashboard` — Player gamification dashboard

| Method + path | Params | Info returned / UI consumer |
|---|---|---|
| `GET /game/reports/dashboard/cached` | `email`, `month=YYYY-MM` | The page's spine. `season_points_total` → point wallet; `season_tasks_finished_total` + `season_clients_total` → season progress; `month_points_done_delivered` + `month_goal_points` → monthly points ring; `month_pending_tasks_count` / `month_finished_tasks_count` → activity cards; `month_clients_served` → "Clientes atendidos este mês (N)"; `month_on_time_delivery_pct` → "Entregas no Prazo" ring; `refreshed_at` → "Sincronizado com Acessórias em …". 404 ⇒ "Dados deste mês ainda não estão disponíveis" |
| `GET /game/reports/finished/deliveries/cached` | `month`, `offset`, `limit=30` (max 500), `email` | "Clientes atendidos este mês" list: `delivery_title`, `on_time_pct`, `tasks_total`/`tasks_on_time`, `is_acessorias_*` critical-client flags, `has_more` for "Carregar mais" |
| `GET {gamificacaoApiUrl}` | header `x-api-token` | Per-client `porcEntregas` (on-time %), `classificacao`, `procFinalizados`+`procPendentes`; average feeds the "Entregas no Prazo" ring when the cached pct is absent. 10-min snapshot |
| `GET /game/reports/user-actions` ×2 | open: `status=PENDING&status=DOING` + `dt_prazo_start/end`; finished: `status=DONE&status=DELIVERED` + `finished_at_start/end`; both `email` | Insights panel (overdue, fine risk, due-soon, on-time vs late, weekday distribution, top activities) and the progress-list modal rows |
| `GET /game/reports/finished/actions-by-delivery` | `delivery_title`, `finished_at_start/end`, `email` | Task list inside `modal-company-carteira-detail` on a client-row click |
| `GET /game/actions` | `start`, `end`, `user`, optional `status` | Progress-list modal only: "Pontos" card and `processos-*` cards |
| `GET /auth/user` | — | Player name/team/season level (`c4u-season-level`) + KPI rings `numero-empresas`, `entregas-prazo` |
| `GET /player/{id}` | — | Only when `?playerId=` differs from the session user |
| `GET /campaign` | — | Season bounds / month selector |

Quirk: insights are wired only into `loadMonthDependentData()`, not `loadDashboardData()`, so the panel stays
empty until the first month change. There is no export action on this page. Dead branches on this page:
the "Carteira" tabs (commented out), `c4u-company-table` + `modal-company-detail` (`companies` always `[]`),
`modal-carteira` (`openCarteiraModal()` has no caller), and the progress-modal "Carregar mais".

---

## 5. `/dashboard/team-management` — Team management (gestor / diretor / C-level)

26 live endpoints. Team/roster and campaign:

| Method + path | Info returned |
|---|---|
| `GET /team` | BWA team list (`_id`, `name`, `game4u_team_id`) → team dropdown; source of every `team_id` |
| `GET /team/{teamId}` | Single team payload → resolves the numeric Game4U team id (GESTOR fallback + non-admin path) |
| `GET /team/{teamId}/users` | Team members → collaborator dropdown; rows with `deactivated_at` dropped |
| `GET /campaign` | Season bounds |
| `GET /auth/user` | `extra.companies` / `client_goals` / `entrega` → the two KPI rings (only when the session object lacks `extra`) |
| `GET /player/{id}` + `PUT /player/{id}` | Read-then-write `{extra: {client_goals}}` — "salvar meta de clientes", one pair per collaborator |

Cached dashboard panels (one per scope):

| Method + path | Params | Scope |
|---|---|---|
| `GET /game/reports/dashboard/cached` | `email`, `month` | a collaborator is selected |
| `GET /game/reports/supervision/dashboard/cached` | `team_id`, `month` | team view (adds `team_id`, `team_name`, `players_count`) |
| `GET /game/reports/management/dashboard/cached/overview` | `month`, optional `user_id`, `role` | "Painel do Gerente/Diretor/C-Level" — returns `{manager, teams[]}` |
| `GET /game/reports/management/dashboard/cached/list` | `month`, optional `role`, `user_id` | ADMIN preview dropdown; gerência series in the productivity tab; "Diretorias em destaque" |

All four return the same metric shape (season/month points, tasks, clients served, goal points,
on-time %, `refreshed_at`); 404 ⇒ `null` and a "not cached yet" state.

Clientes atendidos + exports:

| Method + path | Params |
|---|---|
| `GET /game/reports/finished/deliveries/cached` | `month`, `offset`, `limit` (30 for pages, 200 for CSV export, 500 legacy), `email` **or** `team_id` |
| `GET /game/reports/management/finished/deliveries/cached` | `month`, `offset`, `limit`, optional `user_id`/`role` — no `email`/`team_id`, scope from the JWT |
| `GET /game/reports/finished/deliveries` (+ paged variant) | `finished_at_start`/`finished_at_end` (mandatory pair), `email`, `team_id`, `status[]`, `offset`/`limit` — only when an email is combined with a `team_id` |

Insights, productivity and misc:

| Method + path | Params | Info |
|---|---|---|
| `GET /game/reports/user-actions` | `email` and/or `team_id`, `status[]`, exactly one of `finished_at_*` / `dt_prazo_*` / `created_at_*` | Two requests per scope (open + finished) → insights panel, executive rankings, progress modal |
| `GET /game/reports/team/daily-finished-stats` | `start`, `end`, `team_id`, optional `email`, `status[]`, `offset`, `limit`, `role`, `user_id` | Productivity tab line/bar charts. N requests in gerência/supervisão segmentation; `team_id=__management_overview__` for the manager panel |
| `GET /game/reports/team/daily-pending-stats` | `start`, `end`, `team_id`, optional `email`, `status[]`, `role` | Day-of-month chart inside the pending-tasks modal (SUPERVISOR / LIDER_CELULA) |
| `GET /game/reports/organization/hierarchy-report` | `month`, `depth=7` | ADMIN preview fallback when the management list is empty |
| `GET {gamificacaoApiUrl}` | `x-api-token` | Per-client KPI columns; suppressed when the page came from a `*/cached` endpoint |

Legacy-only (reachable when `usesGame4uWalletFromStats()` is false): `GET /game/reports/finished/summary`,
`GET /game/reports/open/summary`, `GET /game/stats`, `GET /game/actions`, `GET /game/team-stats`,
`GET /game/team-actions`.

---

## 6. `/dashboard/supervisor`

| Method + path | Info returned |
|---|---|
| `GET /auth/user` | Supervisor info card: name, `extra.cnpj_resp` count ("Volume de clientes"), `extra.entrega_sup`, `extra.cnpj_goal` |
| `GET /player/{playerId}/status` | ACL `catalog_items` → accessible team ids (keys with `quantity > 0`) |
| `GET {gamificacaoApiUrl}` | "Entregas" % and "Classificação" columns of all three Clientes tabs (carteira equipe / participação equipe / carteira supervisor) — one shared 10-min snapshot |
| `GET /campaign` | Month selector range (via `c4u-seletor-mes`) |
| `GET /game/reports/finished/deliveries/cached` | Player-detail modal, month selected: `email`, `month`, `offset=0`, `limit=500` → per-CNPJ action counts |
| `GET /game/actions` ×2 | Player-detail modal, "Toda temporada": `status=DONE` then `status=DELIVERED` |

`ngOnInit` calls `cacheManagerService.clearAllCaches()` first, wiping ~17 service caches on every load.
The player cards/table render the empty state because team members come only from the disabled
`player_status` aggregate, and `modal-company-detail` always errors for the same reason.

---

## 7. `/dashboard/supervisor-tecnico`

| Method + path | Params | Info returned |
|---|---|---|
| `GET /campaign` | — | Awaited on the critical path in `initializeDashboard()` |
| `GET /player/{playerId}/status` | — | ACL `catalog_items` → the "Equipe / Departamento" `<select>` |
| `GET /game/team-actions` | `start`, `end`, `team` | Per-member action counts → Pontos column, team total/average, point wallet |
| `GET /game/team-stats` | `start`, `end`, `team` | Activity + process metrics (`action_stats`, `delivery_stats`) → activity/process cards; also the monthly points breakdown (deduped to one request) |
| `GET /game/team-actions` (companion) | `start`=Jan 1, `end`=range end, `team` | `dt_prazo` meta boost / competence filtering, single-calendar-month ranges only |
| `GET {gamificacaoApiUrl}` | `x-api-token` | Carteira + Carteira Individual tabs: `entrega` %, `classificacao`, `cnpjNumber`; also `numero-empresas` KPI |
| `GET assets/help-texts.json` | — | `c4u-info-button` tooltips (this page renders three) |
| `GET /player/{collaboratorId}/status` | — | Collaborator drill-down: `point_categories.points`, `extra.cnpj_resp`/`cnpj`/`entrega`/`cnpj_goal`. Direct, uncached |
| `GET /game/reports/finished/summary` | `email`, `finished_at_start/end` | Collaborator progress metrics |
| `GET /game/reports/open/summary` | `email`, `dt_prazo_start/end` | idem |
| `GET /game/stats` | `user`, `start`, `end` | idem |
| `GET /game/actions` | `user`/`team_id`, `start`, `end` | idem; also the carteira-detail task list and the progress modal's process cards |
| `GET /auth/user` | — | `KPIService.getPlayerKPIs` — note the values always describe the authenticated user, not the selected collaborator |
| `GET /game/reports/user-actions` | `email`, `status[]`, `finished_at_*` or `dt_prazo_*` | Progress-list modal — **one request per team member** (no `[teamId]` is bound) |

The collaborator `<select>` is unreachable in the current build (`collaborators` comes from the disabled
`action_log` aggregate), so T-10…T-12 above are latent. `GET /game/reports/supervision/dashboard/cached`
is **not** used by either supervisor page — only by team-management; `…/cached/list` has zero callers.

---

## 8. `/dashboard/organization-hierarchy`

| Method + path | Params | Info returned |
|---|---|---|
| `GET /game/reports/organization/hierarchy-report` | `month` (req), `depth=7`, `simulation_pot_brl` (>0 only), `node_type`, `node_id` | `{refreshed_at, params, root}`. `root.mtd` → hero cards, pipeline segments, pace panel; `root.access` → app-access tab; `root.highlights` → gerentes/supervisões/jogadores lists; `root.critical_clients` → critical-clients section; `root.children` → tree table / flowchart; `root.finished_by_dow` → weekday chart. GET only — there is no POST variant |
| `GET …/hierarchy-report/kpi-detail` | `month`, `kpi` (21 keys), `months=4`, `node_type`, `node_id` | KPI drill-down modal: `history[]` monthly series + optional `client_lists` (10 keyed arrays) |
| `GET …/hierarchy-report/deliveries` | `month`, `drilldown` (7 keys incl. `critical_client`), `node_type`, `node_id`, `company_serve_key`, `issue`, tri-state `dedupe_deliveries`, tri-state `include_hierarchy` | Delivery-level drill-down: `diretorias[]` or `deliveries_flat[]`, `total_deliveries`, `scoring_event_counts`, `kpi_parity_ok`. **400 is rethrown** to show "Lista muito grande…" |
| `POST …/hierarchy-report/exports` | body `export_type` (`clients_served_xlsx`\|`critical_clients_deliveries`), `month`, `node_type`, `node_id`, `company_serve_key`, `issue`, `dedupe_deliveries` | `{job_id, status, estimated_seconds}`; job persisted in `sessionStorage` so a reload resumes polling |
| `GET …/hierarchy-report/exports/{jobId}` | — | Polled every 2 s: `status`, `progress_pct`, `phase`, `row_count`, `filename` → export-jobs tray |
| `GET …/hierarchy-report/exports/{jobId}/download` | blob | The XLSX, on `status === 'completed'` |
| `GET …/hierarchy-report/clients-served/export/xlsx` | `month`, `node_type`, `node_id` | Legacy sync export |
| `GET …/hierarchy-report/critical-clients/deliveries/export` | `month`, `issue`, `node_type`, `node_id`, `company_serve_key`, `dedupe_deliveries` | Legacy sync export |
| `GET /game/reports/organization/hierarchy-insights` | `month`, `depth`, `node_type`, `node_id`, `simulation_pot_brl`, `focus` | AI executive analysis — **inert**: `aiExecutiveAnalysisEnabled = false` |
| `POST /game/reports/organization/hierarchy-insights` | same query minus `focus`, which moves into the body | "Gerar análise" button — hidden by the same flag |

Export path selection: `environment.orgHierarchyAsyncExport` (default true, hard-true in homol/prod). A 404,
405 or 501 on the POST flips `asyncApiAvailable = false` and falls back to the two legacy sync GETs; any other
error fails outright. `GET …/hierarchy-report/multa-risk` is defined but has no caller anywhere.
`modal-organization-hierarchy-critical-clients` issues no HTTP (renders `root.critical_clients`, client-side
XLSX); the tree-node / tree-table / flowchart children are `@Output`-only.

---

## 9. `/dashboard/admin/pipeline-integration-changes`

| Method + path | Params | Info returned |
|---|---|---|
| `GET /game/reports/pipeline-integration/changes` | `start`, `end` (required ISO), `phase` (`reconcile`\|`ingest`\|`transform`\|`sync`, omitted for "Todas"), `limit` (default 100, clamped 1–1000), `offset` | `summary` → the five KPI cards (`total_changes`, `success_count`, `failed_count`, `distinct_emails`, `distinct_runs`) + `by_action_kind`; `items[]` → the change table with `before_json`/`after_json` diff on row expand |
| same, paged loop | `limit=500`, advancing `offset` until `has_more` is false | "Exportar Excel" — the XLSX is built client-side |

One endpoint total. This component injects `Game4uApiService` directly, so there is **no memo cache and no
in-flight dedupe**, and no 404-to-null mapping.

---

## 10. `/dashboard/rewards/rewards`

| Method + path | Body / params | Info returned |
|---|---|---|
| `GET /reward-store/catalog` | — | `_id` + `catalog` → category names map / filter chips |
| `GET /reward-store/item` | — | Store items: `_id`, `i18n['pt-BR'].name`/`description`, `amount` (stock), `owned`, `image.medium.url`, `requires[0].total` (cost) + `.item` (currency), `techniques` (premium/featured), `catalogId` |
| `GET /reward-store/purchase/list` | — | Redeemed achievements → "my rewards" tab (`_id`, `time`, `total`, `item`). **Called twice per load**; the `ngOnInit` copy's result is only `console.log`'d |
| `POST /reward-store/purchase/create` | `{player, item}` | Redeem confirm; only `status === 'OK'` is inspected |
| `GET /auth/user` | — | `email` → `idConsulta`, `full_name` → `nomeConsulta` for the season sidebar |
| `GET /campaign`, `GET /client/system-params` | — | Season window; feature flags gating the right-hand menu |

`GET /reward-store/purchase/list-all` is defined with zero call sites. `coins`/`points`/`price` are hard-coded
and mutated only in `localStorage`, so the affordability gate for the real purchase runs against a
client-controlled balance. `REWARD_STORE_API.md` is stale: correct paths, but wrong item/catalog field names,
a documented-but-unsent `extra.upgrade`, a `{success,message}` response the code doesn't read, and a mock
fallback that doesn't exist.

---

## 11. `/dashboard/thermometer/thermometer`

`GET /campaign` only — and normally served from cache, so 0 network calls. Every gauge value is a literal
(`currentProgress: 67`, `goalAmount: 1000000`, `currentAmount: 670000`, `teamSize: 25`). `AcessoService` is
injected but never invoked, so `GET /team/managed-teams` and `GET /team/{id}/users` are unreachable here.
Everything else on the route comes from the embedded season sidebar (§13).

---

## 12. `/dashboard/ranking`

| Method + path | Params / body | Info returned |
|---|---|---|
| `GET /leaderboards` | — | `_id`, `title`, `principalType`, `operation`, `period{}` → ranking-type dropdown. `description`/`category` are derived client-side from a hard-coded lookup, not the API |
| `POST /leaderboards/{rankingId}` | query `period={start};{end}` as relative day offsets (`-Nd-`/`-Nd+`); **body `{}`** | Participants: `name`, `teamName`, `position`, `total`, `previous_position`, `previous_total`, `move`. `level`, `achievements`, `progress`, `totalParticipants` and `lastUpdated` are all computed client-side |
| `GET /leaderboards` (again) | — | Re-fetched to decorate the result with `title`/`period` — the cache is bypassed for the HTTP call |

Selector and date changes issue nothing; only "Gerar Ranking" does. Failures are invisible: a list failure
permanently caches four fabricated ranking types, and a details failure renders ten participants with
`Math.random()` points while still setting `hasGeneratedRanking = true`.

---

## 13. Shared surfaces

### Season sidebar (`page-season`, on Rewards + Thermometer)

| Method + path | Params | Info |
|---|---|---|
| `GET /game/stats` | `start`, `end`, `user` | `action_stats.DONE/PENDING`, `total_points`, `total_blocked_points`, `delivery_stats.{PENDING,INCOMPLETE,DELIVERED}` |
| `GET /game/actions` | `start`, `end`, `user` | Takes priority over stats for points/tasks/clients |
| `GET /game/team-stats`, `GET /game/team-actions` | `start`, `end`, `team` | Same for team context |
| `GET /campaign` | — | Season date range label |
| `GET /client/system-params` | — | Aliases, client logo/name, `free_challenges_allowed_teams`/`_roles` gates |

Range is the **full campaign interval**, not a month. `modal-detalhe-executor` issues zero requests (its
body is commented out).

### `modal-gerenciar-pontos-avulsos` (opened from the season card)

`GET /action` · `GET /user-action/search` (`created_at_start/end`, `dismissed`, `page`, `limit`, repeated
`status`, `team_id` **or** `user_email`, optional `executor_email`, `finished_at_*`) · `GET /game/actions` ·
`GET /game/team-actions` · `GET /game/deliveries` · `GET /game/team-deliveries` · `GET /team/{timeId}/users` ·
`POST /game/action/process` · `PUT /game/action/status` ·
`POST /game/delivery/{id}/{complete,restore,cancel,undeliver}` · `POST /user-action/{id}/comment` ·
`PUT /user-action/{id}/attachment` (multipart) · `GET /user-action/{id}/attachment` ·
`GET /user-action/download-attachment/{id}`

### Shared modals

| Modal | Endpoints | Used by |
|---|---|---|
| `modal-carteira` | `finished/deliveries/cached` or `finished/deliveries` or `/game/actions` ×2 (season) + gamificação hook | player dashboard (no caller), team management |
| `modal-company-carteira-detail` | `finished/actions-by-delivery` or `/game/actions` | player dashboard, team management, supervisor técnico |
| `modal-company-detail` | `cnpj_performance__c` aggregate — **dead**, always errors | player dashboard (not rendered), both supervisor pages |
| `modal-progress-list` | `GET /game/reports/user-actions` (open/finished slices), `GET /game/actions` (process lists), `GET /game/reports/team/daily-pending-stats` (team scope chart) | player dashboard, team management, supervisor técnico |
| `modal-player-detail` | `GET /player/{id}` (only without `cnpjRespFromAggregate`), `finished/deliveries/cached` or `/game/actions` ×2 | both supervisor pages |
| `modal-organization-hierarchy-kpi-detail` | `kpi-detail`, `deliveries`, export job POST | org hierarchy |
| `modal-season-faq`, `modal-team-management-faq`, `modal-organization-hierarchy-critical-clients`, `modal-pending-quests` | none — static / `@Input`-driven | various |

### Shared components

Only four touch the network: `c4u-seletor-mes` (`GET /campaign`, plus a Feb-2026-only `action_log` probe),
`c4u-help-button` (`POST` to the n8n webhook with `{nome, email, descricao, pagina, timestamp}`),
`c4u-info-button` (`GET assets/help-texts.json`, `shareReplay(1)`), and `c4u-dashboard-insights`
(feature flags via `/client/system-params`; its insight data arrives as an `@Input`).

`c4u-company-table`, `c4u-point-wallet`, `c4u-season-progress`, `c4u-season-level`, `c4u-activity-progress`,
`c4u-kpi-circular-progress`, `c4u-monthly-points-goal-progress`, `c4u-grafico-barras`,
`c4u-goals-progress-tab`, `c4u-productivity-analysis-tab`, `c4u-team-selector`, `c4u-team-sidebar`,
`c4u-collaborator-selector`, `c4u-time-period-selector`, `c4u-dashboard-navigation`,
`c4u-game-rules-update-banner`, `c4u-org-hierarchy-export-jobs` issue **zero** HTTP.

---

## 14. Endpoint → pages index

### Auth / config
| Endpoint | Pages |
|---|---|
| `POST /auth/login`, `POST /auth/change-password*` | login |
| `GET /auth/user` | login (post-submit), player dashboard, team management, supervisor, supervisor técnico, rewards |
| `POST /auth/refresh` | any page (interceptor) |
| `GET /client/system-params` | login, season sidebar (rewards, thermometer) |
| `GET /campaign` | every page with a month selector or season card |

### Teams / players
| Endpoint | Pages |
|---|---|
| `GET /team`, `GET /team/{id}` | team management |
| `GET /team/{id}/users` | team management, pontos-avulsos modal |
| `GET /team/managed-teams` | none (injected but never called) |
| `GET /player/{id}` | player dashboard (`?playerId=`), team management (meta save), player-detail modal |
| `PUT /player/{id}` | team management |
| `GET /player/{id}/status` | supervisor (ACL), supervisor técnico (ACL + collaborator) |

### Game4U reports
| Endpoint | Pages |
|---|---|
| `GET /game/reports/dashboard/cached` | player dashboard, team management |
| `GET /game/reports/supervision/dashboard/cached` | team management only |
| `GET /game/reports/supervision/dashboard/cached/list` | none (dead code) |
| `GET /game/reports/management/dashboard/cached/overview` \| `/list` | team management |
| `GET /game/reports/finished/deliveries/cached` | player dashboard, team management, player-detail modal |
| `GET /game/reports/management/finished/deliveries/cached` | team management |
| `GET /game/reports/finished/deliveries` | team management, carteira modal |
| `GET /game/reports/finished/actions-by-delivery` | player dashboard, team management, supervisor técnico |
| `GET /game/reports/user-actions` | player dashboard, team management, supervisor técnico (progress modal) |
| `GET /game/reports/finished/summary` \| `open/summary` \| `goal/month/summary` | supervisor técnico; team management legacy branch |
| `GET /game/reports/team/daily-finished-stats` | team management (productivity tab) |
| `GET /game/reports/team/daily-pending-stats` | progress modal in team scope |
| `GET /game/reports/organization/hierarchy-report` | org hierarchy; team management (ADMIN fallback) |
| `…/hierarchy-report/kpi-detail`, `/deliveries`, `/exports*`, `/…/export*` | org hierarchy |
| `…/hierarchy-report/multa-risk`, `/hierarchy-insights` (GET+POST) | defined, currently unreachable |
| `GET /game/reports/pipeline-integration/changes` | admin pipeline |

### Game4U raw
| Endpoint | Pages |
|---|---|
| `GET /game/stats` | season sidebar, supervisor técnico; team management legacy |
| `GET /game/actions` | season sidebar, supervisor técnico, progress/carteira modals, pontos-avulsos |
| `GET /game/team-stats` | supervisor técnico; team management legacy |
| `GET /game/team-actions` | supervisor técnico, pontos-avulsos; team management legacy |
| `GET /game/deliveries`, `GET /game/team-deliveries` | pontos-avulsos modal |
| `POST /game/action/process`, `PUT /game/action/status`, `POST /game/delivery/{id}/*` | pontos-avulsos modal |
| `GET /action`, `GET /user-action/*` | pontos-avulsos modal |

### Store / ranking / external
| Endpoint | Pages |
|---|---|
| `GET /reward-store/catalog` \| `/item` \| `/purchase/list`, `POST /purchase/create` | rewards |
| `GET /leaderboards`, `POST /leaderboards/{id}` | ranking |
| `GET {gamificacaoApiUrl}` | player dashboard, team management, both supervisor pages, carteira modals |
| `POST` n8n help webhook | any page (help button) |
| `GET assets/help-texts.json` | any page rendering `c4u-info-button` |

### Dead (client-side disabled)
`POST /database/action_log/aggregate` · `/player/aggregate` · `/player_status/aggregate` ·
`/achievement/aggregate` · `/acl__c/aggregate` · `/cnpj_performance__c/aggregate` ·
`/metric_targets__c/aggregate` · `/empid_cnpj__c/aggregate` · Supabase PostgREST
`GET /rest/v1/{companies}` (mock-only) · Funifier `/virtualgoods/item` (commented out).
