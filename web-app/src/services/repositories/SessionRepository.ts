// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/repositories/SessionRepository.ts
// Description: Session repository with statistics calculation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import {
  ISessionRepository,
  Session,
  SessionStatistics,
  SessionStatus,
} from '@/types/profile.types';
import { IndexedDBService } from '../database/IndexedDBService';
import { generateUUID } from '@/utils/uuid';
import { startOfDay, endOfDay, differenceInMinutes } from 'date-fns';

/**
 * Session Repository
 * Single Responsibility: Manage session data and statistics
 * Memory-conscious: Uses aggregation queries instead of loading all data
 */
export class SessionRepository implements ISessionRepository {
  private db: IndexedDBService;

  constructor(database: IndexedDBService) {
    this.db = database;
  }

  /**
   * Create new session record
   */
  public async create(input: Omit<Session, 'id'>): Promise<Session> {
    const session: Session = {
      ...input,
      id: generateUUID(),
    };

    const db = this.db.getDB();
    await db.add('sessions', session);

    return session;
  }

  /**
   * Find session by ID
   */
  public async findById(id: string): Promise<Session | null> {
    const db = this.db.getDB();
    const session = await db.get('sessions', id);
    return session || null;
  }

  /**
   * Find all sessions for a profile
   * Memory-efficient: Uses index for filtering
   */
  public async findByProfileId(profileId: string): Promise<Session[]> {
    const db = this.db.getDB();
    return db.getAllFromIndex('sessions', 'by-profile', profileId);
  }

  /**
   * Find sessions within date range
   * Memory-efficient: Uses cursor with date index
   */
  public async findByDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
    const db = this.db.getDB();
    const tx = db.transaction('sessions', 'readonly');
    const index = tx.objectStore('sessions').index('by-date');

    const range = IDBKeyRange.bound(startDate, endDate);
    return index.getAll(range);
  }

  /**
   * Get today's sessions
   */
  public async findToday(): Promise<Session[]> {
    const today = new Date();
    return this.findByDateRange(startOfDay(today), endOfDay(today));
  }

  /**
   * Get session statistics
   * Memory-efficient: Aggregates data using cursor without loading all into memory
   */
  public async getStatistics(profileId?: string): Promise<SessionStatistics> {
    const db = this.db.getDB();
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');

    let cursor: Awaited<ReturnType<typeof store.openCursor>> | null;

    if (profileId) {
      const index = store.index('by-profile');
      cursor = await index.openCursor(profileId);
    } else {
      cursor = await store.openCursor();
    }

    // Aggregate statistics using cursor (memory-efficient)
    let totalSessions = 0;
    let completedSessions = 0;
    let totalMinutes = 0;
    const hourCounts = new Map<number, number>();
    const sessionDates: Date[] = [];

    while (cursor) {
      const session = cursor.value;
      totalSessions++;

      if (session.completionStatus === SessionStatus.COMPLETED) {
        completedSessions++;
        totalMinutes += session.actualDurationMinutes;
      }

      // Track most productive hour
      const hour = session.startedAt.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      sessionDates.push(session.startedAt);

      cursor = await cursor.continue();
    }

    await tx.done;

    const { longestStreak, currentStreak } = this.calculateStreaks(sessionDates);

    // Find most productive hour
    let mostProductiveHour = 0;
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        mostProductiveHour = hour;
      }
    });

    const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
    const averageDurationMinutes = completedSessions > 0 ? totalMinutes / completedSessions : 0;

    return {
      totalSessions,
      completedSessions,
      totalMinutes,
      averageDurationMinutes: Math.round(averageDurationMinutes * 10) / 10,
      completionRate: Math.round(completionRate * 1000) / 1000,
      mostProductiveHour,
      longestStreak,
      currentStreak,
    };
  }

  /**
   * Get statistics for date range
   */
  public async getStatisticsForRange(
    startDate: Date,
    endDate: Date,
    profileId?: string
  ): Promise<SessionStatistics> {
    const sessions = await this.findByDateRange(startDate, endDate);
    const filteredSessions = profileId
      ? sessions.filter((s) => s.profileId === profileId)
      : sessions;

    // Calculate statistics from filtered sessions
    const totalSessions = filteredSessions.length;
    const completedSessions = filteredSessions.filter(
      (s) => s.completionStatus === SessionStatus.COMPLETED
    ).length;

    const totalMinutes = filteredSessions.reduce((sum, s) => {
      return s.completionStatus === SessionStatus.COMPLETED
        ? sum + s.actualDurationMinutes
        : sum;
    }, 0);

    const hourCounts = new Map<number, number>();
    filteredSessions.forEach((session) => {
      const hour = session.startedAt.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    let mostProductiveHour = 0;
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        mostProductiveHour = hour;
      }
    });

    const { longestStreak, currentStreak } = this.calculateStreaks(
      filteredSessions.map((s) => s.startedAt)
    );

    return {
      totalSessions,
      completedSessions,
      totalMinutes,
      averageDurationMinutes:
        completedSessions > 0
          ? Math.round((totalMinutes / completedSessions) * 10) / 10
          : 0,
      completionRate:
        totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 1000) / 1000 : 0,
      mostProductiveHour,
      longestStreak,
      currentStreak,
    };
  }

  /**
   * Calculate longest and current consecutive-day streaks from session dates
   */
  private calculateStreaks(dates: Date[]): { longestStreak: number; currentStreak: number } {
    if (dates.length === 0) {
      return { longestStreak: 0, currentStreak: 0 };
    }

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    sortedDates.forEach((date) => {
      if (lastDate) {
        const dayDiff = Math.floor(
          (startOfDay(date).getTime() - startOfDay(lastDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          currentStreak++;
        } else if (dayDiff > 1) {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      lastDate = date;
    });

    longestStreak = Math.max(longestStreak, currentStreak);
    return { longestStreak, currentStreak };
  }

  /**
   * Delete old sessions
   * Memory management: Prevents unlimited data growth
   */
  public async deleteOlderThan(date: Date): Promise<number> {
    const db = this.db.getDB();
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const index = store.index('by-date');

    let cursor = await index.openCursor(IDBKeyRange.upperBound(date));
    let deletedCount = 0;

    while (cursor) {
      await cursor.delete();
      deletedCount++;
      cursor = await cursor.continue();
    }

    await tx.done;
    return deletedCount;
  }
}