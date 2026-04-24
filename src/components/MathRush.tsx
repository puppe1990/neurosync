/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { IconMap } from '../icons';

interface MathRushProps {
  onFinish: (score: number, accuracy: number, timeSpent: number) => void;
}

export default function MathRush({ onFinish }: MathRushProps) {
  const [question, setQuestion] = useState<{ text: string; answer: number } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [solvedCount, setSolvedCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime] = useState(Date.now());

  const generateQuestion = useCallback(() => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;

    if (op === '*') {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 10) + 1;
    } else {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
    }

    const text = `${a} ${op === '*' ? '×' : op} ${b}`;
    let ans = 0;
    if (op === '+') ans = a + b;
    if (op === '-') ans = a - b;
    if (op === '*') ans = a * b;

    setQuestion({ text, answer: ans });
    setUserInput('');
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  useEffect(() => {
    if (timeLeft <= 0) {
      const timeSpent = Date.now() - startTime;
      const totalAttempted = solvedCount + mistakes;
      const accuracy = totalAttempted > 0 ? solvedCount / totalAttempted : 0;
      onFinish(solvedCount * 100, accuracy, timeSpent);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, solvedCount, mistakes, startTime, onFinish]);

  const handleInput = (val: string) => {
    if (!question) return;

    if (parseInt(val) === question.answer) {
      setSolvedCount(s => s + 1);
      generateQuestion();
    } else {
      setUserInput(val);
      // If the length of input matches answer length and it's wrong, we can clear it or show feedback
      if (val.length >= question.answer.toString().length) {
         // Brief delay then clear if wrong
         setTimeout(() => {
           if (parseInt(val) !== question.answer) {
             setUserInput('');
             setMistakes(m => m + 1);
           }
         }, 200);
      }
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
