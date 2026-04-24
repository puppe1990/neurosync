/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { audio } from '../lib/audio';

interface NeuralReactProps {
  onFinish: (score: number, accuracy: number, timeSpent: number) => void;
}

type State = 'WAITING' | 'READY' | 'RESULTS' | 'TOO_EARLY';

export default function NeuralReact({ onFinish }: NeuralReactProps) {
  const [gameState, setGameState] = useState<State>('WAITING');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTest = () => {
    setGameState('WAITING');
    setReactionTime(null);
    const delay = 1000 + Math.random() * 3000;
    timerRef.current = window.setTimeout(() => {
      setGameState('READY');
      startTimeRef.current = Date.now();
    }, delay);
  };

  useEffect(() => {
    startTest();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (gameState === 'WAITING') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('TOO_EARLY');
      audio.playWrong();
      setTimeout(startTest, 1500);
    } else if (gameState === 'READY') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setAttempts(prev => [...prev, time]);
      setGameState('RESULTS');
      audio.playCorrect();
      
      if (attempts.length + 1 >= 5) {
        const avg = [...attempts, time].reduce((a, b) => a + b, 0) / 5;
        // Score = 1000 - avg, capped
        const score = Math.max(0, Math.floor(1000 - avg));
        setTimeout(() => onFinish(score, 100, 10), 1000);
      } else {
        setTimeout(startTest, 1500);
      }
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto h-96">
      <div className="w-full text-center mb-8">
        <h4 className="text-xl font-black uppercase tracking-tighter">Tentativa {attempts.length + 1} de 5</h4>
      </div>

      <motion.button
        onClick={handleClick}
        className={`w-full flex-1 border-8 border-black rounded-3xl flex items-center justify-center transition-colors shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
          gameState === 'WAITING' ? 'bg-brand-orange' :
          gameState === 'READY' ? 'bg-brand-green' :
          gameState === 'TOO_EARLY' ? 'bg-red-500' :
          'bg-brand-blue'
        }`}
      >
        <span className="text-4xl font-black text-white uppercase italic drop-shadow-lg">
          {gameState === 'WAITING' && 'ESPERE...'}
          {gameState === 'READY' && 'CLIQUE!'}
          {gameState === 'TOO_EARLY' && 'MUITO CEDO!'}
          {gameState === 'RESULTS' && reactionTime && `${reactionTime}ms`}
        </span>
      </motion.button>

      <div className="mt-8 flex gap-2">
        {Array(5).fill(0).map((_, i) => (
          <div 
            key={i}
            className={`w-4 h-4 border-2 border-black rounded-full ${
              i < attempts.length ? 'bg-black' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
