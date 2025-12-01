# 401 Unauthorized Fix

## Problem
After login, the app was getting a 401 Unauthorized error when trying to fetch user info:
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
URL: https://service2.funifier.com/v3/player/me/status
```

## Root Cause
The `AuthProvider.userInfo()` method was not adding the Authorization header with the Bearer token. After successful login, when `SessaoProvider.init()` called `auth.userInfo()`, the request was being sent without authentication.

## Solution
Updated the `AuthInterceptor` to automatically add the Bearer token to Funifier API requests when a token is available.

### How It Works Now

#### 1. Login Flow
```
User logs in
    ↓
POST /v3/auth/token (no auth needed)
    ↓
Token received and stored in sessionStorage
    ↓
SessaoProvider.init() called
    ↓
auth.userInfo() called
    ↓
GET /v3/player/me/status
    ↓
Interceptor adds: Authorization: Bearer {token}
    ↓
User info received
    ↓
Navigate to dashboard
```

#### 2. Interceptor Logic
```typescript
intercept(request: HttpRequest<any>, next: HttpHandler) {
    const isFunifierRequest = WHITELISTED_URLS.some(item => request.url.includes(item));
    
    if (isFunifierRequest) {
        const token = this.sessao.token;
        if (token && !request.url.includes('/auth/token')) {
            // Add Bearer token for authenticated Funifier requests
            const modifiedRequest = request.clone({
                setHeaders: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return next.handle(modifiedRequest);
        }
        // For login endpoint or when no token, pass through unchanged
        return next.handle(request);
    }
    
    // ... rest of interceptor logic
}
```

### Key Points

1. **Login endpoint** (`/auth/token`) - No Authorization header (public endpoint)
2. **User info endpoint** (`/player/me/status`) - Adds `Authorization: Bearer {token}`
3. **Token source** - Retrieved from `SessaoProvider.token` (stored in sessionStorage)
4. **Automatic** - No need to manually add headers in service methods

### Changes Made

#### AuthInterceptor (`src/app/providers/auth.interceptor.ts`)
**Before:**
```typescript
if (isFunifierRequest) {
    return next.handle(request);
}
```

**After:**
```typescript
if (isFunifierRequest) {
    const token = this.sessao.token;
    if (token && !request.url.includes('/auth/token')) {
        // Add Bearer token for authenticated Funifier requests
        const modifiedRequest = request.clone({
            setHeaders: {
                'Authorization': `Bearer ${token}`
            }
        });
        return next.handle(modifiedRequest);
    }
    // For login endpoint or when no token, pass through unchanged
    return next.handle(request);
}
```

## Testing

1. **Build and deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Test login flow:**
   - Open deployed URL
   - Enter credentials
   - Click "Entrar"
   - Check console for 🔐 logs
   - Verify no 401 errors
   - Should navigate to dashboard

3. **Check network tab:**
   - POST `/v3/auth/token` - No Authorization header ✅
   - GET `/v3/player/me/status` - Has `Authorization: Bearer {token}` ✅

## Related Issues Fixed

- ✅ CORS error - Removed custom headers
- ✅ Login not working - Fixed form submission
- ✅ System initialization - Returns default values
- ✅ 401 Unauthorized - Interceptor adds Bearer token

## Complete Authentication Flow

```
1. User enters credentials
2. LoginComponent.submit()
3. SessaoProvider.login(username, password)
4. AuthProvider.login(username, password)
5. POST /v3/auth/token (no auth)
6. Response: { access_token, refresh_token, ... }
7. Token stored in sessionStorage
8. SessaoProvider.init(true)
9. AuthProvider.userInfo()
10. GET /v3/player/me/status
11. Interceptor adds: Authorization: Bearer {token}
12. Response: { player data }
13. User data stored
14. Navigate to dashboard
```

## Important Notes

1. **Token storage** - Stored in sessionStorage via `SessaoProvider.storeLoginInfo()`
2. **Token retrieval** - Retrieved via `SessaoProvider.token` getter
3. **Automatic injection** - Interceptor automatically adds token to all Funifier requests
4. **Login endpoint exception** - `/auth/token` never gets Authorization header
5. **No manual headers** - Service methods don't need to add Authorization headers

## Next Steps

- [x] Fix 401 error
- [x] Test login flow
- [ ] Test dashboard data loading
- [ ] Verify all Funifier endpoints work
- [ ] Remove debug logs once stable
