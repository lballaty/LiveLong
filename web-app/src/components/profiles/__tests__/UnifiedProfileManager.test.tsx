// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/UnifiedProfileManager.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UnifiedProfileManager from '../UnifiedProfileManager';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';
import { backgroundMusicService } from '@/services/audio/BackgroundMusicService';
import { audioCueService } from '@/services/audio/AudioCueService';

jest.mock('@/services/audio/BackgroundMusicService', () => ({
  BUILTIN_MUSIC_TRACKS: [
    { id: 'none', label: 'No Music', description: '' },
    { id: 'morning-exercise', label: 'Morning Exercise', description: '', src: '/audio/music/morning-exercise.mp3' },
  ],
  normalizeMusicTrackId: (id?: string) => id || 'none',
  backgroundMusicService: {
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    previewToggle: jest.fn().mockReturnValue(true),
    stop: jest.fn(),
    setVolume: jest.fn(),
    setMuted: jest.fn(),
  },
}));

jest.mock('@/services/audio/AudioCueService', () => ({
  audioCueService: {
    unlock: jest.fn(),
    playChime: jest.fn(),
    speakCue: jest.fn(),
    stopSpeech: jest.fn(),
  },
}));

describe('UnifiedProfileManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    useUnifiedTimerStore.setState({ profiles: [], customProfiles: [], timerEngine: null } as any);
  });

  it('renders categories, filters by type, previews audio, reorders cards, and opens modals', () => {
    const onSelect = jest.fn();
    render(<UnifiedProfileManager onProfileSelect={onSelect} />);

    expect(screen.getByText('Japanese Longevity Exercises')).toBeTruthy();
    expect(screen.getByText('Breathing Exercises')).toBeTruthy();
    expect(screen.getByText('Focus & Meditation Timers')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Breathing' }));
    expect(screen.queryByText('Japanese Longevity Exercises')).toBeNull();
    expect(screen.getByText('Breathing Exercises')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Japanese Longevity Exercises')).toBeTruthy();

    // Music selection & preview
    fireEvent.change(screen.getByTestId('music-select-rajio-taiso-series'), {
      target: { value: 'morning-exercise' },
    });
    fireEvent.click(screen.getByTestId('preview-music-rajio-taiso-series'));
    expect(backgroundMusicService.previewToggle).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('preview-chime-rajio-taiso-series'));
    expect(audioCueService.playChime).toHaveBeenCalled();

    // Open RoutineAudioModal
    fireEvent.click(screen.getByTestId('audio-config-rajio-taiso-series'));
    expect(screen.getByTestId('routine-audio-modal')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Close audio setup'));

    // Open RoutineEditorModal & SessionComposerModal
    fireEvent.click(screen.getByRole('button', { name: '+ New Routine' }));
    expect(screen.getByTestId('routine-editor-modal')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Close routine editor'));

    fireEvent.click(screen.getByRole('button', { name: '+ Compose Session' }));
    expect(screen.getByTestId('session-composer-modal')).toBeTruthy();
    fireEvent.click(screen.getByTestId('save-session-plan-button'));
    expect(screen.getByText('Composed Sessions')).toBeTruthy();

    // Clone built-in series -> save -> delete
    const rajioCard = screen.getByTestId('profile-rajio-taiso-series');
    fireEvent.click(rajioCard.querySelector('button[aria-label="Clone routine"]')!);
    expect(screen.getByTestId('routine-editor-modal')).toBeTruthy();
    fireEvent.click(screen.getByTestId('save-routine-button'));
    expect(screen.getByText('Rajio Taiso Complete Series (Custom)')).toBeTruthy();

    // Reorder cards
    fireEvent.click(rajioCard.querySelector('button[aria-label="Move routine later"]')!);
    fireEvent.click(rajioCard.querySelector('button[aria-label="Move routine earlier"]')!);

    // Create & delete simple custom timer
    fireEvent.click(screen.getByRole('button', { name: '+ Create Custom Timer' }));
    const nameInput = document.querySelector('form input[type="text"]')!;
    fireEvent.change(nameInput, { target: { value: 'Quick Test Timer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Profile' }));
    expect(screen.getByText('Quick Test Timer')).toBeTruthy();

    // Edit & delete custom simple timer
    const simpleCard = screen.getByText('Quick Test Timer').closest('[data-testid^="profile-simple-"]')!;
    fireEvent.click(simpleCard.querySelector('button[aria-label="Edit profile"]')!);
    const editInput = document.querySelector('input[name="name"]')!;
    fireEvent.change(editInput, { target: { value: 'Edited Timer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.getByText('Edited Timer')).toBeTruthy();
    const editedCard = screen.getByText('Edited Timer').closest('[data-testid^="profile-simple-"]')!;
    fireEvent.click(editedCard.querySelector('button[aria-label="Delete profile"]')!);
    expect(screen.queryByText('Edited Timer')).toBeNull();

    // Start & delete composed session
    const startSessionBtn = screen.getByRole('button', { name: '▶ Start Session' });
    fireEvent.click(startSessionBtn);
    fireEvent.click(screen.getByLabelText('Delete session plan'));
  });
});
