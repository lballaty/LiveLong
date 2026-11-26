// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/types/profile.types.ts
// Description: Profile and session type definitions
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

/**
 * Profile category enum
 */
export enum ProfileCategory {
  WORK = 'work',
  STUDY = 'study',
  EXERCISE = 'exercise',
  MEDITATION = 'meditation',
  BREAK = 'break',
  CUSTOM = 'custom',
}

/**
 * Exercise step in a series
 * Represents one exercise within a sequence
 */
export interface StepAnimationRef {
  readonly pack: string;
  readonly version?: string;
}

export interface ExerciseStep {
  readonly id: string;
  readonly exerciseId?: string;
  readonly name: string;
  readonly description?: string;
  readonly durationMinutes: number;
  readonly restDurationMinutes: number;
  readonly mode?: 'timed' | 'reps' | 'hold' | 'interval' | 'breath' | 'stillness';
  readonly targetReps?: number;
  readonly rounds?: number;
  readonly instructions?: string;
  readonly videoUrl?: string;
  readonly imageUrl?: string;
  readonly animation?: StepAnimationRef;
  readonly cueId?: string;
}

/**
 * Breathing pattern for meditation and relaxation
 */
export interface BreathingPattern {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly inhaleSeconds: number;
  readonly holdInSeconds?: number;
  readonly exhaleSeconds: number;
  readonly holdOutSeconds?: number;
  readonly cycles: number;
  readonly backgroundAnimation?: string; // Animation theme
  readonly visualStyle?: 'circle' | 'square' | 'flower' | 'wave';
}

/**
 * Exercise series configuration
 * Defines a sequence of exercises with breaks
 */
export interface ExerciseSeries {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly steps: ExerciseStep[];
  readonly warmupDurationMinutes?: number;
  readonly cooldownDurationMinutes?: number;
  readonly totalDurationMinutes: number; // Calculated from all steps
  readonly breathingPattern?: BreathingPattern; // Optional breathing guide
  readonly backgroundAnimation?: string; // Background animation theme
}

/**
 * Profile interface
 * Represents a timer profile configuration
 */
export interface Profile {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly category: ProfileCategory;
  readonly durationMinutes: number;
  readonly breakDurationMinutes: number;
  readonly longBreakDurationMinutes: number;
  readonly breakFrequency: number; // Sessions before long break
  readonly notificationSound?: string;
  readonly themeColor?: string;
  readonly aiCoachingEnabled: boolean;
  readonly exerciseSeries?: ExerciseSeries; // Optional exercise series for workout profiles
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Profile creation input
 * Open/Closed Principle: Closed for modification, open for extension
 */
export type CreateProfileInput = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Profile update input
 * Partial allows updating only specific fields
 */
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'createdAt'>>;

/**
 * Session completion status
 */
export enum SessionStatus {
  COMPLETED = 'completed',
  STOPPED = 'stopped',
  INTERRUPTED = 'interrupted',
}

/**
 * Session interface
 * Records a completed or partial timer session
 */
export interface Session {
  readonly id: string;
  readonly profileId: string;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
  readonly plannedDurationMinutes: number;
  readonly actualDurationMinutes: number;
  readonly completionStatus: SessionStatus;
  readonly pauseCount: number;
  readonly totalPauseDurationMinutes: number;
  readonly notes?: string;
  readonly aiFeedback?: string;
}

/**
 * Session statistics interface
 */
export interface SessionStatistics {
  readonly totalSessions: number;
  readonly completedSessions: number;
  readonly totalMinutes: number;
  readonly averageDurationMinutes: number;
  readonly completionRate: number;
  readonly mostProductiveHour: number;
  readonly longestStreak: number;
  readonly currentStreak: number;
}

/**
 * Repository interfaces (Dependency Inversion Principle)
 */
export interface IProfileRepository {
  create(profile: CreateProfileInput): Promise<Profile>;
  update(id: string, profile: UpdateProfileInput): Promise<Profile>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Profile | null>;
  findAll(): Promise<Profile[]>;
  findByCategory(category: ProfileCategory): Promise<Profile[]>;
}

export interface ISessionRepository {
  create(session: Omit<Session, 'id'>): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByProfileId(profileId: string): Promise<Session[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Session[]>;
  getStatistics(profileId?: string): Promise<SessionStatistics>;
}