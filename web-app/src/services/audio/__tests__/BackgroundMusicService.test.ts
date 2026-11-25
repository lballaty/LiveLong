// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/audio/__tests__/BackgroundMusicService.test.ts
import {
  BUILTIN_MUSIC_TRACKS,
  backgroundMusicService,
  normalizeMusicTrackId,
} from '../BackgroundMusicService';

describe('BackgroundMusicService', () => {
  let mockAudioInstance: {
    loop: boolean;
    volume: number;
    currentTime: number;
    play: jest.Mock;
    pause: jest.Mock;
  };

  beforeEach(() => {
    backgroundMusicService.stop();
    mockAudioInstance = {
      loop: false,
      volume: 1,
      currentTime: 5,
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
    };
    (global as unknown as { Audio: jest.Mock }).Audio = jest.fn(() => mockAudioInstance);
  });

  afterEach(() => {
    backgroundMusicService.stop();
  });

  it('normalizes legacy track IDs to bundled MP3 track IDs', () => {
    expect(normalizeMusicTrackId(undefined)).toBe('none');
    expect(normalizeMusicTrackId('zen-drone')).toBe('zen-garden');
    expect(normalizeMusicTrackId('morning-bamboo')).toBe('morning-exercise');
    expect(normalizeMusicTrackId('ocean-waves')).toBe('calm-breath');
    expect(normalizeMusicTrackId('gentle-rain')).toBe('calm-breath');
    expect(normalizeMusicTrackId('focus-flow')).toBe('focus-flow');
  });

  it('starts, adjusts volume/mute, pauses, resumes, and stops a bundled track', () => {
    expect(BUILTIN_MUSIC_TRACKS.length).toBeGreaterThanOrEqual(5);

    backgroundMusicService.setVolume(0.4);
    backgroundMusicService.setMuted(false);
    backgroundMusicService.start('morning-exercise');

    expect(global.Audio).toHaveBeenCalledWith('/audio/music/morning-exercise.mp3');
    expect(mockAudioInstance.loop).toBe(true);
    expect(mockAudioInstance.volume).toBe(0.4);
    expect(mockAudioInstance.play).toHaveBeenCalledTimes(1);
    expect(backgroundMusicService.getCurrentTrackId()).toBe('morning-exercise');
    expect(backgroundMusicService.getIsPlaying()).toBe(true);

    backgroundMusicService.setMuted(true);
    expect(mockAudioInstance.volume).toBe(0);

    backgroundMusicService.setMuted(false);
    backgroundMusicService.setVolume(0.6);
    expect(mockAudioInstance.volume).toBe(0.6);

    backgroundMusicService.pause();
    expect(mockAudioInstance.pause).toHaveBeenCalled();
    expect(backgroundMusicService.getIsPlaying()).toBe(false);

    backgroundMusicService.resume('morning-exercise');
    expect(mockAudioInstance.play).toHaveBeenCalledTimes(2);
    expect(backgroundMusicService.getIsPlaying()).toBe(true);

    backgroundMusicService.stop();
    expect(mockAudioInstance.currentTime).toBe(0);
    expect(backgroundMusicService.getCurrentTrackId()).toBe('none');
    expect(backgroundMusicService.getIsPlaying()).toBe(false);
  });

  it('toggles preview playback and stops when track is none', () => {
    const started = backgroundMusicService.previewToggle('zen-garden', [], 0.3);
    expect(started).toBe(true);
    expect(backgroundMusicService.getIsPlaying()).toBe(true);

    const stopped = backgroundMusicService.previewToggle('zen-garden', [], 0.3);
    expect(stopped).toBe(false);
    expect(backgroundMusicService.getIsPlaying()).toBe(false);

    const noneResult = backgroundMusicService.previewToggle('none', [], 0.3);
    expect(noneResult).toBe(false);
  });
});
