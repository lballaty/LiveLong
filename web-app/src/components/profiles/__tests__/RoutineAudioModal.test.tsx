// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/RoutineAudioModal.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoutineAudioModal from '../RoutineAudioModal';
import { BUILTIN_MUSIC_TRACKS, backgroundMusicService } from '@/services/audio/BackgroundMusicService';
import { audioCueService } from '@/services/audio/AudioCueService';
import { createSimpleProfile, PracticePreferences } from '@/types/unified-profile.types';

jest.mock('@/services/audio/BackgroundMusicService', () => ({
  BUILTIN_MUSIC_TRACKS: [
    { id: 'none', label: 'No Music', description: '' },
    { id: 'morning-exercise', label: 'Morning Exercise', description: '', src: '/audio/music/morning-exercise.mp3' },
  ],
  backgroundMusicService: {
    previewToggle: jest.fn().mockReturnValue(true),
    stop: jest.fn(),
  },
}));

jest.mock('@/services/audio/AudioCueService', () => ({
  audioCueService: {
    unlock: jest.fn(),
    playChime: jest.fn(),
    speakCue: jest.fn(),
  },
}));

describe('RoutineAudioModal', () => {
  const profile = createSimpleProfile('Test Routine', 'Desc', 10, 2, '#3b82f6', '⏱️');
  const prefs: PracticePreferences = {
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
  };

  it('previews music, tests chime and voice, updates volumes, and stops music on close', () => {
    const onMusicChange = jest.fn();
    const onUpdatePreferences = jest.fn();
    const onClose = jest.fn();

    render(
      <RoutineAudioModal
        profile={profile}
        selectedMusicId="morning-exercise"
        musicOptions={BUILTIN_MUSIC_TRACKS}
        preferences={prefs}
        onMusicChange={onMusicChange}
        onUpdatePreferences={onUpdatePreferences}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '▶ Preview' }));
    expect(backgroundMusicService.previewToggle).toHaveBeenCalledWith(
      'morning-exercise',
      BUILTIN_MUSIC_TRACKS,
      0.25
    );

    fireEvent.click(screen.getByRole('button', { name: '🔔 Test' }));
    expect(audioCueService.playChime).toHaveBeenCalledWith('phase', 0.7);

    fireEvent.click(screen.getByRole('button', { name: '🔊 Test' }));
    expect(audioCueService.speakCue).toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Routine chime volume'), { target: { value: '50' } });
    expect(onUpdatePreferences).toHaveBeenCalledWith({ chimeVolume: 0.5 });

    fireEvent.change(screen.getByLabelText('Routine music volume'), { target: { value: '40' } });
    expect(onUpdatePreferences).toHaveBeenCalledWith({ musicVolume: 0.4 });

    fireEvent.change(screen.getByLabelText('Routine voice volume'), { target: { value: '80' } });
    expect(onUpdatePreferences).toHaveBeenCalledWith({ voiceVolume: 0.8 });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'none' } });
    expect(onMusicChange).toHaveBeenCalledWith('none');

    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'man' } });
    expect(onUpdatePreferences).toHaveBeenCalledWith({ voiceId: 'man' });

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(backgroundMusicService.stop).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
