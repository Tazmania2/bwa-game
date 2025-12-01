# CORS Fix - Funifier API Integration

## Problem
When deployed to Vercel, the application was getting CORS errors:
```
Access to XMLHttpRequest at 'https://service2.funifier.com/v3/player/me/status' from origin 'https://game-bwa.vercel.app' has been blocked by CORS policy: Request header field x-funifier-request is not allowed by Access-Control-Allow-Headers in preflight response.
```

## Root Cause
We were adding a custom header `X-Funifier-Request: true` to bypass our auth interceptor, but Funifier's API doesn't allow custom headers in CORS preflight requests. Funifier only allows standard headers like:
- `Content-Type`
- `Authorization`
- `Accept`

## Solution
Removed the custom `X-Funifier-Request` header and updated the auth interceptor to recognize Funifier URLs by domain instead.

### Changes Made

#### 1. AuthProvider (`src/app/providers/auth/auth.provider.ts`)
**Before:**
```typescript
const headers = {
  'X-Funifier-Request': 'true',
  'Content-Type': 'application/json'
};

return firstValueFrom(
  this.http.post<LoginResponse>(`${this.funifierBaseUrl}/v3/auth/token`, authBody, { headers })
);
```

**After:**
```typescript
// Don't add custom headers - Funifier blocks them via CORS
// The interceptor will recognize Funifier URLs by domain
return firstValueFrom(
  this.http.post<LoginResponse>(`${this.funifierBaseUrl}/v3/auth/token`, authBody)
);
```

#### 2. AuthInterceptor (`src/app/providers/auth.interceptor.ts`)
**Before:**
```typescript
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // NÃO sobrescreve Authorization se for requisição Funifier
    if (request.headers.has('X-Funifier-Request')) {
        return next.handle(request);
    }
    // ...
}
```

**After:**
```typescript
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if this is a Funifier API request by URL
    const isFunifierRequest = WHITELISTED_URLS.some(item => request.url.includes(item));
    
    // Don't intercept Funifier requests - they handle their own auth
    if (isFunifierRequest) {
        return next.handle(request);
    }
    // ...
}
```

#### 3. FunifierApiService (`src/app/services/funifier-api.service.ts`)
**Before:**
```typescript
private getHeaders(endpoint: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Funifier-Request': 'true' // Marker to prevent auth interceptor from overriding
    });
    // ...
}
```

**After:**
```typescript
private getHeaders(endpoint: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
      // Don't add X-Funifier-Request - Funifier blocks custom headers via CORS
      // The interceptor recognizes Funifier URLs by domain
    });
    // ...
}
```

## How It Works Now

1. **Request is made** to Funifier API (e.g., `https://service2.funifier.com/v3/player/me/status`)
2. **AuthInterceptor checks URL** - Sees `funifier.com` in the URL
3. **Request bypasses interceptor** - Goes directly to Funifier without modification
4. **Only standard headers** - `Content-Type` and `Authorization` (Bearer or Basic)
5. **CORS preflight passes** - Funifier allows the request
6. **Response received** - Data flows back to the application

## Whitelisted URLs in Interceptor

```typescript
const WHITELISTED_URLS = [
    '/auth/login',
    '/auth/refresh',
    '/client/system-params',
    '/campaign/current',
    'funifier.com' // Whitelist all Funifier API calls
]
```

Any URL containing `funifier.com` will bypass the auth interceptor.

## Testing

1. **Build the application**: `npm run build`
2. **Deploy to Vercel**: `vercel --prod`
3. **Open the deployed URL**
4. **Check browser console** - Should see no CORS errors
5. **Check network tab** - Funifier requests should succeed
6. **Login should work** - Authentication flow completes

## CORS Headers Allowed by Funifier

Funifier's API allows these standard headers:
- ✅ `Content-Type: application/json`
- ✅ `Authorization: Bearer {token}`
- ✅ `Authorization: Basic {token}`
- ✅ `Accept: application/json`
- ❌ `X-Funifier-Request` (custom header - blocked)
- ❌ Any other custom headers

## Important Notes

1. **Local development** - CORS errors might not appear in local development due to browser security settings
2. **Production deployment** - CORS errors only appear when deployed to a different origin (like Vercel)
3. **Standard headers only** - Always use standard HTTP headers when calling Funifier API
4. **URL-based detection** - The interceptor now uses URL pattern matching instead of custom headers

## Related Issues

- NullInjectorError - Fixed by removing dependency on custom headers
- Login not working - Fixed by allowing Funifier requests to bypass interceptor
- CORS preflight failures - Fixed by removing custom headers

## Next Steps

1. ✅ Remove custom headers from all Funifier API calls
2. ✅ Update interceptor to use URL-based detection
3. ✅ Test on deployed environment
4. [ ] Monitor for any remaining CORS issues
5. [ ] Consider adding retry logic for failed requests
