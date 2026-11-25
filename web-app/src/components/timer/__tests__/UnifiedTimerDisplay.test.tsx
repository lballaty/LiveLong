// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/timer/__tests__/UnifiedTimerDisplay.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UnifiedTimerDisplay from '../UnifiedTimerDisplay';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';

jest.mock('@/components/exercises/ExerciseAnimationPlayer', () => ({
  __esModule: true,
  CAST_LABELS: { 'robot-r1': 'Robot R1' },
  default: ({ stepId }: { stepId: string }) => (
    <div data-testid="exercise-animation-player">{stepId}</div>
  ),
}));

describe('UnifiedTimerDisplay', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useUnifiedTimerStore.setState({ profiles: [], customProfiles: [], timerEngine: null } as any);
  });

  afterEach(() => {
    useUnifiedTimerStore.getState().timerEngine?.stop();
  });

  it('renders Studio HUD, navigates across all 4 tabs, and steps through Rajio Taiso', () => {
    render(<UnifiedTimerDisplay />);

    expect(screen.getByText(/LiveLong/)).toBeTruthy();
    expect(screen.getByTestId('time-display').textContent).toBe('00:30');
    expect(screen.getByTestId('exercise-animation-player')).toBeTruthy();

    fireEvent.click(screen.getByTestId('review-next-step'));
    expect(screen.getByRole('heading', { name: /2\. Arm Swings/ })).toBeTruthy();
    fireEvent.click(screen.getByTestId('review-prev-step'));
    expect(screen.getByRole('heading', { name: /1\. Neck and Arm Stretches/ })).toBeTruthy();

    // Start, pause, resume, stop
    fireEvent.click(screen.getByTestId('start-focus-button'));
    expect(screen.getByTestId('pause-button')).toBeTruthy();
    fireEvent.click(screen.getByTestId('pause-button'));
    expect(screen.getByTestId('resume-button')).toBeTruthy();
    fireEvent.click(screen.getByTestId('resume-button'));
    expect(screen.getByTestId('stop-button')).toBeTruthy();
    fireEvent.click(screen.getByTestId('stop-button'));
    expect(screen.getByTestId('start-focus-button')).toBeTruthy();

    // Toggle mute pills
    fireEvent.click(screen.getByTestId('toggle-chime-mute'));
    fireEvent.click(screen.getByTestId('toggle-voice-mute'));

    // Navigate tabs
    fireEvent.click(screen.getByRole('button', { name: 'Routines' }));
    expect(screen.getByText('Routines & Timers')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Progress' }));
    expect(screen.getByTestId('progress-view')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByTestId('settings-view')).toBeTruthy();

    // Switch to breathing profile -> BreathingVisualizer + loops
    fireEvent.click(screen.getByRole('button', { name: 'Session' }));
    const breathing = useUnifiedTimerStore.getState().profiles.find((p) => p.type === 'breathing');
    if (breathing) {
      fireEvent.click(screen.getByRole('button', { name: 'Routines' }));
      fireEvent.click(screen.getByTestId(`profile-${breathing.id}`));
      expect(screen.getByTestId('loops-increase')).toBeTruthy();
      fireEvent.click(screen.getByTestId('loops-increase'));
      fireEvent.click(screen.getByTestId('loops-decrease'));
    }

    // Switch to simple profile
    const simple = useUnifiedTimerStore.getState().profiles.find((p) => p.type === 'simple');
    if (simple) {
      fireEvent.click(screen.getByRole('button', { name: 'Routines' }));
      fireEvent.click(screen.getByTestId(`profile-${simple.id}`));
      expect(screen.getByTestId('time-display').textContent).toBe('25:00');
    }
  });
});
