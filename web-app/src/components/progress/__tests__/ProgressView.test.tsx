// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/progress/__tests__/ProgressView.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressView from '../ProgressView';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';
import { SessionStatus } from '@/types/profile.types';
import { createSimpleProfile } from '@/types/unified-profile.types';

describe('ProgressView', () => {
  const mockLoadProgress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const p1 = createSimpleProfile('Pomodoro', 'Focus', 25, 5, '#ef4444', '🍅');
    useUnifiedTimerStore.setState({
      profiles: [p1],
      customProfiles: [],
      stats: {
        totalSessions: 5,
        completedSessions: 4,
        totalMinutes: 120,
        averageSessionMinutes: 24,
        currentStreak: 3,
        longestStreak: 5,
        favoriteProfileId: p1.id,
      },
      recentSessions: [
        {
          id: 'sess-1',
          profileId: p1.id,
          startedAt: new Date('2026-11-24T09:00:00Z'),
          completedAt: new Date('2026-11-24T09:25:00Z'),
          plannedDurationMinutes: 25,
          actualDurationMinutes: 25,
          completionStatus: SessionStatus.COMPLETED,
          pauseCount: 0,
          totalPauseDurationMinutes: 0,
        },
      ],
      loadProgress: mockLoadProgress,
    } as any);
  });

  it('loads progress on mount and renders stats and recent sessions', () => {
    render(<ProgressView />);
    expect(mockLoadProgress).toHaveBeenCalled();
    expect(screen.getByTestId('progress-view')).toBeTruthy();
    expect(screen.getByText('120')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText(/Pomodoro/)).toBeTruthy();
  });

  it('renders empty state when there are no recent sessions', () => {
    useUnifiedTimerStore.setState({ recentSessions: [], stats: null } as any);
    render(<ProgressView />);
    expect(screen.getByText(/No completed sessions recorded yet/i)).toBeTruthy();
  });
});
