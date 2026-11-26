// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/timer/UnifiedTimerDisplay.tsx
// Description: Studio-HUD 4-view LiveLong PWA shell (Practice, Practices, Progress, Settings)
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
import { RoutineIcon } from '@/components/profiles/IconPicker';

type ActiveTab = 'practice' | 'practices' | 'progress' | 'settings';

export default function UnifiedTimerDisplay() {
  const {
    profiles,
    customProfiles,
    sessionPlans,
    pinnedIds,
    activeProfile,
    timerState,
    preferences,
    profileMusicMap,
    isIntroPlaying,
    activeSessionPlan,
    activeSessionIndex,
    selectProfile,
    startSessionPlan,
    updatePreferences,
    setBreathingCycles,
    startTimer,
    skipIntro,
    pauseTimer,
    resumeTimer,
    stopTimer,
    jumpToStep,
    nextStep: goToNextStep,
    prevStep: goToPrevStep,
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

    if (activeProfile.type === 'series' && timerState.seriesState && activeProfile.seriesConfig) {
      const { currentPhase, currentStep } = timerState.seriesState;
      let phaseDuration = 0;
      if (currentPhase === 'warmup') {
        phaseDuration =
          activeProfile.seriesConfig.warmupMinutes * 60 +
          activeProfile.seriesConfig.warmupSeconds;
      } else if (currentPhase === 'cooldown') {
        phaseDuration =
          activeProfile.seriesConfig.cooldownMinutes * 60 +
          activeProfile.seriesConfig.cooldownSeconds;
      } else if (currentPhase === 'rest' && currentStep) {
        phaseDuration = currentStep.restMinutes * 60 + currentStep.restSeconds;
      } else if (currentStep) {
        phaseDuration = currentStep.durationMinutes * 60 + currentStep.durationSeconds;
      }
      if (phaseDuration === 0) return 0;
      const elapsed = phaseDuration - timerState.remainingSeconds;
      return Math.min(Math.max((elapsed / phaseDuration) * 100, 0), 100);
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
  const seriesPhase = timerState?.seriesState?.currentPhase || 'exercise';

  const currentStepExTotal = currentStep
    ? currentStep.durationMinutes * 60 + currentStep.durationSeconds
    : 0;
  const currentStepRestTotal = currentStep
    ? currentStep.restMinutes * 60 + currentStep.restSeconds
    : 0;

  const warmupTotal =
    (activeProfile?.seriesConfig?.warmupMinutes || 0) * 60 +
    (activeProfile?.seriesConfig?.warmupSeconds || 0);

  const exerciseProgressPct = (() => {
    if (!timerState) return 0;
    if (seriesPhase === 'warmup') {
      if (warmupTotal === 0) return 0;
      return Math.min(Math.max(((warmupTotal - timerState.remainingSeconds) / warmupTotal) * 100, 0), 100);
    }
    if (currentStepExTotal === 0) return 0;
    if (seriesPhase === 'rest' || seriesPhase === 'cooldown') return 100;
    return Math.min(Math.max(((currentStepExTotal - timerState.remainingSeconds) / currentStepExTotal) * 100, 0), 100);
  })();

  const restProgressPct = (() => {
    if (!timerState || currentStepRestTotal === 0 || seriesPhase !== 'rest') return 0;
    return Math.min(((currentStepRestTotal - timerState.remainingSeconds) / currentStepRestTotal) * 100, 100);
  })();

  const activeMusicTrackId = activeProfile
    ? profileMusicMap[activeProfile.id] || activeProfile.musicTrackId || 'none'
    : 'none';

  const renderAudioMixer = () => (
    <div
      data-testid="audio-channel-mixer"
      className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs"
    >
      <button
        type="button"
        data-testid="toggle-chime-mute"
        onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
        className={`px-2 py-1 rounded-md border font-medium ${
          preferences.soundEnabled
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}
        aria-label={preferences.soundEnabled ? 'Mute chimes' : 'Unmute chimes'}
      >
        {preferences.soundEnabled ? '🔔 Chimes' : '🔕 Chimes'}
      </button>
      <button
        type="button"
        data-testid="toggle-voice-mute"
        onClick={() => updatePreferences({ voiceCuesEnabled: !preferences.voiceCuesEnabled })}
        className={`px-2 py-1 rounded-md border font-medium ${
          preferences.voiceCuesEnabled
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}
        aria-label={preferences.voiceCuesEnabled ? 'Mute script voice' : 'Unmute script voice'}
      >
        {preferences.voiceCuesEnabled ? '🔊 Script' : '🔇 Script'}
      </button>
      <button
        type="button"
        data-testid="toggle-music-mute"
        onClick={() => updatePreferences({ musicMuted: !preferences.musicMuted })}
        disabled={activeMusicTrackId === 'none'}
        className={`px-2 py-1 rounded-md border font-medium disabled:opacity-40 ${
          !preferences.musicMuted && activeMusicTrackId !== 'none'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}
        aria-label={preferences.musicMuted ? 'Unmute background music' : 'Mute background music'}
      >
        {preferences.musicMuted || activeMusicTrackId === 'none' ? '🔇 Music' : '🎵 Music'}
      </button>
    </div>
  );

  const renderControlButtons = () => (
    <div className="flex gap-2">
      {isIntroPlaying ? (
        <>
          <button
            type="button"
            onClick={skipIntro}
            className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            Skip Intro &amp; Start
          </button>
          <button
            type="button"
            onClick={stopTimer}
            className="flex-1 px-5 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          {timerState?.status === 'idle' && (
        <button
          data-testid="start-focus-button"
          onClick={startTimer}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
        >
          Start
        </button>
      )}

      {timerState?.status === 'running' && (
        <>
          <button
            data-testid="pause-button"
            onClick={pauseTimer}
            className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            Pause
          </button>
          <button
            data-testid="stop-button"
            onClick={stopTimer}
            className="flex-1 px-5 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition-colors font-semibold text-sm"
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
            className="flex-1 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-sm"
          >
            Resume
          </button>
          <button
            data-testid="stop-button"
            onClick={stopTimer}
            className="flex-1 px-5 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition-colors font-semibold text-sm"
          >
            Stop
          </button>
        </>
      )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100" style={getBackgroundStyle()}>
      {/* Compact Header & 4-View Navigation */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-between items-center gap-2 py-2.5">
            <h1 className="text-lg font-bold text-slate-900">LiveLong ⊹</h1>
            <nav className="flex items-center gap-1" aria-label="Primary">
              {([
                { id: 'practice', label: 'Session' },
                { id: 'practices', label: 'Routines' },
                { id: 'progress', label: 'Progress' },
                { id: 'settings', label: 'Settings' },
              ] as { id: ActiveTab; label: string }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'practice' && pinnedIds.length > 0 && (
          <div
            data-testid="pinned-quick-start"
            className="max-w-6xl w-full mx-auto px-3 sm:px-6 pt-2.5 pb-1 flex items-center gap-2 overflow-x-auto"
          >
            <span className="text-xs font-semibold text-slate-500 shrink-0">📌 Pinned:</span>
            {pinnedIds.map((pinId) => {
              const plan = sessionPlans.find((s) => s.id === pinId);
              if (plan) {
                const isSelected = activeSessionPlan?.id === plan.id;
                return (
                  <button
                    key={pinId}
                    type="button"
                    onClick={() => {
                      startSessionPlan(plan.id);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {plan.icon} {plan.name}
                  </button>
                );
              }
              const prof = [...profiles, ...customProfiles].find((p) => p.id === pinId);
              if (!prof) return null;
              const isSelected = !activeSessionPlan && activeProfile?.id === prof.id;
              return (
                <button
                  key={pinId}
                  type="button"
                  onClick={() => selectProfile(prof.id)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                  }`}
                >
                  {prof.icon} {prof.name}
                </button>
              );
            })}
          </div>
        )}
        {activeTab === 'practices' && (
          <div className="py-4">
            <UnifiedProfileManager onProfileSelect={() => setActiveTab('practice')} />
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="py-4">
            <ProgressView />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="py-4">
            <SettingsView />
          </div>
        )}

        {/* PRACTICE: Studio Workout HUD for Series */}
        {activeTab === 'practice' && activeProfile?.type === 'series' && (
          <div className="flex-1 max-w-6xl w-full mx-auto sm:my-4 bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm overflow-hidden flex flex-col">
            {/* Slim Segmented Routine Strip */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200">
              <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5">
                <span>
                  <strong className="text-slate-800 inline-flex items-center gap-1.5">
                    <RoutineIcon icon={activeProfile.icon} className="text-sm" imgClassName="w-4 h-4 object-contain rounded" />
                    <span>{activeProfile.name}</span>
                  </strong>{' '}
                  · Step {currentStepIndex + 1} of {steps.length}
                </span>
                <span>{Math.round(getProgressPercentage())}% complete</span>
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr))` }}>
                {steps.map((step, index) => {
                  const done = timerState?.seriesState?.completedSteps.includes(step.id);
                  const active = index === currentStepIndex;
                  if (active) {
                    const hasRest = step.restMinutes * 60 + step.restSeconds > 0;
                    return (
                      <div
                        key={step.id}
                        className="h-1.5 grid gap-0.5"
                        style={{ gridTemplateColumns: hasRest ? '4fr 1fr' : '1fr' }}
                      >
                        <div className="bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 transition-all duration-500"
                            style={{ width: `${exerciseProgressPct}%` }}
                          />
                        </div>
                        {hasRest && (
                          <div className="bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 transition-all duration-500"
                              style={{ width: `${restProgressPct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={step.id}
                      className={`h-1.5 rounded-full ${done ? 'bg-green-600' : 'bg-slate-200'}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Hero Stage + Docked HUD */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
              {currentStep && (
                <ExerciseAnimationPlayer
                  stepId={currentStep.id}
                  stepName={currentStep.name}
                  animation={currentStep.animation}
                  characterId={preferences.characterId}
                  variant={preferences.variant}
                  views={preferences.views}
                  isPlaying={timerState?.status === 'running'}
                  phase={seriesPhase}
                />
              )}

              <div className="border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50 p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <span
                        className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 ${
                          seriesPhase === 'rest' || seriesPhase === 'cooldown'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {seriesPhase === 'warmup'
                          ? 'Warm Up'
                          : seriesPhase === 'rest'
                          ? 'Rest'
                          : seriesPhase === 'cooldown'
                          ? 'Cool Down'
                          : 'Exercise'}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {currentStepIndex + 1}. {currentStep?.name || activeProfile.name}
                      </h2>
                    </div>
                    <div
                      data-testid="time-display"
                      className="text-3xl sm:text-4xl font-extrabold tabular-nums text-slate-900"
                    >
                      {formatTime(timerState?.remainingSeconds || 0)}
                    </div>
                  </div>

                  {/* Dual Exercise / Rest Bar for Current Step */}
                  <div className="my-3">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-green-700">
                        Exercise ({formatTime(currentStepExTotal)})
                      </span>
                      <span className="text-amber-700">
                        {currentStepRestTotal > 0
                          ? `Rest (${formatTime(currentStepRestTotal)})`
                          : 'Final Step'}
                      </span>
                    </div>
                    <div
                      className="grid gap-1 h-2"
                      style={{
                        gridTemplateColumns: currentStepRestTotal > 0 ? '4fr 1fr' : '1fr',
                      }}
                    >
                      <div className="bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 transition-all duration-500"
                          style={{ width: `${exerciseProgressPct}%` }}
                        />
                      </div>
                      {currentStepRestTotal > 0 && (
                        <div className="bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${restProgressPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3">
                    {seriesPhase === 'rest'
                      ? `Relax and breathe.${nextStep ? ` Up next: ${nextStep.name}.` : ''}`
                      : currentStep?.instructions || activeProfile.description}
                  </p>

                  {/* Desktop Step List (clickable for rapid review) */}
                  <ol className="hidden md:grid gap-1 text-xs mb-3">
                    {steps.map((step, index) => {
                      const done = timerState?.seriesState?.completedSteps.includes(step.id);
                      const active = index === currentStepIndex;
                      return (
                        <li key={step.id}>
                          <button
                            type="button"
                            onClick={() => jumpToStep(index)}
                            className={`w-full flex justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                              active
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : done
                                ? 'text-green-700 line-through hover:bg-slate-100'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span>
                              {index + 1}. {step.name}
                            </span>
                            <span>
                              {step.durationMinutes}m
                              {step.restSeconds > 0 ? ` + ${step.restSeconds}s` : ''}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>

                  {activeSessionPlan && (
                    <div
                      data-testid="active-session-plan-banner"
                      className="mb-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex justify-between items-center"
                    >
                      <span className="font-medium">
                        {activeSessionPlan.icon} {activeSessionPlan.name}
                      </span>
                      <span>
                        Routine {activeSessionIndex + 1}/{activeSessionPlan.items.length}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <button
                      type="button"
                      data-testid="review-prev-step"
                      onClick={goToPrevStep}
                      disabled={currentStepIndex <= 0}
                      className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      ◀ Prev Step
                    </button>
                    <button
                      type="button"
                      data-testid="review-next-step"
                      onClick={goToNextStep}
                      disabled={currentStepIndex >= steps.length - 1}
                      className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      Next Step ▶
                    </button>
                  </div>
                </div>

                <div>
                  {renderControlButtons()}
                  {renderAudioMixer()}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                    <span>
                      {nextStep ? (
                        <>
                          Up next: <strong className="text-slate-700">{nextStep.name}</strong>
                        </>
                      ) : (
                        'Last step in routine'
                      )}
                    </span>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        ⚙️ Figure
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('practices')}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Switch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRACTICE: Breathing & Focus Timers */}
        {activeTab === 'practice' && activeProfile?.type !== 'series' && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
            <div className="w-full max-w-md">
              {activeProfile && (
                <div className="text-center mb-6">
                  <div className="mb-2 flex justify-center">
                    <RoutineIcon icon={activeProfile.icon} className="text-4xl" imgClassName="w-12 h-12 object-contain rounded-lg" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{activeProfile.name}</h2>
                  <p className="text-slate-600 text-sm">{activeProfile.description}</p>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                {activeProfile?.type === 'breathing' && breathingPatternForVisualizer ? (
                  <>
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
                    {timerState?.status === 'idle' && !isIntroPlaying && activeProfile.breathingConfig && (
                      <div
                        data-testid="breathing-loops-config"
                        className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-600 font-medium">
                          Loops ({formatTime(activeProfile.totalDurationSeconds)} total)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            data-testid="loops-decrease"
                            onClick={() =>
                              setBreathingCycles((activeProfile.breathingConfig?.cycleCount || 1) - 1)
                            }
                            disabled={(activeProfile.breathingConfig?.cycleCount || 1) <= 1}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            aria-label="Decrease loops"
                          >
                            −
                          </button>
                          <span
                            data-testid="loops-count"
                            className="w-8 text-center font-semibold tabular-nums text-slate-900"
                          >
                            {activeProfile.breathingConfig.cycleCount}
                          </span>
                          <button
                            type="button"
                            data-testid="loops-increase"
                            onClick={() =>
                              setBreathingCycles((activeProfile.breathingConfig?.cycleCount || 1) + 1)
                            }
                            disabled={(activeProfile.breathingConfig?.cycleCount || 1) >= 60}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            aria-label="Increase loops"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
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
                          <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                            {isRestPhase() ? 'Rest' : 'Active'}
                          </span>
                        </div>
                        <div data-testid="time-display" className="text-4xl font-bold text-slate-800">
                          {formatTime(timerState?.remainingSeconds || 0)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 text-center px-4">
                          {getPhaseDescription()}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-4">{renderControlButtons()}</div>
                {renderAudioMixer()}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setActiveTab('practices')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose Another Routine →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
