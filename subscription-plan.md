# Subscription Roadmap

## Goals
- Backend-configurable tiers: Free, VIP, SVIP
- Real-time: match broadcasts, typing indicators, read receipts
- Rich chat: media, typing, read receipts
- Advanced filters gated by tier
- Analytics: swipe patterns, match rates, engagement
- Notifications: in-app + web push
- Featured profiles: manual admin + tier-based boost

## Tier Matrix (Config-Driven)
- Free
  - Daily swipe limit: 30-50
  - Daily super like: 1
  - Limited owner info visibility
  - Basic chat
- VIP
  - Unlimited swipes
  - Daily super like: 3
  - Boost/exposure priority: 3
  - Rewind access
  - Full profile visibility
  - Who likes you access
  - Read receipts (real-time)
  - Silver badge
- SVIP
  - All VIP features
  - Daily super like: 5
  - Boost: 5
  - Media upload limits (up to 100 videos)
  - Gold badge

## Phase 1 - Tier Configuration + Policy Gates
- [ ] Create tier config source (DB + admin seed)
- [ ] Add tier resolver on User (current tier)
- [ ] Add feature flags/limits resolver (swipe limit, super likes, visibility)
- [ ] Enforce swipe limits and super-like limits in matching endpoint
- [ ] Gate owner visibility and Who Likes You
- [ ] Add tier badges for profile/cards

## Phase 2 - WebSocket Match Broadcasts (Reverb)
- [ ] Add match created broadcast event
- [ ] Private channels for user notifications
- [ ] Echo client setup on frontend
- [ ] Real-time match modal and list updates

## Phase 3 - Chat System (Rich)
- [ ] Conversations table (match -> conversation)
- [ ] Messages table (text + media)
- [ ] Realtime typing indicators
- [ ] Read receipts (per message)
- [ ] Message attachments (images, video)
- [ ] UI: conversation list + chat screen

## Phase 4 - Advanced Filters (Paid)
- [ ] Age range filter
- [ ] Breed filter
- [ ] Distance + personality filters
- [ ] Paid filter gating (VIP/SVIP)
- [ ] Save filter preferences

## Phase 5 - Analytics + Notifications + Featured
- [ ] Analytics events (swipe, match, chat)
- [ ] Aggregations (match rate, engagement)
- [ ] In-app notifications (database)
- [ ] Web push notifications
- [ ] Featured profiles (admin + tier boost)

## Completion Notes
- Mark tasks as done when merged and deployed
- Keep config values adjustable without code changes
