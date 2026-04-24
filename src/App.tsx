/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconMap } from './icons';
import { PUZZLES, PuzzleConfig, UserStats, PuzzleResult, Difficulty, AuthenticatedUser, RankingEntry } from './types';
import MathRush from './components/MathRush';
import GridMemory from './components/GridMemory';
import StroopTest from './components/StroopTest';
import ShapeStack from './components/ShapeStack';
import TutorialOverlay from './components/TutorialOverlay';
import PatternPursuit from './components/PatternPursuit';
import NeuralReact from './components/NeuralReact';

// Views
type View = 'MENU' | 'TRAINING' | 'STATS' | 'PUZZLE_DETAIL' | 'RESULTS' | 'RANKINGS';

export default function App({initialUser}: {initialUser: AuthenticatedUser}) {
  const [currentView, setCurrentView] = useState<View>('MENU');
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleConfig | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('NORMAL');
  const [lastResult, setLastResult] = useState<PuzzleResult | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('neurosync_stats');
    return saved ? JSON.parse(saved) : { sessions: [], bestScores: {}, dailyStreak: 0 };
  });

  const getDailySeed = () => {
    const date = new Date();
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isChallengeDoneToday = stats.lastChallengeDate === todayStr;

  useEffect(() => {
    localStorage.setItem('neurosync_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (currentView !== 'RANKINGS') return;

    setRankingsLoading(true);
    fetch('/api/rankings?limit=25', {cache: 'no-store'})
      .then((response) => response.json())
      .then((data) => setRankings(data.rankings ?? []))
      .catch(() => setRankings([]))
      .finally(() => setRankingsLoading(false));
  }, [currentView]);

  useEffect(() => {
    import('./lib/audio').then(({ audio }) => {
      audio.setMusicMode(currentView === 'TRAINING' ? 'upbeat' : 'calm');
    });
  }, [currentView]);

  const toggleMusic = () => {
    import('./lib/audio').then(({ audio }) => {
      const newState = !musicEnabled;
      setMusicEnabled(newState);
      audio.setMusicEnabled(newState);
    });
  };

  const handleFinishPuzzle = (score: number, accuracy: number, timeSpent: number) => {
    if (!selectedPuzzle) return;

    const result: PuzzleResult = {
      puzzleId: selectedPuzzle.id,
      category: selectedPuzzle.category,
      difficulty: selectedDifficulty,
      score,
      timeSpent,
      accuracy,
      timestamp: new Date().toISOString()
    };

    fetch('/api/results', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        puzzleId: result.puzzleId,
        category: result.category,
        difficulty: result.difficulty,
        score: result.score,
        accuracy: result.accuracy,
        timeSpent: result.timeSpent,
      }),
    }).catch(() => {
      // Local stats still update immediately; persistence can retry on the next game.
    });

    setLastResult(result);
    setStats(prev => {
      const bestScores = { ...prev.bestScores };
      if ((bestScores[result.puzzleId] || 0) < score) {
        bestScores[result.puzzleId] = score;
      }
      
      const isDaily = isDailyChallenge && selectedPuzzle.id === 'math-rush';
      const streakUpdate = isDaily && prev.lastChallengeDate !== todayStr ? prev.dailyStreak + 1 : prev.dailyStreak;

      return {
        ...prev,
        bestScores,
        dailyStreak: streakUpdate,
        lastChallengeDate: isDaily ? todayStr : prev.lastChallengeDate,
        sessions: [...prev.sessions, {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: result.timestamp,
          results: [result],
          overallBrainAge: 20 + Math.floor(Math.random() * 40) // Mock logic for demo
        }]
      };
    });

    setIsDailyChallenge(false);
    setCurrentView('RESULTS');
  };

  const handleLogout = async () => {
    await fetch('/api/logout', {method: 'POST'});
    window.location.href = '/signin';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentView('MENU')}>
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="bg-brand-blue w-16 h-16 border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
             <IconMap.Brain size={32} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">NeuroSync</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMusic}
            className={`w-12 h-12 bg-white border-4 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all active:translate-y-[1px] ${musicEnabled ? 'text-brand-orange' : 'text-gray-300'}`}
          >
            {musicEnabled ? <IconMap.Volume2 size={20} /> : <IconMap.VolumeX size={20} />}
          </button>
          
          <div className="flex items-center gap-6 bg-white border-4 border-black p-3 px-6 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => setCurrentView('STATS')}
              className={`text-right leading-none group transition-colors ${currentView === 'STATS' ? 'text-brand-orange' : ''}`}
            >
              <p className="text-[10px] font-black uppercase text-gray-500">Neuro Perfil</p>
              <p className="text-xl font-black underline underline-offset-4 decoration-2">STREAK: {stats.dailyStreak}</p>
            </button>
            <div className="hidden md:block w-1 h-10 bg-black"></div>
            <div className="hidden md:flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase text-gray-500">Player</span>
              <span className="text-sm font-black uppercase">{initialUser.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 bg-brand-orange border-4 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
              title="Sair"
            >
              <IconMap.LogOut size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'MENU' && (
            <motion.div
              key="menu"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: { opacity: 0 },
                animate: { 
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 }
                },
                exit: { 
                  opacity: 0, 
                  scale: 1.05,
                  transition: { duration: 0.2, ease: "easeIn" }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              <motion.div 
                variants={{
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 }
                }}
                className="md:col-span-4 flex flex-col gap-6"
              >
                <div className="bg-brand-blue border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col min-h-[300px]">
                  <div className="absolute -top-4 -right-4 bg-brand-gold w-24 h-24 rounded-full border-4 border-black"></div>
                  <p className="text-sm font-black uppercase text-blue-900 mb-2">Desafio Hoje</p>
                  <h2 className="text-3xl font-black text-white leading-tight mb-4">Neural Prime</h2>
                  <div className="bg-white border-2 border-black p-4 rounded-xl relative mt-auto">
                    <p className="text-lg font-bold italic leading-snug">
                      {isChallengeDoneToday 
                        ? "Desafio completo! Você dominou o Neural Prime hoje." 
                        : "Sua memória aumentou 12% hoje! Pronto para o desafio diário?"}
                    </p>
                    <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b-2 border-r-2 border-black rotate-45"></div>
                  </div>
                  <button 
                    disabled={isChallengeDoneToday}
                    onClick={() => {
                      setSelectedPuzzle(PUZZLES.find(p => p.id === 'math-rush') || PUZZLES[0]);
                      setIsDailyChallenge(true);
                      setCurrentView('TRAINING');
                    }}
                    className={`mt-6 brutalist-button w-full text-center ${isChallengeDoneToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isChallengeDoneToday ? 'CONCLUÍDO' : 'Jogar Desafio'}
                  </button>
                </div>

                <div className="bg-white border-4 border-black p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black uppercase text-xs text-gray-400 tracking-widest mb-4">Balancê Cognitivo</h3>
                  <div className="flex justify-between items-end h-24 gap-2">
                    <div className="bg-brand-red w-full rounded-t-lg border-2 border-black border-b-0" style={{ height: '80%' }}></div>
                    <div className="bg-brand-blue w-full rounded-t-lg border-2 border-black border-b-0" style={{ height: '45%' }}></div>
                    <div className="bg-brand-green w-full rounded-t-lg border-2 border-black border-b-0" style={{ height: '95%' }}></div>
                    <div className="bg-brand-gold w-full rounded-t-lg border-2 border-black border-b-0" style={{ height: '60%' }}></div>
                  </div>
                </div>
              </motion.div>

              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {PUZZLES.map((puzzle, idx) => {
                  const colors = ['bg-brand-red', 'bg-brand-green', 'bg-brand-gold', 'bg-brand-orange'];
                  const color = colors[idx % colors.length];
                  const Icon = IconMap[puzzle.icon as keyof typeof IconMap];
                  
                  return (
                    <motion.div 
                      key={puzzle.id}
                      variants={{
                        initial: { opacity: 0, y: 30, scale: 0.9 },
                        animate: { opacity: 1, y: 0, scale: 1 }
                      }}
                      onClick={() => {
                        setSelectedPuzzle(puzzle);
                        setCurrentView('PUZZLE_DETAIL');
                      }}
                      className={`group cursor-pointer ${color} border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-transform`}
                    >
                      <div className="w-14 h-14 bg-white border-4 border-black rounded-xl mb-4 flex items-center justify-center text-3xl">
                        {Icon && <Icon size={24} />}
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase">{puzzle.name}</h3>
                      <p className={`font-bold text-sm mt-1 opacity-80 ${idx === 2 ? 'text-gray-900' : 'text-white'}`}>
                        {puzzle.description}
                      </p>
                      <div className="mt-4 text-[10px] font-black bg-black text-white inline-block px-3 py-1 rounded-full uppercase">
                        {idx === 0 ? 'Expert' : idx === 1 ? 'Medium' : 'Normal'}
                      </div>
                    </motion.div>
                  );
                })}

                <motion.div 
                  variants={{
                    initial: { opacity: 0, y: 40 },
                    animate: { opacity: 1, y: 0 }
                  }}
                  className="sm:col-span-2 bg-gray-900 border-4 border-black p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center shadow-[8px_8px_0px_0px_rgba(249,115,22,0.4)]"
                >
                  <div className="flex flex-col text-center sm:text-left mb-6 sm:mb-0">
                    <span className="text-brand-orange font-black italic uppercase text-lg">Grande Desafio</span>
                    <h4 className="text-white text-3xl font-black tracking-tight uppercase italic">Copa Bio-Sensorial</h4>
                  </div>
                  <button className="bg-white border-4 border-black px-8 py-3 rounded-2xl font-black text-xl hover:bg-brand-orange transition-colors">JOGAR AGORA</button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentView === 'PUZZLE_DETAIL' && selectedPuzzle && (
             <motion.div
                key="puzzle-detail"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="max-w-2xl mx-auto w-full"
             >
                <button 
                  onClick={() => setCurrentView('MENU')}
                  className="brutalist-button mb-8 inline-flex items-center gap-2"
                >
                  <IconMap.ChevronLeft size={14} />
                  <span>Voltar</span>
                </button>

                <div className="bg-white brutalist-card p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-brand-blue border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {(() => {
                        const Icon = IconMap[selectedPuzzle.icon as keyof typeof IconMap];
                        return Icon ? <Icon size={40} className="text-white" /> : null;
                      })()}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase text-brand-orange tracking-widest">{selectedPuzzle.category}</span>
                      <h2 className="text-4xl font-black tracking-tight uppercase">{selectedPuzzle.name}</h2>
                    </div>
                  </div>

                  <p className="text-xl font-bold leading-relaxed mb-8 italic text-gray-600">
                    "{selectedPuzzle.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-5 bg-brand-yellow border-4 border-black rounded-2xl">
                      <span className="block text-[10px] font-black uppercase opacity-50 mb-1">Recorde</span>
                      <span className="text-3xl font-black">{stats.bestScores[selectedPuzzle.id] || '0000'}</span>
                    </div>
                    <div className="p-5 bg-brand-green/20 border-4 border-black rounded-2xl">
                      <span className="block text-[10px] font-black uppercase opacity-50 mb-1">Status</span>
                      <span className="text-xl font-black uppercase">{selectedDifficulty}</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <span className="block text-[10px] font-black uppercase opacity-50 mb-3">Nível de Intensidade</span>
                    <div className="grid grid-cols-4 gap-2">
                      {(['EASY', 'NORMAL', 'HARD', 'CHAMPION'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setSelectedDifficulty(d)}
                          className={`py-2 px-1 border-4 border-black rounded-xl font-black text-[10px] transition-all ${
                            selectedDifficulty === d 
                              ? 'bg-brand-blue text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5' 
                              : 'bg-white hover:bg-brand-yellow'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mb-8">
                    <button 
                      className="flex-1 bg-white border-4 border-black rounded-2xl py-6 font-black text-xl tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
                      onClick={() => setShowTutorial(true)}
                    >
                      <IconMap.HelpCircle size={24} />
                      COMO JOGAR?
                    </button>
                    <button 
                      disabled={!['math-rush', 'grid-memory', 'stroop-test', 'shape-stack', 'pattern-pursuit', 'neural-react'].includes(selectedPuzzle.id)}
                      className="flex-2 bg-brand-blue text-white border-4 border-black rounded-2xl py-6 font-black text-xl tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setCurrentView('TRAINING')}
                    >
                      {['math-rush', 'grid-memory', 'stroop-test', 'shape-stack', 'pattern-pursuit', 'neural-react'].includes(selectedPuzzle.id) ? 'COMEÇAR TREINO' : 'CARREGANDO...'}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showTutorial && selectedPuzzle?.tutorial && (
                    <TutorialOverlay 
                      steps={selectedPuzzle.tutorial} 
                      onClose={() => setShowTutorial(false)} 
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          {currentView === 'TRAINING' && selectedPuzzle && (
            <motion.div
              key="active-puzzle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="w-full"
            >
              <div className="bg-white brutalist-card p-8 mb-4">
                {selectedPuzzle.id === 'math-rush' && (
                  <MathRush 
                    difficulty={selectedDifficulty} 
                    onFinish={handleFinishPuzzle} 
                    isDaily={isDailyChallenge}
                    seed={isDailyChallenge ? getDailySeed() : undefined}
                  />
                )}
                {selectedPuzzle.id === 'grid-memory' && <GridMemory difficulty={selectedDifficulty} onFinish={handleFinishPuzzle} />}
                {selectedPuzzle.id === 'stroop-test' && <StroopTest difficulty={selectedDifficulty} onFinish={handleFinishPuzzle} />}
                {selectedPuzzle.id === 'shape-stack' && <ShapeStack difficulty={selectedDifficulty} onFinish={handleFinishPuzzle} />}
                {selectedPuzzle.id === 'pattern-pursuit' && <PatternPursuit difficulty={selectedDifficulty} onFinish={handleFinishPuzzle} />}
                {selectedPuzzle.id === 'neural-react' && <NeuralReact onFinish={handleFinishPuzzle} />}
              </div>
              <button 
                onClick={() => setCurrentView('MENU')}
                className="brutalist-button"
              >
                Cancelar
              </button>
            </motion.div>
          )}

          {currentView === 'RESULTS' && lastResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="bg-brand-blue border-4 border-black p-12 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-black/10"></div>
                <span className="text-xs font-black tracking-[0.2em] text-white opacity-80 mb-4 block uppercase underline underline-offset-4 decoration-2">NEURO SCORE</span>
                <h2 className="text-7xl font-black text-white tracking-tighter mb-4 italic">{lastResult.score}</h2>
                <div className="flex items-center justify-center gap-2 text-brand-gold text-sm font-black uppercase">
                  <IconMap.Trophy size={20} />
                  <span>Performance Excelente</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                 <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-black uppercase opacity-40 block mb-1">Precisão</span>
                    <span className="text-2xl font-black">{(lastResult.accuracy * 100).toFixed(0)}%</span>
                 </div>
                 <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-black uppercase opacity-40 block mb-1">Tempo</span>
                    <span className="text-2xl font-black">{(lastResult.timeSpent / 1000).toFixed(1)}s</span>
                 </div>
              </div>

              <button 
                onClick={() => setCurrentView('MENU')}
                className="w-full bg-brand-orange border-4 border-black p-6 rounded-2xl font-black text-2xl text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
              >
                PROXIMO DESAFIO
              </button>
            </motion.div>
          )}

          {currentView === 'STATS' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-4xl mx-auto w-full"
            >
              <div className="flex items-center gap-4 mb-12">
                <button onClick={() => setCurrentView('MENU')} className="brutalist-button">
                  <IconMap.ChevronLeft size={16} />
                </button>
                <h2 className="text-4xl font-black tracking-tight uppercase">Performance Log</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-brand-gold border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                   <span className="text-xs font-black uppercase text-gray-900 opacity-60 block mb-2">Total Jogos</span>
                   <span className="text-6xl font-black italic">{stats.sessions.length}</span>
                </div>
                <div className="bg-brand-red border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
                   <span className="text-xs font-black uppercase opacity-60 block mb-2">Combo Dias</span>
                   <span className="text-6xl font-black italic">{stats.dailyStreak}</span>
                </div>
              </div>

              <div className="brutalist-card overflow-hidden">
                <div className="p-6 bg-black text-white flex justify-between items-center">
                  <span className="font-black uppercase text-sm tracking-widest italic">Histórico Neural</span>
                  <IconMap.History size={20} className="text-brand-orange" />
                </div>
                <div className="divide-y-4 divide-black">
                  {stats.sessions.slice(-8).reverse().map((session, i) => (
                    <div key={i} className="p-6 flex justify-between items-center bg-white hover:bg-brand-yellow transition-colors">
                      <div className="flex flex-col">
                        <span className="text-lg font-black uppercase">{new Date(session.timestamp).toLocaleDateString('pt-BR')}</span>
                        <span className="text-xs font-bold text-gray-500">{session.results[0].category.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black italic text-brand-blue">#{session.results[0].score}</span>
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white">
                          <IconMap.ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.sessions.length === 0 && (
                    <div className="p-20 text-center text-gray-400 font-black uppercase tracking-[0.2em]">
                       Aguardando conexão cerebral...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'RANKINGS' && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-5xl mx-auto w-full"
            >
              <div className="flex items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentView('MENU')} className="brutalist-button">
                    <IconMap.ChevronLeft size={16} />
                  </button>
                  <h2 className="text-4xl font-black tracking-tight uppercase">Ranking Neural</h2>
                </div>
                <div className="bg-brand-gold border-4 border-black rounded-2xl px-5 py-3 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  TOP 25
                </div>
              </div>

              <div className="brutalist-card overflow-hidden">
                <div className="p-6 bg-black text-white grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-widest">
                  <span className="col-span-2">Rank</span>
                  <span className="col-span-4">Player</span>
                  <span className="col-span-3">Puzzle</span>
                  <span className="col-span-3 text-right">Score</span>
                </div>
                <div className="divide-y-4 divide-black">
                  {rankingsLoading && (
                    <div className="p-16 text-center font-black uppercase tracking-[0.2em] text-gray-400">
                      Sincronizando ranking...
                    </div>
                  )}
                  {!rankingsLoading && rankings.map((entry) => (
                    <div key={entry.id} className="p-6 bg-white hover:bg-brand-yellow transition-colors grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <span className="inline-flex w-12 h-12 bg-brand-blue text-white border-4 border-black rounded-xl items-center justify-center font-black text-xl">
                          {entry.rank}
                        </span>
                      </div>
                      <div className="col-span-4 min-w-0">
                        <p className="font-black uppercase truncate">{entry.playerName}</p>
                        <p className="text-[10px] font-black uppercase text-gray-500">{new Date(entry.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="col-span-3 min-w-0">
                        <p className="font-black uppercase truncate">{PUZZLES.find((p) => p.id === entry.puzzleId)?.name ?? entry.puzzleId}</p>
                        <p className="text-[10px] font-black uppercase text-gray-500">{entry.difficulty}</p>
                      </div>
                      <div className="col-span-3 text-right">
                        <p className="text-3xl font-black italic text-brand-orange">{entry.score}</p>
                        <p className="text-[10px] font-black uppercase text-gray-500">{(entry.accuracy * 100).toFixed(0)}% / {(entry.timeSpent / 1000).toFixed(1)}s</p>
                      </div>
                    </div>
                  ))}
                  {!rankingsLoading && rankings.length === 0 && (
                    <div className="p-20 text-center text-gray-400 font-black uppercase tracking-[0.2em]">
                      Nenhum score sincronizado ainda.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t-4 border-black/10">
        <div className="flex gap-4">
          <button onClick={() => setCurrentView('RANKINGS')} className="brutalist-button">Ranking</button>
          <button className="brutalist-button">Config</button>
        </div>
        <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">© 2026 NEURO-SPEC LABS // SYSTEM STATUS: ACTIVE</p>
      </footer>
    </div>
  );
}
