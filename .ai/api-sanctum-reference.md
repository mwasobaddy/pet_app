# API & Sanctum Quick Reference

## Endpoints Overview

### Authentication (Public)
- `POST /api/auth/login` - Login with email/password, returns token
- `POST /api/auth/register` - Register new user, returns token

### Protected Endpoints (Require `Authorization: Bearer {token}` header)

**User:**
- `GET /api/user` - Get current authenticated user

**Matching:**
- `GET /api/matching/recommendations` - Get pet recommendations
- `POST /api/matching/interaction` - Record swipe (like/pass/super_like)
- `GET /api/matching/matches` - Get user's matches

**Analytics:**
- `GET /api/analytics/summary` - Get user analytics

**Notifications:**
- `GET /api/notifications` - Get paginated notifications
- `POST /api/notifications/{id}/read` - Mark notification as read

**Message Wall:**
- `GET /api/message-wall` - Get feed with pagination
- `POST /api/message-wall/posts` - Create new post
- `POST /api/message-wall/posts/{id}/like` - Like/unlike post
- `POST /api/message-wall/posts/{id}/comment` - Comment on post
- `POST /api/message-wall/posts/{id}/share` - Share post
- `POST /api/message-wall/posts/{id}/save` - Save/unsave post
- `POST /api/message-wall/users/{id}/follow` - Follow/unfollow user

**Chat:**
- `GET /api/chat` - List conversations
- `GET /api/chat/{id}` - Get conversation by ID
- `GET /api/chat/match/{id}` - Get conversation by match
- `POST /api/chat/{id}/messages` - Send message
- `POST /api/chat/{id}/read` - Mark messages as read

## Mobile Client Implementation

### 1. Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    device_name: 'iPhone 15'
  })
});
const { user, token } = await response.json();
// Store token securely
```

### 2. Subsequent Requests
```javascript
const response = await fetch('/api/matching/recommendations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Handle Token Expiry
```javascript
if (response.status === 401) {
  // Token expired or invalid
  // Redirect to login
}
```

## Important Notes

- Tokens are **per-device** (identified by device_name)
- Email must be verified before login
- Use `POST /api/auth/logout` to revoke current token
- Use `POST /api/auth/tokens/revoke-all` to logout from all devices
- Token format: `1|abc123...` (no expiration by default)
