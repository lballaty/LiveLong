// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/data/breathing-patterns.ts
// Description: Breathing patterns for meditation and relaxation exercises
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { BreathingPattern } from '@/types/profile.types';

/**
 * Box Breathing (4-4-4-4) - Equal four-count breathing (Sama Vritti)
 */
export const BOX_BREATHING: BreathingPattern = {
  id: 'box-breathing',
  name: 'Box Breathing',
  description: 'Equal four-count breathing for inhale, hold, exhale, and hold',
  inhaleSeconds: 4,
  holdInSeconds: 4,
  exhaleSeconds: 4,
  holdOutSeconds: 4,
  cycles: 8,
  backgroundAnimation: 'floating-squares',
  visualStyle: 'square'
};

/**
 * 4-7-8 Breathing - Dr. Andrew Weil's relaxing breath
 */
export const FOUR_SEVEN_EIGHT_BREATHING: BreathingPattern = {
  id: '4-7-8-breathing',
  name: '4-7-8 Breathing',
  description: 'Dr. Andrew Weil\'s natural tranquilizer for the nervous system',
  inhaleSeconds: 4,
  holdInSeconds: 7,
  exhaleSeconds: 8,
  cycles: 6,
  backgroundAnimation: 'gentle-waves',
  visualStyle: 'circle'
};

/**
 * Deep Breathing - Simple and effective
 */
export const DEEP_BREATHING: BreathingPattern = {
  id: 'deep-breathing',
  name: 'Deep Breathing',
  description: 'Simple deep breathing for stress relief and focus',
  inhaleSeconds: 6,
  exhaleSeconds: 8,
  cycles: 10,
  backgroundAnimation: 'flowing-clouds',
  visualStyle: 'circle'
};

/**
 * Wim Hof Breathing - Energizing technique
 */
export const WIM_HOF_BREATHING: BreathingPattern = {
  id: 'wim-hof-breathing',
  name: 'Wim Hof Breathing',
  description: 'Energizing breath work for vitality and cold resistance',
  inhaleSeconds: 2,
  exhaleSeconds: 1,
  holdOutSeconds: 15, // Retention after exhale
  cycles: 30,
  backgroundAnimation: 'ice-crystals',
  visualStyle: 'circle'
};

/**
 * Sama Vritti (Equal Breathing) - Yoga practice
 */
export const SAMA_VRITTI_BREATHING: BreathingPattern = {
  id: 'sama-vritti-breathing',
  name: 'Sama Vritti',
  description: 'Equal breathing from yoga - calms the nervous system',
  inhaleSeconds: 6,
  exhaleSeconds: 6,
  cycles: 12,
  backgroundAnimation: 'lotus-petals',
  visualStyle: 'flower'
};

/**
 * Triangle Breathing - 3-count breathing
 */
export const TRIANGLE_BREATHING: BreathingPattern = {
  id: 'triangle-breathing',
  name: 'Triangle Breathing',
  description: 'Three-part breathing for balance and focus',
  inhaleSeconds: 3,
  holdInSeconds: 3,
  exhaleSeconds: 3,
  cycles: 15,
  backgroundAnimation: 'geometric-triangles',
  visualStyle: 'circle'
};

/**
 * Collection of all breathing patterns
 */
export const BREATHING_PATTERNS = {
  BOX_BREATHING,
  FOUR_SEVEN_EIGHT_BREATHING,
  DEEP_BREATHING,
  WIM_HOF_BREATHING,
  SAMA_VRITTI_BREATHING,
  TRIANGLE_BREATHING,
} as const;

/**
 * Get all breathing patterns as an array
 */
export function getAllBreathingPatterns(): BreathingPattern[] {
  return Object.values(BREATHING_PATTERNS);
}

/**
 * Get breathing pattern by ID
 */
export function getBreathingPatternById(id: string): BreathingPattern | undefined {
  return Object.values(BREATHING_PATTERNS).find(pattern => pattern.id === id);
}

/**
 * Calculate total duration for a breathing pattern in minutes
 */
export function calculateBreathingPatternDuration(pattern: BreathingPattern): number {
  const cycleTime = pattern.inhaleSeconds +
                   (pattern.holdInSeconds || 0) +
                   pattern.exhaleSeconds +
                   (pattern.holdOutSeconds || 0);
  return (cycleTime * pattern.cycles) / 60; // Convert to minutes
}