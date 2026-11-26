// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/data/__tests__/data-series.test.ts
import {
  getAllJapaneseExerciseSeries,
  getExerciseSeriesById,
} from '../japanese-exercise-series';
import { getAllBreathingPatterns, getBreathingPatternById } from '../breathing-patterns';
import { getAllBreathingProfiles } from '../breathing-profiles';
import {
  EXERCISE_LIBRARY,
  getExerciseById,
  getExercisesByCategory,
  getExercisesByTag,
  resolveSeriesStep,
} from '../exercise-library';
import { convertExerciseSeriesToUnified } from '@/types/unified-profile.types';

describe('Exercise Library, Series & Breathing Data', () => {
  it('loads all built-in exercise & mindfulness series and calculates totalDurationMinutes', () => {
    const all = getAllJapaneseExerciseSeries();
    expect(all.length).toBeGreaterThanOrEqual(7);
    all.forEach((s) => {
      expect(s.totalDurationMinutes).toBeGreaterThan(0);
    });
    expect(getExerciseSeriesById('rajio-taiso-series')?.name).toContain('Rajio Taiso');
    expect(getExerciseSeriesById('ikigai-reflection-series')?.name).toContain('Ikigai');
    expect(getExerciseSeriesById('zazen-sitting-series')?.name).toContain('Zazen');
    expect(getExerciseSeriesById('desk-reset-series')?.name).toContain('Desk Reset');
    expect(getExerciseSeriesById('core-amrap-series')?.name).toContain('Core AMRAP');
    expect(getExerciseSeriesById('nonexistent')).toBeUndefined();
  });

  it('validates Exercise Library integrity and media bindings', () => {
    const ids = new Set<string>();
    EXERCISE_LIBRARY.forEach((ex) => {
      expect(ids.has(ex.id)).toBe(false);
      ids.add(ex.id);
      expect(ex.flow.trim().length).toBeGreaterThan(0);
      expect(ex.media.audio.cueId).toBeTruthy();
      expect(ex.media.audio.defaultVoiceScript.trim().length).toBeGreaterThan(0);
      expect(ex.media.animation?.pack || ex.media.animation?.fallbackType).toBeTruthy();
    });

    expect(getExerciseById('situps')?.defaultMode).toBe('timed');
    expect(getExerciseById('jumping-jacks')?.defaultMode).toBe('reps');
    expect(getExercisesByCategory('strength').length).toBeGreaterThanOrEqual(4);
    expect(getExercisesByTag('western').length).toBeGreaterThanOrEqual(6);
  });

  it('resolves every step in every built-in series with bound animation and audio cues', () => {
    getAllJapaneseExerciseSeries().forEach((series) => {
      const unified = convertExerciseSeriesToUnified(series);
      unified.seriesConfig?.steps.forEach((rawStep) => {
        const resolved = resolveSeriesStep(rawStep);
        expect(resolved.exerciseId).toBeTruthy();
        expect(resolved.cueId).toBeTruthy();
        expect(resolved.voiceScript).toBeTruthy();
        expect(resolved.instructions).toBeTruthy();
        expect(resolved.animation?.pack).toBeTruthy();
      });
    });
  });

  it('loads breathing patterns and profiles', () => {
    const patterns = getAllBreathingPatterns();
    expect(patterns.length).toBeGreaterThanOrEqual(4);
    expect(getBreathingPatternById('box-breathing')?.inhaleSeconds).toBe(4);
    expect(getAllBreathingProfiles().length).toBeGreaterThanOrEqual(4);
  });
});
