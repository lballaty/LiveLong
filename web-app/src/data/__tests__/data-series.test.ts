// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/data/__tests__/data-series.test.ts
import {
  getAllJapaneseExerciseSeries,
  getExerciseSeriesById,
} from '../japanese-exercise-series';
import { getAllBreathingPatterns, getBreathingPatternById } from '../breathing-patterns';
import { getAllBreathingProfiles } from '../breathing-profiles';

describe('Exercise Series & Breathing Data', () => {
  it('loads all Japanese exercise series and calculates totalDurationMinutes', () => {
    const all = getAllJapaneseExerciseSeries();
    expect(all.length).toBeGreaterThanOrEqual(3);
    all.forEach((s) => {
      expect(s.totalDurationMinutes).toBeGreaterThan(0);
    });
    expect(getExerciseSeriesById('rajio-taiso-series')?.name).toContain('Rajio Taiso');
    expect(getExerciseSeriesById('nonexistent')).toBeUndefined();
  });

  it('loads breathing patterns and profiles', () => {
    const patterns = getAllBreathingPatterns();
    expect(patterns.length).toBeGreaterThanOrEqual(4);
    expect(getBreathingPatternById('box-breathing')?.inhaleSeconds).toBe(4);
    expect(getAllBreathingProfiles().length).toBeGreaterThanOrEqual(4);
  });
});
