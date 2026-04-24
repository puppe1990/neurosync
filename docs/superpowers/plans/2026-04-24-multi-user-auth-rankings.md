# Multi User Auth Rankings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Turso/Drizzle persistence, email/password auth, protected app access, and global rankings to NeuroSync.

**Architecture:** Keep game play in the existing client shell. Add focused server modules for schema, repositories, auth, and sessions, then expose minimal route handlers for current user, results, rankings, and logout.

**Tech Stack:** Next.js App Router, React 19, Drizzle ORM, Turso libSQL, Vitest, bcryptjs, jose.

---

## File Structure

- `src/db/schema.ts`: Drizzle table definitions.
- `src/db/client.ts`: Turso-backed Drizzle client.
- `src/db/repositories.ts`: User, result, and ranking data access functions.
- `src/auth/password.ts`: Password hashing and verification.
- `src/auth/session.ts`: JWT cookie helpers.
- `src/auth/service.ts`: Signup/signin orchestration.
- `src/app/signin/page.tsx`, `src/app/signup/page.tsx`: Auth pages.
- `src/app/actions/auth.ts`: Form server actions.
- `src/app/api/me/route.ts`, `src/app/api/results/route.ts`, `src/app/api/rankings/route.ts`, `src/app/api/logout/route.ts`: App route handlers.
- `src/App.tsx`: Consume server-backed current user, save results, and render rankings.
- `vitest.config.mts`, `src/**/*.test.ts`: Unit tests.

## Tasks

- [ ] Add dependencies and test configuration.
- [ ] Write failing repository tests for duplicate users, result ownership, and rankings.
- [ ] Implement Drizzle schema and repository functions.
- [ ] Write failing auth tests for signup/signin.
- [ ] Implement password hashing, auth service, and session helpers.
- [ ] Add signin/signup pages and server actions.
- [ ] Add route handlers for me, results, rankings, and logout.
- [ ] Update the client app to use authenticated user state, save results, and show rankings.
- [ ] Run `rtk npm test -- --run`, `rtk npm run lint`, `rtk npm run build`.
- [ ] Start the dev server and verify `/signin`, `/signup`, `/`, and rankings in a browser.
