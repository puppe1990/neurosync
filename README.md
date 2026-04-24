# NeuroSync

NeuroSync is a cognitive training app built with Next.js, React, Tailwind CSS, and Motion. It includes short interactive exercises for arithmetic speed, memory, color conflict, spatial reasoning, visual search, and reaction time.

![NeuroSync home screen](docs/assets/neurosync-home.png)

## Features

- Daily challenge flow with local streak tracking
- Multiple puzzle modes with difficulty selection
- Tutorial overlays for supported games
- Local browser storage for scores and session history
- Brutalist visual style with animated UI transitions

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Motion
- Lucide React

## Run Locally

**Prerequisite:** Node.js

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

Game progress is stored locally in the browser under `neurosync_stats`.
