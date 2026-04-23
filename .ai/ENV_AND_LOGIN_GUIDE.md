# Environment Configuration & Authentication Guide

## Quick Start - Local Development

### 1. Set Up .env File
```bash
cp .env.example .env
php artisan key:generate
```

**Key settings for local dev:**
- `APP_ENV=local`
- `APP_DEBUG=true`
- `DB_CONNECTION=sqlite` (already created at `database/database.sqlite`)
- `MAIL_MAILER=log` (emails logged to console)
- `BROADCAST_CONNECTION=reverb` (WebSockets for real-time)

### 2. Running the Application

**Start the dev server:**
```bash
composer run dev
```

This command runs:
- Laravel dev server on `http://127.0.0.1:8000`
- Vite dev server on `http://localhost:5173`
- (Optional) Reverb WebSocket server on `ws://localhost:8080`

---

## Authentication Architecture

Your app has **two authentication systems running in parallel**:

### System 1: Web/Browser (Session-Based via Fortify)
**For:** Inertia React SPA frontend  
**Routes:** `/login`, `/register`, `/logout` (Fortify provides these)  
**How it works:**
1. User submits form to `POST /login`
2. Fortify validates credentials
3. Creates session cookie
4. Browser stores cookie automatically
5. All subsequent requests include cookie

**Key .env variables:**
- `SESSION_DRIVER=database` (stores sessions in DB)
- `SESSION_LIFETIME=120` (minutes until session expires)

### System 2: API/Mobile (Token-Based via Sanctum)
**For:** Mobile apps, native clients, third-party integrations  
**Routes:** `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`  
**How it works:**
1. Mobile app POSTs JSON to `/api/auth/login`
   ```json
   {
     "email": "user@example.com",
     "password": "password",
     "device_name": "iPhone 15"
   }
   ```
2. API returns Bearer token
   ```json
   {
     "user": { "id": 1, "email": "...", "first_name": "..." },
     "token": "1|abc123def456..."
   }
   ```
3. Mobile app stores token securely
4. Includes in header: `Authorization: Bearer 1|abc123def456...`

**Key .env variables:**
- `SANCTUM_TOKEN_PREFIX=` (optional, adds prefix to tokens)
- No session variables needed for API

---

## Understanding the Login Flow

### For Web Browser (What happens in your Inertia React app):

```
User clicks "Log in" button
         ↓
User fills form at /login (form provided by Fortify)
         ↓
Form POSTs to POST /login
         ↓
Fortify validates email/password from database
         ↓
If valid: Create session, redirect to /discover
If invalid: Redirect back to /login with errors
         ↓
Browser automatically includes session cookie in all requests
         ↓
Routes check auth()->user() - returns logged-in user
```

**Important:** Your Inertia React frontend doesn't need to do anything special - Fortify handles everything!

### For Mobile App (API-based):

```
User enters email/password in mobile app
         ↓
App POSTs JSON to /api/auth/login
         ↓
Api\AuthController@login validates credentials
         ↓
If valid: Create personal_access_token, return token + user
If invalid: Return 422 validation errors
         ↓
App stores token in secure device storage (Keychain/Keystore)
         ↓
App includes Bearer token in all API requests
         ↓
Sanctum middleware validates token
         ↓
Routes check auth('sanctum')->user() - returns authenticated user
```

---

## Do You Need API Routes for Login?

### Answer: **It depends on your client**

| Client Type | Login Route | Why |
|---|---|---|
| **Web (Inertia React)** | Use `/login` (Fortify) | Session-based, handled by framework |
| **Mobile App** | Use `/api/auth/login` | Token-based, stateless for mobile |
| **Third-party API** | Use `/api/auth/login` | Integration needs tokens, not sessions |

**Your current setup has both:**
- ✅ Fortify routes (`/login`, `/register`) - for web
- ✅ Sanctum API routes (`/api/auth/login`, `/api/auth/register`) - for mobile

---

## Configuration by Environment

### Local Development (Current)
```env
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=sqlite
MAIL_MAILER=log
BROADCAST_CONNECTION=reverb
```

### Staging/Testing
```env
APP_ENV=staging
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=db.example.com
DB_DATABASE=pet_app_staging
DB_USERNAME=user
DB_PASSWORD=pass
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
```

### Production
```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
DB_HOST=prod-db.example.com
CACHE_STORE=redis
REDIS_HOST=redis.example.com
MAIL_MAILER=sendgrid
BROADCAST_CONNECTION=reverb
# ... with production credentials
```

---

## Required Configurations for Features

### Google OAuth Sign-In
1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credential (type: Web application)
3. Add authorized redirect URIs:
   - Local: `http://127.0.0.1:8000/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
4. Set in .env:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
   ```

### Email Notifications
Currently configured to log emails to console (development).

For production, set up SMTP:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=app-password
MAIL_ENCRYPTION=tls
```

### Real-Time Features (WebSockets)
Uses Reverb - configured in .env:
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=local-pet-app
REVERB_APP_KEY=local-pet-key
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
```

---

## Troubleshooting

### "No application encryption key has been specified"
```bash
php artisan key:generate
```

### "SQLSTATE[HY000]: General error: 1 no such table"
```bash
php artisan migrate
```

### "Unauthenticated" on API requests
Check that:
1. You're including `Authorization: Bearer {token}` header
2. Token was returned from `/api/auth/login`
3. Token hasn't been revoked or expired

### Session not persisting across requests
Ensure:
1. `SESSION_DRIVER=database`
2. Sessions table exists: `php artisan migrate`
3. Cookies are enabled in browser

### Google OAuth callback not working
1. Check redirect URI matches exactly in Google Console
2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
3. Local dev: use `http://127.0.0.1:8000` (not HTTPS)

---

## Key Environment Variables Summary

```env
# Identity
APP_NAME=PawMatch
APP_URL=http://127.0.0.1:8000

# Security
APP_KEY=base64:... (run: php artisan key:generate)
BCRYPT_ROUNDS=12

# Database
DB_CONNECTION=sqlite

# Authentication
SESSION_DRIVER=database      # Web auth
SESSION_LIFETIME=120          # Minutes
SANCTUM_TOKEN_PREFIX=         # API auth (optional)

# Communication
BROADCAST_CONNECTION=reverb   # Real-time events
MAIL_MAILER=log              # Emails (log to console in dev)

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Storage
FILESYSTEM_DISK=local

# Caching & Jobs
CACHE_STORE=database
QUEUE_CONNECTION=database
```

---

## Next Steps

1. ✅ Copy `.env.example` to `.env`
2. ✅ Run `php artisan key:generate`
3. ✅ Run `php artisan migrate`
4. ✅ (Optional) Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for OAuth
5. ✅ Start dev server: `composer run dev`
6. ✅ Visit `http://127.0.0.1:8000`

For web login: Use `/login` (Fortify handles it)  
For API login: Use `POST /api/auth/login` (token-based)
