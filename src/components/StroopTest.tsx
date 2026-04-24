/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconMap } from '../icons';
import { Difficulty } from '../types';

interface StroopTestProps {
  difficulty: Difficulty;
  onFinish: (score: number, accuracy: number, timeSpent: number) => void;
}

const COLORS = [
  { name: 'VERMELHO', hex: '#f87171', id: 'red' },
  { name: 'AZUL', hex: '#2563eb', id: 'blue' },
  { name: 'VERDE', hex: '#4ade80', id: 'green' },
  { name: 'AMARELO', hex: '#facc15', id: 'yellow' },
  { name: 'LARANJA', hex: '#f97316', id: 'orange' },
];

export default function StroopTest({ difficulty, onFinish }: StroopTestProps) {
  const [currentChallenge, setCurrentChallenge] = useState<{ text: string, colorHex: string, correctId: string } | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(difficulty === 'EASY' ? 45 : (difficulty === 'HARD' ? 25 : (difficulty === 'CHAMPION' ? 15 : 30)));
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateChallenge = useCallback(() => {
    let textIdx, colorIdx;
    
    if (difficulty === 'EASY') {
      // 50% chance of congruent (text matches color)
      if (Math.random() > 0.5) {
        textIdx = colorIdx = Math.floor(Math.random() * COLORS.length);
      } else {
        textIdx = Math.floor(Math.random() * COLORS.length);
        colorIdx = Math.floor(Math.random() * COLORS.length);
      }
    } else {
      // In congruent is more likely as difficulty increases
      textIdx = Math.floor(Math.random() * COLORS.length);
      colorIdx = Math.floor(Math.random() * COLORS.length);
      
      if (difficulty === 'CHAMPION' && textIdx === colorIdx) {
        // Force incongruent for champion often
        colorIdx = (colorIdx + 1) % COLORS.length;
      }
    }

    setCurrentChallenge({
      text: COLORS[textIdx].name,
      colorHex: COLORS[colorIdx].hex,
      correctId: COLORS[colorIdx].id
    });
    setFeedback(null);
  }, [difficulty]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  useEffect(() => {
    if (timeLeft <= 0) {
      const totalAttemped = score / 10 + mistakes;
      const accuracy = totalAttemped > 0 ? (score/10) / totalAttemped : 0;
      onFinish(score, accuracy, Date.now() - startTime);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish, score, mistakes, startTime]);

  const handleSelection = (selectedId: string) => {
    if (!currentChallenge) return;

    if (selectedId === currentChallenge.correctId) {
      setScore(s => s + 10);
      setFeedback('correct');
      setTimeout(generateChallenge, 150);
    } else {
      setMistakes(m => m + 1);
      setFeedback('wrong');
      // Shake effect or feedback?
      setTimeout(() => setFeedback(null), 300);
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
          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Pontos</span>
          <span className="font-black text-2xl text-brand-orange">{score}</span>
        </div>
      </div>

      <div className="text-center mb-6 h-10 flex items-center justify-center font-black text-sm tracking-widest text-gray-900 border-b-4 border-black w-full italic uppercase">
        QUAL A COR DA FONTE?
      </div>

      <motion.div 
        key={currentChallenge?.text}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          x: feedback === 'wrong' ? [0, -10, 10, -10, 10, 0] : 0 
        }}
        className="bg-white border-4 border-black p-12 w-full text-center rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10 overflow-hidden"
      >
        <h2 
          className="text-5xl font-black uppercase tracking-tighter"
          style={{ color: currentChallenge?.colorHex }}
        >
          {currentChallenge?.text}
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {COLORS.map((color) => (
          <button
            key={color.id}
            onClick={() => handleSelection(color.id)}
            className="p-4 bg-white border-4 border-black rounded-xl font-black text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none uppercase"
          >
            {color.name}
          </button>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        <AnimatePresence>
          {feedback === 'wrong' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-brand-red font-black text-xs uppercase italic"
            >
              Foque na Cor!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
