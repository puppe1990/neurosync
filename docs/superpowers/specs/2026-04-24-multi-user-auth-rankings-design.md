# Multi User Auth Rankings Design

## Goal

Turn NeuroSync into a multi-user app with email/password signup, signin, per-user persisted game results, and global rankings.

## Scope

- Add `/signin` and `/signup` pages using the existing NeuroSync brutalist visual language.
- Protect the main app behind an HTTP-only session cookie.
- Store users and game results in Turso through Drizzle.
- Persist puzzle results to the database for the authenticated user.
- Add rankings using saved results, ordered by score descending.

## Architecture

The app keeps the existing client game shell for interactive play, but wraps it with server-side session checks from the App Router. Server code owns auth, cookies, and database writes. Client code calls route handlers after each puzzle result and renders rankings from a route handler.

## Data Model

- `users`: `id`, `name`, `email`, `passwordHash`, `createdAt`, `updatedAt`.
- `game_results`: `id`, `userId`, `puzzleId`, `category`, `difficulty`, `score`, `accuracy`, `timeSpent`, `createdAt`.

## Auth Behavior

- Signup validates name, email, and password, rejects duplicate emails, hashes passwords, creates a session, and redirects to `/`.
- Signin validates credentials, creates a session, and redirects to `/`.
- Logout deletes the session cookie and redirects to `/signin`.
- The session cookie contains a signed user id payload and is HTTP-only.

## UI Behavior

- Signin and signup use the same brand colors, thick black borders, rounded brutalist cards, and hard shadows as the existing app.
- The header shows the logged-in user's name and a logout button.
- The footer Ranking button opens a real ranking view in the game shell.
- Ranking rows show rank, player name, puzzle, difficulty, score, accuracy, and time.

## Testing

Use Vitest for server-side unit tests. Tests cover signup duplicate protection, signin password validation, result ownership, and ranking ordering.
