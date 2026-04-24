/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconMap } from '../icons';
import { Difficulty } from '../types';

import { audio } from '../lib/audio';

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
  const [currentChallenge, setCurrentChallenge] = useState<{
    text: string;
    colorHex: string;
    correctId: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    difficulty === 'EASY'
      ? 45
      : difficulty === 'HARD'
        ? 25
        : difficulty === 'CHAMPION'
          ? 15
          : 30,
  );
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateChallenge = useCallback(() => {
    let textIdx, colorIdx;

    // Dynamic Difficulty: Less congruent entries as score increases
    const performanceFactor = Math.min(0.8, score / 1500);
    const baseCongruentChance =
      difficulty === 'EASY' ? 0.6 : difficulty === 'NORMAL' ? 0.3 : 0.1;
    const congruentChance = baseCongruentChance * (1 - performanceFactor);

    if (Math.random() < congruentChance) {
      textIdx = colorIdx = Math.floor(Math.random() * COLORS.length);
    } else {
      textIdx = Math.floor(Math.random() * COLORS.length);
      colorIdx = Math.floor(Math.random() * COLORS.length);

      // Force incongruent if they happen to be same randomly
      if (textIdx === colorIdx) {
        colorIdx = (colorIdx + 1) % COLORS.length;
      }
    }

    setCurrentChallenge({
      text: COLORS[textIdx].name,
      colorHex: COLORS[colorIdx].hex,
      correctId: COLORS[colorIdx].id,
    });
    setFeedback(null);
  }, [difficulty, score]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  useEffect(() => {
    if (timeLeft <= 0) {
      audio.playComplete();
      const totalAttemped = score / 10 + mistakes;
      const accuracy = totalAttemped > 0 ? score / 10 / totalAttemped : 0;
      onFinish(score, accuracy, Date.now() - startTime);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 5) audio.playTick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish, score, mistakes, startTime]);

  const handleSelection = (selectedId: string) => {
    if (!currentChallenge || feedback) return;

    if (selectedId === currentChallenge.correctId) {
      audio.playCorrect();
      setScore((s) => s + 10);
      setFeedback('correct');
      setTimeout(generateChallenge, 150);
    } else {
      audio.playWrong();
      setMistakes((m) => m + 1);
      setFeedback('wrong');
      // On mistake, we wait a bit longer to show the correct one
      setTimeout(generateChallenge, 800);
    }
  };

  const correctColorName = COLORS.find(
    (c) => c.id === currentChallenge?.correctId,
  )?.name;

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
            Pontos
          </span>
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
          scale: feedback === 'wrong' ? 1.05 : 1,
          opacity: 1,
          x: feedback === 'wrong' ? [0, -10, 10, -10, 10, 0] : 0,
          backgroundColor: feedback === 'wrong' ? '#fee2e2' : '#ffffff',
        }}
        className="bg-white border-4 border-black p-12 w-full text-center rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10 overflow-hidden relative"
      >
        <AnimatePresence>
          {feedback === 'wrong' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-brand-red text-white z-10"
            >
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest mb-1">
                  Deveria ser:
                </p>
                <p className="text-3xl font-black">{correctColorName}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            disabled={feedback === 'wrong'}
            className={`
              p-4 border-4 border-black rounded-xl font-black text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase
              ${feedback === 'wrong' && color.id === currentChallenge?.correctId ? 'bg-brand-green translate-y-[-4px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}
              active:translate-y-[2px] active:shadow-none
              disabled:cursor-not-allowed
            `}
          >
            {color.name}
          </button>
        ))}
      </div>
    </div>
  );
}
