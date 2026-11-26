// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/data/breathing-profiles.ts
// Description: Breathing exercise profiles with integrated breathing patterns
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { Profile, ProfileCategory } from '@/types/profile.types';
import { BREATHING_PATTERNS, calculateBreathingPatternDuration } from './breathing-patterns';

/**
 * Box Breathing Profile
 */
export const BOX_BREATHING_PROFILE: Profile = {
  id: 'box-breathing-profile',
  name: 'Box Breathing',
  description: 'Equal four-count breathing for calm focus and stress reduction',
  category: ProfileCategory.MEDITATION,
  durationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.BOX_BREATHING),
  breakDurationMinutes: 2,
  longBreakDurationMinutes: 5,
  breakFrequency: 1,
  themeColor: '#3b82f6',
  aiCoachingEnabled: true,
  exerciseSeries: {
    id: 'box-breathing-series',
    name: 'Box Breathing Session',
    description: 'Structured breathing for mental clarity',
    steps: [
      {
        id: 'box-breathing-main',
        name: 'Box Breathing',
        description: 'Equal count breathing pattern',
        durationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.BOX_BREATHING),
        restDurationMinutes: 0,
        instructions: 'Breathe in for 4, hold for 4, breathe out for 4, hold for 4'
      }
    ],
    totalDurationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.BOX_BREATHING),
    breathingPattern: BREATHING_PATTERNS.BOX_BREATHING,
    backgroundAnimation: 'breathing-squares'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * 4-7-8 Breathing Profile
 */
export const FOUR_SEVEN_EIGHT_PROFILE: Profile = {
  id: '4-7-8-breathing-profile',
  name: '4-7-8 Relaxation',
  description: 'Dr. Andrew Weil\'s natural tranquilizer technique',
  category: ProfileCategory.MEDITATION,
  durationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.FOUR_SEVEN_EIGHT_BREATHING),
  breakDurationMinutes: 3,
  longBreakDurationMinutes: 10,
  breakFrequency: 1,
  themeColor: '#10b981',
  aiCoachingEnabled: true,
  exerciseSeries: {
    id: '4-7-8-breathing-series',
    name: '4-7-8 Breathing Session',
    description: 'Calming breath work for relaxation',
    steps: [
      {
        id: '4-7-8-breathing-main',
        name: '4-7-8 Breathing',
        description: 'Relaxing breathing pattern',
        durationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.FOUR_SEVEN_EIGHT_BREATHING),
        restDurationMinutes: 0,
        instructions: 'Breathe in for 4, hold for 7, breathe out for 8'
      }
    ],
    totalDurationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.FOUR_SEVEN_EIGHT_BREATHING),
    breathingPattern: BREATHING_PATTERNS.FOUR_SEVEN_EIGHT_BREATHING,
    backgroundAnimation: 'gentle-waves'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Wim Hof Breathing Profile
 */
export const WIM_HOF_PROFILE: Profile = {
  id: 'wim-hof-breathing-profile',
  name: 'Wim Hof Breathing',
  description: 'Energizing breath work for vitality and resilience',
  category: ProfileCategory.EXERCISE,
  durationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.WIM_HOF_BREATHING),
  breakDurationMinutes: 5,
  longBreakDurationMinutes: 10,
  breakFrequency: 1,
  themeColor: '#ef4444',
  aiCoachingEnabled: true,
  exerciseSeries: {
    id: 'wim-hof-breathing-series',
    name: 'Wim Hof Breathing Session',
    description: 'Power breathing for energy and resilience',
    steps: [
      {
        id: 'wim-hof-breathing-main',
        name: 'Wim Hof Breathing',
        description: 'Energizing breathing pattern',
        durationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.WIM_HOF_BREATHING),
        restDurationMinutes: 0,
        instructions: '30 deep breaths followed by retention'
      }
    ],
    totalDurationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.WIM_HOF_BREATHING),
    breathingPattern: BREATHING_PATTERNS.WIM_HOF_BREATHING,
    backgroundAnimation: 'ice-crystals'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Deep Breathing Profile
 */
export const DEEP_BREATHING_PROFILE: Profile = {
  id: 'deep-breathing-profile',
  name: 'Deep Breathing',
  description: 'Simple deep breathing for stress relief and focus',
  category: ProfileCategory.MEDITATION,
  durationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.DEEP_BREATHING),
  breakDurationMinutes: 2,
  longBreakDurationMinutes: 5,
  breakFrequency: 1,
  themeColor: '#8b5cf6',
  aiCoachingEnabled: true,
  exerciseSeries: {
    id: 'deep-breathing-series',
    name: 'Deep Breathing Session',
    description: 'Calming deep breath work',
    steps: [
      {
        id: 'deep-breathing-main',
        name: 'Deep Breathing',
        description: 'Simple deep breathing pattern',
        durationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.DEEP_BREATHING),
        restDurationMinutes: 0,
        instructions: 'Breathe in smoothly for 6 seconds, breathe out slowly for 8 seconds'
      }
    ],
    totalDurationMinutes: calculateBreathingPatternDuration(BREATHING_PATTERNS.DEEP_BREATHING),
    breathingPattern: BREATHING_PATTERNS.DEEP_BREATHING,
    backgroundAnimation: 'flowing-clouds'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Collection of all breathing profiles
 */
export const BREATHING_PROFILES = {
  BOX_BREATHING: BOX_BREATHING_PROFILE,
  FOUR_SEVEN_EIGHT: FOUR_SEVEN_EIGHT_PROFILE,
  WIM_HOF: WIM_HOF_PROFILE,
  DEEP_BREATHING: DEEP_BREATHING_PROFILE,
} as const;

/**
 * Get all breathing profiles as an array
 */
export function getAllBreathingProfiles(): Profile[] {
  return Object.values(BREATHING_PROFILES);
}