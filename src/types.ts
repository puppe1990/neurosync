/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PuzzleCategory =
  | 'Arithmetic'
  | 'Memory'
  | 'Logic'
  | 'Spatial'
  | 'Visual'
  | 'Reaction';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'CHAMPION';

export interface PuzzleResult {
  puzzleId: string;
  category: PuzzleCategory;
  difficulty: Difficulty;
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
  lastChallengeDate?: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface RankingEntry {
  rank: number;
  id: string;
  userId: string;
  playerName: string;
  puzzleId: string;
  category: string;
  difficulty: string;
  score: number;
  accuracy: number;
  timeSpent: number;
  createdAt: string;
}

export interface TutorialStep {
  text: string;
  target?: string; // Optional element to highlight
}

export interface PuzzleConfig {
  id: string;
  name: string;
  category: PuzzleCategory;
  description: string;
  icon: string;
  tutorial?: TutorialStep[];
}

export const PUZZLES: PuzzleConfig[] = [
  {
    id: 'math-rush',
    name: 'Cálculo Rápido',
    category: 'Arithmetic',
    description:
      'Resolva operações aritméticas simples o mais rápido possível.',
    icon: 'Calculator',
    tutorial: [
      { text: 'Observe a operação matemática no centro da tela.' },
      { text: 'Use o teclado numérico para digitar o resultado correto.' },
      { text: 'O jogo avança automaticamente assim que você acerta!' },
    ],
  },
  {
    id: 'grid-memory',
    name: 'Memória Visual',
    category: 'Memory',
    description: 'Memorize a posição dos blocos que aparecem na tela.',
    icon: 'Grid3X3',
    tutorial: [
      {
        text: 'Primeiro, alguns blocos ficarão destacados. Tente memorizar suas posições.',
      },
      {
        text: 'Quando eles desaparecerem, clique nos espaços vazios para revelar os blocos.',
      },
      { text: 'Acerte todos para subir de nível e ganhar mais tempo.' },
    ],
  },
  {
    id: 'stroop-test',
    name: 'Conflito de Cores',
    category: 'Logic',
    description: 'Identifique a cor da palavra, ignorando o texto escrito.',
    icon: 'Palette',
    tutorial: [
      {
        text: 'Uma palavra colorida aparecerá no centro. IGNORE o que está escrito.',
      },
      { text: 'Olhe apenas para a COR da fonte.' },
      { text: 'Selecione o botão que nomeia a COR correta.' },
    ],
  },
  {
    id: 'shape-stack',
    name: 'Rotação Mental',
    category: 'Spatial',
    description: 'Determine se as formas rotacionadas são idênticas.',
    icon: 'RotateCw',
    tutorial: [
      { text: 'Duas grades com padrões de blocos aparecerão lado a lado.' },
      {
        text: 'A grade da direita pode estar rotacionada em 90°, 180° ou 270°.',
      },
      { text: 'Decida se o padrão de blocos é EXATAMENTE o mesmo ou não.' },
    ],
  },
  {
    id: 'pattern-pursuit',
    name: 'Pattern Pursuit',
    category: 'Visual',
    description: 'Encontre o ícone intruso na grade o mais rápido possível.',
    icon: 'Search',
    tutorial: [
      { text: 'Uma grade de ícones aparecerá na tela.' },
      { text: 'Todos os ícones são iguais, EXCETO UM.' },
      { text: 'Clique no ícone diferente para avançar e ganhar pontos.' },
    ],
  },
  {
    id: 'neural-react',
    name: 'Neural React',
    category: 'Reaction',
    description:
      'Teste sua velocidade de reação. Clique assim que a cor mudar!',
    icon: 'Zap',
    tutorial: [
      { text: 'Aguarde a tela ficar VERDE.' },
      { text: 'Assim que a cor mudar, CLIQUE o mais rápido que puder.' },
      { text: 'Tente bater seu recorde de milissegundos!' },
    ],
  },
];
