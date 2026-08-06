# ⚠️ Test Suite — State and Warnings

**Last verified: 2026-08-04, branch `sprint/moco-01` (tip `f37c3d4`).**
Re-verify before trusting any number here. See "How to reproduce" below.

---

## Read this first

`ng test` in this repository **runs but does not pass**. It had not run at all —
not "was failing", but could not execute a single spec — for long enough that
378 specs have drifted out of sync with the code they cover.

Three things follow, and each one has already misled someone:

1. **A green check in an older `TASK_*.md` document does not mean a test
   passed.** Many of those documents were written while the suite was
   unrunnable. `TASK_5.2_SIZE_VARIANT_VERIFICATION.md` is the canonical
   example: it confirmed that a CSS class was applied, and was cited as proof
   that `size="small"` worked. It never worked — the ring is a different
   component with a hardcoded `width="130px"`.
2. **A failing spec here is not evidence that the code is broken.** The
   majority of current failures are stale TestBed configuration, not defects.
   See the taxonomy below.
3. **A passing spec here is weak evidence that the code is right.** Specs that
   never ran were never falsified. At least two of them assert behaviour that
   the implementation has never had.

---

## Current state

| Metric | Value |
|---|---|
| Specs discovered | 2183 |
| Specs executed before the run dies | 1606 |
| Failures among those | 378 |
| Specs never reached | 577 |
| Exit code | 1 |

The run does not finish. It dies at spec ~1606 and the remaining 577 have
**never been observed at all** — their true state is unknown, and they are not
counted in the 378.

### How to reproduce

```bash
# Full suite. Takes ~3.5 min and will not complete; see "The stall".
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npx ng test --watch=false --browsers=ChromeHeadlessCI --progress=false

# A single spec file, which is how to work productively today.
npx ng test --watch=false --browsers=ChromeHeadlessCI \
  --include='**/weekly-goal.service.spec.ts'
```

Run order is deterministic (`random: false`, `seed: 42` in `karma.conf.js`), so
the failure set and the stall point are reproducible run to run.

---

## Why it never ran, and what was fixed on 2026-08-04

Two independent blockers, stacked. The second was invisible until the first was
cleared, which is why the problem looked smaller than it was.

**1 — It did not compile.** 19 TypeScript errors across four spec files:

- `toHaveLength` and `toMatchObject` are **Jest** matchers; this project uses
  **Jasmine 4.6**. Replaced with `toHaveSize` and
  `toEqual(jasmine.objectContaining(...))`.
- `TS4111` — dot access on index-signature properties.
- `resolveOrgKpiMonthlyHistoryForChart` demanded a whole
  `OrganizationHierarchyReportParams` but reads only `cache_month`. Narrowed to
  `Pick<…, 'cache_month'>`.
- `node_type: 'team'` / `'area'` are synonyms the API sends and
  `normalizeOrgHierarchyNodeType` translates. The specs exist to prove that
  tolerance, so the raw values stayed, behind a documented cast.

**2 — Once compiling, it died on startup** with
`ReferenceError: process is not defined`.

This one is structural and worth understanding, because the same trap will
catch the next person:

- The **build** target uses `@angular-builders/custom-webpack:browser`, and
  `custom-webpack.config.ts` installs a `DefinePlugin` that replaces
  `process.env` with an object literal.
- The **test** target uses the stock `@angular-devkit/build-angular:karma`
  builder, which loads none of that.
- `src/environments/environment.ts` reads `process.env` **at module load**.

So the test bundle blew up while importing `environment.ts`, before the first
spec. Fixed with `src/test-env-shim.ts`, wired into the test target's
`polyfills`. It declares an empty env on purpose, so flags fall to their
declared defaults and results do not depend on whoever's `.env` is on disk. It
also sets a deliberately unroutable API base (`https://api.test.invalid/api`,
RFC 2606 reserved) so that a spec escaping `HttpTestingController` dies in DNS
instead of reaching a real environment.

**Also fixed:** `angular.json` never referenced `karma.conf.js`. The committed
config — including the `ChromeHeadlessCI` launcher that `ci-cd.yml` and every
README snippet assume exists — was dead. `karmaConfig` is now wired, and the
inactivity timeouts were raised so a slow block is not misreported as a crash.

---

## Failure taxonomy — by root cause, not by suite

This is the useful view. Grouping by suite name suggests 42 independent
problems; grouping by error message shows a handful of systemic ones.

| Count | Error | What it actually means |
|---|---|---|
| 97 | `Expected null to be ''` | Assertion drift in `C4uKpiCircularProgressComponent` after the render path changed |
| 81 | `NG0304: 'c4u-info-button' is not a known element` | A component was added to the app and never to these TestBeds |
| 45 | `NullInjectorError: No provider for HttpClient!` | TestBeds missing `HttpClientTestingModule` |
| 40 | `Unexpected value 'MockPorcentagemCircularModule' imported` | A broken test double, not production code |
| 39 | `NullInjectorError: … TeamAggregateService` | Service added to the graph, absent from the TestBed |
| 47 | `this.sessaoProvider.isAdmin is not a function` (24 + 23 across two spellings) | `SessaoProvider` grew a method; the spies were never updated |
| 31 | `TypeError: … translate_provider …` | i18n provider missing from the TestBed |
| 17 | `Property failed after 1 tests` | Property-based specs (`*.pbt.spec.ts`) |
| 14 | `Timeout — Async function did not complete within 5000ms` | Genuinely slow or hung async specs |

**The pattern: most of this is TestBed configuration drift, not broken
behaviour.** The application grew — a new `c4u-info-button`, a new `isAdmin` on
`SessaoProvider`, a translate provider — and specs written against the older
shape were never re-run to notice. That is mechanical to repair and does not
require product decisions. Budget accordingly: the count is intimidating, the
work mostly is not.

The exceptions are the ones that *do* need a decision — see below.

---

## The stall

The run does not hang in a loop. It is **poisoned by an unhandled promise
rejection**:

```
ERROR: 'Unhandled Promise rejection:', 'Error', '; Zone:', 'ProxyZone', …
Chrome Headless … ERROR
  An error was thrown in afterAll
  Unhandled promise rejection: Error thrown
…
Disconnected , because no message in 120000 ms.
```

It surfaces immediately after the `C4uSeletorMesComponent` block
(`src/app/components/c4u-seletor-mes/c4u-seletor-mes.component.spec.ts`). A
rejection escaping a spec is reported by Jasmine in `afterAll`, the runner
stops emitting, and Karma kills the browser on the inactivity timeout — which
is already raised to 120 s, so raising it further will not help.

**Fixing this one rejection is the highest-leverage repair in the file**: 577
specs are currently unobserved because of it, and their state is unknown. Do it
before estimating anything else.

---

## Specs that are wrong about the code

These assert behaviour the implementation has never had. They need a product
judgement — *is the spec right, or is the code right?* — and must not be
"fixed" by whoever is merely trying to get to green.

- **`game4u-game-mapper.spec.ts:1118`** — "excludes justified from on-time pct".
  Expects `Set('d1')`, gets `Set('d1', 'Sem título')`. Is an untitled delivery
  supposed to count?
- **`game4u-game-mapper.spec.ts:1168`** —
  "classifyExecutivePlayerRankings returns all directorates with status labels".
  Ordering and status labels both differ (`quiet@x.com` / `destaque` versus
  `empty@x.com` / `neutral`). Which ordering is correct is a product call.

One of this class has already been resolved: a spec expected `86,7%` from
`formatHighlightMtdCell`, but that column has used `Math.trunc` since PR #68
and shows whole percentages deliberately. The **spec** was wrong and was
aligned to shipped behaviour. Expect others like it, and check `git log`
against the implementation before changing production code to satisfy a spec
that never ran.

---

## CI implications

`.github/workflows/ci-cd.yml` contains a unit-test step:

```yaml
npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

**It has never executed. Not once.** The workflow triggers are:

```yaml
on:
  push:        branches: [ main, develop, staging ]
  pull_request: branches: [ main, develop ]
```

This repository has **no `main`, no `develop`, no `staging`**. Its default
branch — and its only integration branch — is `master`. So no push and no pull
request in this repo has ever matched a trigger. Confirmed with
`gh run list`: the only workflow that has ever run is the scheduled weekly
`Security Scan`.

> An earlier revision of this document stated that CI on `master` was red
> because of the suite. That was wrong. What was verified is that `ng test`
> fails on a clean worktree of `origin/master`; the CI consequence was
> inferred and never checked. The job is not red — it does not run. Corrected
> 2026-08-04.

So the practical position is worse than a red pipeline, and quieter:
**this repository has no automated verification of any kind on any branch.**
No unit tests, no build check, no lint. The only signal on a PR is the Vercel
preview deploy, which proves the app compiles for preview and nothing else.

Two separate decisions follow, and they should not be conflated:

1. **Point the workflow at the branches that exist** (`master`, and feature
   branches via `pull_request`). This is a one-line change and is what makes
   any of the rest matter.
2. **Decide what the pipeline gates on before you do (1).** Enabling it as
   written turns every PR red immediately, because the unit-test step exits 1.
   The honest interim is to gate on the build
   (`ng build --configuration=production`, which exits 0 today) and to run the
   unit step with `continue-on-error: true` **with a comment pointing at this
   document**, until the suite is repaired.

Do not silently drop the unit step. A skipped job that nobody remembers is how
this repo arrived at a suite that could not compile for months without anyone
noticing.

---

## Suggested repair order

1. **The unhandled rejection near `C4uSeletorMesComponent`.** Unblocks 577
   unobserved specs. Until this is done, every other estimate is a guess.
2. **The systemic TestBed gaps**, in descending count: declare
   `c4u-info-button`, add `HttpClientTestingModule`, provide
   `TeamAggregateService` and the translate provider, update the
   `SessaoProvider` spies with `isAdmin`. Largely mechanical.
3. **`MockPorcentagemCircularModule`** — a broken test double taking 40 specs
   with it.
4. **`C4uKpiCircularProgressComponent`** — 100 specs, but almost certainly one
   or two shared assumptions about the render output.
5. **Only then**, the specs that disagree with the code, one product decision
   at a time.

Do not attempt 2–5 before 1. The unobserved 577 may change every number here.

---

## Working in the meantime

Scope `--include` to the files you are touching. That is fast, honest, and
green:

```bash
npx ng test --watch=false --browsers=ChromeHeadlessCI \
  --include='**/weekly-goal.service.spec.ts' \
  --include='**/economy-indicators.service.spec.ts'
# TOTAL: 17 SUCCESS
```

New code should ship with specs that pass under a scoped run. Do not add specs
to the unrunnable pile.
