/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { IconMap } from '../icons';
import { Difficulty } from '../types';

import { audio } from '../lib/audio';

interface MathRushProps {
  difficulty: Difficulty;
  onFinish: (score: number, accuracy: number, timeSpent: number) => void;
  isDaily?: boolean;
  seed?: number;
}

export default function MathRush({ difficulty, onFinish, isDaily, seed }: MathRushProps) {
  const [question, setQuestion] = useState<{ text: string; answer: number } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [solvedCount, setSolvedCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Seeded random state
  const seedRef = useRef(seed || 0);
  const seededRandom = useCallback(() => {
    if (!seed) return Math.random();
    seedRef.current = (seedRef.current * 9301 + 49297) % 233280;
    return seedRef.current / 233280;
  }, [seed]);

  const getInitialTime = () => {
    if (isDaily) return 60; // Standardized time for daily challenge
    if (difficulty === 'EASY') return 45;
    if (difficulty === 'HARD') return 25;
    if (difficulty === 'CHAMPION') return 15;
    return 30;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [startTime] = useState(Date.now());

  const generateQuestion = useCallback(() => {
    const ops = ['+', '-'];
    
    // Dynamic Level: Performance-based difficulty modifier
    const dynamicLevel = Math.floor(streak / 5) + Math.floor(solvedCount / 10);
    
    // Unlock multiplication on EASY/NORMAL if performing well
    if (difficulty !== 'EASY' || dynamicLevel > 1) ops.push('*');
    
    const rng = seed ? seededRandom : Math.random;
    const op = ops[Math.floor(rng() * ops.length)];
    let a, b;

    if (op === '*') {
      const baseMax = difficulty === 'CHAMPION' ? 15 : (difficulty === 'HARD' ? 12 : 9);
      const dynamicMax = baseMax + dynamicLevel;
      a = Math.floor(rng() * dynamicMax) + 1;
      b = Math.floor(rng() * (difficulty === 'EASY' ? 5 + dynamicLevel : 10 + Math.floor(dynamicLevel/2))) + 1;
    } else {
      const baseMax = difficulty === 'EASY' ? 20 : (difficulty === 'NORMAL' ? 50 : 100);
      const dynamicMax = baseMax + (dynamicLevel * 10);
      a = Math.floor(rng() * dynamicMax) + 1;
      b = Math.floor(rng() * dynamicMax) + 1;
      if (op === '-' && b > a) [a, b] = [b, a]; 
    }

    const text = `${a} ${op === '*' ? '×' : op} ${b}`;
    let ans = 0;
    if (op === '+') ans = a + b;
    if (op === '-') ans = a - b;
    if (op === '*') ans = a * b;

    setQuestion({ text, answer: ans });
    setUserInput('');
  }, [difficulty, streak, solvedCount]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  useEffect(() => {
    if (timeLeft <= 0) {
      audio.playComplete();
      const timeSpent = Date.now() - startTime;
      const totalAttempted = solvedCount + mistakes;
      const accuracy = totalAttempted > 0 ? solvedCount / totalAttempted : 0;
      onFinish(solvedCount * 100, accuracy, timeSpent);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 5) audio.playTick();
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, solvedCount, mistakes, startTime, onFinish]);

  const handleInput = (val: string) => {
    if (!question) return;

    if (parseInt(val) === question.answer) {
      audio.playCorrect();
      setSolvedCount(s => s + 1);
      setStreak(s => s + 1);
      generateQuestion();
    } else {
      setUserInput(val);
      if (val.length >= question.answer.toString().length || (val.length > 0 && !question.answer.toString().startsWith(val) && val !== '-')) {
         setTimeout(() => {
           if (parseInt(val) !== question.answer) {
             audio.playWrong();
             setUserInput('');
             setMistakes(m => m + 1);
             setStreak(0);
           }
         }, 150);
      }
    }
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto">
      <div className="w-full flex justify-between items-center mb-8">
        <div className="flex flex-col gap-1">
          <div className="bg-black text-white px-4 py-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
            <div className="flex items-center gap-2">
              <IconMap.Timer size={14} className="text-brand-gold" />
              <span className="font-black text-xl italic">{timeLeft}s</span>
            </div>
          </div>
          {isDaily && (
            <div className="text-[10px] font-black uppercase text-brand-orange bg-black px-2 py-0.5 rounded border border-black flex items-center gap-1">
              <IconMap.Zap size={10} />
              Daily Challenge
            </div>
          )}
        </div>
        <div className="bg-brand-green border-4 border-black px-4 py-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <IconMap.Target size={14} className="text-black" />
            <span className="font-black text-xl">{solvedCount}</span>
          </div>
        </div>
      </div>

      <motion.div 
        key={question?.text}
        initial={{ scale: 0.8, rotate: -2 }}
        animate={{ scale: 1, rotate: 0 }}
        className="bg-white border-4 border-black p-10 w-full text-center rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <span className="text-xs font-black tracking-[0.3em] text-gray-400 mb-2 block uppercase italic">Mental Math</span>
        <h2 className="text-6xl font-black tabular-nums tracking-tighter text-gray-900">{question?.text}</h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '-', 0, 'CLR'].map((btn) => (
          <button
            key={btn}
            onClick={() => {
               if (btn === 'CLR') setUserInput('');
               else if (btn === '-') setUserInput(prev => prev === '' ? '-' : prev);
               else handleInput(userInput + btn);
            }}
            className={`
              p-4 border-4 border-black rounded-xl font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none
              ${btn === 'CLR' ? 'bg-brand-red text-white' : 'bg-white hover:bg-brand-yellow'}
            `}
          >
            {btn}
          </button>
        ))}
      </div>

      <div className="mt-8 font-black italic text-5xl h-16 flex items-center justify-center text-brand-blue drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        {userInput || '??'}
      </div>
    </div>
  );
}
