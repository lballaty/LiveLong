// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/RoutineEditorModal.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoutineEditorModal from '../RoutineEditorModal';
import { BUILTIN_MUSIC_TRACKS } from '@/services/audio/BackgroundMusicService';

describe('RoutineEditorModal', () => {
  it('creates a custom Exercise Series routine with added steps and scripts', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <RoutineEditorModal
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const nameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(nameInput, { target: { value: 'Morning Mobility' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Add Step' }));
    expect(screen.getByText('Steps (2)')).toBeTruthy();

    fireEvent.click(screen.getByTestId('save-routine-button'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Morning Mobility',
        type: 'series',
        isCustom: true,
      })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('switches to Breathing Routine tab and saves breathing pattern', () => {
    const onSave = jest.fn();
    render(
      <RoutineEditorModal
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Breathing Routine' }));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Evening Calm' } });
    fireEvent.click(screen.getByTestId('save-routine-button'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Evening Calm',
        type: 'breathing',
      })
    );
  });
});
