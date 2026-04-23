# Quick Reference - Authentication & Environment

## 🚀 Getting Started

```bash
# 1. Install dependencies
composer install
npm install

# 2. Generate app key
php artisan key:generate

# 3. Run migrations
php artisan migrate

# 4. Seed database (optional, creates test users)
php artisan db:seed

# 5. Start dev server
composer run dev
```

## 🔐 Authentication Routes

### Web (Browser)
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/login` | Show login form |
| POST | `/login` | Submit login (session) |
| GET | `/register` | Show registration form |
| POST | `/register` | Submit registration |
| POST | `/logout` | Logout |

### API (Mobile/Client)
| Method | Route | Purpose | Auth Required |
|--------|-------|---------|-----------------|
| POST | `/api/auth/login` | Login with email/password | ❌ No |
| POST | `/api/auth/register` | Register new user | ❌ No |
| GET | `/api/user` | Get current user | ✅ Bearer token |
| POST | `/api/auth/logout` | Logout (revoke token) | ✅ Bearer token |
| POST | `/api/auth/tokens/revoke-all` | Logout from all devices | ✅ Bearer token |

## 🔑 API Login Example

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password",
    "device_name": "iPhone"
  }'

# Response:
# {
#   "user": { "id": 1, "email": "user@example.com", ... },
#   "token": "1|abc123def456..."
# }

# Use token in requests:
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer 1|abc123def456..."
```

## 🎯 Choose Your Login Route

```
Choose one:
├─ Web browser?       → Use /login (Fortify)
├─ Mobile app?        → Use /api/auth/login (Sanctum)
└─ Third-party API?   → Use /api/auth/login (Sanctum)
```

## 📋 .env Configuration (Key Variables)

```env
# Application
APP_NAME=PawMatch
APP_URL=http://localhost:8000
APP_ENV=local

# Database
DB_CONNECTION=sqlite

# Authentication
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Email (Development)
MAIL_MAILER=log

# Broadcasting (Real-time)
BROADCAST_CONNECTION=reverb

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## 🧪 Test Commands

```bash
# Run all tests
php artisan test --compact

# Run API auth tests only
php artisan test tests/Feature/Api/AuthTest.php --compact

# Run specific test
php artisan test tests/Feature/Api/AuthTest.php --filter="Login"

# Show test names
php artisan test --list
```

## 📂 Key Files

- `routes/web.php` - Web routes (Fortify)
- `routes/api.php` - API routes (Sanctum)
- `config/auth.php` - Auth configuration
- `app/Http/Controllers/Api/AuthController.php` - API auth logic
- `.env` - Your environment variables
- `.env.example` - Template with all variables

## ✅ Verify Setup

```bash
# Check current configuration
php artisan config:show app

# List all routes
php artisan route:list

# Check database connection
php artisan migrate:status

# Run tests
php artisan test --compact
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "No such table" | Run: `php artisan migrate` |
| Login not working | Check database has users table |
| API returns 401 | Include Bearer token header |
| Emails not sending | MAIL_MAILER=log logs to console |
| Google OAuth fails | Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirect URI |

## 🌐 All API Endpoints

### Core Features (24+ endpoints)
```
GET    /api/matching/recommendations
POST   /api/matching/interaction
GET    /api/matching/matches

GET    /api/analytics/summary

GET    /api/notifications
POST   /api/notifications/{id}/read

GET    /api/message-wall
POST   /api/message-wall/posts
POST   /api/message-wall/posts/{id}/like
POST   /api/message-wall/posts/{id}/comment
POST   /api/message-wall/posts/{id}/share
POST   /api/message-wall/posts/{id}/save
POST   /api/message-wall/users/{id}/follow

GET    /api/chat
GET    /api/chat/{id}
GET    /api/chat/match/{id}
POST   /api/chat/{id}/messages
POST   /api/chat/{id}/read
```

All require: `Authorization: Bearer {token}` header

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│         PawMatch Application                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Session-based (Web)    Token-based (API)      │
│  ├─ /login              ├─ /api/auth/login     │
│  ├─ /register           ├─ /api/auth/register  │
│  ├─ /logout             ├─ /api/auth/logout    │
│  └─ Inertia React SPA   └─ Mobile Apps         │
│                                                 │
│  Fortify (Web Auth)     Sanctum (API Auth)    │
│  Session Cookies        Bearer Tokens          │
│  SQLite Database        SQLite Database        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 💡 Tips

1. **For web development:** Use `/login` - it's already configured
2. **For mobile development:** Use `/api/auth/login` - returns token
3. **During development:** Keep `APP_DEBUG=true` for detailed errors
4. **For testing:** Seed database with `php artisan db:seed`
5. **To see emails:** Check Laravel logs (MAIL_MAILER=log)
6. **Reset everything:** Delete database and run `php artisan migrate --fresh --seed`

## 📚 Documentation

- Full guide: `.ai/ENV_AND_LOGIN_GUIDE.md`
- API reference: `.ai/api-sanctum-reference.md`
- Sanctum setup: `SANCTUM_IMPLEMENTATION.md`

---

✅ All systems ready! Start with: `composer run dev`
