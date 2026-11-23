// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/audio/AudioCueService.ts
// Description: Zero-asset Web Audio API chime synthesizer and optional Web Speech API voice cue service
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

export type ChimeKind = 'start' | 'phase' | 'rest' | 'complete';

interface AudioCueManifest {
  version: string;
  format: string;
  cues: Record<string, string | string[]>;
  variants?: Record<string, string[]>;
  voices?: Record<
    string,
    {
      label?: string;
      cues?: Record<string, string | string[]>;
      variants?: Record<string, string[]>;
    }
  >;
}

/**
 * Offline-safe audio cue service using Web Audio API tones, optional pre-rendered
 * openScriptAudio clips under `/audio/cues/`, and Web Speech API fallback.
 */
class AudioCueService {
  private ctx: AudioContext | null = null;
  private manifestByVoice: Record<string, AudioCueManifest | null> = {};
  private manifestPromiseByVoice: Record<string, Promise<AudioCueManifest | null> | undefined> = {};
  private lastPickedByCue: Record<string, number> = {};

  private pickVariant<T>(cueKey: string, value: T | T[]): T {
    if (!Array.isArray(value)) return value;
    if (value.length <= 1) return value[0];
    const prev = this.lastPickedByCue[cueKey];
    let nextIdx = Math.floor(Math.random() * value.length);
    if (prev !== undefined && nextIdx === prev) {
      nextIdx = (prev + 1) % value.length;
    }
    this.lastPickedByCue[cueKey] = nextIdx;
    return value[nextIdx];
  }

  private async loadManifest(voiceId = 'woman'): Promise<{ manifest: AudioCueManifest | null; basePath: string }> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') {
      return { manifest: null, basePath: '/audio/cues' };
    }
    const key = voiceId || 'woman';
    if (key in this.manifestByVoice) {
      return {
        manifest: this.manifestByVoice[key],
        basePath: this.manifestByVoice[key]?.voices?.[key] ? '/audio/cues' : `/audio/cues/${key}`,
      };
    }
    if (!this.manifestPromiseByVoice[key]) {
      this.manifestPromiseByVoice[key] = fetch(`/audio/cues/${key}/manifest.json`)
        .then((res) => (res.ok ? (res.json() as Promise<AudioCueManifest>) : null))
        .then(async (voiceManifest) => {
          if (voiceManifest) {
            this.manifestByVoice[key] = voiceManifest;
            return voiceManifest;
          }
          const rootRes = await fetch('/audio/cues/manifest.json').catch(() => null);
          const rootManifest = rootRes && rootRes.ok ? ((await rootRes.json()) as AudioCueManifest) : null;
          this.manifestByVoice[key] = rootManifest;
          return rootManifest;
        })
        .catch(() => null);
    }
    const manifest = (await this.manifestPromiseByVoice[key]) ?? null;
    const basePath = manifest?.voices?.[key] || !manifest ? '/audio/cues' : `/audio/cues/${key}`;
    return { manifest, basePath };
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
  public playChime(kind: ChimeKind, volume = 0.7): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const clampedVol = Math.max(0, Math.min(1, volume));
      const peakGain = Math.max(0.001, clampedVol * 0.2);
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
        gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.02);
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
  public async speakCue(
    cueId: string,
    fallbackText: string | string[],
    onEnded?: () => void,
    volume = 0.9,
    voiceId = 'woman'
  ): Promise<void> {
    const clampedVol = Math.max(0, Math.min(1, volume));
    try {
      const { manifest, basePath } = await this.loadManifest(voiceId);
      const voiceSection = manifest?.voices?.[voiceId];
      const variantList = voiceSection?.variants?.[cueId] ?? manifest?.variants?.[cueId];
      const cueEntry = voiceSection?.cues?.[cueId] ?? manifest?.cues?.[cueId];
      const entry = variantList && variantList.length > 0 ? variantList : cueEntry;
      const file = entry ? this.pickVariant(`clip:${voiceId}:${cueId}`, entry) : undefined;
      if (file && typeof Audio !== 'undefined') {
        const audio = new Audio(`${basePath}/${file}`);
        audio.volume = clampedVol;
        if (onEnded) {
          audio.addEventListener('ended', onEnded, { once: true });
        }
        await audio.play();
        return;
      }
    } catch {
      // Fall through to speechSynthesis
    }
    const chosenText = this.pickVariant(`text:${cueId}`, fallbackText);
    this.speak(chosenText, onEnded, clampedVol);
  }

  /**
   * Speak a short guidance cue using Web Speech API when voice cues are enabled.
   */
  public speak(text: string, onEnded?: () => void, volume = 0.85): void {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) {
        onEnded?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = Math.max(0, Math.min(1, volume));
      if (onEnded) {
        utterance.onend = () => onEnded();
        utterance.onerror = () => onEnded();
      }
      window.speechSynthesis.speak(utterance);
    } catch {
      onEnded?.();
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
