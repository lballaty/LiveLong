// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/exercises/__tests__/ExerciseAnimationPlayer.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ExerciseAnimationPlayer from '../ExerciseAnimationPlayer';

const mockPlay = jest.fn();
const mockStaticPose = jest.fn();
const mockDestroy = jest.fn();
const mockMount = jest.fn();

jest.mock('@/lib/animations/exercise-figures-runtime', () => ({
  createExercisePlayer: jest.fn(() => ({
    mount: mockMount,
    play: mockPlay,
    staticPose: mockStaticPose,
    destroy: mockDestroy,
  })),
}));

describe('ExerciseAnimationPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({ ok: false });
  });

  it('falls back to built-in robot SVG when external pack is unavailable', async () => {
    render(
      <ExerciseAnimationPlayer
        stepId="arm-swings"
        stepName="Arm Swings"
        characterId="robot-r1"
        variant="standing"
        views="both"
        isPlaying={false}
        phase="exercise"
      />
    );

    const el = screen.getByTestId('exercise-animation-player');
    expect(el.getAttribute('data-animation-source')).toBe('robot-poc');
    expect(screen.getByLabelText('Arm Swings (front view, standing)')).toBeTruthy();
    expect(screen.getByLabelText('Arm Swings (side view, standing)')).toBeTruthy();
  });

  it('mounts external exercise-figures-runtime player when JSON packs load', async () => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ kind: 'mock-pack' }),
    });

    render(
      <ExerciseAnimationPlayer
        stepId="side-bends"
        stepName="Side Bends"
        animation={{ pack: 'rajio-taiso.side-bends', version: '0.1.0-draft.1' }}
        characterId="robot-r1"
        variant="standing"
        views="front"
        isPlaying={true}
        phase="exercise"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('exercise-animation-player').getAttribute('data-animation-source')).toBe('external');
    });
    expect(mockMount).toHaveBeenCalled();
    expect(mockPlay).toHaveBeenCalled();
  });
});
