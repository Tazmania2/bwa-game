# Design Document

## Overview

This document outlines the technical design for a gamification dashboard front-end application built with Angular. The system displays player performance metrics, KPIs, progress tracking, and company portfolio management through an engaging, visually appealing interface that integrates with the Funifier gamification API.

The dashboard follows a modular component architecture with clear separation between presentation, business logic, and data access layers. It leverages Angular's reactive programming patterns with RxJS for state management and real-time data updates.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   Company    │  │   Shared     │      │
│  │  Components  │  │    Modal     │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Player     │  │   Company    │  │     KPI      │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Funifier   │  │     HTTP     │  │    Auth      │      │
│  │   API Client │  │  Interceptor │  │  Interceptor │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────────────┐
                    │   Funifier    │
                    │   REST API    │
                    └───────────────┘
```

### Technology Stack

- **Framework**: Angular 15+
- **Language**: TypeScript 4.8+
- **State Management**: RxJS Observables and BehaviorSubjects
- **HTTP Client**: Angular HttpClient
- **Styling**: SCSS with Bootstrap 5 utilities
- **Icons**: Remix Icons
- **Charts**: Chart.js or D3.js for progress visualizations
- **Date Handling**: date-fns or Day.js

## Components and Interfaces

### Core Components

#### 1. DashboardComponent
Main container component that orchestrates the entire dashboard view.

**Responsibilities:**
- Layout management for left sidebar and main content area
- Data fetching coordination
- Month selection state management
- Refresh mechanism

**Inputs:** None (root component)

**Outputs:**
- `monthChanged: EventEmitter<Date>` - Emits when user changes selected month

**Key Methods:**
```typescript
ngOnInit(): void
loadDashboardData(): void
onMonthChange(date: Date): void
refreshData(): void
```

#### 2. SeasonLevelComponent
Displays the player's current season level in a circular badge.

**Inputs:**
- `level: number` - Current season level
- `playerName: string` - Player's display name
- `metadata: PlayerMetadata` - Area/Time/Squad information

**Template Structure:**
```html
<div class="season-level">
  <div class="level-badge">{{ level }}</div>
  <div class="player-info">
    <h3>{{ playerName }}</h3>
    <p>{{ metadata.area }} / {{ metadata.time }} / {{ metadata.squad }}</p>
  </div>
</div>
```

#### 3. PointWalletComponent
Displays the three point categories with their values.

**Inputs:**
- `points: PointWallet` - Object containing Bloqueados, Desbloqueados, Moedas

**Interface:**
```typescript
interface PointWallet {
  bloqueados: number;
  desbloqueados: number;
  moedas: number;
}
```

#### 4. SeasonProgressComponent
Shows progress toward season goals.

**Inputs:**
- `progress: SeasonProgress` - Current progress metrics
- `seasonDates: { start: Date, end: Date }` - Season period

**Interface:**
```typescript
interface SeasonProgress {
  metas: { current: number, target: number };
  clientes: number;
  tarefasFinalizadas: number;
}
```

#### 5. MonthSelectorComponent
Month navigation control with previous/current/next buttons.

**Inputs:**
- `currentMonth: Date` - Currently selected month

**Outputs:**
- `monthSelected: EventEmitter<Date>` - Emits when month changes

**Key Methods:**
```typescript
previousMonth(): void
nextMonth(): void
selectMonth(date: Date): void
formatMonth(date: Date): string // Returns "MAI/23" format
```

#### 6. KPICircularProgressComponent
Reusable circular progress indicator for KPIs.

**Inputs:**
- `label: string` - KPI name (e.g., "KPI 1")
- `current: number` - Current value
- `target: number` - Target value
- `color: 'red' | 'yellow' | 'green'` - Progress color based on completion

**Computed Properties:**
```typescript
get percentage(): number {
  return (this.current / this.target) * 100;
}

get progressColor(): string {
  if (this.percentage >= 80) return 'green';
  if (this.percentage >= 50) return 'yellow';
  return 'red';
}
```

#### 7. ActivityProgressComponent
Displays activity and macro completion statistics.

**Inputs:**
- `activities: ActivityMetrics` - Activity statistics
- `macros: MacroMetrics` - Macro statistics

**Interfaces:**
```typescript
interface ActivityMetrics {
  pendentes: number;
  emExecucao: number;
  finalizadas: number;
  pontos: number;
}

interface MacroMetrics {
  pendentes: number;
  incompletas: number;
  finalizadas: number;
}
```

#### 8. CompanyTableComponent
Table displaying company portfolio with KPI scores.

**Inputs:**
- `companies: Company[]` - List of companies

**Outputs:**
- `companySelected: EventEmitter<Company>` - Emits when row is clicked

**Interface:**
```typescript
interface Company {
  id: string;
  name: string;
  cnpj: string;
  healthScore: number;
  kpi1: number;
  kpi2: number;
  kpi3: number;
}
```

#### 9. CompanyDetailModalComponent
Modal displaying detailed company information with tabs.

**Inputs:**
- `company: Company` - Selected company
- `isOpen: boolean` - Modal visibility state

**Outputs:**
- `closed: EventEmitter<void>` - Emits when modal is closed

**State:**
```typescript
activeTab: 'macros-incompletas' | 'atividades-finalizadas' | 'macros-finalizadas'
processes: Process[]
```

#### 10. ProcessAccordionComponent
Expandable accordion for processes and tasks.

**Inputs:**
- `processes: Process[]` - List of processes with tasks

**Interface:**
```typescript
interface Process {
  id: string;
  name: string;
  expanded: boolean;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  responsible: string;
  status: 'pending' | 'in-progress' | 'completed';
}
```

### Service Layer

#### PlayerService
Manages player data and status.

**Methods:**
```typescript
getPlayerStatus(playerId: string): Observable<PlayerStatus>
getPlayerPoints(playerId: string): Observable<PointWallet>
getSeasonProgress(playerId: string): Observable<SeasonProgress>
```

#### CompanyService
Manages company portfolio data.

**Methods:**
```typescript
getCompanies(playerId: string): Observable<Company[]>
getCompanyDetails(companyId: string): Observable<CompanyDetails>
getCompanyProcesses(companyId: string, filter: string): Observable<Process[]>
```

#### KPIService
Handles KPI calculations and data.

**Methods:**
```typescript
getPlayerKPIs(playerId: string): Observable<KPIData[]>
getCompanyKPIs(companyId: string): Observable<KPIData[]>
calculateKPIProgress(current: number, target: number): number
```

#### FunifierApiService
Low-level API client for Funifier integration.

**Methods:**
```typescript
authenticate(credentials: AuthCredentials): Observable<AuthToken>
get<T>(endpoint: string, params?: any): Observable<T>
post<T>(endpoint: string, body: any): Observable<T>
```

## Data Models

### Core Models

```typescript
// Player Models
interface PlayerStatus {
  _id: string;
  name: string;
  email: string;
  level: number;
  seasonLevel: number;
  metadata: PlayerMetadata;
  created: number;
  updated: number;
}

interface PlayerMetadata {
  area: string;
  time: string;
  squad: string;
  [key: string]: any;
}

// Point Models
interface PointWallet {
  bloqueados: number;
  desbloqueados: number;
  moedas: number;
}

interface PointCategory {
  category: string;
  shortName: string;
  _id: string;
}

// Progress Models
interface SeasonProgress {
  metas: ProgressMetric;
  clientes: number;
  tarefasFinalizadas: number;
  seasonDates: {
    start: Date;
    end: Date;
  };
}

interface ProgressMetric {
  current: number;
  target: number;
}

// KPI Models
interface KPIData {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
}

// Company Models
interface Company {
  id: string;
  name: string;
  cnpj: string;
  healthScore: number;
  kpi1: KPIData;
  kpi2: KPIData;
  kpi3: KPIData;
}

interface CompanyDetails extends Company {
  processes: Process[];
  activities: Activity[];
  macros: Macro[];
}

// Process and Task Models
interface Process {
  id: string;
  name: string;
  status: ProcessStatus;
  tasks: Task[];
  expanded?: boolean;
}

interface Task {
  id: string;
  name: string;
  responsible: string;
  status: TaskStatus;
  dueDate?: Date;
}

type ProcessStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Activity Models
interface Activity {
  id: string;
  name: string;
  points: number;
  completedDate: Date;
}

interface ActivityMetrics {
  pendentes: number;
  emExecucao: number;
  finalizadas: number;
  pontos: number;
}

interface MacroMetrics {
  pendentes: number;
  incompletas: number;
  finalizadas: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Season Level Display Consistency
*For any* player status response from the Funifier API, when the dashboard loads, the displayed season level should match the `seasonLevel` field in the player status response.
**Validates: Requirements 1.1, 1.3**

### Property 2: Point Wallet Data Integrity
*For any* player with point data, the sum of displayed point categories (Bloqueados + Desbloqueados + Moedas) should equal the total points returned by the Funifier API player status endpoint.
**Validates: Requirements 2.1, 2.2**

### Property 3: Month Navigation Boundary
*For any* month selection, clicking the previous month button should navigate to the month immediately before the current month, and clicking next should navigate to the month immediately after.
**Validates: Requirements 4.2, 4.3**

### Property 4: KPI Progress Calculation
*For any* KPI with current and target values, the displayed percentage should equal `(current / target) * 100`, rounded to the nearest integer.
**Validates: Requirements 5.2, 5.3**

### Property 5: Company Table Row Clickability
*For any* company row in the portfolio table, clicking the row should open the company detail modal with the correct company data loaded.
**Validates: Requirements 7.3, 8.1**

### Property 6: Modal Tab Content Isolation
*For any* tab selection in the company detail modal, switching tabs should display only the content associated with that tab and hide content from other tabs.
**Validates: Requirements 8.3, 8.4**

### Property 7: Process Accordion Expansion
*For any* process in the accordion, clicking the process header should toggle its expansion state without affecting other processes' expansion states.
**Validates: Requirements 9.2, 9.4**

### Property 8: API Error Handling Graceful Degradation
*For any* failed API request, the system should display an error message to the user and maintain the previous valid state or show cached data if available.
**Validates: Requirements 11.2, 11.5**

### Property 9: Data Refresh Preserves Context
*For any* user context (selected month, open modal, expanded processes), refreshing the dashboard data should maintain that context and only update the data values.
**Validates: Requirements 12.4, 12.5**

### Property 10: Point Value Formatting Consistency
*For any* numeric point value, the system should format it with appropriate thousand separators (e.g., 12000 displays as "12,000").
**Validates: Requirements 2.3**

### Property 11: Responsive Layout Adaptation
*For any* screen size change, the dashboard should adjust its layout to maintain readability without horizontal scrolling.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

### Property 12: Season Date Range Display
*For any* season with start and end dates, the displayed date range should be in the format "DD/M/YY a DD/M/YY" (e.g., "1/4/23 a 30/9/23").
**Validates: Requirements 3.2, 3.5**

## Error Handling

### API Error Handling Strategy

1. **Network Errors**
   - Display toast notification: "Não foi possível conectar ao servidor. Verifique sua conexão."
   - Retry mechanism: Automatic retry up to 3 times with exponential backoff
   - Fallback: Display cached data if available

2. **Authentication Errors (401)**
   - Clear stored authentication token
   - Redirect to login page
   - Display message: "Sua sessão expirou. Por favor, faça login novamente."

3. **Authorization Errors (403)**
   - Display message: "Você não tem permissão para acessar este recurso."
   - Log error details for debugging

4. **Not Found Errors (404)**
   - Display message: "Recurso não encontrado."
   - Provide navigation back to dashboard

5. **Server Errors (500+)**
   - Display message: "Erro no servidor. Tente novamente mais tarde."
   - Log full error details
   - Offer manual retry button

### Component-Level Error Handling

```typescript
// Example error handling in service
getPlayerStatus(playerId: string): Observable<PlayerStatus> {
  return this.apiService.get<PlayerStatus>(`/v3/player/${playerId}/status`).pipe(
    retry({ count: 3, delay: 1000 }),
    catchError((error: HttpErrorResponse) => {
      this.handleError(error);
      return of(this.getCachedPlayerStatus(playerId));
    })
  );
}

private handleError(error: HttpErrorResponse): void {
  let message: string;
  
  switch (error.status) {
    case 0:
      message = 'Erro de conexão. Verifique sua internet.';
      break;
    case 401:
      message = 'Sessão expirada. Faça login novamente.';
      this.authService.logout();
      break;
    case 403:
      message = 'Acesso negado.';
      break;
    case 404:
      message = 'Recurso não encontrado.';
      break;
    default:
      message = 'Erro ao carregar dados. Tente novamente.';
  }
  
  this.toastService.error(message);
  console.error('API Error:', error);
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify individual component and service behavior in isolation using Jasmine and Karma.

**Component Testing Focus:**
- Input/Output bindings work correctly
- Event emitters fire with correct data
- Computed properties calculate correctly
- Template rendering matches expected output

**Service Testing Focus:**
- API calls are made with correct parameters
- Data transformations produce expected results
- Error handling behaves correctly
- Caching mechanisms work as intended

**Example Unit Tests:**
```typescript
describe('KPICircularProgressComponent', () => {
  it('should calculate percentage correctly', () => {
    component.current = 15;
    component.target = 50;
    expect(component.percentage).toBe(30);
  });

  it('should return green color for 80%+ completion', () => {
    component.current = 40;
    component.target = 50;
    expect(component.progressColor).toBe('green');
  });

  it('should return red color for <50% completion', () => {
    component.current = 20;
    component.target = 50;
    expect(component.progressColor).toBe('red');
  });
});
```

### Property-Based Testing

Property-based tests will use **fast-check** library to verify universal properties across many randomly generated inputs.

**Configuration:**
- Minimum 100 iterations per property test
- Custom generators for domain-specific data types
- Shrinking enabled to find minimal failing cases

**Property Test Examples:**

```typescript
import * as fc from 'fast-check';

describe('Property Tests', () => {
  /**
   * Feature: gamification-dashboard, Property 4: KPI Progress Calculation
   * Validates: Requirements 5.2, 5.3
   */
  it('should calculate KPI percentage correctly for all valid inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }), // current
        fc.integer({ min: 1, max: 10000 }), // target (non-zero)
        (current, target) => {
          const component = new KPICircularProgressComponent();
          component.current = current;
          component.target = target;
          
          const expected = Math.round((current / target) * 100);
          expect(component.percentage).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gamification-dashboard, Property 10: Point Value Formatting Consistency
   * Validates: Requirements 2.3
   */
  it('should format all numeric values with thousand separators', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999999 }),
        (value) => {
          const formatted = formatNumber(value);
          const expected = value.toLocaleString('pt-BR');
          expect(formatted).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gamification-dashboard, Property 3: Month Navigation Boundary
   * Validates: Requirements 4.2, 4.3
   */
  it('should navigate to adjacent months correctly', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
        (currentDate) => {
          const component = new MonthSelectorComponent();
          component.currentMonth = currentDate;
          
          component.previousMonth();
          const prevMonth = component.currentMonth;
          expect(prevMonth.getMonth()).toBe(
            (currentDate.getMonth() - 1 + 12) % 12
          );
          
          component.currentMonth = currentDate;
          component.nextMonth();
          const nextMonth = component.currentMonth;
          expect(nextMonth.getMonth()).toBe(
            (currentDate.getMonth() + 1) % 12
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify that components work together correctly and that services integrate properly with the Funifier API.

**Focus Areas:**
- Dashboard component loads and displays all child components
- Modal opens and closes correctly with proper data flow
- API service integrates with HTTP interceptors
- State management flows correctly through the component tree

### End-to-End Testing

E2E tests using Cypress or Playwright will verify complete user workflows.

**Test Scenarios:**
- User loads dashboard and sees their data
- User navigates between months
- User clicks company row and modal opens
- User switches tabs in modal
- User expands/collapses processes
- Error states display correctly

## API Integration

### Authentication Flow

```typescript
// 1. Authenticate with Funifier
const authResponse = await funifierApi.authenticate({
  apiKey: environment.funifierApiKey,
  grant_type: 'password',
  username: playerEmail,
  password: playerPassword
});

// 2. Store access token
localStorage.setItem('funifier_token', authResponse.access_token);

// 3. Use token in subsequent requests via interceptor
```

### Key API Endpoints

| Endpoint | Method | Purpose | Response Model |
|----------|--------|---------|----------------|
| `/v3/player/:id/status` | GET | Get player status and points | PlayerStatus |
| `/v3/player/:id` | GET | Get player details | Player |
| `/v3/point` | GET | List point categories | PointCategory[] |
| `/v3/action/log` | GET | Get action logs | ActionLog[] |
| `/v3/challenge` | GET | Get challenges | Challenge[] |
| `/v3/leaderboard/:id/leader/aggregate` | POST | Get leaderboard data | Leader[] |

### Data Mapping Strategy

Funifier API responses will be mapped to application models using dedicated mapper services:

```typescript
@Injectable()
export class PlayerMapper {
  toPlayerStatus(apiResponse: any): PlayerStatus {
    return {
      _id: apiResponse._id,
      name: apiResponse.name,
      email: apiResponse.email,
      level: apiResponse.level_progress?.next_level?.position || 0,
      seasonLevel: apiResponse.extra?.seasonLevel || 0,
      metadata: {
        area: apiResponse.extra?.area || '',
        time: apiResponse.extra?.time || '',
        squad: apiResponse.extra?.squad || ''
      },
      created: apiResponse.created,
      updated: apiResponse.updated
    };
  }

  toPointWallet(apiResponse: any): PointWallet {
    const pointCategories = apiResponse.point_categories || {};
    return {
      bloqueados: pointCategories.bloqueados || 0,
      desbloqueados: pointCategories.desbloqueados || 0,
      moedas: pointCategories.moedas || 0
    };
  }
}
```

### Caching Strategy

- **Player Status**: Cache for 5 minutes
- **Company List**: Cache for 10 minutes
- **KPI Data**: Cache for 3 minutes
- **Process Details**: No caching (always fresh)

Implementation using RxJS `shareReplay`:

```typescript
private playerStatusCache$ = new Map<string, Observable<PlayerStatus>>();

getPlayerStatus(playerId: string): Observable<PlayerStatus> {
  if (!this.playerStatusCache$.has(playerId)) {
    const request$ = this.apiService
      .get<any>(`/v3/player/${playerId}/status`)
      .pipe(
        map(response => this.mapper.toPlayerStatus(response)),
        shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 })
      );
    this.playerStatusCache$.set(playerId, request$);
  }
  return this.playerStatusCache$.get(playerId)!;
}
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Modal component loaded only when first opened
   - Chart libraries loaded on-demand

2. **Change Detection**
   - Use `OnPush` change detection strategy for all components
   - Immutable data patterns with RxJS

3. **Virtual Scrolling**
   - Implement virtual scrolling for company table if list exceeds 50 items
   - Use Angular CDK Virtual Scroll

4. **Image Optimization**
   - Lazy load images
   - Use appropriate image sizes
   - Implement placeholder images

5. **Bundle Optimization**
   - Code splitting by route
   - Tree shaking unused code
   - Minimize third-party dependencies

### Performance Metrics Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## Security Considerations

### Authentication & Authorization

- Store JWT tokens in httpOnly cookies when possible
- Implement token refresh mechanism
- Clear sensitive data on logout
- Validate token expiration client-side

### Data Protection

- Never log sensitive user data
- Sanitize all user inputs
- Use Angular's built-in XSS protection
- Implement Content Security Policy headers

### API Security

- Use HTTPS for all API calls
- Implement request signing if required by Funifier
- Rate limiting on client side to prevent abuse
- Validate all API responses before processing

## Deployment Strategy

### Build Configuration

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  funifierApiUrl: 'https://service2.funifier.com',
  funifierApiKey: '${FUNIFIER_API_KEY}', // Injected at build time
  cacheTimeout: 300000, // 5 minutes
  enableAnalytics: true
};
```

### Docker Configuration

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/gamification-dashboard /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD Pipeline

1. **Build Stage**
   - Install dependencies
   - Run linter
   - Run unit tests
   - Build production bundle

2. **Test Stage**
   - Run integration tests
   - Run E2E tests
   - Generate coverage report

3. **Deploy Stage**
   - Build Docker image
   - Push to container registry
   - Deploy to staging/production
   - Run smoke tests

## Accessibility

### WCAG 2.1 AA Compliance

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management in modal
- Color contrast ratios meet AA standards
- Screen reader announcements for dynamic content

### Implementation Examples

```html
<!-- Accessible KPI Progress -->
<div class="kpi-progress" 
     role="progressbar" 
     [attr.aria-valuenow]="current"
     [attr.aria-valuemin]="0"
     [attr.aria-valuemax]="target"
     [attr.aria-label]="label + ' progress'">
  <span class="sr-only">{{ current }} de {{ target }}</span>
</div>

<!-- Accessible Modal -->
<div class="modal" 
     role="dialog" 
     aria-modal="true"
     [attr.aria-labelledby]="'modal-title-' + company.id">
  <h2 [id]="'modal-title-' + company.id">{{ company.name }}</h2>
  <!-- Modal content -->
</div>
```

## Internationalization (i18n)

While the initial version will be in Portuguese (pt-BR), the architecture supports future internationalization:

```typescript
// Use Angular i18n
<h1 i18n="@@dashboard.title">Painel de Gamificação</h1>

// Or use ngx-translate
<h1>{{ 'dashboard.title' | translate }}</h1>
```

## Monitoring and Analytics

### Error Tracking

- Integrate Sentry or similar for error tracking
- Log all API errors with context
- Track user actions leading to errors

### Performance Monitoring

- Track page load times
- Monitor API response times
- Track user interactions (clicks, navigation)

### Business Metrics

- Track most viewed companies
- Monitor KPI achievement rates
- Track user engagement patterns

## Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for live data updates
   - Push notifications for achievements

2. **Advanced Filtering**
   - Filter companies by KPI ranges
   - Search functionality
   - Custom date range selection

3. **Data Export**
   - Export company data to CSV/Excel
   - Generate PDF reports

4. **Customization**
   - User-configurable dashboard layout
   - Custom KPI definitions
   - Theme customization

5. **Mobile App**
   - Native mobile application
   - Offline support
   - Push notifications
