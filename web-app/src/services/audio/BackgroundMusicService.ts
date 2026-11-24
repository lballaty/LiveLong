// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/audio/BackgroundMusicService.ts
// Description: Offline-capable background music service with synthesized ambient soundscapes and custom audio file support
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-23

export interface MusicTrackOption {
  id: string;
  label: string;
  description: string;
  src?: string;
  isCustom?: boolean;
  dataUrl?: string;
}

export const BUILTIN_MUSIC_TRACKS: MusicTrackOption[] = [
  { id: 'none', label: 'No Music', description: 'Chimes and voice cues only' },
  {
    id: 'morning-exercise',
    label: 'Morning Exercise',
    description: 'Uplifting warm pentatonic loop for movement',
    src: '/audio/music/morning-exercise.mp3',
  },
  {
    id: 'zen-garden',
    label: 'Zen Garden',
    description: 'Warm harmonic ambient pad',
    src: '/audio/music/zen-garden.mp3',
  },
  {
    id: 'calm-breath',
    label: 'Calm Breath',
    description: 'Slow resonant chords for breathwork',
    src: '/audio/music/calm-breath.mp3',
  },
  {
    id: 'focus-flow',
    label: 'Focus Flow',
    description: 'Soft steady lo-fi electric piano pulse',
    src: '/audio/music/focus-flow.mp3',
  },
];

const LEGACY_TRACK_ID_MAP: Record<string, string> = {
  'zen-drone': 'zen-garden',
  'morning-bamboo': 'morning-exercise',
  'ocean-waves': 'calm-breath',
  'gentle-rain': 'calm-breath',
};

/**
 * Maps retired Web Audio synth track IDs (e.g. from existing localStorage)
 * onto the current bundled MP3 tracks so saved user selections keep working.
 */
export function normalizeMusicTrackId(trackId?: string): string {
  if (!trackId) return 'none';
  return LEGACY_TRACK_ID_MAP[trackId] ?? trackId;
}

/**
 * Plays looping background music (bundled MP3 loops or user-added audio files)
 * with live volume and mute control independent of chimes and voice cues.
 */
class BackgroundMusicService {
  private audioEl: HTMLAudioElement | null = null;
  private currentTrackId: string = 'none';
  private isPlaying = false;
  private volume = 0.25;
  private muted = false;

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.applyLiveLevel();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyLiveLevel();
  }

  private applyLiveLevel(): void {
    if (this.audioEl) {
      this.audioEl.volume = this.muted ? 0 : Math.max(0, Math.min(1, this.volume));
    }
  }

  public start(trackId: string, customTracks: MusicTrackOption[] = []): void {
    const resolvedId = normalizeMusicTrackId(trackId);
    if (!resolvedId || resolvedId === 'none') {
      this.stop();
      return;
    }
    if (this.isPlaying && this.currentTrackId === resolvedId) {
      return;
    }

    this.stop();
    this.currentTrackId = resolvedId;

    const track = [...BUILTIN_MUSIC_TRACKS, ...customTracks].find((t) => t.id === resolvedId);
    const audioSrc = track?.dataUrl || track?.src;
    if (!audioSrc || typeof Audio === 'undefined') {
      this.isPlaying = false;
      return;
    }

    try {
      const audio = new Audio(audioSrc);
      audio.loop = true;
      audio.volume = this.muted ? 0 : Math.max(0, Math.min(1, this.volume));
      this.audioEl = audio;
      this.isPlaying = true;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (this.audioEl === audio) {
            this.isPlaying = false;
          }
        });
      }
    } catch {
      this.isPlaying = false;
    }
  }

  public pause(): void {
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.isPlaying = false;
  }

  public resume(trackId: string, customTracks: MusicTrackOption[] = []): void {
    const resolvedId = normalizeMusicTrackId(trackId);
    if (this.audioEl && this.currentTrackId === resolvedId) {
      this.isPlaying = true;
      this.audioEl.play().catch(() => {
        this.isPlaying = false;
      });
      return;
    }
    this.start(resolvedId, customTracks);
  }

  public stop(): void {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl = null;
    }
    this.isPlaying = false;
    this.currentTrackId = 'none';
  }

  public getCurrentTrackId(): string {
    return this.currentTrackId;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public previewToggle(trackId: string, customTracks: MusicTrackOption[] = [], volume?: number): boolean {
    const resolvedId = normalizeMusicTrackId(trackId);
    if (!resolvedId || resolvedId === 'none') {
      this.stop();
      return false;
    }
    if (this.isPlaying && this.currentTrackId === resolvedId) {
      this.stop();
      return false;
    }
    if (volume !== undefined) {
      this.setVolume(volume);
    }
    this.setMuted(false);
    this.start(resolvedId, customTracks);
    return true;
  }
}

export const backgroundMusicService = new BackgroundMusicService();
