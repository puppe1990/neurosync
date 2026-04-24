/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PuzzleCategory = 'Arithmetic' | 'Memory' | 'Logic' | 'Spatial';

export interface PuzzleResult {
  puzzleId: string;
  category: PuzzleCategory;
  score: number;
  timeSpent: number; // in milliseconds
  accuracy: number; // 0 to 1
  timestamp: string;
}

export interface TrainingSession {
  id: string;
  timestamp: string;
  results: PuzzleResult[];
  overallBrainAge: number;
}

export interface UserStats {
  sessions: TrainingSession[];
  bestScores: Record<string, number>;
  dailyStreak: number;
}

export interface PuzzleConfig {
  id: string;
  name: string;
  category: PuzzleCategory;
  description: string;
  icon: string;
}

export const PUZZLES: PuzzleConfig[] = [
  {
    id: 'math-rush',
    name: 'Cálculo Rápido',
    category: 'Arithmetic',
    description: 'Resolva operações aritméticas simples o mais rápido possível.',
    icon: 'Calculator',
  },
  {
    id: 'grid-memory',
    name: 'Memória Visual',
    category: 'Memory',
    description: 'Memorize a posição dos blocos que aparecem na tela.',
    icon: 'Grid3X3',
  },
  {
    id: 'stroop-test',
    name: 'Conflito de Cores',
    category: 'Logic',
    description: 'Identifique a cor da palavra, ignorando o texto escrito.',
    icon: 'Palette',
  },
  {
    id: 'shape-stack',
    name: 'Rotação Mental',
    category: 'Spatial',
    description: 'Determine se as formas rotacionadas são idênticas.',
    icon: 'RotateCw',
  },
];
