# API Integration Guide

## Overview

The Game4U Gamification Dashboard integrates with the Funifier API to retrieve and manage gamification data including KPIs, player information, and company metrics.

## API Service Architecture

### Core Service
- **FunifierApiService**: Main service handling HTTP requests and authentication
- **Location**: `src/app/services/funifier-api.service.ts`

### Data Services
- **KpiService**: Manages KPI data retrieval and processing
- **PlayerService**: Handles player-related operations
- **CompanyService**: Manages company data and analytics

### Mapper Services
- **KpiMapperService**: Transforms API responses to internal KPI models
- **PlayerMapperService**: Maps player data from API format
- **CompanyMapperService**: Converts company API data to dashboard format

## Authentication

The application uses JWT token-based authentication with the Funifier API.

### Token Management
```typescript
// Tokens are stored in session storage
sessionStorage.setItem('auth_token', token);

// Interceptor automatically adds token to requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## API Endpoints

### Player Endpoints
```typescript
// Get player status
GET /api/player/status

// Get player points
GET /api/player/points

// Get season progress
GET /api/player/season/progress
```

### Company Endpoints
```typescript
// Get all companies
GET /api/companies

// Get company details
GET /api/companies/{id}

// Get company processes
GET /api/companies/{id}/processes?tab={tab}
```

### KPI Endpoints
```typescript
// Get player KPIs
GET /api/kpis/player

// Get company KPIs
GET /api/kpis/company/{companyId}
```

## Data Models

### Player Model
```typescript
export interface PlayerData {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  seasonProgress: number;
  achievements: Achievement[];
}
```

### Company Model
```typescript
export interface CompanyData {
  id: string;
  name: string;
  sector: string;
  performance: number;
  kpis: KpiData[];
  employees: number;
  lastActivity: Date;
}
```

### KPI Model
```typescript
export interface KpiData {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}
```

## Error Handling

### HTTP Error Interceptor
```typescript
export class ApiErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle authentication errors
          this.router.navigate(['/login']);
        }
        if (error.status >= 500) {
          // Handle server errors
          this.notificationService.error('Server error occurred');
        }
        return throwError(() => error);
      })
    );
  }
}
```

### Service-Level Error Handling
```typescript
getKpis(): Observable<KpiData[]> {
  return this.http.get<ApiKpiResponse[]>(`${this.apiUrl}/kpis`)
    .pipe(
      map(response => this.kpiMapper.mapToKpiData(response)),
      catchError(error => {
        console.error('Failed to fetch KPIs:', error);
        // Return cached data if available
        return of(this.cachedKpis || []);
      })
    );
}
```

## Caching Strategy

### Service-Level Caching
```typescript
export class KpiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  getKpis(): Observable<KpiData[]> {
    const cached = this.cache.get('kpis');
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return of(cached.data);
    }

    return this.http.get<KpiData[]>('/api/kpis').pipe(
      tap(data => {
        this.cache.set('kpis', { data, timestamp: Date.now() });
      })
    );
  }
}
```

## Rate Limiting

The API implements rate limiting. The application handles this by:
- Implementing exponential backoff for retries
- Caching frequently accessed data
- Batching requests where possible

## Environment Configuration

### Development Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://dev-api.funifier.com',
  apiKey: 'dev-api-key',
  cacheTimeout: 300000, // 5 minutes
  retryAttempts: 3
};
```

### Production Environment
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.funifier.com',
  apiKey: 'prod-api-key',
  cacheTimeout: 600000, // 10 minutes
  retryAttempts: 5
};
```

## Testing API Integration

### Mock API Service
```typescript
export class MockFunifierApiService {
  getKpis(): Observable<KpiData[]> {
    return of(mockKpiData);
  }
  
  getPlayers(): Observable<PlayerData[]> {
    return of(mockPlayerData);
  }
}
```

### Integration Tests
```typescript
describe('FunifierApiService Integration', () => {
  let service: FunifierApiService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FunifierApiService]
    });
    
    service = TestBed.inject(FunifierApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should fetch KPI data', () => {
    const mockKpis = [/* mock data */];
    
    service.getKpis().subscribe(kpis => {
      expect(kpis).toEqual(mockKpis);
    });
    
    const req = httpMock.expectOne('/api/kpis');
    expect(req.request.method).toBe('GET');
    req.flush(mockKpis);
  });
});
```

## Security Considerations

### API Key Management
- Store API keys in environment variables
- Never commit API keys to version control
- Use different keys for different environments
- Implement key rotation procedures

### Request Validation
- Validate all incoming data
- Sanitize user inputs
- Implement request signing for sensitive operations

### HTTPS Only
- All API communications must use HTTPS
- Implement certificate pinning for production

## Monitoring and Logging

### API Request Logging
```typescript
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    
    return next.handle(req).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            const duration = Date.now() - startTime;
            console.log(`API Request: ${req.method} ${req.url} - ${event.status} (${duration}ms)`);
          }
        },
        error => {
          const duration = Date.now() - startTime;
          console.error(`API Error: ${req.method} ${req.url} - ${error.status} (${duration}ms)`, error);
        }
      )
    );
  }
}
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify API key is correct
   - Check token expiration
   - Ensure proper headers are set

2. **Rate Limiting**
   - Implement exponential backoff
   - Monitor request frequency
   - Use caching to reduce API calls

3. **Network Timeouts**
   - Configure appropriate timeout values
   - Implement retry logic
   - Handle offline scenarios

### Debug Mode
```typescript
// Enable detailed API logging in development
if (!environment.production) {
  console.log('API Request:', request);
  console.log('API Response:', response);
}
```

## Best Practices

1. **Always handle errors gracefully**
2. **Implement caching for frequently accessed data**
3. **Use RxJS operators for data transformation**
4. **Implement retry logic with exponential backoff**
5. **Monitor API performance and response times**
6. **Keep API keys secure and rotate regularly**
7. **Document all API endpoints and data models**
8. **Write comprehensive integration tests**
