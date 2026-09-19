'use client';

import React from 'react';
import { useTimer } from '../hooks/useTimer';
import { useTimerStore, TimerMode } from '../store/useTimerStore';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const TimerDisplay = () => {
  const { isRunning, timeLeft } = useTimer();
  const { mode, setMode, startTimer, pauseTimer, resetTimer } = useTimerStore();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl max-w-md w-full mx-auto">
      {/* Mode Selector */}
      <div className="flex space-x-2 mb-8 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full">
        {(['Pomodoro', 'Deep Work'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === m 
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="text-8xl font-light text-zinc-900 dark:text-white tracking-tighter mb-12 tabular-nums">
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6">
        <button 
          onClick={isRunning ? pauseTimer : startTimer}
          className="flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 transition-transform shadow-lg"
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
             <Pause size={32} fill="currentColor" />
          ) : (
             <Play size={32} fill="currentColor" className="ml-2" />
          )}
        </button>
        
        <button 
          onClick={resetTimer}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Reset timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};
