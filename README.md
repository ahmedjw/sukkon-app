# Sukoun — Mental Health App

> سكون — _tranquility_. A bilingual (EN / AR) mental wellness platform connecting clients with licensed therapists.

This repository is the **Phase 0** scaffold described in [`Plan.md`](./Plan.md): an Expo + React Native + TypeScript app with the design system, base component library, navigation, and i18n + RTL wired up. No backend, no auth, no real data yet.

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Expo (managed) + React Native 0.74 |
| Language | TypeScript (strict) |
| Navigation | `@react-navigation/native` + bottom tabs |
| i18n | `i18next` + `react-i18next` + `expo-localization` |
| Layout | RTL via `I18nManager.forceRTL` |
| Styling | StyleSheet + design tokens (`src/theme/tokens.ts`) |

## What's in this scaffold

- **Design tokens** matching the brand: `#3CB371` mint, `#0F2C4F` navy, `#FFC93C` yellow.
- **Component library**: `Button`, `IconButton`, `Input`, `PasswordInput`, `Chip`, `Card`, `Avatar`, `RatingStars`, `MoodPicker`, `BannerCTA`, `EmptyState`, `Skeleton`, `Toast`, `BottomSheet`, `TherapistCard`, `SessionCard`, `PodcastRow`.
- **Bottom tab navigator** with the five tabs from the plan: Home / Therapists / Sessions / Community / Podcast.
- **Home screen** wired with greeting, mood picker, instant/scheduled consult banners, and a top-rated therapists list (mock data).
- **Locales** `en.json` and `ar.json`. Locale auto-detected from device, RTL applied for Arabic.

## Run

```bash
yarn install        # or npm install
yarn start          # opens Expo dev tools
yarn ios            # iOS simulator (Mac only)
yarn android        # Android emulator
yarn web            # browser
```

You'll need Node 18+, Watchman (Mac), and Xcode/Android Studio for native builds. The Expo Go app can run this without native tooling.

## Project layout

```
src/
  App.tsx              # providers (theme, i18n, navigation, toast)
  components/          # reusable UI primitives
  i18n/
    index.ts           # i18next setup + RTL helper
    locales/           # en.json, ar.json
  navigation/
    RootNavigator.tsx  # bottom tabs
  screens/
    HomeScreen.tsx
    PlaceholderScreen.tsx
  theme/
    tokens.ts          # colors / radius / space / font / shadow
    ThemeContext.tsx   # useTheme()
index.ts               # Expo entry
app.json               # Expo config
```

## What's next (phases 1–6)

Phase 0 covered. Plan.md lays out the rest:

1. **Phase 1 — Auth & Onboarding**: splash, welcome carousel, sign-up/in, forgot password, social auth, locale switch UI.
2. **Phase 2 — Home & Mood**: persist mood logs, wire to API, top-rated + recommended lists from server.
3. **Phase 3 — Therapists & Booking**: filter sheet, therapist detail, booking flow, Stripe payment.
4. **Phase 4 — Live Consultation**: Daily.co/Twilio video, pre-call lobby, in-call UI, post-call rating.
5. **Phase 5 — Sessions, Podcasts, Community**: players, feed, composer, moderation.
6. **Phase 6 — Polish, QA, Launch**: a11y, perf, E2E, store submission.

## Notes

- `.expo/` and `node_modules/` are gitignored and regenerated on `yarn install`.
- App icons / splash images are referenced in `app.json` but not yet committed — drop PNGs into `assets/` to enable EAS builds.
- Asset paths in mock therapist/session data are placeholders; real images come in Phase 2.
