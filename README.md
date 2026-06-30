# Lifting Tracker

A simple, fast workout logger built with React + TypeScript + Vite. Log your lifts,
track sets/reps/weight, and review your training history. All data is stored locally
in your browser (localStorage) — no account or backend required.

## Features

- **Log workouts** — pick from a library of common exercises, add sets with weight & reps
- **kg / lbs** unit support per workout
- **Stats dashboard** — total workouts, workouts this week, total sets, total volume
- **History** — review past workouts with per-exercise set breakdowns and volume
- **Local persistence** — everything saved to `localStorage`, survives reloads

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically http://localhost:5173).

## Build

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

## Project structure

```
src/
  components/      LogWorkout, WorkoutCard, Stats
  hooks/           useWorkouts (localStorage-backed state)
  data/            default exercise library
  types/           shared TypeScript interfaces
  App.tsx          top-level layout & routing between views
```

## Roadmap ideas

- Per-exercise personal records & progress charts
- Custom exercises
- Rest timers
- Export / import data (JSON)
- Workout templates / routines
