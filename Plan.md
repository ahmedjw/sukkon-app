# Sukoun — Mental Health App

## Detailed Build Plan

> **Sukoun** (سكون — "tranquility") is a mobile mental health platform connecting clients with licensed therapists through instant and scheduled consultations, guided wellness sessions, a community feed, and curated podcasts.

---

## 1. Project Overview

### 1.1 Vision

A bilingual (Arabic / English) mental wellness platform where users can:

- Track their daily mood
- Book instant or scheduled consultations with verified therapists
- Listen to curated podcasts and guided sessions
- Engage with a moderated community
- Filter therapists by experience, gender, problem type, and budget

### 1.2 Core Brand

| Attribute     | Value                                |
| ------------- | ------------------------------------ |
| Name          | Sukoun                               |
| Primary color | `#3CB371` (mint green)               |
| Accent color  | `#0F2C4F` (deep navy)                |
| Highlight     | `#FFC93C` (sunshine yellow)          |
| Surface       | `#FFFFFF` / `#F6F7FB`                |
| Tone          | Warm, calm, optimistic, non-clinical |

### 1.3 Target Users

- **Clients** — individuals seeking mental health support, family/marriage guidance, addiction help
- **Therapists** — licensed psychologists who deliver consultations
- **Admin** — content & verification team

---

## 2. Feature Inventory (mapped from designs)

### 2.1 Onboarding & Auth

- Splash screen with Sukoun logo
- Welcome carousel ("1,655,890 Clients" social-proof slide)
- Sign Up (name, email, password)
- Sign In (email, password, social — Facebook / Twitter / Google)
- Forgot Password flow
- Government-issued ID verification for therapists (Driver's License / Passport / Permanent Resident Card)

### 2.2 Home Tab

- Personalized greeting ("GOOD MORNING, Manar")
- "How Do You Feel Today?" mood picker (5 emoji states)
- Consulting cards: **Instant Session** & **Scheduled Session**
- "Special for you" horizontal carousel
- "Top Rated Doctors" list (avatar, name, specialty, CTA)
- "Recommended for you" by condition (Bipolar, Schizophrenia, Depression, …)

### 2.3 Therapists Tab

- Tabs: **Therapists** / **My Therapist**
- Search bar + filter sheet
- Promo banner ("Choose Best Therapist for a Better Happy Life")
- "Special for you" therapist list with star rating
- Filter bottom sheet — years of experience, gender, problem type, budget
- Therapist card: photo, name, specialty, rating, availability, **Book** CTA

### 2.4 Sessions Tab

- Tabs: **Sessions** / **My Session**
- Search + filter
- Popular Sessions hero carousel (e.g. _Relaxing — Dr. Tom & Dr. Ahmad_)
- Recommended sessions list
- "Special for you" grid (image, title, category, duration)

### 2.5 Community Tab

- "Share your experience" composer
- Topic chips: _Generally / Friends / Health / Community / Marrige_
- Feed of posts (avatar, author, body, image, like + comment counts)

### 2.6 Podcast Tab

- Greeting header ("Hi Manar, Listen to Podcast")
- Category icons: _All / Family / Food / Husbend / Kids / Self / World_
- Popular Podcast list (cover, title, author, duration)
- "Special for you" + "Recommended for you" lists with play CTA

### 2.7 Cross-cutting

- Bottom tab bar — Home / Therapists / Sessions / Community / Podcast
- Notifications (bell with badge)
- Profile / settings
- Booking & payment flow (implied by "Book")
- Video / audio call screen (implied by sessions)

---

## 3. Technical Architecture

### 3.1 Stack Recommendation

| Layer      | Choice                                           | Why                                                     |
| ---------- | ------------------------------------------------ | ------------------------------------------------------- |
| Mobile     | **React Native + Expo (TypeScript)**             | One codebase iOS + Android, fast iteration, OTA updates |
| Navigation | React Navigation (native stack + bottom tabs)    | Standard, well-supported                                |
| State      | Zustand or Redux Toolkit + RTK Query             | Lightweight, typed                                      |
| Forms      | React Hook Form + Zod                            | Type-safe validation                                    |
| Styling    | Tamagui or NativeWind (Tailwind RN)              | Theme tokens, RTL-friendly                              |
| Backend    | **NestJS (Node, TypeScript)**                    | Modular, DI, mature                                     |
| Database   | PostgreSQL + Prisma                              | Relational data, type-safe ORM                          |
| Auth       | Firebase Auth or Auth0 + custom JWT              | Social login out of the box                             |
| Realtime   | Socket.IO or Ably                                | Chat & instant-session signaling                        |
| Media      | Mux (video) + Cloudflare Stream (audio podcasts) | Adaptive streaming                                      |
| Push       | Firebase Cloud Messaging + APNs                  | Cross-platform                                          |
| Payments   | Stripe + Apple/Google IAP                        | Compliant on stores                                     |
| Storage    | AWS S3 / Cloudflare R2                           | Avatars, ID docs, post images                           |
| Search     | Meilisearch                                      | Fast typo-tolerant search of therapists & sessions      |
| Analytics  | PostHog (self-hosted)                            | Privacy-respecting, funnels                             |
| Errors     | Sentry                                           | RN + Node integrated                                    |
| CI/CD      | EAS Build + GitHub Actions                       | Native builds & store submission                        |
| Infra      | Fly.io or Railway (start) → AWS (scale)          | Low-ops at first                                        |

### 3.2 High-Level System Diagram

```
[ React Native App ] ──HTTPS──▶ [ API Gateway / NestJS ]
        │                           │
        │ WebRTC / Socket.IO        ├── Postgres (users, bookings, posts)
        ▼                           ├── Redis (sessions, rate limit, cache)
[ Daily.co or Twilio Video ]        ├── S3 (media, ID docs)
                                    ├── Meilisearch (discovery)
                                    ├── Mux / CF Stream (podcasts/sessions)
                                    └── Stripe (payments)
```

### 3.3 Data Model (initial Prisma sketch)

```prisma
model User {
  id            String   @id @default(cuid())
  role          Role     // CLIENT | THERAPIST | ADMIN
  email         String   @unique
  passwordHash  String?
  name          String
  avatarUrl     String?
  locale        String   @default("en") // "en" | "ar"
  createdAt     DateTime @default(now())

  moodLogs      MoodLog[]
  bookingsAsClient    Booking[] @relation("ClientBookings")
  therapistProfile    Therapist?
  posts         Post[]
}

model Therapist {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  specialty       String
  yearsExperience Int
  bio             String
  hourlyRate      Int        // cents
  rating          Float    @default(0)
  available       Boolean  @default(true)
  verified        Boolean  @default(false)
  verificationDocs Document[]
  bookings        Booking[] @relation("TherapistBookings")
}

model Booking {
  id           String   @id @default(cuid())
  clientId     String
  therapistId  String
  type         BookingType  // INSTANT | SCHEDULED
  startsAt     DateTime
  durationMin  Int
  status       BookingStatus // PENDING | CONFIRMED | COMPLETED | CANCELLED
  amountCents  Int
  videoRoomId  String?
  client       User       @relation("ClientBookings", fields: [clientId], references: [id])
  therapist    Therapist  @relation("TherapistBookings", fields: [therapistId], references: [id])
}

model MoodLog {
  id        String  @id @default(cuid())
  userId    String
  mood      Mood    // HAPPY | EXCITED | NEUTRAL | ANGRY | COOL
  note      String?
  createdAt DateTime @default(now())
  user      User    @relation(fields: [userId], references: [id])
}

model Session  { id String @id  /* guided wellness session */ }
model Podcast  { id String @id }
model Post     { id String @id  /* community */ }
model Document { id String @id  /* therapist ID verification */ }
```

### 3.4 API Surface (REST, versioned `/v1`)

```
POST   /auth/signup
POST   /auth/signin
POST   /auth/social/{google|facebook|twitter}
POST   /auth/forgot-password

GET    /me
PATCH  /me
POST   /me/mood

GET    /therapists?gender=&minExp=&maxExp=&minBudget=&problem=
GET    /therapists/:id
POST   /therapists/:id/book

GET    /bookings           # mine
PATCH  /bookings/:id       # cancel/reschedule
GET    /bookings/:id/room  # video room token

GET    /sessions           # guided wellness
GET    /sessions/:id
POST   /sessions/:id/save

GET    /podcasts?category=
GET    /podcasts/:id

GET    /community/posts?topic=
POST   /community/posts
POST   /community/posts/:id/like
POST   /community/posts/:id/comment

# Therapist portal
POST   /therapist/onboard
POST   /therapist/verify-id  # upload Driver's License / Passport / PR Card
GET    /therapist/schedule
POST   /therapist/availability
```

---

## 4. Design System

### 4.1 Tokens

```ts
export const tokens = {
  color: {
    primary: "#3CB371",
    primaryDk: "#2E8B57",
    navy: "#0F2C4F",
    yellow: "#FFC93C",
    surface: "#FFFFFF",
    surfaceAlt: "#F6F7FB",
    textHi: "#0F2C4F",
    textMd: "#5B6472",
    textLo: "#9AA1AC",
    danger: "#E5484D",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48 },
  font: {
    family: "Poppins, Cairo (Arabic)",
    h1: 28,
    h2: 22,
    h3: 18,
    body: 15,
    caption: 13,
  },
};
```

### 4.2 Component Library

Build these as the foundation — every screen reuses them:

`Button`, `IconButton`, `Input`, `PasswordInput`, `Chip`, `Tab`, `BottomTabBar`, `Card`, `TherapistCard`, `SessionCard`, `PodcastRow`, `MoodPicker`, `RatingStars`, `Avatar`, `BannerCTA`, `BottomSheet`, `FilterSheet`, `EmptyState`, `Skeleton`, `Toast`.

### 4.3 RTL & Localization

- All layouts must work in RTL (`I18nManager.forceRTL`)
- Arabic font: **Cairo** or **Tajawal**
- Use `i18next` with `en.json` / `ar.json`
- Mirror chevrons, back arrows, progress

---

## 5. Roadmap — 6 phases, ~14 weeks

### Phase 0 — Setup (Week 1)

- Monorepo (Turborepo): `apps/mobile`, `apps/api`, `packages/ui`, `packages/types`
- ESLint, Prettier, Husky, conventional commits
- Sentry, PostHog, EAS, Expo dev client
- Figma design system import → tokens
- Postgres + Prisma scaffold, seed script
- CI: lint + test + build on every PR

**Deliverable:** running blank app + healthcheck API + first deploy.

### Phase 1 — Auth & Onboarding (Weeks 2–3)

- Splash, welcome carousel
- Sign up / Sign in / Forgot password
- Social auth
- Profile creation
- Locale switch (EN / AR) with RTL
- Push permission prompt

**Deliverable:** users can register, sign in, switch language, land on Home.

### Phase 2 — Home & Mood (Week 4)

- Home screen UI
- Mood picker → POST `/me/mood`
- Consulting cards navigate to booking stub
- "Top Rated Doctors" + "Recommended for you" wired to API
- Skeleton + empty + error states

**Deliverable:** functional Home with real data.

### Phase 3 — Therapists & Booking (Weeks 5–7)

- Therapists list + filter sheet (experience / gender / problem / budget)
- Therapist detail screen
- Booking flow: pick slot → confirm → pay (Stripe) → confirmation
- "My Therapist" tab — past + upcoming
- Therapist onboarding portal (web first)
- ID verification upload (Driver's License / Passport / PR Card)
- Admin verification queue

**Deliverable:** end-to-end paid booking with verified therapists.

### Phase 4 — Live Consultation (Weeks 8–9)

- Integrate Daily.co (or Twilio Video) SDK
- Pre-call lobby (mic / cam check)
- In-call UI (mute, camera, end, chat)
- Post-call: rating + tip + notes
- Therapist dashboard: today's calls, no-show handling

**Deliverable:** clients can join scheduled & instant video sessions.

### Phase 5 — Sessions, Podcasts, Community (Weeks 10–12)

- Guided sessions player (audio/video, save, recently-played)
- Podcasts: category filter, mini-player, background playback
- Community: feed, composer, topic chips, like + comment, image upload
- Moderation tools (report, hide, admin review)

**Deliverable:** content & community fully functional.

### Phase 6 — Polish, QA, Launch (Weeks 13–14)

- Accessibility pass (VoiceOver / TalkBack, contrast, dynamic type)
- Performance (FlashList, image caching, bundle splitting)
- E2E tests (Maestro or Detox) for top 5 flows
- Beta via TestFlight + Play Internal
- Privacy policy, ToS, GDPR data export & delete
- App Store + Play Store submission
- Crash-free rate ≥ 99.5% before release

**Deliverable:** v1.0 in production.

---

## 6. Quality, Security, Compliance

### 6.1 Security

- All traffic TLS 1.3
- Argon2id for passwords, JWT (short) + refresh token (httpOnly)
- Rate limiting (Redis) on auth & booking
- Signed S3 URLs for ID documents — encrypted at rest, deleted after verification
- Audit log on every therapist/admin action

### 6.2 Privacy & Compliance

- **GDPR** — explicit consent, data export, right to erasure
- **HIPAA-aware** — if launching in the US, sign BAAs with hosting & video provider
- Store therapy notes encrypted (KMS envelope encryption)
- Minors: gate sign-up by DOB, no service to under-18 without guardian consent
- Cookie/tracking prompt; minimum data collection by default

### 6.3 Testing

| Layer           | Tool                                | Target                                                 |
| --------------- | ----------------------------------- | ------------------------------------------------------ |
| Unit            | Vitest / Jest                       | ≥ 80% on business logic                                |
| Component       | React Native Testing Library        | top components                                         |
| API integration | Supertest + Postgres test container | every endpoint                                         |
| E2E mobile      | Maestro                             | sign-in, booking, call join, post create, podcast play |
| Load            | k6                                  | 500 RPS booking endpoint without degradation           |

### 6.4 Observability

- Sentry for crashes (mobile + API)
- PostHog funnels: signup → first mood log → first booking → first call
- Structured JSON logs, request-id propagation
- Health endpoints + uptime monitor (Better Stack)

---

## 7. Risks & Mitigations

| Risk                          | Mitigation                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Therapist supply early on     | Seed launch in one city; manual recruiting before public release                                                                           |
| Video call quality            | Use a managed provider (Daily/Twilio) — don't roll your own WebRTC                                                                         |
| Crisis scenarios (self-harm)  | Keyword detection in chat → in-app banner with hotlines + escalation to on-call therapist; never let the app pretend to handle emergencies |
| Payment disputes              | Clear cancellation policy, hold-and-capture on Stripe, dispute handling SOP                                                                |
| App Store rejection (medical) | Disclose clearly that Sukoun is **not** a substitute for emergency care; include licensing info per region                                 |
| RTL bugs                      | RTL snapshot tests + native-Arabic QA tester from day one                                                                                  |

---

## 8. Open Questions for the Product Owner

1. **Geographic launch market(s)?** This drives compliance (HIPAA vs GDPR vs local), payment provider, and therapist licensing rules.
2. **Pricing model** — per-session, subscription, or hybrid?
3. **Are sessions / podcasts gated** behind a subscription, or free with paid consultations?
4. **Therapist marketplace or curated panel?** Affects onboarding effort and trust signals.
5. **Insurance billing** in v1, or out of scope?
6. **Crisis policy** — do we maintain an on-call therapist rotation or only redirect to public hotlines?
7. **Content moderation** — AI-assisted or human-only for the community feed?

---

## 9. Definition of Done — v1.0

- [ ] User can sign up in EN or AR, switch locale, log a mood
- [ ] User can filter, book, pay, and complete a video consultation with a verified therapist
- [ ] User can play at least 20 seeded sessions and 20 podcasts
- [ ] User can post, like, and comment in the community
- [ ] Therapist can onboard, verify ID, set availability, and run a paid call
- [ ] Crash-free sessions ≥ 99.5%, p95 API latency < 400 ms
- [ ] Approved on App Store + Play Store
- [ ] Privacy policy, ToS, data export & delete live

---

_Document version 0.1 — initial plan derived from 11 reference screens._
