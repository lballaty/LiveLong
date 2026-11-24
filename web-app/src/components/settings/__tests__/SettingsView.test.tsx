// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/settings/__tests__/SettingsView.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsView from '../SettingsView';
import { useUnifiedTimerStore } from '@/store/unifiedTimerStore';
import { audioCueService } from '@/services/audio/AudioCueService';

const mockUpdatePreferences = jest.fn();
const mockSaveAsDefaults = jest.fn();
const mockResetAllPreferences = jest.fn();

jest.mock('@/components/exercises/ExerciseAnimationPlayer', () => ({
  __esModule: true,
  CAST_LABELS: {
    'robot-r1': 'Robot R1 (Draft Default)',
    'm25-athletic': 'Man ~25 (Athletic)',
    'f30-slim': 'Woman ~30 (Slim)',
  },
  default: ({ characterId, variant, views }: any) => (
    <div data-testid="settings-figure-preview">
      {characterId}|{variant}|{views}
    </div>
  ),
}));

jest.mock('@/services/audio/AudioCueService', () => ({
  audioCueService: {
    unlock: jest.fn(),
    playChime: jest.fn(),
    speak: jest.fn(),
  },
}));

describe('SettingsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUnifiedTimerStore.setState({
      preferences: {
        characterId: 'robot-r1',
        variant: 'standing',
        views: 'front',
        soundEnabled: true,
        chimeVolume: 0.7,
        voiceCuesEnabled: true,
        voiceId: 'woman',
        voiceVolume: 0.9,
        musicMuted: false,
        musicVolume: 0.25,
        vibrationEnabled: true,
      },
      hasSavedDefaults: true,
      updatePreferences: mockUpdatePreferences,
      saveAsDefaults: mockSaveAsDefaults,
      resetAllPreferences: mockResetAllPreferences,
    } as any);
  });

  it('updates character, posture variant, and camera views and reflects them in live preview', () => {
    render(<SettingsView />);

    expect(screen.getByTestId('settings-figure-preview').textContent).toBe('robot-r1|standing|front');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'f30-slim' } });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ characterId: 'f30-slim' });

    fireEvent.click(screen.getByRole('button', { name: 'Chair-Based' }));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ variant: 'chair' });

    fireEvent.click(screen.getByRole('button', { name: 'Side' }));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ views: 'side' });

    fireEvent.click(screen.getByRole('button', { name: 'Front + Side' }));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ views: 'both' });
  });

  it('updates chimes, voice guide, music, haptic toggles, volumes, and triggers Test Audio Cue', () => {
    render(<SettingsView />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);

    fireEvent.click(checkboxes[0]);
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ soundEnabled: false });

    fireEvent.click(checkboxes[1]);
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ voiceCuesEnabled: false });

    fireEvent.click(checkboxes[2]);
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ musicMuted: true });

    fireEvent.click(checkboxes[3]);
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ vibrationEnabled: false });

    fireEvent.click(screen.getByRole('button', { name: 'Man' }));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ voiceId: 'man' });

    fireEvent.change(screen.getByLabelText('Chime volume'), { target: { value: '45' } });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ chimeVolume: 0.45 });

    fireEvent.change(screen.getByLabelText('Voice volume'), { target: { value: '60' } });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ voiceVolume: 0.6 });

    fireEvent.change(screen.getByLabelText('Music volume'), { target: { value: '35' } });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ musicVolume: 0.35 });

    fireEvent.click(screen.getByRole('button', { name: 'Test Audio Cue' }));
    expect(audioCueService.unlock).toHaveBeenCalled();
    expect(audioCueService.playChime).toHaveBeenCalledWith('complete');
    expect(audioCueService.speak).toHaveBeenCalledWith('Audio guidance is ready.');

    fireEvent.click(screen.getByTestId('save-defaults-button'));
    expect(mockSaveAsDefaults).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('reset-defaults-button'));
    expect(mockResetAllPreferences).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByTestId('reset-factory-button'));
    expect(mockResetAllPreferences).toHaveBeenCalledWith(true);
  });
});
