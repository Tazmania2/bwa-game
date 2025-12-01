# Game4U Project Guide

## Product
Gamification platform for employee engagement with points, rewards, rankings, and seasonal campaigns. Integrates with Funifier API. Roles: Colaborador (employee), Gestor (manager).

## Tech Stack
Angular 16 + TypeScript 5.0 + RxJS 7.8 | Bootstrap 5.2 + Tailwind 3.4 + SCSS | Chart.js 4.3 | ngx-translate (i18n: pt-BR, en-US) | Karma + Jasmine

**Commands**: `npm start` | `npm test` | `npm run build`

**Path Aliases**: `@components/`, `@services/`, `@modals/`, `@model/`, `@providers/`, `@utils/`, `@layout/`, `@app/`

## Structure
```
src/app/
├── components/  # c4u-* prefix (c4u-card, c4u-modal)
├── pages/       # dashboard, ranking, recompensas, thermometer
├── modals/      # Dialog components
├── services/    # providedIn: 'root', API + state + cache
├── providers/   # Interceptors, auth, session
├── model/       # *.model.ts interfaces
└── utils/       # Constants, helpers
```

## Conventions

**Components**: `c4u-name/` folder → `c4u-name.component.{ts,html,scss,spec.ts}` + module
**Services**: Singleton with `providedIn: 'root'`, error handling via NotificationService
**Models**: Interfaces only, suffix `.model.ts`
**i18n**: Translation keys in `assets/i18n/{pt-BR,en-US}.json`

## Critical Patterns

**Unsubscribe**: Use `takeUntil(destroy$)` pattern
```typescript
private destroy$ = new Subject<void>();
ngOnInit() { this.service.getData().pipe(takeUntil(this.destroy$)).subscribe(); }
ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
```

**Error Handling**: Catch errors, log to console, notify users
```typescript
.pipe(catchError(err => { console.error('Error:', err); return throwError(() => err); }))
```

**Typing**: No `any` unless justified, use strict TypeScript

## AI Code Review Checklist
- [ ] No hardcoded secrets, proper validation, auth checks
- [ ] Follows c4u-* naming, uses path aliases, proper typing
- [ ] Unsubscribe pattern, error handling, no memory leaks
- [ ] Test before commit: `npm test && npm run build`

## Key Rules
1. Use path aliases for imports
2. All custom components use c4u-* prefix
3. Services are singletons with error handling
4. Always unsubscribe from observables
5. Prefer Day.js over Moment.js
6. Default language: pt-BR
7. Review and test all AI-generated code
