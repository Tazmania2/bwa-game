# Endpoint Map — Organization Hierarchy Report & Admin Pipeline Integration Changes

Every claim below cites `file:line`. Nothing is inferred: endpoints listed are only those literally built in
`src/app/services/game4u-api.service.ts`. All paths are relative to `environment.backend_url_base`
(`baseUrl`, trailing slash stripped — `src/app/services/game4u-api.service.ts:149`) and all carry the single
header `client_id: environment.client_id` when configured (`src/app/services/game4u-api.service.ts:1602-1605`).

Two gates apply to every call routed through `ActionLogService`:

- `Game4uApiService.isConfigured()` → `baseUrl.length > 0` (`src/app/services/game4u-api.service.ts:153-155`).
- `isGame4uDataEnabled()` → `environment.useGame4uApi !== false` and a `backend_url_base` (or Supabase fallback)
  (`src/app/model/game4u-api.model.ts:1848-1858`).
  When either is false the read wrappers short-circuit to `of(null)` and no HTTP is issued
  (e.g. `src/app/services/action-log.service.ts:818-820`).

---

## 1. Summary table — every distinct endpoint

### Page 1 — Organization Hierarchy Report (`/dashboard/organization-hierarchy`)

| # | Method + path | Issuing service method | Component trigger |
|---|---|---|---|
| 1 | `GET /game/reports/organization/hierarchy-report` | `Game4uApiService.getGameReportsOrganizationHierarchyReport` (`game4u-api.service.ts:1027`) via `ActionLogService.fetchOrganizationHierarchyReport` (`action-log.service.ts:811`) | `ngOnInit` → `loadReport()` (`organization-hierarchy-report.component.ts:260,1346`), month change (`:871-874`), simulation-pot debounce (`:256-259`), retry (`:1147-1148`) |
| 2 | `GET /game/reports/organization/hierarchy-report/kpi-detail` | `getGameReportsOrganizationHierarchyKpiDetail` (`game4u-api.service.ts:1077`) via `fetchOrganizationHierarchyKpiDetail` (`action-log.service.ts:862`) | KPI drill-down modal load (`modal-organization-hierarchy-kpi-detail.component.ts:663-671`) |
| 3 | `GET /game/reports/organization/hierarchy-report/deliveries` | `getGameReportsOrganizationHierarchyDeliveries` (`game4u-api.service.ts:1329`) via `fetchOrganizationHierarchyDeliveries` (`action-log.service.ts:1077`) | Operational KPI drill-down (`modal-...-kpi-detail.component.ts:633-641`) and critical-client drill-down (`:697-705`) |
| 4 | `POST /game/reports/organization/hierarchy-report/exports` | `postGameReportsOrganizationHierarchyExportJob` (`game4u-api.service.ts:1250`) via `createOrganizationHierarchyExportJob` (`action-log.service.ts:986`) | Export click → `OrgHierarchyExportJobService.runJob` (`org-hierarchy-export-job.service.ts:128-134`) |
| 5 | `GET /game/reports/organization/hierarchy-report/exports/{jobId}` | `getGameReportsOrganizationHierarchyExportJobStatus` (`game4u-api.service.ts:1277`) via `getOrganizationHierarchyExportJobStatus` (`action-log.service.ts:1000`) | Polling tick every 2 s (`org-hierarchy-export-job.service.ts:32,216-224,241-243`) |
| 6 | `GET /game/reports/organization/hierarchy-report/exports/{jobId}/download` | `getGameReportsOrganizationHierarchyExportJobDownload` (`game4u-api.service.ts:1301`) via `downloadOrganizationHierarchyExportJob` (`action-log.service.ts:1014`) | Poll observed `status === 'completed'` (`org-hierarchy-export-job.service.ts:263-267,288-290`) |
| 7 | `GET /game/reports/organization/hierarchy-report/clients-served/export/xlsx` (legacy sync) | `getGameReportsOrganizationHierarchyClientsServedExportXlsx` (`game4u-api.service.ts:1157`) via `exportOrganizationHierarchyClientsServedXlsx` (`action-log.service.ts:916`) | Async path unavailable / flag off (`org-hierarchy-export-job.service.ts:125-128,147-158,169-173`) |
| 8 | `GET /game/reports/organization/hierarchy-report/critical-clients/deliveries/export` (legacy sync) | `getGameReportsOrganizationHierarchyCriticalClientsDeliveriesExport` (`game4u-api.service.ts:1197`) via `exportOrganizationHierarchyCriticalClientsDeliveries` (`action-log.service.ts:946`) | Same legacy fallback branch (`org-hierarchy-export-job.service.ts:174-180`) |
| 9 | `GET /game/reports/organization/hierarchy-insights` | `getGameReportsOrganizationHierarchyInsights` (`game4u-api.service.ts:1391`) via `fetchOrganizationHierarchyInsights` (`action-log.service.ts:1145`) | `loadReport()` success **only if** `aiExecutiveAnalysisEnabled` (`organization-hierarchy-report.component.ts:1382-1384`) — currently `false` (`:138`), so **not issued today** |
| 10 | `POST /game/reports/organization/hierarchy-insights` | `postGameReportsOrganizationHierarchyInsights` (`game4u-api.service.ts:1423`) via `generateOrganizationHierarchyInsights` (`action-log.service.ts:1186`) | "Gerar análise" button (`organization-hierarchy-report.component.html:917`) → `generateInsights()` (`:1155`); the section is hidden while `aiExecutiveAnalysisEnabled === false` (`:751-752`, `.html:890`) |

Defined but **not reachable from this page** (no caller in `src/app` outside its own definition):
`GET /game/reports/organization/hierarchy-report/multa-risk` — `game4u-api.service.ts:1117`, wrapper
`action-log.service.ts:1029`; grep shows the wrapper is referenced nowhere else.

There is **no POST variant of `/hierarchy-report` itself**. Within this service only two POSTs exist on the
organization surface: `.../hierarchy-report/exports` (`game4u-api.service.ts:1250,1267-1272`) and
`/hierarchy-insights` (`:1423,1450-1457`). The report itself is GET-only (`:1027,1064-1070`).

### Page 2 — Admin Pipeline Integration Changes (`/dashboard/admin/pipeline-integration-changes`)

| # | Method + path | Issuing service method | Component trigger |
|---|---|---|---|
| 1 | `GET /game/reports/pipeline-integration/changes` | `Game4uApiService.getGameReportsPipelineIntegrationChanges` (`game4u-api.service.ts:1465`, request at `:1495-1500`) | `ngOnInit` → `loadChanges()` (`pipeline-integration-changes.component.ts:92-94,234`), month change (`:128-132`), phase change (`:134-137`), limit change (`:139-143`), `reload()` retry (`:145-147`) |
| 2 | `GET /game/reports/pipeline-integration/changes` (paged loop for export) | same method | "Exportar Excel" click → `exportToExcel()` → `fetchAllRowsForExport()` loop (`pipeline-integration-changes.component.ts:149-176,263-289`) |

This page has exactly **one distinct endpoint**; the Excel export re-reads it with `limit=500` and increasing
`offset` until `has_more` is false (`pipeline-integration-changes.component.ts:265-288`). The XLSX file itself
is generated client-side (`downloadXlsxFile`, `:36,169`) — no export endpoint is called.

---

## 2. Route guards

| Route | Guard | HTTP? |
|---|---|---|
| `/dashboard/organization-hierarchy` (`pages.routing.ts:15-21`) | `OrgHierarchyReportGuard` (`organization-hierarchy-report.module.ts:24`) | **No HTTP.** Reads `SessaoProvider.usuario` in memory and calls `canAccessOrganizationHierarchyNav(roles)`; redirects to `/login` or `/sem-permissao` (`guards/org-hierarchy-report.guard.ts:17-30`) |
| `/dashboard/admin/pipeline-integration-changes` (`pages.routing.ts:22-28`) | `AdminGuard` (`pipeline-integration-changes.module.ts:15`) | **No HTTP.** Checks `SessaoProvider.usuario` + `sessao.isAdmin()` only (`guards/admin.guard.ts:16-29`) |

Both routes are lazy-loaded (`pages.routing.ts:17-20,24-27`); the guard runs before the module's component,
so no data request precedes authorization.

---

## 3. Page 1 — Organization Hierarchy Report, request by request

Component: `src/app/pages/dashboard/organization-hierarchy-report/organization-hierarchy-report.component.ts`.
Child components `org-hierarchy-tree-node`, `org-hierarchy-tree-table`, `org-hierarchy-flowchart`,
`org-hierarchy-flowchart-node` are **pure presentational** — they inject no service (only `ChangeDetectorRef` in
the flowchart, `org-hierarchy-flowchart.component.ts:74`) and issue **zero HTTP**. They communicate upward via
`@Output` only: `toggleNode` (`org-hierarchy-tree-node.component.ts:25`, `tree-table:101`, `flowchart:36`,
`flowchart-node:29`), `kpiClick` (`tree-table:107`, `flowchart:39`, `flowchart-node:31`), `expandAll` /
`collapseAll` (`tree-table:103,105`), `searchChange` / `selectNode` (`flowchart:45,46`).

### 3.1 `GET /game/reports/organization/hierarchy-report`

- **Query params** (built at `game4u-api.service.ts:1051-1063`; request at `:1064-1070`):
  - `month` — required `YYYY-MM`; missing → local `throwError` before any request (`:1036-1044`).
    Produced from the selected month by `toDashboardCachedMonthParam` (`action-log.service.ts:626-630`).
  - `depth` — floored integer (`game4u-api.service.ts:1055-1057`); the component always passes `7` (`organization-hierarchy-report.component.ts:1366`;
    default also 7 at `action-log.service.ts:822`).
  - `simulation_pot_brl` — only when `> 0` and finite (`game4u-api.service.ts:1052-1054`; gated again at
    `action-log.service.ts:840`).
  - `node_type` — one of `organization | c_level | segmentacao | diretoria | gerencia | supervisao | player`
    (`model/game4u-api.model.ts:764-772`); sent only when non-empty (`game4u-api.service.ts:1058-1060`).
  - `node_id` — sent only when non-empty (`:1061-1063`). The page never sets `node_type`/`node_id`, so it always
    requests the organization root (`organization-hierarchy-report.component.ts:1363-1367`).
- **Response → UI**: `OrganizationHierarchyReportResponse = { refreshed_at, params, root }`
  (`model/game4u-api.model.ts:992-996`). `params` (`cache_month`, `mtd_start`, `mtd_end`, `prev_month`,
  `prev_mtd_start`, `prev_mtd_end`, `simulation_pot_brl`, `points_per_brl` — `:981-990`) feeds the
  "Dados sincronizados / MTD" stamp (`.component.html:11-19`) and the `pts/BRL` label (`.component.ts:787-793`).
  `root` (`OrgHierarchyNode`, `:955-979`) feeds:
  - hero cards from `root.mtd` — points, on-time %, finished, goals (`.component.ts:416-447,501-624`, `.html:181,215,245`);
  - pipeline segments and operational risk alerts from `root.mtd` (`.component.ts:376-386`);
  - pace panel from the predictive `mtd` fields (`.component.ts:388-402`, `OrgMetricsWindow:774-816`, predictive fields `:807-815`);
  - `root.access` → app-access tab, weekday bars, player access table (`.component.ts:313-349`);
  - `root.highlights` derived per tab → Gerentes/Supervisões/Jogadores lists (`.component.ts:368-374`);
  - `root.critical_clients` → critical-clients section + modal (`.component.ts:404-414`);
  - `root.children` → tree table / flowchart, auto-expanding root children when
    `root.node_type === 'organization'` (`.component.ts:1377-1380`);
  - `root.finished_by_dow` → weekday chart (`.component.ts:305-311`).
- **Caching**: two layers.
  1. `ActionLogService` key `g4u_org_hierarchy_${monthParam}_${sim ?? ''}_${depth}_${nodeType}_${nodeId}`,
     TTL `GAME4U_CACHE_DURATION = 15 min` (`action-log.service.ts:827-836,524`), `shareReplay` with
     `windowTime` (`:853`).
  2. `Game4uApiService` in-flight dedupe key `org-hierarchy|${month}|${sim}|${depth}|${nodeType}|${nodeId}`
     (`game4u-api.service.ts:1049`) via `shareGame4uDedupe`, which drops the entry on error
     (`:170-186`).
- **Error / fallback**: HTTP 404 → `of(null)` ⇒ `isEmpty` empty state (`action-log.service.ts:846-848`,
  `.component.ts:1375`). Other errors are logged and also mapped to `null` (`action-log.service.ts:849-851`);
  a thrown error (e.g. missing `month`) sets `hasLoadError` and renders the retry button
  (`.component.ts:1387-1393`, `.html:157`).
- **Force refresh**: `retryLoad()` → `loadReport(true)` calls `actionLogService.clearCache()` first
  (`.component.ts:1147-1148,1358-1360`, `action-log.service.ts:4380`).
- **Race control**: `loadGen` counter discards stale responses (`.component.ts:1347,1371-1373`).

### 3.2 `GET /game/reports/organization/hierarchy-report/kpi-detail`

- **Trigger**: any KPI click that opens the drill-down modal — hero cards / global MTD metrics
  (`.component.ts:1026-1050,1197-1201`), pipeline segment (`:707-712`), classification tier (`:454-460`),
  tree/flowchart `kpiClick` (`:1001-1023`, wired at `.html:1042,1053`). Modal fires on `ngOnInit` → `load()`
  and on any relevant `ngOnChanges` (`modal-...-kpi-detail.component.ts:140,147-166,621`).
- **Query params** (`game4u-api.service.ts:1097-1103`; request at `:1104-1110`): `month` (required, check at `:1086-1089`), `kpi` (required, one of the 21
  `OrgHierarchyKpiDetailKey` values — `model/game4u-api.model.ts:998-1018`), `months`
  (`max(1, floor(months))`, default 4 — `:1093,1097`; the page passes `months: 4`,
  `.component.ts:1013,1040`), optional `node_type`, `node_id`.
- **Not called when** the KPI is a deliveries drill-down (`multa_risk`, `multa_incurred`, `near_due`,
  `overdue_pending`, `overdue_pending_justified`, `overdue_pending_unjustified` —
  `org-hierarchy-report.mapper.ts:26-39`) or when the modal is in critical-client mode
  (`modal-...-kpi-detail.component.ts:176-182,632-661`); it is also skipped when the compare context already
  carries monthly history (`:598-626,656-662`).
- **Response → UI**: `{ kpi, kpi_label, node_type, node_id, node_label, history[], client_lists? }`
  (`model/game4u-api.model.ts:1090-1098`). `history` (per-month `cache_month`, `month_label`, `mtd_start`,
  `mtd_end`, `value`, `full_value` — `:1080-1088`) drives the modal chart and monthly table
  (`modal-...-kpi-detail.component.ts:281-303,742-775`); `client_lists` (10 keyed arrays — `:1067-1078`)
  drives the client-list tabs, search and client-side XLSX/CSV export (`:308-360,880-899`). The response is
  normalized by `normalizeOrganizationHierarchyKpiDetailResponse` (`action-log.service.ts:898`, imported from
  `org-hierarchy-client-lists.mapper.ts:17`); whether client lists are requested at all is decided by
  `shouldFetchOrgHierarchyClientLists` (`org-hierarchy-client-lists.mapper.ts:269-280`).
- **Caching**: `g4u_org_hierarchy_kpi_detail_${month}_${kpi}_${months}_${nodeType}_${nodeId}`, 15 min
  (`action-log.service.ts:879-887`); API dedupe key
  `org-hierarchy-kpi-detail|${month}|${kpi}|${months}|${nodeType}|${nodeId}` (`game4u-api.service.ts:1095`).
- **Error / fallback**: 404 → `of(null)`; others logged → `of(null)` (`action-log.service.ts:899-906`); the
  modal then renders with `kpiDetail = null` (`modal-...-kpi-detail.component.ts:679-686`).

### 3.3 `GET /game/reports/organization/hierarchy-report/deliveries`

- **Trigger A — operational KPI drill-down**: modal `load()` when
  `isOrgHierarchyDeliveriesDrilldownKpi(kpi)` (`modal-...-kpi-detail.component.ts:632-654`).
- **Trigger B — critical client drill-down**: `openCriticalClientDrillDown` from the critical-clients list or
  the critical-clients modal (`organization-hierarchy-report.component.ts:1092-1110`, `.html:537-539,565,576`)
  → `loadCriticalClientDeliveries()` with `drilldown: 'critical_client'`
  (`modal-...-kpi-detail.component.ts:688-706`). Changing the issue chip re-emits `issueFilterChange`
  (`:832-855`) and the parent re-supplies the context (`.component.ts:1131-1142`).
- **Query params** (`game4u-api.service.ts:1353-1377`; request at `:1378-1384`):
  - `month` — required (`:1342-1344`).
  - `drilldown` — required; one of `multa_risk | multa_incurred | near_due | overdue_pending |
    overdue_pending_justified | overdue_pending_unjustified | critical_client`
    (`model/game4u-api.model.ts:1020-1027`); missing → local error (`game4u-api.service.ts:1345-1347`).
  - `node_type`, `node_id` — when non-empty (`:1354-1359`).
  - `company_serve_key` — set for critical-client mode from `client.company_serve_key`
    (`modal-...-kpi-detail.component.ts:702`; param at `game4u-api.service.ts:1360-1363`).
  - `issue` — `all | overdue | late_finish` (`model/game4u-api.model.ts:1036`; param at `game4u-api.service.ts:1364-1367`); the modal always sends `'all'`
    and filters the returned set locally (`modal-...-kpi-detail.component.ts:703,428-435,729-735`).
  - `dedupe_deliveries` — tri-state: omitted = API default, else literal `'true'`/`'false'`
    (`game4u-api.service.ts:1368-1372`; wrapper `action-log.service.ts:1118-1119`). Current call sites omit it;
    the resumida / "Detalhe KPI" toggle is applied client-side
    (`modal-...-kpi-detail.component.ts:121,193-207,452-459,729-735`).
  - `include_hierarchy` — tri-state, same encoding (`game4u-api.service.ts:1373-1377`,
    `action-log.service.ts:1120-1121`); no current caller sets it, so the API default applies
    (`modal-...-kpi-detail.component.ts:634-640,698-704`).
- **Response → UI**: `OrganizationHierarchyDeliveriesResponse` with `cache_month`, `mtd_start`, `mtd_end`,
  `drilldown`, `drilldown_label`, `ref_date`, `total_deliveries`, `include_hierarchy`, `diretorias[]`, optional
  flat `deliveries_flat[]`, `company_serve_key`, `critical_client_issue`, `dedupe_deliveries`,
  `all_scoring_events`, `scoring_event_counts`, `kpi_expected`, `kpi_parity_ok`
  (`model/game4u-api.model.ts:1228-1249`). Flattening rule: when `include_hierarchy === false` and
  `deliveries_flat` is present the flat list wins, otherwise deliveries are read out of
  diretoria→gerência→supervisão (`getOrgHierarchyDeliveriesList`, `:1531-1545`). Consumed by the modal deliveries table, the search box, the
  issue chips with counts, the KPI parity badge and the spreadsheet export
  (`modal-...-kpi-detail.component.ts:371-435,791-830`). Responses are normalized via
  `normalizeOrganizationHierarchyDeliveriesResponse` (`action-log.service.ts:1123`).
- **Caching**: `g4u_org_hierarchy_deliveries_${month}_${drilldown}_${nodeType}_${nodeId}_${companyServeKey}_${issue}_${dedupe 0|1|d}_${includeHierarchy 0|1|d}`,
  15 min (`action-log.service.ts:1099-1107`); API dedupe key with the same components
  (`game4u-api.service.ts:1351`).
- **Error / fallback**: 404 → `of(null)`; **400 is rethrown** (`action-log.service.ts:1125-1130`) so the modal
  can show "Lista muito grande; use visão resumida ou filtre por tipo de problema."
  (`modal-...-kpi-detail.component.ts:714-726`); other errors logged → `of(null)`.

### 3.4 Async export flow (feature-flagged) — `POST .../exports` → poll → download

Owner: `src/app/services/org-hierarchy-export-job.service.ts`.

- **Feature flag**: `environment.orgHierarchyAsyncExport !== false && this.asyncApiAvailable !== false`
  (`:125-127`). Default `true` from `ORG_HIERARCHY_ASYNC_EXPORT` (`src/environments/environment.ts:35-38`),
  hard-`true` in homolog/prod (`environment.homol.ts:21`, `environment.prod.ts:20`).
- **Triggers**: "Exportar clientes atendidos" (`organization-hierarchy-report.component.ts:1079-1090`,
  `.html:290`) → `startClientsServedExport` (`export-job.service.ts:85-87`); "Exportar entregas de clientes
  críticos" (`.component.ts:1111-1130`, `.html:508`) → `startCriticalClientsDeliveriesExport`
  (`export-job.service.ts:89-91`). The KPI modal exposes the same clients-served job
  (`modal-...-kpi-detail.component.ts:903-912`).

**Step 1 — `POST /game/reports/organization/hierarchy-report/exports`** (`game4u-api.service.ts:1250,1267-1272`)

- **Body** (`buildExportJobBody`, `export-job.service.ts:339-358`; typed at
  `model/game4u-api.model.ts:1139-1147`):
  `export_type` (`clients_served_xlsx | critical_clients_deliveries`, `:1127-1130`), `month` (`YYYY-MM`,
  required — missing → local error at `game4u-api.service.ts:1261-1266`), optional `node_type`, `node_id`,
  `company_serve_key`, `issue` (only for `critical_clients_deliveries`, default `'all'`), and
  `dedupe_deliveries: false` only when explicitly false. No query params are sent.
- **Response**: `{ job_id, status, estimated_seconds? }` (`model/game4u-api.model.ts:1150-1154`). Missing
  `job_id` fails the job locally (`export-job.service.ts:134-138`). `job_id` + kind + label are persisted in
  `sessionStorage` so a reload resumes polling (`:145,312-336,462-501`).

**Step 2 — `GET /game/reports/organization/hierarchy-report/exports/{jobId}`**
(`game4u-api.service.ts:1277,1292-1295`; `jobId` is `encodeURIComponent`-escaped, empty → local error `:1288-1291`)

- **Trigger**: `timer(0, 2000)` polling tick (`export-job.service.ts:32,216-224`).
- **Response**: `{ job_id, status, progress_pct?, phase?, row_count?, error_message?, filename?, expires_at? }`
  (`model/game4u-api.model.ts:1157-1166`). Drives the export-jobs tray: progress %, phase label, row count,
  filename (`export-job.service.ts:228-261`, tray component
  `src/app/components/c4u-org-hierarchy-export-jobs/c4u-org-hierarchy-export-jobs.component.ts:22-31`). The
  page's spinner state comes from `hasActiveJob(kind)` (`.component.ts:266-272`, `export-job.service.ts:77-83`).
- **Terminal states**: `completed` → stop polling, drop persistence, download (`:259-265`);
  `failed`/`cancelled` → stop, mark failed, toast (`:266-271`). Any poll error stops polling and fails the job
  (`:272-278`). No query params.

**Step 3 — `GET /game/reports/organization/hierarchy-report/exports/{jobId}/download`**
(`game4u-api.service.ts:1301,1312-1323`, `observe: 'response'`, `responseType: 'blob'`)

- **Response**: binary blob. Filename resolution order: `Content-Disposition`
  (`parseHttpContentDispositionFilename`) → status `filename` → locally built name
  (`export-job.service.ts:280-305,360-379`). Empty blob → job failed (`:292-295`).

**Legacy sync fallback (feature flag off, or async endpoint answered 404 / 405 / 501)**

`isAsyncEndpointUnavailable` treats 404, 405 and 501 as "no async API", flips `asyncApiAvailable = false` and
falls through to the sync GETs; any other error fails the job without fallback
(`export-job.service.ts:147-158,441-446`).

- `GET /game/reports/organization/hierarchy-report/clients-served/export/xlsx`
  (`game4u-api.service.ts:1157,1186-1191`) — params `month` (required, `:1168-1176`), optional `node_type`,
  `node_id` (`:1179-1185`); `observe: 'response'`, `responseType: 'blob'`.
- `GET /game/reports/organization/hierarchy-report/critical-clients/deliveries/export`
  (`game4u-api.service.ts:1197,1236-1244`) — params `month` (required), `issue` (always sent, default `'all'`),
  optional `node_type`, `node_id`, `company_serve_key`, and `dedupe_deliveries` as literal `'true'`/`'false'`
  when explicitly set (`:1219-1235`).
- Both are unwrapped identically: empty blob → failure, otherwise `Content-Disposition` filename or a locally
  built one, then browser download (`export-job.service.ts:161-214`). Neither is cached or deduped — they are
  plain `http.get` calls with no `shareGame4uDedupe` wrapper.

### 3.5 AI insights (`/hierarchy-insights`) — present but disabled

- `GET /game/reports/organization/hierarchy-insights` (`game4u-api.service.ts:1391,1409-1417`) — params built by
  `buildOrgHierarchyInsightsHttpParams` (`org-hierarchy-insights-params.ts:9-29`): `month` (required),
  `depth`, `node_type`, `node_id`, `simulation_pot_brl` (only `> 0`), `focus`
  (`risks_and_actions | performance | people | financial`, `model/game4u-api.model.ts:1577-1581`; default
  `'risks_and_actions'` at `game4u-api.service.ts:1407`).
- `POST /game/reports/organization/hierarchy-insights` (`game4u-api.service.ts:1423,1450-1457`) — same query
  params **minus `focus`**, which is deliberately deleted from the query and sent in the body instead
  (`:1444-1448`); body is `{ focus? }` (`defaultOrgHierarchyInsightsBody`,
  `org-hierarchy-insights-params.ts:44-48`; type `model/game4u-api.model.ts:1625-1627`). On success the shared
  insights cache entry is invalidated (`game4u-api.service.ts:1458-1462`) and re-seeded in `ActionLogService`
  (`action-log.service.ts:1203-1211`).
- **Cache key** (both layers): `month|depth|node_type|node_id|simulation_pot_brl|focus`
  (`org-hierarchy-insights-params.ts:31-42`), prefixed `org-hierarchy-insights|`
  (`game4u-api.service.ts:1408`) or `g4u_org_hierarchy_insights_` with 15 min TTL
  (`action-log.service.ts:1159-1167`).
- **Component behaviour**: scope is `{ month, depth: insightsDepth, focus: 'risks_and_actions', simulation_pot_brl? }`
  (`.component.ts:771-783`). GET runs at `depth = 7` and, on a null (404) result, retries once at `depth = 1`
  because the GET is free (`.component.ts:1415-1425`); the POST uses `depth: 1` when nothing was cached
  (`:1452-1456`). 404 → `of(null)` ⇒ `insightsNotFound`; other errors are rethrown and parsed into a banner via
  `parseOrgHierarchyInsightsError` (`action-log.service.ts:1168-1176`, `.component.ts:1428-1436`), with a
  dedicated toast for the `credits` case (`:1466-1471`).
- **Currently inert**: `aiExecutiveAnalysisEnabled = false` (`.component.ts:138`) gates both the automatic GET
  (`:1382-1384`) and the section that hosts the generate button (`:751-752`, `.html:890,917`).

### 3.6 Modals

- **`modal-organization-hierarchy-critical-clients`** (`.html:1322-1329`) issues **no HTTP**. It renders
  `root.critical_clients` passed in as `@Input summary` and exports client-side
  (`modal-organization-hierarchy-critical-clients.component.ts:31-56,112-141`). Clicking a row emits
  `clientDrillDown`, which the page converts into the KPI-detail modal in critical-client mode
  (`.component.ts:449-452`).
- **`modal-organization-hierarchy-kpi-detail`** (`.html:1331-1346`) is the only modal that fetches: `kpi-detail`
  (§3.2) or `deliveries` (§3.3), plus it can enqueue the clients-served export job (§3.4)
  (`modal-...-kpi-detail.component.ts:621-706,903-912`). All spreadsheet exports of the currently displayed rows
  are client-side (`:791-830,880-899`).

---

## 4. Page 2 — Admin Pipeline Integration Changes, request by request

Component: `src/app/pages/admin/pipeline-integration-changes/pipeline-integration-changes.component.ts`.
It injects `Game4uApiService` directly — there is no `ActionLogService` wrapper and therefore **no 15-minute
memo cache and no in-flight dedupe** for this endpoint (`:85-90`; `game4u-api.service.ts:1465-1500` has no
`shareGame4uDedupe`).

### `GET /game/reports/pipeline-integration/changes`

- **Query params** (`game4u-api.service.ts:1484-1494`):
  - `start`, `end` — required ISO 8601; either missing → local `throwError` before the request
    (`:1474-1483`). Built from the selected month as `startOf('month')` / `endOf('month')` ISO strings
    (`pipeline-integration-changes.component.ts:225-232`), and rendered as the interval label (`:123-126`).
  - `phase` — sent only when non-empty; options `reconcile | ingest | transform | sync` plus "Todas as fases"
    (empty ⇒ param omitted) (`component.ts:52-58,134-137`; type `model/game4u-api.model.ts:1631-1636`).
  - `limit` — floored, only when finite and `> 0` (`game4u-api.service.ts:1489-1491`). UI default `100`, user
    input clamped to `1..1000` (`component.ts:61,139-143`); the export loop uses `500`
    (`:265`).
  - `offset` — floored, only when finite and `>= 0` (`game4u-api.service.ts:1492-1494`). Not sent by the
    interactive load (`component.ts:236-244`); the export loop advances it by the number of items received
    (`:267,286`).
- **Response → UI**: normalized by `normalizePipelineIntegrationChangesResponse`
  (`game4u-api.service.ts:1500`; implementation `model/game4u-api.model.ts:1763-1806`), which accepts
  `items | data | results | changes` as the row array and coerces `limit`, `offset`, `total | count |
  summary.total_changes`, `has_more`, `summary`, `params`. Page shape
  `{ items, total?, limit, offset?, start?, end?, phase?, has_more?, summary?, params? }`
  (`model/game4u-api.model.ts:1703-1714`).
  - `summary` → the five KPI cards `total_changes`, `success_count`, `failed_count`, `distinct_emails`,
    `distinct_runs` (`model/game4u-api.model.ts:1693-1700`; `component.html:76,80,84,88,92`) and the
    `by_action_kind` breakdown sorted desc (`component.ts:109-117`).
  - `items` (`PipelineIntegrationChangeRow`, `model/game4u-api.model.ts:1650-1691`) → the table; per-row display
    goes through `pipeline-integration-changes.mapper.ts` (pure functions, **no HTTP**):
    `pipelineChangeAppliedAt` (`:32`), `pipelineChangePhase` (`:37`), `pipelineChangeRunInfo` (`:43`),
    `pipelineChangeBeforeJson`/`AfterJson` (`:58,62`), `buildPipelineChangeDiffEntries` (`:83`),
    `pipelineChangeChangedEntries` (`:112`), `pipelineChangeHasSnapshotDiff` (`:118`),
    `pipelineChangeActionLabel` (`:122`), `pipelineChangeEmail` (`:131`), `pipelineChangeRule` (`:136`),
    `pipelineChangeSuccess` (`:141`), `formatPipelineSnapshotJson` (`:148`), `pipelineChangeRunIdShort` (`:159`).
    Row expansion (`before_json` vs `after_json` diff) is local state only (`component.ts:181-195`).
  - `has_more` + `items.length` terminate the export pagination loop (`component.ts:282-288`).
- **Caching / dedupe**: none. Every month/phase/limit change or `reload()` re-hits the network
  (`component.ts:128-147,234-261`).
- **Error handling**: no 404-to-null mapping here. Failures set `page = null`, `hasLoadError = true` and a
  message (`Error.message` or the fallback "Não foi possível carregar o log de mudanças do pipeline.")
  rendered with a "Tentar novamente" button (`component.ts:250-256`, `.html:112`). Export failures surface as a
  toast (`component.ts:170-174`). `isEmpty` covers the loaded-but-no-rows case (`:119-121`).
- **Export**: `exportToExcel()` pages the same endpoint, flattens rows via
  `flattenPipelineIntegrationChangesForExport` (`pipeline-integration-changes.mapper.ts:202`), names the file
  with `buildPipelineIntegrationChangesExportFilename` (`:230`) and writes the XLSX client-side
  (`component.ts:149-176`).

---

## 5. Shared shell components (both pages)

`c4u-dashboard-navigation` and `c4u-seletor-mes` are declared in both page modules
(`organization-hierarchy-report.module.ts:11-12,42-43`, `pipeline-integration-changes.module.ts:7-8,27-28`).

- `c4u-dashboard-navigation` reads roles from `UserProfileService` in memory — no HTTP in its init path
  (`src/app/components/c4u-dashboard-navigation/c4u-dashboard-navigation.component.ts:87-118`).
- `c4u-seletor-mes` does perform work on init: `SeasonDatesService.getSeasonDates()`
  (`c4u-seletor-mes.component.ts:77`), which delegates to `CampaignService`
  (`src/app/services/season-dates.service.ts:14,21-29`), and — only in Feb 2026 or later —
  `ActionLogService.getPlayerActionLogForMonth()` (`c4u-seletor-mes.component.ts:155-158`), a paginated
  `action_log` read (`action-log.service.ts:1778-1800,1808-1824`). These are shell concerns, not part of either
  page's own data contract; both pages pass `[showTodaTemporadaButton]="false"` and only consume
  `(onSelectedMonth)` (`organization-hierarchy-report.component.html:6-9`,
  `pipeline-integration-changes.component.html:6-9`).
