# Sukoun — Backend Stack & Implementation Plan

> Companion to [`Plan.md`](./Plan.md). Where Plan.md describes the full v1.0 vision (NestJS, PostgreSQL, Stripe, Daily.co, etc.), this document describes the **shippable v0 backend** that powers the React Native app today, plus a clear path to upgrade each piece to the production target.

---

## 1. Goals for v0

1. Replace every mock module under `src/services/api/*` with real HTTP calls.
2. Persist users, mood logs, bookings, community posts, and saved sessions.
3. JWT-based auth (signup / signin / forgot-password stub) with hashed passwords.
4. Seed the database with the same demo therapists, sessions, and podcasts the mobile app already shows so visual parity is preserved.
5. Run **on a fresh laptop with zero external services** — `npm install && npm run db:setup && npm run dev`.
6. Be straight upgradeable to NestJS + PostgreSQL + Stripe later without rewriting the mobile API surface.

---

## 2. Stack — what we shipped vs. what Plan.md targets

| Concern         | v0 (this branch)                                | v1.0 target (Plan.md §3.1)                |
| --------------- | ----------------------------------------------- | ----------------------------------------- |
| Runtime         | Node 22 + TypeScript                            | Node + TypeScript                         |
| Framework       | **Express 4** (minimal, easy to read)           | **NestJS** (modules, DI, guards)          |
| ORM             | **Prisma 5**                                    | Prisma 5 — *no change*                    |
| Database        | **SQLite** file (`server/dev.db`)               | **PostgreSQL 16**                         |
| Auth            | JWT (HS256) + Argon2id password hash            | JWT + refresh tokens, social OAuth        |
| Validation      | Zod 3                                           | Zod or `class-validator`                  |
| File storage    | Local `uploads/` dir (signed URL stub)          | S3 / Cloudflare R2                        |
| Realtime        | (not in v0)                                     | Socket.IO                                 |
| Video           | Stub: returns `videoRoomId = bk-{id}`           | Daily.co or Twilio Video                  |
| Payments        | Stub: marks booking CONFIRMED immediately       | Stripe (PaymentIntent + webhook)          |
| Search          | LIKE queries via Prisma                         | Meilisearch                               |
| Push            | (not in v0)                                     | Firebase Cloud Messaging + APNs           |
| Errors          | JSON error middleware                           | Sentry                                    |
| Logging         | `pino` JSON logs                                | pino + Better Stack ingest                |
| Rate limiting   | `express-rate-limit` (auth + booking)           | Redis-backed distributed limit            |
| CI/CD           | npm scripts                                     | GitHub Actions + EAS                      |
| Hosting         | local dev / Fly.io                              | Fly.io → AWS (HIPAA when needed)          |

The contract between mobile and backend is the same in both cases — only the implementation behind each endpoint changes.

---

## 3. Repository layout

```
sukkon-app/
├── src/                         # React Native app (existing)
│   └── services/api/            # now hits the real backend
└── server/                      # NEW — the backend
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts              # mirrors mock data so the app stays visually identical
    ├── src/
    │   ├── index.ts             # boot
    │   ├── app.ts               # express app wiring
    │   ├── env.ts               # validated env
    │   ├── db.ts                # prisma client singleton
    │   ├── auth/
    │   │   ├── jwt.ts
    │   │   ├── password.ts      # argon2id
    │   │   └── middleware.ts    # requireAuth, optionalAuth
    │   ├── http/
    │   │   ├── error.ts         # centralised error → JSON
    │   │   └── validate.ts      # zod request validator
    │   └── routes/
    │       ├── index.ts         # mounts /v1/*
    │       ├── auth.ts
    │       ├── me.ts            # /me, /me/mood
    │       ├── therapists.ts
    │       ├── bookings.ts
    │       ├── sessions.ts
    │       ├── podcasts.ts
    │       └── community.ts
```

The mobile app gains:

- `src/services/api/client.ts` — real `fetch`-based HTTP client (replaces the mock `createMockClient`)
- `src/services/api/storage.ts` — small AsyncStorage-style wrapper so the JWT survives reloads
- Each `src/services/api/*.ts` module — same signatures, real network calls

---

## 4. Data model (Prisma)

```prisma
// server/prisma/schema.prisma — full file lives in repo
enum Role { CLIENT THERAPIST ADMIN }
enum Gender { MALE FEMALE ANY }
enum Condition { BIPOLAR SCHIZOPHRENIA DEPRESSION ANXIETY ADDICTION FAMILY TRAUMA }
enum BookingMode { instant scheduled }
enum BookingStatus { CONFIRMED COMPLETED CANCELLED }
enum MoodKind { HAPPY EXCITED NEUTRAL ANGRY COOL }

model User {
  id           String   @id @default(cuid())
  role         Role     @default(CLIENT)
  email        String   @unique
  passwordHash String?
  name         String
  avatarUrl    String?
  locale       String   @default("en")
  createdAt    DateTime @default(now())
  moodLogs     MoodLog[]
  bookings     Booking[] @relation("ClientBookings")
  posts        Post[]
  savedSessions SavedSession[]
  therapist    Therapist?
}

model Therapist {
  id              String    @id @default(cuid())
  userId          String?   @unique
  user            User?     @relation(fields: [userId], references: [id])
  name            String
  specialty       String
  yearsExperience Int
  hourlyRateCents Int
  rating          Float     @default(0)
  reviewsCount    Int       @default(0)
  available       Boolean   @default(true)
  verified        Boolean   @default(false)
  gender          Gender    @default(ANY)
  bio             String
  languages       String    // JSON array, e.g. "[\"en\",\"ar\"]"
  problems        String    // JSON array of Condition strings
  nextAvailable   String?
  bookings        Booking[] @relation("TherapistBookings")
  createdAt       DateTime  @default(now())
}

model Booking {
  id           String        @id @default(cuid())
  clientId     String
  therapistId  String
  mode         BookingMode
  startsAt     DateTime
  durationMin  Int
  amountCents  Int
  status       BookingStatus @default(CONFIRMED)
  videoRoomId  String?
  rating       Int?
  tipCents     Int?
  notes        String?
  createdAt    DateTime      @default(now())
  client       User          @relation("ClientBookings", fields: [clientId], references: [id])
  therapist    Therapist     @relation("TherapistBookings", fields: [therapistId], references: [id])
}

model MoodLog {
  id        String   @id @default(cuid())
  userId    String
  mood      MoodKind
  note      String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Session {
  id          String   @id
  title       String
  category    String
  durationMin Int
  description String
  author      String
  saves       SavedSession[]
}

model SavedSession {
  userId    String
  sessionId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  session   Session  @relation(fields: [sessionId], references: [id])
  @@id([userId, sessionId])
}

model Podcast {
  id          String  @id
  title       String
  author      String
  durationMin Int
  category    String
  description String
}

model Post {
  id            String   @id @default(cuid())
  authorId      String?
  authorName    String
  authorAvatarUrl String?
  topic         String
  body          String
  imageUrl      String?
  createdAt     DateTime @default(now())
  author        User?    @relation(fields: [authorId], references: [id])
  likes         PostLike[]
  comments      Comment[]
}

model PostLike {
  postId String
  userId String
  post   Post   @relation(fields: [postId], references: [id])
  @@id([postId, userId])
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  userId    String?
  authorName String
  body      String
  createdAt DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id])
}
```

**Why SQLite for v0?** Prisma supports both SQLite and PostgreSQL with the same client API, the schema above ports cleanly (only `enum` columns become string-typed under SQLite — which is why `languages` and `problems` are stored as JSON strings rather than relational arrays). Switching to PostgreSQL is a one-line `provider = "postgresql"` change plus a `prisma migrate dev`. **No app code changes.**

---

## 5. API surface (`/v1`)

Identical shape to Plan.md §3.4. Every endpoint accepts/returns JSON.

### Auth — `routes/auth.ts`

| Method | Path                  | Body                         | Returns                                       |
| ------ | --------------------- | ---------------------------- | --------------------------------------------- |
| POST   | `/v1/auth/signup`     | `{name,email,password}`      | `{token, user}`                               |
| POST   | `/v1/auth/signin`     | `{email,password}`           | `{token, user}`                               |
| POST   | `/v1/auth/social`     | `{provider:"google"\|...}`  | `{token, user}` — stub; mints a demo user      |
| POST   | `/v1/auth/forgot-password` | `{email}`                | `{ok:true}`                                   |

JWT signed HS256, expiry 30 d. Argon2id (`@node-rs/argon2`) for password hash with default cost.

### Me & mood — `routes/me.ts`

| Method | Path             | Body            | Returns          |
| ------ | ---------------- | --------------- | ---------------- |
| GET    | `/v1/me`         | —               | `User`           |
| PATCH  | `/v1/me`         | partial profile | `User`           |
| POST   | `/v1/me/mood`    | `{mood,note?}`  | `MoodLog`        |
| GET    | `/v1/me/mood`    | —               | `MoodLog[]`      |

### Therapists — `routes/therapists.ts`

| Method | Path                                                      | Notes                                       |
| ------ | --------------------------------------------------------- | ------------------------------------------- |
| GET    | `/v1/therapists?sort=rating&topRated=true`                | Top-rated list (Home)                       |
| GET    | `/v1/therapists?condition=DEPRESSION`                     | Recommended for condition                   |
| GET    | `/v1/therapists?query=&minExp=&maxExp=&gender=&minBudget=&maxBudget=` | Full filter sheet               |
| GET    | `/v1/therapists/:id`                                      | Detail                                      |
| GET    | `/v1/therapists/:id/slots`                                | Available booking slots                     |

### Bookings — `routes/bookings.ts` (auth required)

| Method | Path                          | Body                                | Returns              |
| ------ | ----------------------------- | ----------------------------------- | -------------------- |
| GET    | `/v1/bookings`                | —                                   | `Booking[]`          |
| POST   | `/v1/bookings`                | `{therapistId,mode,startsAt,durationMin}` | `Booking`        |
| PATCH  | `/v1/bookings/:id/cancel`     | —                                   | `Booking`            |
| PATCH  | `/v1/bookings/:id/finish`     | `{rating,tipCents,notes}`           | `Booking`            |
| GET    | `/v1/bookings/:id/room`       | —                                   | `{roomId,token}` (stub) |

### Sessions — `routes/sessions.ts`

| Method | Path                          | Notes                                     |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | `/v1/sessions?curated=special`| “Special for you”                         |
| GET    | `/v1/sessions/popular`        | Hero card                                 |
| GET    | `/v1/sessions?q=...`          | Search                                    |
| GET    | `/v1/sessions/:id`            | Detail (with `saved` flag for current user) |
| POST   | `/v1/sessions/:id/save`       | Toggle save (auth required)               |
| GET    | `/v1/sessions/saved`          | My saved sessions (auth required)         |

### Podcasts — `routes/podcasts.ts`

| Method | Path                                       |
| ------ | ------------------------------------------ |
| GET    | `/v1/podcasts?category=family\|self\|...` |
| GET    | `/v1/podcasts/popular`                     |
| GET    | `/v1/podcasts/recommended`                 |
| GET    | `/v1/podcasts/:id`                         |

### Community — `routes/community.ts`

| Method | Path                                  | Body                          | Auth |
| ------ | ------------------------------------- | ----------------------------- | ---- |
| GET    | `/v1/community/posts?topic=...`       | —                             | optional (sets `likedByMe`) |
| POST   | `/v1/community/posts`                 | `{topic,body,imageUrl?}`      | required |
| POST   | `/v1/community/posts/:id/like`        | —                             | required (toggle) |
| POST   | `/v1/community/posts/:id/comment`     | `{body}`                      | required |

### Health

| Method | Path     | Returns           |
| ------ | -------- | ----------------- |
| GET    | `/v1/healthz` | `{ok:true,now}` |

---

## 6. Auth, security, and the JWT lifecycle (v0)

- Password hashing: `argon2id` with default parameters from `@node-rs/argon2` (memory 19 MiB, t=2, p=1).
- Token: HS256, secret in `JWT_SECRET`, expiry **30 days** (longer than Plan.md target on purpose — v0 has no refresh-token flow yet).
- Mobile keeps the token in `expo-secure-store` (falls back to `AsyncStorage` on web). Sent as `Authorization: Bearer <token>`.
- `requireAuth` middleware decodes the JWT, loads the user, attaches `req.user`. Returns `401` on missing/invalid token.
- `optionalAuth` decodes the token if present; used by `GET /community/posts` so the response can include `likedByMe`.
- `express-rate-limit`: `/v1/auth/*` 10/min per IP, `POST /v1/bookings` 10/min per user, community posts/comments 30/min, likes 60/min, mood logs 30/min per user.
- CORS: open in dev (`origin: true`, no credentials); production refuses to boot with `CORS_ORIGIN=*` — set explicit comma-separated origins. Credentials only sent for explicit origins.
- Production boot guards (`src/env.ts`): placeholder `JWT_SECRET` values are rejected; `POST /v1/auth/social` returns 501 unless `ENABLE_DEV_SOCIAL_AUTH=true` in non-production.
- Password reset is real: `POST /v1/auth/forgot-password` issues a hashed, expiring token (`PasswordResetToken` table, TTL `RESET_TOKEN_TTL_MIN`); `POST /v1/auth/reset-password` consumes it. Email dispatch is a deployment seam (dev builds return `devResetToken`).
- Account deletion: `DELETE /v1/me` removes personal data and anonymizes community content.
- Helmet for sensible default headers.

### Path to v1.0
- Add refresh-token rotation (15-min access + 30-day refresh stored hashed in `RefreshToken` table).
- Move social auth from stub to real OAuth (Google + Facebook + Apple).
- Wire Argon2 params from env so we can tune for the production VM.

---

## 7. Bringing the mobile app onto real data

### 7.1 New `src/services/api/client.ts`

```ts
import { API_BASE_URL } from './config';
import { authStorage } from './storage';

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await authStorage.getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, body?.message ?? res.statusText, body);
  return body as T;
}
```

### 7.2 `API_BASE_URL`

Read from `expo-constants` → `extra.apiBaseUrl`, set in `app.json`:

- **iOS Simulator / web** → `http://localhost:4000/v1`
- **Android emulator** → `http://10.0.2.2:4000/v1`
- **Physical device on LAN** → set `EXPO_PUBLIC_API_BASE_URL=http://<your-LAN-ip>:4000/v1` and restart Expo.

### 7.3 AuthContext

Old `signIn` / `signUp` simulated the response. New ones call `/v1/auth/signup|signin`, store the returned token via `authStorage.setToken`, then keep the user in React state. On boot, the provider calls `GET /v1/me` if a token exists, so refresh keeps you signed in.

### 7.4 Each api/*.ts module

Same exported function names, same return shapes — but bodies replaced with `api(...)` calls. Example:

```ts
// before
export const moodApi = {
  log: input => api('POST /me/mood', () => { /* mock */ }),
};
// after
export const moodApi = {
  log: input => api<MoodLog>(`/me/mood`, { method: 'POST', body: JSON.stringify(input) }),
};
```

Because the function signatures don't change, no screen needs to be touched.

---

## 8. Local dev workflow

```bash
# 1. backend
cd server
cp .env.example .env       # edit JWT_SECRET if you like
npm install
npm run db:setup           # prisma generate + migrate dev + seed
npm run dev                # http://localhost:4000  — pino logs to stdout

# 2. mobile (in another terminal)
cd ..
yarn start                 # Expo
# Press i / a / w as usual
```

`npm run db:reset` wipes the SQLite file and re-seeds — handy when you've made a model change.

---

## 9. Test strategy (deferred from Plan.md §6.3)

v0 ships without a test suite to keep scope small, but the routes are written so that:

- Each route handler is a pure function of `req`/`prisma` — easy to add `supertest` later.
- Validation lives in Zod schemas separate from the handler — those can be unit-tested directly.
- The seed script doubles as fixtures for the future `vitest --integration` runs.

The test additions in Plan.md (`vitest`, `supertest`, Postgres test container, `k6` load test on `/v1/bookings`) go in alongside Phase 3 of the roadmap when payments land.

---

## 10. Migration path to NestJS + PostgreSQL

When the team is ready to graduate from this v0:

1. **Switch DB** — change `provider` to `postgresql`, point `DATABASE_URL` at a Postgres instance, run `prisma migrate deploy`. The schema is portable; only the JSON-string `languages`/`problems` columns become real `String[]` arrays.
2. **NestJS shell** — `nest new apps/api` inside a Turborepo. Move the Prisma client into a `PrismaService`. Each Express route file maps 1:1 to a Nest module (`AuthModule`, `BookingsModule`, …) — same handler logic, wrapped in `@Controller`.
3. **Stripe** — add `payments.module.ts`, swap the `POST /bookings` stub for a `PaymentIntent` create + confirm; store `paymentIntentId` on `Booking`; webhook flips status to `CONFIRMED` on `payment_intent.succeeded`.
4. **Daily.co** — replace the `roomId = bk-{id}` stub with a real Daily room created at booking time; `GET /bookings/:id/room` returns a per-user meeting token.
5. **S3 / R2** — `POST /uploads/sign` returns a pre-signed URL for the avatar / community image / ID-doc upload, called before mobile PUTs the file.
6. **Sentry, PostHog, FCM, Meilisearch** — bolt on per Plan.md §6.4 / §3.1.

None of these require a single screen change in the mobile app.

---

## 11. Definition of done — backend v0

- [x] `BACKEND.md` written
- [x] `server/` scaffolds, installs, migrates, seeds, runs on `localhost:4000`
- [x] `GET /v1/healthz` returns `{ok:true}`
- [x] `POST /v1/auth/signup` + `POST /v1/auth/signin` issue real JWTs
- [x] Mobile `AuthContext` calls real auth and persists the token
- [x] Every screen previously powered by mocks is now powered by `/v1/*`
- [x] Mobile typechecks clean (`yarn typecheck`)
- [ ] (optional) `curl` smoke tests recorded in `server/README.md`

---

_Document version 0.1 — companion to Plan.md, supersedes the “mock services” section._
