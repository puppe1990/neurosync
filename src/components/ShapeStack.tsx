/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconMap } from '../icons';
import { Difficulty } from '../types';

import { audio } from '../lib/audio';

interface ShapeStackProps {
  difficulty: Difficulty;
  onFinish: (score: number, accuracy: number, timeSpent: number) => void;
}

type Grid = boolean[][];

export default function ShapeStack({ difficulty, onFinish }: ShapeStackProps) {
  const [targetGrid, setTargetGrid] = useState<Grid>([]);
  const [compareGrid, setCompareGrid] = useState<Grid>([]);
  const [isSame, setIsSame] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(difficulty === 'EASY' ? 45 : (difficulty === 'HARD' ? 25 : (difficulty === 'CHAMPION' ? 20 : 30)));
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const rotateGrid = (grid: Grid): Grid => {
    const size = grid.length;
    const newGrid = Array(size).fill(0).map(() => Array(size).fill(false));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        newGrid[c][size - 1 - r] = grid[r][c];
      }
    }
    return newGrid;
  };

  const gridsMatch = (g1: Grid, g2: Grid): boolean => {
    for (let r = 0; r < g1.length; r++) {
      for (let c = 0; c < g1[r].length; c++) {
        if (g1[r][c] !== g2[r][c]) return false;
      }
    }
    return true;
  };

  const generateChallenge = useCallback(() => {
    // Dynamic difficulty factor based on score
    const dynamicFactor = Math.floor(score / 150);
    
    const size = (difficulty === 'EASY' && dynamicFactor < 4) ? 3 : (difficulty === 'CHAMPION' || dynamicFactor >= 4 ? 4 : 3);
    const grid: Grid = Array(size).fill(0).map(() => Array(size).fill(false));
    
    const baseBlocks = difficulty === 'EASY' ? 3 : (difficulty === 'NORMAL' ? 4 : (difficulty === 'HARD' ? 5 : 6));
    const blockCount = Math.min(size * size - 1, baseBlocks + dynamicFactor);
    
    let placed = 0;
    while (placed < blockCount) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!grid[r][c]) {
        grid[r][c] = true;
        placed++;
      }
    }

    const same = Math.random() > 0.5;
    let compare: Grid;

    if (same) {
      const rotations = Math.floor(Math.random() * 4);
      compare = grid;
      for (let i = 0; i < rotations; i++) {
        compare = rotateGrid(compare);
      }
    } else {
      // Modify one block
      compare = grid.map(row => [...row]);
      let r = Math.floor(Math.random() * size);
      let c = Math.floor(Math.random() * size);
      compare[r][c] = !compare[r][c];
      
      // Ensure it's actually different from all rotations
      let temp = grid;
      let actuallySame = false;
      for(let i=0; i<4; i++) {
        if(gridsMatch(temp, compare)) actuallySame = true;
        temp = rotateGrid(temp);
      }
      if(actuallySame) {
        generateChallenge();
        return;
      }
    }

    setTargetGrid(grid);
    setCompareGrid(compare);
    setIsSame(same);
    setFeedback(null);
  }, [difficulty, score]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  useEffect(() => {
    if (timeLeft <= 0) {
      audio.playComplete();
      const totalAttemped = score / 15 + mistakes;
      const accuracy = totalAttemped > 0 ? (score / 15) / totalAttemped : 0;
      onFinish(score, accuracy, Date.now() - startTime);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 5) audio.playTick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish, score, mistakes, startTime]);

  const handleAnswer = (answer: boolean) => {
    if (feedback) return;

    if (answer === isSame) {
      audio.playCorrect();
      setScore(s => s + 15);
      setFeedback('correct');
      setTimeout(generateChallenge, 200);
    } else {
      audio.playWrong();
      setMistakes(m => m + 1);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 300);
    }
  };

  const renderGrid = (grid: Grid) => (
    <div 
      className="grid gap-1 bg-black p-1 rounded-lg"
      style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
    >
      {grid.map((row, r) => 
        row.map((cell, c) => (
          <div 
            key={`${r}-${c}`}
            className={`w-6 h-6 rounded-sm ${cell ? 'bg-brand-blue' : 'bg-gray-800'}`}
          />
        ))
      )}
    </div>
  );

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
          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Pontos</span>
          <span className="font-black text-2xl text-brand-green">{score}</span>
        </div>
      </div>

      <div className="text-center mb-6 h-10 flex items-center justify-center font-black text-sm tracking-widest text-gray-900 border-b-4 border-black w-full italic uppercase">
        SÃO IDÊNTICOS?
      </div>

      <div className="flex justify-around items-center w-full mb-10 gap-4">
        <motion.div 
          key="target" 
          className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          {renderGrid(targetGrid)}
        </motion.div>

        <div className="text-2xl font-black text-brand-orange animate-pulse">?</div>

        <motion.div 
          key="compare"
          animate={{ x: feedback === 'wrong' ? [0, -5, 5, -5, 5, 0] : 0 }}
          className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          {renderGrid(compareGrid)}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => handleAnswer(true)}
          className="p-6 bg-brand-green border-4 border-black rounded-2xl font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none uppercase"
        >
          SIM
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="p-6 bg-brand-red text-white border-4 border-black rounded-2xl font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none uppercase"
        >
          NÃO
        </button>
      </div>

      <AnimatePresence>
        {feedback === 'wrong' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-brand-red font-black text-xs uppercase italic"
          >
            Erro Cognitivo Detectado
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
