import { PUZZLES, type PuzzleConfig } from '@/types';

const supportedPuzzleIds = [
  'math-rush',
  'grid-memory',
  'stroop-test',
  'shape-stack',
  'pattern-pursuit',
  'neural-react',
] as const;

export type PuzzleId = (typeof supportedPuzzleIds)[number];

const supportedPuzzleIdSet = new Set<string>(supportedPuzzleIds);
const puzzleRegistry = buildPuzzleRegistry();

function buildPuzzleRegistry(): Record<PuzzleId, PuzzleConfig> {
  const registry = {} as Record<PuzzleId, PuzzleConfig>;

  for (const puzzleId of supportedPuzzleIds) {
    registry[puzzleId] = getRequiredPuzzleConfig(puzzleId);
  }

  return registry;
}

function getRequiredPuzzleConfig(puzzleId: PuzzleId): PuzzleConfig {
  const puzzle = PUZZLES.find(({ id }) => id === puzzleId);

  if (puzzle) {
    return puzzle;
  }

  throw new Error(
    `Missing puzzle config for id "${puzzleId}". Expected one of: ${supportedPuzzleIds.join(', ')}`,
  );
}

export function getPuzzleIds(): readonly PuzzleId[] {
  return supportedPuzzleIds;
}

export function isPuzzleId(candidateId: string): candidateId is PuzzleId {
  return supportedPuzzleIdSet.has(candidateId);
}

export function getPuzzleById(puzzleId: PuzzleId): PuzzleConfig;
export function getPuzzleById(puzzleId: string): PuzzleConfig | undefined;
export function getPuzzleById(puzzleId: string): PuzzleConfig | undefined {
  if (!isPuzzleId(puzzleId)) {
    return undefined;
  }

  return puzzleRegistry[puzzleId];
}
