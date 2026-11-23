// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/audio/BackgroundMusicService.ts
// Description: Offline-capable background music service with synthesized ambient soundscapes and custom audio file support
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-23

export interface MusicTrackOption {
  id: string;
  label: string;
  description: string;
  isCustom?: boolean;
  dataUrl?: string;
}

export const BUILTIN_MUSIC_TRACKS: MusicTrackOption[] = [
  { id: 'none', label: 'No Music', description: 'Chimes and voice cues only' },
  { id: 'zen-drone', label: 'Zen Garden Pad', description: 'Warm harmonic ambient drone' },
  { id: 'morning-bamboo', label: 'Morning Bamboo', description: 'Soft Japanese pentatonic notes' },
  { id: 'ocean-waves', label: 'Ocean Breath', description: 'Gentle filtered wave wash' },
  { id: 'gentle-rain', label: 'Soft Rain', description: 'Calm rainfall texture' },
];

/**
 * Plays looping ambient background music (Web Audio API soundscapes or user-added audio files)
 * at a subtle level so transition chimes and voice cues remain clear.
 */
class BackgroundMusicService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private currentTrackId: string = 'none';
  private isPlaying = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public start(trackId: string, customTracks: MusicTrackOption[] = []): void {
    if (!trackId || trackId === 'none') {
      this.stop();
      return;
    }
    if (this.isPlaying && this.currentTrackId === trackId) {
      return;
    }

    this.stop();
    this.currentTrackId = trackId;
    this.isPlaying = true;

    const custom = customTracks.find((t) => t.id === trackId && t.dataUrl);
    if (custom?.dataUrl && typeof Audio !== 'undefined') {
      try {
        const audio = new Audio(custom.dataUrl);
        audio.loop = true;
        audio.volume = 0.28;
        audio.play().catch(() => {});
        this.audioEl = audio;
        return;
      } catch {
        // Fall through if Audio playback fails
      }
    }

    this.startAmbientSynth(trackId);
  }

  public pause(): void {
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.teardownSynth();
    this.isPlaying = false;
  }

  public resume(trackId: string, customTracks: MusicTrackOption[] = []): void {
    if (this.audioEl && this.currentTrackId === trackId) {
      this.isPlaying = true;
      this.audioEl.play().catch(() => {});
      return;
    }
    this.start(trackId, customTracks);
  }

  public stop(): void {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl = null;
    }
    this.teardownSynth();
    this.isPlaying = false;
    this.currentTrackId = 'none';
  }

  private teardownSynth(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore already-stopped nodes
      }
    });
    this.activeNodes = [];
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Ignore
      }
      this.masterGain = null;
    }
  }

  private startAmbientSynth(trackId: string): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 1.2);
      master.connect(ctx.destination);
      this.masterGain = master;

      if (trackId === 'zen-drone') {
        [130.81, 196.0, 261.63].forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.25, ctx.currentTime);
          osc.connect(g);
          g.connect(master);
          osc.start();
          this.activeNodes.push(osc, g);
        });
      } else if (trackId === 'morning-bamboo') {
        // In-Sen Japanese pentatonic scale: D4, Eb4, G4, A4, C5
        const scale = [293.66, 311.13, 392.0, 440.0, 523.25];
        let step = 0;
        const playNote = () => {
          if (!this.masterGain || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(scale[step % scale.length], now);
          step++;
          g.gain.setValueAtTime(0.001, now);
          g.gain.exponentialRampToValueAtTime(0.35, now + 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 2.5);
        };
        playNote();
        this.intervalId = setInterval(playNote, 2600);
      } else if (trackId === 'ocean-waves' || trackId === 'gentle-rain') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= trackId === 'ocean-waves' ? 2.5 : 1.6;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(trackId === 'ocean-waves' ? 420 : 1200, ctx.currentTime);

        source.connect(filter);
        filter.connect(master);
        source.start();
        this.activeNodes.push(source, filter);
      }
    } catch {
      // Ignore Web Audio errors in unsupported environments
    }
  }
}

export const backgroundMusicService = new BackgroundMusicService();
