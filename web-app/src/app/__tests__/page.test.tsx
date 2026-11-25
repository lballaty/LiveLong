// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/app/__tests__/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

jest.mock('@/components/timer/UnifiedTimerDisplay', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-unified-display">LiveLong</div>,
}));

describe('Home Page', () => {
  it('renders UnifiedTimerDisplay as the active entrypoint', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-unified-display')).toBeTruthy();
  });
});
