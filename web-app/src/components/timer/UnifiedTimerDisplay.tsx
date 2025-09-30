// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/timer/UnifiedTimerDisplay.tsx
// Description: Unified timer display component supporting all timer types with visual feedback
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-10-01

'use client';

import React, { useEffect, useState } from 'react';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';
import UnifiedProfileManager from '@/components/profiles/UnifiedProfileManager';

export default function UnifiedTimerDisplay() {
  const {
    activeProfile,
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    initializeProfiles
  } = useUnifiedTimerStore();

  const [showProfiles, setShowProfiles] = useState(false);

  useEffect(() => {
    initializeProfiles();
  }, [initializeProfiles]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!timerState || !activeProfile) return 0;

    const totalSeconds = activeProfile.totalDurationSeconds;
    const elapsedSeconds = timerState.totalElapsedSeconds;
    return Math.min((elapsedSeconds / totalSeconds) * 100, 100);
  };

  const getPhaseProgressPercentage = (): number => {
    if (!timerState || !activeProfile) return 0;

    // For series, calculate progress within current phase
    if (activeProfile.type === 'series' && timerState.seriesState) {
      const currentStep = timerState.seriesState.currentStep;
      if (!currentStep) return 0;

      const isRest = timerState.seriesState.currentPhase === 'rest';
      const phaseDuration = isRest
        ? (currentStep.restMinutes * 60 + currentStep.restSeconds)
        : (currentStep.durationMinutes * 60 + currentStep.durationSeconds);

      if (phaseDuration === 0) return 0;
      const elapsed = phaseDuration - timerState.remainingSeconds;
      return Math.min((elapsed / phaseDuration) * 100, 100);
    }

    // For simple timers, calculate work/break phase progress
    if (activeProfile.type === 'simple' && timerState.simpleState) {
      const isWork = timerState.simpleState.isWorkPhase;
      const phaseDuration = isWork
        ? ((activeProfile.simpleDuration?.workMinutes || 0) * 60 + (activeProfile.simpleDuration?.workSeconds || 0))
        : ((activeProfile.simpleDuration?.breakMinutes || 0) * 60 + (activeProfile.simpleDuration?.breakSeconds || 0));

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

      case 'series':
        if (!timerState.seriesState) return '';
        const { currentPhase, currentStep } = timerState.seriesState;
        if (currentPhase === 'warmup') return 'Warming Up';
        if (currentPhase === 'cooldown') return 'Cooling Down';
        if (currentPhase === 'rest') return 'Rest';
        return currentStep?.name || 'Exercise';

      case 'breathing':
        if (!timerState.breathingState) return '';
        const phase = timerState.breathingState.currentPhase;
        const cycle = timerState.breathingState.currentCycle;
        const totalCycles = activeProfile.breathingConfig?.cycleCount || 0;
        const phaseNames = {
          'inhale': 'Breathe In',
          'hold-in': 'Hold',
          'exhale': 'Breathe Out',
          'hold-out': 'Hold'
        };
        return `${phaseNames[phase.type]} (Cycle ${cycle}/${totalCycles})`;

      default:
        return '';
    }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!activeProfile) return {};

    // Dynamic background based on timer type and phase
    if (activeProfile.type === 'breathing' && timerState?.breathingState) {
      const phase = timerState.breathingState.currentPhase.type;
      const colors = {
        'inhale': 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
        'hold-in': 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)',
        'exhale': 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)',
        'hold-out': 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)'
      };
      return { background: colors[phase] };
    }

    return {};
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={getBackgroundStyle()}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Focus & Productivity Timer
            </h1>
            <button
              onClick={() => setShowProfiles(!showProfiles)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showProfiles ? 'Hide Profiles' : 'Show Profiles'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {showProfiles ? (
          <UnifiedProfileManager />
        ) : (
          <div className="w-full max-w-md">
            {/* Profile Info */}
            {activeProfile && (
              <div className="text-center mb-8">
                <div className="text-4xl mb-2">{activeProfile.icon}</div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeProfile.name}
                </h2>
                <p className="text-gray-600">{activeProfile.description}</p>
              </div>
            )}

            {/* Timer Display */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* Dual Progress Circles */}
                <svg className="transform -rotate-90 w-64 h-64 absolute">
                  {/* Outer Circle - Overall Progress */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="#6b7280"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 120 * (1 - getProgressPercentage() / 100)
                    }`}
                    className="transition-all duration-1000 opacity-50"
                  />

                  {/* Inner Circle - Phase Progress (Work/Exercise or Rest/Break) */}
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    stroke="#f3f4f6"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    stroke={isRestPhase() ? '#ca8a04' : '#22c55e'}
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 100}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 100 * (1 - getPhaseProgressPercentage() / 100)
                    }`}
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Timer Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isRestPhase() ? 'bg-yellow-600' : 'bg-green-500'
                    } animate-pulse`} />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                      {isRestPhase() ? 'Rest' : 'Active'}
                    </span>
                  </div>
                  <div
                    data-testid="time-display"
                    className="text-5xl font-bold text-gray-800"
                  >
                    {formatTime(timerState?.remainingSeconds || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {getPhaseDescription()}
                  </div>
                </div>
              </div>

              {/* Legend for circles */}
              <div className="flex justify-center gap-6 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-gray-600">Active Phase</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full" />
                  <span className="text-gray-600">Rest Phase</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  <span className="text-gray-600">Total Progress</span>
                </div>
              </div>

              {/* Step Progress for Series */}
              {activeProfile?.type === 'series' && timerState?.seriesState && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Step {timerState.seriesState.currentStepIndex + 1} of{' '}
                    {activeProfile.seriesConfig?.steps.length || 0}
                  </div>
                  <div className="flex gap-1">
                    {activeProfile.seriesConfig?.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex-1 h-2 rounded ${
                          timerState.seriesState?.completedSteps.includes(step.id)
                            ? 'bg-green-500'
                            : index === timerState.seriesState?.currentStepIndex
                            ? 'bg-blue-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {timerState.seriesState.currentStep && (
                    <div className="mt-2 text-sm text-gray-600">
                      {timerState.seriesState.currentStep.instructions}
                    </div>
                  )}
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex justify-center gap-4">
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

            {/* Quick Profile Selection */}
            <div className="text-center">
              <button
                onClick={() => setShowProfiles(true)}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Change Timer Profile →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}