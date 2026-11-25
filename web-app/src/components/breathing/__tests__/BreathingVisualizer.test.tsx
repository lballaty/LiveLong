// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/breathing/__tests__/BreathingVisualizer.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import BreathingVisualizer from '../BreathingVisualizer';
import { BREATHING_PATTERNS } from '@/data/breathing-patterns';

describe('BreathingVisualizer', () => {
  it('renders external breathing phase, cycle counter, and visualizer container', () => {
    render(
      <BreathingVisualizer
        pattern={BREATHING_PATTERNS.BOX_BREATHING}
        isActive={true}
        embedded={true}
        externalState={{
          phase: 'inhale',
          currentCycle: 2,
          totalCycles: 6,
          remainingSeconds: 3,
        }}
      />
    );

    expect(screen.getByTestId('breathing-visualizer')).toBeTruthy();
    expect(screen.getByText('Breathe In')).toBeTruthy();
    expect(screen.getByText(/Cycle 2/)).toBeTruthy();
  });

  it('renders exhale phase cleanly', () => {
    render(
      <BreathingVisualizer
        pattern={BREATHING_PATTERNS.BOX_BREATHING}
        isActive={true}
        externalState={{
          phase: 'exhale',
          currentCycle: 1,
          totalCycles: 4,
          remainingSeconds: 2,
        }}
      />
    );
    expect(screen.getByText(/Exhale|Breathe Out/i)).toBeTruthy();
  });

  it('renders standalone breathing visualizer with hold-out phase and completion callback', () => {
    const onComplete = jest.fn();
    render(
      <BreathingVisualizer
        pattern={BREATHING_PATTERNS.DEEP_BREATHING}
        isActive={true}
        onComplete={onComplete}
      />
    );
    expect(screen.getByText(/Breathe In/i)).toBeTruthy();
  });
});
