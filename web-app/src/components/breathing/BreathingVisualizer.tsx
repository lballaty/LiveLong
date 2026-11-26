// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/breathing/BreathingVisualizer.tsx
// Description: Visual breathing guide with background breathing animation and large instruction display
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BreathingPattern } from '@/types/profile.types';

interface ExternalBreathingState {
  phase: BreathingPhase;
  remainingSeconds: number;
  currentCycle: number;
  totalCycles: number;
}

interface BreathingVisualizerProps {
  pattern: BreathingPattern;
  isActive: boolean;
  embedded?: boolean;
  externalState?: ExternalBreathingState;
  onComplete?: () => void;
  onCycleComplete?: (cycleNumber: number) => void;
}

type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'complete';

export default function BreathingVisualizer({
  pattern,
  isActive,
  embedded = false,
  externalState,
  onComplete,
  onCycleComplete
}: BreathingVisualizerProps) {
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Calculate current phase duration
  const getCurrentPhaseDuration = (): number => {
    switch (currentPhase) {
      case 'inhale': return pattern.inhaleSeconds;
      case 'hold-in': return pattern.holdInSeconds || 0;
      case 'exhale': return pattern.exhaleSeconds;
      case 'hold-out': return pattern.holdOutSeconds || 0;
      default: return 0;
    }
  };

  // Get next phase in sequence
  const getNextPhase = (): BreathingPhase => {
    switch (currentPhase) {
      case 'inhale':
        return pattern.holdInSeconds ? 'hold-in' : 'exhale';
      case 'hold-in':
        return 'exhale';
      case 'exhale':
        return pattern.holdOutSeconds ? 'hold-out' : 'inhale';
      case 'hold-out':
        return 'inhale';
      default:
        return 'inhale';
    }
  };

  // Get display text for current phase
  const getPhaseText = (): string => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold-in': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold-out': return 'Hold Empty';
      case 'complete': return 'Complete!';
      default: return '';
    }
  };

  // Get phase color
  const getPhaseColor = (): string => {
    switch (currentPhase) {
      case 'inhale': return 'text-blue-600';
      case 'hold-in': return 'text-purple-600';
      case 'exhale': return 'text-green-600';
      case 'hold-out': return 'text-orange-600';
      case 'complete': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  // Get breathing scale for background animation
  const getBreathingScale = (): number => {
    const phaseDuration = getCurrentPhaseDuration();
    if (phaseDuration === 0) return 1;

    const progress = 1 - (timeRemaining / phaseDuration);

    switch (currentPhase) {
      case 'inhale':
        return 1 + (progress * 0.15); // Scale up to 115%
      case 'hold-in':
        return 1.15; // Stay expanded
      case 'exhale':
        return 1.15 - (progress * 0.15); // Scale down to 100%
      case 'hold-out':
        return 1; // Stay contracted
      default:
        return 1;
    }
  };

  // Apply breathing animation to background
  useEffect(() => {
    if (backgroundRef.current && isActive) {
      const scale = getBreathingScale();
      const opacity = currentPhase === 'inhale' ? 0.95 + (0.05 * ((getCurrentPhaseDuration() - timeRemaining) / getCurrentPhaseDuration())) :
                     currentPhase === 'exhale' ? 1 - (0.05 * ((getCurrentPhaseDuration() - timeRemaining) / getCurrentPhaseDuration())) : 1;

      backgroundRef.current.style.transform = `scale(${scale})`;
      backgroundRef.current.style.opacity = opacity.toString();
    }
  }, [timeRemaining, currentPhase, isActive]);

  // Main breathing timer (skipped when driven externally)
  useEffect(() => {
    if (externalState || !isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (currentCycle >= pattern.cycles) {
      setCurrentPhase('complete');
      onComplete?.();
      return;
    }

    const phaseDuration = getCurrentPhaseDuration();
    if (phaseDuration === 0) {
      // Skip phases with 0 duration
      setCurrentPhase(getNextPhase());
      return;
    }

    if (timeRemaining === 0) {
      setTimeRemaining(phaseDuration);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          const nextPhase = getNextPhase();
          if (nextPhase === 'inhale') {
            // Completed a full cycle
            const newCycle = currentCycle + 1;
            setCurrentCycle(newCycle);
            onCycleComplete?.(newCycle);
          }
          setCurrentPhase(nextPhase);
          return getCurrentPhaseDuration();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, currentPhase, currentCycle, timeRemaining, pattern]);

  // Reset when pattern changes
  useEffect(() => {
    setCurrentPhase('inhale');
    setCurrentCycle(0);
    setTimeRemaining(pattern.inhaleSeconds);
  }, [pattern]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setCurrentPhase('inhale');
    setCurrentCycle(0);
    setTimeRemaining(pattern.inhaleSeconds);
    setIsPaused(false);
  };

  if (!isActive && !embedded) {
    return null;
  }

  const activePhase = externalState ? externalState.phase : currentPhase;
  const activeRemaining = externalState ? externalState.remainingSeconds : timeRemaining;
  const activeCycle = externalState ? externalState.currentCycle : currentCycle + 1;
  const activeTotalCycles = externalState ? externalState.totalCycles : pattern.cycles;

  const activePhaseText = (() => {
    switch (activePhase) {
      case 'inhale': return 'Breathe In';
      case 'hold-in': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold-out': return 'Hold Empty';
      case 'complete': return 'Complete!';
      default: return '';
    }
  })();

  const activePhaseColor = (() => {
    switch (activePhase) {
      case 'inhale': return 'text-blue-600';
      case 'hold-in': return 'text-purple-600';
      case 'exhale': return 'text-green-600';
      case 'hold-out': return 'text-orange-600';
      case 'complete': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  })();

  if (embedded) {
    const loopPhases: Array<{ key: BreathingPhase; label: string; seconds: number; activeClass: string; barClass: string }> = [
      { key: 'inhale', label: 'Inhale', seconds: pattern.inhaleSeconds, activeClass: 'border-blue-500 bg-blue-50 text-blue-700', barClass: 'bg-blue-500' },
      ...(pattern.holdInSeconds ? [{ key: 'hold-in' as BreathingPhase, label: 'Hold', seconds: pattern.holdInSeconds, activeClass: 'border-purple-500 bg-purple-50 text-purple-700', barClass: 'bg-purple-500' }] : []),
      { key: 'exhale', label: 'Exhale', seconds: pattern.exhaleSeconds, activeClass: 'border-green-500 bg-green-50 text-green-700', barClass: 'bg-green-500' },
      ...(pattern.holdOutSeconds ? [{ key: 'hold-out' as BreathingPhase, label: 'Hold', seconds: pattern.holdOutSeconds, activeClass: 'border-orange-500 bg-orange-50 text-orange-700', barClass: 'bg-orange-500' }] : []),
    ];

    const currentPhaseObj = loopPhases.find((p) => p.key === activePhase);
    const currentPhaseTotal = currentPhaseObj?.seconds || 1;
    const phaseElapsedPct = isActive
      ? Math.min(100, Math.max(0, ((currentPhaseTotal - activeRemaining) / currentPhaseTotal) * 100))
      : 0;

    // Target circle scale and transition duration paced to the active phase
    const targetScale = !isActive
      ? 0.72
      : activePhase === 'inhale' || activePhase === 'hold-in'
      ? 1.35
      : 0.72;
    const transitionSeconds =
      !isActive || activePhase === 'hold-in' || activePhase === 'hold-out'
        ? 0.4
        : currentPhaseTotal;

    return (
      <div data-testid="breathing-visualizer" className="flex flex-col items-center py-2">
        <div className="mb-4 flex justify-center items-center h-48">
          <div
            className={`w-32 h-32 rounded-full border-8 ${
              activePhase === 'inhale' ? 'border-blue-400 bg-blue-100' :
              activePhase === 'hold-in' ? 'border-purple-400 bg-purple-100' :
              activePhase === 'exhale' ? 'border-green-400 bg-green-100' :
              'border-orange-400 bg-orange-100'
            }`}
            style={{
              transform: `scale(${targetScale})`,
              transition: `transform ${transitionSeconds}s linear, border-color 0.4s ease-in-out, background-color 0.4s ease-in-out`
            }}
          />
        </div>
        <div className={`text-3xl font-bold mb-1 transition-colors duration-500 ${activePhaseColor}`}>
          {activePhaseText}
        </div>
        <div className="text-4xl font-mono font-bold text-gray-800 mb-3" data-testid="time-display">
          {activeRemaining}s
        </div>

        {/* Visual Breathing Loop Indicator */}
        <div
          data-testid="breathing-loop-indicator"
          className="w-full grid gap-1.5 mb-3"
          style={{ gridTemplateColumns: `repeat(${loopPhases.length}, minmax(0, 1fr))` }}
        >
          {loopPhases.map((step) => {
            const isCurrent = step.key === activePhase;
            return (
              <div
                key={step.key}
                data-active={isCurrent ? 'true' : 'false'}
                className={`rounded-lg border px-2 py-1.5 text-center transition-colors ${
                  isCurrent ? step.activeClass : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <div className="text-[11px] font-semibold truncate">{step.label}</div>
                <div className="text-[10px] opacity-80">{step.seconds}s</div>
                <div className="mt-1 h-1 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isCurrent ? step.barClass : 'bg-transparent'}`}
                    style={{ width: isCurrent ? `${Math.max(12, phaseElapsedPct)}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Cycle {activeCycle} of {activeTotalCycles}</span>
          <span>{Math.round(((activeCycle - 1) / Math.max(1, activeTotalCycles)) * 100)}% loops</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (activeCycle / Math.max(1, activeTotalCycles)) * 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Breathing Background */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 transition-all duration-1000 ease-in-out"
        style={{
          transformOrigin: 'center',
          transition: 'transform 1s ease-in-out, opacity 1s ease-in-out'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center px-8">
        {/* Breathing Pattern Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{pattern.name}</h2>
          <p className="text-gray-600">{pattern.description}</p>
        </div>

        {/* Visual Breathing Indicator */}
        <div className="mb-8 flex justify-center">
          {pattern.visualStyle === 'circle' && (
            <div
              className={`w-40 h-40 rounded-full border-8 transition-all duration-1000 ease-in-out ${
                currentPhase === 'inhale' ? 'border-blue-400 bg-blue-100' :
                currentPhase === 'hold-in' ? 'border-purple-400 bg-purple-100' :
                currentPhase === 'exhale' ? 'border-green-400 bg-green-100' :
                'border-orange-400 bg-orange-100'
              }`}
              style={{
                transform: `scale(${currentPhase === 'inhale' ? 1.3 : currentPhase === 'hold-in' ? 1.3 : 1})`,
                transition: 'transform 1s ease-in-out, border-color 0.5s ease-in-out'
              }}
            />
          )}

          {pattern.visualStyle === 'square' && (
            <div
              className={`w-32 h-32 border-8 transition-all duration-1000 ease-in-out ${
                currentPhase === 'inhale' ? 'border-blue-400 bg-blue-100' :
                currentPhase === 'hold-in' ? 'border-purple-400 bg-purple-100' :
                currentPhase === 'exhale' ? 'border-green-400 bg-green-100' :
                'border-orange-400 bg-orange-100'
              }`}
              style={{
                transform: `scale(${currentPhase === 'inhale' ? 1.4 : currentPhase === 'hold-in' ? 1.4 : 1}) rotate(${timeRemaining * 2}deg)`,
                transition: 'transform 1s ease-in-out, border-color 0.5s ease-in-out'
              }}
            />
          )}
        </div>

        {/* Phase Instruction */}
        <div className="mb-6">
          <div className={`text-6xl font-bold mb-4 transition-colors duration-500 ${getPhaseColor()}`}>
            {getPhaseText()}
          </div>
          <div className="text-3xl font-mono text-gray-600">
            {timeRemaining}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="text-lg text-gray-700 mb-2">
            Cycle {currentCycle + 1} of {pattern.cycles}
          </div>
          <div className="w-80 h-2 bg-gray-200 rounded-full mx-auto">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentCycle / pattern.cycles) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePause}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}