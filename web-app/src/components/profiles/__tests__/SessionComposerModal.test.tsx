// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/SessionComposerModal.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionComposerModal from '../SessionComposerModal';
import { createSimpleProfile } from '@/types/unified-profile.types';

describe('SessionComposerModal', () => {
  const p1 = createSimpleProfile('Warmup', 'Desc 1', 5, 0, '#111', '🤸');
  const p2 = createSimpleProfile('Breath', 'Desc 2', 4, 0, '#222', '🫁');

  it('adds routines to a SessionPlan, reorders them, and saves', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <SessionComposerModal
        availableProfiles={[p1, p2]}
        onClose={onClose}
        onSave={onSave}
      />
    );

    fireEvent.change(screen.getByLabelText('Add routine to session'), {
      target: { value: p2.id },
    });
    expect(screen.getByText(/2 items/)).toBeTruthy();

    fireEvent.click(screen.getAllByLabelText('Move routine down')[0]);
    fireEvent.click(screen.getAllByLabelText('Move routine up')[1]);
    fireEvent.click(screen.getAllByLabelText('Remove routine from session')[1]);
    expect(screen.getByText(/1 items/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Add routine to session'), {
      target: { value: p2.id },
    });

    fireEvent.click(screen.getByTestId('save-session-plan-button'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Morning Longevity Session',
        items: expect.arrayContaining([
          expect.objectContaining({ profileId: p1.id }),
          expect.objectContaining({ profileId: p2.id }),
        ]),
      })
    );
    expect(onClose).toHaveBeenCalled();
  });
});
