// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/RoutineEditorModal.tsx
// Description: Modal editor for creating and editing Simple, Exercise Series, and Breathing routines
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-23

'use client';

import React, { useState } from 'react';
import {
  BreathingPhase,
  SeriesStep,
  UnifiedProfile,
  createBreathingProfile,
  createSeriesProfile,
  createSimpleProfile,
  calculateSeriesTotalSeconds,
} from '@/types/unified-profile.types';
import {
  MusicTrackOption,
  backgroundMusicService,
} from '@/services/audio/BackgroundMusicService';
import { audioCueService } from '@/services/audio/AudioCueService';
import IconPicker from './IconPicker';

interface RoutineEditorModalProps {
  profile?: UnifiedProfile;
  musicOptions: MusicTrackOption[];
  onClose: () => void;
  onSave: (profile: UnifiedProfile) => void;
}

const ICONS = ['⏱️', '🤸', '🫁', '🧘', '📚', '💻', '🎯', '🔥', '🌿', '🌟'];

function makeEmptyStep(index: number): SeriesStep {
  return {
    id: `step-${Date.now()}-${index}`,
    name: `Movement ${index + 1}`,
    description: '',
    durationMinutes: 1,
    durationSeconds: 0,
    restMinutes: 0,
    restSeconds: 15,
    instructions: '',
    cueId: '',
    voiceScript: '',
    animation: { pack: `custom.step-${index + 1}`, version: '^1' },
  };
}

export default function RoutineEditorModal({
  profile,
  musicOptions,
  onClose,
  onSave,
}: RoutineEditorModalProps) {
  const isEditing = Boolean(profile);
  const [routineType, setRoutineType] = useState<'simple' | 'series' | 'breathing'>(
    profile?.type || 'series'
  );
  const [name, setName] = useState(profile?.name || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [icon, setIcon] = useState(profile?.icon || '🤸');
  const [color, setColor] = useState(profile?.color || '#3b82f6');
  const [musicTrackId, setMusicTrackId] = useState(profile?.musicTrackId || 'none');
  const [isPreviewingMusic, setIsPreviewingMusic] = useState(false);

  // Simple state
  const [workMinutes, setWorkMinutes] = useState(profile?.simpleDuration?.workMinutes ?? 25);
  const [workSeconds, setWorkSeconds] = useState(profile?.simpleDuration?.workSeconds ?? 0);
  const [breakMinutes, setBreakMinutes] = useState(profile?.simpleDuration?.breakMinutes ?? 5);
  const [breakSeconds, setBreakSeconds] = useState(profile?.simpleDuration?.breakSeconds ?? 0);

  // Series state
  const [warmupMinutes, setWarmupMinutes] = useState(profile?.seriesConfig?.warmupMinutes ?? 0);
  const [warmupSeconds, setWarmupSeconds] = useState(profile?.seriesConfig?.warmupSeconds ?? 30);
  const [cooldownMinutes, setCooldownMinutes] = useState(profile?.seriesConfig?.cooldownMinutes ?? 0);
  const [cooldownSeconds, setCooldownSeconds] = useState(profile?.seriesConfig?.cooldownSeconds ?? 30);
  const [steps, setSteps] = useState<SeriesStep[]>(
    profile?.seriesConfig?.steps?.length
      ? profile.seriesConfig.steps.map((s) => ({ ...s }))
      : [makeEmptyStep(0)]
  );

  // Breathing state
  const initialPattern = profile?.breathingConfig?.pattern || [
    { type: 'inhale', durationSeconds: 4, instruction: 'Breathe in slowly' },
    { type: 'hold-in', durationSeconds: 4, instruction: 'Hold gently' },
    { type: 'exhale', durationSeconds: 4, instruction: 'Breathe out slowly' },
    { type: 'hold-out', durationSeconds: 4, instruction: 'Rest empty' },
  ];
  const findPhase = (t: BreathingPhase['type']) =>
    initialPattern.find((p) => p.type === t)?.durationSeconds ?? 0;

  const [cycleCount, setCycleCount] = useState(profile?.breathingConfig?.cycleCount ?? 6);
  const [inhaleSec, setInhaleSec] = useState(findPhase('inhale') || 4);
  const [holdInSec, setHoldInSec] = useState(findPhase('hold-in'));
  const [exhaleSec, setExhaleSec] = useState(findPhase('exhale') || 4);
  const [holdOutSec, setHoldOutSec] = useState(findPhase('hold-out'));

  const moveStep = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    const copy = [...steps];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    setSteps(copy);
  };

  const updateStep = (idx: number, patch: Partial<SeriesStep>) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let result: UnifiedProfile;

    if (routineType === 'simple') {
      if (profile) {
        const totalSeconds =
          workMinutes * 60 + workSeconds + breakMinutes * 60 + breakSeconds;
        result = {
          ...profile,
          name,
          description,
          icon,
          color,
          musicTrackId,
          simpleDuration: { workMinutes, workSeconds, breakMinutes, breakSeconds },
          totalDurationSeconds: totalSeconds,
          updatedAt: new Date(),
        };
      } else {
        result = createSimpleProfile(
          name,
          description,
          workMinutes + workSeconds / 60,
          breakMinutes + breakSeconds / 60,
          color,
          icon
        );
        result.musicTrackId = musicTrackId;
      }
    } else if (routineType === 'series') {
      const cleanSteps = steps.length > 0 ? steps : [makeEmptyStep(0)];
      if (profile) {
        result = {
          ...profile,
          name,
          description,
          icon,
          color,
          musicTrackId,
          seriesConfig: {
            warmupMinutes,
            warmupSeconds,
            cooldownMinutes,
            cooldownSeconds,
            steps: cleanSteps,
          },
          totalDurationSeconds: calculateSeriesTotalSeconds(
            warmupMinutes,
            warmupSeconds,
            cooldownMinutes,
            cooldownSeconds,
            cleanSteps
          ),
          updatedAt: new Date(),
        };
      } else {
        result = createSeriesProfile({
          name,
          description,
          icon,
          color,
          musicTrackId,
          warmupMinutes,
          warmupSeconds,
          cooldownMinutes,
          cooldownSeconds,
          steps: cleanSteps,
        });
      }
    } else {
      const pattern: BreathingPhase[] = [];
      if (inhaleSec > 0) pattern.push({ type: 'inhale', durationSeconds: inhaleSec, instruction: 'Breathe in slowly' });
      if (holdInSec > 0) pattern.push({ type: 'hold-in', durationSeconds: holdInSec, instruction: 'Hold gently' });
      if (exhaleSec > 0) pattern.push({ type: 'exhale', durationSeconds: exhaleSec, instruction: 'Breathe out slowly' });
      if (holdOutSec > 0) pattern.push({ type: 'hold-out', durationSeconds: holdOutSec, instruction: 'Rest empty' });
      const finalPattern = pattern.length > 0 ? pattern : [{ type: 'inhale' as const, durationSeconds: 4 }];
      const cycleSec = finalPattern.reduce((acc, p) => acc + p.durationSeconds, 0);

      if (profile) {
        result = {
          ...profile,
          name,
          description,
          icon,
          color,
          musicTrackId,
          breathingConfig: {
            pattern: finalPattern,
            cycleCount,
            totalDurationMinutes: (cycleSec * cycleCount) / 60,
          },
          totalDurationSeconds: cycleSec * cycleCount,
          updatedAt: new Date(),
        };
      } else {
        result = createBreathingProfile({
          name,
          description,
          icon,
          color,
          musicTrackId,
          pattern: finalPattern,
          cycleCount,
        });
      }
    }

    onSave(result);
    onClose();
  };

  return (
    <div
      data-testid="routine-editor-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? `Edit Routine: ${profile?.name}` : 'Create Routine'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 px-2 py-1"
            aria-label="Close routine editor"
          >
            ✕
          </button>
        </div>

        {!isEditing && (
          <div className="flex gap-2 mb-4">
            {([
              { id: 'series', label: 'Exercise Series' },
              { id: 'breathing', label: 'Breathing Routine' },
              { id: 'simple', label: 'Simple Timer' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoutineType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  routineType === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Music &amp; Chime</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={musicTrackId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMusicTrackId(val);
                    if (isPreviewingMusic) {
                      const playing = backgroundMusicService.previewToggle(val, musicOptions);
                      setIsPreviewingMusic(playing);
                    }
                  }}
                  className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {musicOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={musicTrackId === 'none'}
                  onClick={() => {
                    const playing = backgroundMusicService.previewToggle(musicTrackId, musicOptions);
                    setIsPreviewingMusic(playing);
                  }}
                  className="px-2.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40"
                  title={isPreviewingMusic ? 'Stop music preview' : 'Preview music'}
                >
                  {isPreviewingMusic ? '⏹' : '▶'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioCueService.unlock();
                    audioCueService.playChime('phase');
                  }}
                  className="px-2.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg"
                  title="Preview chime"
                >
                  🔔
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              rows={2}
            />
          </div>

          <IconPicker value={icon} onChange={setIcon} />

          {routineType === 'simple' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Work Duration</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={workMinutes}
                    onChange={(e) => setWorkMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-20 px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                  <span className="text-xs text-slate-600">min</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={workSeconds}
                    onChange={(e) => setWorkSeconds(parseInt(e.target.value, 10) || 0)}
                    className="w-20 px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                  <span className="text-xs text-slate-600">sec</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Break Duration</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-20 px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                  <span className="text-xs text-slate-600">min</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={breakSeconds}
                    onChange={(e) => setBreakSeconds(parseInt(e.target.value, 10) || 0)}
                    className="w-20 px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                  <span className="text-xs text-slate-600">sec</span>
                </div>
              </div>
            </div>
          )}

          {routineType === 'series' && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Warmup</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={warmupMinutes}
                      onChange={(e) => setWarmupMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <span className="text-xs">m</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={warmupSeconds}
                      onChange={(e) => setWarmupSeconds(parseInt(e.target.value, 10) || 0)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <span className="text-xs">s</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cooldown</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={cooldownMinutes}
                      onChange={(e) => setCooldownMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <span className="text-xs">m</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={cooldownSeconds}
                      onChange={(e) => setCooldownSeconds(parseInt(e.target.value, 10) || 0)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <span className="text-xs">s</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-slate-800">
                  Steps ({steps.length})
                </span>
                <button
                  type="button"
                  onClick={() => setSteps((prev) => [...prev, makeEmptyStep(prev.length)])}
                  className="px-2.5 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Add Step
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {steps.map((step, idx) => (
                  <div key={step.id} className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => updateStep(idx, { name: e.target.value })}
                        placeholder="Step name"
                        className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm font-medium"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveStep(idx, -1)}
                          disabled={idx === 0}
                          className="px-1.5 py-0.5 text-xs bg-slate-100 rounded disabled:opacity-40"
                          aria-label="Move step up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(idx, 1)}
                          disabled={idx === steps.length - 1}
                          className="px-1.5 py-0.5 text-xs bg-slate-100 rounded disabled:opacity-40"
                          aria-label="Move step down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSteps((prev) => prev.filter((_, i) => i !== idx))
                          }
                          disabled={steps.length <= 1}
                          className="px-1.5 py-0.5 text-xs text-red-600 bg-red-50 rounded disabled:opacity-40"
                          aria-label="Remove step"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <label className="flex items-center gap-1">
                        Dur m
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={step.durationMinutes}
                          onChange={(e) =>
                            updateStep(idx, { durationMinutes: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-12 px-1.5 py-1 border border-slate-300 rounded"
                        />
                      </label>
                      <label className="flex items-center gap-1">
                        Dur s
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={step.durationSeconds}
                          onChange={(e) =>
                            updateStep(idx, { durationSeconds: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-12 px-1.5 py-1 border border-slate-300 rounded"
                        />
                      </label>
                      <label className="flex items-center gap-1">
                        Rest s
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={step.restMinutes * 60 + step.restSeconds}
                          onChange={(e) => {
                            const total = Math.max(0, parseInt(e.target.value, 10) || 0);
                            updateStep(idx, {
                              restMinutes: Math.floor(total / 60),
                              restSeconds: total % 60,
                            });
                          }}
                          className="w-14 px-1.5 py-1 border border-slate-300 rounded"
                        />
                      </label>
                      <input
                        type="text"
                        value={step.animation?.pack || ''}
                        onChange={(e) =>
                          updateStep(idx, {
                            animation: { pack: e.target.value, version: '^1' },
                          })
                        }
                        placeholder="Animation pack"
                        className="px-2 py-1 border border-slate-300 rounded"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={step.voiceScript || step.instructions || ''}
                        onChange={(e) =>
                          updateStep(idx, {
                            voiceScript: e.target.value,
                            instructions: e.target.value,
                          })
                        }
                        placeholder="Guided script / voice cue text"
                        className="px-2 py-1 border border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        value={step.cueId || ''}
                        onChange={(e) => updateStep(idx, { cueId: e.target.value })}
                        placeholder="Cue ID (optional, e.g. rajio-taiso.arm-swings)"
                        className="px-2 py-1 border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {routineType === 'breathing' && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <label className="flex flex-col gap-1">
                  Cycles
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={cycleCount}
                    onChange={(e) => setCycleCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Inhale (s)
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={inhaleSec}
                    onChange={(e) => setInhaleSec(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Hold In (s)
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={holdInSec}
                    onChange={(e) => setHoldInSec(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Exhale (s)
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={exhaleSec}
                    onChange={(e) => setExhaleSec(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Hold Out (s)
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={holdOutSec}
                    onChange={(e) => setHoldOutSec(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="save-routine-button"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
            >
              {isEditing ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
