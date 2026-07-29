# Duo Tracker

A workout + diet accountability tracker for two people. Each person logs their own workouts and meals, and can see the other person's log in a read-only view — no scrolling through a group chat, no guessing whether your friend actually went to the gym. Just proof, and a little friendly pressure to keep showing up.

Built as a small, personal-use web app: no accounts, no sign-up flow, just two named profiles that share one private backend. It's meant to be forked and personalized, not run as a multi-tenant SaaS — see [Personalizing it](#personalizing-it) below.

## What it does

- **Log a workout** — pick from a shared list of workout options, check off exercises as you go, add a note and a photo, and optionally add your own exercises on top of the preset list for that day.
- **Log your diet** — add meals (breakfast/lunch/dinner/snack) with a description and an optional photo.
- **View the other person's day** — a read-only, day-by-day view of their logged workout and meals, written as plain-language summaries ("Alex completed Push Day today: Bench Press, Overhead Press, Lateral Raises.") rather than raw data.
- **Calendar + streaks** — a month view with a dot on every day you logged a workout, plus this-week / this-month / streak counters.

## Tech stack

- [Vite](https://vite.dev/) + React 19 + TypeScript
- [React Router](https://reactrouter.com/) (hash-based routing, so it works on any static host with no server-side routing config)
- [Firebase](https://firebase.google.com/): Firestore (data), Anonymous Auth (a lightweight gate — not real accounts)
- [Cloudinary](https://cloudinary.com/): free-tier photo hosting (Firebase Storage now requires a paid plan; Cloudinary's free tier doesn't)

Both Firebase and Cloudinary have generous free tiers that comfortably cover two people logging daily — this app is not designed to scale past that, and doesn't need to.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**. Analytics isn't needed — skip it.
2. Once created, click the **`</>`** (web) icon to register a web app. Leave "Also set up Firebase Hosting" checked if you plan to deploy with Firebase Hosting.
3. Copy the `firebaseConfig` values it shows you — you'll need them in step 4.
4. In the left sidebar: **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**.
5. In the left sidebar: **Build → Firestore Database → Create database**. Pick a location close to you, start in **production mode**.
6. Deploy the included security rules: open the **Rules** tab in Firestore and paste in the contents of [`firestore.rules`](./firestore.rules), then **Publish**.

### 3. Create a Cloudinary account (for photo uploads)

1. Sign up free at [cloudinary.com](https://cloudinary.com) — no card required.
2. Your **Cloud Name** is shown on your dashboard.
3. Go to **Settings → Upload → Upload presets → Add upload preset**. Set **Signing Mode** to **Unsigned** (required — this lets the app upload directly from the browser). Save it and note the preset name.

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from steps 2 and 3:

```bash
cp .env.example .env.local
```

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

`.env.local` is gitignored — never commit real credentials. (Firebase's client-side API key isn't a secret in the traditional sense — it's safe to expose in a deployed app — but there's no reason to commit it to source control either.)

### 5. Run it

```bash
npm run dev
```

## Personalizing it

This is meant to be forked and made your own. Everything below can be changed without touching the app's structure.

### Your names and avatars

Edit **`src/config.ts`**:

```ts
export const appName = "Duo Tracker";

export const PEOPLE: Record<Person, { name: string; icon: string }> = {
  personA: { name: "Alex", icon: personAIcon },
  personB: { name: "Sam", icon: personBIcon },
};
```

Change the `name` fields to your own names, and swap `src/assets/icons/person-a.png` / `person-b.png` for your own avatar images (square, roughly 200×200px works well — simple line-art or a photo both work fine).

Internally the two profiles are always called `personA` and `personB` (used in URLs and the database) — you only need to change the display names above, not the code that references them.

### Your workout plan

Edit **`src/data/seedPlan.ts`**. This is the shared list of workout options both people pick from when logging a workout — it ships with an example Push/Pull/Legs split, but it's just data:

```ts
{
  id: "t1",
  order: 1,
  name: "Push Day",
  location: "Gym",
  exercises: [
    ex("t1", 1, "Bench Press", "Chest", "Gym", "4", "8-10"),
    // ...
  ],
},
```

Add, remove, or rewrite templates freely — `location` is `"Home" | "Gym" | "Rest"`, sets/reps are free-text strings (so "12-15" or "45 sec" both work). Anyone using the app can also add one-off custom exercises on top of this list from the logging screen itself, without editing code.

### Colors and fonts

Color variables live at the top of **`src/index.css`** (`--color-background`, `--color-surface`, `--color-accent`, etc.). The app font is bundled at `src/assets/fonts/Sreda-Regular.ttf` and loaded via `@font-face` in `src/index.css` — swap in your own `.ttf`/`.woff2` and update the `font-family` declaration to change it.

## Deploying

The app builds to static files (`npm run build` → `dist/`), so it can be hosted anywhere that serves static sites. Firebase Hosting is a natural fit since you're already using Firebase:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # point it at the dist/ folder, configure as a single-page app
npm run build
firebase deploy --only hosting
```

Because routing is hash-based (`/#/personA/logs`), there's no server-side route configuration needed — any static host works.

## Project structure

```
src/
  config.ts              — names, avatars, app name (the file you personalize)
  data/
    types.ts              — data model
    seedPlan.ts            — the workout plan (the other file you personalize)
    dateUtils.ts
    AppDataContext.tsx     — real-time Firestore subscriptions, shared app state
  firebase/
    config.ts              — Firebase SDK init
    workoutLogs.ts, meals.ts — Firestore read/write helpers
    storage.ts              — Cloudinary photo upload
  pages/
    ModeChooser.tsx         — front page (pick a profile)
    ProfileHome.tsx         — per-profile hub (My Logs / Their Log)
    CalendarHome.tsx        — calendar + streaks
    DayView.tsx             — Workout/Diet tabs for a given day (input)
    WorkoutSession.tsx      — exercise checklist for one workout
    ViewOtherProfile.tsx    — read-only view of the other person's day
```
