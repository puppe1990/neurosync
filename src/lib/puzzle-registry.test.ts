import { describe, expect, test } from 'vitest';
import { PUZZLES } from '@/types';
import {
  getPuzzleById,
  getPuzzleIds,
  isPuzzleId,
  type PuzzleId,
} from './puzzle-registry';

const expectedPuzzleIds = [
  'math-rush',
  'grid-memory',
  'stroop-test',
  'shape-stack',
  'pattern-pursuit',
  'neural-react',
] satisfies PuzzleId[];

describe('puzzle registry', () => {
  test('returns the supported puzzle ids in route order', () => {
    expect(getPuzzleIds()).toEqual(expectedPuzzleIds);
  });

  test('checks whether a candidate value is a supported puzzle id', () => {
    expect(isPuzzleId('math-rush')).toBe(true);
    expect(isPuzzleId('pattern-pursuit')).toBe(true);
    expect(isPuzzleId('unknown-puzzle')).toBe(false);
    expect(isPuzzleId('MATH-RUSH')).toBe(false);
  });

  test('rejects inherited object property names', () => {
    expect(isPuzzleId('toString')).toBe(false);
    expect(isPuzzleId('constructor')).toBe(false);
    expect(getPuzzleById('toString')).toBeUndefined();
  });

  test('returns the matching puzzle config for a supported id', () => {
    const puzzle = getPuzzleById('grid-memory');

    expect(puzzle).toEqual(PUZZLES.find(({ id }) => id === 'grid-memory'));
  });

  test('returns undefined for an unsupported puzzle id', () => {
    expect(getPuzzleById('unknown-puzzle')).toBeUndefined();
  });
});
