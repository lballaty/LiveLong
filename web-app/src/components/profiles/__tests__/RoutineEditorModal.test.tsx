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

  it('switches to Simple Timer tab, reorders/deletes series steps, and saves', () => {
    const onSave = jest.fn();
    render(
      <RoutineEditorModal
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '+ Add Step' }));
    fireEvent.click(screen.getAllByLabelText('Move step down')[0]);
    fireEvent.click(screen.getAllByLabelText('Remove step')[1]);
    expect(screen.getByText('Steps (1)')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Simple Timer' }));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Quick Focus Custom' } });
    fireEvent.click(screen.getByTestId('save-routine-button'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Quick Focus Custom',
        type: 'simple',
      })
    );
  });

  it('edits an existing series routine and updates step script and music', () => {
    const onSave = jest.fn();
    render(
      <RoutineEditorModal
        profile={{
          id: 'custom-series-1',
          name: 'Existing Series',
          description: 'Desc',
          type: 'series',
          color: '#3b82f6',
          icon: '🤸',
          musicTrackId: 'zen-garden',
          soundEnabled: true,
          vibrationEnabled: true,
          seriesConfig: {
            warmupMinutes: 0,
            warmupSeconds: 30,
            cooldownMinutes: 0,
            cooldownSeconds: 30,
            steps: [
              {
                id: 's1',
                name: 'Stretch',
                description: '',
                durationMinutes: 1,
                durationSeconds: 0,
                restMinutes: 0,
                restSeconds: 15,
              },
            ],
          },
          totalDurationSeconds: 135,
          isDefault: false,
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Guided script / voice cue text'), {
      target: { value: 'Reach high' },
    });
    fireEvent.change(screen.getByPlaceholderText('Animation pack'), {
      target: { value: 'rajio-taiso.side-bends' },
    });
    fireEvent.click(screen.getByTestId('save-routine-button'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'custom-series-1', type: 'series' })
    );
  });
});
