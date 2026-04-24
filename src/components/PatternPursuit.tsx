/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconMap } from '../icons';
import { Difficulty } from '../types';
import { audio } from '../lib/audio';

interface PatternPursuitProps {
  difficulty: Difficulty;
  onFinish: (score: number, accuracy: number, timeSpent: number) => void;
}

const POSSIBLE_ICONS = ['Brain', 'Calculator', 'Grid3X3', 'Palette', 'RotateCw', 'Timer', 'Target', 'Zap', 'Search', 'History', 'Trophy', 'Settings', 'X', 'Check'];

export default function PatternPursuit({ difficulty, onFinish }: PatternPursuitProps) {
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(difficulty === 'EASY' ? 60 : (difficulty === 'HARD' ? 30 : 45));
  const [grid, setGrid] = useState<{ icon: string; isTarget: boolean }[]>([]);
  const [startTime] = useState(Date.now());
  const [level, setLevel] = useState(1);

  const gridSize = useMemo(() => {
    if (level < 3) return 3; // 3x3
    if (level < 8) return 4; // 4x4
    if (level < 15) return 5; // 5x5
    return 6; // 6x6
  }, [level]);

  const generateGrid = useCallback(() => {
    const totalCells = gridSize * gridSize;
    const icons = [...POSSIBLE_ICONS];
    const mainIconIdx = Math.floor(Math.random() * icons.length);
    const mainIcon = icons[mainIconIdx];
    icons.splice(mainIconIdx, 1);
    const targetIcon = icons[Math.floor(Math.random() * icons.length)];

    const targetPos = Math.floor(Math.random() * totalCells);
    const newGrid = Array(totalCells).fill(null).map((_, i) => ({
      icon: i === targetPos ? targetIcon : mainIcon,
      isTarget: i === targetPos
    }));

    setGrid(newGrid);
  }, [gridSize]);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onFinish(score, score / (score + mistakes || 1) * 100, (Date.now() - startTime) / 1000);
    }
  }, [timeLeft, onFinish, score, mistakes, startTime]);

  const handleCellClick = (index: number) => {
    if (grid[index].isTarget) {
      audio.playCorrect();
      setScore(s => s + (10 * level));
      setLevel(l => l + 1);
      generateGrid();
    } else {
      audio.playWrong();
      setMistakes(m => m + 1);
      setScore(s => Math.max(0, s - 5));
      // Visual shake or feedback could be added here
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="w-full flex justify-between items-center mb-8">
        <div className="bg-black text-white px-4 py-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
          <div className="flex items-center gap-2">
            <IconMap.Timer size={14} className="text-brand-gold" />
            <span className="font-black text-xl italic">{timeLeft}s</span>
          </div>
        </div>
        <div className="bg-brand-orange border-4 border-black px-4 py-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <IconMap.Trophy size={14} className="text-white" />
            <span className="font-black text-xl text-white italic">SCORE: {score}</span>
          </div>
        </div>
      </div>

      <div 
        className="grid gap-3 w-full aspect-square bg-gray-100 p-4 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        <AnimatePresence mode="popLayout">
          {grid.map((cell, idx) => {
            const Icon = IconMap[cell.icon as keyof typeof IconMap];
            return (
              <motion.button
                key={`${level}-${idx}`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 20 }}
                whileHover={{ scale: 1.05, backgroundColor: '#f3f4f6' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(idx)}
                className="bg-white border-2 border-black rounded-xl flex items-center justify-center transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Icon size={gridSize > 4 ? 24 : 32} className="text-gray-800" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center text-sm font-black uppercase text-gray-500">
        Nível: {level} • Encontre o intruso!
      </div>
    </div>
  );
}
