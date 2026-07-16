# MapMyMatcha

> **A portfolio project by [Eli Stein](https://www.linkedin.com/in/eli-stein-37570585/)** — full-stack build: maps, reviews, photo uploads, and auth.

A community-driven, mobile-first web app for discovering, rating, and reviewing matcha cafes. Users can browse cafes on an interactive map, leave reviews, save favorites, and submit new spots.

**Stack:** React + Vite · Firebase (Auth, Firestore, Storage) · Google Maps API · Tailwind CSS

## Features

- **Discover** — Browse matcha cafes near you on an interactive Google Map
- **Cafe Profiles** — Photos, ratings, matcha quality scores, and community reviews per cafe
- **Reviews** — Rate and review cafes; photo upload supported via Firebase Storage
- **Favorites** — Save cafes to a personal favorites list (requires account)
- **Add a Cafe** — Community-submitted cafe entries (open to guests)
- **Auth + Onboarding** — Email/password sign-up with a guided onboarding flow
- **User Profiles** — Edit display name, preferences, and view your review history
- **Guest mode** — Discovery and cafe profiles are publicly accessible without login

## Project Structure

```
src/
  pages/          # Landing, Login, SignUp, Onboarding, Discovery, CafeProfile, Favorites, Profile, AddCafe
  components/
    cafe/         # Cafe cards, rating display
    map/          # Google Maps wrapper and markers
    review/       # Review form and list
    photo/        # Photo upload component
    profile/      # User profile components
    onboarding/   # Multi-step onboarding flow
    layout/       # MobileLayout shell
    common/       # Loader, shared UI
  services/       # Firestore queries: cafes, reviews, users, storage
  context/        # AuthContext (Firebase auth state)
  hooks/          # Custom React hooks
  config/         # Firebase config
```

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env` file with your Firebase and Google Maps credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
```

## Deployment

Deployed via Firebase Hosting (`firebase deploy`). Firestore security rules are in `firestore.rules`; storage rules in `storage.rules`.
