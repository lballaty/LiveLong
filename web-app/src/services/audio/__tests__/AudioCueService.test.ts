// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/services/audio/__tests__/AudioCueService.test.ts
// Description: Unit tests for AudioCueService covering unlock, playChime, speak, stopSpeech, and speakCue with fallback
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

type AudioCueServiceModule = typeof import('../AudioCueService');

interface MockOscillator {
  type: OscillatorType;
  frequency: { setValueAtTime: jest.Mock };
  connect: jest.Mock;
  start: jest.Mock;
  stop: jest.Mock;
}

interface MockGain {
  gain: {
    setValueAtTime: jest.Mock;
    exponentialRampToValueAtTime: jest.Mock;
  };
  connect: jest.Mock;
}

function createMockAudioContext(state: AudioContextState = 'running') {
  const oscillators: MockOscillator[] = [];
  const gains: MockGain[] = [];

  const ctx = {
    state,
    currentTime: 10,
    destination: { id: 'dest' },
    resume: jest.fn().mockResolvedValue(undefined),
    createOscillator: jest.fn(() => {
      const osc: MockOscillator = {
        type: 'sine',
        frequency: { setValueAtTime: jest.fn() },
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
      oscillators.push(osc);
      return osc;
    }),
    createGain: jest.fn(() => {
      const gain: MockGain = {
        gain: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
      };
      gains.push(gain);
      return gain;
    }),
  };

  const MockAudioCtx = jest.fn(() => ctx);
  return { ctx, MockAudioCtx, oscillators, gains };
}

function loadFreshService(): AudioCueServiceModule['audioCueService'] {
  let service!: AudioCueServiceModule['audioCueService'];
  jest.isolateModules(() => {
    service = (require('../AudioCueService') as AudioCueServiceModule).audioCueService;
  });
  return service;
}

describe('AudioCueService', () => {
  const originalAudioContext = window.AudioContext;
  const originalWebkitAudioContext = (window as unknown as { webkitAudioContext?: unknown })
    .webkitAudioContext;
  const originalSpeechSynthesis = window.speechSynthesis;
  const originalSpeechUtterance = global.SpeechSynthesisUtterance;
  const originalFetch = global.fetch;
  const originalAudio = global.Audio;

  beforeEach(() => {
    jest.clearAllMocks();
    (window as unknown as { AudioContext?: unknown }).AudioContext = undefined;
    (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = undefined;
    (window as unknown as { speechSynthesis?: unknown }).speechSynthesis = {
      cancel: jest.fn(),
      speak: jest.fn(),
    };
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text: string) => ({
      text,
      rate: 1,
      pitch: 1,
      volume: 1,
    })) as unknown as typeof SpeechSynthesisUtterance;
  });

  afterEach(() => {
    (window as unknown as { AudioContext?: unknown }).AudioContext = originalAudioContext;
    (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext =
      originalWebkitAudioContext;
    (window as unknown as { speechSynthesis?: unknown }).speechSynthesis = originalSpeechSynthesis;
    global.SpeechSynthesisUtterance = originalSpeechUtterance;
    global.fetch = originalFetch;
    global.Audio = originalAudio;
  });

  describe('unlock', () => {
    it('creates AudioContext and resumes when suspended', () => {
      const { ctx, MockAudioCtx } = createMockAudioContext('suspended');
      (window as unknown as { AudioContext?: unknown }).AudioContext = MockAudioCtx;

      const service = loadFreshService();
      service.unlock();

      expect(MockAudioCtx).toHaveBeenCalledTimes(1);
      expect(ctx.resume).toHaveBeenCalledTimes(1);
    });

    it('falls back to webkitAudioContext and ignores errors', () => {
      const { ctx, MockAudioCtx } = createMockAudioContext('suspended');
      ctx.resume.mockRejectedValueOnce(new Error('blocked'));
      (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = MockAudioCtx;

      const service = loadFreshService();
      expect(() => service.unlock()).not.toThrow();
      expect(MockAudioCtx).toHaveBeenCalledTimes(1);
      expect(ctx.resume).toHaveBeenCalledTimes(1);
    });

    it('swallows constructor errors when AudioContext throws', () => {
      (window as unknown as { AudioContext?: unknown }).AudioContext = jest.fn(() => {
        throw new Error('unsupported');
      });

      const service = loadFreshService();
      expect(() => service.unlock()).not.toThrow();
    });
  });

  describe('playChime', () => {
    it('synthesizes single-note chimes for start, phase, and rest', () => {
      const { ctx, MockAudioCtx, oscillators, gains } = createMockAudioContext('suspended');
      (window as unknown as { AudioContext?: unknown }).AudioContext = MockAudioCtx;

      const service = loadFreshService();
      service.playChime('start');
      service.playChime('phase');
      service.playChime('rest');

      expect(ctx.resume).toHaveBeenCalled();
      expect(oscillators).toHaveLength(3);
      expect(gains).toHaveLength(3);
      expect(oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(528, 10);
      expect(oscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(587.33, 10);
      expect(oscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(440, 10);
      expect(oscillators[0].connect).toHaveBeenCalledWith(gains[0]);
      expect(gains[0].connect).toHaveBeenCalledWith(ctx.destination);
      expect(oscillators[0].start).toHaveBeenCalledWith(10);
      expect(oscillators[0].stop.mock.calls[0][0]).toBeCloseTo(10.3, 5);
    });

    it('synthesizes 3-note arpeggio for complete chime', () => {
      const { MockAudioCtx, oscillators } = createMockAudioContext('running');
      (window as unknown as { AudioContext?: unknown }).AudioContext = MockAudioCtx;

      const service = loadFreshService();
      service.playChime('complete');

      expect(oscillators).toHaveLength(3);
      expect(oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(528, 10);
      expect(oscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(659.25, 10.14);
      expect(oscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(783.99, 10.28);
    });

    it('no-ops safely when AudioContext is unavailable', () => {
      const service = loadFreshService();
      expect(() => service.playChime('start')).not.toThrow();
    });
  });

  describe('speak and stopSpeech', () => {
    it('cancels prior speech and speaks configured utterance', () => {
      const service = loadFreshService();
      service.speak('Breathe in');

      expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('Breathe in');
      expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Breathe in',
          rate: 0.95,
          pitch: 1.0,
          volume: 0.85,
        })
      );

      service.stopSpeech();
      expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(2);
    });

    it('ignores blank text and missing speechSynthesis', () => {
      const service = loadFreshService();
      service.speak('   ');
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();

      delete (window as unknown as { speechSynthesis?: unknown }).speechSynthesis;
      expect(() => service.speak('Hello')).not.toThrow();
      expect(() => service.stopSpeech()).not.toThrow();
    });
  });

  describe('speakCue', () => {
    it('plays pre-rendered audio clip from manifest and caches manifest across calls', async () => {
      const playMock = jest.fn().mockResolvedValue(undefined);
      global.Audio = jest.fn().mockImplementation((src: string) => ({
        src,
        play: playMock,
      })) as unknown as typeof Audio;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: '1.0',
          format: 'mp3',
          cues: {
            inhale: 'inhale.mp3',
            exhale: 'exhale.mp3',
          },
        }),
      }) as unknown as typeof fetch;

      const service = loadFreshService();
      await service.speakCue('inhale', 'Breathe in');
      await service.speakCue('exhale', 'Breathe out');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/audio/cues/manifest.json');
      expect(global.Audio).toHaveBeenNthCalledWith(1, '/audio/cues/inhale.mp3');
      expect(global.Audio).toHaveBeenNthCalledWith(2, '/audio/cues/exhale.mp3');
      expect(playMock).toHaveBeenCalledTimes(2);
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('falls back to speechSynthesis when cueId is missing from manifest', async () => {
      global.Audio = jest.fn() as unknown as typeof Audio;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: '1.0',
          format: 'mp3',
          cues: { inhale: 'inhale.mp3' },
        }),
      }) as unknown as typeof fetch;

      const service = loadFreshService();
      await service.speakCue('unknown-cue', 'Fallback text');

      expect(global.Audio).not.toHaveBeenCalled();
      expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Fallback text' })
      );
    });

    it('falls back to speechSynthesis when audio.play() rejects', async () => {
      global.Audio = jest.fn().mockImplementation(() => ({
        play: jest.fn().mockRejectedValue(new Error('autoplay blocked')),
      })) as unknown as typeof Audio;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: '1.0',
          format: 'mp3',
          cues: { inhale: 'inhale.mp3' },
        }),
      }) as unknown as typeof fetch;

      const service = loadFreshService();
      await service.speakCue('inhale', 'Breathe in');

      expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Breathe in' })
      );
    });

    it('falls back to speechSynthesis when manifest fetch fails or returns non-ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
      const service1 = loadFreshService();
      await service1.speakCue('inhale', 'Fallback non-ok');
      expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Fallback non-ok' })
      );

      global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;
      const service2 = loadFreshService();
      await service2.speakCue('inhale', 'Fallback network');
      expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Fallback network' })
      );
    });
  });
});
