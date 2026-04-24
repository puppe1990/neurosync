# Game Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose each cognitive game through real locale-aware App Router URLs for details and gameplay while preserving the existing scoring flow.

**Architecture:** Add a dynamic `/{locale}/games/[gameId]` route tree with a detail page and a nested `/play` page. Extract the existing puzzle-detail and training logic from `src/App.tsx` into focused reusable components and shared helpers so the homepage and routed pages use the same game registry, validation, and result persistence behavior.

**Tech Stack:** Next.js 16 App Router, React 19, next-intl, TypeScript, Vitest

---

## File Structure

- Create: `src/lib/puzzle-registry.ts`
  Central puzzle lookup, slug validation, and localized puzzle metadata helpers.
- Create: `src/components/PuzzleDetailPageClient.tsx`
  Routed detail UI for a single puzzle, including difficulty picker and tutorial trigger.
- Create: `src/components/PuzzlePlayPageClient.tsx`
  Routed gameplay UI for a single puzzle, including result persistence and post-game navigation.
- Create: `src/app/[locale]/games/[gameId]/page.tsx`
  Server page for puzzle detail route.
- Create: `src/app/[locale]/games/[gameId]/play/page.tsx`
  Server page for puzzle gameplay route.
- Create: `src/app/[locale]/games/[gameId]/loading.tsx`
  Route-level loading UI for dynamic game transitions.
- Modify: `src/i18n/routing.ts`
  Register `/games/[gameId]` and `/games/[gameId]/play`.
- Modify: `src/components/LanguageSwitcher.tsx`
  Preserve supported game paths during locale switching.
- Modify: `src/App.tsx`
  Replace game card and CTA navigation with route-based navigation, and trim duplicated puzzle-detail/training code if no longer needed.
- Modify: `messages/pt-BR.json`
  Add copy for game route chrome if missing.
- Modify: `messages/en.json`
  Add matching English keys.
- Create: `src/lib/puzzle-registry.test.ts`
  Validation tests for allowed puzzle IDs and helper behavior.
- Modify: `src/components/LanguageSwitcher.test.tsx`
  Cover locale switching on dynamic game routes.

### Task 1: Add puzzle registry and route-safe lookup

**Files:**

- Create: `src/lib/puzzle-registry.ts`
- Test: `src/lib/puzzle-registry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from 'vitest';
import { getPuzzleById, getPuzzleIds, isPuzzleId } from '@/lib/puzzle-registry';

describe('puzzle registry', () => {
  test('returns the six supported puzzle ids', () => {
    expect(getPuzzleIds()).toEqual([
      'math-rush',
      'grid-memory',
      'stroop-test',
      'shape-stack',
      'pattern-pursuit',
      'neural-react',
    ]);
  });

  test('validates puzzle ids at runtime', () => {
    expect(isPuzzleId('math-rush')).toBe(true);
    expect(isPuzzleId('fake-puzzle')).toBe(false);
  });

  test('returns puzzle config by id', () => {
    expect(getPuzzleById('grid-memory')?.id).toBe('grid-memory');
    expect(getPuzzleById('missing')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/puzzle-registry.test.ts`
Expected: FAIL with module not found for `@/lib/puzzle-registry`

- [ ] **Step 3: Write minimal implementation**

```ts
import { PUZZLES, type PuzzleConfig } from '@/types';

export type PuzzleId =
  | 'math-rush'
  | 'grid-memory'
  | 'stroop-test'
  | 'shape-stack'
  | 'pattern-pursuit'
  | 'neural-react';

const puzzleMap = new Map(PUZZLES.map((puzzle) => [puzzle.id, puzzle]));

export function getPuzzleIds(): PuzzleId[] {
  return PUZZLES.map((puzzle) => puzzle.id as PuzzleId);
}

export function isPuzzleId(value: string): value is PuzzleId {
  return puzzleMap.has(value);
}

export function getPuzzleById(value: string): PuzzleConfig | undefined {
  return puzzleMap.get(value);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/puzzle-registry.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/puzzle-registry.ts src/lib/puzzle-registry.test.ts
git commit -m "feat: add puzzle registry for game routes"
```

### Task 2: Add locale-aware dynamic game routes

**Files:**

- Create: `src/app/[locale]/games/[gameId]/page.tsx`
- Create: `src/app/[locale]/games/[gameId]/play/page.tsx`
- Create: `src/app/[locale]/games/[gameId]/loading.tsx`
- Modify: `src/i18n/routing.ts`

- [ ] **Step 1: Write the route registration change**

```ts
pathnames: {
  '/': '/',
  '/games/[gameId]': '/games/[gameId]',
  '/games/[gameId]/play': '/games/[gameId]/play',
  '/history': '/history',
  '/profile': '/profile',
  '/rankings': '/rankings',
  '/settings': '/settings',
  '/signin': '/signin',
  '/signup': '/signup',
},
```

- [ ] **Step 2: Add the server detail page**

```ts
import { notFound } from 'next/navigation';
import PuzzleDetailPageClient from '@/components/PuzzleDetailPageClient';
import { requireLocaleUserAccess } from '@/app/route-access';
import { getPuzzleById } from '@/lib/puzzle-registry';

export default async function PuzzleDetailPage(
  props: PageProps<'/[locale]/games/[gameId]'>,
) {
  const { locale, gameId } = await props.params;
  const access = await requireLocaleUserAccess(Promise.resolve({ locale }));
  const puzzle = getPuzzleById(gameId);

  if (!puzzle) {
    notFound();
  }

  return (
    <PuzzleDetailPageClient locale={access.locale} puzzle={puzzle} user={access.user} />
  );
}
```

- [ ] **Step 3: Add the server play page**

```ts
import { notFound } from 'next/navigation';
import PuzzlePlayPageClient from '@/components/PuzzlePlayPageClient';
import { requireLocaleUserAccess } from '@/app/route-access';
import { getPuzzleById } from '@/lib/puzzle-registry';

export default async function PuzzlePlayPage(
  props: PageProps<'/[locale]/games/[gameId]/play'>,
) {
  const { locale, gameId } = await props.params;
  const access = await requireLocaleUserAccess(Promise.resolve({ locale }));
  const puzzle = getPuzzleById(gameId);

  if (!puzzle) {
    notFound();
  }

  return (
    <PuzzlePlayPageClient locale={access.locale} puzzle={puzzle} user={access.user} />
  );
}
```

- [ ] **Step 4: Add the route loading state**

```tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="rounded-[2rem] border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-gray-400">
          Loading game route...
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run typecheck**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/games src/i18n/routing.ts
git commit -m "feat: add dynamic app routes for games"
```

### Task 3: Extract puzzle detail UI from `App.tsx`

**Files:**

- Create: `src/components/PuzzleDetailPageClient.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Extract the detail component props**

```ts
interface PuzzleDetailPageClientProps {
  locale: AppLocale;
  puzzle: PuzzleConfig;
  user: AuthenticatedUser;
}
```

- [ ] **Step 2: Move the current detail markup into the new component**

```tsx
<AppRouteShell
  locale={locale}
  summary={t('gameDetailSummary')}
  title={getPuzzleCopy(puzzle).name}
  user={user}
>
  <div className="bg-white brutalist-card p-8">
    {/* existing icon, record, intensity buttons and tutorial modal */}
    <Link
      className="flex-2 bg-brand-blue text-white border-4 border-black rounded-2xl py-6 font-black text-xl tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      href={{ pathname: '/games/[gameId]/play', params: { gameId: puzzle.id } }}
      locale={locale}
    >
      {t('startTraining')}
    </Link>
  </div>
</AppRouteShell>
```

- [ ] **Step 3: Keep difficulty route-driven**

```ts
const [selectedDifficulty, setSelectedDifficulty] =
  useState<Difficulty>('NORMAL');
```

If time allows in the same task, encode difficulty in the play link query string; otherwise keep `NORMAL` here and add difficulty propagation in Task 4.

- [ ] **Step 4: Replace homepage card click navigation**

```tsx
onClick={() => {
  router.push(
    { pathname: '/games/[gameId]', params: { gameId: puzzle.id } },
    { locale },
  );
}}
```

- [ ] **Step 5: Run targeted verification**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/PuzzleDetailPageClient.tsx src/App.tsx
git commit -m "feat: extract routed puzzle detail page"
```

### Task 4: Extract routed gameplay UI and persistence

**Files:**

- Create: `src/components/PuzzlePlayPageClient.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Centralize the game renderer switch**

```tsx
function renderPuzzle() {
  if (puzzle.id === 'math-rush') {
    return (
      <MathRush
        difficulty={difficulty}
        isDaily={false}
        onFinish={handleFinishPuzzle}
      />
    );
  }

  if (puzzle.id === 'grid-memory') {
    return <GridMemory difficulty={difficulty} onFinish={handleFinishPuzzle} />;
  }

  if (puzzle.id === 'stroop-test') {
    return <StroopTest difficulty={difficulty} onFinish={handleFinishPuzzle} />;
  }

  if (puzzle.id === 'shape-stack') {
    return <ShapeStack difficulty={difficulty} onFinish={handleFinishPuzzle} />;
  }

  if (puzzle.id === 'pattern-pursuit') {
    return (
      <PatternPursuit difficulty={difficulty} onFinish={handleFinishPuzzle} />
    );
  }

  return <NeuralReact onFinish={handleFinishPuzzle} />;
}
```

- [ ] **Step 2: Move result persistence logic into the play page**

```ts
async function persistResult(result: PuzzleResult) {
  await fetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      puzzleId: result.puzzleId,
      category: result.category,
      difficulty: result.difficulty,
      score: result.score,
      accuracy: result.accuracy,
      timeSpent: result.timeSpent,
    }),
  });
}
```

- [ ] **Step 3: Keep local stats storage compatible**

```ts
setStats((prev) => ({
  ...prev,
  bestScores: nextBestScores,
  sessions: [...prev.sessions, nextSession],
}));
```

- [ ] **Step 4: Route after finish instead of in-place view switch**

```ts
router.replace(
  { pathname: '/games/[gameId]', params: { gameId: puzzle.id } },
  { locale },
);
```

- [ ] **Step 5: Remove duplicate training-only branch from `App.tsx` if no longer used**

Delete the `currentView === 'PUZZLE_DETAIL'` and `currentView === 'TRAINING'` sections only after homepage navigation no longer depends on them.

- [ ] **Step 6: Run tests**

Run: `npm run lint && npm run test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/PuzzlePlayPageClient.tsx src/App.tsx
git commit -m "feat: add routed gameplay pages"
```

### Task 5: Cover dynamic game-route locale handling

**Files:**

- Modify: `src/components/LanguageSwitcher.tsx`
- Modify: `src/components/LanguageSwitcher.test.tsx`

- [ ] **Step 1: Preserve `/games/[gameId]` and `/games/[gameId]/play`**

```ts
if (/^\/games\/[^/]+$/.test(normalizedPathname)) {
  return normalizedPathname as LocaleSwitcherPathname;
}

if (/^\/games\/[^/]+\/play$/.test(normalizedPathname)) {
  return normalizedPathname as LocaleSwitcherPathname;
}
```

- [ ] **Step 2: Add test coverage**

```ts
test('preserves a game detail route when switching locale', () => {
  usePathnameSpy.mockReturnValue('/en/games/math-rush');
  render(...);
  fireEvent.click(screen.getByRole('button', { name: 'PT-BR' }));
  expect(replaceSpy).toHaveBeenCalledWith('/games/math-rush', { locale: 'pt-BR' });
});

test('preserves a game play route when switching locale', () => {
  usePathnameSpy.mockReturnValue('/en/games/math-rush/play');
  render(...);
  fireEvent.click(screen.getByRole('button', { name: 'PT-BR' }));
  expect(replaceSpy).toHaveBeenCalledWith('/games/math-rush/play', { locale: 'pt-BR' });
});
```

- [ ] **Step 3: Run targeted tests**

Run: `npm run test -- src/components/LanguageSwitcher.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/LanguageSwitcher.tsx src/components/LanguageSwitcher.test.tsx
git commit -m "test: cover locale switching for game routes"
```

## Self-Review

- Spec coverage:
  Game detail route, gameplay route, route validation, homepage navigation, locale preservation, and loading state are all mapped to tasks above.
- Placeholder scan:
  No `TODO`, `TBD`, or “similar to previous task” placeholders remain.
- Type consistency:
  `gameId`, `PuzzleId`, `PuzzleConfig`, `Difficulty`, and locale-aware route literals are referenced consistently across tasks.
