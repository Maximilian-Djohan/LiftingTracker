# 🏋️ Lifting Tracker

A simple, mobile-friendly web app to track your workouts — log exercises, reps,
and weight, pick from a built-in exercise library, and browse your workout
history. No accounts, no servers: all your data is stored privately on your
device.

## Features

- **Log workouts** — pick a date, add exercises, and record reps + weight for
  each set. Everything auto-saves as you type.
- **Exercise library** — 70+ built-in exercises organized by muscle group
  (chest, back, shoulders, legs, arms, core…), with search and filtering. Add
  your own custom exercises too.
- **Workout history** — review past workouts by date, with per-exercise set
  breakdowns and total volume.
- **kg / lb toggle** — switch weight units anytime.

## How it works

This is a zero-dependency static web app (plain HTML/CSS/JavaScript). Your data
lives in your browser's `localStorage`, so it stays on this device and works
offline once loaded. Exercise photos are loaded on demand from the open-source
[free-exercise-db](https://github.com/yuhonas/free-exercise-db) and need an
internet connection; if an image can't load, a muscle-group icon is shown
instead.

## Running it

**Option 1 — open the file directly**

Just open `index.html` in any browser.

**Option 2 — serve locally** (recommended)

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

**Option 3 — GitHub Pages**

Push this repo and enable GitHub Pages (Settings → Pages → deploy from the
branch root). Your tracker will be live at
`https://<username>.github.io/<repo>/`.

> ⚠️ Because data is stored per-browser, your history won't sync across devices
> or browsers. Clearing your browser data will erase it.

## Project structure

```
index.html        App shell + bottom tab navigation
css/styles.css    Mobile-first dark theme
js/exercises.js   Built-in exercise library data
js/storage.js     localStorage persistence layer
js/app.js         App logic + rendering
```
