// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/audio/AudioCueService.ts
// Description: Zero-asset Web Audio API chime synthesizer and optional Web Speech API voice cue service
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

export type ChimeKind = 'start' | 'phase' | 'rest' | 'complete';

interface AudioCueManifest {
  version: string;
  format: string;
  cues: Record<string, string>;
}

/**
 * Offline-safe audio cue service using Web Audio API tones, optional pre-rendered
 * openScriptAudio clips under `/audio/cues/`, and Web Speech API fallback.
 */
class AudioCueService {
  private ctx: AudioContext | null = null;
  private manifest: AudioCueManifest | null = null;
  private manifestPromise: Promise<AudioCueManifest | null> | null = null;

  private async loadManifest(): Promise<AudioCueManifest | null> {
    if (this.manifest) return this.manifest;
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return null;
    if (!this.manifestPromise) {
      this.manifestPromise = fetch('/audio/cues/manifest.json')
        .then((res) => (res.ok ? (res.json() as Promise<AudioCueManifest>) : null))
        .then((data) => {
          this.manifest = data;
          return data;
        })
        .catch(() => null);
    }
    return this.manifestPromise;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  /**
   * Call inside a user gesture (e.g., Start button click) to unlock audio on iOS Safari.
   */
  public unlock(): void {
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {
      // Ignore audio unlock failures
    }
  }

  /**
   * Play a gentle synthesized chime for session/phase transitions.
   */
  public playChime(kind: ChimeKind): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const notes: Record<ChimeKind, number[]> = {
        start: [528],
        phase: [587.33],
        rest: [440],
        complete: [528, 659.25, 783.99],
      };

      notes[kind].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startAt = now + idx * 0.14;
        const duration = kind === 'complete' ? 0.45 : 0.28;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);

        gain.gain.setValueAtTime(0.001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.14, startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + duration + 0.02);
      });
    } catch {
      // Ignore Web Audio errors in unsupported environments
    }
  }

  /**
   * Play a pre-rendered openScriptAudio cue clip if present, otherwise fall back to speechSynthesis.
   */
  public async speakCue(cueId: string, fallbackText: string): Promise<void> {
    try {
      const manifest = await this.loadManifest();
      const file = manifest?.cues?.[cueId];
      if (file && typeof Audio !== 'undefined') {
        const audio = new Audio(`/audio/cues/${file}`);
        await audio.play();
        return;
      }
    } catch {
      // Fall through to speechSynthesis
    }
    this.speak(fallbackText);
  }

  /**
   * Speak a short guidance cue using Web Speech API when voice cues are enabled.
   */
  public speak(text: string): void {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) {
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors
    }
  }

  public stopSpeech(): void {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignore
    }
  }
}

export const audioCueService = new AudioCueService();
