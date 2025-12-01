# Route Guard Fix - Root Cause Found!

## Problem
The app was stuck in an error loop with:
1. NullInjectorError
2. 401 Unauthorized on `/v3/player/me/status`
3. Login page not loading

## Root Cause Found!

The issue was in the **route guard** `PermissaoAcessoGeral`:

1. User visits `/` → redirects to `/dashboard`
2. Dashboard has `canActivateChild: [PermissaoAcessoGeral]`
3. Guard calls `sessao.init(true)` → calls `auth.userInfo()` → **401 error!**

The guard was trying to fetch user info even when there was no token!

## Solution

Updated `PermissaoAcessoProvider` to check for token before calling `sessao.init()`:

### Changes Made

#### PermissaoAcessoProvider (`src/app/providers/sessao/permissao-acesso.provider.ts`)

**Before:**
```typescript
async validateSSOUser() {
    let user: Usuario | null = this.sessao.usuario;
    if (user) {
        return true;
    } else {
        return await this.sessao.init(true)  // ← Always called, even without token!
    }
}
```

**After:**
```typescript
async validateSSOUser() {
    let user: Usuario | null = this.sessao.usuario;
    let token = this.sessao.token;
    
    // If we have a user, they're authenticated
    if (user) {
        return true;
    }
    
    // If we have a token but no user, try to initialize
    if (token) {
        try {
            return await this.sessao.init(true);
        } catch (error) {
            console.error('Error initializing session:', error);
            return false;
        }
    }
    
    // No token, no user - not authenticated
    return false;
}
```

#### AppRoutingModule (`src/app/app-routing.module.ts`)

Removed the dynamic import for preloading strategy which could cause issues:

**Before:**
```typescript
preloadingStrategy: import('@angular/router').then(m => m.PreloadAllModules),
```

**After:**
```typescript
// Removed - was causing potential issues
```

## How It Works Now

1. User visits `/` → redirects to `/dashboard`
2. Guard checks: Do we have a user? No.
3. Guard checks: Do we have a token? No.
4. Guard returns `false` → redirects to `/login`
5. Login page loads successfully!

## Flow After Login

1. User logs in → token stored
2. User redirected to `/dashboard`
3. Guard checks: Do we have a user? No.
4. Guard checks: Do we have a token? Yes!
5. Guard calls `sessao.init(true)` → fetches user info with token
6. Dashboard loads with user data

## Testing

1. **Build and deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Test flow:**
   - Visit app → should redirect to login
   - No 401 errors in console
   - Login page loads
   - Enter credentials → login works
   - Dashboard loads with data

## Files Changed

1. `src/app/providers/sessao/permissao-acesso.provider.ts` - Check token before init
2. `src/app/app-routing.module.ts` - Remove dynamic preloading

## Why This Was Hard to Find

The error was happening in the route guard, not in AppComponent or any service. The guard was being triggered by the router before any component loaded, which is why:

1. Disabling AppComponent initialization didn't help
2. The error happened before the login page could load
3. The 401 error was from the guard, not from user action

## Success Criteria

✅ No 401 errors on app load
✅ No NullInjectorError
✅ Login page loads immediately
✅ Login works
✅ Dashboard loads after login

This should finally fix all the issues!
