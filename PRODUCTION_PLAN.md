# Sukoun — Production Readiness Plan

> Status audit + launch plan, July 2026. Companion to `BACKEND.md` (v0 backend) and `Plan.md` (v1.0 vision).

---

## 1. Current status

### What is solid ✅

**Frontend (Expo SDK 54, React Native)**
- All five tabs are real screens; every `src/services/api/*` module hits the real backend — no leftover mock data.
- i18n complete: `en.json` / `ar.json` have full key parity (~234 leaf keys each).
- Consistent loading / error / empty coverage via `useAsync` / `useMutation`: skeletons, `ErrorState` with retry, `EmptyState`.
- Typechecks clean.

**Backend (Express 4 + Prisma 5 + SQLite)**
- Full documented `/v1` API surface implemented (auth, me/mood, therapists, bookings, sessions, podcasts, community).
- Every mutating route behind `requireAuth`; booking ownership enforced with 404 (no existence leaks).
- Argon2id password hashing, Zod validation on all bodies, helmet, 1 MB JSON cap, real Prisma migrations.
- Typechecks clean; seeded dev database works.

### What blocks launch ❌

| # | Area | Problem |
|---|------|---------|
| B1 | Backend build | `npm start` points at `dist/index.js` but tsc emits `dist/src/index.js` — production start is broken. No `prisma migrate deploy` script. |
| B2 | Backend auth | `POST /v1/auth/social` is an auth **bypass**: no OAuth verification, mints a shared `google@sukoun.app` account for anyone. |
| B3 | Backend config | Placeholder `JWT_SECRET` passes validation; `CORS_ORIGIN=*` + `credentials:true`; no production guards. |
| B4 | Backend lifecycle | No graceful shutdown (SIGTERM → dropped requests, leaked DB connections). |
| B5 | Backend auth | `forgot-password` is a no-op — password reset does not exist. |
| B6 | Backend abuse | No rate limit on bookings, community writes, or mood logging. |
| F1 | Mobile auth | Token stored **in memory only** — every cold start logs the user out. |
| F2 | Mobile config | API URL falls back to `http://localhost:4000` — a release build ships pointing at localhost. No `eas.json`. |
| F3 | Mobile assets | No app icon, no splash image, none configured in `app.json`. |
| F4 | Mobile resilience | No global 401 handling (expired token = stuck session); no root ErrorBoundary. |
| F5 | Store compliance | No tappable Privacy Policy / Terms, no account deletion (Apple 5.1.1(v)), no camera/mic permission strings, no crisis-support resources (mental-health category). |

### Deferred to post-launch (needs third-party accounts)

These require provider accounts and keys the codebase can't self-provision. The v1 launch scope treats them as follows:

- **Payments (Stripe)** — bookings launch as *free / pay-in-session*; the mock checkout copy is kept honest. Integration seam: `POST /v1/bookings` + env keys documented in `server/.env.example`.
- **Video calls (Daily.co / LiveKit)** — the in-call screen stays a preview; room stub returns a clearly-named dev token. Permission strings are shipped now so the binary is ready.
- **Social OAuth (Google/Apple/Facebook)** — buttons hidden in production builds; backend endpoint disabled unless explicitly enabled for dev.
- **Push notifications, Sentry, PostHog** — per `Plan.md` §6.4.

---

## 2. Launch plan (phases)

### Phase 1 — Backend hardening
1. Fix `tsconfig` rootDir / start script; `build` runs `prisma generate`; add `db:deploy` (`prisma migrate deploy`).
2. Production env guards: refuse placeholder `JWT_SECRET`, refuse `CORS_ORIGIN=*` when `NODE_ENV=production`; only send CORS credentials for explicit origins.
3. Gate `auth/social` behind `ENABLE_DEV_SOCIAL_AUTH` (never in production).
4. Graceful shutdown: SIGTERM/SIGINT → `server.close()` → `prisma.$disconnect()`.
5. Rate limits: auth 10/min, booking create 10/min, community + mood writes 30/min.
6. Bug fixes: session-save 404 on unknown id; map Prisma P2002/P2003 in error handler; health check pings DB; therapist condition filter before limit; deterministic podcast popular/recommended ordering.
7. `Dockerfile` + `.dockerignore` for the server.

### Phase 2 — Password reset + account deletion
1. `PasswordResetToken` model + migration.
2. `POST /v1/auth/forgot-password` issues a hashed, expiring token (logged in dev; SMTP-ready seam).
3. `POST /v1/auth/reset-password` consumes it.
4. `DELETE /v1/me` — full account deletion (store-compliance requirement).

### Phase 3 — Frontend auth persistence & resilience
1. `expo-secure-store` token storage (localStorage fallback on web).
2. Global 401 → clear token → return to auth stack.
3. Root `ErrorBoundary` with retry.
4. Reset-password flow in the Forgot Password screen; Delete Account in Settings.

### Phase 4 — Production build config & assets
1. Generated app icon, Android adaptive icon, splash image; wired in `app.json`.
2. `app.json`: version/buildNumber/versionCode, iOS `infoPlist` camera/mic strings, Android permissions.
3. `eas.json` with development / preview / production profiles; production profile requires `EXPO_PUBLIC_API_BASE_URL`.

### Phase 5 — Store compliance & UX cleanup
1. Tappable Terms / Privacy links (env-configurable URLs).
2. Crisis-support section in Settings (localized en/ar).
3. Hide social sign-in buttons in production builds.
4. Fix: hardcoded RTL notice string → i18n; `EmptyState "—"` placeholder copy; remove fake notification badge; remove dead `PlaceholderScreen`.

### Phase 6 — Verification
1. `yarn typecheck` (mobile) and `npm run typecheck` + `npm run build` + `npm start` from `dist/` (server).
2. Smoke tests: signup → signin → me → therapists → booking → cancel → forgot/reset password → delete account.

---

## 3. Launch checklist (operator actions)

Things only the team can do — the code is ready for each:

- [ ] Provision PostgreSQL, set `DATABASE_URL`, run `npm run db:deploy` (schema is portable; regenerate migrations for Postgres per BACKEND.md §10).
- [ ] Set a real `JWT_SECRET` (32+ random bytes) and `CORS_ORIGIN` in production env.
- [ ] Deploy server (Dockerfile provided) and point `EXPO_PUBLIC_API_BASE_URL` at it (HTTPS).
- [ ] Create Expo/EAS project (`eas init`) — fills `extra.eas.projectId`.
- [ ] Host real Privacy Policy + Terms pages; set their URLs in `app.json` → `extra`.
- [ ] Replace generated icon/splash with final brand art (same paths).
- [ ] Stripe / Daily.co / OAuth accounts when those features leave preview.
