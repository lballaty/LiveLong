// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/progress/ProgressView.tsx
// Description: Session history, practice minutes, and streak tracking powered by IndexedDB
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

'use client';

import React, { useEffect } from 'react';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';

export default function ProgressView() {
  const { stats, recentSessions, profiles, loadProgress } = useUnifiedTimerStore();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const getProfileName = (profileId: string): string => {
    const found = profiles.find((p) => p.id === profileId);
    return found ? `${found.icon} ${found.name}` : profileId;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4" data-testid="progress-view">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Practice Progress</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Completed</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.completedSessions ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">sessions</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total Time</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {Math.round(stats?.totalMinutes ?? 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">minutes</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Current Streak</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">
            {stats?.currentStreak ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">days</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best Streak</div>
          <div className="text-3xl font-bold text-emerald-600 mt-1">
            {stats?.longestStreak ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">days</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Sessions</h3>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No completed sessions recorded yet. Start a practice to track your progress offline.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentSessions.map((session) => (
              <li key={session.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-gray-800">
                    {getProfileName(session.profileId)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(session.startedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-700">
                    {Math.max(1, Math.round(session.actualDurationMinutes))} min
                  </div>
                  <div className="text-xs text-emerald-600 capitalize">
                    {session.completionStatus}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
