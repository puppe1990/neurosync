/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconMap } from '../icons';
import { Difficulty } from '../types';

import { audio } from '../lib/audio';

interface GridMemoryProps {
  difficulty: Difficulty;
  onFinish: (score: number, accuracy: number, timeSpent: number) => void;
}

type GameState = 'MEMORIZE' | 'PLAY' | 'FEEDBACK';

export default function GridMemory({ difficulty, onFinish }: GridMemoryProps) {
  const [level, setLevel] = useState(
    difficulty === 'EASY'
      ? 1
      : difficulty === 'HARD'
        ? 3
        : difficulty === 'CHAMPION'
          ? 5
          : 2,
  );
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>('MEMORIZE');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    difficulty === 'EASY'
      ? 90
      : difficulty === 'HARD'
        ? 45
        : difficulty === 'CHAMPION'
          ? 30
          : 60,
  );
  const [startTime] = useState(Date.now());
  const [levelStartTime, setLevelStartTime] = useState(0);

  const gridSize = 16; // 4x4

  const nextLevel = useCallback(() => {
    const newSequence: number[] = [];
    let count = 3 + Math.floor(level / 2);
    if (difficulty === 'HARD') count += 1;
    if (difficulty === 'CHAMPION') count += 2;
    count = Math.min(count, 12);

    while (newSequence.length < count) {
      const idx = Math.floor(Math.random() * gridSize);
      if (!newSequence.includes(idx)) newSequence.push(idx);
    }

    setSequence(newSequence);
    setUserSelection([]);
    setGameState('MEMORIZE');

    const memorizeTime = Math.max(
      1000,
      2000 + level * 100 - Math.floor(level / 3) * 500,
    );
    setTimeout(() => {
      setGameState('PLAY');
      setLevelStartTime(Date.now());
    }, memorizeTime);
  }, [level, difficulty]);

  useEffect(() => {
    nextLevel();
  }, [nextLevel]);

  useEffect(() => {
    if (timeLeft <= 0) {
      audio.playComplete();
      onFinish(score, score / (level * 5), Date.now() - startTime);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 5) audio.playTick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish, score, level, startTime]);

  const handleTileClick = (idx: number) => {
    if (gameState !== 'PLAY' || userSelection.includes(idx)) return;

    if (sequence.includes(idx)) {
      audio.playCorrect();
      const nextSelection = [...userSelection, idx];
      setUserSelection(nextSelection);

      if (nextSelection.length === sequence.length) {
        const timeTaken = Date.now() - levelStartTime;
        // FAST PERFORMANCE: Jump 2 levels if solved in < 2s (adjusted for counts)
        const isFast = timeTaken < 1500 + sequence.length * 100;
        const jump = isFast ? 2 : 1;

        setScore((s) => s + level * 10 * jump);
        setLevel((l) => Math.min(20, l + jump));
      }
    } else {
      // Mistake
      audio.playWrong();
      setGameState('FEEDBACK');
      setTimeout(() => {
        setLevel((l) => Math.max(1, l - 1));
        nextLevel();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto">
      <div className="w-full flex justify-between items-center mb-8">
        <div className="bg-black text-white px-4 py-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
          <div className="flex items-center gap-2">
            <IconMap.Timer size={14} className="text-brand-gold" />
            <span className="font-black text-xl italic">{timeLeft}s</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">
            Nível {level}
          </span>
          <span className="font-black text-2xl text-brand-blue">{score}</span>
        </div>
      </div>

      <div className="text-center mb-6 h-10 flex items-center justify-center font-black text-sm tracking-widest text-gray-900 border-b-4 border-black w-full italic uppercase">
        {gameState === 'MEMORIZE' && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            FOCO NO PADRÃO
          </motion.span>
        )}
        {gameState === 'PLAY' && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            RECUPERE O PADRÃO
          </motion.span>
        )}
        {gameState === 'FEEDBACK' && (
          <motion.span
            className="text-brand-red"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            SINAL PERDIDO!
          </motion.span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 w-full aspect-square p-6 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {Array.from({ length: gridSize }).map((_, i) => {
          const isHighlighted =
            sequence.includes(i) &&
            (gameState === 'MEMORIZE' || gameState === 'FEEDBACK');
          const isSelected = userSelection.includes(i);

          return (
            <button
              key={i}
              onClick={() => handleTileClick(i)}
              disabled={gameState !== 'PLAY'}
              className={`
                aspect-square transition-all duration-200 border-2 border-black rounded-lg
                ${isHighlighted ? 'bg-brand-blue scale-95 shadow-none translate-y-1' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}
                ${isSelected ? 'bg-brand-green scale-95 shadow-none translate-y-1' : ''}
                ${!isHighlighted && !isSelected ? 'bg-gray-100 hover:bg-brand-yellow' : ''}
                ${gameState === 'FEEDBACK' && sequence.includes(i) ? 'bg-brand-orange animate-pulse' : ''}
              `}
            />
          );
        })}
      </div>

      <div className="mt-8 flex gap-3 items-center opacity-100 px-4 py-2 bg-black rounded-full">
        {sequence.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border border-white/20 transition-colors ${i < userSelection.length ? 'bg-brand-green shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-gray-800'}`}
          />
        ))}
      </div>
    </div>
  );
}
