/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialStep } from '../types';
import { IconMap } from '../icons';

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onClose: () => void;
}

export default function TutorialOverlay({ steps, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-yellow/10 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-4 border-black w-full max-w-md rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <IconMap.X size={20} className="text-black" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="bg-brand-blue/10 p-4 rounded-2xl border-2 border-black inline-flex">
            <IconMap.HelpCircle size={48} className="text-brand-blue" />
          </div>
        </div>

        <div className="text-center mb-8 h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-lg font-black leading-tight text-gray-900"
            >
              {steps[currentStep].text}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-2 mb-2">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-2 border-2 border-black rounded-full transition-all ${
                  idx === currentStep ? 'w-8 bg-brand-orange' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={next}
            className="w-full bg-black text-white border-4 border-black rounded-xl py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] active:translate-y-[2px] active:shadow-none transition-all"
          >
            {currentStep === steps.length - 1 ? 'ENTENDI!' : 'PRÓXIMO'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
