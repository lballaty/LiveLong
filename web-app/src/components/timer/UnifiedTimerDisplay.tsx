// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/timer/UnifiedTimerDisplay.tsx
// Description: Unified 4-view LiveLong PWA shell (Practice, Practices, Progress, Settings)
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';
import UnifiedProfileManager from '@/components/profiles/UnifiedProfileManager';
import BreathingVisualizer from '@/components/breathing/BreathingVisualizer';
import ExerciseAnimationPlayer from '@/components/exercises/ExerciseAnimationPlayer';
import ProgressView from '@/components/progress/ProgressView';
import SettingsView from '@/components/settings/SettingsView';
import { BreathingPattern } from '@/types/profile.types';

type ActiveTab = 'practice' | 'practices' | 'progress' | 'settings';

export default function UnifiedTimerDisplay() {
  const {
    activeProfile,
    timerState,
    preferences,
    updatePreferences,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    initializeProfiles,
  } = useUnifiedTimerStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('practice');

  useEffect(() => {
    initializeProfiles();
  }, [initializeProfiles]);

  const breathingPatternForVisualizer: BreathingPattern | null = useMemo(() => {
    if (!activeProfile || activeProfile.type !== 'breathing' || !activeProfile.breathingConfig) {
      return null;
    }
    const phases = activeProfile.breathingConfig.pattern;
    const findDur = (t: string) => phases.find((p) => p.type === t)?.durationSeconds || 0;
    return {
      id: activeProfile.id,
      name: activeProfile.name,
      description: activeProfile.description,
      inhaleSeconds: findDur('inhale') || 4,
      holdInSeconds: findDur('hold-in') || undefined,
      exhaleSeconds: findDur('exhale') || 4,
      holdOutSeconds: findDur('hold-out') || undefined,
      cycles: activeProfile.breathingConfig.cycleCount,
      visualStyle: activeProfile.id.includes('box') ? 'square' : 'circle',
    };
  }, [activeProfile]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!timerState || !activeProfile || activeProfile.totalDurationSeconds === 0) return 0;
    return Math.min((timerState.totalElapsedSeconds / activeProfile.totalDurationSeconds) * 100, 100);
  };

  const getPhaseProgressPercentage = (): number => {
    if (!timerState || !activeProfile) return 0;

    if (activeProfile.type === 'series' && timerState.seriesState) {
      const currentStep = timerState.seriesState.currentStep;
      if (!currentStep) return 0;

      const isRest = timerState.seriesState.currentPhase === 'rest';
      const phaseDuration = isRest
        ? currentStep.restMinutes * 60 + currentStep.restSeconds
        : currentStep.durationMinutes * 60 + currentStep.durationSeconds;

      if (phaseDuration === 0) return 0;
      const elapsed = phaseDuration - timerState.remainingSeconds;
      return Math.min((elapsed / phaseDuration) * 100, 100);
    }

    if (activeProfile.type === 'simple' && timerState.simpleState) {
      const isWork = timerState.simpleState.isWorkPhase;
      const phaseDuration = isWork
        ? (activeProfile.simpleDuration?.workMinutes || 0) * 60 +
          (activeProfile.simpleDuration?.workSeconds || 0)
        : (activeProfile.simpleDuration?.breakMinutes || 0) * 60 +
          (activeProfile.simpleDuration?.breakSeconds || 0);

      if (phaseDuration === 0) return 0;
      const elapsed = phaseDuration - timerState.remainingSeconds;
      return Math.min((elapsed / phaseDuration) * 100, 100);
    }

    return 0;
  };

  const isRestPhase = (): boolean => {
    if (!timerState) return false;
    if (activeProfile?.type === 'series' && timerState.seriesState) {
      return timerState.seriesState.currentPhase === 'rest';
    }
    if (activeProfile?.type === 'simple' && timerState.simpleState) {
      return !timerState.simpleState.isWorkPhase;
    }
    return false;
  };

  const getPhaseDescription = (): string => {
    if (!timerState || !activeProfile) return '';

    switch (activeProfile.type) {
      case 'simple':
        return timerState.simpleState?.isWorkPhase ? 'Focus Time' : 'Break Time';

      case 'series': {
        if (!timerState.seriesState) return '';
        const { currentPhase, currentStep } = timerState.seriesState;
        if (currentPhase === 'warmup') return 'Warming Up';
        if (currentPhase === 'cooldown') return 'Cooling Down';
        if (currentPhase === 'rest') return 'Rest';
        return currentStep?.name || 'Exercise';
      }

      case 'breathing': {
        if (!timerState.breathingState) return '';
        const phase = timerState.breathingState.currentPhase;
        const cycle = timerState.breathingState.currentCycle;
        const totalCycles = activeProfile.breathingConfig?.cycleCount || 0;
        const phaseNames = {
          inhale: 'Breathe In',
          'hold-in': 'Hold',
          exhale: 'Breathe Out',
          'hold-out': 'Hold',
        };
        return `${phaseNames[phase.type]} (Cycle ${cycle}/${totalCycles})`;
      }

      default:
        return '';
    }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!activeProfile) return {};
    if (activeProfile.type === 'breathing' && timerState?.breathingState) {
      const phase = timerState.breathingState.currentPhase.type;
      const colors = {
        inhale: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
        'hold-in': 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)',
        exhale: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)',
        'hold-out': 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)',
      };
      return { background: colors[phase] };
    }
    return {};
  };

  const steps = activeProfile?.seriesConfig?.steps || [];
  const currentStepIndex = timerState?.seriesState?.currentStepIndex ?? 0;
  const currentStep = timerState?.seriesState?.currentStep;
  const nextStep = currentStepIndex + 1 < steps.length ? steps[currentStepIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={getBackgroundStyle()}>
      {/* Header & 4-View Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-2 py-3">
            <h1 className="text-xl font-semibold text-gray-900">LiveLong ⊹</h1>
            <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
              {([
                { id: 'practice', label: 'Practice' },
                { id: 'practices', label: 'Practices' },
                { id: 'progress', label: 'Progress' },
                { id: 'settings', label: 'Settings' },
              ] as { id: ActiveTab; label: string }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {activeTab === 'practices' && (
          <UnifiedProfileManager onProfileSelect={() => setActiveTab('practice')} />
        )}

        {activeTab === 'progress' && <ProgressView />}

        {activeTab === 'settings' && <SettingsView />}

        {activeTab === 'practice' && (
          <div className="w-full max-w-lg">
            {activeProfile && (
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{activeProfile.icon}</div>
                <h2 className="text-2xl font-bold text-gray-800">{activeProfile.name}</h2>
                <p className="text-gray-600 text-sm">{activeProfile.description}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
              {/* Exercise Animation Slot + Quick Variant/View Controls for Series */}
              {activeProfile?.type === 'series' && currentStep && (
                <div>
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {(['standing', 'chair'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => updatePreferences({ variant: v })}
                          className={`px-2.5 py-1 text-xs rounded border ${
                            preferences.variant === v
                              ? 'bg-gray-800 text-white border-gray-800'
                              : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          {v === 'standing' ? 'Standing' : 'Chair'}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {(['front', 'side', 'both'] as const).map((vw) => (
                        <button
                          key={vw}
                          type="button"
                          onClick={() => updatePreferences({ views: vw })}
                          className={`px-2.5 py-1 text-xs rounded border capitalize ${
                            preferences.views === vw
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          {vw}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ExerciseAnimationPlayer
                    stepId={currentStep.id}
                    stepName={currentStep.name}
                    instructions={currentStep.instructions}
                    animation={currentStep.animation}
                    characterId={preferences.characterId}
                    variant={preferences.variant}
                    views={preferences.views}
                    isPlaying={timerState?.status === 'running'}
                    phase={timerState?.seriesState?.currentPhase || 'exercise'}
                  />
                </div>
              )}

              {/* Breathing Visualizer for Breathing Practices */}
              {activeProfile?.type === 'breathing' && breathingPatternForVisualizer ? (
                <BreathingVisualizer
                  pattern={breathingPatternForVisualizer}
                  isActive={timerState?.status === 'running'}
                  embedded
                  externalState={{
                    phase: timerState?.breathingState?.currentPhase.type || 'inhale',
                    remainingSeconds: timerState?.remainingSeconds || 0,
                    currentCycle: timerState?.breathingState?.currentCycle || 1,
                    totalCycles: activeProfile.breathingConfig?.cycleCount || 1,
                  }}
                />
              ) : (
                /* Dual Progress Circles for Series & Simple Timers */
                <>
                  <div className="relative w-56 h-56 mx-auto mb-5">
                    <svg className="transform -rotate-90 w-56 h-56 absolute" viewBox="0 0 256 256">
                      <circle cx="128" cy="128" r="120" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="#6b7280"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgressPercentage() / 100)}`}
                        className="transition-all duration-1000 opacity-50"
                      />
                      <circle cx="128" cy="128" r="100" stroke="#f3f4f6" strokeWidth="16" fill="none" />
                      <circle
                        cx="128"
                        cy="128"
                        r="100"
                        stroke={isRestPhase() ? '#ca8a04' : '#22c55e'}
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 100}`}
                        strokeDashoffset={`${2 * Math.PI * 100 * (1 - getPhaseProgressPercentage() / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isRestPhase() ? 'bg-yellow-600' : 'bg-green-500'
                          } animate-pulse`}
                        />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {isRestPhase() ? 'Rest' : 'Active'}
                        </span>
                      </div>
                      <div data-testid="time-display" className="text-4xl font-bold text-gray-800">
                        {formatTime(timerState?.remainingSeconds || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center px-4">
                        {getPhaseDescription()}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-5 mb-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                      <span className="text-gray-600">Active Phase</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-yellow-600 rounded-full" />
                      <span className="text-gray-600">Rest Phase</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-gray-500 rounded-full" />
                      <span className="text-gray-600">Total Progress</span>
                    </div>
                  </div>
                </>
              )}

              {/* Guided Step Progress & Up-Next List for Series */}
              {activeProfile?.type === 'series' && timerState?.seriesState && (
                <div className="mb-5 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>
                      Step {currentStepIndex + 1} of {steps.length}
                    </span>
                    {nextStep && <span>Up next: {nextStep.name}</span>}
                  </div>
                  <div className="flex gap-1 mb-3">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex-1 h-2 rounded ${
                          timerState.seriesState?.completedSteps.includes(step.id)
                            ? 'bg-green-500'
                            : index === currentStepIndex
                            ? 'bg-blue-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <ol className="space-y-1 max-h-36 overflow-y-auto text-xs">
                    {steps.map((step, index) => {
                      const done = timerState.seriesState?.completedSteps.includes(step.id);
                      const active = index === currentStepIndex;
                      return (
                        <li
                          key={step.id}
                          className={`flex justify-between px-2 py-1 rounded ${
                            active
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : done
                              ? 'text-green-700 line-through'
                              : 'text-gray-500'
                          }`}
                        >
                          <span>
                            {index + 1}. {step.name}
                          </span>
                          <span>{step.durationMinutes}m</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex justify-center gap-4 mt-4">
                {timerState?.status === 'idle' && (
                  <button
                    data-testid="start-focus-button"
                    onClick={startTimer}
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Start
                  </button>
                )}

                {timerState?.status === 'running' && (
                  <>
                    <button
                      data-testid="pause-button"
                      onClick={pauseTimer}
                      className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                      Pause
                    </button>
                    <button
                      data-testid="stop-button"
                      onClick={stopTimer}
                      className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Stop
                    </button>
                  </>
                )}

                {timerState?.status === 'paused' && (
                  <>
                    <button
                      data-testid="resume-button"
                      onClick={resumeTimer}
                      className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Resume
                    </button>
                    <button
                      data-testid="stop-button"
                      onClick={stopTimer}
                      className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setActiveTab('practices')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Choose Another Practice →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
