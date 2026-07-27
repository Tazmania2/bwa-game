# HTTP Endpoint Map — Rewards / Thermometer / Ranking / Home / Season

Evidence-based trace of every HTTP request issued by the five surfaces requested. Every claim carries a
`file:line` citation. `*.spec.ts` ignored. **No endpoint in this document was inferred** — each one is a
string literal found in the source.

---

## 0. Base URLs, auth, and route resolution

### 0.1 Base URL

There is exactly **one** backend origin in play for these pages: `environment.backend_url_base`.

| Symbol | Value | Citation |
|---|---|---|
| `environment.backend_url_base` | `readBackendUrlBaseFromProcessEnv()` → `G4U_API_BASE` → `g4u_api_base` → `BACKEND_URL_BASE` → `backend_url_base`, trailing slashes stripped; `''` if unset | `src/environments/environment.ts:29`, `src/environments/backend-url.ts:31-50` |
| `joinApiPath(base, path)` | `base.replace(/\/+$/,'') + path` | `src/environments/backend-url.ts:53-57` |
| `environment.client_id` | `CLIENT_ID` / `client_id` env var | `src/environments/environment.ts:26` |

**No Funifier host and no Supabase PostgREST call is reachable from these five surfaces.**

- Funifier is referenced only in a commented-out method: `// listItemsFunifier() { return this.fetchFunifier('/virtualgoods/item'); }` — `src/app/services/recompensas.service.ts:164-166`.
- Supabase fallback in `Game4uApiService` is gated on `!isConfigured() && environment.useGame4uSupabaseFallback === true` — `src/app/services/game4u-api.service.ts:180-186`. `environment.supabaseUrl` is hard-coded `''` (`src/environments/environment.ts:59`) and `useGame4uSupabaseFallback` defaults to `false` (`src/environments/environment.ts:117-121`), so this branch is dead in practice.
- The only non-`backend_url_base` URLs on these pages are **not XHR**: `https://ui-avatars.com/api/?name=…` is written into an `<img src>` (`src/app/services/ranking.service.ts:597-600`) and the Season FAQ modal only stores PDF links (`src/app/modals/modal-season-faq/modal-season-faq.component.ts:30-31`).

### 0.2 Two URL-construction styles (a real inconsistency)

| Style | Behaviour when `backend_url_base` is `''` | Used by |
|---|---|---|
| Guarded (`if (!base) return default`) | Skips the request, returns default | `CampaignService` (`campaign.service.ts:62-64`), `SystemParamsService` (`system-params.service.ts:162-169`), `Game4uApiService.isConfigured()` (`game4u-api.service.ts:171-173`) |
| Unguarded string concat | Emits a **relative** URL (e.g. `/reward-store/catalog`) against the Angular dev/host origin | `RecompensasService` (`recompensas.service.ts:133,138,143,149,154`), `ApiProvider` (`api.provider.ts:21`), `AcessoService` (`acesso.service.ts:15`) |

`CampaignService` additionally prefixes `https://` when the base has no protocol (`campaign.service.ts:70`); `RecompensasService` and `ApiProvider` do not.

### 0.3 Headers applied by interceptors (applies to every row below)

`src/app/providers/auth.interceptor.ts`

- Whitelist that does **not** require a session: `/auth/login`, `/auth/refresh`, `/auth/change-password*`, `/client/system-params`, `/campaign/current`, `/campaign`, `integrador-n8n.grupo4u.com.br` — `auth.interceptor.ts:22-33`. Bearer is still attached if a token exists and the path is not a public auth path (`auth.interceptor.ts:130-134`).
- All other requests: `client_id: environment.client_id` + `Authorization: Bearer <token>` — `auth.interceptor.ts:158-162`, `auth.interceptor.ts:181-186`.
- No token → `router.navigate(['/login'])` and the request never leaves — `auth.interceptor.ts:164-176`.
- Token within 5 min of `exp` → serialized `POST {base}/auth/refresh` `{refresh_token}` first, then the original request is replayed with the new bearer; failure ⇒ `sessao.logout()` — `auth.interceptor.ts:210-238`.

`src/app/providers/game-reports.interceptor.ts` — only matches `GET /game/reports/**` (`game-reports.interceptor.ts:49-51`). **None of the five surfaces hit `/game/reports/*`**, so this interceptor is inert here.

`ApiProvider` (used by Ranking and by the Season → pontos-avulsos modal) force-logs-out on 401/403 — `api.provider.ts:34-37`. Note it also runs `encodeURI()` over the whole URL including the query string (`api.provider.ts:21`).

### 0.4 Route resolution

| Surface | Chain | Final path |
|---|---|---|
| Rewards | `dashboard` → `MainComponent` (`app-routing.module.ts:24-32`) → `''` → `PagesModule` (`layout/main/main.routing.ts:4-11`) → `rewards` → `RewardsModule` (`pages/pages.routing.ts:41-44`) → `{path:'rewards'}` (`recompensas/rewards.module.ts:20-22`) | `/dashboard/rewards/rewards` ✅ |
| Thermometer | … → `thermometer` (`pages.routing.ts:45-48`) → `{path:'thermometer'}` (`thermometer/thermometer.module.ts:14-16`) | `/dashboard/thermometer/thermometer` ✅ |
| Ranking | … → `ranking` (`pages.routing.ts:49-52`) → `{path:''}` (`ranking/ranking.module.ts:13-15`) | `/dashboard/ranking` ✅ |
| Home | **No route entry anywhere** (see §4) | unreachable |

---

## 1. REWARDS — `/dashboard/rewards/rewards`

Component: `src/app/pages/recompensas/rewards.component.ts`.
Service: `src/app/services/recompensas.service.ts` (base = raw `environment.backend_url_base`, `recompensas.service.ts:133`).

### 1.1 Request inventory

| # | Method + path | Query / body | Service method | Component trigger |
|---|---|---|---|---|
| R1 | `GET {base}/reward-store/purchase/list` | none | `RecompensasService.listAchievements()` — `recompensas.service.ts:153-156` | `ngOnInit` → `listAchievements()` — `rewards.component.ts:78`, `rewards.component.ts:99-103` |
| R2 | `GET {base}/campaign` | none (headers `Content-Type`, `client_id`) | `CampaignService.fetchCurrentCampaign()` — `campaign.service.ts:75-78` | `ngOnInit` → `seasonDatesService.ensureCampaignDatesLoaded()` — `rewards.component.ts:81` |
| R3 | `GET {base}/auth/user` | none | `AuthProvider.userInfo()` — `auth.provider.ts:32-35` | `ngOnInit` → `sessao.init(true)` — `rewards.component.ts:85`; `SessaoProvider.init` — `sessao.provider.ts:70-77` |
| R4 | `GET {base}/reward-store/catalog` | none | `RecompensasService.listCatalogs()` — `recompensas.service.ts:137-140` | `ngOnInit` → `loadRewardsData()` — `rewards.component.ts:96`, `rewards.component.ts:211` |
| R5 | `GET {base}/reward-store/item` | none | `RecompensasService.listItems()` — `recompensas.service.ts:142-145` | nested inside R4's `next` — `rewards.component.ts:221` |
| R6 | `GET {base}/reward-store/purchase/list` (**2nd call, same URL as R1**) | none | `RecompensasService.listAchievements()` | nested inside R5's `next` — `rewards.component.ts:243` |
| R7 | `POST {base}/reward-store/purchase/create` | body `{ player: string, item: string }` | `RecompensasService.createPurchase()` — `recompensas.service.ts:148-151` | **Redeem confirm click** → `RewardRedeemModalComponent.confirmRedeem()` — `reward-redeem-modal.component.ts:45`, `reward-redeem-modal.component.ts:67-75` |

`GET {base}/reward-store/purchase/list-all` exists at `recompensas.service.ts:158-161` but **has zero call sites** — verified by repo-wide grep for `listAllAchievements`.

### 1.2 What each response returns and which UI element consumes it

**R4 `/reward-store/catalog`** → `CatalogResponse | Catalog[]`; unwrapped as `Array.isArray(x) ? x : x?.data || []` (`rewards.component.ts:213`). Only `_id` and `catalog` are read, into a `Map<catalogId, catalogName>` (`rewards.component.ts:215-218`). Interface: `recompensas.service.ts:64-71`.

**R5 `/reward-store/item`** → `ItemResponse | CatalogItem[]`, unwrapped the same way (`rewards.component.ts:223`). Fields actually read in `processItems` (`rewards.component.ts:264-303`):

| Source field | Mapped to | UI element |
|---|---|---|
| `_id` (fallback `catalogId + '-' + name`) | `Reward.id` | reward-card key; also the `item` sent in R7 |
| `i18n['pt-BR'].name` ‖ `name` | `Reward.title` | card title |
| `amount` | `Reward.amount` | stock; `isLimited = amount > 0 && amount <= 10` (`rewards.component.ts:270`) |
| `owned` | `Reward.owned` | owned badge |
| `i18n['pt-BR'].description` ‖ `extra.description` | `Reward.description` | card body + search field (`rewards-store.component.ts:194-195`) |
| `image.medium.url` ‖ `image.original.url` ‖ `image.small.url` | `Reward.imageUrl` | card image; falls back to sentinel `'placeholder-gift-icon'` (`rewards.component.ts:17`, `rewards.component.ts:284-287`) |
| `requires[0].total` | `Reward.cost` | price label + affordability check |
| `requires[0].item` | currency label | currency chip |
| `techniques` contains `premium` \| `featured` | `isHighlighted` | highlight styling (`rewards.component.ts:271-273`) |
| `catalogId` → catalogMap | `Reward.category` | category filter chips; unmapped ids collapse to `'Outros'` (`rewards.component.ts:268`) |

The distinct category names become `categories[]` (`rewards.component.ts:225-238`), bound to `<app-rewards-store [categories]>` (`rewards.component.html:61`).

**R1 / R6 `/reward-store/purchase/list`** → `Achievement[]` (`recompensas.service.ts:120-127`: `_id, player, total, type, item, time`).
- **R1's result is discarded** — the subscribe body is only `console.log('Achievements:', response)` (`rewards.component.ts:100-102`). It is a pure wasted round-trip.
- **R6's result** feeds `mapAchievementsToCards()` (`rewards.component.ts:244-247`, `rewards.component.ts:296-323`): `_id.slice(-6)` → redeem id, `time` → `redeemedAt`, `total` → `quantity`, and `item` is joined against `rewards[].id` to recover title/image/cost/currency/category. Result is `playerRedeemLogs[]`, bound to `<app-rewards-store [playerRedeemLogs]>` (`rewards.component.html:62`) and rendered in the "my-rewards" tab (`rewards-store.component.ts:218-220`).

> ⚠ Ordering bug worth flagging: `RewardsStoreComponent.mapAchievementsToCards` uses `_id.slice(0, 6)` (`rewards-store.component.ts:156`) while the parent uses `_id.slice(-6)` (`rewards.component.ts:300`). The child copy is dead code (`loadPlayerRedeemLogs()` is an empty stub, `rewards-store.component.ts:146-152`).

**R7 `/reward-store/purchase/create`** → `PurchaseResponse` (`recompensas.service.ts:87-110`). Only `response.status === 'OK'` is inspected (`reward-redeem-modal.component.ts:78`); `achievements[]`, `milliseconds{}`, `restrictions[]` are stored verbatim into `localStorage.redeem_history` but never rendered (`reward-redeem-modal.component.ts:85-96`).

**R2 `/campaign`** → `Campaign[] | {data: Campaign[]}`, normalized at `campaign.service.ts:90-97`; active campaign selected by `now ∈ [starts_at, finishes_at]`, else next by `starts_at`, else most-recently-ended, else `list[0]` (`campaign.service.ts:103-131`). Consumed as the season date window in the `<page-season>` sidebar (`season.component.html:93-96`) and as the `start`/`end` for S1–S2 below.

**R3 `/auth/user`** → user profile; `email` → `idConsulta`, `full_name ‖ name` → `nomeConsulta` (`rewards.component.ts:86-91`), which are the `@Input`s of `<page-season>` (`rewards.component.html:8-10`).

### 1.3 Caching / dedupe / fallback

| Request | Behaviour | Citation |
|---|---|---|
| R1, R4, R5, R6, R7 | **No cache, no dedupe, no `shareReplay`.** Plain `HttpClient` returns per subscription. | `recompensas.service.ts:137-161` |
| R1 vs R6 | Same URL fired twice per page load, ~0 ms apart at `ngOnInit`, no dedupe | `rewards.component.ts:78` vs `rewards.component.ts:243` |
| R4 error | `notificationService.showSuccess('Erro ao carregar categorias…', false)` → **native `alert()`** (`notification.service.ts:11`); `isLoadingRewards = false`; R5/R6 never fire; `rewards` and `categories` stay `[]`. Despite the message, **there is no mock/demo fallback** — the store renders empty. | `rewards.component.ts:255-259` |
| R5 error | Same alert path, `isLoadingRewards = false`, R6 never fires | `rewards.component.ts:249-253` |
| R6 error | **No `error` handler at all** — a failure here leaves `isLoadingRewards = true` forever (permanent shimmer) | `rewards.component.ts:243-247` |
| R7 error | alert "Erro ao conectar com o servidor"; re-entrancy guarded by `isProcessing` (`reward-redeem-modal.component.ts:46-49`) | `reward-redeem-modal.component.ts:110-113` |
| R2 `/campaign` | In-flight promise dedupe + permanent in-memory cache (`currentCampaign`); `SeasonDatesService.seasonBoundsCache` on top | `campaign.service.ts:38-59`, `season-dates.service.ts:69-83` |
| R2 failure | `console.warn` + synthetic `getDefaultCampaign()` = Jan 1 → Dec 31 of current year, `isDefault: true` | `campaign.service.ts:84-87`, `campaign.service.ts:134-148` |
| R3 `/auth/user` | 15 s timeout; concurrent `init()` share one promise; timeout/401/403/0 ⇒ token cleared, `false` returned | `sessao.provider.ts:52-58`, `sessao.provider.ts:71-76`, `sessao.provider.ts:96-110` |

### 1.4 Child components — HTTP audit

| Component | HTTP? | Notes |
|---|---|---|
| `rewards-metrics` | **None** | Pure `@Input` (`coins`, `points`, `price`) — `rewards-metrics.component.ts:12-20`. **Not rendered**: `rewards.component.html` has no `<app-rewards-metrics>`; the three metric cards are inlined at `rewards.component.html:29-58`. Declared in the module (`rewards.module.ts:26`) but unused. |
| `distribution-pot` | **None** | `@Input amount`, `@Input lastUpdate` only — `distribution-pot.component.ts:9-11`. **Also not rendered** anywhere in `rewards.component.html`. The `distributionPotAmount = 999999` field (`rewards.component.ts:47`) is dead. |
| `rewards-store` | **None** | Filter/search/tab logic is all client-side over the `@Input` arrays (`rewards-store.component.ts:188-201`). Contains a hard-coded `MOCK_PLAYER_REDEEM_LOGS` const (`rewards-store.component.ts:38-79`) that is **never referenced**. Category chip clicks and the search box do **not** trigger any request (`rewards-store.component.ts:179-186`). |
| `reward-redeem-modal` | **R7 only** | Step 1→2 (`nextStep`) validates against `localStorage.coins` with no network call (`reward-redeem-modal.component.ts:31-40`). |
| `convert-points-modal` | **None** | Entirely `localStorage`-backed: reads `points`/`coins` (`convert-points-modal.component.ts:26-31`) and writes them back on swap (`convert-points-modal.component.ts:64-66`). The "Cotação Atual" / points / coins tiles are **not server-derived** — they are seeded from hard-coded defaults `coins = 901.2`, `points = 9012`, `price = 10` (`rewards.component.ts:44-46`, `rewards.component.ts:105-130`). |

### 1.5 `REWARD_STORE_API.md` vs. code

| Doc claim | Code reality | Verdict |
|---|---|---|
| `GET /reward-store/catalog` | `recompensas.service.ts:138` | ✅ path matches |
| `GET /reward-store/item` | `recompensas.service.ts:143` | ✅ path matches |
| `POST /reward-store/purchase/create` | `recompensas.service.ts:149` | ✅ path matches |
| Catalog item shape `{ id, name }` (`REWARD_STORE_API.md:10-16`) | Reads `_id` and `catalog` (`rewards.component.ts:217`) | ❌ both field names wrong |
| Item shape `{ id, name, description, cost, imageUrl, catalogId, amount }` (`REWARD_STORE_API.md:26-36`) | Reads `_id`, `i18n['pt-BR'].name`, `requires[0].total`, `image.medium.url`, `techniques[]`, `extra.description` (`rewards.component.ts:264-303`) | ❌ `cost` and `imageUrl` do not exist in the real payload |
| Purchase payload includes `extra: { upgrade: "house" }` (`REWARD_STORE_API.md:45-51`) | Payload is only `{ player, item }` — `extra` is optional in the interface (`recompensas.service.ts:76-82`) and **never populated** (`reward-redeem-modal.component.ts:67-70`) | ❌ documented-but-unsent |
| Purchase response `{ success, message }` (`REWARD_STORE_API.md:54-59`) | Code branches on `response.status === 'OK'` (`reward-redeem-modal.component.ts:78`); interface declares `status`, `achievements[]`, `restrictions[]`, `milliseconds{}` (`recompensas.service.ts:87-110`) | ❌ contract mismatch |
| "Fallback para Mock — se a API falhar, usa dados mock" (`REWARD_STORE_API.md:64`, `REWARD_STORE_API.md:70-72`) | No mock path exists; error handlers only `alert()` and clear the loading flag (`rewards.component.ts:249-259`) | ❌ not implemented |
| Doc omits `GET /reward-store/purchase/list` | Actually called twice per load (R1, R6) | ❌ undocumented |
| Doc omits `GET /reward-store/purchase/list-all` | Defined, never called (`recompensas.service.ts:158-161`) | ❌ undocumented + dead |

---

## 2. THERMOMETER — `/dashboard/thermometer/thermometer`

Component: `src/app/pages/thermometer/thermometer.component.ts`.

**The thermometer component itself issues exactly one request**, and every number it renders is hard-coded.

| # | Method + path | Query / body | Service method | Trigger |
|---|---|---|---|---|
| T1 | `GET {base}/campaign` | none | `CampaignService.fetchCurrentCampaign()` — `campaign.service.ts:75-78` | `ngOnInit` → `ensureCampaignDatesLoaded()` — `thermometer.component.ts:91-93` |

- Same permanent cache + `getDefaultCampaign()` fallback as R2 (§1.3). Because the shell prefetches campaign (`campaign.service.ts:30-33`) and `Game4uApiService`'s constructor also warms it (`game4u-api.service.ts:167`), T1 is normally already resolved from cache and costs **0 network calls**.
- `ngOnInit` then reads `sessao.usuario?.email / full_name / team_id` from the **already-populated session** — it does **not** call `sessao.init()`, so there is **no** `/auth/user` request from this page (`thermometer.component.ts:97-101`).
- `AcessoService` **is injected but never invoked** (`thermometer.component.ts:73`; grep count for `acessoService` in that file = 1, the constructor param). So `GET {base}/team/managed-teams` and `GET {base}/team/{id}/users` (`acesso.service.ts:52-56`, `acesso.service.ts:88-92`) are **unreachable from this page**.
- All gauge values are literals: `currentProgress: 67`, `goalAmount: 1000000`, `currentAmount: 670000`, `teamSize: 25` (`thermometer.component.ts:43-49`, assigned `thermometer.component.ts:76-81`), and `stageMarkers` is a static 4-element array (`thermometer.component.ts:81-88`). `calculateRewards()` is pure arithmetic (`thermometer.component.ts:121-132`). **Nothing on the thermometer itself is server-driven.**
- `src/app/pages/thermometer/thermometer-example.tsx` is a stray React file, not part of the Angular build.

Everything else on this route comes from the embedded `<page-season *ngIf="seasonShellReady">` (`thermometer.component.html:3-13`) → see §5 (S1–S5).

---

## 3. RANKING — `/dashboard/ranking`

Component: `src/app/pages/ranking/ranking.component.ts`. Service: `src/app/services/ranking.service.ts`, which goes through `ApiProvider` (`ranking.service.ts:181`), i.e. `environment.backend_url_base + path`, `encodeURI`'d (`api.provider.ts:21`).

| # | Method + path | Query / body | Service method | Trigger |
|---|---|---|---|---|
| K1 | `GET {base}/leaderboards` | none | `RankingService.fetchRankingsList()` — `ranking.service.ts:283` | `ngOnInit` → `loadInitialData()` → `getRankingsList()` — `ranking.component.ts:26-35` |
| K2 | `POST {base}/leaderboards/{rankingId}?period={start};{end}` | **body `{}`** (empty object); `period` is in the **query string**, built as `` `${startPeriod};${endPeriod}` `` where each side is `-Nd-` / `-Nd+` | `RankingService.getRankingDetails()` — `ranking.service.ts:222-234` | **"Gerar Ranking" button click** → `generateRanking()` — `ranking.component.html:73-77`, `ranking.component.ts:64-72` |
| K3 | `GET {base}/leaderboards` (**again**) | none | `RankingService.getRankingInfo()` — `ranking.service.ts:267` | fired immediately after K2 inside the same `getRankingDetails()` call — `ranking.service.ts:237` |

### 3.1 `period` parameter construction

`dateToRelativeString(dateStr, isStart)` converts an absolute `YYYY-MM-DD` into a **days-ago offset**: `diffDays = round((today - date)/86400000)`, then `` `-${diffDays}d${isStart ? '-' : '+'}` `` (`ranking.service.ts:12-24`). The two halves are joined with `;` and appended raw (`ranking.service.ts:225-230`). Because `ApiProvider` runs `encodeURI` (`api.provider.ts:21`), `;` and `+` are **left unescaped** (`encodeURI` does not escape either), so a `+` reaching the server as a query value is decodable as a space by strict parsers — a latent defect.

Note that `dateToRelativeString` produces a **negative** prefix plus a positive `diffDays` for past dates, i.e. a future `endDate` (typical, since the default range is the current calendar month) yields `diffDays < 0` and therefore a literal `--Nd+` double-dash.

### 3.2 Selector / filter behaviour

The ranking-type `<select>` (`ranking.component.html:30-31`) and both date inputs (`ranking.component.html:51`, `ranking.component.html:63`) call `onRankingTypeChange` / `onDateRangeChange`, which **only reset local state** — `hasGeneratedRanking = false` + `clearRankingData()` (`ranking.component.ts:52-62`). **No request is issued on selector or filter change.** K2/K3 fire only on the explicit button click.

### 3.3 Response consumption

**K1 `/leaderboards`** → `ApiRankingType[]` (`ranking.service.ts:56-64`: `_id, title, principalType, operation, period{type,timeAmount,timeScale}, techniques, extra`). Mapped to `{id: _id, name: title, description, category, isActive: true}` (`ranking.service.ts:296-303`), where `description`/`category` are **derived client-side from a hard-coded `principalType` lookup table**, not from the API (`ranking.service.ts:309-336`). Feeds the ranking-type dropdown (`ranking.component.html:30`) and the header block `selectedRankingType.name/.description` (`ranking.component.html:114-115`).

`periods` in the same response object is **not from the API at all** — `getDefaultPeriods()` is a locally computed constant (`ranking.service.ts:285`, `ranking.service.ts:700-744`); `rankingPeriods` is therefore never bound to a live value.

**K2 `/leaderboards/{id}`** → a bare `ApiRankingParticipant[]` (`ranking.service.ts:170`, `ranking.service.ts:143-156`: `_id, total, position, previous_total, previous_position, move, player, name, teamName, extra{cache}, boardId`). `formatApiParticipants` maps it (`ranking.service.ts:562-583`):

| Source | Mapped to | UI |
|---|---|---|
| `name` | `name` | participant row name (`ranking.component.html:131`) |
| `teamName` | `teamName` | team label |
| `position` | `position` | rank + `position-gold/silver/bronze` class and 🥇🥈🥉 icon (`ranking.component.ts:104-117`) |
| `total` | `points` | points cell; also `metadata.maxPoints`/`averagePoints` (`ranking.service.ts:521-524`) |
| `move` | `movement` | Subiu/Desceu/Manteve/Novo label (`ranking.component.ts:127-138`) |
| `previous_position`, `previous_total` | deltas | movement column |
| `player` | → `https://ui-avatars.com/api/?name=…` `<img src>` (**not an XHR**) | avatar (`ranking.service.ts:597-600`) |
| — | `level` = `floor(total/100)+1` (`ranking.service.ts:606-608`) | **client-computed, not from API** |
| — | `achievements` from position/move heuristics (`ranking.service.ts:613-628`) | **client-computed** |
| — | `progress` = mean of position- and points-derived scores, hard-coded 3000 max (`ranking.service.ts:633-642`) | **client-computed** |

`totalParticipants` = `participants.length`, `lastUpdated` = `new Date()` — both **synthesised locally**, then rendered as if server data (`ranking.service.ts:518-520`, `ranking.component.html:119-123`).

**K3 `/leaderboards`** → used only to find `allRankings.find(r => r._id === rankingId)` so `title` and `period{}` can decorate the result (`ranking.service.ts:260-274`, consumed `ranking.service.ts:528-546`). `calculatePeriodStartDate` / `calculatePeriodEndDate` then compute dates **locally** from `timeScale`/`timeAmount` (`ranking.service.ts:377-441`) — these are not returned by any endpoint.

### 3.4 Caching / dedupe / fallback

| Concern | Behaviour | Citation |
|---|---|---|
| K1 dedupe | `loadRankingsPromise` in-flight guard + permanent `rankingsCache`/`periodsCache` (no TTL) | `ranking.service.ts:186-210` |
| K3 redundancy | `getRankingInfo` calls `getRankingsList()` (cache hit) **and then re-fetches `/leaderboards` unconditionally** — the cache is bypassed for the actual HTTP call | `ranking.service.ts:262-268` |
| K1 failure | returns `getDefaultRankings()` — 4 fabricated rankings `productivity/sales/quality/engagement` (`ranking.service.ts:290-293`, `ranking.service.ts:649-680`). The cache then stores the fakes, so **no retry ever happens** for the session. | `ranking.service.ts:205-206` |
| K2 failure | `getRankingDetails` catch → `{ranking: getDefaultRankingData(...), success: false}` (`ranking.service.ts:245-253`); component sees `success === false` and substitutes **its own** 10 fake participants with `Math.random()` points (`ranking.component.ts:78-90`, `ranking.component.ts:165-190`). Failures are therefore **invisible to the user** — the grid renders random data with `hasGeneratedRanking = true`. |
| K3 failure | swallowed → `null`; K2's data still renders via the `!rankingInfo` branch with `name: 'Ranking Padrão'` | `ranking.service.ts:275-278`, `ranking.service.ts:496-526` |
| 401/403 on any of K1–K3 | `ApiProvider` triggers `sessao.logout()` → redirect to `/login` | `api.provider.ts:34-37` |
| Invalidation | `clearCache()` / `reloadRankings()` exist (`ranking.service.ts:756-768`) but **no call site in the ranking page** |

---

## 4. HOME — `src/app/pages/home/*`

**Verdict: dead code. Zero HTTP requests. Not routed, not rendered anywhere.**

Evidence:

1. **No route** references `HomeComponent`. `pages.routing.ts` has entries for `''` (gamification dashboard), `team-management`, `organization-hierarchy`, `admin/pipeline-integration-changes`, `supervisor`, `supervisor-tecnico`, `rewards`, `thermometer`, `ranking` — and nothing for home (`pages/pages.routing.ts:4-53`). `app-routing.module.ts` and `layout/main/main.routing.ts` likewise have no home entry.
2. **No template use.** Repo-wide grep for the selector `page-home` (`home.component.ts:5`) returns **only the declaration itself** — no `.html` in `src/` instantiates it.
3. **The template is a 0-byte file.** `ls -la src/app/pages/home/` reports `home.component.html` at `0` bytes, so even if it were routed it would render nothing.
4. **The component makes no calls.** It injects `SessaoProvider` and exposes a single getter `get sessaoReady() { return this.sessao.usuario; }` — a read of already-cached session state, no HTTP (`home.component.ts:9-16`).
5. **Only reachability is module-level side effect.** `HomeModule` is imported by `PagesModule` (`pages/pages.module.ts:5`, `pages/pages.module.ts:15`), which forces `HomeModule` → `DashboardModule` (`home/home.module.ts:5`, `home/home.module.ts:19`) into the eager `pages` chunk. That is a **bundle-size cost with no functional effect**; NgModule imports do not execute component code.

**Answer to "what does it call": nothing.** Any request observed while home-adjacent code is loaded belongs to the shell (`/client/system-params`, `/campaign`, `/auth/user`), not to `HomeComponent`.

---

## 5. SEASON components — `src/app/pages/dashboard/season/*`

`SeasonComponent` (`selector: 'page-season'`, `season.component.ts:20-24`) is the shared left sidebar rendered by **both** Rewards (`rewards.component.html:4-13`) and Thermometer (`thermometer.component.html:3-13`). Its requests are additive to §1 and §2.

### 5.1 Request inventory

| # | Method + path | Query params | Service method | Trigger |
|---|---|---|---|---|
| S1 | `GET {base}/game/stats` | `start`, `end` (ISO), `user` (email). `team_id` is **deliberately omitted whenever `user` is present** | `Game4uApiService.getGameStats()` — `game4u-api.service.ts:1617-1638`, URL at `:1633` | `ngOnInit` → `init()` → `getDadosTemporada()` → `TemporadaService.getDadosTemporadaDashboard()` — `season.component.ts:123`, `season.component.ts:147-152`, `temporada.service.ts:191-195` |
| S2 | `GET {base}/game/actions` | `start`, `end`, `user`; `status` only if supplied (**not supplied here**) | `Game4uApiService.getGameActions()` — `game4u-api.service.ts:1640-1665`, URL at `:1661` | same `forkJoin` as S1 — `temporada.service.ts:197-202` |
| S1t | `GET {base}/game/team-stats` | `start`, `end`, `team` | `getGameTeamStats()` — `game4u-api.service.ts:1694-1712`, URL at `:1708` | same trigger when `tipoConsulta === TIPO_CONSULTA_TIME` — `temporada.service.ts:169-176` |
| S2t | `GET {base}/game/team-actions` | `start`, `end`, `team`, optional `user`/`status` | `getGameTeamActions()` — `game4u-api.service.ts:1715-1741`, URL at `:1738` | ibid. — `temporada.service.ts:177-182` |
| S3 | `GET {base}/campaign` | none | `CampaignService` — `campaign.service.ts:75` | `ngOnInit` → `loadSeasonDates()` — `season.component.ts:122`, `season.component.ts:516-518`; **and again** on every `ngOnChanges` via `reloadSeasonDashboardAfterInputsChange()` — `season.component.ts:141-145` |
| S4 | `GET {base}/client/system-params` | none (headers `Content-Type`, `client_id`) | `SystemParamsService.fetchFromApi()` — `system-params.service.ts:176-178` | `ngOnInit` fans out to **five** consumers: `loadAliases()` (`season.component.ts:125`), `loadClientInfo()` (`:126`), `loadClientId()` (`:127`), `loadFreeChallengesAllowedTeams()` (`:128`), `loadFreeChallengesRoles()` (`:129`) |

On Rewards, `FeaturesService.initializeFeatures()` also reads the same `SystemParamsService` (`features.service.ts:49-53`) for `isVirtualStoreEnabled()` / `isLeaderboardsEnabled()` / `isCashDistributionEnabled()` (`rewards.component.ts:170-180`) which gate the right-hand menu (`rewards.component.html:70`).

### 5.2 Season date window

`start`/`end` for S1/S2 are the **full campaign interval**, not a month: `getSeasonStatsRangeISO()` (`temporada.service.ts:45-51`) → `SeasonDatesService.getSeasonStartDateISO/EndDateISO` (`season-dates.service.ts:35-44`) → `CampaignService.getCampaignStartDate/EndDate`, which normalise to local start-of-day / end-of-day (`campaign.service.ts:150-158`, `campaign.service.ts:189-208`).

### 5.3 Response consumption

**S1 `/game/stats`** → `Game4uUserActionStatsResponse`. Fields read in `mapStatsToDashboard` (`temporada.service.ts:72-99`): `action_stats.DONE.count` ‖ `.done.count`, `action_stats.PENDING.count`, `total_points`, `total_blocked_points`, `action_stats.total_points`, `action_stats.total_blocked_points`, `delivery_stats.{PENDING,INCOMPLETE,DELIVERED}`, plus `clientes` = `floor(incomplete + delivered)` with case-tolerant key lookup (`temporada.service.ts:57-69`).

**S2 `/game/actions`** → `Game4uUserActionModel[]`. **Actions take priority over stats**: `mapToSeasonDashboard` (`temporada.service.ts:104-149`) computes `unblocked` = points of `DELIVERED|PAID`, `blocked` = points of `DONE`, `completedTasks` = finalized count, `pendingTasks` = `PENDING|DOING` count (`OPEN_ACTION_STATUSES`, `temporada.service.ts:16`), deliveries via `mapGame4uActionsToProcessMetrics`, and `clientes` = distinct participation-row keys among finalized actions.

Merged into `TemporadaDashboard`, normalised again in the component (`season.component.ts:177-189`) and rendered in the sidebar card:

| Field | UI element | Citation |
|---|---|---|
| `blocked_points + unblocked_points` | "total points" figure | `season.component.html:47` |
| `blocked_points` | blocked-points figure + `getPercentPontosBloqueados()` tooltip | `season.component.html:52`, `season.component.ts:196-202` |
| `incompleteDeliveries` | LABEL_PROCESSES_QUESTS_INCOMPLETE | `season.component.html:74` |
| `completedTasks` | LABEL_QUESTS_FINISHED | `season.component.html:79` |
| `completedDeliveries` | LABEL_PROCESSES_QUESTS_FINISHED | `season.component.html:84` |
| `clientes` | clients-served counter | `season.component.html:89` |
| whole object | re-emitted via `@Output seasonData` → `RewardsComponent.getSeasonData` (`rewards.component.ts:152-154`) / `ThermometerComponent.getSeasonData` (`thermometer.component.ts:159-161`) — **both only store it; neither renders it** |

**S3 `/campaign`** → `seasonDates.start/end`, printed as `dd/MM/yy a dd/MM/yy` behind an `enableShimmer` guard keyed on `seasonDatesReady` (`season.component.html:93-96`, `season.component.ts:535-537`).

**S4 `/client/system-params`** → one payload, five consumers:

| Consumer | Params read | UI |
|---|---|---|
| `loadAliases()` → `AliasService` | `points_alias`, `coins_alias`, `delivery_alias`, `action_alias`, `team_redirect_urls` — `alias.service.ts:81-95` | i18n `translateParams` for every label: `pointAlias`, `deliveryAlias`, `actionAlias` (`season.component.html:42`, `:46`, `:51`, `:73`, `:78`, `:83`); getters at `season.component.ts:540-557` with literal defaults |
| `loadClientInfo()` | `client_dark_logo_url` — `season.component.ts:595` | `clientLogoUrl` |
| `loadClientId()` | `client_name`, falling back to `environment.client_id` — `season.component.ts:608-610` | `clientId` |
| `loadFreeChallengesAllowedTeams()` | `free_challenges_allowed_teams` — `season.component.ts:626-627` | per-team gate for the manage-points button (`season.component.ts:672-691`) |
| `loadFreeChallengesRoles()` | `free_challenges_allowed_roles`, `restrict_free_challenges_by_role` — `season.component.ts:642-644` | role gate (`season.component.ts:698-736`); combined in `shouldShowManagePointsModal` (`season.component.ts:742-768`) |
| `FeaturesService` | `enable_virtual_store`, `enable_leaderboards`, `enable_goals_and_cash_distribution`, `enable_free_challenges`, … — `features.service.ts:57-86` | right-hand menu visibility (`rewards.component.html:70`), `isVirtualStoreEnabled()` (`season.component.ts:563-568`) |

### 5.4 Caching / dedupe / fallback

| Concern | Behaviour | Citation |
|---|---|---|
| S1/S2/S1t/S2t dedupe | Per-key `Map` + `shareReplay({bufferSize:1, refCount:false})`. Keys: `stats\|user:{u}\|{start}\|{end}`, `actions\|…\|{status}`, `team-stats\|{team}\|…`, `team-actions\|{team}\|…\|{status}\|{user}` | `game4u-api.service.ts:213-230`, `:234-246`, `:248-259` |
| Cache eviction | On error the key is `delete`d so the next subscriber retries; success is cached **for the app lifetime** (`refCount: false`) | `game4u-api.service.ts:219-227` |
| Manual invalidation | `clearStatsActionsDedupeCache()` clears all stats/actions/report maps; invoked from `SeasonDatesService.clearCache()` | `game4u-api.service.ts:269-294`, `season-dates.service.ts:271-274` |
| S2 failure | `catchError → of([])`; the card falls back to **stats-only** mapping (`mapToSeasonDashboard` early-returns `fromStats` when `actions` is empty) | `temporada.service.ts:161-165`, `temporada.service.ts:109-112` |
| Points reconciliation | If action-derived points sum to 0 while stats > 0, stats win (`useStatsPoints`); same for `clientes` | `temporada.service.ts:114-121`, `temporada.service.ts:139-142` |
| S1 failure / not configured | `!environment.backend_url_base \|\| !game4u.isConfigured()` ⇒ `console.warn` + `getEmptyTemporadaDashboard()` (all zeros); any thrown error ⇒ same | `temporada.service.ts:152-156`, `temporada.service.ts:204-207`, `temporada.service.ts:210-224` |
| Stale-response guard | `seasonDashboardRequestGeneration` monotonic counter — a late response whose generation ≠ current is dropped, so an older `idConsulta` cannot overwrite newer data | `season.component.ts:74`, `season.component.ts:155-171` |
| Double-bootstrap guard | `seasonUiBootstrapped` makes `ngOnChanges` a no-op until `ngOnInit` finishes | `season.component.ts:77`, `season.component.ts:132-139` |
| S3 dedupe | in-flight promise + permanent `currentCampaign`, plus `SeasonDatesService.seasonBoundsCache`; `getSeasonDates()` returns **defensive copies** | `campaign.service.ts:38-59`, `season-dates.service.ts:69-83` |
| S3 failure | `loadSeasonDates()` catch installs a **hard-coded** window `2025-05-01T03:00:00.000Z … 2025-06-30T03:00:00.000Z` (`season.component.ts:520-527`) — note this differs from `CampaignService.getDefaultCampaign()`'s Jan 1–Dec 31 (`campaign.service.ts:134-148`), so two different fallbacks can be observed |
| S4 dedupe | `initializationPromise` singleton + 24 h in-memory TTL + `localStorage['system_params']` mirror; the five `ngOnInit` consumers collapse to **one** request | `system-params.service.ts:13-14`, `system-params.service.ts:33-50`, `system-params.service.ts:296-311` |
| S4 failure ladder | expired in-memory cache → `localStorage` → `getDefaultSystemParams()` (full hard-coded param set, `system-params.service.ts:225-270`), which is then **persisted to `localStorage`** — so a single cold-start failure can pin defaults for 24 h | `system-params.service.ts:192-212` |
| `AliasService` | own in-flight promise + permanent cache; on failure returns literal `Pontos/Moedas/Entregas/Ações` | `alias.service.ts:40-62`, `alias.service.ts:110-121` |

### 5.5 `modal-detalhe-executor`

**Issues zero HTTP requests.** Opened from the season card via `extratoTemporadaBeta()` (`season.component.ts:205-208`), which passes `idConsulta` into `ModalDetalheExecutorComponent`.

Its only data-loading method, `getDadosExtrato()`, has its entire body **commented out** — the `temporadaService.getDetalheExtratoColaborador(...)` call is inside a `//` block (`modal-detalhe-executor.component.ts:42-56`). What remains is: if `idConsulta` is falsy, `cancel()`; otherwise **do nothing**. Consequently `data` and `cotacao` stay `undefined`, and `getValor()` always returns `0` (`modal-detalhe-executor.component.ts:31-37`). `TemporadaService` has no `getDetalheExtratoColaborador` method at all — confirmed by reading the full service (`temporada.service.ts:1-225`).

### 5.6 Downstream surface reachable from Season card buttons

The eleven `abrirModal*` handlers (`season.component.ts:214-511`) delegate to `ModalGerenciarPontosAvulsosProvider` (`providers/modal-gerenciar-pontos-avulsos.provider.ts:27-261`), which lazily opens `ModalGerenciarPontosAvulsosComponent`. That modal drives `PontosAvulsosService` (all via `ApiProvider`, so `{base}` + bearer + `client_id`). Endpoints, with citations:

| Method + path | Query / body | Service method | Reached from |
|---|---|---|---|
| `GET {base}/action` | none | `getActionTemplates()` — `pontos-avulsos.service.ts:174` | modal init / `getActionIdByTitle` — `modal-gerenciar-pontos-avulsos.component.ts:320`, `:2363` |
| `GET {base}/user-action/search` | `created_at_start`, `created_at_end`, `dismissed`, `page`, `limit`, repeated `status`, plus `team_id` **or** `user_email`; optional `executor_email`, `finished_at_start/end` | `getUserActions()` — `pontos-avulsos.service.ts:1154-1222` | `abrirModalPendentes/Finalizadas/Aprovadas/Canceladas` → `getAtividades*Modal` — `:410`, `:468`, `:526`, `:584` |
| `GET {base}/game/actions` | `status`, `start`, `end`, `user` | `getGameActions()` (collaborator branch) — `pontos-avulsos.service.ts:960-976` | collaborator context |
| `GET {base}/game/team-actions` | `status`, `start`, `end`, `team` | same method (team branch) — `:961`; also `getTeamActions()` — `:1071-1081` | team context |
| `GET {base}/game/deliveries` | `status`, `start`, `end`, `user` | `getGameDeliveries()` — `pontos-avulsos.service.ts:1026-1042` | `abrirModalProcessos*` |
| `GET {base}/game/team-deliveries` | `status`, `start`, `end`, `team` | same method — `:1027` | `abrirModalProcessos*` — `:2903`, `:2937`, `:2971`, `:2997` |
| `GET {base}/team/{timeId}/users` | none | `getUsers()` — `pontos-avulsos.service.ts:1432` | executor picker — `:354` |
| `POST {base}/game/action/process` | full `ProcessActionPayload`, with `updated_by` **stripped before send** | `processAction()` — `pontos-avulsos.service.ts:1374-1385` | assign / finalize / approve / block / reject / cancel — `:847`, `:2076`, `:4033`, `:4499` |
| `PUT {base}/game/action/status` | `{id, status, user_email, updated_at}` | `atualizarStatusAtividade()` — `pontos-avulsos.service.ts:1400-1415` | status change |
| `POST {base}/game/delivery/{id}/complete` | `payload` / `{}` | `:1618`, `:1832` | complete delivery — `:1170` |
| `POST {base}/game/delivery/{id}/restore` | `payload` / `{}` | `:1636`, `:1866` | restore — `:1234` |
| `POST {base}/game/delivery/{id}/cancel` | `{}` | `:1815` | cancel — `:1125` |
| `POST {base}/game/delivery/{id}/undeliver` | `{}` | `:1849` | undo delivery — `:1202` |
| `POST {base}/user-action/{id}/comment` | `payload` | `:2060` | add comment — `:2332` |
| `PUT {base}/user-action/{id}/attachment` | `FormData` (raw `HttpClient`, not `ApiProvider`) | `:2092-2095` | upload — `:2287` |
| `GET {base}/user-action/{id}/attachment` | none | `:2139` | list attachments — `:2247` |
| `GET {base}/user-action/download-attachment/{attachmentId}` | none → `{download_url}` | `:2178-2186` | download click — `:2498` |

Caching there: only a `cachedUserEmail` memo (`pontos-avulsos.service.ts:141-142`, cleared by `clearUserEmailCache()` at `:163-167`). The list endpoints have **no dedupe**; `getGameActions`/`getGameDeliveries` swallow errors and return `[]` (`:1026-1052`, `:967-1000`), while `getAtividadesPendentes` re-throws (`:266-269`).

---

## 6. Consolidated endpoint list

Every distinct endpoint reachable from the five surfaces. Base is `environment.backend_url_base` in **all** cases.

### Directly on Rewards / Thermometer / Ranking (+ their Season sidebar)

| Method | Path | Surface(s) |
|---|---|---|
| `GET` | `/reward-store/catalog` | Rewards |
| `GET` | `/reward-store/item` | Rewards |
| `GET` | `/reward-store/purchase/list` | Rewards (×2 per load) |
| `POST` | `/reward-store/purchase/create` | Rewards (redeem) |
| `GET` | `/leaderboards` | Ranking (K1 + K3) |
| `POST` | `/leaderboards/{id}?period={start};{end}` | Ranking (Gerar Ranking) |
| `GET` | `/game/stats` | Season sidebar (collaborator) |
| `GET` | `/game/actions` | Season sidebar (collaborator) |
| `GET` | `/game/team-stats` | Season sidebar (team) |
| `GET` | `/game/team-actions` | Season sidebar (team) |
| `GET` | `/campaign` | Rewards, Thermometer, Season |
| `GET` | `/client/system-params` | Season, Rewards feature flags |
| `GET` | `/auth/user` | Rewards (`sessao.init(true)`) |
| `POST` | `/auth/refresh` | any request when the token is within 5 min of expiry (interceptor) |

### Reachable only after opening a Season-card modal

`GET /action` · `GET /user-action/search` · `GET /game/deliveries` · `GET /game/team-deliveries` · `GET /team/{id}/users` · `POST /game/action/process` · `PUT /game/action/status` · `POST /game/delivery/{id}/{complete\|restore\|cancel\|undeliver}` · `POST /user-action/{id}/comment` · `PUT /user-action/{id}/attachment` · `GET /user-action/{id}/attachment` · `GET /user-action/download-attachment/{id}`

### Explicitly NOT reachable from these surfaces (checked, negative result)

| Item | Why not |
|---|---|
| `player.service.ts` | Grep for `PlayerService`: consumers are `modal-player-detail`, `dashboard-supervisor`, `dashboard-supervisor-tecnico`, `gamification-dashboard`, `team-management-dashboard`, `cache-manager.service`, `kpi.service` — **none of the five surfaces** |
| `backend-api.service.ts` | Grep for `BackendApiService`: consumers are `dashboard-supervisor*`, `team-management-dashboard`, `acl/action-log/auth/company/kpi/team-aggregate` services — **none of the five surfaces** |
| `notification.service.ts` | Contains **no HTTP at all** — `showSuccess` is `alert()` + DOM confetti + `new Audio('assets/sounds/success-plim.mp3')` (`notification.service.ts:11-13`, `:104-111`) |
| `acesso.service.ts` (`/team/managed-teams`, `/team/{id}/users`) | Injected into Thermometer but never called (`thermometer.component.ts:73`) |
| All `/game/reports/**` (~25 endpoints in `Game4uApiService`) | No call site in Rewards / Thermometer / Ranking / Home / Season |
| Funifier `/virtualgoods/item` | Commented out (`recompensas.service.ts:164-166`) |
| Supabase PostgREST | Gated behind `!isConfigured() && useGame4uSupabaseFallback` (`game4u-api.service.ts:180-186`); `supabaseUrl` is `''` and the flag defaults to `false` |

---

## 7. Findings worth acting on

1. **Duplicate `/reward-store/purchase/list`.** Fired at `rewards.component.ts:78` and again at `rewards.component.ts:243`; the first result is only `console.log`'d (`rewards.component.ts:100-102`). Deleting the `ngOnInit` call removes one round-trip with zero behaviour change.
2. **`REWARD_STORE_API.md` is stale in four ways.** Wrong item/catalog field names, a documented-but-unsent `extra.upgrade`, a documented `{success,message}` response the code doesn't read (it reads `status`), and a documented mock fallback that doesn't exist. Two endpoints (`purchase/list`, `purchase/list-all`) are entirely undocumented. See §1.5.
3. **Ranking hides backend failures behind random data.** K1 failure caches four fabricated ranking types (`ranking.service.ts:205-206`, `:649-680`); K2 failure renders ten participants with `Math.random()` points and still sets `hasGeneratedRanking = true` (`ranking.component.ts:78-90`). An outage is indistinguishable from real results.
4. **Ranking re-fetches `/leaderboards` per "Gerar Ranking".** `getRankingInfo` consults the cache then issues the HTTP call anyway (`ranking.service.ts:262-268`); it could read from `rankingsCache` instead.
5. **Unbounded `shareReplay({refCount: false})` on `/game/stats` and `/game/actions`** (`game4u-api.service.ts:219-227`). Successful responses persist for the app lifetime unless `clearStatsActionsDedupeCache()` runs, so the season card can serve arbitrarily stale points.
6. **Two divergent campaign fallbacks.** `season.component.ts:520-527` hard-codes May–June 2025; `campaign.service.ts:134-148` uses Jan 1–Dec 31 of the current year. Only one can be right.
7. **`period` query encoding on `POST /leaderboards/{id}`.** `encodeURI` leaves `;` and `+` unescaped (`api.provider.ts:21`, `ranking.service.ts:225-230`); a trailing `+` is decodable as a space server-side. Use `HttpParams` or move `period` into the (currently empty) body.
8. **R6 has no error handler** (`rewards.component.ts:243-247`) — a failure pins `isLoadingRewards = true` and the store shimmers forever.
9. **Dead code with real cost.** `HomeModule` drags `DashboardModule` into the eager `pages` chunk for a component that is unrouted with a 0-byte template (§4). `RewardsMetricsComponent`, `DistributionPotComponent`, `MOCK_PLAYER_REDEEM_LOGS`, `listAllAchievements()`, and the fully commented-out body of `modal-detalhe-executor` are all unreferenced.
10. **Rewards economy is not server-backed.** `coins`, `points`, `price` are hard-coded (`rewards.component.ts:44-46`) and mutated only in `localStorage` (`convert-points-modal.component.ts:64-66`, `reward-redeem-modal.component.ts:80-81`). The affordability check for a real `POST /purchase/create` therefore runs against a client-controlled balance (`reward-redeem-modal.component.ts:53-61`).
